"use client";

import { useSessionExpiration } from "@/hooks/useSessionExpiration";
import { Button } from "@/components/ui/button";

export function SessionExpirationWarning() {
  const { status, timeRemaining, handleLogout } = useSessionExpiration();

  if (status !== "warning") {
    return null;
  }

  return (
    <div className="fixed! bottom-4! right-4! z-50! max-w-sm!">
      <div className="rounded-lg! border! border-yellow-100! bg-yellow-50! p-4! shadow-lg!">
        <div className="flex! items-start! gap-3!">
          <div className="flex-shrink-0! text-yellow-600!">
            <svg
              className="h-5! w-5!"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-1!">
            <h3 className="font-semibold! text-yellow-900!">Tu sesión expira pronto</h3>
            <p className="mt-1! text-sm! text-yellow-800!">
              Te desconectarás automáticamente en {timeRemaining}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex-shrink-0! text-yellow-600! hover:text-yellow-700! transition-colors!"
            aria-label="Cerrar alerta"
          >
            ✕
          </button>
        </div>
        <div className="mt-4!">
          <Button
            onClick={handleLogout}
            className="w-full! bg-yellow-600! hover:bg-yellow-700! text-white!"
            size="sm"
          >
            Cerrar sesión ahora
          </Button>
        </div>
      </div>
    </div>
  );
}
