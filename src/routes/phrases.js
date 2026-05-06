import express from "express";
import db from "../db/db.js";

const router = express.Router();

router.get("/:id", (req, res) => {
  const id = req.params.id;
  try {
    db.get("SELECT * FROM phrases WHERE id = ?", [id], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: "phrase not found" });
      res.json(row);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", (req, res) => {
  const { text } = req.body;

  if (typeof text !== "string" || !text.trim()) {
    return res
      .status(400)
      .json({ error: "Invalid input. 'text' must be a non-empty string." });
  }

  const trimmedText = text.trim();

  // Verify if the phrase already exists
  db.get(
    "SELECT id FROM phrases WHERE text = ?",
    [trimmedText],
    (err, existingRow) => {
      if (err)
        return res
          .status(500)
          .json({ error: "Error checking existing phrase: " + err.message });

      if (existingRow) {
        return res
          .status(409)
          .json({ error: "Phrase already exists", id: existingRow.id });
      }

      // Insert the new phrase and repetition
      db.get("SELECT MAX(id) as maxId FROM phrases", (err, row) => {
        if (err)
          return res
            .status(500)
            .json({ error: "Error getting max ID: " + err.message });

        const newId = (row?.maxId || 0) + 1;

        const insertPhrase = `INSERT INTO phrases (id, text) VALUES (?, ?)`;
        const insertRepetition = `
        INSERT INTO repetitions (
          phrase_id,
          correct_count,
          incorrect_count,
          interval,
          easiness_factor,
          repetitions,
          last_result,
          last_reviewed_at,
          next_review
        ) VALUES (?, 0, 0, 1, 2.5, 0, NULL, NULL, DATE('now'))
      `;

        db.serialize(() => {
          db.run(insertPhrase, [newId, trimmedText], function (err) {
            if (err)
              return res
                .status(500)
                .json({ error: "Error inserting phrase: " + err.message });

            db.run(insertRepetition, [newId], function (err) {
              if (err)
                return res.status(500).json({
                  error: "Error inserting repetition: " + err.message,
                });

              res.status(201).json({
                message: "Phrase added successfully",
                id: newId,
                text: trimmedText,
              });
            });
          });
        });
      });
    }
  );
});

export default router;
