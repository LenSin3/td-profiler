import pandas as pd
import polars as pl
from typing import Union, Optional
import io

def parse_file(content: bytes, filename: str) -> Union[pd.DataFrame, pl.DataFrame, None]:
    """
    Parses file content into a dataframe based on file extension.
    Currently supports CSV, Excel, and JSON.
    """
    extension = filename.split(".")[-1].lower()
    file_obj = io.BytesIO(content)

    try:
        if extension == "csv":
            # For now using pandas, but can switch to polars for large files
            return pd.read_csv(file_obj)
        elif extension in ["xlsx", "xls"]:
            return pd.read_excel(file_obj)
        elif extension == "json":
            return pd.read_json(file_obj)
        else:
            return None
    except Exception as e:
        print(f"Error parsing file: {e}")
        return None
