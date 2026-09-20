from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

class PriorityEnum(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"

class StatusEnum(str, Enum):
    IN_PROGRESS = "In Progress"
    PENDING_REVIEW = "Pending Review"
    RESOLVED = "Resolved"
    ESCALATED = "Escalated"
    CLOSED = "Closed"

class AuditEventType(str, Enum):
    THOUGHT = "THOUGHT"
    POLICY_CHECK = "POLICY_CHECK"
    PROFILE_CHECK = "PROFILE_CHECK"
    TOOL_EXEC = "TOOL_EXEC"
    DECISION = "DECISION"
    ESCALATION = "ESCALATION"

class UserProfile(BaseModel):
    id: str = "EMP-8041"
    name: str = "Sarah Chen"
    email: str = "sarah.chen@veridian-corp.example"
    department: str = "Cloud Infrastructure"
    role: str = "Full-Time Employee"  # "Full-Time Employee" or "Contractor"
    hire_date: str = "2023-02-15"
    tenure_years: float = 3.6
    work_mode: str = "Remote"  # "In-Office", "Hybrid", "Remote"
    remote_days_per_week: int = 4
    failed_login_attempts: int = 0
    account_locked: bool = False
    assigned_device: Dict[str, Any] = Field(default_factory=lambda: {
        "model": "ThinkPad X1 Carbon Gen 10",
        "serial": "VC-TP-88492",
        "deployed_date": "2023-03-01",
        "os": "Windows 11 Enterprise 23H2",
        "status": "Active"
    })
    mailbox_used_gb: float = 21.4
    mailbox_limit_gb: float = 25.0
    avatar_initials: str = "SC"

class AccountCreateRequest(BaseModel):
    name: str
    email: Optional[str] = None
    department: str = "Engineering"
    role: str = "Full-Time Employee"  # "Full-Time Employee" or "Contractor"
    tenure_years: float = 1.0
    work_mode: str = "Hybrid"
    remote_days_per_week: int = 2
    account_locked: bool = False
    device_model: Optional[str] = "ThinkPad T14 Gen 4"

class Policy(BaseModel):
    id: str  # KB-01, KB-02, ...
    title: str
    category: str
    description: str
    eligibility: str
    approval_type: str  # "Automatic", "Manager Approval Required", "Security Review", "Finance Transfer", "Self-Service"
    sla_hours: str
    procedure: List[str]
    automated_action: Optional[str] = None
    redirect_department: Optional[str] = None
    redirect_email: Optional[str] = None
    tags: List[str] = []

class AuditLog(BaseModel):
    id: str
    timestamp: str
    trace_id: str
    ticket_id: Optional[str] = None
    requester_name: str
    event_type: AuditEventType
    message: str
    tool_name: Optional[str] = None
    tool_input: Optional[Dict[str, Any]] = None
    tool_output: Optional[Dict[str, Any]] = None
    status: str = "SUCCESS"  # SUCCESS, WARNING, ESCALATED, REDIRECTED

class TicketAction(BaseModel):
    action: str  # "approve", "escalate", "resolve", "add_note"
    actor: str = "IT Service Agent"
    note: Optional[str] = None
    new_status: Optional[StatusEnum] = None

class Ticket(BaseModel):
    id: str
    title: str
    description: str
    category: str
    priority: PriorityEnum = PriorityEnum.MEDIUM
    status: StatusEnum = StatusEnum.IN_PROGRESS
    requester_id: str
    requester_name: str
    requester_email: str
    department: str
    policy_id: Optional[str] = None
    policy_title: Optional[str] = None
    created_at: str
    updated_at: str
    sla_deadline: str
    resolution_summary: Optional[str] = None
    reasoning_steps: List[str] = []
    actions_taken: List[Dict[str, Any]] = []
    notes: List[Dict[str, Any]] = []

class RequestSubmission(BaseModel):
    category: str
    title: str
    description: str
    priority: Optional[PriorityEnum] = PriorityEnum.MEDIUM
    context_data: Optional[Dict[str, Any]] = Field(default_factory=dict)
    requester_id: Optional[str] = None

class QuickQuerySubmission(BaseModel):
    query: str
    requester_id: Optional[str] = None

class AgentResponse(BaseModel):
    success: bool
    ticket: Optional[Ticket] = None
    decision: str
    status: StatusEnum
    policy_applied: Optional[str] = None
    policy_title: Optional[str] = None
    automated_actions_taken: List[str] = []
    reasoning_steps: List[str] = []
    audit_trace_id: str
    message: str
    next_steps: str
    redirect_info: Optional[Dict[str, str]] = None

class ServiceHealth(BaseModel):
    id: str
    name: str
    status: str  # "Operational", "Degraded", "Maintenance"
    latency_ms: int
    uptime: str
    description: str
