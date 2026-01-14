from fastapi import APIRouter, Query, HTTPException, Request
from app.services.llm_insights import llm_service
from app.services.job_manager import job_manager
from app.utils.rate_limiter import rate_limiter, get_client_ip

router = APIRouter()

@router.get("/{job_id}")
async def get_insights(
    request: Request,
    job_id: str,
    model: str = Query("claude-3-5-haiku-latest", description="Model to use for insights (e.g., claude-3-5-haiku-latest, gemini-1.5-flash)")
):
    job = job_manager.get_job(job_id)
    if not job or job["status"] != "completed":
        raise HTTPException(status_code=404, detail="Profiling job not found or not completed")

    results = job.get("result")
    if not results:
        raise HTTPException(status_code=500, detail="Job result missing")

    # Check for cached insights (keyed by model) - no rate limit for cached
    cached_insights = job.get("insights_cache", {}).get(model)
    if cached_insights:
        return {
            "job_id": job_id,
            "model_used": model,
            "insights": cached_insights,
            "cached": True
        }

    # Only check rate limit when actually calling LLM
    ip = get_client_ip(request)
    allowed, remaining = rate_limiter.check_rate_limit(ip, "insights")
    if not allowed:
        reset_seconds = rate_limiter.get_reset_time(ip, "insights")
        raise HTTPException(
            status_code=429,
            detail={
                "error": "Rate limit exceeded",
                "action": "insights",
                "retry_after_seconds": reset_seconds,
                "message": f"Too many AI insight requests. Please try again in {reset_seconds // 60} minutes."
            }
        )

    # Record the request before calling LLM
    rate_limiter.record_request(ip, "insights")

    # Generate new insights
    insights = await llm_service.generate_insights(results, model_name=model)

    # Cache the insights
    if "insights_cache" not in job:
        job["insights_cache"] = {}
    job["insights_cache"][model] = insights

    return {
        "job_id": job_id,
        "model_used": model,
        "insights": insights,
        "cached": False
    }
