#!/bin/bash
# backup.sh - Realiza un backup de la base de datos PostgreSQL de TeraGestion
# Uso: bash scripts/backup.sh
# Los backups se guardan en: ./backups/

set -e

# Detectar el directorio raíz del proyecto
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"


if [ -f .env ]; then
    source .env
fi

DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-teradb}"
CONTAINER="teragestion_db"
RETENTION_DAYS=7  
BACKUP_DIR="$PROJECT_ROOT/backups"
DATE=$(date +%Y%m%d_%H%M%S)
ARCHIVO="$BACKUP_DIR/teragestion_backup_$DATE.sql"

echo "  TeraGestion - Backup de base de datos"
echo ""

# Verificar que el contenedor este corriendo
echo "[1/3] Verificando contenedor de base de datos..."
STATUS=$(docker inspect --format='{{.State.Status}}' "$CONTAINER" 2>/dev/null || echo "no encontrado")

if [ "$STATUS" != "running" ]; then
    echo "  ERROR: El contenedor '$CONTAINER' no está corriendo (estado: $STATUS)"
    echo "  Ejecuta 'docker compose up -d' primero."
    exit 1
fi
echo "  OK - Contenedor '$CONTAINER' corriendo"

# Crear directorio de backups si no existe
echo ""
echo "[2/3] Generando backup..."
mkdir -p "$BACKUP_DIR"

docker exec "$CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" > "$ARCHIVO"

TAMANIO=$(du -sh "$ARCHIVO" | cut -f1)
echo "  OK - Backup guardado en: $ARCHIVO ($TAMANIO)"

# Limpiar backups viejos
echo ""
echo "[3/3] Limpiando backups de mas de $RETENTION_DAYS dias..."

ELIMINADOS=$(find "$BACKUP_DIR" -name "teragestion_backup_*.sql" -mtime +$RETENTION_DAYS | wc -l)
find "$BACKUP_DIR" -name "teragestion_backup_*.sql" -mtime +$RETENTION_DAYS -delete

if [ "$ELIMINADOS" -gt 0 ]; then
    echo "  OK - $ELIMINADOS backup(s) antiguo(s) eliminado(s)"
else
    echo "  OK - No hay backups viejos para eliminar"
fi

# Resumen
echo ""

echo "  Backup completado exitosamente!"
echo "  Archivo: $ARCHIVO"
TOTAL=$(find "$BACKUP_DIR" -name "teragestion_backup_*.sql" | wc -l)
echo "  Total de backups guardados: $TOTAL"
