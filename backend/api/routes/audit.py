"""Audit Logs API route for real-time observability into Agentic decisions."""
from fastapi import APIRouter, Query
from typing import List, Optional
from backend.models.schemas import AuditLog
from backend.agent.audit_logger import audit_logger

router = APIRouter(prefix="/api/v1/audit-logs", tags=["Audit Logs"])

@router.get("", response_model=List[AuditLog])
async def list_audit_logs(
    event_type: Optional[str] = Query(None, description="Filter by event type (e.g. THOUGHT, TOOL_EXEC, DECISION)"),
    ticket_id: Optional[str] = Query(None, description="Filter by related ticket ID"),
    trace_id: Optional[str] = Query(None, description="Filter by agent trace ID"),
    limit: int = Query(100, ge=1, le=500)
):
    """Retrieve real-time agentic reasoning steps and tool execution logs."""
    return audit_logger.get_logs(event_type=event_type, ticket_id=ticket_id, trace_id=trace_id, limit=limit)

@router.post("/clear")
async def clear_logs():
    """Reset audit logs to clean state."""
    audit_logger.clear_logs()
    return {"message": "Audit logs cleared successfully."}
