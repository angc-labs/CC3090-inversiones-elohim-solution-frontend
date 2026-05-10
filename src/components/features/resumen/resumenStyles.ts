/**
 * Estilos para Resumen de Compra
 * 
 * Este archivo contiene dos tipos de estilos:
 * 1. RESUMEN_HTML_STYLES: CSS para el archivo HTML descargado (archivo estático)
 * 2. RESUMEN_REACT_CLASSES: Clases CSS para el componente React en la interfaz
 */

// ============================================
// ESTILOS PARA EL ARCHIVO HTML DESCARGADO
// ============================================
export const RESUMEN_HTML_STYLES = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: #f6f8fc;
    padding: 20px;
    color: #333;
  }
  .container {
    max-width: 900px;
    margin: 0 auto;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }
  .header {
    background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
    color: white;
    padding: 40px 30px;
    text-align: center;
    border-bottom: 4px solid #1e40af;
  }
  .header h1 {
    font-size: 32px;
    margin-bottom: 10px;
    font-weight: 700;
  }
  .header p {
    font-size: 14px;
    opacity: 0.9;
  }
  .content {
    padding: 40px;
  }
  .section {
    margin-bottom: 35px;
  }
  .section h2 {
    color: #2563eb;
    font-size: 18px;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 2px solid #e5e7eb;
    font-weight: 600;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 15px;
  }
  thead {
    background: #f3f4f6;
  }
  th {
    padding: 12px;
    text-align: left;
    font-weight: 600;
    color: #374151;
    font-size: 14px;
    border-bottom: 2px solid #d1d5db;
  }
  td {
    padding: 14px 12px;
    border-bottom: 1px solid #e5e7eb;
    font-size: 14px;
  }
  tr:last-child td {
    border-bottom: none;
  }
  .cantidad {
    text-align: center;
  }
  .precio {
    text-align: right;
  }
  .subtotal {
    text-align: right;
  }
  .total-section {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 2px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
  .total-label {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
    margin-right: 20px;
  }
  .total-amount {
    font-size: 28px;
    font-weight: 700;
    color: #2563eb;
  }
  .metodo-pago {
    display: flex;
    gap: 15px;
    margin-top: 10px;
    padding: 15px;
    background: #f9fafb;
    border-radius: 8px;
  }
  .metodo-label {
    font-weight: 600;
    color: #374151;
    min-width: 120px;
  }
  .metodo-valor {
    color: #6b7280;
  }
  .footer {
    background: #f9fafb;
    padding: 30px;
    text-align: center;
    border-top: 1px solid #e5e7eb;
    font-size: 12px;
    color: #6b7280;
  }
  .footer p {
    margin: 5px 0;
  }
  .timestamp {
    margin-top: 10px;
    color: #9ca3af;
    font-size: 11px;
  }
  @media print {
    body {
      background: white;
      padding: 0;
    }
    .container {
      box-shadow: none;
      border-radius: 0;
    }
  }
`;

// ============================================
// CLASES CSS PARA EL COMPONENTE REACT
// ============================================
export const RESUMEN_REACT_CLASSES = {
  resumenContainer: "space-y-8",
  resumenHeader: "mb-8",
  resumenTitle: "text-3xl font-bold text-slate-900 mb-2",
  resumenSubtitle: "text-slate-600",
  
  // Tabla
  tablaContainer: "rounded-xl border border-slate-200 bg-white overflow-hidden",
  tablaScroll: "overflow-x-auto",
  tabla: "w-full",
  tablaHead: "bg-slate-50 border-b border-slate-200",
  tablaHeaderCell: "px-6 py-3 text-left text-sm font-semibold text-slate-900",
  tablaCantidadHeader: "text-center",
  tablaPrecioHeader: "text-right",
  tablaSubtotalHeader: "text-right",
  
  tablaBody: "border-b border-slate-200 hover:bg-slate-50",
  tablaCell: "px-6 py-4 text-sm text-slate-900",
  tablaCantidad: "text-center text-sm text-slate-600",
  tablaPrecio: "text-right text-sm text-slate-600",
  tablaSubtotal: "text-right text-sm font-semibold text-slate-900",
  
  // Total
  totalSection: "bg-slate-50 px-6 py-6 border-t border-slate-200 flex justify-end items-center gap-4",
  totalLabel: "text-lg font-semibold text-slate-900",
  totalAmount: "text-3xl font-bold text-blue-600",
  
  // Método de pago
  metodoPagoContainer: "rounded-xl border border-slate-200 bg-white p-6",
  metodoPagoTitle: "text-lg font-semibold text-slate-900 mb-4",
  metodoPagoBox: "flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200",
  metodoPagoCheckmark: "flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold",
  metodoPagoTexto: "text-slate-900 font-medium",
  
  // Botones
  botonesContainer: "flex flex-col sm:flex-row gap-4",
  botonDescargar: "flex-1 rounded-lg border-2 border-blue-600 px-6 py-3 font-semibold text-blue-600 transition-colors hover:bg-blue-50 flex items-center justify-center gap-2",
  botonConfirmar: "flex-1 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed",
  
  iconoDescarga: "h-5 w-5",
};

// Alias para compatibilidad con código existente
export const RESUMEN_COMPRA_STYLES = RESUMEN_HTML_STYLES;
