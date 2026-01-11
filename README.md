# TD Profiler
AI-Powered Data Quality Analyzer

## Setup
1. Backend:
   ```bash
   cd backend
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```
2. Frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
