#!/bin/bash
# healthcheck.sh - Verifica el estado de todos los servicios de TeraGestion
# Uso: bash scripts/healthcheck.sh

# Detectar el directorio raíz del proyecto
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"


if [ -f .env ]; then
    source .env
fi

echo "  TeraGestion - Estado de servicios"

echo ""

ERRORES=0

# Verificar que el motor de Docker este corriendo
if ! docker info &> /dev/null; then
    echo "  ERROR: Docker no esta corriendo."
    echo "  Abrí Docker Desktop y volve a intentar."
    exit 1
fi

# Helper: chequear si un contenedor esta corriendo
check_container() {
    local NOMBRE=$1
    local STATUS
    STATUS=$(docker inspect --format='{{.State.Status}}' "$NOMBRE" 2>/dev/null)

    if [ "$STATUS" == "running" ]; then
        echo "  OK - Contenedor '$NOMBRE': corriendo"
        return 0
    else
        echo "  ERROR - Contenedor '$NOMBRE': $STATUS (esperado: running)"
        return 1
    fi
}

# Verificar contenedores Docker  
echo "[1/3] Verificando contenedores..."

check_container "teragestion_db"  || ERRORES=$((ERRORES + 1))
check_container "teragestion_api" || ERRORES=$((ERRORES + 1))
check_container "teragestion_web" || ERRORES=$((ERRORES + 1))

# Verificar que PostgreSQL acepta conexiones
echo ""
echo "[2/3] Verificando base de datos PostgreSQL..."

if docker exec teragestion_db pg_isready -U "${DB_USER:-postgres}" &> /dev/null; then
    echo "  OK - PostgreSQL acepta conexiones"
else
    echo "  ERROR - PostgreSQL no responde"
    ERRORES=$((ERRORES + 1))
fi

# Verificar que la API responde HTTP
echo ""
echo "[3/3] Verificando API Backend..."

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    --max-time 5 \
    -X POST http://localhost:5000/api/Auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"","password":""}' 2>/dev/null)

if [ "$HTTP_STATUS" == "400" ] || [ "$HTTP_STATUS" == "401" ]; then
    echo "  OK - API responde correctamente (HTTP $HTTP_STATUS)"
elif [ "$HTTP_STATUS" == "000" ]; then
    echo "  ERROR - API no responde (sin conexion)"
    ERRORES=$((ERRORES + 1))
else
    echo "  OK - API responde con HTTP $HTTP_STATUS"
fi

# Resumen
echo ""

if [ "$ERRORES" -eq 0 ]; then
    echo "  TODOS LOS SERVICIOS ESTAN OK"
    echo ""
    echo "  Frontend:  http://localhost:5173"
    echo "  Backend:   http://localhost:5000"
  
    exit 0
else
    echo "  ENCONTRADOS $ERRORES ERROR(ES)"
    exit 1
fi
