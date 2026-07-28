# Esquema de Autenticación Unificado

El sistema implementa una arquitectura de sesión unificada basada en la estructura de tablas de **Better-Auth** (tablas `user`, `session`, `account` y `verification`). Esto permite compartir de manera segura los datos de autenticación entre la aplicación Next.js y el backend C# (.NET Core).

---

## 1. Flujo de Autenticación y Persistencia

1. **Almacenamiento de Sesiones (Base de Datos)**:
   * Cuando un usuario inicia sesión o se registra, la API crea un registro de sesión en la tabla `session` de PostgreSQL, asignándole un token único y una fecha de expiración (por defecto de 1 mes).
   * La tabla de usuarios mapea tanto al perfil del staff como al del cliente final.

2. **Mapeo de Almacenamiento Frontend (Zustand)**:
   * La aplicación Next.js gestiona dos almacenes de estado distintos con **Zustand** persistidos en `localStorage`:
     * **`useAuthStore`** (Persistencia: `elohim-auth`): Gestiona la sesión del personal administrativo/staff (`admin`, `cajero`, `superadmin`).
     * **`useClientAuthStore`** (Persistencia: `elohim-client-auth`): Gestiona las sesiones de clientes finales (`cliente`).

3. **Arquitectura Multi-Sesión en Clientes**:
   Dado que una tienda puede tener múltiples dominios o subdominios independientes, un mismo cliente puede tener sesiones abiertas en diferentes tiendas simultáneamente. 
   El almacén `useClientAuthStore` almacena un diccionario indexado por `tiendaId` en el campo `sessions`:
   ```typescript
   sessions: Record<string, { cliente: TCliente; token: string; expiraEn: number }>;
   ```
   Al cambiar de tenant o navegar por diferentes tiendas, el selector `selectTenant(tiendaId)` carga automáticamente el token y la sesión correspondiente a esa tienda, o bien restablece el estado de invitado.

4. **Sincronización con el Backend**:
   * Las peticiones HTTP salientes desde el cliente de la API del frontend incluyen el token correspondiente en la cabecera `Authorization: Bearer <token>`.
   * El backend intercepta esta cabecera (o las cookies equivalentes como `better-auth.session_token`) en el `BetterAuthSessionMiddleware`, valida el registro en la tabla `session` y genera los claims de autorización correspondientes.

---

## 2. Diferencias entre Cliente y Staff/Administrador

### Clientes (`cliente`)
- **Almacén Frontend**: `useClientAuthStore`
- **Ámbito (Scope)**: Vinculado exclusivamente a la tienda (`tienda_id`) donde se registró.
- **Roles Soportados**: `cliente`
- **Permisos de Escritura**: Solo lectura del catálogo, creación de reservaciones y gestión de métodos de pago propios.
- **Resolución en Login**: Se busca primero el perfil de staff de manera global. Si no existe, se busca el cliente filtrado por el tenant activo.
- **Redirección Post-Login**: `/portal` (acceso a sus reservas y estado).

### Staff / Administrador (`staff`)
- **Almacén Frontend**: `useAuthStore`
- **Ámbito (Scope)**: Global (con privilegios regulados según sucursal y rol de staff).
- **Roles Soportados**: `cajero`, `administrador`, `superadmin`
- **Permisos de Escritura**: Gestión de productos, control de stock, ver y despachar reservaciones, modificar visuales.
- **Resolución en Login**: Se busca globalmente y se mapea a su tienda de origen.
- **Redirección Post-Login**: Redirige al panel `/admin` (dashboard, ventas, productos).
