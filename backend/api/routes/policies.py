"""Policies API route for browsing and querying Veridian Corp IT policies (KB-01 to KB-10)."""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from backend.models.schemas import Policy
from backend.agent.policies_kb import POLICIES

router = APIRouter(prefix="/api/v1/policies", tags=["Policies"])

@router.get("", response_model=List[Policy])
async def list_policies(
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search term in title, description, or tags")
):
    """Retrieve all IT policies with optional search and category filters."""
    policies = list(POLICIES.values())
    
    if category and category.lower() != "all":
        policies = [p for p in policies if category.lower() in p.category.lower()]
        
    if search:
        s_lower = search.lower()
        policies = [
            p for p in policies
            if (
                s_lower in p.id.lower() or
                s_lower in p.title.lower() or
                s_lower in p.description.lower() or
                any(s_lower in tag.lower() for tag in p.tags)
            )
        ]
        
    return policies

@router.get("/{policy_id}", response_model=Policy)
async def get_policy(policy_id: str):
    """Get specific policy by ID (e.g. 'KB-01')."""
    pid = policy_id.upper()
    if pid not in POLICIES:
        raise HTTPException(status_code=404, detail=f"Policy {policy_id} not found.")
    return POLICIES[pid]
