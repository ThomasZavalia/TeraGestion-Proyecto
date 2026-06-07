# Sistema Integral de Gestión Clínica y Facturación (Backend API)

Este repositorio contiene el **Backend** para TeraGestión, un sistema robusto diseñado para administrar historiales clínicos, facturación, turnos en tiempo real y reportes estadísticos para consultorios terapéuticos.

> **Nota:** Este es el repositorio del servidor (API). El Frontend se encuentra en un repositorio separado (https://github.com/ThomasZavalia/TeraGestion-frontend).

## 🚀 Características Principales

El proyecto sigue una arquitectura monolítica en capas altamente desacoplada:

* **Gestión Clínica y Financiera:** Módulos complejos para Historial Clínico de pacientes y un sistema de Pagos y Facturación, asegurando la integridad de datos sensibles y transaccionales (ACID).
* **Agenda en Tiempo Real:** Motor de turnos inteligente con validación de disponibilidad, integración de **SignalR** para actualizaciones instantáneas y notificaciones automáticas vía **Gmail API**.
* **Analítica y Reportes:** Implementación de un dashboard de Reportes Estadísticos para la visualización de métricas de rendimiento y productividad del consultorio.
* **Seguridad:** Autenticación vía **JWT** para autenticación segura y optimización de consultas masivas mediante paginación en servidor y mapeo eficiente de datos.
* **Infraestructura:** Preparado para contenedorización con Docker.

## 🛠 Tech Stack

* **Core:** .NET 8 (C#)
* **Data:** PostgreSQL, Entity Framework Core
* **Real-time:** SignalR
* **External APIs:** Gmail API
* **DevOps:** Docker (Dockerfile incluido)

## ⚙️ Guía de Instalación (Local)

Sigue estos pasos para levantar el proyecto en tu entorno de desarrollo.

### 1. Clonar el repositorio

```bash
git clone https://github.com/ThomasZavalia/TeraGestion.git
cd TeraGestion-backend
```

### 2. Configuración de Secretos (Appsettings)

El archivo `appsettings.json` incluido en el repositorio contiene valores de muestra (placeholders) por seguridad.

1. Crea un nuevo archivo en la raíz del proyecto llamado `appsettings.Development.json`.
2. Este archivo debe contener tus credenciales reales (Cadena de conexión SQL local, Keys de JWT, Credenciales de Gmail).
3. Ejemplo de estructura para `appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=TeraGestionDB;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
  },
  "JwtConfig": {
    "Secret": "PONER_AQUI_TU_CLAVE_SUPER_SECRETA_LARGA_MIN_32_CARACTERES",
    "Issuer": "https://localhost:7066",
    "Audience": "https://localhost:7066"
  },
  "GmailApi": {
    "Email": "tu_email@gmail.com",
    "AppPassword": "tu_app_password_de_16_caracteres"
  }
}
```

> **Importante:** El archivo `appsettings.Development.json` está en el `.gitignore` y **NUNCA** debe subirse al repositorio.

### 3. Base de Datos y Migraciones

Dado que las migraciones no se incluyen en el repositorio para mantenerlo limpio, debes generar la migración inicial basada en tu entorno:

```bash
# 1. Crear la migración inicial
dotnet ef migrations add InitialCreate

# 2. Aplicar la migración para crear la DB y tablas
dotnet ef database update
```

> **Nota:** Asegúrate de tener instalado `dotnet-ef`. Si no lo tienes:
> ```bash
> dotnet tool install --global dotnet-ef
> ```

### 4. Ejecutar la Aplicación

```bash
dotnet run
```

La API estará disponible en los puertos configurados (por defecto `https://localhost:7066` o `http://localhost:5000`).

## 🐳 Docker (Opcional)

El proyecto incluye un `Dockerfile` para generar la imagen del contenedor.

```bash
# Construir la imagen
docker build -t teragestion-backend .

# Correr el contenedor (Asegúrate de configurar las variables de entorno necesarias)
docker run -p 8080:80 -e ConnectionStrings__DefaultConnection="TU_CONNECTION_STRING" teragestion-backend
```

> **Nota:** No se incluye `docker-compose.yml` ya que el Frontend está en un repositorio separado. Para despliegue completo, deberás crear tu propio archivo compose que integre ambos servicios.

## 📁 Arquitectura del Proyecto

```
TeraGestion
├── Controllers/            # Endpoints de la API
├── Core/                   # Entidades del dominio, DTOs, Mapping, Interfaces
├── Infrastructure/         # Repositorios
├── Services/               # Lógica de negocio
├── TeraGestion.Tests/      # Pruebas Unitarias
```

## 🔐 Configuración de Gmail API

Para las notificaciones automáticas:

1. Habilita la verificación en dos pasos en tu cuenta de Gmail
2. Genera una **Contraseña de aplicación** en: https://myaccount.google.com/apppasswords
3. Usa esa contraseña de 16 caracteres en `appsettings.Development.json`

## 🌿 Endpoints Principales

- `POST /api/Auth/login` - Autenticación
- `GET /api/Pacientes` - Listar pacientes (paginado)
- `POST /api/Turnos` - Crear turno
- `GET /api/Turnos` - Obtener todos los turnos
- `GET /api/Pago` - Historial de facturación



## 🐛 Troubleshooting

### Error: "No se puede conectar a PostgreSQL"
Verifica que tu instancia de PostgreSQL esté corriendo y que la cadena de conexión en `appsettings.Development.json` sea correcta.

### Error: "dotnet-ef no reconocido"
Instala la herramienta globalmente:
```bash
dotnet tool install --global dotnet-ef
```

### Error de CORS desde el Frontend
Asegúrate de tener configurado CORS en `Program.cs`:
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        builder => builder
            .WithOrigins("http://localhost:5173")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
});
```

## 👥 Contacto

**Thomas Zavalia** - [LinkedIn https://www.linkedin.com/in/thomas-zavalia-6425302bb/]

## 📄 Licencia

Este proyecto es privado y de uso exclusivo para TeraGestión.
