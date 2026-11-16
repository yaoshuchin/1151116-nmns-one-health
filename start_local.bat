@echo off
chcp 65001 >nul
echo ========================================================
echo  國立自然科學博物館《看見你我他牠它》特展教學成果平台
echo ========================================================
echo.
echo 正在本機啟動展示伺服器 (Port 8000)...
echo 請在瀏覽器中檢視：http://localhost:8000
echo.
start http://localhost:8000
python -m http.server 8000
pause
