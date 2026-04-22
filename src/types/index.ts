export type TProducto = {
  idProducto: string;
  codigoProducto: string;
  nombreProducto: string;
  precio: number;
  stockActual: number;
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