import pandas as pd
import re
from typing import Dict, Any, List

def analyze_patterns(series: pd.Series) -> Dict[str, Any]:
    """
    Analyzes common string patterns in a column.
    Useful for identifying inconsistent formatting.
    """
    if series.dtype != 'object':
        return {}
        
    sample = series.dropna().astype(str).head(500)
    if sample.empty:
        return {}
        
    # Simplify strings to patterns (e.g., "abc-123" -> "aaa-999")
    def to_pattern(s):
        s = re.sub(r'[a-z]', 'a', s)
        s = re.sub(r'[A-Z]', 'A', s)
        s = re.sub(r'[0-9]', '9', s)
        return s
        
    patterns = sample.apply(to_pattern)
    pattern_counts = patterns.value_counts(normalize=True).head(5)
    
    return {
        "top_patterns": [
            {"pattern": p, "percentage": round(count * 100, 2)}
            for p, count in pattern_counts.items()
        ]
    }
