import { formatGtq } from "@/lib/format";

type Stats = {
  ventasHoy: number;
  ingresosHoy: number;
  ticketPromedio: number;
  productosVendidos: number;
};

type Props = {
  stats: Stats;
};

export function VentasStats({ stats }: Props) {
  const items = [
    {
      label: "Ventas Hoy",
      value: stats.ventasHoy,
      color: "text-gray-900",
      borderColor: "border-b-blue-500",
    },
    {
      label: "Ingresos Hoy",
      value: formatGtq(stats.ingresosHoy),
      color: "text-green-600",
      borderColor: "border-b-green-500",
    },
    {
      label: "Ticket Promedio",
      value: formatGtq(stats.ticketPromedio),
      color: "text-gray-900",
      borderColor: "border-b-purple-500",
    },
    {
      label: "Productos Vendidos",
      value: stats.productosVendidos,
      color: "text-gray-900",
      borderColor: "border-b-orange-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((stat) => (
        <div
          key={stat.label}
          className={`bg-white rounded-xl border border-gray-200 border-b-4 ${stat.borderColor} p-4 shadow-sm`}
        >
          <p className="text-sm text-slate-500">
            {stat.label}
          </p>

          <p className={`text-2xl font-bold mt-1 sm:text-3xl ${stat.color}`}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}