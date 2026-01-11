from typing import Dict, Any
import uuid

class JobManager:
    def __init__(self):
        self.jobs: Dict[str, Any] = {}

    def create_job(self, filename: str) -> str:
        job_id = str(uuid.uuid4())
        self.jobs[job_id] = {
            "job_id": job_id,
            "status": "processing",
            "filename": filename,
            "result": None
        }
        return job_id

    def update_job(self, job_id: str, status: str, result: Any = None):
        if job_id in self.jobs:
            self.jobs[job_id]["status"] = status
            if result:
                self.jobs[job_id]["result"] = result

    def get_job(self, job_id: str) -> Any:
        return self.jobs.get(job_id)

# Singleton instance
job_manager = JobManager()
