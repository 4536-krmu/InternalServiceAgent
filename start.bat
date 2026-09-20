@echo off
title Veridian Corp IT Service Portal
echo ================================================================
echo    VERIDIAN CORP INTERNAL IT SERVICE PORTAL (ASSIGNMENT 2)
echo    Autonomous Agentic AI Support Loop
echo ================================================================

cd /d "%~dp0"

IF EXIST "venv\Scripts\python.exe" (
    echo [*] Using virtual environment...
    venv\Scripts\python.exe run.py
) ELSE (
    echo [*] Using system python...
    python run.py
)

pause
