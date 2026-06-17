@echo off
setlocal enabledelayedexpansion

title AI Resume Launcher

set "PROJECT_DIR=%~dp0"
set "BACKEND_DIR=%PROJECT_DIR%backend"
set "FRONTEND_DIR=%PROJECT_DIR%frontend"
set "MAVEN_DIR=%PROJECT_DIR%tools\apache-maven-3.9.16\bin"
set "BACKEND_PORT=8080"
set "FRONTEND_PORT=3000"

:MENU
cls
echo.
echo  ============================================
echo         AI Resume Launcher
echo  ============================================
echo.
echo   [1] Start All (Backend + Frontend)
echo   [2] Start Backend Only (:%BACKEND_PORT%)
echo   [3] Start Frontend Only (:%FRONTEND_PORT%)
echo   [4] Stop All Services
echo   [5] Restart All
echo   [0] Exit
echo.
echo  ============================================
echo.
set /p choice="  Select [0-5]: "

if "%choice%"=="1" goto START_ALL
if "%choice%"=="2" goto START_BACKEND
if "%choice%"=="3" goto START_FRONTEND
if "%choice%"=="4" goto STOP_ALL
if "%choice%"=="5" goto RESTART_ALL
if "%choice%"=="0" goto EXIT
echo.
echo  Invalid choice!
timeout /t 2 >nul
goto MENU

:KILL_PORT
    set "PORT=%~1"
    for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":%PORT%" ^| findstr "LISTENING"') do (
        set "PID=%%a"
        if not "!PID!"=="0" (
            echo  [Kill] Port %PORT% PID=!PID!
            taskkill /F /PID !PID! >nul 2>&1
        )
    )
    goto :eof

:START_ALL
    echo.
    echo  Starting all services...
    echo.

    echo  [1/3] Cleaning ports...
    call :KILL_PORT %BACKEND_PORT%
    call :KILL_PORT %FRONTEND_PORT%
    timeout /t 1 >nul

    echo  [2/3] Starting backend...
    start "AI-Backend" cmd /k "cd /d "%BACKEND_DIR%" && set "PATH=%MAVEN_DIR%;%PATH%" && title AI Backend && echo. && echo Starting Spring Boot on port %BACKEND_PORT%... && echo. && mvn spring-boot:run && pause"

    echo  [3/3] Starting frontend (waiting 5s for backend)...
    timeout /t 5 >nul
    start "AI-Frontend" cmd /k "cd /d "%FRONTEND_DIR%" && title AI Frontend && echo. && echo Starting Next.js on port %FRONTEND_PORT%... && echo. && npm run dev && pause"

    echo.
    echo  ============================================
    echo   Backend:  http://localhost:%BACKEND_PORT%
    echo   Frontend: http://localhost:%FRONTEND_PORT%
    echo  ============================================
    echo.
    pause
    goto MENU

:START_BACKEND
    echo.
    echo  Starting backend...
    call :KILL_PORT %BACKEND_PORT%
    timeout /t 1 >nul
    start "AI-Backend" cmd /k "cd /d "%BACKEND_DIR%" && set "PATH=%MAVEN_DIR%;%PATH%" && title AI Backend && echo. && echo Starting Spring Boot on port %BACKEND_PORT%... && echo. && mvn spring-boot:run && pause"
    echo.
    echo  Backend starting on http://localhost:%BACKEND_PORT%
    echo.
    pause
    goto MENU

:START_FRONTEND
    echo.
    echo  Starting frontend...
    call :KILL_PORT %FRONTEND_PORT%
    timeout /t 1 >nul
    start "AI-Frontend" cmd /k "cd /d "%FRONTEND_DIR%" && title AI Frontend && echo. && echo Starting Next.js on port %FRONTEND_PORT%... && echo. && npm run dev && pause"
    echo.
    echo  Frontend starting on http://localhost:%FRONTEND_PORT%
    echo.
    pause
    goto MENU

:STOP_ALL
    echo.
    echo  Stopping all services...
    echo.
    call :KILL_PORT %BACKEND_PORT%
    call :KILL_PORT %FRONTEND_PORT%
    taskkill /F /IM java.exe >nul 2>&1
    taskkill /F /IM node.exe >nul 2>&1
    echo.
    echo  All services stopped.
    echo.
    pause
    goto MENU

:RESTART_ALL
    echo.
    echo  Restarting...
    call :KILL_PORT %BACKEND_PORT%
    call :KILL_PORT %FRONTEND_PORT%
    taskkill /F /IM java.exe >nul 2>&1
    taskkill /F /IM node.exe >nul 2>&1
    timeout /t 2 >nul
    goto START_ALL

:EXIT
    exit /b 0
