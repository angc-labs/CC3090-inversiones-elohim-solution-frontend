# Frontend

Define cómo debe trabajar un agente de código dentro de `frontend/`.
Objetivo: cambios seguros, consistentes y fáciles de revisar.

---

## 1. Alcance

- Ruta objetivo: `frontend/`
- Framework: Next.js (App Router) con React + TypeScript
- Gestor de paquetes: `pnpm`
- Paquetes clave: `next@16.2.1`, `react@19.2.4`, `eslint@9`, `zustand`

**Documentación del proyecto:**

- `docs/RUTAS.md` — protección de rutas y menú admin
- `../backend/docs/endpoints.md` — API REST y Swagger
- Montos en UI: `formatGtq()` (GTQ)

---

## 2. Contexto del negocio

Elohim Shop es una tienda en línea para Inversiones Elohim S.A.
Las pantallas principales son:

- Login y registro de clientes
- Catálogo de productos con filtros por marca y categoría
- Detalle de producto con disponibilidad en tiempo real
- Carrito de compras y confirmación de reservación
- Historial de reservaciones del cliente
- Panel de administrador: dashboard, ventas, reportes, usuarios y productos (admin); cajero sin usuarios/productos
- Vista del cajero para validar reservaciones por código QR

Tener este contexto presente al evaluar qué componente o página corresponde a cada cambio.

---

## 3. Regla crítica de versión de Next.js

Esta versión puede diferir de convenciones anteriores.
Antes de proponer APIs o patrones poco comunes, revisar documentación local en:
```
frontend/node_modules/next/dist/docs/
```
No asumir comportamiento heredado de versiones antiguas sin validar.

---

## 4. Estructura de carpetas

```
frontend/
├── public/
├── src/
│   ├── app/                      # Rutas — App Router de Next.js
│   │   ├── layout.tsx            # Layout raíz
│   │   ├── page.tsx              # Página inicial
│   │   ├── globals.css
│   │   ├── (auth)/               # Login y registro
│   │   ├── catalogo/             # Catálogo de productos
│   │   ├── carrito/              # Carrito y checkout
│   │   └── admin/                # Panel administrativo
│   ├── components/
│   │   ├── ui/                   # Componentes genéricos (Button, Input, Modal...)
│   │   └── features/             # Componentes por funcionalidad
│   │       ├── catalogo/
│   │       ├── carrito/
│   │       └── auth/
│   ├── hooks/                    # Custom hooks para datos remotos
│   ├── stores/                   # Stores de Zustand
│   │   ├── useCarritoStore.ts
│   │   ├── useAuthStore.ts
│   │   └── useUiStore.ts
│   ├── lib/
│   │   ├── api/                  # Funciones para llamar al backend
│   │   └── utils/                # Helpers generales
│   └── types/                    # TypeScript types e interfaces
├── next.config.ts
├── eslint.config.mjs
└── package.json
```

---

## 5. Convenciones de código

```tsx
// Componentes → PascalCase, un archivo por componente
export function ProductoCard({ producto }: { producto: TProducto }) { }

// Hooks → camelCase con prefijo use
export function useProductos() { }

// Stores de Zustand → camelCase con prefijo use y sufijo Store
export const useCarritoStore = create<TCarritoStore>(...)

// Funciones y variables → camelCase
const obtenerProductos = async () => { }

// Types → PascalCase con prefijo T
type TProducto = { id: string; nombre: string; precio: number; }

// Interfaces → PascalCase con prefijo I
interface ICarritoItem { productoId: string; cantidad: number; }
```

**Reglas adicionales:**
- TypeScript estricto en todo momento. Prohibido usar `any` sin justificación técnica escrita en comentario
- Un archivo = un componente. Sin excepciones
- Cero `console.log` de debug en código final
- Cero código comentado. Si no se usa, se borra

---

## 6. Manejo de estado con Zustand

### Cuándo usar Zustand vs estado local

| Situación | Solución |
|---|---|
| Estado de un solo componente (ej. input abierto/cerrado) | `useState` local |
| Estado compartido entre varios componentes (ej. carrito) | Zustand store |
| Datos del servidor con loading/error | Custom hook + `useState` |
| Sesión del usuario autenticado | Zustand store (`useAuthStore`) |
| Estado de UI global (ej. modal, sidebar abierto) | Zustand store (`useUiStore`) |

**Regla:** si el estado cruza más de un componente o persiste entre navegaciones, va en un store. Si no, `useState` local.

### Estructura de un store

Cada store tiene su propio archivo en `stores/`. Separar estado, acciones y tipos.

```ts
// stores/useCarritoStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

type TCarritoItem = {
  productoId: string;
  nombre: string;
  precio: number;
  cantidad: number;
};

type TCarritoStore = {
  // Estado
  items: TCarritoItem[];
  // Acciones
  agregarItem: (item: TCarritoItem) => void;
  eliminarItem: (productoId: string) => void;
  cambiarCantidad: (productoId: string, cantidad: number) => void;
  limpiarCarrito: () => void;
  // Selectores derivados
  totalItems: () => number;
  totalPrecio: () => number;
};

export const useCarritoStore = create<TCarritoStore>()(
  persist(
    (set, get) => ({
      items: [],

      agregarItem: (item) =>
        set((state) => {
          const existe = state.items.find(i => i.productoId === item.productoId);
          if (existe) {
            return {
              items: state.items.map(i =>
                i.productoId === item.productoId
                  ? { ...i, cantidad: i.cantidad + item.cantidad }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),

      eliminarItem: (productoId) =>
        set((state) => ({
          items: state.items.filter(i => i.productoId !== productoId),
        })),

      cambiarCantidad: (productoId, cantidad) =>
        set((state) => ({
          items: state.items.map(i =>
            i.productoId === productoId ? { ...i, cantidad } : i
          ),
        })),

      limpiarCarrito: () => set({ items: [] }),

      totalItems: () => get().items.reduce((acc, i) => acc + i.cantidad, 0),

      totalPrecio: () => get().items.reduce((acc, i) => acc + i.precio * i.cantidad, 0),
    }),
    { name: "elohim-carrito" } // clave en localStorage
  )
);
```

### Store de autenticación

```ts
// stores/useAuthStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

type TUsuario = {
  id: string;
  nombre: string;
  email: string;
  rol: "cliente" | "cajero" | "admin";
};

type TAuthStore = {
  usuario: TUsuario | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (usuario: TUsuario, token: string) => void;
  logout: () => void;
};

export const useAuthStore = create<TAuthStore>()(
  persist(
    (set) => ({
      usuario: null,
      token: null,
      isAuthenticated: false,

      login: (usuario, token) =>
        set({ usuario, token, isAuthenticated: true }),

      logout: () =>
        set({ usuario: null, token: null, isAuthenticated: false }),
    }),
    { name: "elohim-auth" }
  )
);
```

### Store de UI global

```ts
// stores/useUiStore.ts
import { create } from "zustand";

type TUiStore = {
  sidebarAbierto: boolean;
  modalConfirmacion: boolean;
  toggleSidebar: () => void;
  abrirModalConfirmacion: () => void;
  cerrarModalConfirmacion: () => void;
};

export const useUiStore = create<TUiStore>((set) => ({
  sidebarAbierto: false,
  modalConfirmacion: false,
  toggleSidebar: () => set((state) => ({ sidebarAbierto: !state.sidebarAbierto })),
  abrirModalConfirmacion: () => set({ modalConfirmacion: true }),
  cerrarModalConfirmacion: () => set({ modalConfirmacion: false }),
}));
```

### Cómo consumir un store en un componente

Suscribirse solo al slice necesario, nunca al store completo. Esto evita re-renders innecesarios.

```tsx
// Bien — suscripción selectiva
export function BotonCarrito() {
  const totalItems = useCarritoStore(state => state.totalItems());
  return <button>Carrito ({totalItems})</button>;
}

// Mal — suscripción al store completo, re-renderiza con cualquier cambio
export function BotonCarrito() {
  const store = useCarritoStore();
  return <button>Carrito ({store.totalItems()})</button>;
}
```

### Reglas de stores

- Un store por dominio: `useCarritoStore`, `useAuthStore`, `useUiStore`
- Las acciones van dentro del store, no en los componentes
- Usar `persist` solo cuando el estado deba sobrevivir a un refresh de página
- No guardar datos del servidor en un store; esos van en hooks con `useState`
- No llamar al backend desde dentro de un store; las llamadas van en hooks o handlers

---

## 7. Reglas de componentes y páginas

Las páginas solo ensamblan componentes. La lógica va en hooks o stores.
Los componentes no hacen fetch directamente.

```tsx
// Bien
export function CarritoPage() {
  const items = useCarritoStore(state => state.items);
  const limpiarCarrito = useCarritoStore(state => state.limpiarCarrito);
  const { confirmarReservacion, isLoading, error } = useConfirmarReservacion();

  if (!items.length) return <EstadoVacio mensaje="Tu carrito está vacío" />;

  return (
    <div>
      {items.map(i => <CarritoItem key={i.productoId} item={i} />)}
      {error && <ErrorMessage mensaje={error} />}
      <button onClick={() => confirmarReservacion(items)} disabled={isLoading}>
        {isLoading ? "Confirmando..." : "Confirmar reservación"}
      </button>
      <button onClick={limpiarCarrito}>Vaciar carrito</button>
    </div>
  );
}
```

Siempre manejar los tres estados en pantallas con datos remotos: **carga**, **error** y **vacío**.

---

## 8. Llamadas al backend

Toda llamada al API va en `lib/api/`. Nunca hacer fetch fuera de esa carpeta.

```ts
// lib/api/productos.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function obtenerProductos(): Promise<TProducto[]> {
  const res = await fetch(`${API_URL}/api/productos`);
  if (!res.ok) throw new Error("Error al obtener productos");
  return res.json();
}
```

---

## 9. Custom hooks

Los hooks manejan datos remotos (loading, error, data). Los stores manejan estado global de la app.

```ts
// hooks/useProductos.ts
import { useState, useEffect } from "react";
import { obtenerProductos } from "@/lib/api/productos";

export function useProductos() {
  const [productos, setProductos] = useState<TProducto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    obtenerProductos()
      .then(setProductos)
      .catch(e => setError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  return { productos, isLoading, error };
}
```

---

## 10. Accesibilidad y UX mínima obligatoria

- Controles interactivos con etiqueta visible o atributo `aria-label`
- Jerarquía de encabezados correcta (`h1` → `h2` → `h3`)
- Contraste legible en texto y elementos de acción
- Navegación por teclado sin bloqueos evidentes
- Estados vacíos con mensaje útil para el usuario

---

## 11. Variables de entorno

- No hardcodear URLs en el código
- Usar `NEXT_PUBLIC_API_URL` para consumir el backend
- No exponer secretos en el cliente
- Si agregas una variable nueva, agrégala también a `.env.example` en la raíz

```bash
# .env.example
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 12. Comandos de trabajo (desde `frontend/`)

```bash
# Instalar dependencias
pnpm install

# Instalar Zustand si no está
pnpm add zustand

# Desarrollo
pnpm dev

# Lint
pnpm lint

# Build de verificación
pnpm build
```

---

## 13. Flujo recomendado para un cambio

1. Leer contexto del feature en los archivos afectados
2. Determinar si el estado nuevo va en `useState`, un hook o un store de Zustand
3. Implementar el cambio mínimo necesario
4. Correr `pnpm lint` y `pnpm build`
5. Reportar resultados y riesgos residuales

---

## 14. Definition of Done

Una tarea frontend se considera completa cuando:

- [ ] El cambio cumple el requerimiento funcional
- [ ] `pnpm lint` pasa sin errores nuevos
- [ ] `pnpm build` compila correctamente
- [ ] Se manejan estados de carga, error y vacío donde corresponde
- [ ] El estado nuevo está en el lugar correcto (`useState`, hook o store)
- [ ] No hay regresiones visibles en rutas afectadas
- [ ] Se documentan limitaciones o deuda técnica pendiente

---

## 15. Qué debe incluir la respuesta del agente

- **Resumen** del cambio realizado
- **Archivos modificados** con ruta completa
- **Comandos ejecutados** y su resultado
- **Riesgos** o tareas siguientes recomendadas

---

## 16. Qué NO hacer

- ❌ Fetch directo dentro de componentes o páginas
- ❌ Llamar al backend desde dentro de un store de Zustand
- ❌ Guardar datos del servidor en un store (para eso existen los hooks)
- ❌ Suscribirse al store completo en lugar de un slice específico
- ❌ Usar `any` sin justificación escrita en comentario
- ❌ Dos componentes en el mismo archivo
- ❌ Hardcodear URLs de ambiente en el código
- ❌ Exponer secretos en el cliente
- ❌ Modificar configuración global no relacionada con la tarea
- ❌ Introducir dependencias nuevas sin justificación directa
- ❌ `console.log` de debug en código final
- ❌ Ignorar estados de error o vacío en pantallas con datos remotos
```