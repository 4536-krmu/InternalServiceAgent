"""Veridian Corp Internal IT Service Portal - FastAPI Application Entry Point."""
import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.api.routes.requests import router as requests_router
from backend.api.routes.tickets import router as tickets_router
from backend.api.routes.policies import router as policies_router
from backend.api.routes.audit import router as audit_router
from backend.api.routes.profile import router as profile_router
from backend.api.routes.system import router as system_router

app = FastAPI(
    title="Veridian Corp Internal IT Service Portal API",
    description="Enterprise IT Support Service Agent powering autonomous remediation and policy compliance (KB-01 - KB-10).",
    version="2.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(requests_router)
app.include_router(tickets_router)
app.include_router(policies_router)
app.include_router(audit_router)
app.include_router(profile_router)
app.include_router(system_router)

@app.get("/api/health")
async def health_check():
    return {
        "status": "online",
        "service": "Veridian Corp IT Service Agent API",
        "version": "2.0.0",
        "policy_coverage": "KB-01 to KB-10"
    }

# Mount Frontend Static Assets if built
FRONTEND_DIST = Path(__file__).resolve().parent.parent / "frontend" / "dist"
if FRONTEND_DIST.exists() and (FRONTEND_DIST / "index.html").exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = FRONTEND_DIST / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(str(file_path))
        return FileResponse(str(FRONTEND_DIST / "index.html"))

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=True)
