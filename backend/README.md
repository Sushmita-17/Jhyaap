# Jhyaap Station — Backend

FastAPI + Supabase (Postgres) backend for the Jhyaap Station liquor delivery platform.

## Setup
1. Copy `.env.example` to `.env` and fill in real values (never commit `.env`)
2. Create and activate the virtual environment (Python 3.11 recommended):
   - Windows: `py -3.11 -m venv .venv` then `.\.venv\Scripts\Activate.ps1`
   - macOS/Linux: `python3.11 -m venv .venv` then `source .venv/bin/activate`
3. Install deps: `pip install -r requirements.txt psycopg2-binary`
4. Run the dev server: `uvicorn app.main:app --reload`

## Health check
- `GET /health`
