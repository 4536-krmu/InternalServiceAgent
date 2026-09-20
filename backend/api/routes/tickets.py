"""Tickets API route for retrieving, filtering, and managing IT service tickets."""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from backend.models.schemas import Ticket, TicketAction
from backend.data.store import store

router = APIRouter(prefix="/api/v1/tickets", tags=["Tickets"])

@router.get("", response_model=List[Ticket])
async def list_tickets(
    status: Optional[str] = Query(None, description="Filter by status (e.g. 'In Progress', 'Resolved')"),
    category: Optional[str] = Query(None, description="Filter by category substring"),
    search: Optional[str] = Query(None, description="Search term in id, title, description, requester"),
    priority: Optional[str] = Query(None, description="Filter by priority (Low, Medium, High, Critical)")
):
    """Fetch all active and historical tickets with dynamic filtering."""
    return store.get_tickets(status=status, category=category, search=search, priority=priority)

@router.get("/{ticket_id}", response_model=Ticket)
async def get_ticket(ticket_id: str):
    """Retrieve detailed ticket record by ID."""
    ticket = store.get_ticket(ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} not found.")
    return ticket

@router.post("/{ticket_id}/action", response_model=Ticket)
async def perform_ticket_action(ticket_id: str, action: TicketAction):
    """Perform operational action on a ticket (Approve, Escalate, Resolve, Add Note)."""
    updated_ticket = store.apply_ticket_action(ticket_id, action)
    if not updated_ticket:
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} not found.")
    return updated_ticket
