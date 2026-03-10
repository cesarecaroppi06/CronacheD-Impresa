## CD - Cronache d'Impresa

Sito editoriale Next.js con Sanity CMS e sincronizzazione LinkedIn -> articoli.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment (.env.local)

Required:

- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `NEXT_PUBLIC_SANITY_API_VERSION`
- `SANITY_API_READ_TOKEN`
- `SANITY_API_WRITE_TOKEN`
- `SANITY_REVALIDATE_SECRET`
- `EDITOR_DASHBOARD_KEY`

LinkedIn sync:

- `LINKEDIN_ORGANIZATION_URN` (es. `urn:li:organization:123456`)
- `LINKEDIN_ACCESS_TOKEN` (scope: `r_organization_social`)
- `LINKEDIN_API_VERSION` (es. `202602`)
- `LINKEDIN_SYNC_CATEGORY` (default: `Insights`)
- `LINKEDIN_SYNC_SECRET` (segreto per trigger machine-to-machine)
- `LINKEDIN_AUTO_SYNC_ENABLED=true`
- `LINKEDIN_AUTO_SYNC_INTERVAL_MINUTES=10`
- `LINKEDIN_AUTO_SYNC_LIMIT=10`

Optional (Vercel cron auth):

- `CRON_SECRET`

Optional (logo personalizzato):

- `NEXT_PUBLIC_BRAND_LOGO_PATH` (default: `/images/logo-brand-circle.png`)

## Logo del brand (formato cerchio)

1. Metti il file del logo in `public/images/`.
2. Nome consigliato pronto all'uso: `logo-brand-circle.png`.
3. Se vuoi usare un altro nome/formato (es. `.svg`), imposta `NEXT_PUBLIC_BRAND_LOGO_PATH` in `.env.local`.

Esempio:

```env
NEXT_PUBLIC_BRAND_LOGO_PATH=/images/mio-logo.png
```

Il componente applica automaticamente un badge circolare elegante con bordo grafico, e usa fallback su `/images/cd-emblem.svg` se il file non viene trovato.

## LinkedIn -> sito automatico

- Manuale: `POST /api/integrations/linkedin/sync` con header `x-editor-key`.
- Machine-to-machine: `GET/POST /api/integrations/linkedin/sync?secret=...`.
- Webhook relay: `POST /api/integrations/linkedin/webhook?secret=...`.
- Automatico senza click:
  - Il sito esegue auto-sync in background quando riceve traffico, rispettando cooldown (`LINKEDIN_AUTO_SYNC_INTERVAL_MINUTES`).
  - Se importa nuovi post, aggiorna subito gli articoli.

Per esecuzione totalmente pianificata in produzione, configura un cron job su:

- `/api/integrations/linkedin/sync?limit=10`

Se usi Vercel, imposta `CRON_SECRET`: la route accetta `Authorization: Bearer <CRON_SECRET>`.
