CREATE TABLE IF NOT EXISTS datasets (
  key TEXT PRIMARY KEY,
  csv_text TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
