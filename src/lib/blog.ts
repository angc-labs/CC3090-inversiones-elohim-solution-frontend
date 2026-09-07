export type BlogSection = {
  title: string;
  paragraphs: string[];
};

export type BlogPost = {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  readTime: string;
  challenge: BlogSection;
  solution: BlogSection;
  flow: string[];
  features: string[];
  result: string;
};

const cases = [
  ["almacen-la-28", "Retail", "Almacén La 28 convirtió su catálogo en un canal de ventas", "Un catálogo organizado, stock visible y pedidos que llegan listos para preparar.", "almacen-la-28.jpg", "12 ago 2026", "5 min"],
  ["cafe-bosque", "Alimentos", "Café Bosque dejó de perder pedidos en mensajes", "Una experiencia de compra clara para vender sus mezclas desde cualquier dispositivo.", "cafe-bosque.jpg", "05 ago 2026", "4 min"],
  ["estudio-loto", "Servicios", "Estudio Loto ordenó sus reservas en una sola vista", "Menos cruces de agenda y más tiempo para atender a cada cliente.", "estudio-loto.jpg", "28 jul 2026", "6 min"],
  ["mundo-mascota", "Retail", "Mundo Mascota centralizó inventario entre sucursales", "La operación pasó de hojas de cálculo dispersas a decisiones en tiempo real.", "mundo-mascota.jpg", "19 jul 2026", "5 min"],
  ["finca-la-nube", "Alimentos", "Finca La Nube empezó a vender productos de temporada", "Una vitrina digital para contar el origen de cada producto y tomar pedidos.", "finca-la-nube.jpg", "11 jul 2026", "4 min"],
  ["taller-norte", "Servicios", "Taller Norte redujo el tiempo de confirmación", "Cada solicitud tiene un estado y cada cliente sabe qué ocurre después.", "taller-norte.jpg", "30 jun 2026", "5 min"],
  ["casa-minima", "Retail", "Casa Mínima diseñó una tienda a la medida", "La identidad de la marca ahora acompaña cada paso de la compra.", "casa-minima.jpg", "21 jun 2026", "4 min"],
  ["pan-de-barrio", "Alimentos", "Pan de Barrio convirtió sus preventas en rutina", "Pedidos agrupados, cortes claros y una operación lista para crecer.", "pan-de-barrio.jpg", "13 jun 2026", "5 min"],
  ["ruta-verde", "Servicios", "Ruta Verde coordinó entregas sin llamadas", "Una operación más visible para el equipo y más confiable para sus clientes.", "ruta-verde.jpg", "02 jun 2026", "6 min"],
  ["tinta-viva", "Retail", "Tinta Viva lanzó su primera tienda online", "De una colección pequeña a una experiencia de marca lista para vender.", "tinta-viva.jpg", "24 may 2026", "4 min"],
] as const;

export const blogPosts: BlogPost[] = cases.map(([slug, category, title, excerpt, image, date, readTime]) => ({
  slug,
  category,
  title,
  excerpt,
  image: `/blog/${image}`,
  date,
  readTime,
  challenge: {
    title: "El reto",
    paragraphs: ["La operación crecía, pero las herramientas no acompañaban el ritmo. La información estaba repartida y cada pedido exigía demasiado trabajo manual.", "El equipo necesitaba una experiencia simple para sus clientes y una vista confiable para tomar decisiones cada día."],
  },
  solution: {
    title: "La solución",
    paragraphs: ["Con DM Hub, el negocio reunió catálogo, pedidos, clientes y configuración visual en un solo lugar.", "La tienda se construyó con secciones flexibles, manteniendo la personalidad de la marca sin sacrificar velocidad ni claridad."],
  },
  flow: ["El cliente descubre la colección y consulta disponibilidad.", "Elige sus productos o servicio y confirma el pedido.", "El equipo recibe la orden, actualiza su estado y prepara la entrega.", "La información queda disponible para mejorar la siguiente decisión."],
  features: ["Constructor visual sin código", "Inventario por sucursal", "Pedidos y reservas centralizados", "Pagos con Stripe", "Reportes operativos"],
  result: "Una operación más clara, una experiencia de compra más consistente y una base digital preparada para el siguiente paso.",
})) satisfies BlogPost[];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
