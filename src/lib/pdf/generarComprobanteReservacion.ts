import { TReservacion } from "@/types";

/**
 * Genera un comprobante PDF de la reservación
 * Usa HTML + CSS para crear un documento descargable
 */
export async function generarComprobanteReservacion(reservacion: TReservacion) {
  // Importar dinámicamente jsPDF y html2canvas
  const { jsPDF } = await import("jspdf");
  const html2canvas = await import("html2canvas");

  // Crear elemento HTML con el contenido del comprobante
  const element = document.createElement("div");
  element.style.width = "210mm";
  element.style.padding = "20px";
  element.style.backgroundColor = "#ffffff";
  element.style.fontFamily = "Arial, sans-serif";
  element.style.color = "#1e293b";

  // Fecha actual
  const fechaActual = new Date().toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Contenido HTML del comprobante
  element.innerHTML = `
    <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px;">
      <div style="font-size: 28px; font-weight: bold; color: #1e40af; margin-bottom: 5px;">ESMIRNA</div>
      <div style="font-size: 12px; color: #64748b;">Tienda Online - Inversiones Elohim S.A.</div>
      <div style="font-size: 12px; color: #64748b;">Comprobante de Reservación</div>
    </div>

    <div style="margin-bottom: 20px;">
      <table style="width: 100%; font-size: 12px; color: #475569;">
        <tr>
          <td style="width: 50%; vertical-align: top;">
            <div style="margin-bottom: 10px;">
              <span style="font-weight: bold; color: #1e293b;">Número de Reservación:</span><br/>
              <span style="font-size: 16px; font-weight: bold; color: #1e40af;">${reservacion.codigoReservacion}</span>
            </div>
            <div style="margin-bottom: 10px;">
              <span style="font-weight: bold; color: #1e293b;">ID Reservación:</span><br/>
              <span style="font-size: 11px;">${reservacion.idReservacion}</span>
            </div>
            <div>
              <span style="font-weight: bold; color: #1e293b;">Fecha de Emisión:</span><br/>
              <span>${fechaActual}</span>
            </div>
          </td>
          <td style="width: 50%; text-align: right; vertical-align: top;">
            <div style="margin-bottom: 10px;">
              <span style="font-weight: bold; color: #1e293b;">Estado:</span><br/>
              <span style="display: inline-block; padding: 4px 12px; border-radius: 20px; background-color: ${
                reservacion.pagado ? "#dcfce7" : "#fed7aa"
              }; color: ${
    reservacion.pagado ? "#166534" : "#b45309"
  }; font-weight: bold; font-size: 12px;">
                ${reservacion.pagado ? "PAGADO" : "PENDIENTE"}
              </span>
            </div>
            <div style="margin-bottom: 10px;">
              <span style="font-weight: bold; color: #1e293b;">Método de Pago:</span><br/>
              <span>${
                reservacion.metodoPagoId === "tarjeta-credito"
                  ? "Tarjeta de Crédito"
                  : reservacion.metodoPagoId === "transferencia"
                    ? "Transferencia Bancaria"
                    : "Efectivo en Mostrador"
              }</span>
            </div>
            <div>
              <span style="font-weight: bold; color: #1e293b;">Fecha Límite Retiro:</span><br/>
              <span>${new Date(reservacion.fechaLimiteRetiro).toLocaleDateString("es-ES")}</span>
            </div>
          </td>
        </tr>
      </table>
    </div>

    <div style="margin-bottom: 20px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px;">
      <div style="font-weight: bold; margin-bottom: 15px; color: #1e293b;">PRODUCTOS</div>
      <table style="width: 100%; font-size: 11px; color: #475569;">
        <thead>
          <tr style="border-bottom: 2px solid #e2e8f0;">
            <th style="text-align: left; padding-bottom: 8px; font-weight: bold; color: #1e293b;">Producto</th>
            <th style="text-align: center; padding-bottom: 8px; font-weight: bold; color: #1e293b; width: 60px;">Cantidad</th>
            <th style="text-align: right; padding-bottom: 8px; font-weight: bold; color: #1e293b; width: 80px;">Precio Unit.</th>
            <th style="text-align: right; padding-bottom: 8px; font-weight: bold; color: #1e293b; width: 80px;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${reservacion.items
            .map(
              (item) => `
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 8px 0;">${item.nombreProducto}</td>
              <td style="text-align: center; padding: 8px 0;">${item.cantidad}</td>
              <td style="text-align: right; padding: 8px 0;">Q ${item.precioUnitario.toFixed(2)}</td>
              <td style="text-align: right; padding: 8px 0; font-weight: bold;">Q ${item.subtotal.toFixed(2)}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>

    <div style="margin-bottom: 20px; text-align: right;">
      <table style="width: 300px; margin-left: auto; font-size: 12px; color: #475569;">
        <tr>
          <td style="font-weight: bold; text-align: left; padding: 8px 0;">Subtotal:</td>
          <td style="text-align: right; padding: 8px 0;">Q ${reservacion.totalReservacion.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="font-weight: bold; text-align: left; padding: 8px 0;">Envío:</td>
          <td style="text-align: right; padding: 8px 0;">Q 0.00</td>
        </tr>
        <tr>
          <td style="font-weight: bold; text-align: left; padding: 8px 0;">Impuesto:</td>
          <td style="text-align: right; padding: 8px 0;">Q 0.00</td>
        </tr>
        <tr style="border-top: 2px solid #1e40af; border-bottom: 2px solid #1e40af;">
          <td style="font-weight: bold; color: #1e293b; padding: 12px 0;">TOTAL:</td>
          <td style="text-align: right; font-size: 18px; font-weight: bold; color: #1e40af; padding: 12px 0;">Q ${reservacion.totalReservacion.toFixed(2)}</td>
        </tr>
      </table>
    </div>

    ${
      reservacion.metodoPagoId === "transferencia" && reservacion.observaciones
        ? `
      <div style="margin-bottom: 20px; border: 1px solid #fed7aa; border-radius: 8px; padding: 15px; background-color: #fffbeb;">
        <div style="font-weight: bold; margin-bottom: 8px; color: #b45309;">REFERENCIA DE TRANSFERENCIA</div>
        <div style="font-size: 14px; font-weight: bold; color: #92400e; word-break: break-all;">${reservacion.observaciones}</div>
      </div>
    `
        : ""
    }

    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; text-align: center;">
      <p style="margin: 0 0 5px 0;">
        <strong>Fecha de emisión:</strong> ${new Date().toLocaleDateString("es-ES", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
      <p style="margin: 5px 0;">
        Conserva este comprobante para tu registro.
      </p>
      <p style="margin: 5px 0; color: #94a3b8;">
        Este es un comprobante digital de tu reservación.
      </p>
    </div>
  `;

  // Agregar elemento temporalmente al DOM
  document.body.appendChild(element);

  try {
    // Convertir elemento HTML a canvas
    const canvas = await html2canvas.default(element, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
    });

    // Crear documento PDF (A4)
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgData = canvas.toDataURL("image/png");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Calcular altura manteniendo proporción
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    // Si la imagen es más larga que una página, crear múltiples páginas
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Descargar PDF
    pdf.save(
      `comprobante-${reservacion.codigoReservacion}-${new Date().getTime()}.pdf`
    );
  } finally {
    // Remover elemento temporal
    document.body.removeChild(element);
  }
}
