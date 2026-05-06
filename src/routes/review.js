import express from "express";
import dayjs from "dayjs";
import db from "../db/db.js";

const router = express.Router();

router.get("/", (req, res) => {
  const today = dayjs().format("YYYY-MM-DD");

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const search = req.query.search?.trim() || "";
  const searchFilter = `%${search}%`;

  const baseWhere = `
    WHERE r.next_review <= ?
    ${search ? "AND p.text LIKE ?" : ""}
  `;

  const dataQuery = `
    SELECT p.id as phrase_id, p.text, r.next_review
    FROM phrases p
    JOIN repetitions r ON p.id = r.phrase_id
    ${baseWhere}
    ORDER BY r.next_review ASC
    LIMIT ? OFFSET ?
  `;

  const countQuery = `
    SELECT COUNT(*) as total
    FROM phrases p
    JOIN repetitions r ON p.id = r.phrase_id
    ${baseWhere}
  `;

  const queryParams = search ? [today, searchFilter] : [today];

  db.get(countQuery, queryParams, (err, countRow) => {
    if (err) return res.status(500).json({ error: err.message });

    const total = countRow.total;
    const totalPages = Math.ceil(total / limit);

    db.all(dataQuery, [...queryParams, limit, offset], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({
        page,
        limit,
        total,
        totalPages,
        results: rows,
      });
    });
  });
});

router.post("/:id", (req, res) => {
  const { id } = req.params;
  const { quality } = req.body; // number between 0 y 5
  if (typeof quality !== "number" || quality < 0 || quality > 5) {
    return res
      .status(400)
      .json({ error: "Invalid quality score (0–5 expected)" });
  }
  const now = dayjs();

  if (typeof quality !== "number" || quality < 0 || quality > 5) {
    return res
      .status(400)
      .json({ error: "Invalid quality score (0–5 expected)" });
  }

  db.get("SELECT * FROM repetitions WHERE phrase_id = ?", [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row)
      return res.status(404).json({ error: "Phrase not found in repetitions" });

    let { easiness_factor, repetitions, interval } = row;

    if (quality < 3) {
      repetitions = 0;
      interval = 1;
    } else {
      repetitions += 1;
      if (repetitions === 1) {
        interval = 1;
      } else if (repetitions === 2) {
        interval = 6;
      } else {
        interval = Math.round(interval * easiness_factor);
      }

      easiness_factor =
        easiness_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

      if (easiness_factor < 1.3) {
        easiness_factor = 1.3;
      }
    }

    const next_review = now.add(interval, "day").format("YYYY-MM-DD");

    const updateQuery = `
      UPDATE repetitions
      SET
        correct_count = correct_count + CASE WHEN ? >= 3 THEN 1 ELSE 0 END,
        incorrect_count = incorrect_count + CASE WHEN ? < 3 THEN 1 ELSE 0 END,
        repetitions = ?,
        interval = ?,
        easiness_factor = ?,
        next_review = ?,
        last_result = ?,
        last_reviewed_at = ?
      WHERE phrase_id = ?
    `;

    db.run(
      updateQuery,
      [
        quality,
        quality,
        repetitions,
        interval,
        easiness_factor,
        next_review,
        quality >= 3 ? "correct" : "incorrect",
        now.format(),
        id,
      ],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({
          updated: true,
          interval,
          repetitions,
          easiness_factor: Number(easiness_factor.toFixed(2)),
          next_review,
        });
      }
    );
  });
});

export default router;
