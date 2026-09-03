# Lead Validator

An internal tool for reviewing how incoming leads get auto-classified.
Each lead has a company name and  a URL; a backend classifier
fetches the page content and returns a category, a confidence score, and
its reasoning. This app lets you browse leads, add new ones, and trigger
(or re-trigger) classification by hand.

- **Left pane** — list of all leads, with their latest classification
  category and confidence at a glance.
- **Right pane** — full detail for the selected lead: category,
  confidence, the model's reasoning, which model ran it, and when.
- **Add lead** — a small form in the list header to register a new
  company + URL.
- **Classify / Reclassify** — runs (or reruns) the classifier for the
  selected lead against live page content.

## How it's built

- **Backend**: FastAPI (`main.py`), Supabase for storage. Fetches page
  content via Jina/Playwright, then classifies it with an LLM
  (`CLASSIFIER_MODEL`).
- **Frontend**: React + Vite + Tailwind CSS, in `lead-validator-frontend/`.

```
.
├── main.py                     FastAPI app (routes below)
├── libs/
│   ├── config.py                FRONTEND_ORIGIN, CLASSIFIER_MODEL
│   ├── db.py                    Supabase queries (get_lead(s), insert_*)
│   ├── fetchContent.py          Jina/Playwright page fetching
│   └── Classifier.py            classify_content, no_url_result
└── lead-validator-frontend/
    ├── src/
    │   ├── App.jsx               state + wiring
    │   ├── api.js                fetch wrappers to the backend
    │   ├── utils.js              normalizeLead, formatting helpers
    │   ├── index.css             Tailwind entry
    │   └── components/
    │       ├── LeadList.jsx       left pane
    │       ├── LeadDetail.jsx     right pane, classify action
    │       ├── AddLead.jsx        add-lead form
    │       └── StatusPill.jsx     category/confidence badge
    ├── tailwind.config.js         design tokens (colors, fonts)
    └── package.json
```

## API

| Method | Route                     | Does what |
|--------|----------------------------|-----------|
| GET    | `/data`                    | List all leads with their latest classification |
| POST   | `/leads`                   | Create a new lead (`company_name`, `url`) |
| POST   | `/leads/{lead_id}/classify` | Fetch the lead's page and run/rerun classification |

Errors come back as FastAPI's standard `{"detail": "..."}` — the
frontend surfaces `detail` directly. Notably: `409` if that lead is
already mid-classification, `502` if page content couldn't be fetched,
`404` if the lead doesn't exist.

## Setup

```bash
git clone https://github.com/Mamoor-s3ltan/Lead-Validator.git
```

### 1. Backend


Requires Python 3.11+ (for the `str | None` syntax used in the models),
a Supabase project with a `leads` table and a classifications table, and
whatever credentials `libs/config.py` and `libs/db.py` expect.

```bash
cd backend
pip install -r requirements.txt
```

Set environment variables (names depend on your `libs/config.py`, at
minimum you'll need something like):

```bash
export SUPABASE_URL=...
export SUPABASE_KEY=...
export FRONTEND_ORIGIN=http://localhost:5173
export CLASSIFIER_MODEL= openai/gpt-4o-mini 
```

Run it:

```bash
uvicorn main:app --reload --port 8000
```

The API is now at `http://127.0.0.1:8000`. Visit
`http://127.0.0.1:8000/docs` for interactive Swagger docs.

### 2. Frontend

```bash
cd lead-validator-frontend
npm install
```

Tell it where the backend lives (defaults to `http://127.0.0.1:8000` if
you skip this):

```bash
# lead-validator-frontend/.env
VITE_API_BASE=http://127.0.0.1:8000
```

Run it:

```bash
npm run dev
```

Visit `http://localhost:5173`. Make sure `FRONTEND_ORIGIN` on the backend
matches this URL, or the browser will block requests with a CORS error.

## Using it

1. Open the app — the list pane loads all existing leads via `GET /data`.
2. Click **+ Add lead** in the list header to register a new company and
   URL. It's created immediately and auto-selected.
3. Click a lead in the list to see its details on the right.
4. Click **Classify** (or **Reclassify** if it's already been run) to
   fetch the page and run the classifier. While it's running, the button
   shows a spinner and is disabled for that lead only — you can keep
   browsing other leads in the meantime.
5. If a lead has no URL, classification still runs but returns whatever
   `no_url_result()` defines on the backend (e.g. an "unqualified /
   no URL" category) instead of fetching a page.

## Troubleshooting

- **"Could not reach the API. Is the backend running?"** — the backend
  isn't up, or `VITE_API_BASE` points somewhere wrong.
- **CORS error in the browser console** — `FRONTEND_ORIGIN` on the
  backend doesn't match the URL the frontend is actually running on.
- **409 "This lead is already being classified."** — the in-memory
  `_in_flight` guard caught a double-submit; wait for the first run to
  finish.
- **502 "Could not fetch page content..."** — both Jina and Playwright
  failed to fetch the lead's URL. Check the URL is reachable and not
  blocking scrapers.