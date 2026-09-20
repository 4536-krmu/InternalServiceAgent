"""System and Health API routes for Veridian Corp IT Portal."""
from fastapi import APIRouter
from typing import List, Dict, Any
from backend.models.schemas import ServiceHealth
from backend.data.store import store

router = APIRouter(prefix="/api/v1/system", tags=["System"])

@router.get("/health", response_model=List[ServiceHealth])
async def get_system_health():
    """Retrieve status, latency, and uptime of internal IT infrastructure services."""
    return store.services_health

@router.post("/seed")
async def reset_seed_data():
    """Resets portal state to initial enterprise demonstration data."""
    store.reset_seed()
    return {"message": "Portal state reset to initial seed data successfully."}
