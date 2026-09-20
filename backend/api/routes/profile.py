"""User Profile API route with Persona Switcher support for testing."""
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from backend.models.schemas import UserProfile, AccountCreateRequest
from backend.data.store import store

router = APIRouter(prefix="/api/v1/profile", tags=["Profile"])

@router.get("", response_model=UserProfile)
async def get_current_profile():
    """Retrieve the currently active employee profile."""
    return store.get_active_profile()

@router.put("", response_model=UserProfile)
async def update_current_profile(payload: Dict[str, Any]):
    """Update editable fields on current profile."""
    return store.update_profile(payload)

@router.get("/personas", response_model=List[UserProfile])
async def list_available_personas():
    """List all pre-configured enterprise personas for quick-switch testing."""
    return list(store.profiles.values())

@router.post("/switch/{persona_id}", response_model=UserProfile)
async def switch_persona(persona_id: str):
    """Switch active employee persona (e.g. Full-Time vs Contractor vs Locked-Out)."""
    profile = store.set_active_profile(persona_id)
    if not profile:
        raise HTTPException(status_code=404, detail=f"Persona {persona_id} not found.")
    return profile

@router.post("/create", response_model=UserProfile)
async def create_new_account(req: AccountCreateRequest):
    """Create a new custom employee/contractor account and switch to it."""
    return store.create_profile(req)
