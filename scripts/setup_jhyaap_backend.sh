#!/bin/bash
# ==========================================================
# Jhyaap Station — Backend Master Setup Script
# Creates folder structure, venv, installs deps, inits git
# Usage: bash setup_jhyaap_backend.sh
# Note: MUST be run from repo root (c:/Users/ACER/Desktop/Jhyaap_Station)
# ==========================================================

set -e  # stop on first error

PROJECT_NAME="jhyaap-station-backend"

# Ensure we're at repo root (best-effort)
# If you renamed folders, adjust checks as needed.
REPO_ROOT="$(pwd)"

echo "==> Creating project: $PROJECT_NAME"
mkdir -p "$PROJECT_NAME"
cd "$PROJECT_NAME"

echo "==> Creating folder structure"
mkdir -p app/core
mkdir -p app/api/v1/endpoints/admin
mkdir -p app/models
mkdir -p app/services
mkdir -p app/db
mkdir -p app/utils
mkdir -p supabase/migrations
mkdir -p tests

# Placeholder __init__.py files so folders are valid Python packages
touch app/__init__.py
touch app/core/__init__.py
touch app/api/__init__.py
touch app/api/v1/__init__.py
touch app/api/v1/endpoints/__init__.py
touch app/api/v1/endpoints/admin/__init__.py
touch app/models/__init__.py
touch app/services/__init__.py
touch app/db/__init__.py
touch app/utils/__init__.py
touch tests/__init__.py

echo "==> Creating app/main.py"
cat > app/main.py << 'EOF'
from fastapi import FastAPI

app = FastAPI(title="Jhyaap Station API")


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
EOF

echo "==> Creating requirements.txt"
cat > requirements.txt << 'EOF'
fastapi
uvicorn[standard]
asyncpg
pydantic
pydantic-settings
python-dotenv
supabase
python-jose[cryptography]
passlib[bcrypt]
python-multipart
redis
arq
httpx
EOF

echo "==> Creating .env.example"
cat > .env.example << 'EOF'
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
APP_NAME=Jhyaap Station API
APP_ENV=development
DEBUG=true
SECRET_KEY=
ACCESS_TOKEN_EXPIRE_MINUTES=60
REDIS_URL=redis://localhost:6379/0
ESEWA_MERCHANT_CODE=
ESEWA_SECRET_KEY=
KHALTI_SECRET_KEY=
FONEPAY_MERCHANT_CODE=
FONEPAY_SECRET_KEY=
SPARROW_SMS_TOKEN=
SPARROW_SMS_FROM=
FRONTEND_ORIGIN=http://localhost:5173
EOF

echo "==> Creating .gitignore"
cat > .gitignore << 'EOF'
.env
.env.local
.env.production
__pycache__/
*.pyc
.venv/
venv/
.DS_Store
*.log
EOF

echo "==> Creating README.md"
cat > README.md << 'EOF'
# Jhyaap Station — Backend

FastAPI + Supabase (Postgres) backend for the Jhyaap Station liquor delivery platform.

## Setup
1. Copy `.env.example` to `.env` and fill in real values (never commit `.env`)
2. Activate the virtual environment: `source .venv/bin/activate`
3. Run the dev server: `uvicorn app.main:app --reload`

## Health check
- `GET /health`
EOF

echo "==> Creating virtual environment"
python3 -m venv .venv

echo "==> Activating venv and installing dependencies"
# shellcheck disable=SC1091
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

echo "==> Initializing git repo"
git init -q

echo ""
echo "=========================================="
echo " Setup complete: $PROJECT_NAME"
echo "=========================================="
echo "Next steps:"
echo "  cd $PROJECT_NAME"
echo "  cp .env.example .env   # then fill in real Supabase/payment keys"
echo "  source .venv/bin/activate"
echo "  uvicorn app.main:app --reload"
echo "=========================================="

