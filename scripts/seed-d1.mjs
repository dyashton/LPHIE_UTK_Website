import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { DATASET_KEYS } from '../functions/_shared/datasets.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const dataDir = path.join(root, 'public', 'data');
const databaseName = 'lphie-data';

function sqlEscape(value) {
  return value.replace(/'/g, "''");
}

function runD1(file, remote) {
  const target = remote ? '--remote' : '--local';
  execSync(`npx wrangler d1 execute ${databaseName} ${target} --file=${file}`, {
    cwd: root,
    stdio: 'inherit',
  });
}

async function main() {
  const remote = process.argv.includes('--remote');
  const migrateOnly = process.argv.includes('--migrate-only');

  runD1('migrations/0001_init.sql', remote);
  if (migrateOnly) return;

  for (const [key, filename] of Object.entries(DATASET_KEYS)) {
    const csvText = await fs.readFile(path.join(dataDir, filename), 'utf8');
    const sql = `INSERT OR REPLACE INTO datasets (key, csv_text, updated_at) VALUES ('${key}', '${sqlEscape(csvText)}', datetime('now'));`;
    const tmpFile = path.join(root, 'migrations', `.seed-${key}.sql`);
    await fs.writeFile(tmpFile, sql);
    try {
      runD1(tmpFile, remote);
    } finally {
      await fs.unlink(tmpFile);
    }
  }

  console.log(`Seeded ${Object.keys(DATASET_KEYS).length} datasets (${remote ? 'remote' : 'local'}).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
