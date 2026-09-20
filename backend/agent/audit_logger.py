"""Audit Logger module for Veridian Corp IT Service Agent.
Maintains structured execution traces, tool call logs, and decision rationale.
"""
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
from backend.models.schemas import AuditLog, AuditEventType
from backend.data.seed_data import INITIAL_AUDIT_LOGS

class AuditLogger:
    def __init__(self):
        self._logs: List[AuditLog] = list(INITIAL_AUDIT_LOGS)

    def log_event(
        self,
        trace_id: str,
        requester_name: str,
        event_type: AuditEventType,
        message: str,
        ticket_id: Optional[str] = None,
        tool_name: Optional[str] = None,
        tool_input: Optional[Dict[str, Any]] = None,
        tool_output: Optional[Dict[str, Any]] = None,
        status: str = "SUCCESS"
    ) -> AuditLog:
        entry = AuditLog(
            id=f"aud-{uuid.uuid4().hex[:6]}",
            timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            trace_id=trace_id,
            ticket_id=ticket_id,
            requester_name=requester_name,
            event_type=event_type,
            message=message,
            tool_name=tool_name,
            tool_input=tool_input,
            tool_output=tool_output,
            status=status
        )
        self._logs.insert(0, entry)  # Prepend to display newest first
        return entry

    def get_logs(
        self,
        event_type: Optional[str] = None,
        ticket_id: Optional[str] = None,
        trace_id: Optional[str] = None,
        limit: int = 100
    ) -> List[AuditLog]:
        results = self._logs
        if event_type and event_type != "ALL":
            results = [log for log in results if log.event_type.value == event_type or log.event_type == event_type]
        if ticket_id:
            results = [log for log in results if log.ticket_id and ticket_id.lower() in log.ticket_id.lower()]
        if trace_id:
            results = [log for log in results if log.trace_id == trace_id]
        return results[:limit]

    def clear_logs(self):
        self._logs.clear()

audit_logger = AuditLogger()
