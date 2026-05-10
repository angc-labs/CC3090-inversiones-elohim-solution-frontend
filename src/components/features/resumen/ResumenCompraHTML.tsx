import type { TCarritoItemApi } from "@/types";
import type { TMetodoPagoSeleccionado } from "@/stores/useMetodoPagoStore";
import { RESUMEN_HTML_STYLES } from "./resumenStyles";

export type ResumenCompraHTMLProps = {
  items: TCarritoItemApi[];
  totalPrecio: number;
  metodoPagoSeleccionado: TMetodoPagoSeleccionado | null;
};

const formatearMetodo = (metodo: string): string => {
  const map: Record<string, string> = {
    transferencia: "Transferencia Bancaria",
    tarjeta: "Tarjeta de Crédito/Débito",
    efectivo: "Efectivo",
    paypal: "PayPal",
  };
  return map[metodo] || metodo;
};

export const generarResumenHTML = ({
  items,
  totalPrecio,
  metodoPagoSeleccionado,
}: ResumenCompraHTMLProps): string => {
  const fecha = new Date();
  const fechaFormato = fecha.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const metodoTexto = metodoPagoSeleccionado?.metodo
    ? formatearMetodo(metodoPagoSeleccionado.metodo) +
      (metodoPagoSeleccionado.alias ? ` (${metodoPagoSeleccionado.alias})` : "")
    : "No especificado";

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Resumen de Compra - ESMIRNA</title>
      <style>
        ${RESUMEN_HTML_STYLES}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚡ ESMIRNA</h1>
          <p>Resumen de tu Compra</p>
        </div>
        
        <div class="content">
          <div class="section">
            <h2>Detalles de Productos</h2>
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th class="cantidad">Cantidad</th>
                  <th class="precio">Precio Unitario</th>
                  <th class="subtotal">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${items
                  .map(
                    (item) => `
                  <tr>
                    <td>${item.nombreProducto}</td>
                    <td class="cantidad">${item.cantidad}</td>
                    <td class="precio">Q ${item.precioUnitario.toFixed(2)}</td>
                    <td class="subtotal">Q ${item.subtotal.toFixed(2)}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>

          <div class="total-section">
            <span class="total-label">TOTAL A PAGAR:</span>
            <span class="total-amount">Q ${totalPrecio.toFixed(2)}</span>
          </div>

          <div class="section">
            <h2>Método de Pago</h2>
            <div class="metodo-pago">
              <span class="metodo-label">Tipo:</span>
              <span class="metodo-valor">${metodoTexto}</span>
            </div>
          </div>
        </div>

        <div class="footer">
          <p><strong>Gracias por tu compra 🎉</strong></p>
          <p>Este es un comprobante de tu pedido. Consérvalo para tus registros.</p>
          <div class="timestamp">
            <p>Generado: ${fechaFormato}</p>
            <p>© 2026 ESMIRNA - Todos los derechos reservados</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const descargarResumenHTML = ({
  items,
  totalPrecio,
  metodoPagoSeleccionado,
}: ResumenCompraHTMLProps): void => {
  const resumenHTML = generarResumenHTML({
    items,
    totalPrecio,
    metodoPagoSeleccionado,
  });

  const blob = new Blob([resumenHTML], { type: "text/html;charset=utf-8" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  const fecha = new Date();

  const nombreArchivo = `resumen-compra-${fecha.getTime()}.html`;
  link.setAttribute("href", url);
  link.setAttribute("download", nombreArchivo);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};
