export type TProducto = {
  idProducto: string;
  codigoProducto: string;
  nombreProducto: string;
  precio: number;
  stockActual: number;
  stockMinimo?: number;
  descripcion?: string;
  idMarca?: string;
  categoriaId?: string;
  fechaVencimiento?: string;
  imagenPrincipal?: string;
  fechaCreacion?: string;
  fechaActualizacion?: string;
};

export type TMarca = {
  id: string;
  nombreMarca: string;
  descripcion?: string;
};

export type TCategoria = {
  id: string;
  nombreCategoria: string;
  descripcion?: string;
  fechaCreacion?: string;
};

export type TCarritoItemApi = {
  articuloId: string;
  productoId: string;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
};

export type TCarritoApi = {
  carritoId: string;
  items: TCarritoItemApi[];
  total: number;
};

export type TEstadoReserva = "pendiente" | "confirmada" | "cancelada";

export type TReserva = {
  reservaId: string;
  usuarioId: string;
  fechaReserva: string;
  estado: TEstadoReserva;
  total: number;
  items: TReservaItem[];
  fechaConfirmacion?: string;
  fechaCancelacion?: string;
};

export type TReservaItem = {
  reservaItemId: string;
  productoId: string;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
};

export type TReservacionItem = {
  productoId: string;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
};

/** Ítem del listado `GET /api/reservacion` (sin detalle de productos). */
export type TReservacionListado = {
  idReservacion: string;
  codigoReservacion: string;
  clienteId: string;
  estado: string;
  totalReservacion: number;
  pagado: boolean;
  fechaLimiteRetiro: string;
};

/** Respuesta de `/api/reservacion` alineada con el backend (JSON camelCase). */
export type TReservacion = {
  idReservacion: string;
  codigoReservacion: string;
  clienteId?: string;
  estado: string;
  totalReservacion: number;
  metodoPagoId?: string | null;
  /** Indica si el método de pago está vinculado a Stripe (tarjeta). */
  metodoEsTarjeta?: boolean;
  stripePaymentIntentId?: string | null;
  pagado: boolean;
  observaciones?: string | null;
  fechaLimiteRetiro: string;
  items: TReservacionItem[];
};

export type TMetodoPagoGuardado = {
  idMetodoPago: string;
  nombreMetodo: string;
  stripePaymentMethodId?: string | null;
  alias?: string | null;
  marcaTarjeta?: string | null;
  ultimosDigitos?: string | null;
  expiraMes?: number | null;
  expiraAnio?: number | null;
};

export type SearchSuggestion = {
  id: string;
  type: "product" | "category" | "brand";
  label: string;
  value: string;
  product?: {
    idProducto: string;
    nombreProducto: string;
    precio: number;
    imagenPrincipal?: string;
  };
};
