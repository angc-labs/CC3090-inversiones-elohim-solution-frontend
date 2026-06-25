# Frontend — Esmira Shop

Next.js 16 (App Router) + React 19 + TypeScript + Tailwind + shadcn/ui.

## Desarrollo

```bash
pnpm install
pnpm dev
```

Variables: `NEXT_PUBLIC_API_URL` (ej. `http://localhost:5000`).

## Documentación

- **[docs/RUTAS.md](docs/RUTAS.md)** — rutas protegidas (admin, cliente, auth)
- Monorepo: [backend/docs/endpoints.md](../backend/docs/endpoints.md), [backend/README.md](../backend/README.md)

## Panel admin / Portal de Gestión

El portal administrativo de la aplicación (`/portal`) organiza la gestión en las siguientes pestañas modulares:
* **Tablero**: Dashboard de métricas clave del negocio y ventas con gráficos.
* **Sucursales**: Creación y asignación de sucursales físicas para el control de inventario.
* **Clientes**: Visualización y gestión de clientes registrados en el inquilino.
* **Usuarios**: Gestión de personal staff (asignación de roles `cajero` / `admin` y asociación a sucursales).
* **Productos**: Catálogo de productos, control de stock por sucursal, categorías y precios diferenciados.
* **Reservaciones**: Listado operativo de pedidos y estado de despacho.
* **Pagos**: Control y verificación de transacciones y facturación.
* **Tablero Kanban**: Flujo visual interactivo de pedidos en tiempo real con 3 columnas (*Pendiente de Pago*, *Pago Verificado* y *Despachado*). Incorpora:
  - Consulta automática (polling) cada 6 segundos con pausa en arrastre.
  - Alertas sonoras sintetizadas con Web Audio API.
  - Gestión restringida: sólo accesible para cajeros, administradores y superadmins.
* **Reportes**: Exportación de datos de ventas e inventario en formatos Excel y CSV.
* **Configuración**: Conexión de pasarelas de pago (Stripe Connect), carga de imágenes (Cloudinary) y envío de correos (SMTP).

## Constructor Visual de Tiendas

Ubicado en `/portal/constructor`, permite diseñar la tienda pública del inquilino:
* Gestión de secciones tipo drag & drop / reordenamiento.
* Configuración de tipografía, colores del sistema, héroes, anuncios y grillas.
* **Respaldo & Clonación**: Funcionalidad de **Exportar JSON** (genera un archivo `.json` de configuración visual local) e **Importar JSON** (permite restaurar un diseño guardado de forma instantánea).

## Gráficos e Interfaz

Los gráficos (Recharts) usan `ChartContainer` / `ChartTooltip` de `src/components/ui/chart.tsx`.
La interfaz visual adopta una estética oscura premium basada en CSS nativo y Tailwind CSS, con efectos de glassmorphism y micro-animaciones (GSAP en Landing Page).
