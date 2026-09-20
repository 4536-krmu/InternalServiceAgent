"""One-command runner for Veridian Corp Internal IT Service Portal.
Launches the unified FastAPI + React single-page application server.
"""
import os
import sys
import subprocess
import webbrowser
import time
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = ROOT_DIR / "frontend"
FRONTEND_DIST = FRONTEND_DIR / "dist"

def ensure_frontend_built():
    if not (FRONTEND_DIST / "index.html").exists():
        print("[+] Frontend build not found. Building React application...")
        npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
        try:
            subprocess.run([npm_cmd, "run", "build"], cwd=str(FRONTEND_DIR), check=True)
            print("[+] Frontend built successfully into frontend/dist!")
        except Exception as e:
            print(f"[!] Warning: Could not compile frontend with npm ({e}). API will still operate.")

def main():
    print("=" * 65)
    print("   VERIDIAN CORP INTERNAL IT SERVICE PORTAL (ASSIGNMENT 2)")
    print("   Autonomous Agentic AI Engine & Policy Compliance Core")
    print("=" * 65)

    ensure_frontend_built()

    port = int(os.environ.get("PORT", 8000))
    url = f"http://127.0.0.1:{port}"

    print(f"\n[*] Starting unified FastAPI server at: {url}")
    print(f"[*] API Documentation available at:     {url}/docs")
    print(f"[*] System Health endpoint at:          {url}/api/health\n")

    # Launch browser after a brief delay
    def open_browser():
        time.sleep(1.5)
        webbrowser.open(url)

    import threading
    threading.Thread(target=open_browser, daemon=True).start()

    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=False)

if __name__ == "__main__":
    main()
