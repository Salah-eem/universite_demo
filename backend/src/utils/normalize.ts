// src/utils/normalize.ts
export function parseCoursJson(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map((x) => String(x));
    return [];
  } catch {
    // JSON invalide → considéré comme aucun cours (les anomalies remonteront ailleurs)
    return [];
  }
}

export function safeNumber(n: unknown): number | null {
  const x = Number(n);
  return Number.isFinite(x) ? x : null;
}
