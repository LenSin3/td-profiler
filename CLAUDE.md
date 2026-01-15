# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TD Profiler is an AI-powered data quality analyzer. Users upload datasets (CSV, Excel, JSON) and receive comprehensive quality assessments with AI-generated insights, recommendations, and plain-English reports.

## Development Commands

### Backend (FastAPI + Python)

```bash
# Navigate to backend
cd backend

# Activate virtual environment (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Run development server (default port 8001 for local dev)
uvicorn app.main:app --reload --port 8001
```

### Frontend (React + Vite + TypeScript)

```bash
cd frontend
npm install
npm run dev      # Start dev server
npm run build    # Build for production (runs tsc + vite build)
npm run lint     # Run ESLint
```

### Full Stack Development

Run backend on port 8001 and frontend dev server simultaneously. Frontend expects backend at `http://localhost:8001` by default (configurable via `VITE_API_URL` env var).

## Architecture

### Backend Structure (`backend/app/`)

```
app/
├── main.py                 # FastAPI app entry point, CORS config, router registration
├── routers/                # API endpoint handlers
│   ├── upload.py           # POST /api/upload - file upload, starts background profiling
│   ├── profile.py          # GET /api/profile/{job_id} - profiling results
│   ├── insights.py         # GET /api/insights/{job_id} - AI-generated insights
│   └── report.py           # GET /api/report/{job_id} - report export
├── services/
│   ├── job_manager.py      # In-memory job state management (singleton)
│   ├── llm_insights.py     # LangChain integration for AI insights
│   └── profiler/           # Core profiling engine
│       ├── engine.py       # Main orchestrator - runs all profiling steps
│       ├── type_inference.py
│       ├── completeness.py
│       ├── statistics.py
│       ├── outliers.py
│       └── patterns.py
├── models/                 # Pydantic models
└── utils/
    ├── file_parser.py      # CSV/Excel/JSON parsing via pandas
    ├── semantic_types.py   # Detect email, phone, URL patterns
    └── scoring.py          # Quality score calculation
```

### Frontend Structure (`frontend/src/`)

- **App.tsx**: Main component with tab navigation (upload → dashboard → insights)
- **components/**: FileUploader, OverviewDashboard, InsightsPanel, LandingPage
- **components/ui/**: Reusable UI primitives (Button, Card, Badge, Progress, etc.)
- **components/layout/**: Sidebar, Header
- **config.ts**: API base URL configuration

### Key Data Flow

1. User uploads file → `POST /api/upload` → returns `job_id`, starts background task
2. Background task: `parse_file()` → `profile_dataset()` → stores in `job_manager`
3. Frontend polls `GET /api/profile/{job_id}` until status is "completed"
4. AI insights fetched separately via `GET /api/insights/{job_id}` (uses Claude 3.5 Haiku)

### Profiling Pipeline (`profile_dataset()` in engine.py)

For each column: type inference → semantic type detection → completeness stats → basic stats → outlier detection → pattern analysis → top values → score calculation

### Rate Limiting & Security

- IP-based rate limiting: 5 uploads/hour, 3 AI insights/hour per IP
- Max file size: 5 MB
- Jobs auto-expire after 1 hour (in-memory storage, no persistence)

## Tech Stack Notes

- **Backend**: FastAPI with pandas/polars for data processing
- **LLM**: LangChain with Anthropic (Claude) and Google GenAI support
- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Vite, Framer Motion
- **Charts**: Recharts
- **Deployment**: Railway (nixpacks.toml in backend/)

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/upload` | POST | Upload file, returns job_id |
| `/api/profile/{job_id}` | GET | Get profiling results |
| `/api/profile/{job_id}/column/{name}` | GET | Get single column detail |
| `/api/insights/{job_id}` | GET | AI-generated insights (query param: model) |
| `/api/report/{job_id}` | GET | Export report (PDF/MD/JSON) |
