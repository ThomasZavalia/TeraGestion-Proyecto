#!/bin/bash
#Script de configuración inicial de TeraGestion
# Uso: bash scripts/setup.sh

set -e


SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"



echo "  TeraGestion - Configuracion inicial"


# Verificar dependencias
echo ""
echo "[1/4] Verificando dependencias..."

if ! command -v docker &> /dev/null; then
    echo "  ERROR: Docker no esta instalado. Instala Docker Desktop y volvé a intentar."
    exit 1
fi
echo "  OK - Docker encontrado: $(docker --version)"

if ! command -v docker compose &> /dev/null; then
    echo "  ERROR: Docker Compose no encontrado."
    exit 1
fi
echo "  OK - Docker Compose encontrado"

# Verificar que el motor de Docker esté corriendo
if ! docker info &> /dev/null; then
    echo ""
    echo "  ERROR: Docker esta instalado pero NO esta corriendo."
    echo "  Abrí Docker Desktop, esperá a que el ícono de la ballena aparezca"
    echo "  en la barra de tareas, y volvé a correr este script."
    exit 1
fi
echo "  OK - Docker Engine corriendo"


# Crear el archivo .env si no existe
echo ""
echo "[2/4] Verificando archivo de configuracion..."

if [ ! -f .env ]; then
    cp .env.example .env
    echo "  OK - Archivo .env creado desde .env.example"
    echo "  ATENCION: Abri el archivo .env y completa los valores antes de continuar."
    echo "  Cuando termines, volvé a correr este script."
    exit 0
else
    echo "  OK - Archivo .env ya existe"
fi

# Validar que las variables críticas están cargadas
echo ""
echo "[3/4] Validando variables de entorno..."

source .env

ERRORES=0
for VAR in DB_USER DB_PASSWORD DB_NAME JWT_KEY; do
    if [ -z "${!VAR}" ]; then
        echo "  ERROR: La variable '$VAR' esta vacia en el archivo .env"
        ERRORES=$((ERRORES + 1))
    else
        echo "  OK - $VAR configurada"
    fi
done

if [ "$ERRORES" -gt 0 ]; then
    echo ""
    echo "  Corregi las variables faltantes en .env y volvé a correr el script."
    exit 1
fi

# Levantar servicios con Docker Compose
echo ""
echo "[4/4] Levantando servicios con Docker Compose..."
docker compose up -d --build

echo ""
echo "  Setup completado exitosamente!"
echo ""
echo "  Frontend:  http://localhost:5173"
echo "  Backend:   http://localhost:5000"
echo "  Base de datos: localhost:5435"
echo ""
echo "  Para ver los logs: docker compose logs -f"
echo "  Para detener:      docker compose down"
echo ""
