import sqlite3 from "sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "node:url";

const relativePath = "./spaced.db";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, relativePath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Failed to connect to the database:", err.message);
  } else {
    console.log("✅ Connected to the database at", dbPath);
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS phrases (
      id INTEGER PRIMARY KEY,
      text TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS repetitions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phrase_id INTEGER NOT NULL,
      correct_count INTEGER DEFAULT 0,
      incorrect_count INTEGER DEFAULT 0,
      interval INTEGER DEFAULT 1,
      easiness_factor REAL DEFAULT 2.5,
      repetitions INTEGER DEFAULT 0,
      last_result TEXT,
      last_reviewed_at DATETIME,
      next_review DATE,
      FOREIGN KEY (phrase_id) REFERENCES phrases(id)
    )
  `);
});

export default db;
