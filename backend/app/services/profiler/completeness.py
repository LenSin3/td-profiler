import pandas as pd
from typing import Dict, Union

def calculate_completeness(series: pd.Series) -> Dict[str, Union[int, float]]:
    """
    Calculates null counts and percentages.
    """
    total_count = len(series)
    null_count = series.isna().sum()
    null_percentage = (null_count / total_count) * 100 if total_count > 0 else 0
    
    # Detect empty strings explicitly if object type
    empty_string_count = 0
    if series.dtype == 'object':
        empty_string_count = (series == "").sum()
        
    return {
        "null_count": int(null_count),
        "null_percentage": float(null_percentage),
        "empty_string_count": int(empty_string_count)
    }
