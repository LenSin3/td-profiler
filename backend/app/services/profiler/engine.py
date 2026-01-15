import pandas as pd
from app.services.profiler.type_inference import infer_column_type
from app.services.profiler.completeness import calculate_completeness
from app.services.profiler.statistics import calculate_basic_stats, get_top_values
from app.services.profiler.outliers import detect_outliers
from app.services.profiler.patterns import analyze_patterns
from app.utils.semantic_types import detect_semantic_type
from app.utils.scoring import calculate_column_score, calculate_overall_score
from typing import Dict, Any, List

def profile_dataset(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Runs full profiling on the provided dataframe.
    """
    total_rows = len(df)
    duplicate_rows = int(df.duplicated().sum())
    
    results = {
        "summary": {
            "row_count": total_rows,
            "column_count": len(df.columns),
            "memory_mb": float(df.memory_usage(deep=True).sum() / (1024 * 1024)),
            "duplicate_rows": duplicate_rows
        },
        "columns": [],
        "issues_summary": {"critical": 0, "warning": 0, "info": 0}
    }
    
    col_scores = []
    
    for col_name in df.columns:
        series = df[col_name]
        inferred_type = infer_column_type(series)
        semantic_type = detect_semantic_type(series)
        completeness = calculate_completeness(series)
        basic_stats = calculate_basic_stats(series, inferred_type)
        outliers = detect_outliers(series)
        patterns = analyze_patterns(series)
        
        # Calculate column score and identify issues
        col_data_for_scoring = {
            "null_percentage": completeness["null_percentage"],
            "outliers": outliers,
            "patterns": patterns,
            "total_rows": total_rows
        }
        col_score, col_issues = calculate_column_score(col_data_for_scoring)
        col_scores.append(col_score)
        
        # Update issues summary
        for issue in col_issues:
            results["issues_summary"][issue["severity"]] += 1
        
        distinct_count = int(series.nunique())
        is_unique = (distinct_count == total_rows)
        top_values = get_top_values(series)

        col_profile = {
            "name": col_name,
            "inferred_type": inferred_type,
            "semantic_type": semantic_type,
            "null_count": completeness["null_count"],
            "null_percentage": completeness["null_percentage"],
            "distinct_count": distinct_count,
            "is_unique": is_unique,
            "stats": basic_stats,
            "outliers": outliers,
            "patterns": patterns,
            "top_values": top_values,
            "quality_score": col_score,
            "issues": col_issues
        }
        results["columns"].append(col_profile)
        
    # Final overall score
    overall_score, quality_grade = calculate_overall_score(col_scores, duplicate_rows, total_rows)
    results["summary"]["quality_score"] = overall_score
    results["summary"]["quality_grade"] = quality_grade
    
    return results
