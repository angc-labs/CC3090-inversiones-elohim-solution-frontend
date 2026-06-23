# Estructura de Rutas y Control de Acceso

La navegación y el acceso a páginas del frontend en Next.js se rigen por un esquema de protección basado en roles de usuario (`cliente`, `cajero`, `admin`, `superadmin`) y controles de hidratación del estado de Zustand.

---

## 1. Mapa de Rutas Activas

### Rutas Públicas (Storefront y Landing)
* **`/`** (Root):
  * **Acceso**: Público (Inquilinos/Clientes).
  * **Propósito**: Muestra la página principal de la tienda resolviendo el subdominio o tenant actual. Renderiza las secciones dinámicas del constructor visual.
* **`/preview/[id]`**:
  * **Acceso**: Público.
  * **Propósito**: Permite previsualizar en vivo los cambios realizados en el constructor de tiendas antes de que el administrador decida publicarlos de forma definitiva.

### Rutas de Autenticación de Staff (`(auth)`)
Protegidas por [GuestAuthGate.tsx](file:///home/angc_/Dev/CC3090-inversiones-elohim-solution/frontend/src/components/features/auth/GuestAuthGate.tsx). Redirigen a `/portal` si ya existe una sesión activa y válida.
* **`/login`**: Inicio de sesión para administradores, cajeros y personal de la tienda.
* **`/register`**: Creación de cuentas y registro para dueños de nuevas tiendas.
* **`/recuperar`**: Solicitud de código OTP de recuperación.
* **`/new-password`**: Definición de nueva contraseña tras verificar la clave OTP.

### Rutas Protegidas del Cliente Final
Protegidas por [ClientProtectedRoute.tsx](file:///home/angc_/Dev/CC3090-inversiones-elohim-solution/frontend/src/components/features/auth/ClientProtectedRoute.tsx).
* **`/portal`** (Perfil del Cliente):
  * **Propósito**: Panel donde los clientes autenticados visualizan su historial de reservaciones y configuran sus métodos de pago guardados.
* **`/reservas`**:
  * **Propósito**: Flujo de Checkout donde se selecciona la sucursal de retiro y se procesa el pago seguro con tarjeta a través de Stripe.

### Portal Administrativo / Dashboard del Staff
Integrado dentro del contenedor del Portal para administradores y cajeros:
* **`/portal`** (Modo Staff):
  * **Propósito**: Panel de control general de la tienda. Contiene el Constructor de Tiendas, Rejilla de Productos, Ventas, Reportes Personalizados, Administración de Cajeros/Staff y la pestaña de Integraciones.

---

## 2. Mecanismos de Control de Acceso

La lógica de protección de rutas y permisos se centraliza en [auth-routes.ts](file:///home/angc_/Dev/CC3090-inversiones-elohim-solution/frontend/src/lib/auth-routes.ts):

* **`ADMIN_PANEL_PREFIX`** (`/admin`):
  Filtra que el rol del usuario sea del personal de la tienda (`admin` o `cajero`).
* **`ADMIN_ONLY_PATHS`** (`/admin/usuarios`, `/admin/productos`):
  Filtra rutas que solo el rol administrador puede alterar (los cajeros tienen acceso denegado).
* **`CLIENT_PROTECTED_PREFIXES`** (`/portal`, `/reservas`):
  Rutas que exigen una sesión de cliente activa para ver datos de compra y pasarelas de pago.

### Componentes Puerta (Gates)

1. **`ClientProtectedRoute`**:
   * Envuelve las páginas de reservación y checkout.
   * Si el usuario no está logueado, interrumpe el renderizado y muestra en su lugar un formulario modal integrado con pestañas de **"Iniciar Sesión"** y **"Crear Cuenta"** estilizado para la tienda actual.
2. **`GuestAuthGate`**:
   * Envuelve las páginas de login y registro de administración.
   * Si detecta una sesión válida, redirige automáticamente al usuario al portal para evitar accesos redundantes.
