# Anarock

AI-powered commercial real estate search platform for India, built on **Zoho Catalyst**. The project pairs a Next.js storefront with a Catalyst serverless backend, and integrates with **Zoho CRM** (lead capture, city/micromarket lookups) and **Zoho Catalyst Data Store & Stratus** (property listings and images).

> Marketing copy from the app: *"Anarock — Premium Commercial Real Estate in India"*, *"India's leading commercial real estate advisory."*

## Repository Layout

```
.
├── anarock/                 # Next.js 14 frontend (deployed as a Catalyst Slate app)
│   ├── src/app/              # App Router pages + API routes
│   ├── src/components/       # UI components (shadcn/ui-based design system + feature components)
│   ├── src/lib/               # Catalyst SDK wiring, formatting, wishlist & preferences helpers
│   └── src/pages/HomePage.js  # Main landing page composition
├── functions/
│   └── anarock_function/     # Catalyst Advanced I/O serverless function (Node.js 24)
├── catalyst.json             # Catalyst project manifest (registers the Slate app + function)
├── .catalystrc                # Local Catalyst CLI project/environment configuration
└── package.json               # Root-level shared dependencies
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

| Variable | Used for |
| --- | --- |
| `CATALYST_CLIENT_ID` / `CATALYST_CLIENT_SECRET` / `CATALYST_REFRESH_TOKEN` | Catalyst SDK auth (Data Store + Stratus access) |
| `CATALYST_PROJECT_ID` / `CATALYST_PROJECT_KEY` / `CATALYST_PROJECT_DOMAIN` / `CATALYST_ENVIRONMENT` | Catalyst project identifiers (fall back to `.catalystrc` if omitted) |
| `CATALYST_PROPERTIES_TABLE_ID` | Data Store table ID for property listings (defaults to a hard-coded ID) |
| `CATALYST_ACCOUNTS_URL` | Zoho accounts domain for token refresh (defaults to `https://accounts.zoho.in`) |
| `ZOHO_CLIENT_ID` / `ZOHO_CLIENT_SECRET` / `ZOHO_REFRESH_TOKEN` | Zoho CRM OAuth credentials (Leads, City, micromarket APIs) |
| `ZOHO_ACCOUNTS_URL` / `ZOHO_API_URL` | Zoho accounts/API domains (default to the `.in` data center) |

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

### 4. Run the Catalyst function locally

```bash
catalyst serve
```

### 5. Deploy

```bash
catalyst deploy
```

This deploys both the `anarock` Slate (Next.js) app and the `anarock_function` Advanced I/O function, as declared in `catalyst.json`.

## Scripts (`anarock/`)

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

## Notes

- The `anarock_function` Advanced I/O function currently serves a placeholder `"Hello from index.js"` response — it's a starting point for future backend logic beyond the Next.js API routes.
- Property images are stored in a Catalyst Stratus bucket named `property-images`.
- The wishlist API endpoint currently returns an empty item set as a stub.
