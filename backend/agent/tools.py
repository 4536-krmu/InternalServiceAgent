"""Agent tools implementation for Veridian Corp IT Service Agent.
Tools execute specific operational tasks, lookups, and validations.
"""
from typing import Dict, Any, Optional, Tuple
import uuid
import random
from backend.agent.policies_kb import POLICIES, STANDARD_CATALOG_SOFTWARE
from backend.models.schemas import Policy, UserProfile

def tool_lookup_policy(query: str, category: Optional[str] = None) -> Optional[Policy]:
    """Search for the most relevant IT policy (KB-01 to KB-10) based on query and category."""
    query_lower = query.lower()
    
    # 1. Direct ID match (e.g. "KB-02")
    for pid, policy in POLICIES.items():
        if pid.lower() in query_lower:
            return policy

    # 2. Match by category keywords (ordered by specificity)
    priority_keywords = [
        ("expense", "KB-08"),
        ("concur", "KB-08"),
        ("expensify", "KB-08"),
        ("receipt", "KB-08"),
        ("phishing", "KB-09"),
        ("malware", "KB-09"),
        ("ransomware", "KB-09"),
        ("security incident", "KB-09"),
        ("suspicious", "KB-09"),
        ("home office", "KB-10"),
        ("allowance", "KB-10"),
        ("stipend", "KB-10"),
        ("wfh", "KB-10"),
        ("remote equipment", "KB-10"),
        ("guest wifi", "KB-07"),
        ("guest wi-fi", "KB-07"),
        ("visitor", "KB-07"),
        ("wifi", "KB-07"),
        ("wi-fi", "KB-07"),
        ("mailbox", "KB-06"),
        ("quota", "KB-06"),
        ("printer", "KB-05"),
        ("spooler", "KB-05"),
        ("laptop", "KB-03"),
        ("refresh", "KB-03"),
        ("hardware", "KB-03"),
        ("vpn", "KB-02"),
        ("password", "KB-01"),
        ("lockout", "KB-01"),
        ("unlock", "KB-01"),
        ("software", "KB-04"),
        ("install", "KB-04")
    ]

    if category:
        cat_lower = category.lower()
        for key, pid in priority_keywords:
            if key in cat_lower:
                return POLICIES[pid]

    # 3. Match by content and tags
    for pid, policy in POLICIES.items():
        for tag in policy.tags:
            if tag in query_lower:
                return policy

    # 4. Match in title/description
    for pid, policy in POLICIES.items():
        if policy.title.lower() in query_lower or policy.category.lower() in query_lower:
            return policy

    # Default to general IT catalog policy if unmatched
    return POLICIES.get("KB-04")

def tool_verify_employee_profile(profile: UserProfile, policy_id: str, context: Dict[str, Any]) -> Dict[str, Any]:
    """Validates employee eligibility and preconditions according to policy specifications."""
    result = {
        "eligible": True,
        "policy_id": policy_id,
        "employee_id": profile.id,
        "employee_name": profile.name,
        "role": profile.role,
        "checks_performed": []
    }

    if policy_id == "KB-01":
        # Password Reset / Lockout
        is_locked = profile.account_locked or profile.failed_login_attempts >= 5 or context.get("is_locked", False)
        result["account_locked"] = is_locked
        result["failed_attempts"] = max(profile.failed_login_attempts, 5 if is_locked else 0)
        result["checks_performed"].append("Checked Active Directory lockout status and failed attempt threshold")
        result["eligible"] = True

    elif policy_id == "KB-02":
        # Corporate VPN Access
        is_fte = profile.role == "Full-Time Employee"
        result["is_full_time"] = is_fte
        result["requires_manager_approval"] = not is_fte
        result["checks_performed"].append(f"Checked employee employment role: {profile.role}")
        result["eligible"] = True  # Both can apply, but contractor requires approval

    elif policy_id == "KB-03":
        # Laptop Replacement: eligible if >= 3.0 years or verified hardware failure
        tenure = context.get("tenure_years", profile.tenure_years)
        hardware_failure = context.get("hardware_failure", False)
        is_eligible = (tenure >= 3.0) or hardware_failure
        result["device_age_years"] = tenure
        result["hardware_failure_verified"] = hardware_failure
        result["threshold_met"] = tenure >= 3.0
        result["eligible"] = is_eligible
        result["checks_performed"].append(
            f"Evaluated device age ({tenure:.1f} yrs vs 3.0 yr rule) and hardware failure status ({hardware_failure})"
        )

    elif policy_id == "KB-04":
        # Software Installation
        software_name = context.get("software_name", "")
        is_catalog = any(cat_soft.lower() in software_name.lower() for cat_soft in STANDARD_CATALOG_SOFTWARE)
        result["software_name"] = software_name
        result["is_catalog_software"] = is_catalog
        result["requires_security_review"] = not is_catalog
        result["checks_performed"].append(f"Catalog database check for '{software_name}': {'Pre-approved' if is_catalog else 'Non-catalog'}")

    elif policy_id == "KB-05":
        # Printer Troubleshooting
        printer_tag = context.get("printer_asset_tag", "PRN-OFFICE-DEFAULT")
        result["printer_asset_tag"] = printer_tag
        result["checks_performed"].append(f"Checked network status for print device: {printer_tag}")

    elif policy_id == "KB-06":
        # Mailbox Quota: default 25GB, up to 50GB requires manager approval
        requested_gb = float(context.get("requested_quota_gb", 50.0))
        result["current_quota_gb"] = profile.mailbox_limit_gb
        result["requested_quota_gb"] = requested_gb
        result["requires_manager_approval"] = requested_gb <= 50.0
        result["requires_director_approval"] = requested_gb > 50.0
        result["checks_performed"].append(f"Evaluated requested quota {requested_gb}GB against 25GB standard ceiling")

    elif policy_id == "KB-07":
        # Guest Wi-Fi: immediate 24 hours voucher
        result["voucher_duration"] = "24 hours"
        result["checks_performed"].append("Self-service front-desk voucher eligibility verified")

    elif policy_id == "KB-08":
        # Expense Software: Finance ownership
        result["department_ownership"] = "Finance & Accounting"
        result["routing_required"] = True
        result["checks_performed"].append("Jurisdiction verified: Central IT out-of-scope; routed to Finance")

    elif policy_id == "KB-09":
        # Security Incident
        result["severity"] = "CRITICAL"
        result["quarantine_required"] = True
        result["forwarding_prohibited"] = True
        result["checks_performed"].append("SecOps protocol verification: Critical threat isolation activated")

    elif policy_id == "KB-10":
        # WFH Equipment: remote > 3 days
        remote_days = int(context.get("remote_days_per_week", profile.remote_days_per_week))
        is_eligible = remote_days > 3
        result["remote_days"] = remote_days
        result["threshold_met"] = is_eligible
        result["eligible"] = is_eligible
        result["stipend_amount"] = "$750 USD" if is_eligible else "$0 (Standard office accessories only)"
        result["checks_performed"].append(f"Checked remote days schedule: {remote_days} days/week (Threshold > 3 days)")

    return result

def tool_execute_ad_unlock(account_id: str, employee_name: str) -> Dict[str, Any]:
    """Executes Active Directory tool to unlock user account and clear lockout counter."""
    return {
        "tool": "execute_ad_unlock",
        "account_id": account_id,
        "employee": employee_name,
        "action": "Kerberos lockout flag cleared; BadPwdCount reset to 0",
        "status": "UNLOCKED",
        "temp_passcode_sent": True,
        "portal_url": "https://id.veridian-corp.example/recovery"
    }

def tool_provision_vpn_access(employee_id: str, role: str) -> Dict[str, Any]:
    """Configures GlobalProtect VPN gateway token or issues approval workflow."""
    if role == "Full-Time Employee":
        token = f"VPN-FTE-{uuid.uuid4().hex[:8].upper()}"
        return {
            "tool": "provision_vpn_access",
            "decision": "AUTO_APPROVED",
            "vpn_profile": "Veridian-Corp-Primary-Tunnel",
            "token": token,
            "gateway": "vpn.veridian-corp.example:443",
            "client_url": "https://software.veridian-corp.example/paloalto-globalprotect"
        }
    else:
        return {
            "tool": "provision_vpn_access",
            "decision": "MANAGER_APPROVAL_REQUIRED",
            "workflow_id": f"WF-VPN-{uuid.uuid4().hex[:6].upper()}",
            "notification": "Manager authorization form dispatched to contractor supervisor",
            "status": "PENDING_SIGNATURE"
        }

def tool_restart_print_spooler(printer_tag: str) -> Dict[str, Any]:
    """Restarts network print spooler service and flushes corrupt queue files."""
    return {
        "tool": "restart_print_spooler",
        "printer_tag": printer_tag,
        "service": "Windows Spooler Service (spoolsv.exe)",
        "jobs_purged": random.randint(1, 3),
        "status": "RESTARTED_NOMINAL",
        "next_step": "If issue persists, on-site technician will be dispatched with asset tag."
    }

def tool_generate_guest_wifi_voucher(guest_name: str) -> Dict[str, Any]:
    """Generates an instant 24-hour guest Wi-Fi passkey."""
    passkey = f"Veridian-{random.randint(100, 999)}-{random.randint(10, 99)}"
    return {
        "tool": "generate_guest_wifi_voucher",
        "ssid": "Veridian-Corp-Guest",
        "passkey": passkey,
        "validity": "24 Hours from generation",
        "kiosk_url": "https://visitor.veridian-corp.example",
        "no_ticket_required": True
    }

def tool_route_to_finance(service_name: str, requester_email: str) -> Dict[str, Any]:
    """Reroutes financial software access requests directly to Corporate Finance."""
    return {
        "tool": "route_to_finance",
        "target_department": "Corporate Finance & Accounting",
        "contact_email": "finance-systems@veridian-corp.example",
        "software_requested": service_name,
        "instructions": "Expense system licenses (Concur/Expensify) are managed by Finance Systems. Central IT cannot provision licenses for this tier.",
        "status": "TRANSFERRED"
    }

def tool_escalate_security_incident(details: str, requester_email: str) -> Dict[str, Any]:
    """Escalates phishing/malware threat to Infosec SIEM immediately with Critical priority."""
    incident_id = f"SEC-{random.randint(4000, 4999)}"
    return {
        "tool": "escalate_security_incident",
        "incident_id": incident_id,
        "priority": "CRITICAL",
        "secops_email": "security@veridian-corp.example",
        "alert_dispatched": "SecOps PagerDuty Incident Created",
        "advisory": "DO NOT forward suspicious email or attachments to teammates. Disconnect from corporate VPN if suspicious file was executed."
    }
