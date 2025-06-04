#!/bin/bash

# Sistema Biblioteca - Iniciar Servicios

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_GATEWAY="$BASE_DIR/api_gateway"
AUTH_SERVICE="$BASE_DIR/auth_service"
MATERIAL_SERVICE="$BASE_DIR/material_service"
LOAN_SERVICE="$BASE_DIR/loan_service"
REQUEST_SERVICE="$BASE_DIR/request_service"
LOG_DIR="$BASE_DIR/logs"

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

show_help() {
    echo
    echo "Uso: ./start.sh [--opcion]"
    echo
    echo "Opciones:"
    echo "  --all        - Iniciar todos los microservicios"
    echo "  --gateway    - Iniciar API Gateway (puerto 8000)"
    echo "  --auth       - Iniciar Auth Service (puerto 8001)"
    echo "  --material   - Iniciar Material Service (puerto 8002)"
    echo "  --loan       - Iniciar Loan Service (puerto 8003)"
    echo "  --request    - Iniciar Request Service (puerto 8004)"
    echo
    echo "Ejemplo: ./start.sh --auth"
    exit 0
}

start_gateway() {
    echo "Iniciando API Gateway..."
    cd "$API_GATEWAY" && uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
    echo "API Gateway iniciado en proceso $!"
}

start_auth() {
    echo "Iniciando Auth Service..."
    cd "$AUTH_SERVICE" && uvicorn main:app --host 0.0.0.0 --port 8001 --reload &
    echo "Auth Service iniciado en proceso $!"
}

start_material() {
    echo "Iniciando Material Service..."
    cd "$MATERIAL_SERVICE" && uvicorn main:app --host 0.0.0.0 --port 8002 --reload &
    echo "Material Service iniciado en proceso $!"
}

start_loan() {
    echo "Iniciando Loan Service..."
    cd "$LOAN_SERVICE" && uvicorn main:app --host 0.0.0.0 --port 8003 --reload &
    echo "Loan Service iniciado en proceso $!"
}

start_request() {
    echo "Iniciando Request Service..."
    cd "$REQUEST_SERVICE" && uvicorn main:app --host 0.0.0.0 --port 8004 --reload &
    echo "Request Service iniciado en proceso $!"
}

start_all() {
    echo "========================================"
    echo "Iniciando todos los microservicios"
    echo "========================================"

    start_auth
    sleep 2
    start_material
    sleep 2
    start_loan
    sleep 2
    start_request
    sleep 2
    start_gateway

    echo "========================================"
    echo "Todos los microservicios han sido iniciados"
    echo "Para verificar si los servicios estan corriendo, use el comando:"
    echo "netstat -tulpn | grep 800"
    sleep 3
    echo "Puertos activos:"
    netstat -tulpn | grep 800 2>/dev/null || echo "No se encontraron puertos activos en el rango 800x"
    echo "========================================"
}

# Check if no arguments provided
if [ $# -eq 0 ]; then
    show_help
fi

# Process arguments
case "$1" in
    --all)
        start_all
        ;;
    --gateway)
        start_gateway
        ;;
    --auth)
        start_auth
        ;;
    --material)
        start_material
        ;;
    --loan)
        start_loan
        ;;
    --request)
        start_request
        ;;
    *)
        echo "Opcion desconocida: $1"
        echo "Use './start.sh' sin argumentos para ver opciones disponibles."
        exit 1
        ;;
esac
