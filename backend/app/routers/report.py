from fastapi import APIRouter

router = APIRouter()

@router.get("/{job_id}")
async def get_report(job_id: str, format: str = "pdf"):
    return {"job_id": job_id, "format": format}
