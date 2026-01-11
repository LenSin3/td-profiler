from pydantic import BaseModel
from typing import Optional, List, Dict

class JobResponse(BaseModel):
    job_id: str
    status: str
    filename: str
    file_size_bytes: int
    estimated_time_sec: int
    progress_url: str

class ProfileSummary(BaseModel):
    quality_score: int
    quality_grade: str
    row_count: int
    column_count: int
    memory_mb: float
    duplicate_rows: int
    issues: Dict[str, int]

class ColumnProfile(BaseModel):
    name: str
    inferred_type: str
    semantic_type: Optional[str] = None
    null_count: int
    null_percentage: float
    distinct_count: int
    is_unique: bool
    is_potential_pk: bool
    quality_score: int

class ProfileResult(BaseModel):
    job_id: str
    status: str
    completed_at: Optional[str] = None
    summary: Optional[ProfileSummary] = None
    columns: Optional[List[ColumnProfile]] = None
