export interface SchemaColumn {
  name: string;
  type: string;
  description: string;
  isPk?: boolean;
  isFk?: boolean;
  fkRef?: string;
  isNullable?: boolean;
  defaultValue?: string;
}

export interface SchemaTable {
  table: string;
  label: string;
  category: "Catálogo & Stock" | "Ventas & Pedidos" | "Usuarios & Sucursales" | "Configuración & Reportes";
  detail: string;
  description: string;
  columns: SchemaColumn[];
}

export interface SqlTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  sql: string;
}

export const SQL_KEYWORDS = [
  "SELECT", "FROM", "WHERE", "AND", "OR", "GROUP BY", "ORDER BY", "LIMIT", "OFFSET",
  "HAVING", "JOIN", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "FULL OUTER JOIN", "CROSS JOIN",
  "WITH", "AS", "COALESCE", "COUNT", "SUM", "AVG", "MIN", "MAX", "ROUND",
  "NOW()", "CURRENT_TIMESTAMP", "DATE_TRUNC", "CASE", "WHEN", "THEN", "ELSE",
  "END", "ILIKE", "LIKE", "IN", "EXISTS", "NOT EXISTS", "IS NULL", "IS NOT NULL",
  "ASC", "DESC", "ON", "DISTINCT", "UNION", "ALL", "BETWEEN", "CAST", "EXTRACT"
];

export const SCHEMA_TABLES: SchemaTable[] = [
  {
    table: 'public."Producto"',
    label: 'Producto',
    category: "Catálogo & Stock",
    detail: 'Catálogo de productos, precios y niveles de stock',
    description: 'Contiene los productos creados en la tienda con sus precios al detalle/mayoreo e inventario actual.',
    columns: [
      { name: "id", type: "VARCHAR(255)", description: "Identificador único (UUID)", isPk: true, isNullable: false },
      { name: "tienda_id", type: "VARCHAR(255)", description: "ID del inquilino (Tienda)", isFk: true, fkRef: 'public."Tienda".id', isNullable: false },
      { name: "categoria_id", type: "VARCHAR(255)", description: "Categoría asociada", isFk: true, fkRef: 'public."Categoria".id', isNullable: true },
      { name: "nombre", type: "VARCHAR(150)", description: "Nombre del producto", isNullable: false },
      { name: "descripcion", type: "TEXT", description: "Descripción detallada", isNullable: true },
      { name: "sku", type: "VARCHAR(100)", description: "Código SKU único", isNullable: true },
      { name: "precio_detalle", type: "NUMERIC(18,2)", description: "Precio de venta al detalle", isNullable: false },
      { name: "precio_mayoreo", type: "NUMERIC(18,2)", description: "Precio de venta al mayoreo", isNullable: false },
      { name: "stock_actual", type: "INTEGER", description: "Cantidad total de unidades disponibles", isNullable: false, defaultValue: "0" },
      { name: "stock_minimo", type: "INTEGER", description: "Umbral de alerta para stock crítico", isNullable: false, defaultValue: "0" },
      { name: "imagen_url", type: "VARCHAR(500)", description: "URL de la imagen del producto", isNullable: true },
      { name: "publicado", type: "BOOLEAN", description: "Visible en el catálogo público", isNullable: false, defaultValue: "true" },
      { name: "eliminado", type: "BOOLEAN", description: "Estado de borrado lógico", isNullable: false, defaultValue: "false" },
      { name: "fecha_creacion", type: "TIMESTAMPTZ", description: "Fecha de registro", isNullable: false, defaultValue: "NOW()" }
    ]
  },
  {
    table: 'public."Reservacion"',
    label: 'Reservacion',
    category: "Ventas & Pedidos",
    detail: 'Órdenes, compras y reservaciones realizadas',
    description: 'Registra los pedidos de clientes, montos totales, estados de pago (pagado, pendiente) y despacho.',
    columns: [
      { name: "id", type: "VARCHAR(255)", description: "Identificador único de la orden/venta (UUID)", isPk: true, isNullable: false },
      { name: "tienda_id", type: "VARCHAR(255)", description: "ID del inquilino (Tienda)", isFk: true, fkRef: 'public."Tienda".id', isNullable: false },
      { name: "sucursal_id", type: "VARCHAR(255)", description: "Sucursal donde se retira o atiende", isFk: true, fkRef: 'public."Sucursal".id', isNullable: false },
      { name: "usuario_id", type: "VARCHAR(255)", description: "ID del usuario o cliente que ordenó", isFk: true, fkRef: 'public."user".id', isNullable: false },
      { name: "monto_total", type: "NUMERIC(18,2)", description: "Total monetario de la orden", isNullable: false },
      { name: "estado_pago", type: "VARCHAR(30)", description: "Estado del pago ('pendiente', 'pagado', 'cancelado')", isNullable: false, defaultValue: "'pendiente'" },
      { name: "estado_despacho", type: "VARCHAR(30)", description: "Estado de despacho ('procesando', 'listo', 'entregado', 'cancelado')", isNullable: false, defaultValue: "'procesando'" },
      { name: "stripe_intent_id", type: "VARCHAR(255)", description: "ID de transacción con tarjeta en Stripe", isNullable: true },
      { name: "fecha_reserva", type: "TIMESTAMPTZ", description: "Fecha y hora de creación de la orden", isNullable: false, defaultValue: "NOW()" }
    ]
  },
  {
    table: 'public."DetalleReservacion"',
    label: 'DetalleReservacion',
    category: "Ventas & Pedidos",
    detail: 'Líneas de detalle de productos en cada orden/venta',
    description: 'Desglose de cada producto comprado dentro de una orden con su cantidad, precio cobrado y subtotal.',
    columns: [
      { name: "id", type: "VARCHAR(255)", description: "Identificador único de la línea de detalle (UUID)", isPk: true, isNullable: false },
      { name: "reservacion_id", type: "VARCHAR(255)", description: "ID de la reservación padre", isFk: true, fkRef: 'public."Reservacion".id', isNullable: false },
      { name: "producto_id", type: "VARCHAR(255)", description: "ID del producto vendido", isFk: true, fkRef: 'public."Producto".id', isNullable: false },
      { name: "cantidad", type: "INTEGER", description: "Número de unidades adquiridas", isNullable: false },
      { name: "precio_cobrado", type: "NUMERIC(18,2)", description: "Precio unitario cobrado en la compra", isNullable: false },
      { name: "subtotal", type: "NUMERIC(18,2)", description: "Subtotal calculado (cantidad * precio_cobrado)", isNullable: false }
    ]
  },
  {
    table: 'public."Categoria"',
    label: 'Categoria',
    category: "Catálogo & Stock",
    detail: 'Categorías y secciones de productos',
    description: 'Clasificación de productos dentro del catálogo comercial de la tienda.',
    columns: [
      { name: "id", type: "VARCHAR(255)", description: "Identificador único (UUID)", isPk: true, isNullable: false },
      { name: "tienda_id", type: "VARCHAR(255)", description: "ID del inquilino (Tienda)", isFk: true, fkRef: 'public."Tienda".id', isNullable: false },
      { name: "nombre", type: "VARCHAR(100)", description: "Nombre de la categoría", isNullable: false },
      { name: "descripcion", type: "TEXT", description: "Descripción de la categoría", isNullable: true },
      { name: "slug", type: "VARCHAR(100)", description: "Slug único para URLs", isNullable: false },
      { name: "imagen_url", type: "VARCHAR(500)", description: "Imagen destacada de categoría", isNullable: true }
    ]
  },
  {
    table: 'public."Sucursal"',
    label: 'Sucursal',
    category: "Usuarios & Sucursales",
    detail: 'Sucursales y puntos de venta físicos',
    description: 'Ubicaciones físicas operadas por la tienda donde se gestiona inventario y entregas.',
    columns: [
      { name: "id", type: "VARCHAR(255)", description: "Identificador único (UUID)", isPk: true, isNullable: false },
      { name: "tienda_id", type: "VARCHAR(255)", description: "ID del inquilino (Tienda)", isFk: true, fkRef: 'public."Tienda".id', isNullable: false },
      { name: "nombre", type: "VARCHAR(100)", description: "Nombre de la sucursal", isNullable: false },
      { name: "direccion", type: "TEXT", description: "Dirección física", isNullable: true },
      { name: "telefono", type: "VARCHAR(30)", description: "Teléfono de contacto", isNullable: true },
      { name: "fecha_creacion", type: "TIMESTAMPTZ", description: "Fecha de registro", isNullable: false, defaultValue: "NOW()" }
    ]
  },
  {
    table: 'public."Inventario"',
    label: 'Inventario',
    category: "Catálogo & Stock",
    detail: 'Stock discriminado por sucursal específica',
    description: 'Mapea la cantidad de existencias de cada producto en cada sucursal física de la empresa.',
    columns: [
      { name: "id", type: "VARCHAR(255)", description: "Identificador único del registro (UUID)", isPk: true, isNullable: false },
      { name: "tienda_id", type: "VARCHAR(255)", description: "ID del inquilino (Tienda)", isFk: true, fkRef: 'public."Tienda".id', isNullable: false },
      { name: "sucursal_id", type: "VARCHAR(255)", description: "ID de la sucursal", isFk: true, fkRef: 'public."Sucursal".id', isNullable: false },
      { name: "producto_id", type: "VARCHAR(255)", description: "ID del producto", isFk: true, fkRef: 'public."Producto".id', isNullable: false },
      { name: "stock", type: "INTEGER", description: "Existencias en dicha sucursal", isNullable: false }
    ]
  },
  {
    table: 'public."user"',
    label: 'user',
    category: "Usuarios & Sucursales",
    detail: 'Clientes y miembros del equipo staff',
    description: 'Tabla de usuarios autenticados. Contiene clientes registrados y colaboradores (administradores, cajeros). Nota: requiere comillas dobles public."user".',
    columns: [
      { name: "id", type: "VARCHAR(255)", description: "Identificador único del usuario (UUID)", isPk: true, isNullable: false },
      { name: "tienda_id", type: "VARCHAR(255)", description: "ID del inquilino (null para cuentas globales)", isFk: true, fkRef: 'public."Tienda".id', isNullable: true },
      { name: "name", type: "VARCHAR(255)", description: "Nombre completo del usuario", isNullable: false },
      { name: "email", type: "VARCHAR(255)", description: "Correo electrónico", isNullable: false },
      { name: "emailVerified", type: "BOOLEAN", description: "Si verificó su correo electrónico", isNullable: false },
      { name: "tipo_usuario", type: "VARCHAR(30)", description: "Tipo: 'cliente', 'staff', 'administrador'", isNullable: false },
      { name: "rol_staff", type: "VARCHAR(30)", description: "Rol de staff: 'administrador', 'cajero', 'superadmin'", isNullable: true },
      { name: "telefono", type: "VARCHAR(30)", description: "Número de teléfono", isNullable: true },
      { name: "stripe_customer_id", type: "VARCHAR(255)", description: "ID de cliente en Stripe", isNullable: true },
      { name: "estado", type: "BOOLEAN", description: "Estado activo (true) o suspendido (false)", isNullable: false, defaultValue: "true" },
      { name: "sucursal_id", type: "VARCHAR(255)", description: "Sucursal asignada si es staff", isFk: true, fkRef: 'public."Sucursal".id', isNullable: true },
      { name: "createdAt", type: "TIMESTAMPTZ", description: "Fecha de registro", isNullable: false },
      { name: "updatedAt", type: "TIMESTAMPTZ", description: "Última modificación", isNullable: false }
    ]
  },
  {
    table: 'public."CarritoElemento"',
    label: 'CarritoElemento',
    category: "Ventas & Pedidos",
    detail: 'Productos en carritos de compra activos',
    description: 'Artículos actualmente en el carrito de compras pendientes de confirmación por clientes.',
    columns: [
      { name: "id", type: "VARCHAR(255)", description: "Identificador único (UUID)", isPk: true, isNullable: false },
      { name: "tienda_id", type: "VARCHAR(255)", description: "ID del inquilino", isFk: true, fkRef: 'public."Tienda".id', isNullable: false },
      { name: "usuario_id", type: "VARCHAR(255)", description: "ID del cliente", isFk: true, fkRef: 'public."user".id', isNullable: false },
      { name: "producto_id", type: "VARCHAR(255)", description: "ID del producto", isFk: true, fkRef: 'public."Producto".id', isNullable: false },
      { name: "cantidad", type: "INTEGER", description: "Cantidad agregada", isNullable: false },
      { name: "fecha_adicion", type: "TIMESTAMPTZ", description: "Fecha de adición al carrito", isNullable: false, defaultValue: "NOW()" }
    ]
  },
  {
    table: 'public."Tienda"',
    label: 'Tienda',
    category: "Configuración & Reportes",
    detail: 'Información y configuración general de la tienda',
    description: 'Datos principales del inquilino, slug, estado y tema visual.',
    columns: [
      { name: "id", type: "VARCHAR(255)", description: "ID de la tienda (igual a @tenant_id)", isPk: true, isNullable: false },
      { name: "nombre", type: "VARCHAR(100)", description: "Nombre comercial de la tienda", isNullable: false },
      { name: "slug", type: "VARCHAR(100)", description: "Slug único para acceso público", isNullable: false },
      { name: "estado", type: "VARCHAR(20)", description: "Estado operativo ('activo', 'inactivo')", isNullable: false, defaultValue: "'activo'" },
      { name: "configuracion_visual", type: "JSONB", description: "Esquema JSON con colores y estilos", isNullable: false, defaultValue: "'{}'" },
      { name: "fecha_creacion", type: "TIMESTAMPTZ", description: "Fecha de creación del comercio", isNullable: false, defaultValue: "NOW()" }
    ]
  },
  {
    table: 'public."ReportePersonalizado"',
    label: 'ReportePersonalizado',
    category: "Configuración & Reportes",
    detail: 'Consultas SQL y reportes guardados por el usuario',
    description: 'Almacena consultas SQL personalizadas creadas por administradores para reutilización.',
    columns: [
      { name: "id", type: "VARCHAR(255)", description: "Identificador del reporte (UUID)", isPk: true, isNullable: false },
      { name: "tienda_id", type: "VARCHAR(255)", description: "ID de la tienda", isFk: true, fkRef: 'public."Tienda".id', isNullable: false },
      { name: "nombre", type: "VARCHAR(150)", description: "Título del reporte", isNullable: false },
      { name: "descripcion", type: "TEXT", description: "Descripción del propósito del reporte", isNullable: true },
      { name: "query_sql", type: "TEXT", description: "Sentencia SQL SELECT", isNullable: false },
      { name: "creado_por", type: "VARCHAR(255)", description: "Usuario creador", isNullable: true },
      { name: "fecha_creacion", type: "TIMESTAMPTZ", description: "Fecha de guardado", isNullable: false, defaultValue: "NOW()" }
    ]
  }
];

export const SQL_QUERY_TEMPLATES: SqlTemplate[] = [
  {
    id: "ventas-detalle",
    title: "Detalle de Ventas y Productos Vendidos",
    description: "Consulta el historial de ventas pagadas junto con el desglose de productos, cantidades y subtotales.",
    category: "Ventas",
    sql: `-- Detalle de Ventas / Productos Vendidos
SELECT 
    r.id AS venta_id,
    r.fecha_reserva,
    r.estado_pago,
    p.nombre AS producto,
    d.cantidad,
    d.precio_cobrado,
    d.subtotal
FROM public."DetalleReservacion" d
JOIN public."Reservacion" r ON d.reservacion_id = r.id
JOIN public."Producto" p ON d.producto_id = p.id
WHERE r.tienda_id = @tenant_id
ORDER BY r.fecha_reserva DESC
LIMIT 50;`
  },
  {
    id: "stock-critico",
    title: "Productos con Stock Crítico",
    description: "Lista de productos cuyas existencias actuales están en o por debajo del stock mínimo configurado.",
    category: "Inventario",
    sql: `-- Productos con Stock Crítico o Agotado
SELECT 
    p.id,
    p.nombre,
    p.sku,
    p.precio_detalle,
    p.stock_actual,
    p.stock_minimo,
    (p.stock_minimo - p.stock_actual) AS faltante
FROM public."Producto" p
WHERE p.tienda_id = @tenant_id 
  AND p.stock_actual <= p.stock_minimo
  AND p.eliminado = false
ORDER BY p.stock_actual ASC;`
  },
  {
    id: "top-productos",
    title: "Top 10 Productos Más Vendidos",
    description: "Calcula los productos más populares por unidades totales vendidas e ingresos generados.",
    category: "Ventas",
    sql: `-- Top 10 Productos Más Vendidos
SELECT 
    p.nombre AS producto,
    c.nombre AS categoria,
    SUM(d.cantidad) AS unidades_vendidas,
    SUM(d.subtotal) AS ingresos_generados
FROM public."DetalleReservacion" d
JOIN public."Reservacion" r ON d.reservacion_id = r.id
JOIN public."Producto" p ON d.producto_id = p.id
LEFT JOIN public."Categoria" c ON p.categoria_id = c.id
WHERE r.tienda_id = @tenant_id AND r.estado_pago = 'pagado'
GROUP BY p.nombre, c.nombre
ORDER BY unidades_vendidas DESC
LIMIT 10;`
  },
  {
    id: "ventas-sucursal",
    title: "Rendimiento y Ventas por Sucursal",
    description: "Agrupa el volumen total de pedidos, recaudación y ticket promedio para cada sucursal física.",
    category: "Sucursales",
    sql: `-- Rendimiento de Ventas por Sucursal
SELECT 
    s.nombre AS sucursal,
    COUNT(r.id) AS total_pedidos,
    SUM(r.monto_total) AS ingresos_totales,
    ROUND(AVG(r.monto_total), 2) AS ticket_promedio
FROM public."Reservacion" r
JOIN public."Sucursal" s ON r.sucursal_id = s.id
WHERE r.tienda_id = @tenant_id AND r.estado_pago = 'pagado'
GROUP BY s.nombre
ORDER BY ingresos_totales DESC;`
  },
  {
    id: "top-clientes",
    title: "Clientes Frecuentes y Monto Gastado",
    description: "Lista los clientes con mayor cantidad de órdenes pagadas y gasto acumulado.",
    category: "Clientes",
    sql: `-- Clientes con Mayor Volumen de Compra
SELECT 
    u.id,
    u.name AS cliente,
    u.email,
    u.telefono,
    COUNT(r.id) AS compras_realizadas,
    SUM(r.monto_total) AS total_invertido
FROM public."Reservacion" r
JOIN public."user" u ON r.usuario_id = u.id
WHERE r.tienda_id = @tenant_id AND r.estado_pago = 'pagado'
GROUP BY u.id, u.name, u.email, u.telefono
ORDER BY total_invertido DESC
LIMIT 25;`
  },
  {
    id: "inventario-sucursales",
    title: "Existencias de Stock por Sucursal",
    description: "Detalle del inventario específico de cada producto por sucursal física.",
    category: "Inventario",
    sql: `-- Inventario Desglosado por Sucursal
SELECT 
    s.nombre AS sucursal,
    p.nombre AS producto,
    p.sku,
    i.stock
FROM public."Inventario" i
JOIN public."Sucursal" s ON i.sucursal_id = s.id
JOIN public."Producto" p ON i.producto_id = p.id
WHERE i.tienda_id = @tenant_id
ORDER BY s.nombre, p.nombre;`
  }
];
