from fastapi import APIRouter, HTTPException
from app.services.job_manager import job_manager

router = APIRouter()

@router.get("/{job_id}")
async def get_profile(job_id: str):
    job = job_manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.get("/{job_id}/column/{column_name}")
async def get_column_detail(job_id: str, column_name: str):
    job = job_manager.get_job(job_id)
    if not job or job["status"] != "completed":
        raise HTTPException(status_code=404, detail="Job not found or not completed")
    
    columns = job["result"]["columns"]
    column = next((c for c in columns if c["name"] == column_name), None)
    
    if not column:
        raise HTTPException(status_code=404, detail="Column not found")
        
    return column
