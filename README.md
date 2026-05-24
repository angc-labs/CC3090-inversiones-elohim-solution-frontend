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

## Panel admin

Menú lateral: Dashboard, Productos (solo admin), Ventas, Reportes, Usuarios (solo admin).

Gráficos (Recharts) usan `ChartContainer` / `ChartTooltip` de `src/components/ui/chart.tsx`.
