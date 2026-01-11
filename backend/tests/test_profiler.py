import pytest
import pandas as pd
from app.services.profiler.engine import profile_dataset
from app.utils.file_parser import parse_file
from app.services.profiler.outliers import detect_outliers
from app.utils.semantic_types import detect_semantic_type
from app.services.profiler.patterns import analyze_patterns

def test_profile_dataset():
    data = {
        'a': [1, 2, 3, None],
        'b': ['x', 'y', 'z', ''],
        'c': [1.1, 2.2, 3.3, 4.4]
    }
    df = pd.DataFrame(data)
    results = profile_dataset(df)
    
    assert results['summary']['row_count'] == 4
    assert results['summary']['column_count'] == 3
    
    # Check null counts
    a_col = next(c for c in results['columns'] if c['name'] == 'a')
    assert a_col['null_count'] == 1
    assert a_col['inferred_type'] == 'float' # Pandas converts int+None to float
    
    b_col = next(c for c in results['columns'] if c['name'] == 'b')
    assert b_col['inferred_type'] == 'string'

def test_parse_csv():
    content = b"id,name\n1,Alice\n2,Bob"
    df = parse_file(content, "test.csv")
    assert len(df) == 2
    assert list(df.columns) == ["id", "name"]

def test_outlier_detection():
    series = pd.Series([1, 2, 3, 4, 5, 100])
    outliers = detect_outliers(series)
    assert outliers['count'] == 1
    assert outliers['upper_bound'] < 100

def test_semantic_type_detection():
    emails = pd.Series(['test@example.com', 'admin@domain.org', 'invalid'])
    stype = detect_semantic_type(emails)
    assert stype == 'email'

def test_pattern_analysis():
    series = pd.Series(['ABC-123', 'XYZ-999', '123-ABC'])
    patterns = analyze_patterns(series)
    assert len(patterns['top_patterns']) > 0
    # Pattern for ABC-123 should be AAA-999
    found = any(p['pattern'] == 'AAA-999' for p in patterns['top_patterns'])
    assert found

def test_scoring_logic():
    data = {
        'clean': [1, 2, 3, 4, 5],
        'messy': [1, None, None, 4, 100] # Nulls and an outlier
    }
    df = pd.DataFrame(data)
    results = profile_dataset(df)
    
    clean_col = next(c for c in results['columns'] if c['name'] == 'clean')
    messy_col = next(c for c in results['columns'] if c['name'] == 'messy')
    
    assert clean_col['quality_score'] == 100
    assert messy_col['quality_score'] < 100
    assert 'quality_grade' in results['summary']
    assert results['issues_summary']['critical'] > 0 or results['issues_summary']['warning'] > 0
