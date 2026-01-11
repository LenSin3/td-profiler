import pandas as pd
import numpy as np

def infer_column_type(series: pd.Series) -> str:
    """
    Infers the data type of a pandas Series.
    """
    if pd.api.types.is_numeric_dtype(series):
        if pd.api.types.is_integer_dtype(series):
            return "integer"
        return "float"
    elif pd.api.types.is_datetime64_any_dtype(series):
        return "datetime"
    elif pd.api.types.is_bool_dtype(series):
        return "boolean"
    else:
        # Check if it could be a datetime stored as string
        try:
            pd.to_datetime(series.dropna().head(100), errors='raise')
            return "datetime"
        except:
            pass
        return "string"
