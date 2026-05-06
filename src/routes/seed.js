import express from "express";
import dayjs from "dayjs";
import fs from "fs";
import db from "../db/db.js";
import path from "path";
import { fileURLToPath } from "node:url";

const router = express.Router();

const relativePath = "../db/phrases.json";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fullPath = path.join(__dirname, relativePath);

router.post("/", (req, res) => {
  const phrases = JSON.parse(fs.readFileSync(fullPath, "utf8"));

  db.serialize(() => {
    db.run("DELETE FROM repetitions");
    db.run("DELETE FROM phrases");

    const insertPhrase = db.prepare(
      "INSERT INTO phrases (id, text) VALUES (?, ?)"
    );
    const insertRepetition = db.prepare(
      "INSERT INTO repetitions (phrase_id, next_review) VALUES (?, ?)"
    );

    for (const [id, text] of Object.entries(phrases)) {
      insertPhrase.run([id, text]);
      insertRepetition.run([id, dayjs().format("YYYY-MM-DD")]);
    }

    insertPhrase.finalize();
    insertRepetition.finalize();

    res.json({ message: "Database seeded" });
  });
});

export default router;
