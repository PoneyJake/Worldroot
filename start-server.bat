@echo off
cd /d "%~dp0"
title Worldroot Server

where node >nul 2>&1
if errorlevel 1 (
  echo.
  echo  Node.js was not found on this PC.
  echo  Install it from https://nodejs.org/ then run this file again.
  echo.
  echo  Opening the Worldroot site instead ^(offline mode^)...
  start "" "%~dp0index.html"
  echo.
  pause
  exit /b 1
)

echo.
echo  Starting Worldroot...
echo  If localhost fails, double-click open-game.bat instead.
echo.
node serve.js
if errorlevel 1 (
  echo.
  echo  Server failed to start. Try double-clicking index.html instead.
  echo.
)
pause
