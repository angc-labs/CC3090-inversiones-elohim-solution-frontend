type Stats = {
  total: number;
  administradores: number;
  empleados: number;
  activos: number;
};

type Props = { stats: Stats };

export function UsuariosStats({ stats }: Props) {
  const items = [
    { label: "Usuarios Totales",  value: stats.total,         color: "text-blue-700",   BorderColor: "border-b-blue-500"   },
    { label: "Administradores", value: stats.administradores, color: "text-orange-600",  BorderColor: "border-b-orange-400" },
    { label: "Empleados",       value: stats.empleados,       color: "text-blue-600",    BorderColor: "border-b-blue-400"   },
    { label: "Activos",         value: stats.activos,         color: "text-green-600",   BorderColor: "border-b-green-400"  },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {items.map((stat) => (
        <div key={stat.label} className={`bg-white rounded-xl border border-gray-200 border-b-4 ${stat.BorderColor} p-4 shadow-sm`}>
          <p className="text-sm text-slate-500">{stat.label}</p>
          <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
