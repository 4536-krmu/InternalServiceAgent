"""Automated API and Agentic Policy Compliance Test Suite.
Verifies all 10 IT policies (KB-01 to KB-10), persona switching, ticket lifecycle, and audit trail.
"""
import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.data.store import store

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_store():
    """Reset store before each test run for clean assertions."""
    store.reset_seed()

def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "online"

def test_get_policies():
    res = client.get("/api/v1/policies")
    assert res.status_code == 200
    policies = res.json()
    assert len(policies) == 10
    policy_ids = [p["id"] for p in policies]
    for i in range(1, 11):
        assert f"KB-{i:02d}" in policy_ids

def test_profile_and_persona_switch():
    # 1. Default profile should be Sarah Chen (FTE)
    res = client.get("/api/v1/profile")
    assert res.status_code == 200
    assert res.json()["name"] == "Sarah Chen"
    assert res.json()["role"] == "Full-Time Employee"

    # 2. Switch to Contractor Alex Rivera
    res_switch = client.post("/api/v1/profile/switch/CON-4912")
    assert res_switch.status_code == 200
    assert res_switch.json()["name"] == "Alex Rivera"
    assert res_switch.json()["role"] == "Contractor"

    # Verify active profile is now Alex Rivera
    res_active = client.get("/api/v1/profile")
    assert res_active.json()["id"] == "CON-4912"

def test_create_custom_account():
    res = client.post("/api/v1/profile/create", json={
        "name": "Maya Lin",
        "email": "maya.lin@veridian-corp.example",
        "department": "Security Architecture",
        "role": "Full-Time Employee",
        "tenure_years": 4.2,
        "work_mode": "Remote",
        "remote_days_per_week": 5,
        "account_locked": False,
        "device_model": "MacBook Pro 16 M3"
    })
    assert res.status_code == 200
    account = res.json()
    assert account["name"] == "Maya Lin"
    assert account["department"] == "Security Architecture"
    assert account["tenure_years"] == 4.2
    assert account["avatar_initials"] == "ML"
    assert account["assigned_device"]["model"] == "MacBook Pro 16 M3"

    # Verify active profile is now Maya Lin
    res_active = client.get("/api/v1/profile")
    assert res_active.json()["name"] == "Maya Lin"

def test_kb01_password_reset_and_lockout():
    # Elena Rostova is locked out
    client.post("/api/v1/profile/switch/EMP-9923")
    res = client.post("/api/v1/requests", json={
        "category": "Password Reset",
        "title": "Account locked after failed password attempts",
        "description": "I entered my password wrong 5 times and now my workstation says locked out.",
        "context_data": {"is_locked": True}
    })
    assert res.status_code == 200
    data = res.json()
    assert data["policy_applied"] == "KB-01"
    assert data["status"] == "Resolved"
    assert "Active Directory" in data["decision"] or "AUTO_RESOLVED_UNLOCKED" in data["decision"]
    assert any("Active Directory" in act for act in data["automated_actions_taken"])

def test_kb02_vpn_fte_vs_contractor():
    # 1. Full-time employee (Sarah Chen) should be auto-approved
    client.post("/api/v1/profile/switch/EMP-8041")
    res_fte = client.post("/api/v1/requests", json={
        "category": "Corporate VPN Access",
        "title": "Need VPN access for sprint tasks",
        "description": "Please grant GlobalProtect access."
    })
    assert res_fte.status_code == 200
    assert res_fte.json()["status"] == "Resolved"
    assert res_fte.json()["decision"] == "AUTO_APPROVED_FTE"

    # 2. Contractor (Alex Rivera) should require manager approval
    client.post("/api/v1/profile/switch/CON-4912")
    res_ctr = client.post("/api/v1/requests", json={
        "category": "Corporate VPN Access",
        "title": "Contractor VPN access needed",
        "description": "Need VPN for QA testing on internal staging."
    })
    assert res_ctr.status_code == 200
    assert res_ctr.json()["status"] == "Pending Review"
    assert "MANAGER_APPROVAL" in res_ctr.json()["decision"]

def test_kb03_laptop_replacement_tenure():
    # 1. Sarah Chen has 3.6 years tenure -> Eligible (> 3 years)
    client.post("/api/v1/profile/switch/EMP-8041")
    res_eligible = client.post("/api/v1/requests", json={
        "category": "Laptop Replacement",
        "title": "Requesting standard hardware refresh",
        "description": "My laptop is over 3 years old and battery is wearing down.",
        "context_data": {"tenure_years": 3.6}
    })
    assert res_eligible.status_code == 200
    assert res_eligible.json()["decision"] == "APPROVED_HARDWARE_REFRESH"
    assert any("2-Week Notice" in act or "Hardware Provisioning" in act for act in res_eligible.json()["automated_actions_taken"])

    # 2. Alex Rivera has 0.8 years tenure -> Ineligible without hardware failure
    client.post("/api/v1/profile/switch/CON-4912")
    res_ineligible = client.post("/api/v1/requests", json={
        "category": "Laptop Replacement",
        "title": "Want a new laptop",
        "description": "Can I upgrade to an M3 Max?",
        "context_data": {"tenure_years": 0.8, "hardware_failure": False}
    })
    assert res_ineligible.status_code == 200
    assert res_ineligible.json()["decision"] == "INELIGIBLE_TENURE_ESCALATED"

def test_kb04_software_installation_catalog_vs_noncatalog():
    # 1. Catalog software (VS Code) -> Auto-approved self-install
    res_cat = client.post("/api/v1/requests", json={
        "category": "Software Installation",
        "title": "Install VS Code",
        "description": "Need Visual Studio Code for Python development.",
        "context_data": {"software_name": "VS Code"}
    })
    assert res_cat.status_code == 200
    assert res_cat.json()["status"] == "Resolved"
    assert res_cat.json()["decision"] == "AUTO_APPROVED_CATALOG_SOFTWARE"

    # 2. Non-catalog software -> Security review required (3-5 days)
    res_noncat = client.post("/api/v1/requests", json={
        "category": "Software Installation",
        "title": "Install Custom Crypto Trading Tool",
        "description": "Need to install binary from an unverified GitHub repository.",
        "context_data": {"software_name": "CryptoTradingBotPro"}
    })
    assert res_noncat.status_code == 200
    assert res_noncat.json()["status"] == "Pending Review"
    assert res_noncat.json()["decision"] == "SECURITY_REVIEW_REQUIRED"

def test_kb05_printer_troubleshooting():
    res = client.post("/api/v1/requests", json={
        "category": "Printer Troubleshooting",
        "title": "Printer queue stuck on 2nd floor",
        "description": "Jobs are frozen in the spooler.",
        "context_data": {"printer_asset_tag": "PRN-BLD2-FL2"}
    })
    assert res.status_code == 200
    assert res.json()["policy_applied"] == "KB-05"
    assert res.json()["status"] == "Resolved"
    assert any("Print Spooler" in act for act in res.json()["automated_actions_taken"])

def test_kb06_mailbox_quota():
    res = client.post("/api/v1/requests", json={
        "category": "Mailbox Quota",
        "title": "Need mailbox quota increased",
        "description": "My 25GB mailbox is almost full.",
        "context_data": {"requested_quota_gb": 40.0}
    })
    assert res.status_code == 200
    assert res.json()["policy_applied"] == "KB-06"
    assert res.json()["status"] == "Pending Review"
    assert "MANAGER_APPROVAL" in res.json()["decision"]

def test_kb07_guest_wifi():
    res = client.post("/api/v1/requests", json={
        "category": "Guest Wi-Fi",
        "title": "Visiting client needs Wi-Fi code",
        "description": "Client arriving for 2pm conference."
    })
    assert res.status_code == 200
    assert res.json()["policy_applied"] == "KB-07"
    assert res.json()["status"] == "Resolved"
    assert any("Voucher Generated" in act for act in res.json()["automated_actions_taken"])

def test_kb08_expense_software_routing():
    res = client.post("/api/v1/requests", json={
        "category": "Expense Software Access",
        "title": "Need access to Concur for travel expense filing",
        "description": "Please grant me license for Concur expense reports."
    })
    assert res.status_code == 200
    assert res.json()["policy_applied"] == "KB-08"
    assert res.json()["decision"] == "REDIRECTED_TO_FINANCE"
    assert res.json()["redirect_info"]["email"] == "finance-systems@veridian-corp.example"

def test_kb09_security_incident_phishing():
    res = client.post("/api/v1/requests", json={
        "category": "Security Incident Reporting",
        "title": "Suspicious email offering gift cards with zip file",
        "description": "Looks like an executive impersonation phishing attempt."
    })
    assert res.status_code == 200
    assert res.json()["policy_applied"] == "KB-09"
    assert res.json()["status"] == "Escalated"
    assert "CRITICAL" in res.json()["decision"]
    assert any("SecOps" in act or "SIEM" in act for act in res.json()["automated_actions_taken"])

def test_kb10_wfh_equipment_allowance():
    # 1. Sarah Chen has 4 remote days (>3) -> Eligible for $750 stipend
    client.post("/api/v1/profile/switch/EMP-8041")
    res_eligible = client.post("/api/v1/requests", json={
        "category": "Work-From-Home Equipment",
        "title": "Requesting WFH equipment allowance",
        "description": "Need an external monitor and ergonomic chair for home office.",
        "context_data": {"remote_days_per_week": 4}
    })
    assert res_eligible.status_code == 200
    assert res_eligible.json()["decision"] == "ELIGIBLE_WFH_ALLOWANCE"
    assert res_eligible.json()["status"] == "Pending Review"

    # 2. Alex Rivera has 2 remote days (<=3) -> Ineligible for full stipend
    client.post("/api/v1/profile/switch/CON-4912")
    res_ineligible = client.post("/api/v1/requests", json={
        "category": "Work-From-Home Equipment",
        "title": "WFH stipend request",
        "description": "Can I get the $750 allowance?",
        "context_data": {"remote_days_per_week": 2}
    })
    assert res_ineligible.status_code == 200
    assert res_ineligible.json()["decision"] == "INELIGIBLE_WFH_STIPEND"

def test_ticket_actions():
    # Check ticket queue
    res = client.get("/api/v1/tickets")
    assert res.status_code == 200
    tickets = res.json()
    assert len(tickets) > 0
    test_ticket = tickets[0]

    # Perform action: add note
    res_act = client.post(f"/api/v1/tickets/{test_ticket['id']}/action", json={
        "action": "add_note",
        "actor": "Lead Architect",
        "note": "Reviewed by IT Operations."
    })
    assert res_act.status_code == 200
    updated = res_act.json()
    assert any(n["text"] == "Reviewed by IT Operations." for n in updated["notes"])

def test_audit_logs_realtime():
    res = client.get("/api/v1/audit-logs")
    assert res.status_code == 200
    logs = res.json()
    assert len(logs) > 0
    event_types = set(log["event_type"] for log in logs)
    assert "THOUGHT" in event_types or "POLICY_CHECK" in event_types
