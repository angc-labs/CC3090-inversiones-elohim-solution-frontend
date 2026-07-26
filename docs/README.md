# Frontend Documentation Index

Bienvenido a la documentación técnica del frontend de **Esmira Shop**.

## Estructura de Documentación

```
frontend/docs/
├── README.md              ← Estás aquí
├── SETUP.md               → Guía de instalación y configuración
├── ARCHITECTURE.md        → Diseño de la aplicación
├── ROUTES.md              → Rutas protegidas y públicas
├── AUTHENTICATION.md      → Sistema de autenticación
├── COMPONENTS.md          → Librería de componentes
├── STATE_MANAGEMENT.md    → Gestión de estado con Zustand
├── STORE_BUILDER.md       → Constructor visual de tiendas
└── CONFIG_PAGE.md         → Configuraciones del sistema
```

## Inicio Rápido

### Desarrollo Local
```bash
cd frontend
pnpm install
pnpm dev
```

**Acceso**: http://localhost:3000

### Build para Producción
```bash
pnpm build
pnpm start
```

---

## Documentación Disponible

### 1️⃣ [SETUP.md](SETUP.md)
- Requisitos del sistema
- Instalación paso a paso
- Variables de entorno
- Configuración inicial

### 2️⃣ [ARCHITECTURE.md](ARCHITECTURE.md)
- Estructura de carpetas
- Stack tecnológico
- Patrones de diseño
- Flujo de datos

### 3️⃣ [ROUTES.md](ROUTES.md)
- Rutas públicas
- Rutas autenticadas
- Rutas administrativas
- Protección de rutas

### 4️⃣ [AUTHENTICATION.md](AUTHENTICATION.md)
- Sistema de login/registro
- JWT token management
- Session expiration
- Role-based access

### 5️⃣ [COMPONENTS.md](COMPONENTS.md)
- Componentes reutilizables
- Ejemplos de uso
- Props y configuración
- Patrones de componentes

### 6️⃣ [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md)
- Zustand stores
- Global state
- Local state
- Best practices

### 7️⃣ [STORE_BUILDER.md](STORE_BUILDER.md)
- Constructor visual
- Drag & drop
- Configuración de diseño
- Export/Import

### 8️⃣ [CONFIG_PAGE.md](CONFIG_PAGE.md)
- Integración Stripe
- Cloudinary setup
- SMTP configuration
- API keys

---

## Arquitectura Resumida

```
Next.js 16 (App Router)
    ↓
React 19 + TypeScript
    ↓
┌──────────────────────────────────┐
│ UI Layer (Components)             │
├──────────────────────────────────┤
│ State Management (Zustand)        │
├──────────────────────────────────┤
│ API Client Layer                  │
├──────────────────────────────────┤
│ Backend API (ASP.NET Core)        │
└──────────────────────────────────┘
```

---

## Stack Tecnológico

- **Framework**: Next.js 16 (App Router)
- **Librería UI**: React 19
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Componentes**: shadcn/ui
- **Estado**: Zustand
- **Gráficos**: Recharts
- **HTTP Client**: Fetch API
- **Autenticación**: JWT + HttpOnly Cookies
- **Contenedorización**: Docker

---

## Estructura de Carpetas

```
frontend/src/
├── app/                    ← App Router (Next.js)
│   ├── layout.tsx
│   ├── page.tsx
│   ├── (auth)/             ← Rutas de autenticación
│   ├── portal/             ← Panel administrativo
│   └── preview/            ← Preview publico
│
├── components/             ← Componentes reutilizables
│   ├── features/           ← Componentes de features
│   ├── ui/                 ← Componentes base
│   └── layout/             ← Layout components
│
├── hooks/                  ← Hooks personalizados
│   ├── useCarrito.ts
│   ├── useHistorialCompras.ts
│   └── useSessionExpiration.ts
│
├── lib/                    ← Utilidades
│   ├── api/                ← API client
│   ├── auth-routes.ts      ← Configuración de rutas
│   ├── format.ts           ← Formaters
│   └── utils.ts            ← Utilidades generales
│
├── stores/                 ← Zustand stores
│   ├── useAuthStore.ts
│   ├── useCarritoStore.ts
│   ├── useClientAuthStore.ts
│   └── useUiStore.ts
│
├── types/                  ← TypeScript types
│   └── index.ts
│
└── styles/                 ← Estilos globales
    └── globals.css
```

---

## Secciones Principales

### Autenticación
- Login
- Registro
- Recuperación de contraseña
- Logout

### Storefront (Cliente)
- Catálogo de productos
- Carrito de compras
- Checkout
- Mis compras

### Portal Administrativo
- Dashboard
- Gestión de productos
- Gestión de inventario
- Pedidos y reservaciones
- Reportes
- Configuración

### Constructor Visual
- Diseño de tienda
- Drag & drop
- Preview en tiempo real
- Export/Import

---

## Autenticación y Seguridad

### Flow de Autenticación
```
User → Frontend → Backend Auth → JWT Token
    ↓
Token almacenado en:
├─ HttpOnly Cookie (seguro)
└─ Zustand Store (acceso en cliente)
```

### Protección de Rutas
- Middleware de Next.js
- Componentes protegidos
- Guards en rutas administrativas

---

## Variables de Entorno

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

---

## Testing

*Documentación en desarrollo. Ver ejemplos en las pruebas actuales.*

---

## Conexión con Backend

### API Endpoints
La aplicación se conecta a: `http://localhost:5000/api/v1/`

### Autenticación
Los requests incluyen JWT token en:
```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'X-Tenant-ID': tenantId
}
```

---

## Sistema de Diseño

### Colores
- **Primario**: Sistema predefinido en Tailwind
- **Fondo**: Glassmorphism dark theme
- **Texto**: Alto contraste

### Tipografía
- Fuentes personalizables via constructor
- Responsive por defecto
- Accesibilidad WCAG

---

## Flujo de Datos

```
Componente
    ↓
Zustand Store (estado global)
    ↓
API Client → Backend
    ↓
Response → Store actualizado
    ↓
Componente re-renderizado
```

---

## Próximos Pasos

1. Frontend levantado
2. **Lee**: [SETUP.md](SETUP.md) - Instalación
3. **Lee**: [ARCHITECTURE.md](ARCHITECTURE.md) - Estructura
4. **Lee**: [ROUTES.md](ROUTES.md) - Rutas disponibles
5. **Lee**: [AUTHENTICATION.md](AUTHENTICATION.md) - Autenticación

---

## Soporte Técnico

### Comandos Útiles
```bash
# Desarrollo
pnpm dev

# Build
pnpm build

# Tests
pnpm test

# Lint
pnpm lint

# Format
pnpm format
```

### Troubleshooting
- Ver logs en consola del navegador (F12)
- Revisar Network tab para errores de API
- Limpiar caché: `npm cache clean --force`

---

**Última actualización**: 2026-07-25
