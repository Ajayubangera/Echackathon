@echo off
echo Starting Smart Home Application...

start cmd /k "cd backend && python main.py"
start cmd /k "cd mobile && npx expo start"

echo Backend and Mobile (Expo) are starting in separate windows.
