# Rutas y protección — Frontend

## Panel admin (`/admin/*`)

| Ruta | Protección | Roles |
|------|------------|-------|
| `/admin` | `AdminRoute` | admin, cajero |
| `/admin/ventas` | `AdminRoute` | admin, cajero |
| `/admin/reportes` | `AdminRoute` | admin, cajero |
| `/admin/usuarios` | `AdminRoute` + solo admin en API/nav | admin |
| `/admin/productos` | `AdminRoute` + solo admin en API/nav | admin |

**No disponible en menú:** inventario, stock crítico, pedidos.

Componentes: `AdminRoute`, `GuestAuthGate`, `ClientAuthGate` (`ClientRoute`).

## Tienda cliente

Rutas con `ClientAuthGate` en su `layout.tsx`:

- `/home`, `/catalogo`, `/carrito`, `/perfil`, `/reservas`, `/cambiar-contrase`, `/transferencia_bancaria`, etc.

## Auth pública

- `/login`, `/register` — `GuestAuthGate` redirige si ya hay sesión.

## Lógica central

`src/lib/auth-routes.ts` — `getPostLoginPath`, `isAdminPanelRol`, `isAdminOnlyPath`, etc.

## Moneda

Montos en UI con `formatGtq()` (`src/lib/format.ts`) — quetzales (GTQ).

## Diseño responsive

- Panel admin: menú lateral en escritorio; drawer con botón ☰ en móvil (`app/(admin)/layout.tsx`).
- Tablas admin y reportes: scroll horizontal en pantallas pequeñas (`overflow-x-auto`).
- KPIs admin: 1 → 2 → 4 columnas según breakpoint.
- Tienda / checkout: grids y cabeceras con clases `sm:` / `lg:`.
