# Seguridad Frontend

## Alcance
Auditoría de seguridad del frontend con foco en:
- Manejo de autenticación y almacenamiento de tokens
- Control de acceso en rutas protegidas
- Uso de `localStorage` para tenant/session
- Generación de headers y datos sensibles enviados al backend

## Hallazgos principales

### 1. Almacenamiento de tokens en `localStorage`
- El frontend persiste la sesión de usuario administrativo en `dmhub-auth` y las sesiones de clientes en `dmhub-client-auth` mediante `zustand` con `persist`.
- Esto guarda tokens JWT/sesión en `localStorage`, exponiéndolos a cualquier script malicioso que se inyecte en la aplicación.
- Además, `useClientAuthStore` almacena múltiples sesiones de cliente por tenant en un solo objeto persistido, lo que amplía el impacto de un posible robo de credenciales.

### 2. Tenant y session controlados por cliente
- `buildAuthHeaders` decide el tenant activo con `getSubdomain()` o con `window.localStorage.getItem("active_tenant_id")`.
- Un atacante con acceso al navegador puede manipular `active_tenant_id` para cambiar la tienda/tenant que el frontend envía al backend.
- Si el backend no valida estrictamente ese tenant, esto puede permitir acceso indebido o cross-tenant.

### 3. Autorización sólo en el cliente
- Las puertas de páginas como `ClientProtectedRoute` y `GuestAuthGate` son sólo protecciones de UI.
- Estas validaciones ayudan con la experiencia de usuario, pero no reemplazan la autorización del backend.
- Cualquier ruta protegida debe validarse siempre en el servidor; el frontend no debe asumir que la ruta es segura sólo por el componente de guard.

### 4. Sesión y expiración local
- `useAuthStore.isSessionExpired()` e `useClientAuthStore.isSessionExpired()` validan el vencimiento usando `expiraEn` almacenado en localStorage.
- Si el token es revocado o invalida en el backend, el frontend puede seguir creyendo que la sesión es válida hasta la expiración local.
- No hay un refresh token ni validación de sesión al cargar la aplicación.

### 5. Headers y tenant forwarding
- `buildAuthHeaders` agrega `Content-Type: application/json` y envía el token en `Authorization`.
- También puede agregar `X-Tenant-Slug` o `X-Tenant-ID` de manera automática.
- El backend debe tratar estos encabezados como datos de contexto y no como fuente primaria de autorización.

## Recomendaciones

1. Evitar guardar tokens de sesión en `localStorage` cuando sea posible. Preferir cookies `httpOnly`, `secure`, `sameSite=strict` o un almacenamiento más seguro.
2. Si se mantiene `localStorage`, reducir al mínimo los datos sensibles guardados y no persistir tokens durante largos periodos.
3. Limitar el uso de `active_tenant_id` como única fuente de verdad para tenant. El frontend puede informar el tenant, pero el backend debe validar y verificarlo por cada petición.
4. Añadir validación de sesión activa contra el backend en la carga inicial de la app o mediante un endpoint de `me`/`session`.
5. Considerar un mecanismo de expiración/revocación centralizado que invalidice tokens en el servidor y obligue al frontend a reenviar login.
6. Mantener las rutas protegidas del frontend como una capa de UX, no como protección de seguridad definitiva.
7. Revisar el uso de `window.location.pathname.split("/")[2]` y otras heurísticas de tenant para evitar inferencias de tenant frágiles.

## Conclusión
El frontend actual funciona con un modelo de sesión basado en `localStorage` y control de rutas en la UI. Para mejorar la seguridad, es clave migrar los tokens a un almacenamiento más seguro, reforzar la validación del tenant en el backend y tratar las protecciones de rutas del frontend como complementarias, no sustitutivas, de la seguridad del servidor.
