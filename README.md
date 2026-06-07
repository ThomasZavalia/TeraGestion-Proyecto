# TeraGestión — Sistema de Gestión para Clínicas Privadas

Proyecto final de la **Tecnicatura en Programación** — UTN / Instituto.  
Sistema web para la gestión integral de turnos, pacientes, sesiones y facturación en centros de salud privados.

---

## Tecnologías utilizadas

| Capa | Tecnología |
|------|-----------|
| Backend | ASP.NET Core 8 — Clean Architecture |
| Frontend | React + Vite + Chakra UI |
| Base de datos | PostgreSQL 15 |
| Autenticación | JWT + reCAPTCHA v3 |
| Tiempo real | SignalR |
| Contenedores | Docker + Docker Compose |
| Cloud | Azure App Service (deployed) |

---

## Requisitos previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y en ejecución

No se requiere instalar .NET, Node.js ni PostgreSQL por separado.

---

## Cómo ejecutar el proyecto

### 1. Configurar las variables de entorno

Copiá el archivo de ejemplo y completá los valores:

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

### 2. Levantar los contenedores

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
├── backend/          # API REST en ASP.NET Core 8
│   ├── Controllers/  # Endpoints y configuración
│   ├── Services/     # Lógica de negocio
│   ├── Core/         # Entidades, interfaces y DTOs
│   └── Infraestructure/ # Repositorios y acceso a datos
├── frontend/         # Aplicación React
├── docker-compose.yml
├── .env.example      # Plantilla de configuración
└── README.md
```
