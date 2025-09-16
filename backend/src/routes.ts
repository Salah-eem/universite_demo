// src/routes.ts
import { Router, Request, Response } from "express";
import { computeBulletins, computeSingleBulletin } from "./services/bulletinService";
import { computeAnomalies } from "./services/anomalyService";
import { stringify } from "csv-stringify";

const router = Router();

/**
 * @route GET /api/health
 * Simple endpoint de santé
 */
router.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", ts: new Date().toISOString() });
});

/**
 * @route GET /api/bulletins
 * Retourne tous les bulletins en JSON
 */
router.get("/bulletins", (_req: Request, res: Response) => {
  const data = computeBulletins();
  res.json(data);
});

/**
 * @route GET /api/bulletins/:matricule/:annee
 * Retourne un bulletin précis
 */
router.get("/bulletins/:matricule/:annee", (req: Request, res: Response) => {
  const { matricule, annee } = req.params;
  const bulletin = computeSingleBulletin(matricule, annee);
  if (!bulletin) return res.status(404).json({ error: "Bulletin introuvable" });
  res.json(bulletin);
});

/**
 * @route GET /api/bulletins.csv
 * Retourne les bulletins en CSV (optionnel mais pratique)
 */
router.get("/bulletins.csv", (_req: Request, res: Response) => {
  const data = computeBulletins();

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=bulletins.csv");

  const columns = [
    "matricule",
    "nom",
    "prenom",
    "annee",
    "ects_total_inscrits",
    "ects_obtenus",
    "moyenne_ponderee",
    "reussite",
  ];

  const stringifier = stringify({ header: true, columns });

  for (const b of data) {
    stringifier.write({
      matricule: b.matricule,
      nom: b.nom,
      prenom: b.prenom,
      annee: b.annee,
      ects_total_inscrits: b.ects_total_inscrits,
      ects_obtenus: b.ects_obtenus,
      moyenne_ponderee: b.moyenne_ponderee ?? "",
      reussite: b.reussite,
    });
  }

  stringifier.end();
  stringifier.pipe(res);
});

/**
 * @route GET /api/anomalies
 * Retourne la liste des anomalies
 */
router.get("/anomalies", (_req: Request, res: Response) => {
  const anomalies = computeAnomalies();
  res.json(anomalies);
});

export default router;
