"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { changePassword } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/useAuthStore";

export default function CambiarContrasenaPage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setFeedback("Todos los campos son obligatorios.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setFeedback("La nueva contraseña y su confirmación no coinciden.");
      return;
    }

    if (newPassword.length < 8) {
      setFeedback("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (!token) {
      setFeedback("Debes iniciar sesión para cambiar tu contraseña.");
      return;
    }

    try {
      setIsSubmitting(true);
      await changePassword(currentPassword, newPassword, token);
      setFeedback("Contraseña actualizada correctamente.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      router.push("/home");
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo cambiar la contraseña.";
      setFeedback(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="mx-auto! max-w-xl! space-y-6! px-4! py-10! text-slate-900! sm:px-6! lg:px-8!">
        <div className="rounded-3xl! border! border-slate-200! bg-white! p-8! shadow-sm!">
          <h1 className="text-2xl! font-semibold!">Acción restringida</h1>
          <p className="mt-3! text-slate-600!">
            Debes iniciar sesión para cambiar tu contraseña.
          </p>
          <div className="mt-6! flex! flex-col! gap-3! sm:flex-row!">
            <Link href="/auth/login" className="inline-flex! items-center! justify-center! rounded-xl! bg-blue-600! px-4! py-3! text-sm! font-semibold! text-white! transition! hover:bg-blue-700!">
              Ir a iniciar sesión
            </Link>
            <Link href="/auth/forgot-password" className="inline-flex! items-center! justify-center! rounded-xl! border! border-slate-300! px-4! py-3! text-sm! font-semibold! text-slate-700! transition! hover:bg-slate-50!">
              Recuperar contraseña
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto! max-w-xl! px-4! py-10! sm:px-6! lg:px-8!">
      <div className="rounded-3xl! border! border-slate-200! bg-white! p-8! shadow-sm!">
        <h1 className="text-3xl! font-semibold! text-slate-900!">Cambiar contraseña</h1>
        <p className="mt-3! text-slate-600!">
          Actualiza tu contraseña de acceso. Usa una clave segura de al menos 8 caracteres.
        </p>

        <form className="mt-8! space-y-6!" onSubmit={handleSubmit}>
          <div className="space-y-4!">
            <label className="block! text-sm! font-medium! text-slate-700!">
              Contraseña actual
              <Input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                placeholder="Ingresa tu contraseña actual"
                required
                className="mt-2!"
              />
            </label>

            <label className="block! text-sm! font-medium! text-slate-700!">
              Nueva contraseña
              <Input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Nueva contraseña"
                required
                className="mt-2!"
              />
            </label>

            <label className="block! text-sm! font-medium! text-slate-700!">
              Confirmar nueva contraseña
              <Input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repite la contraseña"
                required
                className="mt-2!"
              />
            </label>
          </div>

          {feedback && <Alert type="info" message={feedback} />}

          <div className="flex! flex-col! gap-3! sm:flex-row! sm:items-center!">
            <Button type="submit" disabled={isSubmitting} className="w-full! sm:w-auto!">
              {isSubmitting ? "Guardando..." : "Guardar cambios"}
            </Button>
            <Link href="/home" className="inline-flex! items-center! justify-center! rounded-xl! border! border-slate-300! px-4! py-3! text-sm! font-semibold! text-slate-700! transition! hover:bg-slate-50!">
              Volver al inicio
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
