"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowLeft, Lock, Calendar, Shield } from "lucide-react";
import { UserCircle2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShopNavbarActions } from "@/components/ui/ShopNavbarActions";
import { ProtectedRoute } from "@/components/features/auth/ProtectedRoute";
import { useSessionExpiration } from "@/hooks/useSessionExpiration";
import { SessionExpirationWarning } from "@/components/features/auth/SessionExpirationWarning";
import { getProfile, updateProfile } from "@/lib/api/perfil";
import type { UserProfile } from "@/lib/api/perfil";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";

function validarTelefono(telefono: string): boolean {
  if (!telefono.trim()) return true;
  return /^\d{8,15}$/.test(telefono.replace(/\s/g, ""));
}

function validarTexto(valor: string, min = 2): boolean {
  return valor.trim().length >= min;
}

function PerfilContent() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const { handleLogout } = useSessionExpiration();

  const [perfil, setPerfil] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    direccion: "",
    contrasena: "",
  });
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const cargarPerfil = useCallback(async () => {
    if (!token) return;
    setIsFetching(true);
    setError("");
    try {
      const data = await getProfile(token);
      setPerfil(data);
      setFormData({
        nombre: data.nombre,
        apellido: data.apellido ?? "",
        telefono: data.telefono ?? "",
        direccion: data.direccion ?? "",
        contrasena: "",
      });
    } catch {
      setError("No se pudo cargar la información del perfil");
    } finally {
      setIsFetching(false);
    }
  }, [token]);

  useEffect(() => {
    void cargarPerfil();
  }, [cargarPerfil]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validarFormulario = (): boolean => {
    if (!validarTexto(formData.nombre)) {
      setError("El nombre debe tener al menos 2 caracteres");
      return false;
    }
    if (formData.apellido.trim() && !validarTexto(formData.apellido)) {
      setError("El apellido debe tener al menos 2 caracteres");
      return false;
    }
    if (formData.telefono && !validarTelefono(formData.telefono)) {
      setError("El teléfono debe contener solo dígitos (8–15 caracteres)");
      return false;
    }
    if (formData.contrasena && formData.contrasena.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!token || !perfil) return;
    if (!validarFormulario()) return;

    setIsLoading(true);
    try {
      const payload = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        correo: perfil.correo,
        telefono: formData.telefono.trim(),
        ...(perfil.tipoUsuario === "cliente" && {
          direccion: formData.direccion.trim(),
        }),
        ...(formData.contrasena ? { contrasena: formData.contrasena } : {}),
      };

      const actualizado = await updateProfile(token, payload);
      setPerfil((prev) =>
        prev
          ? {
              ...prev,
              nombre: actualizado.nombre,
              apellido: actualizado.apellido,
              correo: actualizado.correo,
              telefono: actualizado.telefono,
              ...(perfil.tipoUsuario === "cliente"
                ? { direccion: formData.direccion.trim() || null }
                : {}),
            }
          : null
      );
      setSuccess("Datos actualizados correctamente");
      setFormData((prev) => ({ ...prev, contrasena: "" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar información");
    } finally {
      setIsLoading(false);
    }
  };

  const fechaRegistroFmt = perfil?.fechaRegistro
    ? new Date(perfil.fechaRegistro).toLocaleDateString("es-GT", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  if (isFetching) {
    return (
      <div className="relative! min-h-screen! bg-[#f6f8fc]!">
        <div className="pointer-events-none! absolute! inset-0! bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.06),transparent_30%)]!" />
        <div className="relative! flex! min-h-screen! flex-col!">
          <div className="border-b! border-slate-200/80! bg-white/90! px-4! py-4! backdrop-blur-sm! sm:px-8!">
            <div className="mx-auto! flex! max-w-6xl! justify-end!">
              <ShopNavbarActions showCart={false} showCatalog />
            </div>
          </div>
          <div className="flex! flex-1! items-center! justify-center! px-6!">
            <div className="rounded-2xl! border! border-slate-200/80! bg-white/95! px-10! py-12! shadow-md! backdrop-blur-sm!">
              <p className="text-sm! text-slate-600!">Cargando tu perfil…</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative! min-h-screen! bg-[#f6f8fc]! text-slate-900!">
      <div className="pointer-events-none! absolute! inset-0! bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.06),transparent_30%),linear-gradient(to_bottom,#ffffff_0%,#f4f7fb_55%)]!" />
      <div className="pointer-events-none! absolute! left-1/4! top-24! h-40! w-40! rounded-full! bg-blue-400/10! blur-3xl!" />

      <div className="relative! flex! min-h-screen! flex-col!">
        <header className="border-b! border-slate-200/80! bg-white/90! px-4! py-4! backdrop-blur-sm! sm:px-8!">
          <div className="mx-auto! flex! max-w-6xl! items-center! justify-between! gap-4!">
            <Link
              href="/home"
              className="flex! items-center! gap-2.5! text-slate-900! transition-opacity! hover:opacity-80!"
            >
              <span className="flex! h-8! w-8! items-center! justify-center! rounded-lg! bg-blue-600! text-white! shadow-sm!">
                <svg className="h-4! w-4!" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </span>
              <span className="text-sm! font-semibold! tracking-tight!">ESMIRNA</span>
            </Link>
            <ShopNavbarActions showCart={false} showCatalog />
          </div>
        </header>

        <main className="flex-1! px-4! py-8! sm:px-8! sm:py-10!">
          <div className="mx-auto! max-w-5xl!">
            <button
              type="button"
              onClick={() => router.back()}
              className="mb-6! flex! items-center! gap-2! text-sm! font-medium! text-slate-600! transition-colors! hover:text-slate-900!"
              aria-label="Volver"
            >
              <ArrowLeft className="h-4! w-4!" />
              Volver
            </button>

            <div className="grid! gap-8! lg:grid-cols-12! lg:gap-10!">
              {/* Panel identidad */}
              <aside className="lg:col-span-4!">
                <div className="sticky! top-6! overflow-hidden! rounded-3xl! border! border-slate-200/80! bg-white/95! shadow-[0_20px_50px_rgba(15,23,42,0.08)]! backdrop-blur-sm!">
                  <div className="bg-gradient-to-br! from-blue-600! via-blue-700! to-slate-900! px-6! pb-16! pt-10! text-center! text-white!">
                    <div className="mx-auto! flex! h-24! w-24! items-center! justify-center! rounded-full! bg-white/15! ring-4! ring-white/20! backdrop-blur-sm!">
                      <UserCircle2 className="h-16! w-16! text-white/95!" strokeWidth={1} aria-hidden />
                    </div>
                    <h1 className="mt-5! text-xl! font-bold! tracking-tight!">
                      {perfil ? `${perfil.nombre} ${perfil.apellido ?? ""}`.trim() : "Usuario"}
                    </h1>
                    <p className="mt-1! text-sm! text-blue-100/90!">{perfil?.correo}</p>
                  </div>
                  <div className="-mt-10! space-y-4! px-6! pb-8!">
                    <div className="rounded-2xl! border! border-slate-200/80! bg-white! p-4! shadow-sm!">
                      <p className="text-xs! font-semibold! uppercase! tracking-wide! text-slate-500!">Cuenta</p>
                      <div className="mt-3! flex! flex-wrap! gap-2!">
                        {perfil?.tipoCliente && (
                          <span className="rounded-full! bg-blue-50! px-3! py-1! text-xs! font-medium! capitalize! text-blue-700! ring-1! ring-blue-100!">
                            {perfil.tipoCliente}
                          </span>
                        )}
                        {perfil?.rol && (
                          <span className="inline-flex! items-center! gap-1! rounded-full! bg-slate-100! px-3! py-1! text-xs! font-medium! text-slate-700! ring-1! ring-slate-200/80!">
                            <Shield className="h-3! w-3!" aria-hidden />
                            {perfil.rol}
                          </span>
                        )}
                        {!perfil?.tipoCliente && !perfil?.rol && (
                          <span className="rounded-full! bg-slate-50! px-3! py-1! text-xs! font-medium! capitalize! text-slate-600! ring-1! ring-slate-200/80!">
                            {perfil?.tipoUsuario ?? "—"}
                          </span>
                        )}
                      </div>
                      {fechaRegistroFmt && (
                        <div className="mt-4! flex! items-center! gap-2! border-t! border-slate-100! pt-4! text-xs! text-slate-500!">
                          <Calendar className="h-3.5! w-3.5! shrink-0! text-slate-400!" aria-hidden />
                          <span>Miembro desde {fechaRegistroFmt}</span>
                        </div>
                      )}
                    </div>
                    <div className="rounded-2xl! border! border-dashed! border-slate-200! bg-slate-50/80! p-4! text-center! text-xs! text-slate-600!">
                      <Link
                        href="/reservas"
                        className="font-semibold! text-blue-700! underline-offset-2! hover:underline!"
                      >
                        Ver mis compras y reservas
                      </Link>
                    </div>
                  </div>
                </div>
              </aside>

              {/* Formulario */}
              <section className="lg:col-span-8!">
                <div className="rounded-3xl! border! border-slate-200/80! bg-white/95! p-6! shadow-[0_20px_50px_rgba(15,23,42,0.06)]! backdrop-blur-sm! sm:p-10!">
                  <div className="mb-8!">
                    <h2 className="text-2xl! font-bold! tracking-tight! text-slate-900!">Información personal</h2>
                    <p className="mt-2! text-sm! text-slate-600!">
                      Actualizá tus datos. Los cambios se guardan en tu cuenta de ESMIRNA.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="flex! flex-col! gap-7!">
                    {error && <Alert type="error" message={error} onClose={() => setError("")} />}
                    {success && <Alert type="success" message={success} />}

                    <div className="grid! gap-4! sm:grid-cols-2!">
                      <div className="space-y-2!">
                        <label className="text-xs! font-semibold! uppercase! tracking-wide! text-slate-500!">Nombre</label>
                        <Input
                          name="nombre"
                          placeholder="Juan"
                          value={formData.nombre}
                          onChange={handleChange}
                          disabled={isLoading}
                          required
                          className={cn(
                            "h-11! rounded-xl! border-slate-200! bg-slate-50/80! text-slate-900! transition-colors!",
                            "focus:border-blue-400! focus:bg-white! focus:ring-blue-400/25!"
                          )}
                        />
                      </div>
                      <div className="space-y-2!">
                        <label className="text-xs! font-semibold! uppercase! tracking-wide! text-slate-500!">Apellido</label>
                        <Input
                          name="apellido"
                          placeholder="Pérez"
                          value={formData.apellido}
                          onChange={handleChange}
                          disabled={isLoading}
                          className={cn(
                            "h-11! rounded-xl! border-slate-200! bg-slate-50/80! text-slate-900! transition-colors!",
                            "focus:border-blue-400! focus:bg-white! focus:ring-blue-400/25!"
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-2!">
                      <label className="text-xs! font-semibold! uppercase! tracking-wide! text-slate-500!">
                        Correo electrónico
                      </label>
                      <div className="relative!">
                        <Input
                          type="email"
                          value={perfil?.correo ?? ""}
                          disabled
                          className="h-11! cursor-not-allowed! rounded-xl! border-slate-200! bg-slate-100! pr-10! text-slate-500!"
                        />
                        <Lock className="absolute! right-3! top-1/2! h-3.5! w-3.5! -translate-y-1/2! text-slate-400!" aria-hidden />
                      </div>
                      <p className="text-xs! text-slate-500!">Para cambiar el correo, contactá a soporte.</p>
                    </div>

                    <div className="space-y-2!">
                      <label className="text-xs! font-semibold! uppercase! tracking-wide! text-slate-500!">Teléfono</label>
                      <Input
                        type="tel"
                        name="telefono"
                        placeholder="12345678"
                        value={formData.telefono}
                        onChange={handleChange}
                        disabled={isLoading}
                        className={cn(
                          "h-11! rounded-xl! border-slate-200! bg-slate-50/80! text-slate-900! transition-colors!",
                          "focus:border-blue-400! focus:bg-white! focus:ring-blue-400/25!"
                        )}
                      />
                    </div>

                    {perfil?.tipoUsuario === "cliente" && (
                      <div className="space-y-2!">
                        <label className="text-xs! font-semibold! uppercase! tracking-wide! text-slate-500!">Dirección</label>
                        <Input
                          name="direccion"
                          placeholder="Ciudad, zona o dirección de entrega"
                          value={formData.direccion}
                          onChange={handleChange}
                          disabled={isLoading}
                          className={cn(
                            "h-11! rounded-xl! border-slate-200! bg-slate-50/80! text-slate-900! transition-colors!",
                            "focus:border-blue-400! focus:bg-white! focus:ring-blue-400/25!"
                          )}
                        />
                      </div>
                    )}

                    <div className="space-y-2!">
                      <label className="text-xs! font-semibold! uppercase! tracking-wide! text-slate-500!">
                        Nueva contraseña{" "}
                        <span className="font-normal! normal-case! text-slate-400!">(opcional)</span>
                      </label>
                      <div className="relative!">
                        <Input
                          type={mostrarContrasena ? "text" : "password"}
                          name="contrasena"
                          placeholder="Dejar vacío para no cambiar"
                          value={formData.contrasena}
                          onChange={handleChange}
                          disabled={isLoading}
                          className={cn(
                            "h-11! rounded-xl! border-slate-200! bg-slate-50/80! pr-10! text-slate-900! transition-colors!",
                            "focus:border-blue-400! focus:bg-white! focus:ring-blue-400/25!"
                          )}
                        />
                        <button
                          type="button"
                          onClick={() => setMostrarContrasena(!mostrarContrasena)}
                          className="absolute! right-3! top-1/2! -translate-y-1/2! text-slate-400! transition-colors! hover:text-slate-600!"
                          aria-label={mostrarContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                          {mostrarContrasena ? <EyeOff className="h-4! w-4!" /> : <Eye className="h-4! w-4!" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="h-12! w-full! rounded-xl! bg-gradient-to-r! from-blue-700! to-blue-600! text-sm! font-semibold! text-white! shadow-md! transition-all! hover:from-blue-600! hover:to-blue-500! hover:shadow-lg! disabled:opacity-60!"
                    >
                      {isLoading ? "Guardando…" : "Guardar cambios"}
                    </Button>
                  </form>

                  <div className="mt-8! border-t! border-slate-100! pt-8! text-center!">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="text-sm! font-medium! text-slate-600! underline-offset-2! transition-colors! hover:text-blue-700! hover:underline!"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>

        <SessionExpirationWarning />
      </div>
    </div>
  );
}

export default function PerfilPage() {
  return (
    <ProtectedRoute>
      <PerfilContent />
    </ProtectedRoute>
  );
}
