# Constructor de Tiendas (Store Builder) - Documentación de Configuración Visual

El **Constructor de Tiendas** es una herramienta visual interactiva que permite a los administradores y superadministradores de la plataforma personalizar el diseño, los colores y el contenido de su tienda en tiempo real.

Esta personalización se guarda en el backend de forma persistente y se almacena en la columna `configuracion_visual` (tipo `jsonb`) de la tabla `Tienda`.

---

## 1. Esquema JSON de Configuración Visual

La configuración visual se estructura como un objeto que contiene una colección de secciones (`sections`). Cada sección representa un bloque de construcción visual en la interfaz del cliente final.

A continuación, se detalla el esquema JSON por defecto utilizado por la plataforma:

```json
{
  "sections": [
    {
      "id": "announcement",
      "type": "announcement",
      "name": "Announcement Bar",
      "properties": {
        "bannerText": "FREE SHIPPING ON ORDERS OVER $500 • USE CODE LOGISTIC10",
        "backgroundColor": "#1AB38C",
        "textColor": "#FFFFFF",
        "fontWeight": "Bold",
        "stickyBanner": true,
        "verticalPadding": 8,
        "linkAction": "Open Link",
        "linkUrl": "https://store.com/promo"
      }
    },
    {
      "id": "header",
      "type": "header",
      "name": "Header",
      "properties": {
        "storeName": "Nombre de la Tienda",
        "logoUrl": "",
        "menuItems": ["New Arrivals", "Logistics Tools", "Business Edition"]
      }
    },
    {
      "id": "hero",
      "type": "hero",
      "name": "Hero Section",
      "properties": {
        "title": "Master Your Distribution Strategy",
        "subtitle": "Commercial grade inventory systems designed for the modern logistics operator.",
        "primaryButtonText": "Shop Collection",
        "secondaryButtonText": "View Catalog",
        "backgroundColor": "#0F172A",
        "backgroundImage": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200",
        "textColor": "#FFFFFF"
      }
    },
    {
      "id": "products",
      "type": "products",
      "name": "Product Grid",
      "properties": {
        "title": "Featured Essentials",
        "columns": 3,
        "productsCount": 3
      }
    },
    {
      "id": "footer",
      "type": "footer",
      "name": "Footer",
      "properties": {
        "copyrightText": "© 2026 Nombre de la Tienda. All rights reserved.",
        "backgroundColor": "#0F172A",
        "textColor": "#94A3B8"
      }
    }
  ]
}
```

### Detalle de las Secciones y Propiedades

1. **Announcement Bar (`announcement`)**
   - `bannerText` (string): Mensaje a mostrar en la barra superior.
   - `backgroundColor` (hex string): Color de fondo de la barra.
   - `textColor` (hex string): Color del texto.
   - `fontWeight` (string): Estilo de la fuente (`Normal`, `Bold`, `Italic`).
   - `stickyBanner` (boolean): Si la barra superior permanece fija al hacer scroll.
   - `verticalPadding` (number): Relleno superior/inferior en píxeles.
   - `linkAction` (string): Acción al pulsar (`None`, `Open Link`).
   - `linkUrl` (string): Dirección URL para el enlace.

2. **Header (`header`)**
   - `storeName` (string): Nombre visible de la tienda en la cabecera.
   - `logoUrl` (string): URL de la imagen del logotipo.
   - `menuItems` (array of strings): Enlaces de navegación en el menú.

3. **Hero Section (`hero`)**
   - `title` (string): Título principal llamativo.
   - `subtitle` (string): Descripción de soporte.
   - `primaryButtonText` (string): Texto del botón de acción principal.
   - `secondaryButtonText` (string): Texto del botón de acción secundario.
   - `backgroundColor` (hex string): Color de fondo en caso de no haber imagen.
   - `backgroundImage` (string URL): Imagen de fondo de la sección principal.
   - `textColor` (hex string): Color del texto sobre el fondo.

4. **Product Grid (`products`)**
   - `title` (string): Título de la rejilla de productos destacados.
   - `columns` (number): Número de columnas en la visualización (2, 3 o 4).
   - `productsCount` (number): Límite de productos a renderizar de forma destacada.

5. **Footer (`footer`)**
   - `copyrightText` (string): Texto de derechos de autor y créditos.
   - `backgroundColor` (hex string): Color de fondo del pie de página.
   - `textColor` (hex string): Color del texto.

---

## 2. API de Integración con el Backend

### Persistencia de la Configuración Visual

* **Endpoint:** `PUT /api/v1/tiendas/configuracion-visual`
* **Headers requeridos:**
  - `Authorization`: `Bearer <token>` (o a través del manejo de la sesión por Cookies de Better Auth).
  - `Content-Type`: `application/json`
* **Cuerpo de la petición:** El objeto completo de configuración serializado como un objeto JSON o JSON String (dependiendo de la firma del endpoint del backend).
* **Respuesta Exitosa (200 OK):**
  ```json
  {
    "mensaje": "Configuración visual actualizada correctamente",
    "configuracionVisual": { ... }
  }
  ```

---

## 3. Arquitectura del Constructor de Tienda en el Frontend

### Detalles de Componentes de la Interfaz:

1. **Panel Izquierdo (Structure Tree):**
   - Muestra de forma secuencial las secciones del sitio.
   - Permite seleccionar cuál sección se desea configurar activamente.
   - Ofrece controles para reordenar o añadir nuevas secciones.

2. **Panel Central (Interactive Viewport):**
   - Renderiza un iframe o una réplica DOM interactiva de la plantilla del cliente final.
   - Reacciona en tiempo real a los cambios que el usuario aplica en el panel de propiedades.
   - Permite cambiar el tamaño del contenedor para simular resoluciones de **Escritorio**, **Tableta** o **Dispositivos Móviles**.

3. **Panel Derecho (Control Panel / Inspector):**
   - Muestra dinámicamente los campos editables dependiendo del tipo de la sección actualmente seleccionada.
   - Utiliza selectores de color nativos, barras de rango deslizantes, campos de texto y combos selectores.
   - Incluye el botón **"Publicar Cambios"**, que realiza la llamada API y actualiza el estado de la aplicación.
