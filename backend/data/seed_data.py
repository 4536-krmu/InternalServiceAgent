"""Seed data for Veridian Corp IT Service Portal.
Provides realistic profiles for persona switching, initial tickets, and system health status.
"""
from datetime import datetime, timedelta
from typing import Dict, List
from backend.models.schemas import UserProfile, Ticket, AuditLog, ServiceHealth, PriorityEnum, StatusEnum, AuditEventType

DEFAULT_PROFILES: Dict[str, UserProfile] = {
    "EMP-8041": UserProfile(
        id="EMP-8041",
        name="Sarah Chen",
        email="sarah.chen@veridian-corp.example",
        department="Cloud Infrastructure",
        role="Full-Time Employee",
        hire_date="2023-02-15",
        tenure_years=3.6,
        work_mode="Remote",
        remote_days_per_week=4,
        failed_login_attempts=0,
        account_locked=False,
        assigned_device={
            "model": "ThinkPad X1 Carbon Gen 10",
            "serial": "VC-TP-88492",
            "deployed_date": "2023-03-01",
            "os": "Windows 11 Enterprise 23H2",
            "status": "Active (3.6 yrs old - Refresh Eligible)"
        },
        mailbox_used_gb=21.4,
        mailbox_limit_gb=25.0,
        avatar_initials="SC"
    ),
    "CON-4912": UserProfile(
        id="CON-4912",
        name="Alex Rivera",
        email="alex.rivera.ctr@veridian-corp.example",
        department="Quality Engineering",
        role="Contractor",
        hire_date="2025-11-01",
        tenure_years=0.8,
        work_mode="Hybrid",
        remote_days_per_week=2,
        failed_login_attempts=0,
        account_locked=False,
        assigned_device={
            "model": "Dell Latitude 5430",
            "serial": "VC-DL-19402",
            "deployed_date": "2025-11-05",
            "os": "Windows 11 Pro",
            "status": "Active"
        },
        mailbox_used_gb=8.2,
        mailbox_limit_gb=25.0,
        avatar_initials="AR"
    ),
    "EMP-3108": UserProfile(
        id="EMP-3108",
        name="David Kim",
        email="david.kim@veridian-corp.example",
        department="Brand Marketing",
        role="Full-Time Employee",
        hire_date="2025-06-10",
        tenure_years=1.2,
        work_mode="In-Office",
        remote_days_per_week=0,
        failed_login_attempts=0,
        account_locked=False,
        assigned_device={
            "model": "MacBook Pro 14 M3",
            "serial": "VC-MB-77120",
            "deployed_date": "2025-06-15",
            "os": "macOS Sonoma 14.5",
            "status": "Active (1.2 yrs old)"
        },
        mailbox_used_gb=14.5,
        mailbox_limit_gb=25.0,
        avatar_initials="DK"
    ),
    "EMP-9923": UserProfile(
        id="EMP-9923",
        name="Elena Rostova",
        email="elena.rostova@veridian-corp.example",
        department="Financial Planning & Analysis",
        role="Full-Time Employee",
        hire_date="2024-08-01",
        tenure_years=2.1,
        work_mode="Hybrid",
        remote_days_per_week=3,
        failed_login_attempts=5,
        account_locked=True,
        assigned_device={
            "model": "HP EliteBook 840 G9",
            "serial": "VC-HP-30491",
            "deployed_date": "2024-08-10",
            "os": "Windows 11 Enterprise",
            "status": "Locked Out"
        },
        mailbox_used_gb=18.9,
        mailbox_limit_gb=25.0,
        avatar_initials="ER"
    )
}

INITIAL_SERVICES_HEALTH: List[ServiceHealth] = [
    ServiceHealth(id="srv-1", name="Active Directory Identity Services", status="Operational", latency_ms=14, uptime="99.98%", description="Kerberos & LDAP Authentication Clusters"),
    ServiceHealth(id="srv-2", name="Palo Alto GlobalProtect VPN Gateway", status="Operational", latency_ms=28, uptime="99.95%", description="East & West Coast High-Availability Hubs"),
    ServiceHealth(id="srv-3", name="Exchange Online & Collaboration", status="Operational", latency_ms=32, uptime="99.99%", description="Microsoft 365 Exchange Hybrid Connector"),
    ServiceHealth(id="srv-4", name="Corporate Print Spooler Fleet", status="Degraded", latency_ms=85, uptime="98.70%", description="Building B 3rd Floor Spooler High Memory Usage"),
    ServiceHealth(id="srv-5", name="SecOps SIEM & Threat Isolation", status="Operational", latency_ms=19, uptime="100.0%", description="CrowdStrike Falcon & Splunk Core Engine"),
    ServiceHealth(id="srv-6", name="Jira ITSM & Service Desk Core", status="Operational", latency_ms=22, uptime="99.94%", description="Enterprise Ticketing Workflow Engine")
]

INITIAL_TICKETS: List[Ticket] = [
    Ticket(
        id="VER-1082",
        title="VPN Gateway access setup for remote sprint",
        description="Need standard VPN profile configured for accessing US-East staging VPC.",
        category="Corporate VPN Access",
        priority=PriorityEnum.MEDIUM,
        status=StatusEnum.RESOLVED,
        requester_id="EMP-8041",
        requester_name="Sarah Chen",
        requester_email="sarah.chen@veridian-corp.example",
        department="Cloud Infrastructure",
        policy_id="KB-02",
        policy_title="Corporate VPN Access Request Policy",
        created_at="2026-09-18 09:14:22",
        updated_at="2026-09-18 09:15:01",
        sla_deadline="2026-09-18 10:14:22",
        resolution_summary="Auto-approved under KB-02 for Full-Time Employee. GlobalProtect configuration profile automatically provisioned and pushed to endpoint.",
        reasoning_steps=[
            "Identified intent: Corporate VPN Access request.",
            "Retrieved policy KB-02: Full-Time employees receive automatic provisioning.",
            "Cross-referenced requester profile: Sarah Chen is Full-Time Employee (Tenure 3.6 yrs).",
            "Executed tool: provision_vpn_access() with profile 'US-East-Staging'.",
            "Updated ticket status to Resolved; dispatched connection guide."
        ],
        actions_taken=[
            {"action": "lookup_policy", "result": "KB-02 Matched"},
            {"action": "verify_profile", "result": "Role: Full-Time Employee - Approved"},
            {"action": "provision_vpn_access", "result": "Profile VC-VPN-PROD-29 configured"}
        ],
        notes=[
            {"author": "IT Service Agent", "timestamp": "2026-09-18 09:15:01", "text": "Automatic verification passed. Tunnel certificate generated."}
        ]
    ),
    Ticket(
        id="VER-1079",
        title="External QA Contractor VPN authorization",
        description="Requesting GlobalProtect VPN access for QA regression cycle on release branch.",
        category="Corporate VPN Access",
        priority=PriorityEnum.HIGH,
        status=StatusEnum.PENDING_REVIEW,
        requester_id="CON-4912",
        requester_name="Alex Rivera",
        requester_email="alex.rivera.ctr@veridian-corp.example",
        department="Quality Engineering",
        policy_id="KB-02",
        policy_title="Corporate VPN Access Request Policy",
        created_at="2026-09-19 11:30:10",
        updated_at="2026-09-19 11:31:05",
        sla_deadline="2026-09-20 11:30:10",
        resolution_summary="Requester verified as Contractor. Policy KB-02 stipulates contractors require manager electronic sign-off prior to network grant.",
        reasoning_steps=[
            "Analyzed request: VPN access for testing.",
            "Retrieved policy KB-02: Contractors require direct manager approval form.",
            "Checked profile CON-4912: Role is 'Contractor'.",
            "Dispatched electronic approval form to QA Director.",
            "Set ticket status to 'Pending Review' pending supervisor sign-off."
        ],
        actions_taken=[
            {"action": "lookup_policy", "result": "KB-02 Applied"},
            {"action": "verify_role", "result": "Contractor detected"},
            {"action": "dispatch_approval_request", "result": "Sent to manager: qa-lead@veridian-corp.example"}
        ],
        notes=[
            {"author": "IT Service Agent", "timestamp": "2026-09-19 11:31:05", "text": "Pending digital signature from QA department manager."}
        ]
    ),
    Ticket(
        id="VER-1075",
        title="Hardware replacement request - ThinkPad 3+ years in service",
        description="My laptop battery life is degraded to 40 minutes and trackpad is intermittently unresponsive. System was deployed in March 2023.",
        category="Laptop Replacement",
        priority=PriorityEnum.MEDIUM,
        status=StatusEnum.IN_PROGRESS,
        requester_id="EMP-8041",
        requester_name="Sarah Chen",
        requester_email="sarah.chen@veridian-corp.example",
        department="Cloud Infrastructure",
        policy_id="KB-03",
        policy_title="Laptop Replacement & Hardware Refresh Policy",
        created_at="2026-09-19 14:02:40",
        updated_at="2026-09-19 14:05:15",
        sla_deadline="2026-09-22 17:00:00",
        resolution_summary="Eligible for hardware refresh under KB-03 (Service tenure 3.6 years exceeds 3.0 year threshold). Procurement batch scheduled.",
        reasoning_steps=[
            "Request evaluated for workstation replacement.",
            "Applied KB-03: Requires >= 3 years tenure or verified unrecoverable hardware failure.",
            "Queried CMDB asset registry: ThinkPad X1 deployed 2023-03-01 (3.6 yrs). Eligibility confirmed.",
            "Initiated hardware provisioning order (Standard Spec: 32GB RAM, 1TB SSD).",
            "Scheduled fulfillment with standard 2-week delivery notice."
        ],
        actions_taken=[
            {"action": "check_asset_tenure", "result": "Deployed 3.6 years ago (Threshold: 3.0 yrs) -> ELIGIBLE"},
            {"action": "schedule_hardware_procurement", "result": "Order PO-9912 placed with hardware logistics"}
        ],
        notes=[
            {"author": "IT Service Agent", "timestamp": "2026-09-19 14:05:15", "text": "Hardware order placed. IT Depot provisioning scheduled for October 4th."}
        ]
    ),
    Ticket(
        id="VER-1068",
        title="SUSPICIOUS: Urgent Wire Transfer Request Email with .iso attachment",
        description="Received an email purporting to be from CEO asking for urgent invoice wire transfer with an attached zipped ISO file.",
        category="Security Incident Reporting",
        priority=PriorityEnum.CRITICAL,
        status=StatusEnum.ESCALATED,
        requester_id="EMP-3108",
        requester_name="David Kim",
        requester_email="david.kim@veridian-corp.example",
        department="Brand Marketing",
        policy_id="KB-09",
        policy_title="Security Incident & Phishing Escalation Protocol",
        created_at="2026-09-20 08:45:00",
        updated_at="2026-09-20 08:46:12",
        sla_deadline="2026-09-20 09:00:00",
        resolution_summary="Phishing/Malware threat flagged under KB-09. Ticket escalated immediately to Tier 3 SecOps Incident Response with Critical priority.",
        reasoning_steps=[
            "Analyzed threat vectors: Executive impersonation, wire transfer lure, ISO payload.",
            "Policy KB-09 activated: Immediate critical security response.",
            "Warning dispatched to employee: DO NOT forward email, DO NOT mount ISO.",
            "Triggered automated email gateway quarantine for malicious domain.",
            "Escalated incident to security@veridian-corp.example and SecOps on-call pager."
        ],
        actions_taken=[
            {"action": "lookup_policy", "result": "KB-09 Critical Phishing Rule Triggered"},
            {"action": "isolate_email_thread", "result": "Message quarantined across tenant"},
            {"action": "escalate_to_security", "result": "PagerDuty incident SEC-4019 paged to SecOps on-call"}
        ],
        notes=[
            {"author": "SecOps Bot", "timestamp": "2026-09-20 08:46:12", "text": "Threat IOC extracted and blocked at firewall gateway."}
        ]
    ),
    Ticket(
        id="VER-1061",
        title="Building 4 2nd Floor Color Printer Spooler jammed",
        description="Print job for marketing brochures stuck at 0% and blocking subsequent documents.",
        category="Printer Troubleshooting",
        priority=PriorityEnum.LOW,
        status=StatusEnum.RESOLVED,
        requester_id="EMP-3108",
        requester_name="David Kim",
        requester_email="david.kim@veridian-corp.example",
        department="Brand Marketing",
        policy_id="KB-05",
        policy_title="Office Printer & Print Spooler Troubleshooting",
        created_at="2026-09-17 15:20:10",
        updated_at="2026-09-17 15:22:45",
        sla_deadline="2026-09-17 19:20:10",
        resolution_summary="Automated spooler reset tool executed under KB-05. Corrupted job purged and print spooler service restarted successfully.",
        reasoning_steps=[
            "Evaluated print subsystem error.",
            "Applied KB-05: Step 1 initiates remote spooler service reboot and queue purge.",
            "Executed restart_print_spooler() targeting 'PRN-BLD4-FL2-CLR'.",
            "Queue cleared. Service restored and test beacon responded with HTTP 200.",
            "Auto-resolved ticket."
        ],
        actions_taken=[
            {"action": "lookup_policy", "result": "KB-05 Applied"},
            {"action": "restart_print_spooler", "result": "Spooler PID 1849 recycled; queue cleared"}
        ],
        notes=[
            {"author": "IT Service Agent", "timestamp": "2026-09-17 15:22:45", "text": "Print spooler service restarted. Queue returned to nominal operation."}
        ]
    )
]

INITIAL_AUDIT_LOGS: List[AuditLog] = [
    AuditLog(
        id="aud-001",
        timestamp="2026-09-20 08:45:02",
        trace_id="TRC-9921",
        ticket_id="VER-1068",
        requester_name="David Kim",
        event_type=AuditEventType.THOUGHT,
        message="Evaluating incoming submission: user reports urgent wire transfer email with suspicious ISO attachment. Identifying applicable policy.",
        status="SUCCESS"
    ),
    AuditLog(
        id="aud-002",
        timestamp="2026-09-20 08:45:04",
        trace_id="TRC-9921",
        ticket_id="VER-1068",
        requester_name="David Kim",
        event_type=AuditEventType.POLICY_CHECK,
        message="Matched KB-09 (Security Incident & Phishing Escalation Protocol). Rules require immediate escalation, priority Critical, and forwarding prohibition.",
        tool_name="lookup_policy",
        tool_input={"query": "urgent wire transfer email ISO attachment", "category": "Security Incident Reporting"},
        tool_output={"policy_id": "KB-09", "title": "Security Incident & Phishing Escalation Protocol", "sla": "Immediate (< 15 mins)"},
        status="SUCCESS"
    ),
    AuditLog(
        id="aud-003",
        timestamp="2026-09-20 08:45:06",
        trace_id="TRC-9921",
        ticket_id="VER-1068",
        requester_name="David Kim",
        event_type=AuditEventType.TOOL_EXEC,
        message="Triggered automated security alert to security@veridian-corp.example and initiated tenant-wide message quarantine.",
        tool_name="escalate_security_incident",
        tool_input={"threat_type": "phishing_impersonation", "sender_ip": "185.220.101.5", "quarantine": True},
        tool_output={"incident_id": "SEC-4019", "quarantined_copies": 4, "status": "ESCALATED"},
        status="ESCALATED"
    ),
    AuditLog(
        id="aud-004",
        timestamp="2026-09-20 08:45:10",
        trace_id="TRC-9921",
        ticket_id="VER-1068",
        requester_name="David Kim",
        event_type=AuditEventType.DECISION,
        message="Decision reached: Ticket VER-1068 created with priority CRITICAL and status ESCALATED. Employee advised never to forward suspicious email.",
        status="ESCALATED"
    ),
    AuditLog(
        id="aud-005",
        timestamp="2026-09-19 14:02:42",
        trace_id="TRC-8812",
        ticket_id="VER-1075",
        requester_name="Sarah Chen",
        event_type=AuditEventType.PROFILE_CHECK,
        message="Cross-referencing asset inventory: Deployed ThinkPad X1 deployed 2023-03-01. Current tenure is 3.6 years, exceeding the 3-year threshold.",
        tool_name="verify_employee_profile",
        tool_input={"employee_id": "EMP-8041", "check": "device_refresh_eligibility"},
        tool_output={"eligible": True, "device_age_years": 3.6, "minimum_required": 3.0},
        status="SUCCESS"
    )
]
