@echo off
title Al Panino - Cashier Terminal
cd /d "%~dp0"

echo ===================================================
echo   Al Panino - Cashier POS Launching...
echo ===================================================

:: Start local server in background
start "" /b node server.js

:: Wait 1 second for server to initialize
timeout /t 1 /nobreak >nul

:: Launch browser in Kiosk Print Mode (bypasses all browser print dialogs)
start msedge --kiosk-printing http://localhost:4000 || start chrome --kiosk-printing http://localhost:4000 || start http://localhost:4000
