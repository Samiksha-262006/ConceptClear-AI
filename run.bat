@echo off
echo ========================================================
echo   ConceptClear AI - AI-Powered Personalised Learning
echo   React.js Single Page Application + FastAPI Backend
echo ========================================================
echo.
echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8000...
echo [2/2] Serving React SPA on http://127.0.0.1:8000 (and via Vite on http://localhost:5173)...
echo.
echo Pre-configured Demo Accounts:
echo   - Student: student@conceptclear.ai / Student@123
echo   - Teacher: teacher@conceptclear.ai / Teacher@123
echo.
C:\Users\LENOVO\python311\python.exe -m uvicorn main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
pause
