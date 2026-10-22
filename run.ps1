Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  ConceptClear AI - React.js + FastAPI Backend" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Serving React SPA on http://127.0.0.1:8000 and Vite on http://localhost:5173" -ForegroundColor Yellow
Write-Host "Demo Credentials: student@conceptclear.ai / Student@123" -ForegroundColor Gray
Write-Host "                  teacher@conceptclear.ai / Teacher@123" -ForegroundColor Gray
Write-Host ""
& "C:\Users\LENOVO\python311\python.exe" -m uvicorn main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
