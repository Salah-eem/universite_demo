// src/services/bulletinService.ts
import { db } from "../db";
import { parseCoursJson, safeNumber } from "../utils/normalize";

export interface CourseMeta {
  mnemonique: string;
  intitule: string | null;
  credit: number | null;
  titulaire: string | null;
}

export interface BulletinDetail extends CourseMeta {
  note: number | null; // entier sur 20 ou null si pas de note
}

export interface Bulletin {
  matricule: string;
  nom: string;
  prenom: string;
  annee: string | number;
  ects_total_inscrits: number;
  ects_obtenus: number;
  moyenne_ponderee: number | null;
  reussite: boolean;
  details: BulletinDetail[];
}

type NoteRow = { id: number; matricule: string; mnemonique: string; note: number };
type InscRow = {
  matricule: string;
  nom: string;
  prenom: string;
  annee: string | number;
  cours_json: string | null;
};
type CoursRow = { mnemonique: string; intitule: string; credit: number; titulaire: string };

const q = {
  inscriptions: db.prepare<[], InscRow>(`
    SELECT matricule, nom, prenom, annee_etude AS annee, cours_json
    FROM liste_inscriptions
  `),
  coursAll: db.prepare<[], CoursRow>(`
    SELECT mnemonique, intitule, credit, titulaire
    FROM liste_cours
  `),
  notesByMat: db.prepare<[string], NoteRow>(`
    SELECT id, matricule, mnemonique, note
    FROM liste_notes
    WHERE matricule = ?
    ORDER BY id ASC
  `),
};

function buildCourseIndex(): Map<string, CoursRow> {
  const all = q.coursAll.all();
  const map = new Map<string, CoursRow>();
  for (const c of all) map.set(String(c.mnemonique), c);
  return map;
}

function groupNotesByCourse(notes: NoteRow[]): Map<string, NoteRow[]> {
  const map = new Map<string, NoteRow[]>();
  for (const n of notes) {
    const key = String(n.mnemonique);
    const arr = map.get(key) ?? [];
    arr.push(n);
    map.set(key, arr);
  }
  return map;
}

export function computeBulletins(): Bulletin[] {
  const courseIndex = buildCourseIndex();
  const inscriptions = q.inscriptions.all();

  const bulletins: Bulletin[] = [];

  for (const insc of inscriptions) {
    const { matricule, nom, prenom, annee, cours_json } = insc;
    const mnemos = parseCoursJson(cours_json); // liste des mnémos inscrits
    const notes = q.notesByMat.all(String(matricule));
    const notesByCourse = groupNotesByCourse(notes);

    // Détails des cours triés par mnémonique
    const details: BulletinDetail[] = [...mnemos]
      .sort((a, b) => a.localeCompare(b))
      .map((mnemo) => {
        const meta = courseIndex.get(mnemo);
        const credit = safeNumber(meta?.credit);

        // Si plusieurs notes → on prend la dernière chronologiquement (id le plus grand)
        const dup = notesByCourse.get(mnemo);
        const note = dup && dup.length > 0 ? safeNumber(dup[dup.length - 1].note) : null;

        return {
          mnemonique: mnemo,
          intitule: meta?.intitule ?? null,
          credit: credit,
          titulaire: meta?.titulaire ?? null,
          note,
        };
      });

    // Calculs
    const ects_total_inscrits = details.reduce((sum, d) => sum + (d.credit ?? 0), 0);

    const noted = details.filter((d) => d.note !== null && Number.isFinite(d.note as number));
    const ects_obtenus = noted
      .filter((d) => (d.note as number) >= 10 && (d.credit ?? 0) > 0)
      .reduce((sum, d) => sum + (d.credit ?? 0), 0);

    const totalCreditsNoted = noted.reduce((sum, d) => sum + (d.credit ?? 0), 0);
    const sumWeighted = noted.reduce(
      (sum, d) => sum + ((d.note as number) * (d.credit ?? 0)),
      0
    );
    const moyenne_ponderee =
      totalCreditsNoted > 0 ? Number((sumWeighted / totalCreditsNoted).toFixed(2)) : null;

    const allCoursesHaveNote = details.length > 0 && details.every((d) => d.note !== null);
    const reussite =
      ects_obtenus >= 60 ||
      (allCoursesHaveNote && moyenne_ponderee !== null && moyenne_ponderee >= 10);

    bulletins.push({
      matricule: String(matricule),
      nom,
      prenom,
      annee,
      ects_total_inscrits,
      ects_obtenus,
      moyenne_ponderee,
      reussite,
      details,
    });
  }

  return bulletins;
}

export function computeSingleBulletin(matricule: string, annee: string | number): Bulletin | null {
  const all = computeBulletins();
  return (
    all.find(
      (b) => String(b.matricule) === String(matricule) && String(b.annee) === String(annee)
    ) ?? null
  );
}
