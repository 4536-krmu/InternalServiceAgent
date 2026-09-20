"""In-memory data store for tickets, profiles, and state management.
Provides thread-safe operations and seeding capabilities.
"""
from typing import Dict, List, Optional
import copy
from backend.models.schemas import Ticket, UserProfile, ServiceHealth, StatusEnum, TicketAction, AccountCreateRequest
from backend.data.seed_data import DEFAULT_PROFILES, INITIAL_TICKETS, INITIAL_SERVICES_HEALTH
from backend.agent.audit_logger import audit_logger

class DataStore:
    def __init__(self):
        self.profiles: Dict[str, UserProfile] = copy.deepcopy(DEFAULT_PROFILES)
        self.active_profile_id: str = "EMP-8041"  # Default: Sarah Chen
        self.tickets: Dict[str, Ticket] = {t.id: copy.deepcopy(t) for t in INITIAL_TICKETS}
        self.services_health: List[ServiceHealth] = copy.deepcopy(INITIAL_SERVICES_HEALTH)

    def get_active_profile(self) -> UserProfile:
        return self.profiles.get(self.active_profile_id, list(self.profiles.values())[0])

    def set_active_profile(self, profile_id: str) -> Optional[UserProfile]:
        if profile_id in self.profiles:
            self.active_profile_id = profile_id
            return self.profiles[profile_id]
        return None

    def update_profile(self, profile_data: dict) -> UserProfile:
        current = self.get_active_profile()
        updated_dict = current.model_dump()
        for k, v in profile_data.items():
            if k in updated_dict and v is not None:
                updated_dict[k] = v
        updated_profile = UserProfile(**updated_dict)
        self.profiles[updated_profile.id] = updated_profile
        return updated_profile

    def create_profile(self, req: AccountCreateRequest) -> UserProfile:
        import random
        from datetime import datetime, timedelta
        
        prefix = "CON" if req.role == "Contractor" else "EMP"
        new_id = f"{prefix}-{random.randint(1000, 9999)}"
        clean_name = req.name.strip()
        parts = clean_name.split()
        initials = "".join(p[0].upper() for p in parts[:2]) if parts else "US"
        
        email = req.email.strip() if req.email else f"{clean_name.lower().replace(' ', '.')}@veridian-corp.example"
        
        hire_dt = datetime.now() - timedelta(days=int(req.tenure_years * 365.25))
        hire_str = hire_dt.strftime("%Y-%m-%d")
        
        new_profile = UserProfile(
            id=new_id,
            name=clean_name,
            email=email,
            department=req.department,
            role=req.role,
            hire_date=hire_str,
            tenure_years=round(float(req.tenure_years), 1),
            work_mode=req.work_mode,
            remote_days_per_week=req.remote_days_per_week,
            failed_login_attempts=5 if req.account_locked else 0,
            account_locked=req.account_locked,
            assigned_device={
                "model": req.device_model or "Corporate ThinkPad T14",
                "serial": f"VC-{random.randint(10000, 99999)}",
                "deployed_date": hire_str,
                "os": "Windows 11 Enterprise",
                "status": "Locked Out" if req.account_locked else "Active"
            },
            mailbox_used_gb=round(random.uniform(5.0, 22.0), 1),
            mailbox_limit_gb=25.0,
            avatar_initials=initials
        )
        self.profiles[new_id] = new_profile
        self.active_profile_id = new_id
        return new_profile

    def get_tickets(
        self,
        status: Optional[str] = None,
        category: Optional[str] = None,
        search: Optional[str] = None,
        priority: Optional[str] = None
    ) -> List[Ticket]:
        # Return sorted by creation date descending
        ticket_list = list(self.tickets.values())
        ticket_list.sort(key=lambda t: t.created_at, reverse=True)

        filtered = []
        for t in ticket_list:
            if status and status.lower() != "all":
                if t.status.value.lower() != status.lower() and t.status.lower() != status.lower():
                    continue
            if category and category.lower() != "all":
                if category.lower() not in t.category.lower():
                    continue
            if priority and priority.lower() != "all":
                if t.priority.value.lower() != priority.lower() and t.priority.lower() != priority.lower():
                    continue
            if search:
                s_lower = search.lower()
                matches = (
                    s_lower in t.id.lower() or
                    s_lower in t.title.lower() or
                    s_lower in t.description.lower() or
                    s_lower in t.requester_name.lower() or
                    (t.policy_id and s_lower in t.policy_id.lower())
                )
                if not matches:
                    continue
            filtered.append(t)
        return filtered

    def get_ticket(self, ticket_id: str) -> Optional[Ticket]:
        return self.tickets.get(ticket_id)

    def add_ticket(self, ticket: Ticket) -> Ticket:
        self.tickets[ticket.id] = ticket
        return ticket

    def apply_ticket_action(self, ticket_id: str, action: TicketAction) -> Optional[Ticket]:
        ticket = self.tickets.get(ticket_id)
        if not ticket:
            return None

        from datetime import datetime
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        ticket.updated_at = now_str

        if action.action == "approve":
            ticket.status = StatusEnum.RESOLVED
            ticket.resolution_summary = f"Approved by {action.actor}. Workflow fulfilled."
        elif action.action == "escalate":
            ticket.status = StatusEnum.ESCALATED
            ticket.resolution_summary = f"Escalated to Tier 2/3 Specialist by {action.actor}."
        elif action.action == "resolve":
            ticket.status = StatusEnum.RESOLVED
            ticket.resolution_summary = f"Marked as Resolved by {action.actor}."
        elif action.action == "reopen":
            ticket.status = StatusEnum.IN_PROGRESS
        
        if action.new_status:
            ticket.status = action.new_status

        if action.note:
            ticket.notes.append({
                "author": action.actor,
                "timestamp": now_str,
                "text": action.note
            })

        return ticket

    def reset_seed(self):
        self.profiles = copy.deepcopy(DEFAULT_PROFILES)
        self.active_profile_id = "EMP-8041"
        self.tickets = {t.id: copy.deepcopy(t) for t in INITIAL_TICKETS}
        self.services_health = copy.deepcopy(INITIAL_SERVICES_HEALTH)
        audit_logger.clear_logs()
        from backend.data.seed_data import INITIAL_AUDIT_LOGS
        for log in INITIAL_AUDIT_LOGS:
            audit_logger._logs.append(copy.deepcopy(log))

store = DataStore()
