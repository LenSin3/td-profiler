from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import uuid
import threading

class JobManager:
    """
    In-memory job storage with automatic expiration.
    Jobs expire after 1 hour to free up memory.
    """

    def __init__(self, expiration_minutes: int = 60):
        self.jobs: Dict[str, Any] = {}
        self.expiration_minutes = expiration_minutes
        self.lock = threading.Lock()

    def create_job(self, filename: str) -> str:
        job_id = str(uuid.uuid4())
        with self.lock:
            # Clean up expired jobs on each create
            self._cleanup_expired()

            self.jobs[job_id] = {
                "job_id": job_id,
                "status": "processing",
                "filename": filename,
                "result": None,
                "created_at": datetime.now(),
                "insights_cache": {}
            }
        return job_id

    def update_job(self, job_id: str, status: str, result: Any = None):
        with self.lock:
            if job_id in self.jobs:
                self.jobs[job_id]["status"] = status
                if result:
                    self.jobs[job_id]["result"] = result

    def get_job(self, job_id: str) -> Optional[Dict[str, Any]]:
        with self.lock:
            job = self.jobs.get(job_id)
            if job and self._is_expired(job):
                del self.jobs[job_id]
                return None
            return job

    def _is_expired(self, job: Dict[str, Any]) -> bool:
        """Check if a job has expired."""
        created_at = job.get("created_at")
        if not created_at:
            return False
        expiration_time = created_at + timedelta(minutes=self.expiration_minutes)
        return datetime.now() > expiration_time

    def _cleanup_expired(self):
        """Remove all expired jobs."""
        expired_ids = [
            job_id for job_id, job in self.jobs.items()
            if self._is_expired(job)
        ]
        for job_id in expired_ids:
            del self.jobs[job_id]

    def get_stats(self) -> Dict[str, Any]:
        """Get statistics about current jobs (for monitoring)."""
        with self.lock:
            self._cleanup_expired()
            return {
                "total_jobs": len(self.jobs),
                "jobs_by_status": {
                    status: sum(1 for j in self.jobs.values() if j["status"] == status)
                    for status in ["processing", "completed", "failed"]
                }
            }


# Singleton instance
job_manager = JobManager(expiration_minutes=60)
