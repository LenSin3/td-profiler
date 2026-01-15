import pandas as pd
from typing import Dict, Any, List

def calculate_basic_stats(series: pd.Series, inferred_type: str) -> Dict[str, Any]:
    """
    Calculates basic stats based on the inferred type.
    """
    stats = {}

    if inferred_type in ["integer", "float"]:
        numeric_series = series.dropna()
        if not numeric_series.empty:
            stats = {
                "min": float(numeric_series.min()),
                "max": float(numeric_series.max()),
                "mean": float(numeric_series.mean()),
                "median": float(numeric_series.median()),
                "std": float(numeric_series.std()) if len(numeric_series) > 1 else 0
            }
    elif inferred_type == "string":
        string_series = series.dropna().astype(str)
        if not string_series.empty:
            lengths = string_series.str.len()
            stats = {
                "min_length": int(lengths.min()),
                "max_length": int(lengths.max()),
                "mean_length": float(lengths.mean())
            }

    return stats


def get_top_values(series: pd.Series, top_n: int = 10) -> List[Dict[str, Any]]:
    """
    Returns the top N most frequent values with their counts and percentages.
    Useful for categorical columns.
    """
    if series.empty:
        return []

    total = len(series)
    value_counts = series.value_counts().head(top_n)

    return [
        {
            "value": str(val) if pd.notna(val) else "(null)",
            "count": int(count),
            "percentage": round((count / total) * 100, 2)
        }
        for val, count in value_counts.items()
    ]
