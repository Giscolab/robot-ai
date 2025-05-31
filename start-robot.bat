@echo off
title 🚀 Robot AI Local - Serveur Local HTTP (Python)
cd /d "%~dp0"

REM Lance le serveur Python en arrière-plan
start "" http://localhost:8080
python -m http.server 8080

pause
