import re
import pandas as pd
from typing import Optional

# Common regex patterns
PATTERNS = {
    "email": r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
    "url": r'^https?://(?:[-\w.]|(?:%[\da-fA-F]{2}))+',
    "phone": r'^\+?1?\d{9,15}$', # Simple phone regex
    "zipcode": r'^\d{5}(-\d{4})?$'
}

def detect_semantic_type(series: pd.Series) -> Optional[str]:
    """
    Attempts to identify a semantic type for a string series.
    Returns the type name if > 50% of non-null values match.
    """
    if series.dtype != 'object':
        return None
        
    sample = series.dropna().head(100).astype(str)
    if sample.empty:
        return None
        
    for type_name, pattern in PATTERNS.items():
        matches = sample.str.match(pattern).sum()
        if matches / len(sample) > 0.5:
            return type_name
            
    return None
