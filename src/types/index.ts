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