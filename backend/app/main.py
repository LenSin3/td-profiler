from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import upload, profile, insights, report

app = FastAPI(
    title="TD Profiler API",
    description="AI-Powered Data Quality Analyzer",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(upload.router, prefix="/api", tags=["Upload"])
app.include_router(profile.router, prefix="/api/profile", tags=["Profile"])
app.include_router(insights.router, prefix="/api/insights", tags=["Insights"])
app.include_router(report.router, prefix="/api/report", tags=["Report"])

@app.get("/")
async def root():
    return {"message": "Welcome to TD Profiler API"}
