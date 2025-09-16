// src/services/anomalyService.ts
import { db } from "../db";
import { parseCoursJson, safeNumber } from "../utils/normalize";

type InscRow = {
  matricule: string;
  nom: string;
  prenom: string;
  annee: string | number;
  cours_json: string | null;
};
type CoursRow = { mnemonique: string; intitule: string; credit: number; titulaire: string };
type NoteRow = { id: number; matricule: string; mnemonique: string; note: number };

export interface Anomaly {
  type:
    | "NOTE_SANS_INSCRIPTION"
    | "COURS_INCONNU"
    | "INSCRIPTION_SANS_COURS"
    | "DUPLICATA_NOTE"
    | "NOTE_SANS_CREDIT";
  matricule: string;
  annee: string | number | null;
  detail: Record<string, unknown>;
}

const q = {
  inscriptions: db.prepare<[], InscRow>(`
    SELECT matricule, nom, prenom, annee_etude AS annee, cours_json
    FROM liste_inscriptions
  `),
  coursAll: db.prepare<[], CoursRow>(`
    SELECT mnemonique, intitule, credit, titulaire
    FROM liste_cours
  `),
  notesAll: db.prepare<[], NoteRow>(`
    SELECT id, matricule, mnemonique, note
    FROM liste_notes
    ORDER BY id ASC
  `),
  notesByMat: db.prepare<[string], NoteRow>(`
    SELECT id, matricule, mnemonique, note
    FROM liste_notes
    WHERE matricule = ?
    ORDER BY id ASC
  `),
};

export function computeAnomalies(): Anomaly[] {
  const anomalies: Anomaly[] = [];

  // Index cours connus
  const coursIndex = new Map<string, CoursRow>();
  for (const c of q.coursAll.all()) coursIndex.set(String(c.mnemonique), c);

  const inscriptions = q.inscriptions.all();
  const allNotes = q.notesAll.all();

  // 1) DUPLICATA_NOTE : plusieurs notes pour le même (matricule, mnemo)
  {
    const keyCount = new Map<string, number>();
    for (const n of allNotes) {
      const key = `${n.matricule}::${n.mnemonique}`;
      keyCount.set(key, (keyCount.get(key) ?? 0) + 1);
    }
    for (const [key, count] of keyCount.entries()) {
      if (count > 1) {
        const [matricule, mnemo] = key.split("::");
        anomalies.push({
          type: "DUPLICATA_NOTE",
          matricule,
          annee: null, // l'info d'année n'est pas dans la table des notes
          detail: { mnemonique: mnemo, occurrences: count },
        });
      }
    }
  }

  // 2) INSCRIPTION_SANS_COURS + COURS_INCONNU + NOTE_SANS_CREDIT
  for (const insc of inscriptions) {
    const { matricule, annee, cours_json } = insc;
    const courseList = parseCoursJson(cours_json);

    if (courseList.length === 0) {
      anomalies.push({
        type: "INSCRIPTION_SANS_COURS",
        matricule: String(matricule),
        annee,
        detail: {},
      });
    }

    // COURS_INCONNU : mnemo inscrit mais absent de liste_cours
    for (const mnemo of courseList) {
      if (!coursIndex.has(mnemo)) {
        anomalies.push({
          type: "COURS_INCONNU",
          matricule: String(matricule),
          annee,
          detail: { mnemonique: mnemo },
        });
      }
    }

    // NOTE_SANS_CREDIT : cours noté mais crédit manquant ou <= 0
    const notes = q.notesByMat.all(String(matricule));
    for (const n of notes) {
      const course = coursIndex.get(String(n.mnemonique));
      if (course) {
        const credit = safeNumber(course.credit);
        if (!(Number.isFinite(credit as number) && (credit as number) > 0)) {
          anomalies.push({
            type: "NOTE_SANS_CREDIT",
            matricule: String(matricule),
            annee,
            detail: { mnemonique: String(n.mnemonique), credit },
          });
        }
      }
    }
  }

  // 3) NOTE_SANS_INSCRIPTION : note pour un cours non présent dans cours_json de l’année
  //    Hypothèse métier : "une inscription" = (matricule, année).
  for (const insc of inscriptions) {
    const { matricule, annee, cours_json } = insc;
    const setCours = new Set(parseCoursJson(cours_json));
    const notes = q.notesByMat.all(String(matricule));
    for (const n of notes) {
      const mnemo = String(n.mnemonique);
      if (!setCours.has(mnemo)) {
        anomalies.push({
          type: "NOTE_SANS_INSCRIPTION",
          matricule: String(matricule),
          annee,
          detail: { mnemonique: mnemo },
        });
      }
    }
  }

  return anomalies;
}
