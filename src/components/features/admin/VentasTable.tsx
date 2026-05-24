import { Badge } from "@/components/ui/badge";
import { formatGtq } from "@/lib/format";

type MetodoPago = "efectivo" | "tarjeta";

export type TVenta = {
  id: string;
  cliente: string;
  productos: number;
  subtotal: number;
  descuento: number;
  total: number;
  fecha: string;
  metodoPago: MetodoPago;
  empleado: string;
};

const METODO_STYLES: Record<MetodoPago, string> = {
  efectivo: "bg-green-100 text-green-700",
  tarjeta: "bg-blue-100 text-blue-700",
};

const METODO_LABEL: Record<MetodoPago, string> = {
  efectivo: "Efectivo",
  tarjeta: "Tarjeta",
};

type Props = {
  cargando: boolean;
  ventas: TVenta[];
};

export function VentasTable({ cargando, ventas }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {cargando ? (
        <div className="px-4 py-10 text-center text-gray-400 text-sm">
          Cargando ventas...
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            
            {/* Header */}
            <thead>
              <tr className="bg-slate-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-slate-500 font-medium">
                  ID Venta
                </th>

                <th className="text-left px-4 py-3 text-slate-500 font-medium">
                  Cliente
                </th>

                <th className="text-left px-4 py-3 text-slate-500 font-medium">
                  Productos
                </th>

                <th className="text-left px-4 py-3 text-slate-500 font-medium">
                  Subtotal
                </th>

                <th className="text-left px-4 py-3 text-slate-500 font-medium">
                  Descuento
                </th>

                <th className="text-left px-4 py-3 text-slate-500 font-medium">
                  Total
                </th>

                <th className="text-left px-4 py-3 text-slate-500 font-medium">
                  Fecha y Hora
                </th>

                <th className="text-left px-4 py-3 text-slate-500 font-medium">
                  Método Pago
                </th>

                <th className="text-left px-4 py-3 text-slate-500 font-medium">
                  Empleado
                </th>
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {ventas.map((venta) => (
                <tr
                  key={venta.id}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors last:border-0"
                >
                  {/* ID */}
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {venta.id}
                  </td>

                  {/* Cliente */}
                  <td className="px-4 py-3 text-gray-700">
                    {venta.cliente}
                  </td>

                  {/* Productos */}
                  <td className="px-4 py-3 text-gray-700">
                    {venta.productos}
                  </td>

                  {/* Subtotal */}
                  <td className="px-4 py-3 text-gray-700">
                    {formatGtq(venta.subtotal)}
                  </td>

                  {/* Descuento */}
                  <td className="px-4 py-3 text-red-500">
                    {formatGtq(venta.descuento)}
                  </td>

                  {/* Total */}
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {formatGtq(venta.total)}
                  </td>

                  {/* Fecha */}
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {venta.fecha}
                  </td>

                  {/* Metodo pago */}
                  <td className="px-4 py-3">
                    <Badge className={METODO_STYLES[venta.metodoPago]}>
                      {METODO_LABEL[venta.metodoPago]}
                    </Badge>
                  </td>

                  {/* Empleado */}
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                    {venta.empleado}
                  </td>
                </tr>
              ))}

              {/* Empty state */}
              {ventas.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-10 text-center text-gray-400"
                  >
                    No hay ventas registradas.
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>
      )}
    </div>
  );
}