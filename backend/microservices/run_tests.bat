@echo off
echo ===============================================
echo    Ejecutando pruebas unitarias del backend
echo ===============================================
echo.

REM :D cd a dir del back
cd /d "%~dp0"

REM Activar env
if exist ".venv\Scripts\activate.bat" (
    echo Activando entorno virtual...
    call venv\Scripts\activate.bat
)

echo Ejecutando pruebas...
python -m pytest tests.py -v --tb=short --color=yes

echo.
echo ===============================================
echo           Pruebas completadas
echo ===============================================
pause
