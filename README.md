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
├── reports/                 # Dated FusionHawk assessment PDFs (security, code review, test scenarios)
├── Anarock-Cla-Online-Listing-Platform Scope (1).docx   # Statement of work / scope document
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
- **KYC page** — city-specific compliance/info page (e.g. Delhi)

## Prerequisites

- Node.js (Catalyst function runtime targets **Node.js 24**; the Next.js app requires Node 18+)
- A [Zoho Catalyst](https://catalyst.zoho.com/) account and project
- [Catalyst CLI](https://catalyst.zoho.com/help/cli.html) (`npm install -g zcatalyst-cli`)
- Zoho CRM API credentials (OAuth client for the self-client / server-based application used to push leads)

## Environment Variables

Create `anarock/.env.local` with the credentials the app needs at runtime:

| Variable                                                                                            | Used for                                                                        |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `CATALYST_CLIENT_ID` / `CATALYST_CLIENT_SECRET` / `CATALYST_REFRESH_TOKEN`                          | Catalyst SDK auth (Data Store + Stratus access)                                 |
| `CATALYST_PROJECT_ID` / `CATALYST_PROJECT_KEY` / `CATALYST_PROJECT_DOMAIN` / `CATALYST_ENVIRONMENT` | Catalyst project identifiers (fall back to `.catalystrc` if omitted)            |
| `CATALYST_PROPERTIES_TABLE_ID`                                                                      | Data Store table ID for property listings (defaults to a hard-coded ID)         |
| `CATALYST_ACCOUNTS_URL`                                                                             | Zoho accounts domain for token refresh (defaults to `https://accounts.zoho.in`) |
| `ZOHO_CLIENT_ID` / `ZOHO_CLIENT_SECRET` / `ZOHO_REFRESH_TOKEN`                                      | Zoho CRM OAuth credentials (Leads, City, micromarket APIs)                      |
| `ZOHO_ACCOUNTS_URL` / `ZOHO_API_URL`                                                                | Zoho accounts/API domains (default to the `.in` data center)                    |

> No `.env.example` ships in the repo — populate the variables above based on your own Catalyst project and Zoho CRM OAuth client.

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
| `lead3`                                                   | Shortlist enquiry: lead plus `Interested_Properties` subform rows in Zoho CRM                                  |
| `cities`, `micromarkets`                                  | City and micromarket lookups from Zoho CRM (cached)                                                            |
| `market-stats`, `kyc`                                     | Market statistics and city KYC data                                                                            |
| `location`                                                | Reverse geocoding (OpenStreetMap Nominatim)                                                                    |
| `exchange-rates`                                          | Currency rates (Frankfurter)                                                                                   |
| `wishlist`                                                | Stub (returns empty set)                                                                                       |

## Scope Status (vs. _Anarock CLA Online Listing Platform Scope_)

- **Implemented:** listing and detail pages (client-rendered; server-side rendering for SEO is still pending), static sitemap/robots (need fixes), currency switching (INR, AED, USD, EUR, SGD), area-unit switching (sq ft / sq m), CRM lead capture, city/micromarket data, KYC city pages, compare, client-side wishlist, list-your-property page, cookie consent.
- **Not yet in the repository:** Gemini AI attribute generation, CRM-to-Stratus image sync, Catalyst Search / AI semantic search, Zoho SalesIQ chatbot, Zoho PageSense, GA4, property view-count scoring to CRM, linear unit switching (feet/metre; area units are done), on-demand revalidation, listing JSON-LD.

## Catalyst Environment (read-only inspection, 2026-10-16)

| Item                    | State                                                                                                    |
| ----------------------- | -------------------------------------------------------------------------------------------------------- |
| Project                 | `Anarock` (Development + Production environments, `.in` data centre)                                     |
| Slate, Production       | app `anarock` (upload type): deployment **failed** (build failed on 2026-10-14); no live Production site |
| Slate, Development      | apps `Anarock` and `nextjs`: both deployed and enabled (2026-10-14)                                      |
| Data Store              | tables `Properties` (395 rows), `KYC` (9), `Stats` (1)                                                   |
| Stratus                 | bucket `property-images` (Production and Development)                                                    |
| Functions               | `stratus_upload` only; not deployed and its source is not in this repository                             |
| API Gateway             | one rule (`stratus_upload`); nothing in front of the Next.js API routes                                  |
| AppSail / Cron / Search | none configured                                                                                          |

## Assessment Reports

Dated PDF reports (Security, Code Review, Test Scenarios, Scope Completeness) are stored in [`reports/`](reports/), suffixed with the run date (latest: 2026-10-16). Raw logs and the repeatable test scripts (`run_api_tests.sh`, `run_browser_tests.js`) are in [`reports/evidence/`](reports/evidence/). Findings were verified by running the code and by read-only queries of Zoho CRM and Catalyst, not only by reading it.

Current state (2026-10-16, run 4):

- `npm run build` **fails** on an ESLint error (`react/no-unescaped-entities` in `src/app/list-your-property/page.js:993`), and `npm ci` fails because `package-lock.json` is out of sync; use `npm install` until the lockfile is regenerated. The Production Slate deployment also failed (cause not retrievable via the connector).
- `npm audit`: 13 advisories (1 critical, 10 high, 2 moderate), mainly Next.js 14.2.35.
- Listing pages are client-rendered; the sitemap is static (4 URLs, two return 404, one is invalid XML because of an unescaped `&`); footer links `/aboutus`, `/privacy-policy`, `/rera`, `/terms-of-use` return 404.
- Open security items: unprotected `/api/lead2`, bypassable rate limiting (client-supplied `X-Forwarded-For`), no security headers, internal error text returned by APIs, and the public property API returns every Data Store column (including `SPOCName`, `SPOCNumber`, `AchievableRent`).
- No tests, CI, `.env.example` or monitoring exist in the repository.
