import { DATASET_KEYS, isKnownKey } from '../../_shared/datasets.js';
import { requireAdminToken } from '../../_shared/auth.js';

function json(data, status = 200) {
  return Response.json(data, { status });
}

async function readFallbackCsv(key, request) {
  const filename = DATASET_KEYS[key];
  const csvUrl = new URL(`/data/${filename}`, request.url);
  const csvRes = await fetch(csvUrl);
  if (!csvRes.ok) return null;
  return csvRes.text();
}

export async function onRequestGet(context) {
  const { env, params, request } = context;
  const key = params.key;

  if (!isKnownKey(key)) {
    return json({ error: 'Unknown dataset key' }, 404);
  }

  try {
    if (env.DB) {
      const row = await env.DB.prepare(
        'SELECT key, csv_text AS csvText, updated_at AS updatedAt FROM datasets WHERE key = ?',
      )
        .bind(key)
        .first();
      if (row) return json(row);
    }

    const csvText = await readFallbackCsv(key, request);
    if (csvText == null) return json({ error: 'Dataset not found' }, 404);
    return json({ key, csvText, updatedAt: null });
  } catch (err) {
    console.error(err);
    return json({ error: 'Failed to load dataset' }, 500);
  }
}

export async function onRequestPost(context) {
  const { env, params, request } = context;
  const key = params.key;

  if (!isKnownKey(key)) {
    return json({ error: 'Unknown dataset key' }, 404);
  }

  const auth = requireAdminToken(request, env);
  if (auth.error) return auth.error;

  if (!env.DB) {
    return json({ error: 'DB not configured' }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const csvText = body?.csvText;
  if (typeof csvText !== 'string' || csvText.trim().length === 0) {
    return json({ error: 'Body must include non-empty csvText string' }, 400);
  }

  try {
    const row = await env.DB.prepare(
      `
        INSERT INTO datasets (key, csv_text, updated_at)
        VALUES (?, ?, datetime('now'))
        ON CONFLICT(key) DO UPDATE SET
          csv_text = excluded.csv_text,
          updated_at = datetime('now')
        RETURNING key, csv_text AS csvText, updated_at AS updatedAt
      `,
    )
      .bind(key, csvText)
      .first();

    return json(row);
  } catch (err) {
    console.error(err);
    return json({ error: 'Failed to save dataset' }, 500);
  }
}
