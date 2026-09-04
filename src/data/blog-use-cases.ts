export type BlogUseCase = {
  id: number;
  category: string;
  title: string;
  scenario: string;
  actor: string;
  goal: string;
  benefit: string;
  actions: string[];
  flow: string[];
  impact: string;
  icon: "cart" | "gaming" | "pickup" | "mobile" | "users" | "health" | "security" | "wholesale" | "coffee" | "pet";
  accent: "emerald" | "violet" | "sky" | "amber" | "rose";
};

export const BLOG_USE_CASES: BlogUseCase[] = [
  {
    id: 5,
    category: "Ferretería y talleres",
    title: "Un carrito B2B que espera al cliente",
    scenario:
      "Un taller mecánico prepara una compra grande de tornillos, hace una pausa y regresa días después para terminarla.",
    actor: "encargado de compras de un taller",
    goal: "recuperar mi carrito y completar el pedido cuando tenga la aprobación",
    benefit: "continuar una compra mayorista sin reconstruirla desde cero",
    actions: ["Iniciar sesión", "Recuperar carrito", "Confirmar pedido"],
    flow: [
      "El comprador inicia sesión con su cuenta y vuelve a la tienda.",
      "La plataforma recupera los artículos y cantidades guardados.",
      "El comprador revisa el stock, ajusta la orden y la confirma.",
      "El personal consulta el detalle y prepara las cajas solicitadas.",
    ],
    impact:
      "La persistencia del carrito reduce fricción en compras empresariales que requieren más de una sesión.",
    icon: "cart",
    accent: "emerald",
  },
  {
    id: 6,
    category: "Tecnología",
    title: "Una PC de alto rendimiento, pieza por pieza",
    scenario:
      "Un cliente busca los componentes principales para armar una computadora y quiere reservarlos en una sola orden.",
    actor: "cliente gamer",
    goal: "encontrar mis componentes, pagarlos y seguir el avance de la orden",
    benefit: "asegurar piezas de alto valor sin coordinar cada compra por separado",
    actions: ["Explorar catálogo", "Pagar con Stripe", "Seguir la orden"],
    flow: [
      "El cliente explora el catálogo y localiza GPU, procesador y memoria.",
      "Añade los componentes disponibles al carrito.",
      "Completa el pago seguro con tarjeta y recibe el identificador de su reservación.",
      "El equipo de la sucursal prepara la orden y actualiza su estado hasta el despacho.",
    ],
    impact:
      "El recorrido conecta catálogo, pago y operación interna en una compra de alto valor.",
    icon: "gaming",
    accent: "violet",
  },
  {
    id: 12,
    category: "Automotriz",
    title: "Llantas listas en la sucursal adecuada",
    scenario:
      "Un conductor necesita cuatro neumáticos y quiere recogerlos en la ubicación que puede atender su vehículo.",
    actor: "conductor",
    goal: "comprar las llantas y elegir una sucursal para retirarlas",
    benefit: "llegar con la certeza de que mi pedido está reservado y listo",
    actions: ["Revisar stock", "Elegir sucursal", "Reservar inventario"],
    flow: [
      "El cliente abre la ficha del producto y confirma la disponibilidad.",
      "Añade cuatro llantas al carrito y selecciona la sucursal de retiro.",
      "La reservación aparta las unidades del inventario disponible.",
      "El personal prepara el pedido y lo marca como despachado al entregarlo.",
    ],
    impact:
      "La tienda digital y la operación física comparten el mismo flujo de inventario y entrega.",
    icon: "pickup",
    accent: "sky",
  },
  {
    id: 15,
    category: "Repuestos agrícolas",
    title: "Una emergencia en campo resuelta desde el móvil",
    scenario:
      "Una finca tiene un tractor detenido y necesita asegurar una banda de transmisión antes de viajar a la tienda.",
    actor: "administrador de una finca",
    goal: "reservar el repuesto urgente desde mi teléfono",
    benefit: "evitar un viaje en vano y reducir el tiempo de inactividad del tractor",
    actions: ["Comprar desde móvil", "Reservar", "Retirar en sucursal"],
    flow: [
      "El administrador busca el repuesto desde el storefront móvil.",
      "Confirma la cantidad y elige la sucursal rural para el retiro.",
      "La orden aparece en el tablero operativo del personal.",
      "El encargado alista la pieza y completa el despacho al entregarla.",
    ],
    impact:
      "El diseño responsivo y las reservaciones convierten una urgencia operativa en un proceso predecible.",
    icon: "mobile",
    accent: "amber",
  },
  {
    id: 19,
    category: "Uniformes",
    title: "Temporada alta sin perder el control",
    scenario:
      "Muchas familias compran uniformes durante la misma semana y el equipo necesita ordenar el volumen de pedidos.",
    actor: "padre o madre de familia",
    goal: "comprar los uniformes y seleccionar un punto de retiro conveniente",
    benefit: "resolver la compra escolar aun durante los días de mayor demanda",
    actions: ["Comprar en línea", "Elegir retiro", "Consultar estado"],
    flow: [
      "Cada familia selecciona sus productos y la sucursal correspondiente.",
      "La plataforma registra las reservaciones y mantiene el stock actualizado.",
      "El personal recibe los pedidos nuevos en el tablero Kanban.",
      "Las tarjetas avanzan de pendiente a verificada y finalmente a despachada.",
    ],
    impact:
      "El tablero compartido ayuda al equipo a priorizar y procesar un pico de demanda con trazabilidad.",
    icon: "users",
    accent: "rose",
  },
  {
    id: 21,
    category: "Farmacia",
    title: "Retiro express antes de empezar el día",
    scenario:
      "Un cliente necesita vitaminas y productos de cuidado personal antes de ir al trabajo.",
    actor: "cliente con poco tiempo",
    goal: "reservar mis productos en una sucursal que quede en mi ruta",
    benefit: "recogerlos rápidamente sin recorrer pasillos ni hacer fila para buscarlos",
    actions: ["Añadir productos", "Seleccionar sucursal", "Retiro express"],
    flow: [
      "El cliente agrega los productos disponibles al carrito.",
      "Elige pago contra entrega y selecciona la sucursal de su ruta.",
      "El equipo del turno recibe la reservación y prepara el paquete.",
      "Al llegar, el cliente paga y recibe una orden ya organizada.",
    ],
    impact:
      "El modelo click and collect convierte la conveniencia en una ventaja concreta para el comercio local.",
    icon: "health",
    accent: "emerald",
  },
  {
    id: 25,
    category: "Seguridad de cuenta",
    title: "Recuperar el acceso sin perder la compra",
    scenario:
      "Una clienta olvida su contraseña cuando ya está lista para continuar con su jornada de compras.",
    actor: "clienta que olvidó su contraseña",
    goal: "restablecer mi acceso mediante un código de un solo uso",
    benefit: "volver a la tienda de forma segura y continuar mi compra",
    actions: ["Solicitar código", "Validar OTP", "Crear contraseña"],
    flow: [
      "La clienta solicita recuperar su contraseña con el correo de su cuenta.",
      "El sistema envía un código OTP temporal.",
      "La clienta valida el código y define una contraseña nueva.",
      "Inicia sesión nuevamente y continúa usando la tienda.",
    ],
    impact:
      "La recuperación guiada protege la cuenta y evita que un problema de acceso interrumpa la experiencia.",
    icon: "security",
    accent: "violet",
  },
  {
    id: 26,
    category: "Abarrotes B2B",
    title: "Abastecimiento mayorista con seguimiento visual",
    scenario:
      "El dueño de una tienda de barrio compra productos por caja y necesita saber cuándo puede retirar la carga.",
    actor: "propietario de una tienda de barrio",
    goal: "hacer un pedido mayorista y seguir su preparación",
    benefit: "coordinar el retiro de mercadería sin llamadas ni mensajes adicionales",
    actions: ["Comprar por volumen", "Generar orden", "Seguir Kanban"],
    flow: [
      "El comprador inicia sesión, arma el pedido y confirma las cantidades.",
      "Selecciona una sucursal y genera la reservación.",
      "El personal verifica la orden y prepara los productos por caja.",
      "El estado cambia conforme la carga queda lista para su despacho.",
    ],
    impact:
      "La trazabilidad del pedido simplifica la coordinación entre el comprador y el equipo de bodega.",
    icon: "wholesale",
    accent: "amber",
  },
  {
    id: 27,
    category: "Café especializado",
    title: "Una ficha de producto que cuenta la historia",
    scenario:
      "Un amante del café compara granos de altura y filtros antes de decidir qué reservar.",
    actor: "comprador de café especializado",
    goal: "conocer los detalles de cada producto antes de añadirlo al carrito",
    benefit: "elegir con confianza una opción acorde con mis gustos",
    actions: ["Ver detalle", "Comparar productos", "Reservar"],
    flow: [
      "El cliente explora el catálogo y abre la ficha del producto.",
      "Revisa descripción, fotografías, precio y disponibilidad.",
      "Selecciona la cantidad sin superar el stock existente.",
      "Añade el producto al carrito y reserva el retiro en la cafetería.",
    ],
    impact:
      "Un catálogo enriquecido transforma información de producto en confianza para comprar.",
    icon: "coffee",
    accent: "sky",
  },
  {
    id: 29,
    category: "Mascotas",
    title: "Productos voluminosos, retiro sin complicaciones",
    scenario:
      "Un cliente compra un saco grande de alimento y una cama para su mascota, por lo que prefiere retirarlos en automóvil.",
    actor: "dueño de una mascota",
    goal: "pagar en línea y elegir una sucursal cómoda para cargar mi pedido",
    benefit: "recibir productos voluminosos sin esperar a que los preparen",
    actions: ["Pagar con tarjeta", "Elegir sucursal", "Recoger pedido"],
    flow: [
      "El cliente revisa el stock y añade ambos productos al carrito.",
      "Completa el pago seguro con su método de tarjeta.",
      "La sucursal recibe la reservación y prepara el pedido.",
      "El cliente llega al área de retiro y recibe los artículos listos para cargar.",
    ],
    impact:
      "La compra anticipada mejora el retiro de artículos pesados y reduce el tiempo de atención en tienda.",
    icon: "pet",
    accent: "rose",
  },
];
