@echo off
title Sistema Biblioteca - Iniciar Servicios

set BASE_DIR=%~dp0
set API_GATEWAY=%BASE_DIR%api_gateway
set AUTH_SERVICE=%BASE_DIR%auth_service
set MATERIAL_SERVICE=%BASE_DIR%material_service
set LOAN_SERVICE=%BASE_DIR%loan_service
set REQUEST_SERVICE=%BASE_DIR%request_service
set LOG_DIR=%BASE_DIR%logs

if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

REM Check if no arguments provided
if "%1"=="" goto show_help

REM Process arguments
set ARG=%1
if "%ARG%"=="--all" goto start_all
if "%ARG%"=="--gateway" goto start_gateway
if "%ARG%"=="--auth" goto start_auth
if "%ARG%"=="--material" goto start_material
if "%ARG%"=="--loan" goto start_loan
if "%ARG%"=="--request" goto start_request

echo Opcion desconocida: %1
echo Use 'start.bat' sin argumentos para ver opciones disponibles.
exit /b 1

:show_help
echo.
echo Uso: start.bat [--opcion]
echo.
echo Opciones:
echo   --all        - Iniciar todos los microservicios
echo   --gateway    - Iniciar API Gateway (puerto 8000)
echo   --auth       - Iniciar Auth Service (puerto 8001)
echo   --material   - Iniciar Material Service (puerto 8002)
echo   --loan       - Iniciar Loan Service (puerto 8003)
echo   --request    - Iniciar Request Service (puerto 8004)
echo.
echo Ejemplo: start.bat --auth
exit /b 0

:start_gateway
echo Iniciando API Gateway...
start "API Gateway" cmd /k "cd /d "%API_GATEWAY%" && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
goto :eof

:start_auth
echo Iniciando Auth Service...
start "Auth Service" cmd /k "cd /d "%AUTH_SERVICE%" && python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload"
goto :eof

:start_material
echo Iniciando Material Service...
start "Material Service" cmd /k "cd /d "%MATERIAL_SERVICE%" && python -m uvicorn main:app --host 0.0.0.0 --port 8002 --reload"
goto :eof

:start_loan
echo Iniciando Loan Service...
start "Loan Service" cmd /k "cd /d "%LOAN_SERVICE%" && python -m uvicorn main:app --host 0.0.0.0 --port 8003 --reload"
goto :eof

:start_request
echo Iniciando Request Service...
start "Request Service" cmd /k "cd /d "%REQUEST_SERVICE%" && python -m uvicorn main:app --host 0.0.0.0 --port 8004 --reload"
goto :eof

:start_all
echo ========================================
echo Iniciando todos los microservicios
echo ========================================

call :start_auth
timeout /t 2 /nobreak >nul
call :start_material
timeout /t 2 /nobreak >nul
call :start_loan
timeout /t 2 /nobreak >nul
call :start_request
timeout /t 2 /nobreak >nul
call :start_gateway

echo ========================================
echo Todos los microservicios han sido iniciados
echo Para verificar si los servicios estan corriendo, use el comando:
echo netstat -ano ^| findstr 800
timeout /t 3 /nobreak >nul
echo Puertos activos:
netstat -ano | findstr 800
echo ========================================
goto :eof