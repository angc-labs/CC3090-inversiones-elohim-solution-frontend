"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Store,
  Upload,
  Loader2,
  CreditCard,
  Package,
  Mail
} from "lucide-react";
import {
  getIntegraciones,
  guardarIntegraciones,
  actualizarTiendaInfo,
  actualizarConfiguracionVisual
} from "@/lib/api/admin";
import { uploadToCloudinary } from "@/lib/cloudinary";

interface SettingsTabProps {
  token: string | null;
  esAdmin: boolean;
  activeStore: any;
  setActiveStore: (store: any) => void;
  storeConfig: any;
  setStoreConfig: (config: any) => void;
  setTiendas: React.Dispatch<React.SetStateAction<any[]>>;
}

export function SettingsTab({
  token,
  esAdmin,
  activeStore,
  setActiveStore,
  storeConfig,
  setStoreConfig,
  setTiendas
}: SettingsTabProps) {
  const [settingsForm, setSettingsForm] = useState({
    stripePublicKey: "",
    stripeSecretKey: "",
    cloudinaryCloudName: "",
    cloudinaryApiKey: "",
    cloudinaryApiSecret: "",
    smtpEmail: "",
    smtpPassword: ""
  });
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const [storeForm, setStoreForm] = useState({
    nombre: "",
    slug: "",
    logoUrl: ""
  });
  const [isSavingStoreInfo, setIsSavingStoreInfo] = useState(false);

  useEffect(() => {
    if (activeStore) {
      let config = null;
      if (activeStore.configuracionVisual) {
        try {
          config = typeof activeStore.configuracionVisual === "string"
            ? JSON.parse(activeStore.configuracionVisual)
            : activeStore.configuracionVisual;
        } catch (e) {
          console.error("Error parsing visual config", e);
        }
      }
      let headerSec = null;
      if (config?.pages) {
        const homePage = config.pages.find((p: any) => p.id === "home") || config.pages[0];
        headerSec = homePage?.sections?.find((s: any) => s.type === "header");
      } else {
        headerSec = config?.sections?.find((s: any) => s.type === "header");
      }

      setStoreForm({
        nombre: activeStore.nombre || "",
        slug: activeStore.slug || "",
        logoUrl: headerSec?.properties?.logoUrl || ""
      });
    }
  }, [activeStore]);

  useEffect(() => {
    if (token) {
      setLoadingSettings(true);
      getIntegraciones(token)
        .then((res) => {
          setSettingsForm({
            stripePublicKey: res.stripePublicKey || "",
            stripeSecretKey: res.stripeSecretKey || "",
            cloudinaryCloudName: res.cloudinaryCloudName || "",
            cloudinaryApiKey: res.cloudinaryApiKey || "",
            cloudinaryApiSecret: res.cloudinaryApiSecret || "",
            smtpEmail: res.smtpEmail || "",
            smtpPassword: res.smtpPassword || ""
          });
        })
        .catch((err) => {
          console.error("Error al obtener integraciones", err);
          toast.error("Error al cargar integraciones");
        })
        .finally(() => setLoadingSettings(false));
    }
  }, [token]);

  const handleSaveStoreInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !activeStore) return;

    setIsSavingStoreInfo(true);
    try {
      const normalizedSlug = storeForm.slug.trim().toLowerCase();
      if (!storeForm.nombre.trim()) {
        toast.error("El nombre de la tienda no puede estar vacío");
        setIsSavingStoreInfo(false);
        return;
      }
      if (!normalizedSlug) {
        toast.error("El slug de la tienda no puede estar vacío");
        setIsSavingStoreInfo(false);
        return;
      }

      // Validar formato del slug
      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(normalizedSlug)) {
        toast.error("El slug solo puede contener letras minúsculas, números y guiones");
        setIsSavingStoreInfo(false);
        return;
      }

      const updated = await actualizarTiendaInfo(token, {
        nombre: storeForm.nombre.trim(),
        slug: normalizedSlug
      });

      // Actualizar la configuración visual con el logo y nombre
      let currentConfig: any = null;
      if (updated.configuracionVisual) {
        try {
          currentConfig = typeof updated.configuracionVisual === "string"
            ? JSON.parse(updated.configuracionVisual)
            : updated.configuracionVisual;
        } catch (e) {
          console.error("Error parsing visual config", e);
        }
      }

      if (!currentConfig || (!currentConfig.sections && !currentConfig.pages)) {
        currentConfig = storeConfig || { sections: [] };
      }

      // Update name and logo in header properties of all pages
      if (currentConfig.pages) {
        currentConfig.pages = currentConfig.pages.map((p: any) => ({
          ...p,
          sections: (p.sections || []).map((sec: any) => {
            if (sec.type === "header") {
              return {
                ...sec,
                properties: {
                  ...sec.properties,
                  storeName: storeForm.nombre.trim(),
                  logoUrl: storeForm.logoUrl.trim()
                }
              };
            }
            return sec;
          })
        }));
      }

      // Also update root sections if they exist
      if (currentConfig.sections) {
        currentConfig.sections = currentConfig.sections.map((sec: any) => {
          if (sec.type === "header") {
            return {
              ...sec,
              properties: {
                ...sec.properties,
                storeName: storeForm.nombre.trim(),
                logoUrl: storeForm.logoUrl.trim()
              }
            };
          }
          return sec;
        });
      }

      const updatedWithVisual = await actualizarConfiguracionVisual(token, currentConfig);

      // Actualizar estados locales
      setActiveStore(updatedWithVisual);
      setStoreConfig(currentConfig);
      setTiendas((prev) => prev.map((t) => t.id === updatedWithVisual.id ? updatedWithVisual : t));
      toast.success("Información de la tienda y logotipo guardados exitosamente");
    } catch (err: any) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Error al actualizar la tienda");
    } finally {
      setIsSavingStoreInfo(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSavingSettings(true);
    try {
      await guardarIntegraciones(token, settingsForm);
      toast.success("Integraciones guardadas exitosamente");
    } catch (err: any) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Error al guardar integraciones");
    } finally {
      setIsSavingSettings(false);
    }
  };

  if (!esAdmin) {
    return (
      <div className="rounded-xl border border-dashed border-slate-800 p-12 text-center space-y-3">
        <Store className="mx-auto text-slate-600" size={40} />
        <p className="text-sm text-slate-400">No tienes permisos para acceder a esta pestaña.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-white">Configuración de Integraciones</h2>
        <p className="text-xs text-slate-400">Configura tus credenciales y llaves de API para Stripe y Cloudinary</p>
      </div>

      {/* Información de la Tienda */}
      <form onSubmit={handleSaveStoreInfo} className="rounded-xl border border-slate-900 bg-slate-950/40 p-6 space-y-4 max-w-2xl">
        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-900/60 pb-3">
          <Store className="text-[#22D3A6]" size={18} />
          <span>Información de la Tienda</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nombre de la Tienda</label>
            <input
              type="text"
              value={storeForm.nombre}
              onChange={(e) => setStoreForm({ ...storeForm, nombre: e.target.value })}
              className="h-10 px-4 rounded-xl border border-slate-800 bg-slate-955 text-slate-300 text-xs font-semibold outline-none focus:border-[#22D3A6] transition-all"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Identificador (Slug / Subdominio)</label>
            <input
              type="text"
              value={storeForm.slug}
              onChange={(e) => setStoreForm({ ...storeForm, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
              className="h-10 px-4 rounded-xl border border-slate-800 bg-slate-955 text-[#22D3A6] text-xs font-mono font-semibold outline-none focus:border-[#22D3A6] transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-semibold">Logo de la Tienda (URL)</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="https://ejemplo.com/logo.png"
                value={storeForm.logoUrl || ""}
                onChange={(e) => setStoreForm({ ...storeForm, logoUrl: e.target.value })}
                className="flex-1 h-10 px-4 rounded-xl border border-slate-800 bg-slate-955 text-slate-350 text-xs font-semibold outline-none focus:border-[#22D3A6] transition-all"
              />
              {settingsForm.cloudinaryCloudName && settingsForm.cloudinaryApiKey && settingsForm.cloudinaryApiSecret && (
                <label className="h-10 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-700 shrink-0">
                  <Upload size={14} />
                  <span>Subir Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          toast.loading("Subiendo logo a Cloudinary...");
                          const url = await uploadToCloudinary(file, token ?? "");
                          setStoreForm(prev => ({ ...prev, logoUrl: url }));
                          toast.dismiss();
                          toast.success("Logo subido correctamente");
                        } catch (err) {
                          toast.dismiss();
                          toast.error(err instanceof Error ? err.message : "Error al subir logo");
                        }
                      }
                    }}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dominio de Pruebas</span>
            <a
              href={`http://${activeStore?.slug}.lvh.me:3000/`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:text-sky-300 hover:underline bg-slate-900/60 px-3 py-2 rounded-lg truncate w-fit font-mono"
            >
              {activeStore?.slug}.lvh.me:3000
            </a>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSavingStoreInfo}
            className="h-9 px-4 rounded-xl bg-[#22D3A6] hover:bg-[#1ebda1] text-slate-950 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSavingStoreInfo && <Loader2 className="animate-spin" size={14} />}
            <span>Guardar Tienda</span>
          </button>
        </div>
      </form>

      {loadingSettings ? (
        <div className="h-48 flex items-center justify-center">
          <Loader2 className="animate-spin text-[#22D3A6]" size={32} />
        </div>
      ) : (
        <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl">
          {/* Stripe Keys */}
          <div className="rounded-xl border border-slate-900 bg-slate-950/40 p-6 space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-900/60 pb-3">
              <CreditCard className="text-[#38BDF8]" size={18} />
              <span>Pasarela de Pago (Stripe)</span>
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stripe Public Key (Llave Pública)</label>
                <input
                  type="text"
                  placeholder="pk_test_..."
                  value={settingsForm.stripePublicKey}
                  onChange={(e) => setSettingsForm({ ...settingsForm, stripePublicKey: e.target.value })}
                  className="h-10 px-4 rounded-xl border border-slate-800 bg-slate-955 text-slate-300 text-xs font-semibold outline-none focus:border-[#22D3A6] transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stripe Secret Key (Llave Privada/Secreta)</label>
                <input
                  type="password"
                  placeholder="sk_test_..."
                  value={settingsForm.stripeSecretKey}
                  onChange={(e) => setSettingsForm({ ...settingsForm, stripeSecretKey: e.target.value })}
                  className="h-10 px-4 rounded-xl border border-slate-800 bg-slate-955 text-slate-300 text-xs font-semibold outline-none focus:border-[#22D3A6] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Cloudinary Keys */}
          <div className="rounded-xl border border-slate-900 bg-slate-950/40 p-6 space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-900/60 pb-3">
              <Package className="text-[#A78BFA]" size={18} />
              <span>Almacenamiento de Multimedia (Cloudinary)</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cloudinary Cloud Name (Nombre del Cloud)</label>
                <input
                  type="text"
                  placeholder="Nombre de la nube..."
                  value={settingsForm.cloudinaryCloudName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, cloudinaryCloudName: e.target.value })}
                  className="h-10 px-4 rounded-xl border border-slate-800 bg-slate-955 text-slate-300 text-xs font-semibold outline-none focus:border-[#22D3A6] transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cloudinary API Key</label>
                <input
                  type="text"
                  placeholder="API Key..."
                  value={settingsForm.cloudinaryApiKey}
                  onChange={(e) => setSettingsForm({ ...settingsForm, cloudinaryApiKey: e.target.value })}
                  className="h-10 px-4 rounded-xl border border-slate-800 bg-slate-955 text-slate-300 text-xs font-semibold outline-none focus:border-[#22D3A6] transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cloudinary API Secret</label>
                <input
                  type="password"
                  placeholder="API Secret..."
                  value={settingsForm.cloudinaryApiSecret}
                  onChange={(e) => setSettingsForm({ ...settingsForm, cloudinaryApiSecret: e.target.value })}
                  className="h-10 px-4 rounded-xl border border-slate-800 bg-slate-955 text-slate-300 text-xs font-semibold outline-none focus:border-[#22D3A6] transition-all"
                />
              </div>
            </div>
          </div>

          {/* SMTP Credentials */}
          <div className="rounded-xl border border-slate-900 bg-slate-950/40 p-6 space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-900/60 pb-3">
              <Mail className="text-[#38BDF8]" size={18} />
              <span>Configuración de Correo Emisor (SMTP)</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Correo de Envío (SMTP)</label>
                <input
                  type="email"
                  placeholder="ejemplo@gmail.com"
                  value={settingsForm.smtpEmail}
                  onChange={(e) => setSettingsForm({ ...settingsForm, smtpEmail: e.target.value })}
                  className="h-10 px-4 rounded-xl border border-slate-800 bg-slate-955 text-slate-300 text-xs font-semibold outline-none focus:border-[#22D3A6] transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contraseña de Aplicación</label>
                <input
                  type="password"
                  placeholder="••••••••••••••••"
                  value={settingsForm.smtpPassword}
                  onChange={(e) => setSettingsForm({ ...settingsForm, smtpPassword: e.target.value })}
                  className="h-10 px-4 rounded-xl border border-slate-800 bg-slate-955 text-slate-300 text-xs font-semibold outline-none focus:border-[#22D3A6] transition-all"
                />
              </div>
              <div className="md:col-span-2">
                <p className="text-[11px] text-slate-450 leading-relaxed">
                  Esta configuración se utiliza para enviar los códigos de recuperación de contraseña a tus clientes de forma automática.
                  Si usas Gmail, asegúrate de activar la verificación en dos pasos y generar una <strong>Contraseña de Aplicación</strong>.
                  Soportamos Gmail y Outlook/Hotmail automáticamente.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSavingSettings}
              className="h-11 px-6 rounded-xl bg-[#22D3A6] hover:bg-[#1ebda1] text-slate-950 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSavingSettings ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>Guardando...</span>
                </>
              ) : (
                <span>Guardar Configuración</span>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
