Anarock

AI-powered commercial real estate search platform for India, built on **Zoho Catalyst**. The project pairs a Next.js storefront with a Catalyst serverless backend, and integrates with **Zoho CRM** (lead capture, city/micromarket lookups) and **Zoho Catalyst Data Store & Stratus** (property listings and images).

> Marketing copy from the app: _"Anarock — Premium Commercial Real Estate in India"_, _"India's leading commercial real estate advisory."_

## Repository Layout

```
.
├── anarock/                 # Next.js 14 frontend (deployed as a Catalyst Slate app)
│   ├── src/app/              # App Router pages + API routes
│   ├── src/components/       # UI components (shadcn/ui-based design system + feature components)
│   ├── src/lib/               # Catalyst SDK wiring, formatting, wishlist & preferences helpers
│   └── src/pages/HomePage.js  # Main landing page composition
├── reports/                 # Dated FusionHawk assessment PDFs + evidence/ logs and test scripts
├── catalyst.json             # Catalyst project manifest (registers the Slate app)
├── .catalystrc                # Local Catalyst CLI project/environment configuration
└── package.json               # Root-level package manifest
```

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React 18, Tailwind CSS, Framer Motion, shadcn/ui-style components (Radix primitives), `lucide-react` icons
- **Backend / Hosting:** [Zoho Catalyst](https://catalyst.zoho.com/) — Slate (frontend hosting), Advanced I/O Functions, Data Store, Stratus (object storage)
- **Integrations:**
  - Zoho CRM v8 REST API — Leads, City, and micromarket data
  - Frankfurter API — live currency exchange rates (INR, AED, USD, EUR, SGD)
  - OpenStreetMap Nominatim — reverse geocoding for location detection
  - Google Gemini (`gemini-2.5-flash` by default) — natural-language search interpretation (`/api/ai-search`)
- **SDK:** `zcatalyst-sdk-node`

## Key Features

- **Property search & listings** — browse, filter (city / type / micromarket), and view individual commercial property details, backed by a Catalyst Data Store table and paginated fetches
- **Property comparison** — compare shortlisted properties (client-side, `localStorage`-backed)
- **Wishlist** — save properties per session
- **Lead capture** — submits inquiries directly into Zoho CRM's Leads module
- **City & micromarket data** — sourced from Zoho CRM
- **Location detection** — reverse geocoding via OpenStreetMap
- **Live currency conversion** — INR/AED/USD/EUR/SGD exchange rates
- **Market stats widget** — aggregate stock/vacancy/transaction figures on the homepage
- **AI search** — natural-language query interpreted by Gemini into filters (`/api/ai-search`)
- **KYC pages** — city market-intelligence pages for Bengaluru, Chennai, Delhi, Gurugram, Hyderabad, Kolkata, Mumbai, Noida and Pune
- **Marketing pages** — `/aboutus`, `/services`, `/list-your-property`, `/shortlist`, `/compare`

## Prerequisites

- Node.js (Catalyst function runtime targets **Node.js 24**; the Next.js app requires Node 18+)
- A [Zoho Catalyst](https://catalyst.zoho.com/) account and project
- [Catalyst CLI](https://catalyst.zoho.com/help/cli.html) (`npm install -g zcatalyst-cli`)
- Zoho CRM API credentials (OAuth client for the self-client / server-based application used to push leads)

## Environment Variables

Create `anarock/.env.local`. Names below are the ones the code actually reads (values are never stored in the repo):

| Variable | Used for |
| --- | --- |
| `CLIENT_ID` / `CLIENT_SECRET` / `REFRESH_TOKEN` | Catalyst SDK / OAuth credentials (`src/lib/catalyst.js`) |
| `PROJECT_ID` / `PROJECT_KEY` | Catalyst project identifiers (`PROJECT_ID` defaults to the Anarock project id) |
| `ENVIRONMENT` | Catalyst environment (code defaults to `Production`) |
| `PROPERTIES_TABLE_ID` / `STATS_TABLE_ID` / `KYC_TABLE_ID` / `PROPERTY_IMAGES_BUCKET` | Data Store tables and Stratus bucket (have defaults) |
| `ZOHO_CLIENT_ID` / `ZOHO_CLIENT_SECRET` / `ZOHO_REFRESH_TOKEN` | Zoho CRM OAuth for `leads`, `lead2`, `lead3`, `cities`, `micromarkets` |
| `ZOHO_CRM_ACCESS_TOKEN` or `ZOHO_CRM_CLIENT_ID` / `ZOHO_CRM_CLIENT_SECRET` / `ZOHO_CRM_REFRESH_TOKEN` (+ `ZOHO_ACCOUNTS_DOMAIN`) | Zoho CRM credentials used only by `list-your-property` |
| `ZOHO_ACCOUNTS_URL` / `ZOHO_API_URL` / `ZOHO_REQUEST_TIMEOUT_MS` | Zoho domains (default `.in`) and timeout |
| `GEMINI_API_KEY` / `GEMINI_MODEL` | AI search (`GEMINI_MODEL` defaults to `gemini-2.5-flash`) |
| `NEXT_PUBLIC_BASE_URL` | Canonical site URL for metadata, sitemap and robots (build-time; default `https://anarock.com`) |
| `PROPERTIES_CACHE_TTL`, `MARKET_STATS_CACHE_TTL`, `CITIES_CACHE_TTL`, `MICROMARKETS_CACHE_TTL`, `KYC_CACHE_TTL` | Optional cache TTLs in seconds |

> No `.env.example` ships in the repo. Lockfile: `anarock/package-lock.json` is committed and `npm ci` works (verified 2026-11-02).

## Getting Started

### 1. Install dependencies

```bash
# Root (shared/serverless-function dependencies)
npm install

# Frontend
cd anarock
npm install
```

### 2. Configure Catalyst

```bash
catalyst login
catalyst init      # or catalyst config, if the project is already registered — see .catalystrc
```

### 3. Run the frontend locally

```bash
cd anarock
npm run dev            # http://localhost:3000
# or, matching the Catalyst Slate dev command:
npm run dev -- --port 3001
```

### 4. Deploy

```bash
catalyst deploy
```

This deploys the `anarock` Slate (Next.js) app declared in `catalyst.json`. Note: `catalyst.json` currently points at a Windows source path (`D:\\Catalyst\\anarock`); adjust it to `anarock` for other machines.

## Scripts (`anarock/`)

| Command         | Description                  |
| --------------- | ---------------------------- |
| `npm run dev`   | Start the Next.js dev server |
| `npm run build` | Production build             |
| `npm run start` | Start the production server  |
| `npm run lint`  | Run ESLint                   |

## Notes

- The `functions/anarock_function` Advanced I/O function mentioned in earlier versions is **not present in the repository**; backend logic currently lives in the Next.js API routes under `anarock/src/app/api/`.
- Property images are stored in a Catalyst Stratus bucket named `property-images`.
- The wishlist API endpoint currently returns an empty item set as a stub.

## API Routes (`anarock/src/app/api/`)

| Route                                                     | Purpose                                                                                                        |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `properties`, `properties/[id]`, `properties/suggestions` | Listing search/filter/sort, property detail, search suggestions (Catalyst Data Store, cached)                  |
| `leads`                                                   | Navbar "request a callback" lead into Zoho CRM (validation, honeypot, in-memory rate limit)                    |
| `lead2`                                                   | Home page "post a requirement" lead into Zoho CRM (**no rate limit or input validation**; see security report) |
| `ai-search` | Natural-language property search: Gemini interprets the prompt, then filters in-app (**no rate limit or prompt-size cap**) |
| `list-your-property` | Owner/broker listing submission and city/micromarket lookups to Zoho CRM (no rate limit) |
| `lead3`                                                   | Shortlist enquiry: lead plus `Interested_Properties` subform rows in Zoho CRM                                  |
| `cities`, `micromarkets`                                  | City and micromarket lookups from Zoho CRM (cached)                                                            |
| `market-stats`, `kyc`                                     | Market statistics and city KYC data                                                                            |
| `location`                                                | Reverse geocoding (OpenStreetMap Nominatim)                                                                    |
| `exchange-rates`                                          | Currency rates (Frankfurter)                                                                                   |
| `wishlist`                                                | Stub (returns empty set)                                                                                       |

## Scope Status (vs. _Anarock CLA Online Listing Platform Scope_)

The scope document was removed from `main` in commit `9b87d49`; the last copy is in git history at commit `21cf217` (`Anarock-Cla-Online-Listing-Platform Scope (1).docx`).

- **Implemented in code:** listing and detail pages (client-rendered), compare, client-side wishlist, currency switching (INR, AED, USD, EUR, SGD), area units (sq ft / sq m), CRM lead capture, city/micromarket data, KYC city pages, AI search (Gemini query interpretation), list-your-property, about/services pages, cookie consent, static sitemap/robots.
- **Not in the repository:** Gemini attribute generation, CRM-to-Stratus sync Function (a `stratus_upload` Function exists in Catalyst but is undeployed and not in the repo), Catalyst Search, Zoho SalesIQ, Zoho PageSense, GA4/GTM, view-count scoring, on-demand revalidation, listing JSON-LD, Privacy/Terms/Contact pages, linear unit switching (feet/metre).
- Weighted SoW completeness measured on 2026-11-02: about 36% (46 items). See the Scope Completeness report.

## Catalyst Environment (read-only inspection, 2026-11-02)

| Item | State |
| --- | --- |
| Project | `Anarock` (Development + Production environments, `.in` data centre) |
| Slate, Production | app `anarock` (upload type): deployment **failed** (build failed 2026-10-14); no live Production site |
| Slate, Development | apps `Anarock` and `nextjs` (CLI type), created 2026-10-14 |
| Data Store | tables `Properties` (177 rows, equals CRM Push_to_Website=true), `KYC`, `Stats` |
| Stratus | bucket `property-images` (encryption off, caching disabled, versioning off) |
| Functions | `stratus_upload` only; not deployed; source not in this repository |
| API Gateway | one rule (`stratus_upload`); nothing in front of the Next.js API routes |
| AppSail / Cron / Search | none configured |
| Auth | public sign-up enabled; default `App User` role may SELECT/UPDATE/INSERT |

## Assessment Reports

Dated PDF reports (Security, Code Review, Test Scenarios, Scope Completeness) are in [`reports/`](reports/), suffixed with the run date (latest: 2026-11-02, run 5). Raw logs and the repeatable scripts (`run_api_tests.sh`, `run_browser_tests.js`, `build_reports.py`) are in [`reports/evidence/`](reports/evidence/).

Current state (2026-11-02, run 5; static checks on main @ df46295, behavioural tests on the last buildable commit 1c85d7d):

- **main does not build.** Commit `df46295` ("UPDATES") added about 5,900 lines to `anarock/src/app/list-your-property/page.js` (now 7,952 lines with pasted duplicate copies); `getRecordName` is declared twice, so `npm run build` fails and `npm run lint` reports a parsing error. On `1c85d7d` build and lint passed (run 4: failed). `npm ci` passes.
- `npm audit`: 19 advisories (1 critical, 14 high, 4 moderate); `next` is pinned to exactly `14.2.5`.
- Security: 18 findings (0 critical, 4 high, 10 medium, 4 low); highlights: public API returns every Data Store column incl. SPOC phone numbers, weak `/api/lead2`, `X-Forwarded-For` rate-limit bypass, unprotected `/api/ai-search`, no security headers.
- Listing and detail pages are client-rendered; the sitemap lists static and city pages only; `/privacy`, `/terms`, `/contact` and footer links `/privacy-policy`, `/terms-of-use`, `/rera` returned 404 on `1c85d7d`.
- Tests on `1c85d7d`: scripted HTTP 64 pass / 43 fail of 107; browser 82 pass / 30 fail of 112 (many failures are environmental: no credentials, proxy-blocked outbound HTTPS).
- No automated tests, CI, `.env.example` or monitoring exist in the repository.

