# Setup Frontend - Guía de Instalación

## Requisitos Previos
- **Node.js 18+** ([descargar](https://nodejs.org/))
- **pnpm** (recomendado) o **npm**
- **Git**

---

## Instalación Rápida

### 1. Instalar pnpm (si no lo tienes)
```bash
npm install -g pnpm
```

### 2. Clonar e instalar dependencias
```bash
cd frontend
pnpm install
```

### 3. Configurar variables de entorno

Crear archivo `.env.local` en `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_your_key
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

### 4. Iniciar servidor
```bash
pnpm dev
```

Acceder a: http://localhost:3000

---

## Credenciales de Prueba

| Tipo | Email | Contraseña |
|------|-------|------------|
| Admin | admin@elohim.com | Temporal123! |
| Cliente | customer@elohim.com | Temporal123! |

---

## Verificación

1. **Frontend está corriendo**: http://localhost:3000
2. **Backend conectado**: Abrir DevTools (F12) → Network → Intentar login
3. **Auth funcionando**: Ir a `/auth/login` e ingresar credenciales

---

## Troubleshooting Rápido

**"Port 3000 is already in use"**
```bash
pnpm dev -- -p 3001
```

**"Cannot find module 'next'"**
```bash
rm -rf node_modules pnpm-lock.yaml && pnpm install
```

**"API requests failing (CORS error)"**
- Verificar `NEXT_PUBLIC_API_URL=http://localhost:5000` en `.env.local`
- Backend debe estar corriendo

---

## Docker (Alternativa)

```bash
docker compose up frontend
```

---

## Próximos Pasos

1. Frontend levantado
2. Lee: [AUTHENTICATION.md](AUTHENTICATION.md) - Sistema de autenticación
3. Lee: [ROUTES.md](ROUTES.md) - Rutas disponibles
4. Lee: [CONFIG_PAGE.md](CONFIG_PAGE.md) - Configuración de la tienda

---

**Última actualización**: 2026-07-26
