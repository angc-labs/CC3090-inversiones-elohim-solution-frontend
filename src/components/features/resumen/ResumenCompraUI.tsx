"use client";

import { useRouter } from "next/navigation";
import { descargarResumenHTML } from "./ResumenCompraHTML";
import type { ResumenCompraHTMLProps } from "./ResumenCompraHTML";
import { RESUMEN_REACT_CLASSES } from "./resumenStyles";

export interface ResumenCompraUIProps extends ResumenCompraHTMLProps {}

export function ResumenCompraUI({
  items,
  totalPrecio,
  metodoPagoSeleccionado,
}: ResumenCompraUIProps) {
  const router = useRouter();
  const formatearMetodo = (metodo: string): string => {
    const map: Record<string, string> = {
      transferencia: "Transferencia Bancaria",
      tarjeta: "Tarjeta de Crédito/Débito",
      efectivo: "Efectivo",
      paypal: "PayPal",
    };
    return map[metodo] || metodo;
  };

  const handleDescargar = () => {
    descargarResumenHTML({ items, totalPrecio, metodoPagoSeleccionado });
  };

  const handleNext = () => {
    // TODO: Crear orden en base de datos
    // Por ahora solo redirigir a confirmación
    router.push("/confirmacion");
  };

  return (
    <div className={RESUMEN_REACT_CLASSES.resumenContainer}>
      {/* Header */}
      <div className={RESUMEN_REACT_CLASSES.resumenHeader}>
        <h2 className={RESUMEN_REACT_CLASSES.resumenTitle}>Resumen de tu compra</h2>
        <p className={RESUMEN_REACT_CLASSES.resumenSubtitle}>
          Revisa los detalles antes de confirmar tu orden
        </p>
      </div>

      {/* Tabla de productos */}
      <div className={RESUMEN_REACT_CLASSES.tablaContainer}>
        <div className={RESUMEN_REACT_CLASSES.tablaScroll}>
          <table className={RESUMEN_REACT_CLASSES.tabla}>
            <thead className={RESUMEN_REACT_CLASSES.tablaHead}>
              <tr>
                <th className={RESUMEN_REACT_CLASSES.tablaHeaderCell}>Producto</th>
                <th className={`${RESUMEN_REACT_CLASSES.tablaHeaderCell} ${RESUMEN_REACT_CLASSES.tablaCantidadHeader}`}>
                  Cantidad
                </th>
                <th className={`${RESUMEN_REACT_CLASSES.tablaHeaderCell} ${RESUMEN_REACT_CLASSES.tablaPrecioHeader}`}>
                  Precio
                </th>
                <th className={`${RESUMEN_REACT_CLASSES.tablaHeaderCell} ${RESUMEN_REACT_CLASSES.tablaSubtotalHeader}`}>
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.productoId} className={RESUMEN_REACT_CLASSES.tablaBody}>
                  <td className={RESUMEN_REACT_CLASSES.tablaCell}>{item.nombreProducto}</td>
                  <td className={RESUMEN_REACT_CLASSES.tablaCantidad}>
                    {item.cantidad}
                  </td>
                  <td className={RESUMEN_REACT_CLASSES.tablaPrecio}>
                    ${item.precio.toFixed(2)}
                  </td>
                  <td className={RESUMEN_REACT_CLASSES.tablaSubtotal}>
                    ${(item.precio * item.cantidad).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className={RESUMEN_REACT_CLASSES.totalSection}>
          <span className={RESUMEN_REACT_CLASSES.totalLabel}>Total a pagar:</span>
          <span className={RESUMEN_REACT_CLASSES.totalAmount}>${totalPrecio.toFixed(2)}</span>
        </div>
      </div>

      {/* Método de pago */}
      <div className={RESUMEN_REACT_CLASSES.metodoPagoContainer}>
        <h3 className={RESUMEN_REACT_CLASSES.metodoPagoTitle}>Método de pago</h3>
        <div className={RESUMEN_REACT_CLASSES.metodoPagoBox}>
          <div className={RESUMEN_REACT_CLASSES.metodoPagoCheckmark}>✓</div>
          <span className={RESUMEN_REACT_CLASSES.metodoPagoTexto}>
            {metodoPagoSeleccionado?.metodo
              ? formatearMetodo(metodoPagoSeleccionado.metodo) +
                (metodoPagoSeleccionado.alias ? ` (${metodoPagoSeleccionado.alias})` : "")
              : "No especificado"}
          </span>
        </div>
      </div>

      {/* Botones de acción */}
      <div className={RESUMEN_REACT_CLASSES.botonesContainer}>
        <button
          onClick={handleDescargar}
          className={RESUMEN_REACT_CLASSES.botonDescargar}
          title="Descargar resumen de compra como archivo HTML"
        >
          <svg
            className={RESUMEN_REACT_CLASSES.iconoDescarga}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Descargar Resumen
        </button>
        <button
          onClick={handleNext}
          className={RESUMEN_REACT_CLASSES.botonConfirmar}
          title="Confirmar y crear orden"
        >
          Confirmar Orden
        </button>
      </div>
    </div>
  );
}
