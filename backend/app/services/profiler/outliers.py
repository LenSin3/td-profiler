import pandas as pd
from typing import Dict, Any, Optional

def detect_outliers(series: pd.Series) -> Dict[str, Any]:
    """
    Detects outliers in a numeric series using IQR (Interquartile Range).
    """
    if not pd.api.types.is_numeric_dtype(series):
        return {"count": 0, "threshold": "N/A"}
        
    clean_series = series.dropna()
    if clean_series.empty:
        return {"count": 0, "threshold": "N/A"}
        
    q1 = clean_series.quantile(0.25)
    q3 = clean_series.quantile(0.75)
    iqr = q3 - q1
    
    lower_bound = q1 - 1.5 * iqr
    upper_bound = q3 + 1.5 * iqr
    
    outliers = clean_series[(clean_series < lower_bound) | (clean_series > upper_bound)]
    
    return {
        "count": int(len(outliers)),
        "lower_bound": float(lower_bound),
        "upper_bound": float(upper_bound),
        "threshold": "IQR * 1.5"
    }
