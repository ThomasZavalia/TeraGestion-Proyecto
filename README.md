# TeraGestión — Sistema de Gestión para Clínicas Privadas

![CI - API Tests](https://github.com/ThomasZavalia/TeraGestion-Proyecto/actions/workflows/api-tests.yml/badge.svg)
![CI - UI Tests](https://github.com/ThomasZavalia/TeraGestion-Proyecto/actions/workflows/ui-tests.yml/badge.svg)
![.NET](https://img.shields.io/badge/.NET-8.0-purple?logo=dotnet)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)

Proyecto final de la **Tecnicatura en Programación** — UTN.  
Sistema web para la gestión integral de turnos, pacientes, sesiones y facturación en centros de salud privados.

---

## Tecnologías utilizadas

| Capa | Tecnología |
|------|-----------|
| Backend | ASP.NET Core 8 — Clean Architecture |
| Frontend | React + Vite + Chakra UI |
| Base de datos | PostgreSQL 15 |
| Autenticación | JWT + BCrypt + reCAPTCHA v3 |
| Tiempo real | SignalR (WebSockets) |
| Contenedores | Docker + Docker Compose |
| Cloud | Azure App Service |
| Testing API | xUnit + FluentAssertions |
| Testing UI | Playwright (E2E headless) |
| CI/CD | GitHub Actions |

---

## Características principales

- **Agenda interactiva** con FullCalendar y actualizaciones en tiempo real vía SignalR
- **Gestión de pacientes** con historial clínico, pagos y sesiones
- **Facturación** con soporte para Obras Sociales y pagos particulares
- **Autenticación segura** con JWT, hashing BCrypt y reCAPTCHA v3
- **Notificaciones por email** con recordatorios automáticos de turnos (Gmail API)
- **Tests automatizados** de API y UI con CI/CD en cada push
- **Dockerizado** — un solo comando para levantar todo el entorno

---

## Requisitos previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y en ejecución

No se requiere instalar .NET, Node.js ni PostgreSQL por separado.

---

## Cómo ejecutar el proyecto

### Opción 1 — Script automático (recomendado)

```bash
bash scripts/setup.sh
```

El script verifica las dependencias, crea el `.env` si no existe y levanta todos los contenedores.

### Opción 2 — Manual

#### 1. Configurar las variables de entorno

```bash
cp .env.example .env
```

Editá `.env` y completá los campos requeridos:

```env
# Base de datos
DB_USER=usuario_teragestion
DB_PASSWORD=tu_password_seguro
DB_NAME=teradb

# JWT (mínimo 32 caracteres)
JWT_KEY=clave_secreta_minimo_32_caracteres_aqui!

# SMTP (opcional — para emails de notificación)
SMTP_PASSWORD=tu_app_password_de_gmail

# reCAPTCHA v3 (opcional — para el formulario público)
RECAPTCHA_SECRET_KEY=tu_clave_de_recaptcha
```

> **Nota:** Las funciones de email y reCAPTCHA son opcionales para explorar el sistema.  
> Sin configurarlas, el resto de las funcionalidades opera con normalidad.

#### 2. Levantar los contenedores

```bash
docker compose up -d --build
```

El proceso descarga las imágenes base y compila el proyecto. La primera vez puede tardar 3-5 minutos.

### 3. Acceder al sistema

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| API (Swagger) | http://localhost:5000/swagger |

---

## Usuarios de prueba

| Rol | Usuario | Contraseña |
|-----|---------|-----------|
| Administrador | admin | Admin1234! |
| Secretaria | secretaria | Secretaria1234! |
| Terapeuta | terapeuta | Terapeuta1234! |

> Los datos de prueba se cargan automáticamente al iniciar por primera vez.

---

## Scripts de utilidad

| Script | Descripción |
|--------|-------------|
| `bash scripts/setup.sh` | Configuración inicial del entorno |
| `bash scripts/healthcheck.sh` | Verifica el estado de todos los servicios |
| `bash scripts/backup.sh` | Genera un backup de la base de datos PostgreSQL |

---

## Tests automatizados

El proyecto incluye una suite de pruebas automatizadas que se ejecutan en cada push mediante GitHub Actions:

- **Tests de API** (`xUnit`): Validan autenticación, autorización y reglas de negocio críticas
- **Tests de UI E2E** (`Playwright`): Verifican flujos de login en modo headless con captura de trazas y video

```bash
# Correr tests de API
dotnet test backend/TeraGestion.Tests/TeraGestion.Tests.csproj

# Correr tests de UI
dotnet test backend/TeraGestion.UiTests/TeraGestion.UiTests.csproj
```

---

## Apagar el sistema

```bash
docker compose down
```

Para eliminar también los datos de la base:

```bash
docker compose down -v
```

---

## Estructura del proyecto

```
TeraGestion-Proyecto/
├── backend/
│   ├── Controllers/      # Endpoints y configuración de la API
│   ├── Services/         # Lógica de negocio
│   ├── Core/             # Entidades, interfaces y DTOs
│   ├── Infraestructure/  # Repositorios y acceso a datos (EF Core)
│   ├── TeraGestion.Tests/     # Tests de integración de API (xUnit)
│   └── TeraGestion.UiTests/   # Tests E2E de UI (Playwright)
├── frontend/             # Aplicación React + Vite
├── scripts/              # Scripts Bash de setup, healthcheck y backup
├── .github/workflows/    # Pipelines de CI/CD (GitHub Actions)
├── docker-compose.yml
├── .env.example
└── README.md
```
