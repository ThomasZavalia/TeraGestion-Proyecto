# TeraGestión - Frontend

Este repositorio contiene el **Frontend** del Sistema Integral de Gestión Clínica y Facturación para consultorios terapéuticos. Es una aplicación web moderna, responsiva y altamente interactiva diseñada para facilitar la administración completa de pacientes, turnos, historial clínico y facturación.

> **Nota:** Este es el repositorio del cliente (Frontend). El Backend (API) se encuentra en un repositorio separado (https://github.com/ThomasZavalia/TeraGestion).

## 🚀 Características Principales

- **Dashboard Interactivo:** Visualización de métricas y estadísticas clave mediante gráficos dinámicos con Recharts
- **Gestión de Pacientes:** CRUD completo para administrar la base de pacientes con formularios validados en tiempo real
- **Sistema de Turnos Inteligente:** 
  - Calendario interactivo con FullCalendar
  - Reserva pública de turnos con rate limiting para prevenir conflictos de concurrencia
  - Validación de disponibilidad en tiempo real
  - Notificaciones instantáneas vía SignalR cuando se reserva un turno
- **Historial Clínico Completo:** Visualización y gestión detallada de sesiones y evoluciones de pacientes
- **Módulo de Facturación:** Generación, seguimiento y administración de facturas y pagos
- **Sección de Estadísticas:** Dashboard de reportes con métricas de rendimiento y productividad
- **Configuración Personalizada:** Panel para gestionar disponibilidad de días y horarios del terapeuta
- **Autenticación Segura:** Login con JWT y sistema de rutas protegidas
- **Diseño Profesional:** Interfaz minimalista siguiendo principios modernos de UX/UI con Chakra UI

## 🛠 Tech Stack

- **Framework:** React 18
- **Bundler:** Vite (desarrollo ultrarrápido ⚡)
- **UI Library:** Chakra UI v2 (sistema de diseño completo)
- **Routing:** React Router DOM v6
- **HTTP Client:** Axios (con interceptores configurados)
- **Real-time:** SignalR Client (notificaciones instantáneas)
- **Calendar:** FullCalendar (gestión visual de agenda)
- **Charts:** Recharts (visualización de estadísticas)
- **Icons:** React Icons
- **Code Quality:** ESLint + Prettier

## ⚙️ Guía de Instalación

Sigue estos pasos para levantar el proyecto en tu entorno de desarrollo.

### 1. Clonar el repositorio

```bash
git clone https://github.com/ThomasZavalia/TeraGestion-frontend.git
cd TeraGestion-frontend
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar la URL del Backend

El proyecto está configurado para apuntar al backend en `https://localhost:7066/api`. 

Si tu backend corre en otra URL, edita el archivo `src/services/axiosInstance.js`:

```javascript
const axiosInstance = axios.create({
  baseURL: 'https://TU_URL_DEL_BACKEND/api', // <-- Cambiar aquí
  // ...
});
```

### 4. Ejecutar el Proyecto

```bash
npm run dev
```

La aplicación estará disponible en **http://localhost:5173**

## 🏗️ Estructura del Proyecto

```
src/
├── components/
│   └── ui/                    # Componentes reutilizables globales
├── context/
│   └── AuthContext.js         # Estado global de autenticación
├── layouts/
│   └── DashboardLayout.jsx    # Layout principal con Sidebar y Navbar
├── pages/
│   ├── login/
│   │   └── LoginPage.jsx
│   ├── dashboard/
│   │   └── DashboardPage.jsx
│   ├── pacientes/
│   │   ├── PacientesPage.jsx
│   │   └── components/        # Componentes específicos de Pacientes
│   ├── turnos/
│   │   ├── TurnosPage.jsx
│   │   └── components/        # Calendario y modales
│   ├── public/
│   │   ├── ConfirmarTurnoPage.jsx
│   │   └── ReservaPage.jsx
│   ├── pagos/
│   │   ├── PagosPage.jsx
│   │   └── components/       #Tabla de pagos
│   ├── reportes/
│   │   ├── ReportesPage.jsx
│   │   └── components/         #Graficos de ReactCharts
│   ├── perfil/
│   │   ├── ConfiguracionPage.jsx
│   │   └── components/            #Tablas de obras sociales, inputs para cambiar contraseña, disponibilidad horaria, etc
├── router/
│   ├── index.js               # Configuración de rutas
│   └── ProtectedRoute.jsx     # HOC para rutas privadas
├── services/
│   ├── axiosInstance.js       # Cliente HTTP configurado
│   ├── authService.js         # Servicios de autenticación
│   ├── pacienteService.js     # API de pacientes
│   ├── turnoService.js        # API de turnos
│   ├── signalrService.js      # Configuración SignalR
│   └── ...
├── theme/
│   └── index.js               # Configuración de Chakra UI
└── utils/                     # Funciones auxiliares puras
```

## 📋 Convenciones de Código

### ESLint y Prettier

El proyecto usa **ESLint** y **Prettier** para mantener la calidad y consistencia del código.

**Extensiones requeridas en VS Code:**
- ESLint (Microsoft)
- Prettier - Code formatter (Prettier)

El formateo automático está configurado para ejecutarse al guardar archivos (`.vscode/settings.json`).

### Sistema de Diseño con Chakra UI

**Reglas de Oro:**
1. ✅ **SIEMPRE usar componentes de Chakra** antes de crear componentes custom
2. ❌ **NO usar archivos .css** - Estilizar con props de Chakra
3. 🎨 **Paleta de colores:**
   - 90% de la app usa escala de **grises** (`gray.50`, `gray.200`, `gray.800`)
   - 10% usa **color** solo para acciones (`colorScheme="blue"`)
   - Colores semánticos: `red.500` (error), `green.500` (éxito), `yellow.500` (advertencia)
   - **Nunca hardcodear colores** como `#FFF` o `color="red"`

**Ejemplo correcto:**
```jsx
<Box bg="white" p="4" borderColor="gray.200" borderWidth="1px">
  <Heading size="md" color="gray.800">Título</Heading>
  <Text fontSize="sm" color="gray.500">Subtítulo</Text>
  <Button colorScheme="blue">Acción</Button>
</Box>
```

## 🔐 Autenticación y Seguridad

El sistema usa **JWT** para autenticación. El flujo es:

1. Usuario ingresa email/password en `/login`
2. Backend valida y devuelve token + datos del usuario
3. Token se guarda en `localStorage`
4. `axiosInstance` adjunta automáticamente el token en todas las peticiones mediante interceptores
5. Rutas protegidas validan autenticación vía `ProtectedRoute`
6. Si el token expira (401), el usuario es redirigido automáticamente al login

## 📡 Notificaciones en Tiempo Real (SignalR)

El frontend se conecta al Hub de SignalR del backend para recibir notificaciones instantáneas:

- **Nuevo turno reservado:** Notificación toast cuando un paciente reserva un turno
- **Actualización de disponibilidad:** Sincronización automática del calendario
- **Eventos del sistema:** Alertas importantes en tiempo real

La conexión SignalR se establece automáticamente al autenticarse y se mantiene activa durante toda la sesión.

## 🗓️ Sistema de Turnos

### Calendario Interactivo
- Visualización mensual/semanal/diaria con FullCalendar
- Drag & drop para reorganizar turnos
- Color coding por estado del turno
- Modal de creación/edición rápida

### Reserva Pública
- Página accesible sin autenticación (`/reserva-publica`)
- Rate limiting para prevenir conflictos de concurrencia
- Validación en tiempo real de disponibilidad
- Confirmación automática vía email (Gmail API)

## 📊 Dashboard y Estadísticas

Visualización de métricas clave con gráficos interactivos:
- Turnos por día/semana/mes (gráfico de líneas)
- Distribución por estado (gráfico de torta)
- Ingresos mensuales (gráfico de barras)
- Pacientes activos vs inactivos
- Tasa de asistencia

Todos los gráficos son responsivos y se construyen con **Recharts**.

## 🌿 Workflow de Git

```bash
# 1. Siempre trabajar desde develop
git checkout develop
git pull origin develop

# 2. Crear rama para tu feature
git checkout -b feature/nombre-de-tu-feature

# 3. Hacer commits descriptivos
git add .
git commit -m "feat: descripción clara de tu cambio"

# 4. Push y crear Pull Request
git push origin feature/nombre-de-tu-feature
```

### Convención de commits:
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `refactor:` Refactorización sin cambios funcionales
- `style:` Cambios de formato/estilo
- `docs:` Cambios en documentación

## 🐛 Troubleshooting

### Error de CORS

Si ves errores de CORS, asegúrate de que tu backend tenga configurado:
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        builder => builder
            .WithOrigins("http://localhost:5173")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials()); // Importante para SignalR
});
```

### Error de Certificado SSL

Si tu backend usa HTTPS con certificado local:
1. Navega a `https://localhost:7066` en tu navegador
2. Acepta el certificado de seguridad
3. Vuelve a la aplicación React

### SignalR no conecta

Verifica que:
1. El backend esté corriendo
2. La URL en `signalrService.js` sea correcta
3. CORS esté configurado con `AllowCredentials()`
4. El token JWT esté presente en localStorage

### FullCalendar no se renderiza

Asegúrate de tener instaladas todas las dependencias:
```bash
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction
```

## 📚 Recursos

- [Documentación de React](https://react.dev)
- [Documentación de Chakra UI v2](https://v2.chakra-ui.com)
- [Guía de React Router](https://reactrouter.com)
- [FullCalendar Docs](https://fullcalendar.io/docs/react)
- [Recharts Documentation](https://recharts.org)
- [SignalR JavaScript Client](https://docs.microsoft.com/en-us/aspnet/core/signalr/javascript-client)

## 👥 Contacto

**Thomas Zavalia** - [LinkedIn https://www.linkedin.com/in/thomas-zavalia-6425302bb/]

## 📄 Licencia

Este proyecto es privado y de uso exclusivo para TeraGestión.
