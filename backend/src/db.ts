import Database from "better-sqlite3";
import dotenv from "dotenv";

dotenv.config();

const dbPath = process.env.DB_PATH || "./data/universite_demo.sqlite";
export const db = new Database(dbPath, { fileMustExist: true });
