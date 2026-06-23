# Guía del Panel de Configuración de Integraciones

El portal administrativo ofrece una interfaz centralizada para que los administradores sincronicen su tienda con servicios externos. Estas configuraciones se almacenan de manera encriptada y segura en la tabla `CredencialesIntegracion` de PostgreSQL y son consumidas en tiempo de ejecución por el backend.

El panel se encuentra en la pestaña **"Configuración del Sistema"** dentro del Portal de Administración.

---

## 1. Pasarela de Pagos (Stripe)

Permite habilitar cobros con tarjetas de crédito y débito a los clientes finales durante el checkout de reservación.

* **Campos Requeridos**:
  * **Stripe Public Key (pk_test_...)**: Llave pública utilizada por el SDK de Stripe en el frontend para generar tokens seguros de tarjetas de forma directa sin tocar los servidores del backend.
  * **Stripe Secret Key (sk_test_...)**: Llave secreta utilizada por el backend C# para instanciar intenciones de cobro (`PaymentIntent`) e interactuar de forma segura con la API de Stripe.
* **Flujo**:
  * Las transacciones se realizan directamente contra la cuenta de Stripe del tenant.
  * Se requiere la configuración de webhooks en Stripe apuntando a `https://<tu-api-domain>/api/pagos/webhook` para actualizar los estados de las reservaciones a `"pagado"` de forma automática en segundo plano.

---

## 2. Almacenamiento Multimedia (Cloudinary)

Soporta la carga rápida de imágenes de productos y logos de la tienda a la nube, evitando saturar el servidor local del backend.

* **Campos Requeridos**:
  * **Cloudinary Cloud Name**: Nombre único asignado a tu cuenta/nube en Cloudinary.
  * **Cloudinary API Key**: Identificador de tu aplicación.
  * **Cloudinary API Secret**: Clave secreta para autorizar peticiones de borrado y subida firmadas.
* **Funcionamiento**:
  * Cuando editas un producto o subes un logo, la interfaz del portal se conecta al controlador `/api/v1/media/upload`.
  * La API utiliza estas credenciales para enviar el archivo binario directamente al almacenamiento de Cloudinary y retorna la URL optimizada con HTTPS lista para guardarse en la entidad del producto.

---

## 3. Servidor de Correo Emisor (SMTP)

Permite a la tienda enviar de manera autónoma correos de restablecimiento de contraseña y alertas a los clientes sin depender de servicios de mensajería compartidos.

* **Campos Requeridos**:
  * **Correo de Envío (SMTP)**: Dirección de correo electrónico emisora (ej. `soporte-esmira@gmail.com`).
  * **Contraseña de Aplicación**: En caso de Gmail u Outlook, no se debe usar la contraseña personal. Se debe activar la verificación en dos pasos y generar una **Contraseña de Aplicación** de 16 caracteres dentro del panel de seguridad de la cuenta.
* **Comportamiento**:
  * El sistema autodetecta la configuración del servidor SMTP óptimo en base al dominio del correo (soporta `Gmail` y `Outlook/Hotmail` automáticamente).
  * Los correos se envían en formato HTML con plantillas responsivas.
