# Sanity Integration Notes

Il progetto legge e pubblica contenuti su Sanity.

## Variabili ambiente necessarie

- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `NEXT_PUBLIC_SANITY_API_VERSION`
- `SANITY_API_READ_TOKEN` (se dataset privato)
- `SANITY_API_WRITE_TOKEN` (per pubblicazione da dashboard)

## Tipo documento atteso

Il frontend usa documenti `_type == "article"` con campi:

- `title`
- `slug.current`
- `author`
- `date`
- `category`
- `image` oppure `imageUrl`
- `excerpt`
- `content` (Markdown)

## Dashboard editoriale interna

- URL: `/redazione`
- Pubblica articoli direttamente su Sanity
- Include sincronizzazione LinkedIn aziendale

## LinkedIn -> sito (company page)

Configura in `.env.local`:

- `LINKEDIN_ORGANIZATION_URN` (es. `urn:li:organization:123456`)
- `LINKEDIN_ACCESS_TOKEN` con scope `r_organization_social`
- `LINKEDIN_API_VERSION` (es. `202602`)
- `LINKEDIN_SYNC_SECRET` (opzionale per webhook/cron)

Endpoint utili:

- `POST /api/integrations/linkedin/sync` (header `x-editor-key`)
- `GET /api/integrations/linkedin/sync?secret=...` (cron/machine)
- `POST /api/integrations/linkedin/webhook?secret=...` (trigger webhook)

Se Sanity non e configurato o non restituisce documenti, il sito usa fallback Markdown da `content/articles`.
