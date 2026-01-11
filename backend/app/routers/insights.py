from fastapi import APIRouter, Query, HTTPException
from app.services.llm_insights import llm_service
from app.services.job_manager import job_manager

router = APIRouter()

@router.get("/{job_id}")
async def get_insights(
    job_id: str, 
    model: str = Query("claude-3-haiku-20240307", description="Model to use for insights (e.g., claude-3-haiku, gemini-pro)")
):
    job = job_manager.get_job(job_id)
    if not job or job["status"] != "completed":
        raise HTTPException(status_code=404, detail="Profiling job not found or not completed")
    
    results = job.get("result")
    if not results:
        raise HTTPException(status_code=500, detail="Job result missing")
        
    insights = await llm_service.generate_insights(results, model_name=model)
    return {
        "job_id": job_id,
        "model_used": model,
        "insights": insights
    }
