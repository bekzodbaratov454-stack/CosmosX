@echo off
echo ========================================
echo   CosmosX - Build va Ishga tushirish
echo ========================================
echo.

echo [1/2] Frontend build qilinmoqda...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo XATO: Frontend build muvaffaqiyatsiz!
    pause
    exit /b 1
)
cd ..

echo.
echo [2/2] Backend ishga tushirilmoqda...
echo.
cd backend
call npm run dev
