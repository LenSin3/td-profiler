from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException
from app.models.profile import JobResponse
from app.utils.file_parser import parse_file
from app.services.profiler.engine import profile_dataset
from app.services.job_manager import job_manager

router = APIRouter()

async def run_profiling(job_id: str, content: bytes, filename: str):
    try:
        df = parse_file(content, filename)
        if df is None:
            job_manager.update_job(job_id, "failed")
            return
            
        results = profile_dataset(df)
        job_manager.update_job(job_id, "completed", result=results)
    except Exception as e:
        print(f"Profiling failed: {e}")
        job_manager.update_job(job_id, "failed")

@router.post("/upload", response_model=JobResponse)
async def upload_file(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    content = await file.read()
    job_id = job_manager.create_job(file.filename)
    
    background_tasks.add_task(run_profiling, job_id, content, file.filename)
    
    return {
        "job_id": job_id,
        "status": "processing",
        "filename": file.filename,
        "file_size_bytes": len(content),
        "estimated_time_sec": 5, # Mock estimation
        "progress_url": f"/api/profile/{job_id}"
    }
