import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { Pool } from 'pg';
import process from 'node:process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    })
  : null;

const DATASET_KEYS = /** @type {const} */ ({
  brothers: 'brotherdata.csv',
  familyTree: 'FamilyTreeData.csv',
  rush: 'rushData.csv',
  timeline: 'timelinedata.csv',
});

async function ensureDb() {
  if (!pool) return;
  await pool.query(`
    create table if not exists datasets (
      key text primary key,
      csv_text text not null,
      updated_at timestamptz not null default now()
    );
  `);
}

function requireAdminToken(req, res, next) {
  const token = process.env.ADMIN_TOKEN;
  if (!token) return res.status(500).json({ error: 'ADMIN_TOKEN not configured' });

  const header = req.get('authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return res.status(401).json({ error: 'Missing Authorization: Bearer token' });
  if (match[1] !== token) return res.status(403).json({ error: 'Invalid token' });
  return next();
}

async function readFallbackCsv(key) {
  const filename = DATASET_KEYS[key];
  if (!filename) return null;

  // Prefer dist (production build), then public (dev).
  const distPath = path.join(__dirname, 'dist', 'data', filename);
  const publicPath = path.join(__dirname, 'public', 'data', filename);

  try {
    return await fs.readFile(distPath, 'utf8');
  } catch {
    try {
      return await fs.readFile(publicPath, 'utf8');
    } catch {
      return null;
    }
  }
}

app.get('/api/datasets/:key', async (req, res) => {
  const key = req.params.key;
  if (!Object.prototype.hasOwnProperty.call(DATASET_KEYS, key)) {
    return res.status(404).json({ error: 'Unknown dataset key' });
  }

  try {
    if (pool) {
      const result = await pool.query('select key, csv_text as "csvText", updated_at as "updatedAt" from datasets where key = $1', [key]);
      if (result.rows[0]) return res.json(result.rows[0]);
    }

    const csvText = await readFallbackCsv(key);
    if (csvText == null) return res.status(404).json({ error: 'Dataset not found' });
    return res.json({ key, csvText, updatedAt: null });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to load dataset' });
  }
});

app.post('/api/datasets/:key', requireAdminToken, async (req, res) => {
  const key = req.params.key;
  if (!Object.prototype.hasOwnProperty.call(DATASET_KEYS, key)) {
    return res.status(404).json({ error: 'Unknown dataset key' });
  }
  if (!pool) return res.status(500).json({ error: 'DATABASE_URL not configured' });

  const csvText = req.body?.csvText;
  if (typeof csvText !== 'string' || csvText.trim().length === 0) {
    return res.status(400).json({ error: 'Body must include non-empty csvText string' });
  }

  try {
    const result = await pool.query(
      `
        insert into datasets (key, csv_text, updated_at)
        values ($1, $2, now())
        on conflict (key) do update set csv_text = excluded.csv_text, updated_at = now()
        returning key, csv_text as "csvText", updated_at as "updatedAt"
      `,
      [key, csvText],
    );
    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to save dataset' });
  }
});

// Serve static files from dist.
app.use('/', express.static(path.join(__dirname, 'dist')));

// 2️⃣ Catch-all route for SPA routing
app.get('*', (req, res) => {
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    } else {
        res.status(404).end();
    }
});

ensureDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database', err);
    process.exit(1);
  });