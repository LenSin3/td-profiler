from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException, Request, Depends
from app.models.profile import JobResponse
from app.utils.file_parser import parse_file
from app.services.profiler.engine import profile_dataset
from app.services.job_manager import job_manager
from app.utils.rate_limiter import check_rate_limit

router = APIRouter()

# Max file size: 5MB
MAX_FILE_SIZE = 5 * 1024 * 1024

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

@router.post("/upload", response_model=JobResponse, dependencies=[Depends(check_rate_limit("upload"))])
async def upload_file(request: Request, background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    content = await file.read()

    # Check file size
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024 * 1024)}MB."
        )

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
