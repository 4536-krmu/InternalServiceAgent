"""Autonomous IT Support Agent Engine for Veridian Corp.
Executes an autonomous ReAct loop: Thought -> Policy Lookup -> Profile Verification -> Tool Action -> Decision.
"""
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
import uuid

from backend.models.schemas import (
    Ticket, UserProfile, AgentResponse, RequestSubmission, 
    PriorityEnum, StatusEnum, AuditEventType
)
from backend.agent.policies_kb import POLICIES, STANDARD_CATALOG_SOFTWARE
from backend.agent.tools import (
    tool_lookup_policy, tool_verify_employee_profile,
    tool_execute_ad_unlock, tool_provision_vpn_access,
    tool_restart_print_spooler, tool_generate_guest_wifi_voucher,
    tool_route_to_finance, tool_escalate_security_incident
)
from backend.agent.audit_logger import audit_logger

class AgentEngine:
    def __init__(self):
        pass

    def process_request(
        self,
        submission: RequestSubmission,
        profile: UserProfile
    ) -> AgentResponse:
        """Executes the autonomous agent reasoning and remediation loop."""
        trace_id = f"TRC-{uuid.uuid4().hex[:6].upper()}"
        ticket_id = f"VER-{uuid.uuid4().int % 9000 + 1000}"
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        reasoning_steps: List[str] = []
        actions_taken: List[Dict[str, Any]] = []
        automated_actions_summary: List[str] = []
        redirect_info: Optional[Dict[str, str]] = None

        # STEP 1: Formulate Initial Thought
        thought_msg = (
            f"Ingesting request from {profile.name} ({profile.role}, {profile.department}). "
            f"Category: '{submission.category}', Title: '{submission.title}'. "
            f"Evaluating applicable Veridian IT standard operating procedures."
        )
        reasoning_steps.append(f"Thought: {thought_msg}")
        audit_logger.log_event(
            trace_id=trace_id,
            requester_name=profile.name,
            event_type=AuditEventType.THOUGHT,
            message=thought_msg,
            ticket_id=ticket_id
        )

        # STEP 2: Policy Lookup Tool Call
        query_text = f"{submission.category} {submission.title} {submission.description}"
        matched_policy = tool_lookup_policy(query=query_text, category=submission.category)
        
        if not matched_policy:
            matched_policy = POLICIES["KB-04"]  # Default to software/catalog

        policy_check_msg = (
            f"Authoritative Policy Identified: [{matched_policy.id}] {matched_policy.title}. "
            f"Category: {matched_policy.category}. SLA: {matched_policy.sla_hours}. "
            f"Approval Type: {matched_policy.approval_type}."
        )
        reasoning_steps.append(f"Policy Verification: {policy_check_msg}")
        audit_logger.log_event(
            trace_id=trace_id,
            requester_name=profile.name,
            event_type=AuditEventType.POLICY_CHECK,
            message=policy_check_msg,
            ticket_id=ticket_id,
            tool_name="lookup_policy",
            tool_input={"query": query_text, "category": submission.category},
            tool_output={
                "policy_id": matched_policy.id,
                "title": matched_policy.title,
                "sla": matched_policy.sla_hours,
                "approval_type": matched_policy.approval_type
            }
        )

        # STEP 3: Profile & Preconditions Verification
        context = submission.context_data or {}
        profile_eval = tool_verify_employee_profile(profile, matched_policy.id, context)
        
        profile_check_msg = (
            f"Verified employee profile for {profile.name}. "
            f"Role: {profile.role}, Tenure: {profile.tenure_years} yrs, Remote Days: {profile.remote_days_per_week} d/wk. "
            f"Checks: {'; '.join(profile_eval.get('checks_performed', []))}."
        )
        reasoning_steps.append(f"Profile Check: {profile_check_msg}")
        audit_logger.log_event(
            trace_id=trace_id,
            requester_name=profile.name,
            event_type=AuditEventType.PROFILE_CHECK,
            message=profile_check_msg,
            ticket_id=ticket_id,
            tool_name="verify_employee_profile",
            tool_input={"employee_id": profile.id, "policy_id": matched_policy.id, "context": context},
            tool_output=profile_eval
        )

        # STEP 4: Tool Execution & Remediation Logic based on Assignment 2 Policies
        decision_str = ""
        status = StatusEnum.IN_PROGRESS
        priority = submission.priority or PriorityEnum.MEDIUM
        resolution_summary = ""
        next_steps = ""
        user_message = ""

        # --- KB-01: Password Reset & Account Lockout ---
        if matched_policy.id == "KB-01":
            is_locked = profile_eval.get("account_locked", False) or "locked" in query_text.lower()
            if is_locked:
                unlock_res = tool_execute_ad_unlock(profile.id, profile.name)
                actions_taken.append(unlock_res)
                automated_actions_summary.append("Active Directory Kerberos Lockout Flag Cleared")
                automated_actions_summary.append("BadPwdCount reset to 0")
                
                decision_str = "AUTO_RESOLVED_UNLOCKED"
                status = StatusEnum.RESOLVED
                resolution_summary = "Account detected locked after 5 failed attempts. Automated Active Directory unlock executed successfully."
                user_message = (
                    f"Hello {profile.name}, your account lockout has been automatically cleared in Active Directory! "
                    f"You may now log in using your standard credentials or visit the self-service portal (https://id.veridian-corp.example) "
                    f"to configure a new permanent password."
                )
                next_steps = "Proceed to https://id.veridian-corp.example/recovery if you require a one-time passcode."
                
                audit_logger.log_event(
                    trace_id=trace_id,
                    requester_name=profile.name,
                    event_type=AuditEventType.TOOL_EXEC,
                    message="Active Directory account unlock completed. Failed attempt counter cleared.",
                    ticket_id=ticket_id,
                    tool_name="execute_ad_unlock",
                    tool_input={"account_id": profile.id},
                    tool_output=unlock_res
                )
            else:
                decision_str = "SELF_SERVICE_GUIDANCE"
                status = StatusEnum.RESOLVED
                resolution_summary = "Self-service password reset guidance provided per KB-01."
                user_message = (
                    f"Hello {profile.name}, self-service password recovery is enabled for your account. "
                    f"Please navigate to the Veridian Identity Portal at https://id.veridian-corp.example to reset your credentials securely."
                )
                next_steps = "Follow the MFA prompt on your mobile authenticator to complete password reset."

        # --- KB-02: Corporate VPN Access ---
        elif matched_policy.id == "KB-02":
            vpn_res = tool_provision_vpn_access(profile.id, profile.role)
            actions_taken.append(vpn_res)
            
            if profile.role == "Full-Time Employee":
                decision_str = "AUTO_APPROVED_FTE"
                status = StatusEnum.RESOLVED
                automated_actions_summary.append(f"GlobalProtect VPN Profile provisioned: {vpn_res.get('token')}")
                resolution_summary = "Full-time employee automatically approved for GlobalProtect VPN access per KB-02."
                user_message = (
                    f"VPN Access Approved! As a Full-Time Employee, your Palo Alto GlobalProtect profile has been automatically configured. "
                    f"Gateway: {vpn_res.get('gateway')}. Tunnel token: {vpn_res.get('token')}."
                )
                next_steps = "Launch GlobalProtect on your machine and connect using single sign-on."
            else:
                decision_str = "PENDING_MANAGER_APPROVAL_CONTRACTOR"
                status = StatusEnum.PENDING_REVIEW
                automated_actions_summary.append("Contractor Manager Approval Workflow Dispatched")
                resolution_summary = "Contractor VPN request requires manager approval under KB-02. Digital authorization form sent to supervisor."
                user_message = (
                    f"Under policy KB-02, contractors require manager electronic sign-off before VPN tunnel credentials can be granted. "
                    f"An authorization request ({vpn_res.get('workflow_id')}) has been sent to your supervisor."
                )
                next_steps = "Notify your manager to sign the electronic authorization form. Your ticket will update automatically once signed."

        # --- KB-03: Laptop Replacement ---
        elif matched_policy.id == "KB-03":
            tenure = context.get("tenure_years", profile.tenure_years)
            hw_fail = context.get("hardware_failure", False) or "broken" in query_text.lower() or "failure" in query_text.lower()
            
            if tenure >= 3.0 or hw_fail:
                decision_str = "APPROVED_HARDWARE_REFRESH"
                status = StatusEnum.IN_PROGRESS
                automated_actions_summary.append("Hardware Provisioning Order Queued (2-Week Notice Period)")
                resolution_summary = (
                    f"Hardware refresh approved under KB-03. Criterion met: "
                    f"{'Device age ' + str(tenure) + ' yrs >= 3.0 yrs' if tenure >= 3.0 else 'Verified hardware defect'}."
                )
                user_message = (
                    f"Your laptop replacement request is approved! "
                    f"Based on your {tenure:.1f} years of device service, you are eligible for the standard 3-year hardware refresh. "
                    f"Per policy, hardware provisioning requires 2 weeks advance notice."
                )
                next_steps = "IT Depot logistics will ship your new machine within 10-14 business days with a prepaid return kit."
            else:
                decision_str = "INELIGIBLE_TENURE_ESCALATED"
                status = StatusEnum.PENDING_REVIEW
                priority = PriorityEnum.LOW
                resolution_summary = f"Device age is {tenure:.1f} years (under 3.0 years requirement). Ticket routed for diagnostic evaluation."
                user_message = (
                    f"Under Veridian Policy KB-03, workstations are eligible for standard replacement after 3.0 years of service. "
                    f"Your current device is {tenure:.1f} years old. Since no catastrophic hardware failure was documented, "
                    f"your ticket has been queued for Tier 2 Desktop diagnostic support."
                )
                next_steps = "A desktop technician can inspect your device for performance tune-ups or battery diagnostics."

        # --- KB-04: Software Installation ---
        elif matched_policy.id == "KB-04":
            soft_name = context.get("software_name", submission.title)
            is_cat = any(cat.lower() in soft_name.lower() for cat in STANDARD_CATALOG_SOFTWARE)
            
            if is_cat:
                decision_str = "AUTO_APPROVED_CATALOG_SOFTWARE"
                status = StatusEnum.RESOLVED
                automated_actions_summary.append(f"Self-Service package pushed for {soft_name}")
                resolution_summary = f"Pre-approved catalog software ({soft_name}) authorized for immediate self-install under KB-04."
                user_message = (
                    f"'{soft_name}' is an approved standard catalog application. "
                    f"You may install it immediately via the Veridian Company Portal / Self-Service Center."
                )
                next_steps = "Open Start Menu -> Company Portal -> Select application -> Click 'Install'."
            else:
                decision_str = "SECURITY_REVIEW_REQUIRED"
                status = StatusEnum.PENDING_REVIEW
                automated_actions_summary.append("IT Security & Compliance Review Workflow Created")
                resolution_summary = f"Non-catalog software '{soft_name}' submitted for IT Security assessment under KB-04 (SLA 3-5 days)."
                user_message = (
                    f"'{soft_name}' is not currently in the pre-approved standard software catalog. "
                    f"Per policy KB-04, third-party software requires IT Security and vulnerability review before deployment (SLA: 3-5 business days)."
                )
                next_steps = "SecOps will review vendor licensing and zero-day vulnerabilities before approval."

        # --- KB-05: Printer Troubleshooting ---
        elif matched_policy.id == "KB-05":
            printer_tag = context.get("printer_asset_tag", "PRN-OFFICE-DEFAULT")
            spool_res = tool_restart_print_spooler(printer_tag)
            actions_taken.append(spool_res)
            automated_actions_summary.append(f"Windows Print Spooler service restarted for {printer_tag}")
            automated_actions_summary.append("Corrupted printer queue jobs purged")
            
            decision_str = "AUTO_REMEDIATED_SPOOLER_RESET"
            status = StatusEnum.RESOLVED
            resolution_summary = "Automated spooler restart and corrupted print queue flush executed per KB-05."
            user_message = (
                f"Print spooler troubleshooting completed! The print spooler service has been restarted and stuck queue items cleared. "
                f"Please test sending your document again."
            )
            next_steps = "If printing still fails, reply with the physical printer asset tag to dispatch an on-site technician."

        # --- KB-06: Mailbox Quota ---
        elif matched_policy.id == "KB-06":
            req_gb = float(context.get("requested_quota_gb", 50.0))
            if req_gb <= 50.0:
                decision_str = "PENDING_MANAGER_APPROVAL_QUOTA"
                status = StatusEnum.PENDING_REVIEW
                automated_actions_summary.append(f"Manager Quota Approval Request sent for {req_gb}GB expansion")
                resolution_summary = f"Mailbox expansion request to {req_gb}GB forwarded for manager approval per KB-06."
                user_message = (
                    f"Standard mailbox quota is 25GB. Your requested expansion to {req_gb}GB requires Direct Manager approval under KB-06. "
                    f"An approval notice has been dispatched to your department manager."
                )
                next_steps = "Once your manager approves, Exchange Online will expand your quota within 24 hours."
            else:
                decision_str = "ESCALATED_DIRECTOR_APPROVAL"
                status = StatusEnum.PENDING_REVIEW
                priority = PriorityEnum.HIGH
                automated_actions_summary.append("IT Director & Compliance Review Triggered (>50GB)")
                resolution_summary = f"Mailbox expansion to {req_gb}GB exceeds 50GB limit. Requires IT Director sign-off and archiving audit."
                user_message = (
                    f"Requests exceeding 50GB require IT Director authorization and online archive enablement per KB-06."
                )
                next_steps = "Central IT will evaluate enabling Corporate Auto-Archiving for your mailbox."

        # --- KB-07: Guest Wi-Fi ---
        elif matched_policy.id == "KB-07":
            wifi_res = tool_generate_guest_wifi_voucher(profile.name)
            actions_taken.append(wifi_res)
            automated_actions_summary.append(f"Guest Wi-Fi 24-hr Voucher Generated: {wifi_res.get('passkey')}")
            
            decision_str = "AUTO_RESOLVED_GUEST_WIFI"
            status = StatusEnum.RESOLVED
            resolution_summary = "Issued 24-hour Guest Wi-Fi access voucher under KB-07. No permanent IT ticket needed."
            user_message = (
                f"Guest Wi-Fi passkey generated! SSID: '{wifi_res.get('ssid')}', Passkey: '{wifi_res.get('passkey')}'. "
                f"This access credential is valid for exactly 24 hours."
            )
            next_steps = "Connect to 'Veridian-Corp-Guest' and enter the passkey. Valid across all reception areas."

        # --- KB-08: Expense Software Access ---
        elif matched_policy.id == "KB-08":
            fin_res = tool_route_to_finance(submission.title, profile.email)
            actions_taken.append(fin_res)
            redirect_info = {
                "department": "Corporate Finance & Accounting",
                "email": "finance-systems@veridian-corp.example",
                "portal": "https://finance.veridian-corp.example/access"
            }
            automated_actions_summary.append("Request Transferred to Corporate Finance Department")
            
            decision_str = "REDIRECTED_TO_FINANCE"
            status = StatusEnum.RESOLVED
            resolution_summary = "Expense software access is managed by Finance Systems, not IT Central. Requester redirected per KB-08."
            user_message = (
                f"Notice: Expense and financial systems (such as Concur, Expensify, and Coupa) are managed directly by "
                f"Corporate Finance, not Central IT. Your inquiry has been routed to finance-systems@veridian-corp.example."
            )
            next_steps = "Please submit your licensing request directly to the Finance portal: https://finance.veridian-corp.example/access."

        # --- KB-09: Security Incident & Phishing ---
        elif matched_policy.id == "KB-09":
            sec_res = tool_escalate_security_incident(submission.description, profile.email)
            actions_taken.append(sec_res)
            priority = PriorityEnum.CRITICAL
            status = StatusEnum.ESCALATED
            automated_actions_summary.append(f"SecOps Incident {sec_res.get('incident_id')} Created - Critical SIEM Alert")
            automated_actions_summary.append("Threat domain isolated at email security gateway")
            
            decision_str = "CRITICAL_SECURITY_ESCALATION"
            resolution_summary = "Phishing/malware threat escalated immediately to SecOps Incident Response under KB-09. Prohibited from forwarding."
            user_message = (
                f"CRITICAL SECURITY ALERT: Your report has been escalated directly to the SecOps Incident Response Team. "
                f"IMPORTANT: DO NOT forward this email or attachment to colleagues under any circumstances. "
                f"Our automated security gateway is quarantining matching messages across the enterprise."
            )
            next_steps = "SecOps will analyze the headers. If you clicked any links or downloaded files, disconnect from the network immediately."

        # --- KB-10: Work-From-Home Equipment ---
        elif matched_policy.id == "KB-10":
            remote_days = int(context.get("remote_days_per_week", profile.remote_days_per_week))
            if remote_days > 3:
                decision_str = "ELIGIBLE_WFH_ALLOWANCE"
                status = StatusEnum.PENDING_REVIEW
                automated_actions_summary.append(f"Home Office Allowance ($750) routed for Manager & Finance Sign-off")
                resolution_summary = f"Eligible for $750 WFH equipment allowance (Remote schedule: {remote_days} days/week > 3 days) under KB-10."
                user_message = (
                    f"Eligibility Confirmed: As an employee working remotely {remote_days} days per week (>3 days threshold), "
                    f"you are eligible for the $750 corporate home office equipment allowance. "
                    f"Your request has been forwarded to your manager for sign-off, after which Finance will process disbursement."
                )
                next_steps = "After manager approval, submit equipment receipts through the Finance Expense Portal."
            else:
                decision_str = "INELIGIBLE_WFH_STIPEND"
                status = StatusEnum.RESOLVED
                resolution_summary = f"Remote days ({remote_days} d/wk) does not meet the >3 days threshold for the $750 WFH equipment stipend."
                user_message = (
                    f"Under policy KB-10, the $750 home office allowance is reserved for employees working remotely more than 3 days per week. "
                    f"Your profile indicates a {remote_days}-day remote schedule. You are eligible for standard in-office equipment and office peripherals."
                )
                next_steps = "Visit the local IT Supply Desk for standard accessories (keyboards, headsets, cables)."

        # STEP 5: Final Decision Logging
        decision_log = (
            f"Autonomous Agent Loop Completed. Final Status: {status.value}. Decision: {decision_str}. "
            f"Actions Taken: {', '.join(automated_actions_summary) or 'None'}. Ticket ID: {ticket_id}."
        )
        reasoning_steps.append(f"Decision: {decision_log}")
        
        audit_event_type = AuditEventType.ESCALATION if status == StatusEnum.ESCALATED else AuditEventType.DECISION
        audit_logger.log_event(
            trace_id=trace_id,
            requester_name=profile.name,
            event_type=audit_event_type,
            message=decision_log,
            ticket_id=ticket_id,
            status="ESCALATED" if status == StatusEnum.ESCALATED else "SUCCESS"
        )

        # Build Created Ticket
        sla_hours_val = 24
        if matched_policy.id in ["KB-01", "KB-07"]:
            sla_hours_val = 1
        elif matched_policy.id == "KB-09":
            sla_hours_val = 1
        elif matched_policy.id in ["KB-04", "KB-10"]:
            sla_hours_val = 72

        created_ticket = Ticket(
            id=ticket_id,
            title=submission.title,
            description=submission.description,
            category=matched_policy.title,
            priority=priority,
            status=status,
            requester_id=profile.id,
            requester_name=profile.name,
            requester_email=profile.email,
            department=profile.department,
            policy_id=matched_policy.id,
            policy_title=matched_policy.title,
            created_at=now_str,
            updated_at=now_str,
            sla_deadline=(datetime.now() + timedelta(hours=sla_hours_val)).strftime("%Y-%m-%d %H:%M:%S"),
            resolution_summary=resolution_summary,
            reasoning_steps=reasoning_steps,
            actions_taken=actions_taken,
            notes=[{
                "author": "Autonomous IT Agent",
                "timestamp": now_str,
                "text": f"Agent evaluated policy {matched_policy.id}: {decision_str}. {resolution_summary}"
            }]
        )

        return AgentResponse(
            success=True,
            ticket=created_ticket,
            decision=decision_str,
            status=status,
            policy_applied=matched_policy.id,
            policy_title=matched_policy.title,
            automated_actions_taken=automated_actions_summary,
            reasoning_steps=reasoning_steps,
            audit_trace_id=trace_id,
            message=user_message,
            next_steps=next_steps,
            redirect_info=redirect_info
        )

agent_engine = AgentEngine()
