@echo off
REM TechVault Quick Start Script for Windows

echo.
echo 🚀 TechVault Setup ^& Development Server Launcher
echo ==================================================

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18 or higher.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i

echo ✓ Node.js version: %NODE_VERSION%
echo ✓ npm version: %NPM_VERSION%

REM Install dependencies
echo.
echo 📦 Installing dependencies...

if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    cd ..
)

if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

echo ✓ Dependencies installed

REM Check environment files
echo.
echo 🔧 Checking environment configuration...

if not exist "backend\.env" (
    echo ⚠️  backend\.env not found
    echo    Please copy backend\.env.example to backend\.env and configure
)

if not exist "frontend\.env.local" (
    echo ⚠️  frontend\.env.local not found
    echo    Creating frontend\.env.local with default values...
    (
        echo NEXT_PUBLIC_API_URL=http://localhost:5000
        echo NEXT_PUBLIC_APP_NAME=TechVault
    ) > frontend\.env.local
)

echo ✓ Environment configuration ready

REM MongoDB check
echo.
echo 🗄️  Checking MongoDB...
where mongod >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ MongoDB is installed
    echo   Tip: Start MongoDB with 'mongod' in a separate terminal
) else (
    echo ⚠️  MongoDB is not installed locally
    echo   Using MongoDB Atlas? Update MONGODB_URI in backend\.env
)

echo.
echo ===========================================
echo 📚 TechVault - Ready for Development!
echo ===========================================
echo.
echo To start development servers, open 2 terminals:
echo.
echo Terminal 1 - Backend:
echo   cd backend ^&^& npm run dev
echo   Runs on http://localhost:5000
echo.
echo Terminal 2 - Frontend:
echo   cd frontend ^&^& npm run dev
echo   Runs on http://localhost:3000
echo.
echo 📖 Documentation:
echo   Setup Guide: COMPLETE_SETUP_GUIDE.md
echo   Architecture: ARCHITECTURE.md
echo.
echo Happy coding! 🎉
echo.
pause
