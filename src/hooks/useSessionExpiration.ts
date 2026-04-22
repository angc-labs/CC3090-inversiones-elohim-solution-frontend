import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";

const WARNING_TIME = 5 * 60 * 1000; // Mostrar alerta 5 minutos antes de expirar

type SessionStatus = "active" | "warning" | "expired";

export function useSessionExpiration() {
  const router = useRouter();
  const { expiraEn, isAuthenticated, logout, isSessionExpired } = useAuthStore();
  const [now, setNow] = useState(0);

  useEffect(() => {
    const updateNow = () => {
      setNow(Date.now());
    };

    const timeout = setTimeout(updateNow, 0);

    const interval = setInterval(() => {
      updateNow();
    }, 30000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  const { status, timeRemaining } = useMemo(() => {
    if (!isAuthenticated || !expiraEn) {
      return {
        status: "active" as SessionStatus,
        timeRemaining: null as number | null,
      };
    }

    const remaining = expiraEn - now;

    if (remaining <= 0) {
      return {
        status: "expired" as SessionStatus,
        timeRemaining: 0,
      };
    }

    if (remaining <= WARNING_TIME) {
      return {
        status: "warning" as SessionStatus,
        timeRemaining: remaining,
      };
    }

    return {
      status: "active" as SessionStatus,
      timeRemaining: null,
    };
  }, [expiraEn, isAuthenticated, now]);

  useEffect(() => {
    if (status !== "expired") {
      return;
    }

    logout();
    router.push("/login");
  }, [logout, router, status]);

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
