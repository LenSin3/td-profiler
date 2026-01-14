from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse, StreamingResponse
from app.services.job_manager import job_manager
from datetime import datetime
import json
import io
import csv

router = APIRouter()


@router.get("/{job_id}")
async def get_report(
    job_id: str,
    format: str = Query("json", description="Export format: json, csv, or pdf")
):
    """
    Export profiling results in various formats.
    - json: Full profiling results as JSON
    - csv: Issues and column stats as CSV
    - pdf: Formatted PDF report (coming soon)
    """
    job = job_manager.get_job(job_id)
    if not job or job["status"] != "completed":
        raise HTTPException(status_code=404, detail="Job not found or not completed")

    result = job.get("result")
    if not result:
        raise HTTPException(status_code=500, detail="Job result missing")

    filename = job.get("filename", "profile")
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    if format == "json":
        return _export_json(result, filename, timestamp)
    elif format == "csv":
        return _export_csv(result, filename, timestamp)
    elif format == "pdf":
        return _export_pdf(result, filename, timestamp, job)
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported format: {format}")


def _export_json(result: dict, filename: str, timestamp: str) -> JSONResponse:
    """Export full profiling results as JSON."""
    return JSONResponse(
        content=result,
        headers={
            "Content-Disposition": f'attachment; filename="{filename}_profile_{timestamp}.json"'
        }
    )


def _export_csv(result: dict, filename: str, timestamp: str) -> StreamingResponse:
    """Export column statistics and issues as CSV."""
    output = io.StringIO()
    writer = csv.writer(output)

    # Header
    writer.writerow([
        "Column Name",
        "Type",
        "Semantic Type",
        "Null Count",
        "Null %",
        "Distinct Count",
        "Quality Score",
        "Issues"
    ])

    # Data rows
    for col in result.get("columns", []):
        issues = col.get("issues", [])
        # Handle both 'issue' and 'message' field names for compatibility
        issue_text = "; ".join([
            f"[{i.get('severity', 'info')}] {i.get('issue', i.get('message', ''))}"
            for i in issues
        ]) if issues else "None"

        # Handle semantic_type that might be None
        semantic_type = col.get("semantic_type") or ""

        writer.writerow([
            col.get("name", ""),
            col.get("inferred_type", ""),
            semantic_type,
            col.get("null_count", 0),
            f"{col.get('null_percentage', 0):.1f}%",
            col.get("distinct_count", 0),
            col.get("quality_score", 0),
            issue_text
        ])

    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode('utf-8-sig')),  # UTF-8 BOM for Excel compatibility
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}_profile_{timestamp}.csv"'
        }
    )


def _export_pdf(result: dict, filename: str, timestamp: str, job: dict) -> StreamingResponse:
    """Export formatted PDF report. Falls back to HTML if WeasyPrint unavailable."""
    html_content = _generate_html_report(result, filename, job)

    try:
        from weasyprint import HTML
        pdf_bytes = HTML(string=html_content).write_pdf()

        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}_report_{timestamp}.pdf"'
            }
        )
    except ImportError:
        # WeasyPrint not installed - return HTML instead
        return StreamingResponse(
            io.BytesIO(html_content.encode('utf-8')),
            media_type="text/html",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}_report_{timestamp}.html"'
            }
        )
    except Exception as e:
        # WeasyPrint failed (missing GTK etc) - return HTML instead
        return StreamingResponse(
            io.BytesIO(html_content.encode('utf-8')),
            media_type="text/html",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}_report_{timestamp}.html"'
            }
        )


def _generate_html_report(result: dict, filename: str, job: dict) -> str:
    """Generate HTML for PDF report."""
    summary = result.get("summary", {})
    columns = result.get("columns", [])
    insights_cache = job.get("insights_cache", {})

    # Get first cached insight if available
    insight = None
    for model, cached_insight in insights_cache.items():
        insight = cached_insight
        break

    columns_html = ""
    for col in columns:
        issues_html = ""
        for issue in col.get("issues", []):
            severity = issue.get("severity", "info")
            color = {"critical": "#ef4444", "warning": "#f59e0b", "info": "#3b82f6"}.get(severity, "#6b7280")
            issue_text = issue.get("issue", issue.get("message", ""))
            issues_html += f'<span style="color: {color}; font-size: 12px;">• {issue_text}</span><br/>'

        columns_html += f"""
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">{col.get("name", "")}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">{col.get("inferred_type", "")}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">{col.get("null_percentage", 0):.1f}%</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">{col.get("quality_score", 0)}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">{issues_html or "None"}</td>
        </tr>
        """

    insights_html = ""
    if insight:
        exec_summary = insight.get("executive_summary", "")
        if isinstance(exec_summary, dict):
            exec_summary = json.dumps(exec_summary)
        insights_html = f"""
        <div style="margin-top: 30px;">
            <h2 style="color: #1f2937;">AI Insights</h2>
            <p style="background: #f3f4f6; padding: 15px; border-radius: 8px;">{exec_summary}</p>
        </div>
        """

    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; color: #1f2937; }}
            h1 {{ color: #7c3aed; }}
            .summary-grid {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }}
            .summary-card {{ background: #f9fafb; padding: 15px; border-radius: 8px; text-align: center; }}
            .summary-value {{ font-size: 24px; font-weight: bold; color: #7c3aed; }}
            .summary-label {{ font-size: 12px; color: #6b7280; }}
            table {{ width: 100%; border-collapse: collapse; margin-top: 20px; }}
            th {{ background: #7c3aed; color: white; padding: 10px; text-align: left; }}
        </style>
    </head>
    <body>
        <h1>TD Profiler Report</h1>
        <p style="color: #6b7280;">File: {filename} | Generated: {datetime.now().strftime("%Y-%m-%d %H:%M")}</p>

        <div class="summary-grid">
            <div class="summary-card">
                <div class="summary-value">{summary.get("quality_score", 0)}</div>
                <div class="summary-label">Quality Score</div>
            </div>
            <div class="summary-card">
                <div class="summary-value">{summary.get("row_count", 0):,}</div>
                <div class="summary-label">Rows</div>
            </div>
            <div class="summary-card">
                <div class="summary-value">{summary.get("column_count", 0)}</div>
                <div class="summary-label">Columns</div>
            </div>
            <div class="summary-card">
                <div class="summary-value">{summary.get("duplicate_rows", 0)}</div>
                <div class="summary-label">Duplicates</div>
            </div>
        </div>

        <h2 style="margin-top: 30px;">Column Analysis</h2>
        <table>
            <thead>
                <tr>
                    <th>Column</th>
                    <th>Type</th>
                    <th>Null %</th>
                    <th>Score</th>
                    <th>Issues</th>
                </tr>
            </thead>
            <tbody>
                {columns_html}
            </tbody>
        </table>

        {insights_html}

        <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px;">
            Generated by TD Profiler | AI-Powered Data Quality Analysis
        </footer>
    </body>
    </html>
    """
