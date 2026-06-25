"use client";

import { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RefreshCw,
  Search,
  Building,
  User,
  Mail,
  DollarSign,
  CheckCircle2,
  Truck,
  AlertCircle,
  Calendar,
  ArrowRight,
  Clock,
  Volume2,
  Package,
  Layers,
  ChevronRight,
  ArrowLeftRight
} from "lucide-react";
import { toast } from "sonner";
import { cambiarEstadoReservacion, type ReservacionDto, type PlatformUsuarioDto, type SucursalDto } from "@/lib/api/admin";
import { cn } from "@/lib/utils";

interface KanbanTabProps {
  token: string;
  reservaciones: ReservacionDto[];
  loadingReservaciones: boolean;
  usuarios: PlatformUsuarioDto[];
  sucursales: SucursalDto[];
  onRefresh: () => void;
}

type ColumnId = "pendiente_pago" | "pagado_procesando" | "despachado";

interface Column {
  id: ColumnId;
  title: string;
  color: string;
  borderColor: string;
  badgeBg: string;
  glowColor: string;
}

const COLUMNS: Column[] = [
  {
    id: "pendiente_pago",
    title: "Pendiente de Pago",
    color: "text-amber-400 border-amber-500/20",
    badgeBg: "bg-amber-500/10 text-amber-400",
    borderColor: "border-amber-500/15",
    glowColor: "shadow-amber-500/5"
  },
  {
    id: "pagado_procesando",
    title: "Pago Verificado",
    color: "text-[#22D3A6] border-[#22D3A6]/20",
    badgeBg: "bg-[#22D3A6]/10 text-[#22D3A6]",
    borderColor: "border-[#22D3A6]/15",
    glowColor: "shadow-[#22D3A6]/5"
  },
  {
    id: "despachado",
    title: "Despachado",
    color: "text-[#38BDF8] border-[#38BDF8]/20",
    badgeBg: "bg-[#38BDF8]/10 text-[#38BDF8]",
    borderColor: "border-[#38BDF8]/15",
    glowColor: "shadow-[#38BDF8]/5"
  }
];

export function KanbanTab({
  token,
  reservaciones,
  loadingReservaciones,
  usuarios,
  sucursales,
  onRefresh
}: KanbanTabProps) {
  // Search & Filtering States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSucursal, setSelectedSucursal] = useState("all");

  // Real-time Polling States
  const [isPollingActive, setIsPollingActive] = useState(true);
  const [isPollingPaused, setIsPollingPaused] = useState(false);
  const [countdown, setCountdown] = useState(6);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Drag & Drop States
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<ColumnId | null>(null);

  // Card detail modal state for mobile
  const [selectedCardDetail, setSelectedCardDetail] = useState<ReservacionDto | null>(null);

  // Sound effects enabled state
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Tracking for new orders
  const prevReservationIdsRef = useRef<string[]>([]);

  // Synthesize a beautiful premium notification chime using Web Audio API
  const playSynthSound = (type: "new" | "success" | "drag") => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      const now = ctx.currentTime;

      if (type === "new") {
        // Double-bell chime
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(880, now); // A5
        osc1.frequency.exponentialRampToValueAtTime(1320, now + 0.15); // E6
        gain1.gain.setValueAtTime(0.12, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = "triangle";
        osc2.frequency.setValueAtTime(1100, now + 0.08); // C#6
        gain2.gain.setValueAtTime(0.08, now + 0.08);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);

        osc1.start(now);
        osc1.stop(now + 0.75);
        osc2.start(now + 0.08);
        osc2.stop(now + 0.55);
      } else if (type === "success") {
        // Happy sweep success chime
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.2); // G5
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.42);
      } else if (type === "drag") {
        // Tactile micro popup click
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.05);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.07);
      }
    } catch (e) {
      console.warn("Web Audio API not allowed or supported yet.", e);
    }
  };

  // Notification chime when new reservations arrive
  useEffect(() => {
    if (reservaciones && reservaciones.length > 0) {
      const currentIds = reservaciones.map((r) => r.id);
      if (prevReservationIdsRef.current.length > 0) {
        const hasNew = currentIds.some((id) => !prevReservationIdsRef.current.includes(id));
        if (hasNew) {
          playSynthSound("new");
          toast("🔔 ¡Nuevo pedido recibido en tiempo real!", {
            className: "bg-slate-900 border border-slate-800 text-white font-sans rounded-xl",
            description: "El tablero Kanban se ha actualizado automáticamente."
          });
        }
      }
      prevReservationIdsRef.current = currentIds;
    }
  }, [reservaciones]);

  // Real-time polling countdown logic
  useEffect(() => {
    if (isPollingActive && !isPollingPaused) {
      pollingIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            onRefresh();
            return 6;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [isPollingActive, isPollingPaused, onRefresh]);

  // Reset countdown on manual refresh
  const handleManualRefresh = () => {
    onRefresh();
    setCountdown(6);
    playSynthSound("success");
    toast.success("Tablero Kanban sincronizado.");
  };

  // Resolve user info from user master list
  const getUserDetails = (userId: string) => {
    const user = usuarios.find((u) => u.id === userId);
    return user
      ? { name: user.name, email: user.email }
      : { name: "Cliente Invitado", email: "Sin correo registrado" };
  };

  // Resolve sucursal name
  const getSucursalName = (sucursalId: string) => {
    const suc = sucursales.find((s) => s.id === sucursalId);
    return suc ? suc.nombre : "Sin Asignar";
  };

  // Classify reservations into their corresponding lifecycle column
  const getReservationColumn = (res: ReservacionDto): ColumnId => {
    if (res.estadoDespacho === "despachado" || res.estadoDespacho === "entregado") {
      return "despachado";
    }
    if (res.estadoPago === "pagado") {
      return "pagado_procesando";
    }
    return "pendiente_pago";
  };

  // Drag & drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    playSynthSound("drag");
    // Add visual styling to the dragged node
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, columnId: ColumnId) => {
    e.preventDefault();
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, targetColumnId: ColumnId) => {
    e.preventDefault();
    setDragOverColumn(null);
    const id = e.dataTransfer.getData("text/plain") || draggedId;
    if (!id) return;

    setDraggedId(null);
    await updateReservationStatus(id, targetColumnId);
  };

  // Update status function (centralized for drag & drop + quick action buttons)
  const updateReservationStatus = async (id: string, targetColumnId: ColumnId) => {
    const res = reservaciones.find((r) => r.id === id);
    if (!res) return;

    let targetEstadoPago = res.estadoPago;
    let targetEstadoDespacho = res.estadoDespacho;

    if (targetColumnId === "pendiente_pago") {
      targetEstadoPago = "pendiente";
      targetEstadoDespacho = "procesando";
    } else if (targetColumnId === "pagado_procesando") {
      targetEstadoPago = "pagado";
      targetEstadoDespacho = "procesando";
    } else if (targetColumnId === "despachado") {
      targetEstadoDespacho = "despachado";
    }

    // Skip if no changes
    if (res.estadoPago === targetEstadoPago && res.estadoDespacho === targetEstadoDespacho) {
      return;
    }

    // Temporarily pause polling during changes to prevent sync conflicts
    setIsPollingPaused(true);

    // Optimistic UI updates could be added, but standard toast + load is robust
    const loadingToast = toast.loading("Actualizando estado del pedido...");

    try {
      await cambiarEstadoReservacion(token, id, {
        estadoPago: targetEstadoPago,
        estadoDespacho: targetEstadoDespacho
      });
      toast.dismiss(loadingToast);
      toast.success(`Pedido #${id.substring(0, 8).toUpperCase()} movido con éxito.`, {
        icon: "🚀"
      });
      playSynthSound("success");
      onRefresh();
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("No se pudo actualizar la reservación.");
    } finally {
      // Resume polling after a brief safety delay
      setTimeout(() => setIsPollingPaused(false), 2500);
    }
  };

  // Filter reservations based on search query and sucursal
  const filteredReservations = reservaciones.filter((res) => {
    const user = usuarios.find((u) => u.id === res.usuarioId);
    const searchMatch =
      res.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user?.name ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user?.email ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.montoTotal.toString().includes(searchQuery);

    const sucursalMatch = selectedSucursal === "all" || res.sucursalId === selectedSucursal;

    return searchMatch && sucursalMatch;
  });

  // Calculate Column aggregates
  const getColumnData = (columnId: ColumnId) => {
    const items = filteredReservations.filter((r) => getReservationColumn(r) === columnId);
    const totalAmount = items.reduce((sum, r) => sum + r.montoTotal, 0);
    return { items, totalAmount };
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#22D3A6] animate-pulse" />
            Tablero de Control de Caja
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Gestión visual de flujos de pago y despachos en tiempo real
          </p>
        </div>

        {/* Real-time configuration controls */}
        <div className="flex items-center gap-3 self-start md:self-auto bg-slate-900/60 p-1.5 px-3 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center gap-2 border-r border-slate-800 pr-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={cn(
                "p-1.5 rounded-lg border border-transparent transition-all cursor-pointer bg-transparent",
                soundEnabled ? "text-[#22D3A6] hover:bg-[#22D3A6]/10" : "text-slate-500 hover:bg-slate-800"
              )}
              title={soundEnabled ? "Desactivar sonidos" : "Activar sonidos de alertas"}
            >
              <Volume2 size={14} className={cn(!soundEnabled && "opacity-50")} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-450 font-medium">Auto-recarga:</span>
            <button
              onClick={() => setIsPollingActive(!isPollingActive)}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-lg border font-bold tracking-wide transition-all cursor-pointer text-[10px] uppercase",
                isPollingActive
                  ? "border-[#22D3A6]/20 bg-[#22D3A6]/5 text-[#22D3A6]"
                  : "border-slate-800 bg-slate-950 text-slate-550"
              )}
            >
              {isPollingActive ? (
                <>
                  <Play size={10} className="animate-pulse" />
                  <span>En Vivo ({countdown}s)</span>
                </>
              ) : (
                <>
                  <Pause size={10} />
                  <span>Pausado</span>
                </>
              )}
            </button>

            <button
              onClick={handleManualRefresh}
              disabled={loadingReservaciones}
              className="p-1.5 rounded-lg border border-slate-850 bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-white cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center"
              title="Sincronizar ahora"
            >
              <RefreshCw size={12} className={cn(loadingReservaciones && "animate-spin text-[#22D3A6]")} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map((col) => {
          const { items, totalAmount } = getColumnData(col.id);
          return (
            <div
              key={col.id}
              className="p-4 rounded-xl border border-slate-900 bg-slate-955/35 backdrop-blur-md flex items-center justify-between shadow-lg"
            >
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{col.title}</p>
                <h4 className="text-lg font-black text-white mt-1 leading-none">
                  {items.length} <span className="text-xs font-semibold text-slate-500">pedidos</span>
                </h4>
              </div>
              <div className="text-right">
                <span className={cn("text-xs font-black px-2 py-1 rounded-lg", col.badgeBg)}>
                  Q{totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter and search bar */}
      <div className="flex flex-col md:flex-row gap-3 bg-slate-950/20 p-4 rounded-xl border border-slate-900">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Buscar por ID de pedido, correo de cliente o importe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 h-10 rounded-lg border border-slate-850 bg-slate-900/30 text-xs placeholder:text-slate-500 text-slate-100 outline-none transition-all focus:border-[#22D3A6]/45 focus:ring-1 focus:ring-[#22D3A6]/10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Building size={14} className="text-slate-500" />
          <select
            value={selectedSucursal}
            onChange={(e) => setSelectedSucursal(e.target.value)}
            className="h-10 px-3 rounded-lg border border-slate-850 bg-slate-900/40 text-xs text-slate-350 outline-none focus:border-[#22D3A6]/45 cursor-pointer max-w-[200px] truncate"
          >
            <option value="all">Todas las Sucursales</option>
            {sucursales.map((suc) => (
              <option key={suc.id} value={suc.id}>
                {suc.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start min-h-[500px]">
        {COLUMNS.map((col) => {
          const { items } = getColumnData(col.id);
          const isOver = dragOverColumn === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              className={cn(
                "rounded-xl border bg-slate-950/40 p-4 transition-all duration-200 flex flex-col max-h-[700px] shadow-2xl relative",
                col.borderColor,
                isOver ? "bg-slate-900/50 scale-[1.01] border-[#22D3A6]/30 shadow-2xl ring-1 ring-[#22D3A6]/10" : "",
                col.glowColor
              )}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-900/80 mb-4 shrink-0">
                <span className={cn("text-xs font-bold tracking-tight uppercase flex items-center gap-1.5", col.color)}>
                  {col.id === "pendiente_pago" && <AlertCircle size={14} />}
                  {col.id === "pagado_procesando" && <Clock size={14} />}
                  {col.id === "despachado" && <Truck size={14} />}
                  {col.title}
                </span>
                <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-full", col.badgeBg)}>
                  {items.length}
                </span>
              </div>

              {/* Column Items Scroll Container */}
              <div className="space-y-3 overflow-y-auto pr-1 flex-1 min-h-[250px] scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                {items.length === 0 ? (
                  <div className="h-32 rounded-lg border border-dashed border-slate-900 flex flex-col items-center justify-center text-center p-4">
                    <Layers className="text-slate-800 mb-1" size={24} />
                    <p className="text-[10px] text-slate-600 font-medium">Sin pedidos en esta fase</p>
                  </div>
                ) : (
                  items.map((res) => {
                    const client = getUserDetails(res.usuarioId);
                    const sucursalName = getSucursalName(res.sucursalId);
                    const orderCode = res.id.substring(0, 8).toUpperCase();
                    const isCardDragged = draggedId === res.id;

                    return (
                      <div
                        key={res.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, res.id)}
                        className={cn(
                          "p-3.5 rounded-xl border border-slate-900/60 bg-slate-950/70 hover:bg-slate-900/60 transition-all duration-200 cursor-grab active:cursor-grabbing hover:border-slate-850 shadow-md group relative overflow-hidden",
                          isCardDragged ? "opacity-35 scale-95 border-dashed" : ""
                        )}
                      >
                        {/* Decorative side border */}
                        <div
                          className={cn(
                            "absolute top-0 left-0 bottom-0 w-1 rounded-l-full",
                            res.estadoPago === "pagado" ? "bg-[#22D3A6]" : "bg-amber-400"
                          )}
                        />

                        {/* Top Info */}
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mb-2">
                          <span className="font-mono font-black text-slate-300">
                            #{orderCode}
                          </span>
                          <span className="flex items-center gap-1 font-medium">
                            <Clock size={10} />
                            {new Date(res.fechaReserva).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Customer details */}
                        <div className="space-y-1 mb-3 pl-1">
                          <p className="text-[11px] font-bold text-white tracking-wide truncate">
                            {client.name}
                          </p>
                          <p className="text-[9px] text-slate-450 truncate flex items-center gap-1">
                            <Mail size={9} className="text-slate-600 shrink-0" />
                            {client.email}
                          </p>
                          <p className="text-[9px] text-slate-500 flex items-center gap-1 truncate">
                            <Building size={9} className="text-slate-650 shrink-0" />
                            {sucursalName}
                          </p>
                        </div>

                        {/* Status Badges */}
                        <div className="flex flex-wrap gap-1.5 mt-1.5 mb-2.5 pl-1">
                          <span className={cn(
                            "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider",
                            res.estadoPago === "pagado" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                          )}>
                            Pago: {res.estadoPago === "pagado" ? "Verificado" : "Pendiente"}
                          </span>
                          <span className={cn(
                            "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider",
                            (res.estadoDespacho === "despachado" || res.estadoDespacho === "entregado") ? "bg-blue-500/10 text-blue-400" : "bg-rose-500/10 text-rose-400"
                          )}>
                            Despacho: {(res.estadoDespacho === "despachado" || res.estadoDespacho === "entregado") ? "Despachado" : "Pendiente"}
                          </span>
                        </div>

                        {/* Product item summary */}
                        <div className="border-t border-b border-slate-900/90 py-2 my-2.5 space-y-0.5 text-[9px] text-slate-400 pl-1">
                          <div className="flex items-center justify-between text-slate-500 font-bold uppercase tracking-wider mb-1">
                            <span>Artículos ({res.detalles.reduce((sum, d) => sum + d.cantidad, 0)})</span>
                            <Package size={10} />
                          </div>
                          {res.detalles.slice(0, 2).map((d, index) => (
                            <div key={index} className="flex justify-between font-medium">
                              <span className="truncate max-w-[120px]">• {d.productoNombre ?? "Artículo"}</span>
                              <span className="text-slate-550 text-[8px] font-bold shrink-0 ml-1">x{d.cantidad}</span>
                            </div>
                          ))}
                          {res.detalles.length > 2 && (
                            <p className="text-[8px] text-[#38BDF8] font-bold mt-1">
                              + {res.detalles.length - 2} productos más
                            </p>
                          )}
                        </div>

                        {/* Footer - Price and Quick Actions */}
                        <div className="flex items-center justify-between pt-1">
                          <div>
                            <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-widest leading-none">Total</span>
                            <span className="text-xs font-black text-[#22D3A6] mt-1 inline-block">
                              Q{res.montoTotal.toFixed(2)}
                            </span>
                          </div>

                          {/* Quick buttons */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setSelectedCardDetail(res)}
                              className="p-1 px-1.5 rounded-lg border border-slate-900 bg-slate-955 text-[9px] font-bold text-slate-400 hover:text-white hover:bg-slate-900 cursor-pointer transition-all"
                              title="Ver detalles completos del pedido"
                            >
                              Ver
                            </button>

                            {/* Column conditional actions */}
                            {col.id === "pendiente_pago" && (
                              <button
                                onClick={() => updateReservationStatus(res.id, "pagado_procesando")}
                                className="p-1 px-1.5 rounded-lg bg-[#22D3A6]/10 hover:bg-[#22D3A6] border border-transparent text-[#22D3A6] hover:text-slate-955 text-[9px] font-black uppercase tracking-wider cursor-pointer transition-all flex items-center gap-0.5"
                                title="Marcar Pago como VERIFICADO"
                              >
                                Verificar
                              </button>
                            )}

                            {col.id === "pagado_procesando" && (
                              <button
                                onClick={() => updateReservationStatus(res.id, "despachado")}
                                className="p-1 px-1.5 rounded-lg bg-[#38BDF8]/10 hover:bg-[#38BDF8] border border-transparent text-[#38BDF8] hover:text-slate-955 text-[9px] font-black uppercase tracking-wider cursor-pointer transition-all flex items-center gap-0.5"
                                title="Despachar pedido"
                              >
                                Despachar
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MOBILE/TABLET QUICK DETAIL & STATE CONTROLLER MODAL */}
      {selectedCardDetail && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-55 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-955 p-6 shadow-2xl space-y-6 relative text-xs">
            {/* Close Button */}
            <button
              onClick={() => setSelectedCardDetail(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white cursor-pointer bg-transparent border-none p-1"
            >
              Cerrar
            </button>

            {/* Header info */}
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono font-black text-white">
                  PEDIDO #{selectedCardDetail.id.substring(0, 8).toUpperCase()}
                </span>
                <span className={cn(
                  "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider",
                  selectedCardDetail.estadoPago === "pagado" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                )}>
                  Pago: {selectedCardDetail.estadoPago === "pagado" ? "Verificado" : "Pendiente"}
                </span>
                <span className={cn(
                  "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider",
                  (selectedCardDetail.estadoDespacho === "despachado" || selectedCardDetail.estadoDespacho === "entregado") ? "bg-blue-500/10 text-blue-400" : "bg-rose-500/10 text-rose-400"
                )}>
                  Despacho: {(selectedCardDetail.estadoDespacho === "despachado" || selectedCardDetail.estadoDespacho === "entregado") ? "Despachado" : "Pendiente"}
                </span>
              </div>
              <h3 className="text-base font-black text-white mt-3">Detalle de la Reservación</h3>
              <p className="text-slate-500 text-[10px] mt-0.5">
                Registrado el {new Date(selectedCardDetail.fechaReserva).toLocaleString("es-ES")}
              </p>
            </div>

            {/* Client Detail */}
            <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-900 space-y-2">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Información de Facturación</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
                <div>
                  <p className="text-[10px] text-slate-500">Nombre de Cliente</p>
                  <p className="font-bold text-white mt-0.5">{getUserDetails(selectedCardDetail.usuarioId).name}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">Correo Electrónico</p>
                  <p className="font-semibold text-[#38BDF8] mt-0.5">{getUserDetails(selectedCardDetail.usuarioId).email}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">Sucursal de Entrega</p>
                  <p className="font-semibold text-white mt-0.5">{getSucursalName(selectedCardDetail.sucursalId)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">Monto del Pedido</p>
                  <p className="font-black text-[#22D3A6] mt-0.5">Q{selectedCardDetail.montoTotal.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Item Table details */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Artículos en este Pedido</h4>
              <div className="rounded-xl border border-slate-900 bg-slate-900/20 overflow-hidden max-h-[160px] overflow-y-auto">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-900 bg-slate-950/60 text-slate-500 font-bold uppercase text-[9px] tracking-wider">
                      <th className="p-2.5 pl-4">Producto</th>
                      <th className="p-2.5 text-center">Cant.</th>
                      <th className="p-2.5 text-right pr-4">Precio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCardDetail.detalles.map((d, idx) => (
                      <tr key={idx} className="border-b border-slate-900/60 hover:bg-slate-900/35 text-slate-350">
                        <td className="p-2.5 pl-4 font-semibold text-white truncate max-w-[200px]">
                          {d.productoNombre ?? "Artículo"}
                        </td>
                        <td className="p-2.5 text-center font-bold text-slate-450">{d.cantidad}</td>
                        <td className="p-2.5 text-right pr-4 text-[#22D3A6] font-bold">
                          Q{d.precioCobrado.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Interactive Actions Selector */}
            <div className="space-y-3 pt-3 border-t border-slate-900">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Actualizar Estado (Transición Directa)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    updateReservationStatus(selectedCardDetail.id, "pendiente_pago");
                    setSelectedCardDetail(null);
                  }}
                  className="h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold border border-slate-800 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <AlertCircle size={12} />
                  <span>Pendiente Pago</span>
                </button>
                <button
                  onClick={() => {
                    updateReservationStatus(selectedCardDetail.id, "pagado_procesando");
                    setSelectedCardDetail(null);
                  }}
                  className="h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-[#22D3A6] font-bold border border-slate-800 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 size={12} />
                  <span>Pago Verificado</span>
                </button>
                <button
                  onClick={() => {
                    updateReservationStatus(selectedCardDetail.id, "despachado");
                    setSelectedCardDetail(null);
                  }}
                  className="h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-[#38BDF8] font-bold border border-slate-800 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Truck size={12} />
                  <span>Despachado</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
