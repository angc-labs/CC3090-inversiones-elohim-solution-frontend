import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";

const WARNING_TIME = 5 * 60 * 1000; // Mostrar alerta 5 minutos antes de expirar

type SessionStatus = "active" | "warning" | "expired";

export function useSessionExpiration() {
  const router = useRouter();
  const { expiraEn, isAuthenticated, logout, isSessionExpired } = useAuthStore();
  const [status, setStatus] = useState<SessionStatus>("active");
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !expiraEn) {
      setStatus("active");
      return;
    }

    const checkExpiration = () => {
      const now = Date.now();
      const remaining = expiraEn - now;

      // Si ya expiró
      if (remaining <= 0) {
        setStatus("expired");
        logout();
        router.push("/login");
        return;
      }

      // Si está en la zona de advertencia (últimos 5 minutos)
      if (remaining <= WARNING_TIME) {
        setStatus("warning");
        setTimeRemaining(remaining);
      } else {
        setStatus("active");
        setTimeRemaining(null);
      }
    };

    checkExpiration();
    const interval = setInterval(checkExpiration, 30000); // Verificar cada 30 segundos

    return () => clearInterval(interval);
  }, [expiraEn, isAuthenticated, logout, router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const formatTimeRemaining = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return {
    status,
    timeRemaining: timeRemaining ? formatTimeRemaining(timeRemaining) : null,
    handleLogout,
    isExpired: isSessionExpired(),
  };
}
