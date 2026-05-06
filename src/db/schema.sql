CREATE TABLE IF NOT EXISTS phrases (
  id INTEGER PRIMARY KEY,
  text TEXT NOT NULL
);

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
);