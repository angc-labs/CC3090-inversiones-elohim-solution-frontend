"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { GitBranch, Plus, Loader2, Edit, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { PortalModal } from "@/components/ui/PortalModal";
import {
  crearSucursal,
  actualizarSucursal,
  eliminarSucursal,
  type SucursalDto,
  type PlatformUsuarioDto,
  type PlatformProductoDto,
} from "@/lib/api/admin";

interface SucursalesTabProps {
  token: string;
  sucursales: SucursalDto[];
  loadingSucursales: boolean;
  productos: PlatformProductoDto[];
  usuarios: PlatformUsuarioDto[];
  esAdmin: boolean;
  onRefresh: () => void;
}

export function SucursalesTab({
  token,
  sucursales,
  loadingSucursales,
  productos,
  usuarios,
  esAdmin,
  onRefresh,
}: SucursalesTabProps) {
  const t = useTranslations("Sucursales");

  // Modal states
  const [isSucursalModalOpen, setIsSucursalModalOpen] = useState(false);
  const [selectedSucursal, setSelectedSucursal] = useState<SucursalDto | null>(null);
  const [selectedSucursalDetail, setSelectedSucursalDetail] = useState<SucursalDto | null>(null);

  // Form states
  const [sucursalForm, setSucursalForm] = useState({
    nombre: "",
    direccion: "",
    telefono: "",
  });

  const handleOpenSucursalModal = (sucursal: SucursalDto | null = null) => {
    if (sucursal) {
      setSelectedSucursal(sucursal);
      setSucursalForm({
        nombre: sucursal.nombre,
        direccion: sucursal.direccion || "",
        telefono: sucursal.telefono || "",
      });
    } else {
      setSelectedSucursal(null);
      setSucursalForm({ nombre: "", direccion: "", telefono: "" });
    }
    setIsSucursalModalOpen(true);
  };

  const handleSubmitSucursal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sucursalForm.nombre.trim()) {
      toast.error(t("toast_name_required"));
      return;
    }

    try {
      if (selectedSucursal) {
        await actualizarSucursal(token, selectedSucursal.id, sucursalForm);
        toast.success(t("toast_updated"));
      } else {
        await crearSucursal(token, sucursalForm);
        toast.success(t("toast_created"));
      }
      setIsSucursalModalOpen(false);
      onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("toast_save_error"));
    }
  };

  const handleDeleteSucursal = async (id: string) => {
    if (!window.confirm(t("toast_delete_confirm"))) return;

    try {
      await eliminarSucursal(token, id);
      toast.success(t("toast_deleted"));
      onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("toast_delete_error"));
    }
  };

  // Staff and product filtering
  const staffUsuarios = usuarios.filter(
    (u) => u.tipoUsuario === "staff" || u.tipoUsuario === "administrador"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white">{t("title")}</h2>
          <p className="text-xs text-slate-400">{t("subtitle")}</p>
        </div>
        {esAdmin && (
          <button
            onClick={() => handleOpenSucursalModal()}
            className="h-10 px-4 rounded-xl bg-[#22D3A6] hover:bg-[#1ebda1] text-slate-955 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-none"
          >
            <Plus size={16} />
            <span>{t("add_button")}</span>
          </button>
        )}
      </div>

      {loadingSucursales ? (
        <div className="h-48 flex items-center justify-center">
          <Loader2 className="animate-spin text-[#22D3A6]" size={32} />
        </div>
      ) : sucursales.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-800 p-12 text-center space-y-3">
          <GitBranch className="mx-auto text-slate-600" size={40} />
          <p className="text-sm text-slate-400">{t("empty_state")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sucursales.map((suc) => (
            <div
              key={suc.id}
              onClick={() => setSelectedSucursalDetail(suc)}
              className="rounded-xl border border-slate-900 bg-slate-950/40 p-6 flex flex-col justify-between hover:border-slate-800 transition-all gap-4 cursor-pointer hover:bg-slate-900/60"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <GitBranch className="text-[#38BDF8]" size={18} />
                  <h3 className="text-base font-bold text-white">{suc.nombre}</h3>
                </div>
                <p className="text-xs text-slate-400 min-h-[36px]">
                  {suc.direccion || t("no_address")}
                </p>
                <p className="text-xs font-semibold text-[#22D3A6]">
                  {suc.telefono ? t("phone_label", { phone: suc.telefono }) : t("no_phone")}
                </p>
              </div>

              {esAdmin && (
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-900/60">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenSucursalModal(suc);
                    }}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer border-none"
                    title={t("edit_tooltip")}
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSucursal(suc.id);
                    }}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-rose-950/30 text-slate-400 hover:text-rose-400 transition-all cursor-pointer border-none"
                    title={t("delete_tooltip")}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* SUCURSAL ADD/EDIT MODAL */}
      {isSucursalModalOpen && (
        <PortalModal onClose={() => setIsSucursalModalOpen(false)} ariaLabel={selectedSucursal ? t("aria_edit") : t("aria_add")}>
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-6 relative">
            <button
              onClick={() => setIsSucursalModalOpen(false)}
              className="absolute right-4 top-4 text-slate-500 hover:text-white cursor-pointer bg-transparent border-none p-0"
            >
              <X size={18} />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">
                {selectedSucursal ? t("modal_edit_title") : t("modal_add_title")}
              </h3>
              <p className="text-xs text-slate-400">{t("modal_subtitle")}</p>
            </div>

            <form onSubmit={handleSubmitSucursal} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {t("field_name_label")}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t("field_name_placeholder")}
                  value={sucursalForm.nombre}
                  onChange={(e) => setSucursalForm({ ...sucursalForm, nombre: e.target.value })}
                  className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 text-sm text-slate-100 placeholder:text-slate-650 outline-none focus:border-[#38BDF8] focus:ring-1"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {t("field_address_label")}
                </label>
                <textarea
                  placeholder={t("field_address_placeholder")}
                  value={sucursalForm.direccion}
                  onChange={(e) => setSucursalForm({ ...sucursalForm, direccion: e.target.value })}
                  className="h-20 w-full rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-100 placeholder:text-slate-650 outline-none focus:border-[#38BDF8] focus:ring-1 resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {t("field_phone_label")}
                </label>
                <input
                  type="text"
                  placeholder={t("field_phone_placeholder")}
                  value={sucursalForm.telefono}
                  onChange={(e) => setSucursalForm({ ...sucursalForm, telefono: e.target.value })}
                  className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 text-sm text-slate-100 placeholder:text-slate-650 outline-none focus:border-[#38BDF8] focus:ring-1"
                />
              </div>

              <button
                type="submit"
                className="h-11 w-full rounded-xl bg-[#22D3A6] hover:bg-[#1ebda1] text-slate-950 font-bold transition-all hover:scale-[1.01] cursor-pointer border-none flex items-center justify-center"
              >
                <span>{t("save_button")}</span>
              </button>
            </form>
          </div>
        </PortalModal>
      )}

      {/* SUCURSAL DETAIL MODAL */}
      {selectedSucursalDetail && (
        <PortalModal onClose={() => setSelectedSucursalDetail(null)} ariaLabel={t("aria_detail")}>
          <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-955 p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedSucursalDetail(null)}
              className="absolute right-4 top-4 text-slate-500 hover:text-white cursor-pointer bg-transparent border-none p-0"
            >
              <X size={18} />
            </button>

            <div className="space-y-1 pb-4 border-b border-slate-900">
              <div className="flex items-center gap-2">
                <GitBranch className="text-[#22D3A6]" size={22} />
                <h3 className="text-lg font-black text-white">{selectedSucursalDetail.nombre}</h3>
              </div>
              <p className="text-xs text-slate-400">
                {selectedSucursalDetail.direccion || t("no_address")}
              </p>
              {selectedSucursalDetail.telefono && (
                <p className="text-xs text-[#38BDF8] font-medium">
                  {t("phone_label", { phone: selectedSucursalDetail.telefono })}
                </p>
              )}
            </div>

            {/* List of Cashiers assigned */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">{t("cashiers_title")}</h4>
              {(() => {
                const cajeros = staffUsuarios.filter(
                  (u) => u.rolStaff === "cajero" && u.sucursalId === selectedSucursalDetail.id
                );
                if (cajeros.length === 0) {
                  return <p className="text-xs text-slate-500 italic">{t("no_cashiers")}</p>;
                }
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {cajeros.map((c) => (
                      <div
                        key={c.id}
                        className="p-3 rounded-lg bg-slate-900/60 border border-slate-900 flex items-center gap-3"
                      >
                        <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white uppercase">
                          {c.name.substring(0, 2)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white leading-none">{c.name}</p>
                          <p className="text-[10px] text-slate-500">{c.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* List of Products assigned */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">{t("products_title")}</h4>
              {(() => {
                const prodsEnSucursal = productos.filter((p) =>
                  p.inventarios?.some((i) => i.sucursalId === selectedSucursalDetail.id && i.stock > 0)
                );
                if (prodsEnSucursal.length === 0) {
                  return (
                    <p className="text-xs text-slate-500 italic">
                      {t("no_products")}
                    </p>
                  );
                }
                return (
                  <div className="border border-slate-900 rounded-xl overflow-hidden bg-slate-950/20">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-900 bg-slate-950/40 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <th className="p-3">{t("table_product")}</th>
                          <th className="p-3">{t("table_sku")}</th>
                          <th className="p-3">{t("table_price")}</th>
                          <th className="p-3 text-right">{t("table_stock")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900 text-xs">
                        {prodsEnSucursal.map((p) => {
                          const stock =
                            p.inventarios?.find((i) => i.sucursalId === selectedSucursalDetail.id)
                              ?.stock || 0;
                          return (
                            <tr key={p.id} className="hover:bg-slate-900/10">
                              <td className="p-3 font-semibold text-white">{p.nombre}</td>
                              <td className="p-3 text-slate-400 font-mono">{p.sku || "-"}</td>
                              <td className="p-3 text-slate-300">${p.precioDetalle}</td>
                              <td className="p-3 text-right font-black text-[#22D3A6]">{t("stock_units", { count: stock })}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          </div>
        </PortalModal>
      )}
    </div>
  );
}
