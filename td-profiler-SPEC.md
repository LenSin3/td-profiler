# TD Profiler - AI-Powered Data Quality Analyzer

## Overview

An interactive data quality profiling tool where users upload datasets (CSV, Excel, JSON) and receive comprehensive quality assessments with AI-generated insights, recommendations, and plain-English reports. Demonstrates data governance expertise and practical LLM application in data engineering workflows.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER INPUT                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Upload: data.csv (or select sample dataset)                        │    │
│  │  Options: Profile depth, focus areas, comparison baseline           │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            FRONTEND                                          │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    React Application                                  │   │
│  │                                                                        │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│  │  │   Upload    │  │  Overview   │  │  Column     │  │    AI       │  │   │
│  │  │   Zone      │  │  Dashboard  │  │  Deep Dive  │  │  Insights   │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │   │
│  │                                                                        │   │
│  │  ┌────────────────────────────────────────────────────────────────┐   │   │
│  │  │  Data Quality Score: 87/100                                    │   │   │
│  │  │  ████████████████████░░░░                                      │   │   │
│  │  └────────────────────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BACKEND API                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                        FastAPI Service                                │   │
│  │                                                                        │   │
│  │  POST /api/upload              → Upload file, start profiling job     │   │
│  │  GET  /api/profile/{job_id}    → Get profiling results                │   │
│  │  GET  /api/profile/{job_id}/column/{col}  → Column deep dive         │   │
│  │  GET  /api/insights/{job_id}   → AI-generated insights                │   │
│  │  GET  /api/report/{job_id}     → Download full report (PDF/MD)        │   │
│  │  GET  /api/samples             → List sample datasets                 │   │
│  │  WS   /api/profile/{job_id}/progress  → Real-time progress           │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Profiling Engine│  │   LLM Service   │  │  Report Gen     │
│                 │  │                 │  │                 │
│ • Type inference│  │ • Interpret     │  │ • PDF export    │
│ • Null analysis │  │   statistics    │  │ • Markdown      │
│ • Distributions │  │ • Generate      │  │ • JSON schema   │
│ • Cardinality   │  │   insights      │  │                 │
│ • Pattern detect│  │ • Recommend     │  │                 │
│ • Outliers      │  │   fixes         │  │                 │
│ • Duplicates    │  │ • Quality score │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PROFILING PIPELINE                                  │
│                                                                              │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐  │
│  │  Parse   │ → │  Infer   │ → │ Calculate│ → │  Detect  │ → │ Generate │  │
│  │  File    │   │  Schema  │   │  Stats   │   │ Anomalies│   │ Insights │  │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘  │
│       │              │              │              │              │         │
│       ▼              ▼              ▼              ▼              ▼         │
│    Pandas/       Type maps      Descriptive    Outliers,      LLM call     │
│    Polars        + semantics    + quality      patterns,      for NL       │
│                                 metrics        duplicates     summary      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| **Frontend** | React + TypeScript | Interactive dashboards |
| **Charts** | Recharts + D3.js | Distribution visualizations |
| **Backend** | FastAPI | Async processing, WebSocket support |
| **Profiling** | Pandas / Polars + custom | Fast stats, extensible |
| **LLM** | Claude Haiku / Sonnet | Insights + recommendations |
| **Report Gen** | WeasyPrint / ReportLab | PDF export |
| **File Handling** | python-multipart | Robust uploads |
| **Caching** | Redis | Job results, rate limiting |
| **Hosting** | Railway / Render | Handles compute spikes |

---

## Core Features

### MVP (v1.0)

1. **File Upload & Parsing**
   - Support CSV, Excel (.xlsx), JSON
   - Auto-detect encoding and delimiters
   - Handle files up to 50MB / 500K rows
   - Sample large files intelligently

2. **Data Quality Score**
   - Composite score (0-100) based on:
     - Completeness (null rates)
     - Validity (type conformance)
     - Uniqueness (duplicate detection)
     - Consistency (pattern adherence)
   - Color-coded health indicators

3. **Column-Level Profiling**
   - Type inference (semantic types: email, phone, URL, date, currency, etc.)
   - Null/empty analysis
   - Unique value counts and cardinality
   - Distribution visualization (histograms, frequency charts)
   - Min/max/mean/median/std for numerics
   - String length stats for text
   - Pattern detection (regex inference)
   - Sample values

4. **Dataset-Level Analysis**
   - Row count, column count
   - Memory footprint
   - Duplicate row detection
   - Correlation matrix for numerics
   - Missing data patterns (MCAR/MAR/MNAR hints)

5. **AI-Generated Insights**
   - Plain English summary of data quality
   - Issue prioritization (critical, warning, info)
   - Specific recommendations for each issue
   - Example: "Column 'email' has 12% null values concentrated in records where 'signup_source' is 'partner'. Consider checking partner data feed quality."

6. **Exportable Report**
   - PDF download with full analysis
   - Markdown for embedding in documentation
   - JSON schema export

### Future Enhancements (v2.0+)

- Compare two datasets (before/after, version diff)
- Time-based profiling (track quality over time)
- Custom rule definitions
- dbt integration (export as dbt tests)
- Great Expectations integration
- Pipeline integration (webhook on upload)
- Anomaly explanations with LLM

---

## Quality Metrics Calculated

### Completeness Metrics
| Metric | Description |
|--------|-------------|
| `null_count` | Count of NULL/None values |
| `null_percentage` | Percentage of nulls |
| `empty_string_count` | Empty strings (distinct from NULL) |
| `whitespace_only_count` | Strings with only whitespace |

### Validity Metrics
| Metric | Description |
|--------|-------------|
| `type_conformance` | % of values matching inferred type |
| `format_conformance` | % matching detected pattern (dates, emails) |
| `range_violations` | Values outside expected bounds |
| `invalid_values` | Known bad values (e.g., "N/A", "undefined") |

### Uniqueness Metrics
| Metric | Description |
|--------|-------------|
| `distinct_count` | Number of unique values |
| `cardinality_ratio` | distinct_count / total_count |
| `duplicate_rows` | Fully duplicated records |
| `potential_pk_columns` | Columns that could be primary keys |

### Consistency Metrics
| Metric | Description |
|--------|-------------|
| `pattern_entropy` | Variation in detected patterns |
| `cross_column_rules` | Logical relationships (e.g., start_date < end_date) |
| `referential_integrity` | If relationships detected |

### Timeliness Metrics
| Metric | Description |
|--------|-------------|
| `date_range` | Min/max dates in date columns |
| `freshness_indicator` | Days since most recent date |

---

## API Specification

### POST /api/upload

Upload file and start profiling job.

**Request:** Multipart form with file + options

**Response:**
```json
{
  "job_id": "prof_abc123",
  "status": "processing",
  "filename": "sales_data.csv",
  "file_size_bytes": 2456789,
  "estimated_time_sec": 15,
  "progress_url": "/api/profile/prof_abc123/progress"
}
```

---

### GET /api/profile/{job_id}

Get profiling results.

**Response:**
```json
{
  "job_id": "prof_abc123",
  "status": "completed",
  "completed_at": "2024-01-15T14:32:00Z",
  
  "summary": {
    "quality_score": 87,
    "quality_grade": "B+",
    "row_count": 45231,
    "column_count": 18,
    "memory_mb": 12.4,
    "duplicate_rows": 23,
    "issues": {
      "critical": 1,
      "warning": 3,
      "info": 5
    }
  },
  
  "completeness": {
    "overall_completeness": 0.94,
    "columns_with_nulls": 7,
    "most_incomplete_column": {
      "name": "phone",
      "null_percentage": 34.2
    }
  },
  
  "columns": [
    {
      "name": "customer_id",
      "inferred_type": "integer",
      "semantic_type": "identifier",
      "null_count": 0,
      "null_percentage": 0,
      "distinct_count": 45231,
      "is_unique": true,
      "is_potential_pk": true,
      "quality_score": 100
    },
    {
      "name": "email",
      "inferred_type": "string",
      "semantic_type": "email",
      "null_count": 5420,
      "null_percentage": 12.0,
      "distinct_count": 39811,
      "pattern": "^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$",
      "pattern_conformance": 0.96,
      "invalid_examples": ["not-an-email", "test@", "@@domain.com"],
      "quality_score": 72
    },
    {
      "name": "revenue",
      "inferred_type": "float",
      "semantic_type": "currency",
      "null_count": 120,
      "null_percentage": 0.3,
      "min": -500.0,
      "max": 125000.0,
      "mean": 1234.56,
      "median": 890.00,
      "std": 2456.78,
      "outlier_count": 47,
      "outlier_threshold": "IQR * 1.5",
      "quality_score": 91
    }
  ]
}
```

---

### GET /api/profile/{job_id}/column/{column_name}

Deep dive into specific column.

**Response:**
```json
{
  "column_name": "email",
  "inferred_type": "string",
  "semantic_type": "email",
  
  "basic_stats": {
    "count": 45231,
    "null_count": 5420,
    "null_percentage": 12.0,
    "empty_count": 15,
    "distinct_count": 39811
  },
  
  "string_stats": {
    "min_length": 5,
    "max_length": 64,
    "mean_length": 22.4,
    "most_common_lengths": [18, 20, 22, 24]
  },
  
  "pattern_analysis": {
    "detected_pattern": "^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$",
    "pattern_conformance": 0.96,
    "non_conforming_count": 1596,
    "domain_distribution": [
      {"domain": "gmail.com", "count": 15234, "percentage": 38.3},
      {"domain": "yahoo.com", "count": 8921, "percentage": 22.4},
      {"domain": "company.com", "count": 5632, "percentage": 14.2}
    ]
  },
  
  "quality_issues": [
    {
      "severity": "warning",
      "issue": "12% null values detected",
      "details": "Nulls concentrated in records where signup_source='partner'",
      "recommendation": "Review partner data feed for missing email requirements"
    },
    {
      "severity": "info",
      "issue": "1,596 emails don't match standard pattern",
      "details": "Common issues: missing TLD, double @, special characters",
      "examples": ["john@company", "test@@gmail.com", "user!name@domain.com"]
    }
  ],
  
  "sample_values": [
    "john.doe@gmail.com",
    "jane_smith@yahoo.com",
    "bob@company.com",
    null,
    "invalid-email"
  ],
  
  "distribution_data": {
    "type": "categorical",
    "top_values": [
      {"value": "john.doe@gmail.com", "count": 3},
      {"value": "support@company.com", "count": 2}
    ],
    "histogram": null
  }
}
```

---

### GET /api/insights/{job_id}

Get AI-generated insights.

**Response:**
```json
{
  "job_id": "prof_abc123",
  "generated_at": "2024-01-15T14:32:30Z",
  
  "executive_summary": "This sales dataset contains 45,231 records with generally good data quality (87/100). Three issues require attention before pipeline ingestion: high null rate in the 'phone' column, 47 revenue outliers that may indicate data entry errors, and 23 fully duplicate rows.",
  
  "issues": [
    {
      "id": "issue_1",
      "severity": "critical",
      "category": "completeness",
      "title": "Phone column has 34% missing values",
      "description": "The 'phone' column has 15,458 null values (34.2%). This significantly impacts any customer contact workflows.",
      "affected_column": "phone",
      "recommendation": "1) Determine if phone is required for your use case. 2) If required, implement validation at data entry. 3) Consider backfill strategy for historical records.",
      "impact": "Customer outreach campaigns will miss 1/3 of audience"
    },
    {
      "id": "issue_2",
      "severity": "warning",
      "category": "validity",
      "title": "Revenue column contains outliers and negative values",
      "description": "47 records have revenue values outside expected range. 12 records have negative revenue (possibly refunds not flagged separately).",
      "affected_column": "revenue",
      "recommendation": "1) Verify if negative values represent refunds - consider separate column. 2) Investigate outliers above $50,000 for data entry errors.",
      "impact": "Aggregate revenue calculations may be skewed"
    },
    {
      "id": "issue_3",
      "severity": "warning",
      "category": "uniqueness",
      "title": "23 fully duplicate rows detected",
      "description": "23 rows are exact duplicates across all columns. This suggests possible double-submission or ETL issues.",
      "recommendation": "1) Deduplicate before loading to warehouse. 2) Add unique constraint or dedupe logic to pipeline. 3) Investigate source of duplicates.",
      "impact": "Metrics will be inflated by ~0.05%"
    }
  ],
  
  "recommendations_by_priority": [
    {
      "priority": 1,
      "action": "Add deduplication step to pipeline",
      "effort": "Low",
      "impact": "High"
    },
    {
      "priority": 2,
      "action": "Implement email validation at ingestion",
      "effort": "Medium",
      "impact": "Medium"
    },
    {
      "priority": 3,
      "action": "Create separate refund column for negative revenue",
      "effort": "Medium",
      "impact": "Medium"
    }
  ],
  
  "pipeline_readiness": {
    "score": 72,
    "status": "Needs attention",
    "blockers": ["Duplicate rows should be resolved before production load"],
    "warnings": ["High null rate in phone may affect downstream processes"]
  },
  
  "suggested_dbt_tests": [
    "unique: customer_id",
    "not_null: customer_id, email, revenue",
    "accepted_values: status ['active', 'inactive', 'pending']",
    "relationships: customer_id -> customers.id"
  ]
}
```

---

### GET /api/report/{job_id}?format=pdf|md|json

Download full report.

**Response:** File download (PDF, Markdown, or JSON)

---

## LLM Integration

### Insight Generation Prompt

```
You are a data quality analyst. Given profiling statistics for a dataset, generate actionable insights.

PROFILING RESULTS:
{profiling_json}

Generate a response with:
1. Executive summary (2-3 sentences)
2. Prioritized list of issues (critical, warning, info)
3. Specific recommendations with effort/impact assessment
4. Pipeline readiness assessment
5. Suggested data tests (dbt format)

Focus on:
- Business impact of each issue
- Root cause hypotheses
- Concrete remediation steps
- Quick wins vs. long-term fixes

Tone: Professional, direct, actionable. Avoid jargon where possible.
```

### Quality Score Calculation

The LLM also helps calibrate scores by considering:
- Domain context (email nulls worse than middle_name nulls)
- Relationships between issues
- Severity of outliers relative to use case

---

## Directory Structure

```
td-profiler/
├── README.md
├── SPEC.md
├── docker-compose.yml
├── .env.example
│
├── backend/
│   ├── requirements.txt
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── routers/
│   │   │   ├── upload.py
│   │   │   ├── profile.py
│   │   │   ├── insights.py
│   │   │   └── report.py
│   │   ├── services/
│   │   │   ├── profiler/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── engine.py
│   │   │   │   ├── type_inference.py
│   │   │   │   ├── completeness.py
│   │   │   │   ├── validity.py
│   │   │   │   ├── uniqueness.py
│   │   │   │   ├── patterns.py
│   │   │   │   ├── outliers.py
│   │   │   │   └── statistics.py
│   │   │   ├── llm_insights.py
│   │   │   ├── report_generator.py
│   │   │   └── job_manager.py
│   │   ├── models/
│   │   │   ├── profile.py
│   │   │   ├── column.py
│   │   │   └── insight.py
│   │   └── utils/
│   │       ├── file_parser.py
│   │       ├── semantic_types.py
│   │       └── scoring.py
│   ├── sample_data/
│   │   ├── clean_dataset.csv
│   │   ├── messy_dataset.csv
│   │   └── sample_metadata.json
│   └── tests/
│       ├── test_profiler.py
│       ├── test_type_inference.py
│       └── test_insights.py
│
├── frontend/
│   ├── package.json
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── FileUploader.tsx
│   │   │   ├── QualityScore.tsx
│   │   │   ├── OverviewDashboard.tsx
│   │   │   ├── ColumnExplorer.tsx
│   │   │   ├── ColumnDetail.tsx
│   │   │   ├── DistributionChart.tsx
│   │   │   ├── InsightsPanel.tsx
│   │   │   ├── IssueCard.tsx
│   │   │   └── ReportDownload.tsx
│   │   ├── hooks/
│   │   │   ├── useProfile.ts
│   │   │   └── useWebSocket.ts
│   │   └── types/
│   │       └── index.ts
│   └── public/
│
└── scripts/
    ├── generate_sample_data.py
    └── benchmark_profiler.py
```

---

## Implementation Phases

### Phase 1: Core Profiler (Week 1)
- [ ] File parsing (CSV, Excel, JSON)
- [ ] Type inference engine
- [ ] Basic statistics calculation
- [ ] Null/completeness analysis

### Phase 2: Advanced Analysis (Week 2)
- [ ] Pattern detection
- [ ] Outlier detection
- [ ] Duplicate detection
- [ ] Semantic type inference (email, phone, etc.)

### Phase 3: Quality Scoring (Week 2)
- [ ] Composite score algorithm
- [ ] Per-column scoring
- [ ] Issue categorization (critical/warning/info)

### Phase 4: AI Insights (Week 3)
- [ ] LLM integration
- [ ] Insight generation prompts
- [ ] Recommendation engine
- [ ] Pipeline readiness assessment

### Phase 5: Frontend (Week 3-4)
- [ ] Upload interface
- [ ] Dashboard with quality score
- [ ] Column explorer with visualizations
- [ ] Insights panel

### Phase 6: Reports & Polish (Week 4)
- [ ] PDF report generation
- [ ] Markdown export
- [ ] dbt test suggestions
- [ ] Sample datasets for demo
- [ ] Embeddable version

---

## Cost Estimate

| Component | Service | Monthly Cost |
|-----------|---------|--------------|
| Compute | Railway Starter | ~$10 |
| LLM (insights) | Claude Haiku | ~$5 |
| Redis (jobs) | Railway Redis | ~$5 |
| **Total** | | **~$20/month** |

---

## Embedding Options

```html
<iframe 
  src="https://td-profiler.yourdomain.com/embed" 
  width="100%" 
  height="800"
  frameborder="0">
</iframe>
```

---

## Comparison with Existing Tools

| Feature | TD Profiler | Great Expectations | ydata-profiling |
|---------|-------------|-------------------|-----------------|
| **AI Insights** | ✅ Native | ❌ | ❌ |
| **Plain English Report** | ✅ | ❌ | Partial |
| **Web Interface** | ✅ Embeddable | ❌ | ❌ |
| **dbt Integration** | ✅ Suggested tests | ✅ | ❌ |
| **Setup Required** | None (web) | Python install | Python install |
| **Best For** | Quick assessment + AI insights | Production validation | EDA |

---

## Success Metrics

- **Upload conversion:** 70%+ of visitors upload a file or use sample
- **Insight quality:** Users rate insights as "helpful" 80%+ of time
- **Report downloads:** 30%+ of completed profiles download report
- **Time to value:** Under 30 seconds for most files
