"""Veridian Corp IT Policies Knowledge Base (KB-01 through KB-10)
Codified according to Assignment 2 (Internal Service Agent) specifications.
"""
from typing import Dict, List, Any
from backend.models.schemas import Policy

POLICIES: Dict[str, Policy] = {
    "KB-01": Policy(
        id="KB-01",
        title="Password Reset & Account Lockout Protocol",
        category="Identity & Access Management",
        description="Guidelines for employee password resets, self-service recovery, and automated Active Directory account unlocking.",
        eligibility="All Veridian Corp employees, contractors, and affiliates.",
        approval_type="Automatic",
        sla_hours="Immediate (< 5 mins)",
        procedure=[
            "Direct user to self-service identity portal (https://id.veridian-corp.example).",
            "Verify user's identity status and check for account lockouts.",
            "If account is locked due to 5 or more failed login attempts, automatically execute Active Directory unlock tool.",
            "Reset failed attempt counters and notify user with temporary one-time passcode (OTP) instructions.",
            "Mark ticket as Resolved immediately upon unlock."
        ],
        automated_action="execute_ad_unlock",
        tags=["password", "reset", "lockout", "active directory", "login", "credentials", "account locked", "unlock"]
    ),
    "KB-02": Policy(
        id="KB-02",
        title="Corporate VPN Access Request Policy",
        category="Network & Connectivity",
        description="Provisioning and authorization requirements for Veridian Global GlobalProtect VPN tunnel access.",
        eligibility="Full-time employees receive automatic access; contractors require manager sign-off.",
        approval_type="Conditional (FTE: Automatic, Contractor: Manager Approval Required)",
        sla_hours="FTE: Immediate (< 1 hour), Contractor: 24 hours",
        procedure=[
            "Inspect requester profile role attribute.",
            "If employee is Full-Time (FTE): Auto-approve, provision GlobalProtect profile, and mark ticket Resolved.",
            "If employee is Contractor: Flag ticket for Manager Approval, dispatch authorization form to supervisor, and set ticket status to 'Pending Review'.",
            "Upon manager electronic signature, credentials and tunnel profile are pushed to device."
        ],
        automated_action="provision_vpn_access",
        tags=["vpn", "network", "remote access", "globalprotect", "contractor", "tunnel", "connect from home"]
    ),
    "KB-03": Policy(
        id="KB-03",
        title="Laptop Replacement & Hardware Refresh Policy",
        category="Hardware & Equipment",
        description="Standards governing workstation hardware refresh cycles, premature replacements, and hardware diagnostics.",
        eligibility="Employees with laptop deployment age >= 3 years (36 months) OR verified irreparable hardware failure.",
        approval_type="Conditional (Eligible: Auto-Approved with 2-wk lead, Ineligible: Escalated / Rejected)",
        sla_hours="2-3 Business Days (Provisioning requires 2 weeks advance notice)",
        procedure=[
            "Verify requester's device age in the asset management database.",
            "Check service tenure and hardware failure status.",
            "If device age >= 3.0 years: Approve replacement, allocate new standard corporate laptop (ThinkPad X1 / MacBook Pro), and schedule delivery with 2 weeks advance notice.",
            "If device age < 3.0 years and hardware failure is reported: Dispatch hardware diagnostic ticket to Tier 2 Desktop Support.",
            "If device age < 3.0 years without failure: Deny auto-approval, explain the 3-year refresh policy, and offer diagnostic assessment."
        ],
        automated_action="schedule_hardware_procurement",
        tags=["laptop", "computer", "hardware", "macbook", "thinkpad", "replacement", "refresh", "broken screen", "upgrade device"]
    ),
    "KB-04": Policy(
        id="KB-04",
        title="Software Installation & Catalog Governance",
        category="Applications & Productivity",
        description="Protocol for installing corporate catalog applications vs third-party non-catalog software.",
        eligibility="All active personnel with corporate-managed endpoints.",
        approval_type="Conditional (Catalog: Auto-Approved, Non-Catalog: IT Security Review 3-5 days)",
        sla_hours="Catalog: Immediate (< 15 mins), Non-Catalog: 3-5 Business Days",
        procedure=[
            "Check requested software against approved Veridian Software Catalog (Slack, VS Code, Zoom, Figma, Docker Desktop, Postman, Git, Chrome, Notion).",
            "If software is in catalog: Guide user to Company Portal / Self-Service Center for zero-touch install, or trigger MDM package push.",
            "If software is non-catalog: Create Security Review ticket, require business justification, dispatch request to IT Security & Compliance, set status to 'Pending Review' (SLA 3-5 days)."
        ],
        automated_action="trigger_software_push",
        tags=["software", "install", "application", "catalog", "slack", "vscode", "docker", "figma", "license", "third-party"]
    ),
    "KB-05": Policy(
        id="KB-05",
        title="Office Printer & Print Spooler Troubleshooting",
        category="Office Infrastructure & Printing",
        description="Standard operating procedure for network printers, stuck print queues, and spooler service remediation.",
        eligibility="All on-site office workers and hybrid staff in corporate facilities.",
        approval_type="Automatic",
        sla_hours="Spooler Restart: Immediate (< 5 mins), Field Tech Dispatch: 4 Hours",
        procedure=[
            "Agent initiates automated troubleshooting: inspect local print queue.",
            "Execute automated remote restart of the Windows Print Spooler service and clear corrupted print jobs.",
            "If printer is still unresponsive, request printer asset tag / floor location from user.",
            "Generate Tier 2 On-Site Facility Ticket with asset tag for physical inspection (toner, paper jam, network port)."
        ],
        automated_action="restart_print_spooler",
        tags=["printer", "print", "spooler", "stuck queue", "paper jam", "toner", "printing", "office printer"]
    ),
    "KB-06": Policy(
        id="KB-06",
        title="Exchange Mailbox Quota & Storage Management",
        category="Messaging & Collaboration",
        description="Thresholds for Outlook / Exchange mailbox storage and approval chains for quota expansion.",
        eligibility="All employees with corporate email mailboxes.",
        approval_type="Manager Approval Required (Increases 25GB -> 50GB)",
        sla_hours="24 Hours",
        procedure=[
            "Verify current mailbox utilization against default 25GB ceiling.",
            "If requested quota is up to 50GB: Flag for Direct Manager approval, route automated approval email to requester's manager, set status to 'Pending Review'.",
            "If requested quota exceeds 50GB: Require IT Director sign-off and recommend corporate online email archiving.",
            "Provide user with immediate inbox cleanup and PST archiving instructions."
        ],
        automated_action="request_mailbox_quota_approval",
        tags=["email", "mailbox", "quota", "storage", "outlook", "exchange", "inbox full", "size limit"]
    ),
    "KB-07": Policy(
        id="KB-07",
        title="Guest Wi-Fi Temporary Network Access",
        category="Network & Connectivity",
        description="Issuance of temporary internet access credentials for corporate visitors, clients, and interviewees.",
        eligibility="All external guests, clients, contractors, and visitors.",
        approval_type="Self-Service / No IT Ticket Needed",
        sla_hours="Immediate (< 1 minute)",
        procedure=[
            "Inform requester that Guest Wi-Fi access passes are valid for exactly 24 hours.",
            "Direct user to front-desk reception kiosk, or agent issues immediate 24-hour guest Wi-Fi voucher key on the spot.",
            "Remind requester that Guest Wi-Fi is isolated from internal production networks and does not require an IT support ticket.",
            "Auto-resolve or bypass ticketing queue with immediate passkey generation."
        ],
        automated_action="generate_guest_wifi_voucher",
        tags=["wifi", "guest", "visitor", "wireless", "internet access", "front desk", "passkey", "kiosk"]
    ),
    "KB-08": Policy(
        id="KB-08",
        title="Expense & Financial Software Access Routing",
        category="Corporate Financial Systems",
        description="Jurisdiction boundaries for Concur, Expensify, and corporate travel/expense systems.",
        eligibility="All corporate employees submitting travel or expense reports.",
        approval_type="Finance Department Routing (Not IT Central)",
        sla_hours="Immediate Redirect (< 5 mins)",
        procedure=[
            "Agent identifies request as financial software (Concur, Expensify, NetSuite, Coupa).",
            "Notify employee that expense management systems are owned and administered exclusively by the Corporate Finance Team, not Central IT.",
            "Provide direct contact: finance-systems@veridian-corp.example or Finance Help Desk portal.",
            "Redirect and close/resolve ticket with clear routing instructions."
        ],
        automated_action="redirect_to_finance",
        redirect_department="Corporate Finance & Accounting",
        redirect_email="finance-systems@veridian-corp.example",
        tags=["expense", "concur", "expensify", "finance", "receipts", "travel expense", "financial software", "corporate card"]
    ),
    "KB-09": Policy(
        id="KB-09",
        title="Security Incident & Phishing Escalation Protocol",
        category="Information Security & SecOps",
        description="Mandatory reporting procedure for suspected phishing emails, ransomware, malware, or compromised credentials.",
        eligibility="Mandatory for all corporate personnel upon discovering any security anomaly.",
        approval_type="Immediate Critical Escalation",
        sla_hours="Immediate (< 15 mins Critical SecOps Response)",
        procedure=[
            "Classify ticket with Critical priority immediately.",
            "Direct employee to NEVER forward the suspicious email, link, or attachment to teammates or distribution lists.",
            "Instruct user to report directly to security@veridian-corp.example or use the Outlook PhishAlarm button.",
            "Trigger automated SecOps SIEM incident alert and isolate affected endpoint if malware execution is suspected.",
            "Escalate ticket to Information Security Incident Response Team (Tier 3 Security)."
        ],
        automated_action="escalate_security_incident",
        redirect_email="security@veridian-corp.example",
        tags=["phishing", "security", "malware", "virus", "hacked", "suspicious email", "breach", "compromised", "incident"]
    ),
    "KB-10": Policy(
        id="KB-10",
        title="Work-From-Home (WFH) Equipment Allowance",
        category="Workplace & Remote Enablement",
        description="Eligibility rules and stipend provisions for remote ergonomic equipment and home office workstations.",
        eligibility="Employees designated as Remote who work off-site > 3 days per week (4 or 5 days/week).",
        approval_type="Manager Approval & Finance Processing",
        sla_hours="3-5 Business Days",
        procedure=[
            "Verify requester's work mode and remote days in profile.",
            "If remote days > 3 (4 or 5 days/week): Employee is eligible for the standard $750 Home Office Equipment Allowance.",
            "Route digital sign-off request to direct manager; once approved, request is automatically forwarded to Finance Accounts Payable for payroll disbursement.",
            "If remote days <= 3 (hybrid 1-3 days or in-office): Inform user they are not eligible for the full remote stipend, but can request standard peripherals (mouse, headset) via office supply desk.",
            "Set ticket status to 'Pending Review' for eligible requests, or Resolved/Closed with guidance for ineligible ones."
        ],
        automated_action="process_wfh_allowance",
        redirect_department="Finance Accounts Payable",
        tags=["wfh", "work from home", "remote", "allowance", "stipend", "monitor", "chair", "desk", "home office", "ergonomic"]
    )
}

STANDARD_CATALOG_SOFTWARE = [
    "Slack", "VS Code", "Visual Studio Code", "Zoom", "Figma", "Docker Desktop", 
    "Docker", "Postman", "Git", "Google Chrome", "Notion", "Node.js", "Python"
]
