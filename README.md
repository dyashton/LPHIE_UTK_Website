# Beta Kappa Chapter of Lambda Phi Epsilon at UTK

Public site for the Beta Kappa Chapter (University of Tennessee, Knoxville).

## Stack

- React 19 + Vite 7 + Tailwind 4 + Framer Motion
- Datasets via Cloudflare Pages Functions + D1 (`/api/datasets/*`)
- Admin CSV editor at `/admin/data` (token-gated)

## Local development

```bash
npm install
npm run dev
```

For API/datasets locally, run Wrangler alongside Vite (see `package.json` scripts / `wrangler.toml`). Vite proxies `/api` to the Pages Functions port.

## Content updates

Preferred path: open `/admin/data`, paste the admin token, edit or upload CSV for:

- `brothers` — brother profiles
- `familyTree` — lineage graph
- `rush` — rush event calendar
- `timeline` — chapter history (optional `imageIndex` column indexes into gallery photos)

Seed/fallback CSVs live in `public/data/`.

## Deploy

**Cloudflare Pages** is the primary host (Functions + D1). Connect the repo in the Cloudflare dashboard and set the admin token secret.

Legacy notes: older Heroku / `gh-pages` scripts may still exist in `package.json` — prefer Pages for new deploys.
