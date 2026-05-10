"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowLeft, Lock } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { appHeader as AppHeader } from "@/components/ui/appHeader";
import { useSessionExpiration } from "@/hooks/useSessionExpiration";
import { SessionExpirationWarning } from "@/components/features/auth/SessionExpirationWarning";
import { HistorialCard } from "@/components/features/perfil/historialCard";
import { getProfile, updateProfile } from "@/lib/api/perfil";
import type { UserProfile } from "@/lib/api/perfil";
import { UserCircle2 } from "lucide-react";

// Validaciones 

function validarTelefono(telefono: string): boolean {
  return /^\d{8,15}$/.test(telefono.replace(/\s/g, ""));
}

function validarTexto(valor: string): boolean {
  return valor.trim().length >= 2;
}

// Componente principal 

function PerfilContent() {
  const router = useRouter();
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

  // Cargar datos actuales del usuario 

  useEffect(() => {
    async function cargarPerfil() {
      try {
        const data = await getProfile();
        setPerfil(data);
        setFormData({
          nombre: data.nombre,
          apellido: data.apellido,
          telefono: data.telefono,
          direccion: data.direccion,
          contrasena: "",
        });
      } catch {
        setError("No se pudo cargar la información del perfil");
      } finally {
        setIsFetching(false);
      }
    }
    cargarPerfil();
  }, []);

  //  Handlers 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validarFormulario = (): boolean => {
    if (!validarTexto(formData.nombre)) {
      setError("El nombre debe tener al menos 2 caracteres");
      return false;
    }
    if (!validarTexto(formData.apellido)) {
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

    if (!validarFormulario()) return;

    setIsLoading(true);
    try {
      const payload = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        correo: perfil!.correo,
        telefono: formData.telefono.trim(),
        ...(perfil?.tipoCliente !== undefined && {
          direccion: formData.direccion.trim(),
        }),
        ...(formData.contrasena && { contrasena: formData.contrasena }),
      };

      const actualizado = await updateProfile(payload);
      setPerfil((prev) => (prev ? { ...prev, ...actualizado } : prev));
      setSuccess("Datos actualizados correctamente");
      setFormData((prev) => ({ ...prev, contrasena: "" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar información");
    } finally {
      setIsLoading(false);
    }
  };



  //  Loader inicial 

  if (isFetching) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f8f6]">
        <p className="text-sm text-gray-400">Cargando perfil...</p>
      </div>
    );
  }

  // Render 

  return (
    <div className="relative flex min-h-screen flex-col bg-[#f8f8f6]">

      <AppHeader onCartClick={() => router.push("/cart")} />

      {/* Botón volver */}
      <div className="px-8 pt-5">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-gray-600"
          aria-label="Volver"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Paneles */}
      <div className="flex flex-1 flex-col md:flex-row">

        {/* Panel izquierdo — avatar */}
        <div className="relative flex-1 overflow-y-auto bg-[#f0f0ec]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_30%_50%,rgba(59,130,246,0.08),transparent)]" />
          <div className="relative flex min-h-full flex-col items-center justify-center p-10">
            {/* Contenedor de secciones centradas */}
            <div className="flex flex-col items-center gap-12 w-full max-w-xs">
              {/* Sección avatar */}
              <div className="flex flex-col items-center justify-center gap-4">
                <UserCircle2
                  className="text-gray-800"
                  style={{ width: "10rem", height: "10rem", strokeWidth: 1 }}
                  aria-hidden
                />
                <p className="text-xl font-bold tracking-tight text-blue-600">
                  {perfil ? `${perfil.nombre} ${perfil.apellido}` : "Usuario"}
                </p>
                <p className="text-xs text-gray-400">{perfil?.correo ?? ""}</p>
                {perfil?.tipoCliente && (
                  <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-0.5 text-xs font-medium capitalize text-blue-600">
                    {perfil.tipoCliente}
                  </span>
                )}
              </div>

              {/* Sección de productos más comprados */}
              <div className="w-full">
                <HistorialCard />
              </div>
            </div>
          </div>
        </div>

        {/* Panel derecho — formulario */}
        <div className="flex flex-1 items-center justify-center bg-white p-10 md:p-20">
          <div className="w-full max-w-sm">

            <div className="mb-8">
              <h3 className="text-xl font-semibold tracking-tight text-gray-900">
                Información personal
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-8 space-y-7">
              {error && <Alert type="error" message={error} onClose={() => setError("")} />}
              {success && <Alert type="success" message={success} />}

              {/* Nombre y apellido */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Nombre
                  </label>
                  <Input
                    name="nombre"
                    placeholder="Juan"
                    value={formData.nombre}
                    onChange={handleChange}
                    disabled={isLoading}
                    required
                    className="h-11 rounded-lg border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-300 transition-colors focus:border-blue-400 focus:bg-white focus:ring-blue-400/30"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Apellido
                  </label>
                  <Input
                    name="apellido"
                    placeholder="Pérez"
                    value={formData.apellido}
                    onChange={handleChange}
                    disabled={isLoading}
                    required
                    className="h-11 rounded-lg border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-300 transition-colors focus:border-blue-400 focus:bg-white focus:ring-blue-400/30"
                  />
                </div>
              </div>

              {/* Correo — restringido */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    value={perfil?.correo ?? ""}
                    disabled
                    className="h-11 rounded-lg border-gray-200 bg-gray-100 pr-10 text-gray-400 cursor-not-allowed"
                  />
                  <Lock className="absolute top-1/2 right-3 h-3.5 w-3.5 -translate-y-1/2 text-gray-300" aria-hidden />
                </div>
                <p className="text-xs text-gray-300">
                  Para cambiar tu correo contacta a soporte.
                </p>
              </div>

              {/* Teléfono */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Teléfono
                </label>
                <Input
                  type="tel"
                  name="telefono"
                  placeholder="12345678"
                  value={formData.telefono}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="h-11 rounded-lg border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-300 transition-colors focus:border-blue-400 focus:bg-white focus:ring-blue-400/30"
                />
              </div>

              {/* Dirección — solo clientes */}
              {perfil?.tipoCliente && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Dirección
                  </label>
                  <Input
                    name="direccion"
                    placeholder="Ciudad de Guatemala"
                    value={formData.direccion}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="h-11 rounded-lg border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-300 transition-colors focus:border-blue-400 focus:bg-white focus:ring-blue-400/30"
                  />
                </div>
              )}

              {/* Contraseña — opcional */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Contraseña{" "}
                  <span className="normal-case text-gray-300">(opcional)</span>
                </label>
                <div className="relative">
                  <Input
                    type={mostrarContrasena ? "text" : "password"}
                    name="contrasena"
                    placeholder="Nueva contraseña"
                    value={formData.contrasena}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="h-11 rounded-lg border-gray-200 bg-gray-50 pr-10 text-gray-900 placeholder:text-gray-300 transition-colors focus:border-blue-400 focus:bg-white focus:ring-blue-400/30"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarContrasena(!mostrarContrasena)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-300 transition-colors hover:text-gray-500"
                  >
                    {mostrarContrasena ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="mt-2 h-11 w-full rounded-lg bg-blue-600 font-medium uppercase tracking-wide text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md"
              >
                {isLoading ? "Guardando..." : "Guardar cambios →"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-400">
              <button
                onClick={handleLogout}
                className="font-medium text-blue-600 transition-colors hover:text-blue-700"
              >
                Cerrar sesión
              </button>
            </p>

          </div>
        </div>
      </div>

      <SessionExpirationWarning />
    </div>
  );
}

export default function PerfilPage() {
  return <PerfilContent />;
}