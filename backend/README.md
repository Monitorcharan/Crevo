# Crevo Backend Service (FastAPI + Supabase)

High-performance, secure backend architecture for the Crevo AI Creator Marketplace. Built with **Python 3.11+**, **FastAPI**, **Pydantic v2**, and **Supabase (PostgreSQL + Auth + Storage)**.

---

## Architecture Overview

```
backend/
├── app/
│   ├── core/
│   │   ├── config.py         # Pydantic Settings & CORS configuration
│   │   └── security.py       # Supabase JWT signature verification & role extraction
│   ├── db/
│   │   └── supabase.py       # Supabase PostgREST client & robust fallback data repository
│   ├── routers/
│   │   ├── creators.py       # Creator discovery, filters, search, and profile dossier endpoints
│   │   ├── portfolios.py     # Portfolio case study creation, editing, and deletion
│   │   └── users.py          # User profile synchronization and session introspection
│   ├── schemas/              # Pydantic v2 models (User, Creator, Portfolio)
│   └── main.py               # Application factory, CORS middleware, and health routes
├── migrations/
│   ├── 001_initial_schema.sql  # DDL for profiles, creator_profiles, portfolio_items, RLS & triggers
│   └── 002_seed_demo_data.sql  # High-fidelity creator records and portfolio case studies
├── tests/                    # Pytest test suite (15 unit & permission tests)
├── requirements.txt          # Python dependencies
└── .env.example              # Server environment variable template
```

---

## 1. Quick Start

### Prerequisites
- Python 3.11 or higher
- `pip` or virtual environment manager (`venv`)

### Installation

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create and activate a virtual environment
python -m venv venv
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# macOS/Linux:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up environment variables
cp .env.example .env
```

### Running the Server

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be accessible at:
- **API Root**: `http://localhost:8000/`
- **Health Check**: `http://localhost:8000/health`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **ReDoc Documentation**: `http://localhost:8000/redoc`

---

## 2. Supabase Database Setup & Migrations

To connect your live Supabase project:

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in the Supabase Dashboard.
3. Run the migrations in sequence:
   - First execute `migrations/001_initial_schema.sql` (Creates `profiles`, `creator_profiles`, `portfolio_items`, RLS policies, indexes, and user creation triggers).
   - Next execute `migrations/002_seed_demo_data.sql` (Inserts initial verified creators and case studies marked with `is_demo_seed = true`).
4. Retrieve your project API credentials from **Project Settings -> API**:
   - `Project URL` -> `SUPABASE_URL`
   - `anon public` key -> `VITE_SUPABASE_ANON_KEY` (frontend)
   - `service_role` secret -> `SUPABASE_SERVICE_ROLE_KEY` (backend only)
   - `JWT Secret` -> `SUPABASE_JWT_SECRET` (backend only)

> **Security Note**: Never expose the `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_JWT_SECRET` in frontend code or client `.env` files.

---

## 3. Environment Variables Reference

### Backend (`backend/.env`)
```env
PROJECT_NAME="Crevo Marketplace API"
ENVIRONMENT="development"
CORS_ORIGINS=["http://localhost:5173","http://localhost:4173","http://localhost:3000"]

# Supabase Credentials (leave blank to run in Demo Seed sandbox mode)
SUPABASE_URL=
SUPABASE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=
```

### Frontend (`.env` in workspace root)
```env
# Point to your local FastAPI backend server
VITE_API_URL=http://localhost:8000

# Supabase Public Anonymous Keys (safe for browser)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

---

## 4. REST API Endpoints & Sample cURL Requests

### Health Check
```bash
curl -X GET http://localhost:8000/health
```

### List Creators (Search, Filter, Pagination)
```bash
# Basic list
curl -X GET "http://localhost:8000/api/creators?limit=10&offset=0"

# Search and filter by AI tool and specialization
curl -X GET "http://localhost:8000/api/creators?search=Elena&specialization=AI%20Filmmaking&tool=Runway%20Gen-3"
```

### Get Creator Dossier by ID
```bash
curl -X GET http://localhost:8000/api/creators/elena-vance
```

### Update Creator Profile (Authenticated Creator)
```bash
curl -X PATCH http://localhost:8000/api/creators/me \
  -H "Authorization: Bearer test-creator-token" \
  -H "Content-Type: application/json" \
  -d '{
    "headline": "Lead AI Director & Generative Cinematographer",
    "bio": "Directing cutting-edge AI commercials for global luxury brands.",
    "specialization": "AI Filmmaking",
    "skills": ["Cinematic Direction", "Motion Prompting", "LoRA Fine-tuning"],
    "ai_tools": ["Runway Gen-3", "Midjourney v6", "ComfyUI"],
    "availability": "Available Now"
  }'
```

### Get Creator Portfolio Items
```bash
curl -X GET http://localhost:8000/api/creators/elena-vance/portfolio
```

### Publish New Portfolio Item (Authenticated Creator)
```bash
curl -X POST http://localhost:8000/api/portfolio \
  -H "Authorization: Bearer test-creator-token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Quantum Mirage: 8K Anamorphic Sequence",
    "description": "Exploration of neural optics and camera tracking.",
    "media_url": "/creators/film_sci_fi.jpg",
    "media_type": "video",
    "tools_used": ["Runway Gen-3", "ComfyUI"],
    "workflow_description": "Trained custom LoRA on 65mm motion picture film.",
    "commercial_use_status": "cleared"
  }'
```

### Update Portfolio Item
```bash
curl -X PATCH http://localhost:8000/api/portfolio/390949e4-00bf-4ed3-820d-b7e33bd04dc7 \
  -H "Authorization: Bearer test-creator-token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Quantum Mirage: Remastered 8K Anamorphic Sequence"
  }'
```

### Delete Portfolio Item
```bash
curl -X DELETE http://localhost:8000/api/portfolio/390949e4-00bf-4ed3-820d-b7e33bd04dc7 \
  -H "Authorization: Bearer test-creator-token"
```

---

## 5. Automated Tests

Run the full pytest suite:

```bash
python -m pytest backend/tests/ -v
```

All 15 tests cover:
- Health check verification
- Creator discovery, search, and specialization filtering
- 404 handling for unknown creators
- Bearer token authentication and rejection of missing/malformed JWTs
- Role-based authorization (`brand` role blocked from modifying creator-only endpoints)
- Portfolio creation, ownership validation, and deletion

---

## 6. Supabase MCP Server Integration

This repository is integrated with `@supabase/mcp-server-postgrest` to provide direct PostgREST and SQL-to-REST tools via Model Context Protocol (MCP).

- **API URL**: `https://vkjranivomjttumfsjhz.supabase.co/rest/v1`
- **MCP Config**: Registered in `~/.gemini/config/mcp_config.json`
- **CLI Helper**: `python backend/scripts/supabase_mcp.py "<SQL or /endpoint>"`

```bash
# Convert SQL query to PostgREST request format:
python backend/scripts/supabase_mcp.py "SELECT * FROM profiles"

# Query an endpoint directly:
python backend/scripts/supabase_mcp.py "/profiles"
```
