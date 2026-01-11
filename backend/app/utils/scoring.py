from typing import Dict, Any, List, Tuple

def calculate_column_score(column_data: Dict[str, Any]) -> Tuple[int, List[Dict[str, Any]]]:
    """
    Calculates a score (0-100) for a column and identifies issues.
    """
    score = 100
    issues = []
    
    # 1. Completeness (Nulls)
    null_pct = column_data.get("null_percentage", 0)
    if null_pct > 0:
        penalty = min(null_pct, 40) # Max 40 point penalty for nulls
        score -= penalty
        severity = "critical" if null_pct > 20 else "warning"
        issues.append({
            "severity": severity,
            "issue": f"{round(null_pct, 1)}% null values detected",
            "type": "completeness"
        })
        
    # 2. Validity (Outliers)
    outliers = column_data.get("outliers", {}).get("count", 0)
    total_rows = column_data.get("total_rows", 1) # Fallback to 1 to avoid div by zero
    if outliers > 0:
        outlier_pct = (outliers / total_rows) * 100
        penalty = min(outlier_pct * 2, 20) # Max 20 point penalty
        score -= penalty
        issues.append({
            "severity": "warning",
            "issue": f"{outliers} outliers detected",
            "type": "validity"
        })
        
    # 3. Consistency (Patterns)
    patterns = column_data.get("patterns", {}).get("top_patterns", [])
    if len(patterns) > 1:
        # If the top pattern covers less than 80% and there are other patterns, flag it
        top_pct = patterns[0].get("percentage", 100)
        if top_pct < 80:
            score -= 10
            issues.append({
                "severity": "info",
                "issue": f"Multiple structural patterns detected (top pattern: {top_pct}%)",
                "type": "consistency"
            })

    return max(0, int(score)), issues

def calculate_overall_score(column_scores: List[int], duplicate_rows: int, total_rows: int) -> Tuple[int, str]:
    """
    Calculates the aggregate dataset score and assigns a grade.
    """
    if not column_scores:
        return 0, "F"
        
    avg_col_score = sum(column_scores) / len(column_scores)
    
    # Penalty for duplicates
    dup_penalty = 0
    if total_rows > 0:
        dup_pct = (duplicate_rows / total_rows) * 100
        dup_penalty = min(dup_pct * 2, 10) # Max 10 point penalty
        
    final_score = max(0, int(avg_col_score - dup_penalty))
    
    # Assign grade
    if final_score >= 90: grade = "A"
    elif final_score >= 80: grade = "B"
    elif final_score >= 70: grade = "C"
    elif final_score >= 60: grade = "D"
    else: grade = "F"
    
    return final_score, grade
