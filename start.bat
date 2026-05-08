@echo off
echo ========================================
echo    CosmosX - Ishga tushirilmoqda...
echo ========================================
echo.
echo Backend ishga tushirilmoqda...
cd backend
start "CosmosX Backend" cmd /k "npm run dev"
cd ..
echo.
echo ========================================
echo  Sayt:   http://localhost:5000
echo  Admin:  http://localhost:5000/admin
echo  3D:     http://localhost:5000/solar-system
echo ========================================
echo.
echo Backend ishga tushdi!
echo Brauzerda http://localhost:5000 ni oching.
pause
