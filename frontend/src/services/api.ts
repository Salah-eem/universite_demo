const API_BASE = import.meta.env.VITE_API_BASE as string;

export type BulletinDetail = {
  mnemonique: string;
  intitule: string | null;
  credit: number | null;
  titulaire: string | null;
  note: number | null;
};

export type Bulletin = {
  matricule: string;
  nom: string;
  prenom: string;
  annee: string | number;
  ects_total_inscrits: number;
  ects_obtenus: number;
  moyenne_ponderee: number | null;
  reussite: boolean;
  details: BulletinDetail[];
};

export type Anomaly = {
  type: "NOTE_SANS_INSCRIPTION" | "COURS_INCONNU" | "INSCRIPTION_SANS_COURS" | "DUPLICATA_NOTE" | "NOTE_SANS_CREDIT";
  matricule: string;
  annee: string | number | null;
  detail: Record<string, unknown>;
};

async function toJson<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export const api = {
  async getBulletins(): Promise<Bulletin[]> {
    const res = await fetch(`${API_BASE}/bulletins`);
    return toJson<Bulletin[]>(res);
  },
  async getBulletin(matricule: string, annee: string | number): Promise<Bulletin> {
    const res = await fetch(`${API_BASE}/bulletins/${matricule}/${annee}`);
    return toJson<Bulletin>(res);
  },
  async getAnomalies(): Promise<Anomaly[]> {
    const res = await fetch(`${API_BASE}/anomalies`);
    return toJson<Anomaly[]>(res);
  },
  csvBulletinsUrl: `${API_BASE}/bulletins.csv`,
};
