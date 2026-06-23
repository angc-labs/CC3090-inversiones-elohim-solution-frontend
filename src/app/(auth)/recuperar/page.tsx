"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Key, ShieldCheck, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { recoverWithCode } from "@/lib/api/auth";

export default function RecuperarPage() {
  const router = useRouter();

  useEffect(() => {
    document.title = "Recuperar Contraseña | DM Hub Consola";
  }, []);

  // Wizard Steps: 1 = Email, 2 = Recovery Code, 3 = New Password, 4 = Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [correo, setCorreo] = useState("");
  const [codigo, setCodigo] = useState("");
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");

  // UI State
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (step === 1) {
      if (!correo || !correo.includes("@")) {
        setError("Por favor ingresa un correo electrónico válido");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!codigo || codigo.trim().length < 4) {
        setError("Por favor ingresa un código de recuperación válido");
        return;
      }
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setError("");
    if (step === 2) setStep(1);
    if (step === 3) setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!nuevaContrasena || nuevaContrasena.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setIsLoading(true);

    try {
      setSuccess("Actualizando contraseña...");
      const response = await recoverWithCode(correo, codigo, nuevaContrasena);
      setSuccess(response.mensaje || "Contraseña restablecida exitosamente");
      setStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al restablecer la contraseña");
      setSuccess("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative! flex! min-h-screen! flex-col! items-center! justify-center! bg-gradient-to-b! from-[#081018]! via-[#0b1420]! to-[#081018]! text-slate-100! px-4! py-12! font-sans! overflow-hidden!">
      {/* Decorative Blur Gradients */}
      <div className="pointer-events-none! absolute! top-0! left-1/4! h-[500px]! w-[500px]! -translate-x-1/2! rounded-full! bg-brand-primary/5! blur-[120px]! opacity-50!" />
      <div className="pointer-events-none! absolute! top-1/3! right-1/4! h-[600px]! w-[600px]! translate-x-1/2! rounded-full! bg-brand-secondary/5! blur-[150px]! opacity-40!" />

      {/* Recovery Card */}
      <div className="w-full! max-w-md! rounded-2xl! border! border-slate-800/80! bg-slate-950/80! p-8! shadow-2xl! shadow-black/80! backdrop-blur-md!">
        <div className="flex! items-center! justify-center! mb-6!">
          <img src="/logo.png" alt="DM Hub Logo" className="h-10! w-auto! object-contain!" />
        </div>

        <h3 className="text-center! text-2xl! font-black! tracking-tight! text-white! mb-2!">
          Recuperar Acceso
        </h3>
        <p className="text-center! text-xs! text-slate-400! mb-6!">
          Restablece tu contraseña mediante un código de recuperación
        </p>

        {/* Step Indicator */}
        <div className="flex! items-center! justify-center! gap-2! mb-8!">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5! rounded-full! transition-all! duration-300! ${
                step === s
                  ? "w-8! bg-brand-primary!"
                  : step > s
                  ? "w-3! bg-brand-primary/50!"
                  : "w-3! bg-slate-800!"
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="mb-6! p-3.5! rounded-xl! border! border-rose-900/50! bg-rose-950/30! text-xs! font-mono! text-rose-400! leading-relaxed!">
            {error}
          </div>
        )}

        {success && step !== 4 && (
          <div className="mb-6! p-3.5! rounded-xl! border! border-emerald-900/50! bg-emerald-950/30! text-xs! font-mono! text-emerald-400! leading-relaxed!">
            {success}
          </div>
        )}

        {/* STEP 1: ENTER EMAIL */}
        {step === 1 && (
          <form onSubmit={handleNextStep} className="flex! flex-col! gap-5!">
            <div className="flex! flex-col! gap-1.5!">
              <label htmlFor="correo" className="text-xs! font-bold! text-slate-400! uppercase! tracking-wider! flex! items-center! gap-2!">
                <Mail size={14} className="text-brand-primary!" />
                <span>Correo electrónico de tu cuenta</span>
              </label>
              <input
                id="correo"
                type="email"
                placeholder="correo@ejemplo.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
                className="h-11! w-full! rounded-xl! border! border-slate-800! bg-slate-900/60! px-4! text-sm! text-slate-100! placeholder:text-slate-600! outline-none! transition-all! focus:border-brand-primary! focus:ring-1! focus:ring-brand-primary!"
              />
            </div>

            <button
              type="submit"
              className="mt-2! h-12! w-full! rounded-xl! bg-brand-primary! hover:bg-[#1ebda1]! text-brand-tertiary! font-bold! shadow-[0_4px_14px_0_rgba(34,211,166,0.2)]! transition-all! hover:scale-[1.01]! cursor-pointer! border-none! flex! items-center! justify-center! gap-2!"
            >
              <span>Continuar</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* STEP 2: ENTER RECOVERY CODE */}
        {step === 2 && (
          <form onSubmit={handleNextStep} className="flex! flex-col! gap-5!">
            <div className="flex! flex-col! gap-1.5!">
              <label htmlFor="codigo" className="text-xs! font-bold! text-slate-400! uppercase! tracking-wider! flex! items-center! gap-2!">
                <Key size={14} className="text-brand-primary!" />
                <span>Código de recuperación</span>
              </label>
              <input
                id="codigo"
                type="text"
                placeholder="Ingresa el código proporcionado por el Admin"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                required
                className="h-11! w-full! rounded-xl! border! border-slate-800! bg-slate-900/60! px-4! text-sm! text-slate-100! placeholder:text-slate-650! outline-none! transition-all! focus:border-brand-primary! focus:ring-1! focus:ring-brand-primary! uppercase! font-mono!"
              />
              <p className="text-[10px]! text-slate-500! leading-normal! mt-1!">
                Pide un código de recuperación al administrador de la tienda. El código es de un solo uso.
              </p>
            </div>

            <div className="flex! gap-3!">
              <button
                type="button"
                onClick={handlePrevStep}
                className="h-12! px-4! rounded-xl! border! border-slate-800! bg-slate-900/40! hover:bg-slate-900/80! text-slate-300! font-bold! transition-all! cursor-pointer! flex! items-center! justify-center! gap-1!"
              >
                <ArrowLeft size={16} />
                <span>Atrás</span>
              </button>
              <button
                type="submit"
                className="h-12! flex-1! rounded-xl! bg-brand-primary! hover:bg-[#1ebda1]! text-brand-tertiary! font-bold! shadow-[0_4px_14px_0_rgba(34,211,166,0.2)]! transition-all! hover:scale-[1.01]! cursor-pointer! border-none! flex! items-center! justify-center! gap-2!"
              >
                <span>Siguiente</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: NEW PASSWORD */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="flex! flex-col! gap-4!">
            <div className="flex! flex-col! gap-1.5!">
              <label htmlFor="nuevaContrasena" className="text-xs! font-bold! text-slate-400! uppercase! tracking-wider!">
                Nueva Contraseña
              </label>
              <div className="relative!">
                <input
                  id="nuevaContrasena"
                  type={mostrarContrasena ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  value={nuevaContrasena}
                  onChange={(e) => setNuevaContrasena(e.target.value)}
                  disabled={isLoading}
                  required
                  className="h-11! w-full! rounded-xl! border! border-slate-800! bg-slate-900/60! pr-11! pl-4! text-sm! text-slate-100! placeholder:text-slate-650! outline-none! transition-all! focus:border-brand-primary! focus:ring-1! focus:ring-brand-primary!"
                />
                <button
                  type="button"
                  onClick={() => setMostrarContrasena(!mostrarContrasena)}
                  className="absolute! right-3.5! top-1/2! -translate-y-1/2! text-slate-500! hover:text-slate-350! transition-colors! cursor-pointer! bg-transparent! border-none! p-0!"
                >
                  {mostrarContrasena ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex! flex-col! gap-1.5! mb-2!">
              <label htmlFor="confirmarContrasena" className="text-xs! font-bold! text-slate-400! uppercase! tracking-wider!">
                Confirmar Contraseña
              </label>
              <input
                id="confirmarContrasena"
                type={mostrarContrasena ? "text" : "password"}
                placeholder="Repite tu contraseña"
                value={confirmarContrasena}
                onChange={(e) => setConfirmarContrasena(e.target.value)}
                disabled={isLoading}
                required
                className="h-11! w-full! rounded-xl! border! border-slate-800! bg-slate-900/60! px-4! text-sm! text-slate-100! placeholder:text-slate-650! outline-none! transition-all! focus:border-brand-primary! focus:ring-1! focus:ring-brand-primary!"
              />
            </div>

            <div className="flex! gap-3! mt-2!">
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={isLoading}
                className="h-12! px-4! rounded-xl! border! border-slate-800! bg-slate-900/40! hover:bg-slate-900/80! text-slate-300! font-bold! transition-all! cursor-pointer! flex! items-center! justify-center! gap-1! disabled:opacity-50!"
              >
                <ArrowLeft size={16} />
                <span>Atrás</span>
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="h-12! flex-1! rounded-xl! bg-brand-primary! hover:bg-[#1ebda1]! text-brand-tertiary! font-bold! shadow-[0_4px_14px_0_rgba(34,211,166,0.2)]! transition-all! hover:scale-[1.01]! cursor-pointer! border-none! flex! items-center! justify-center! gap-2! disabled:opacity-50!"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin!" />
                    <span>Restableciendo...</span>
                  </>
                ) : (
                  <span>Restablecer Contraseña</span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: SUCCESS */}
        {step === 4 && (
          <div className="flex! flex-col! items-center! justify-center! text-center! py-4! gap-5!">
            <div className="h-16! w-16! rounded-full! bg-brand-primary/10! text-brand-primary! flex! items-center! justify-center! shadow-[0_0_20px_rgba(34,211,166,0.15)]! animate-bounce!">
              <ShieldCheck size={36} />
            </div>

            <div className="space-y-2!">
              <h4 className="text-lg! font-black! text-white!">¡Contraseña Restablecida!</h4>
              <p className="text-xs! text-slate-400! leading-relaxed!">
                Tu contraseña ha sido actualizada con éxito en el sistema. Ya puedes iniciar sesión con tu nueva credencial.
              </p>
            </div>

            <button
              onClick={() => router.push("/login")}
              className="mt-2! h-12! w-full! rounded-xl! bg-brand-primary! hover:bg-[#1ebda1]! text-brand-tertiary! font-bold! shadow-[0_4px_14px_0_rgba(34,211,166,0.2)]! transition-all! hover:scale-[1.01]! cursor-pointer! border-none! flex! items-center! justify-center! gap-2!"
            >
              <span>Ir al Login de Consola</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {step !== 4 && (
          <p className="mt-8! text-center! text-xs! text-slate-500!">
            ¿Recordaste tu contraseña?{" "}
            <Link
              href="/login"
              className="font-bold! text-brand-primary! hover:text-[#1ebda1]! transition-colors!"
            >
              Iniciar sesión
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}