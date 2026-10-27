@echo off
rem Abre o site de Registro de Títulos em http://localhost:5050 (o login precisa desse endereço).
cd /d "%~dp0"
set "NODE=C:\Program Files\nodejs\node.exe"
if not exist "%NODE%" set "NODE=node"
powershell -NoProfile -Command "if (Test-NetConnection 127.0.0.1 -Port 5050 -InformationLevel Quiet -WarningAction SilentlyContinue) { exit 0 } else { exit 1 }" >nul 2>&1
if errorlevel 1 (
  start "Registro de Titulos - servidor" /min "%NODE%" servir.mjs
  timeout /t 2 /nobreak >nul
)
start "" "http://localhost:5050"
