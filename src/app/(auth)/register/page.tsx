"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { register } from "@/lib/api/auth";
import { getPostLoginPath } from "@/lib/auth-routes";
import { useAuthStore } from "@/stores/useAuthStore";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const loginStore = useAuthStore(state => state.login);
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    contrasena: "",
    telefono: "",
    direccion: "",
  });
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateForm = (): boolean => {
    if (!formData.nombre || !formData.correo || !formData.contrasena) {
      setError("Por favor completa todos los campos requeridos");
      return false;
    }
    if (formData.contrasena.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return false;
    }
    if (!formData.correo.includes("@")) {
      setError("Por favor ingresa un correo válido");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      setSuccess("Creando tu cuenta...");
      const response = await register({
        nombre: formData.nombre,
        correo: formData.correo,
        contrasena: formData.contrasena,
        telefono: formData.telefono || undefined,
        direccion: formData.direccion || undefined,
      });
      
      loginStore(
        {
          usuarioId: response.usuarioId,
          correo: response.correo,
          nombre: response.nombre,
          rol: response.rol,
        },
        response.token,
        response.expiraEn
      );
      
      setSuccess("¡Cuenta creada exitosamente! Redirigiendo...");
      setTimeout(() => {
        router.push(getPostLoginPath(response.rol));
      }, 500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al registrar usuario";
      setError(errorMessage);
      setSuccess("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative! flex! min-h-screen! flex-col! bg-[#f8f8f6]! md:flex-row!">

      {/* Left panel */}
      <div className="relative! flex-1! overflow-hidden! bg-[#f0f0ec]!">
        <div className="absolute! inset-0! bg-[radial-gradient(ellipse_80%_60%_at_30%_50%,rgba(59,130,246,0.08),transparent)]!" />
        <div className="relative! flex! h-full! min-h-50! flex-col! justify-between! p-10! md:py-14! md:pl-24! md:pr-16! md:pt-20!">
          <div className="flex! items-center! gap-2.5!">
            <div className="flex! h-7! w-7! items-center! justify-center! rounded-md! bg-blue-600! text-white! shadow-sm!">
              <svg className="h-4! w-4!" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-sm! font-semibold! tracking-tight! text-gray-900!">
              <Link href="/">Esmira</Link>
            </span>
          </div>

          <div className="hidden! md:block!">
            <h2 className="text-3xl! font-bold! leading-tight! tracking-tight! text-gray-900!">
              Lorem ipsum dolor<br />sit amet.
            </h2>
            <p className="mt-2.5! text-sm! text-gray-400! max-w-xs! leading-relaxed!">
              Consectetur adipisicing elit. Obcaecati ea harum animi sint officiis quisquam.
            </p>
          </div>

          <p className="text-xs! text-gray-400!"></p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex! flex-1! items-center! justify-center! bg-white! p-10! md:p-20!">
        <div className="w-full! max-w-sm!">

          <div className="mb-8!">
            <h3 className="text-xl! font-semibold! text-gray-900! tracking-tight!">Crear cuenta</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-7! flex! gap-8! flex-col!">
            {error && (
              <Alert type="error" message={error} onClose={() => setError("")} />
            )}

            {success && (
              <Alert type="success" message={success} />
            )}

            <div className="space-y-1.5!">
              <label className="text-xs! font-medium! text-gray-500! uppercase! tracking-wide!">Nombre completo</label>
              <Input
                name="nombre"
                placeholder="Juan Pérez"
                value={formData.nombre}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="h-11! rounded-lg! border-gray-200! bg-gray-50! text-gray-900! placeholder:text-gray-300! focus:bg-white! focus:border-blue-400! focus:ring-blue-400/30! transition-colors!"
              />
            </div>

            <div className="space-y-1.5!">
              <label className="text-xs! font-medium! text-gray-500! uppercase! tracking-wide!">Correo electrónico</label>
              <Input
                type="email"
                name="correo"
                placeholder="correo@ejemplo.com"
                value={formData.correo}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="h-11! rounded-lg! border-gray-200! bg-gray-50! text-gray-900! placeholder:text-gray-300! focus:bg-white! focus:border-blue-400! focus:ring-blue-400/30! transition-colors!"
              />
            </div>

            <div className="space-y-1.5!">
              <label className="text-xs! font-medium! text-gray-500! uppercase! tracking-wide!">Contraseña</label>
              <div className="relative!">
                <Input
                  type={mostrarContrasena ? "text" : "password"}
                  name="contrasena"
                  placeholder="Crea una contraseña"
                  value={formData.contrasena}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="h-11! rounded-lg! border-gray-200! bg-gray-50! pr-10! text-gray-900! placeholder:text-gray-300! focus:bg-white! focus:border-blue-400! focus:ring-blue-400/30! transition-colors!"
                />
                <button
                  type="button"
                  onClick={() => setMostrarContrasena(!mostrarContrasena)}
                  className="absolute! right-3! top-1/2! -translate-y-1/2! text-gray-300! hover:text-gray-500! transition-colors!"
                >
                  {mostrarContrasena ? <EyeOff className="h-4! w-4!" /> : <Eye className="h-4! w-4!" />}
                </button>
              </div>
            </div>

            <div className="grid! grid-cols-1! gap-3! sm:grid-cols-2!">
              <div className="space-y-1.5!">
                <label className="text-xs! font-medium! text-gray-500! uppercase! tracking-wide!">Teléfono <span className="normal-case! text-gray-300!">(opc)</span></label>
                <Input
                  type="tel"
                  name="telefono"
                  placeholder="Teléfono"
                  value={formData.telefono}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="h-11! rounded-lg! border-gray-200! bg-gray-50! text-gray-900! placeholder:text-gray-300! focus:bg-white! focus:border-blue-400! focus:ring-blue-400/30! transition-colors!"
                />
              </div>
              <div className="space-y-1.5!">
                <label className="text-xs! font-medium! text-gray-500! uppercase! tracking-wide!">Dirección <span className="normal-case! text-gray-300!">(opc)</span></label>
                <Input
                  name="direccion"
                  placeholder="Dirección"
                  value={formData.direccion}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="h-11! rounded-lg! border-gray-200! bg-gray-50! text-gray-900! placeholder:text-gray-300! focus:bg-white! focus:border-blue-400! focus:ring-blue-400/30! transition-colors!"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="h-11! w-full! rounded-lg! bg-blue-600! font-medium! text-white! hover:bg-blue-700! shadow-sm! transition-all! hover:shadow-md! mt-2!"
            >
              {isLoading ? "Creando cuenta..." : "Crear cuenta"}
            </Button>
          </form>

          <p className="mt-6! text-center! text-sm! text-gray-400!">
            ¿Ya tienes cuenta?{" "}
            <button
              onClick={() => router.push("/login")}
              className="font-medium! text-blue-600! hover:text-blue-700! transition-colors!"
            >
              Iniciar sesión
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}