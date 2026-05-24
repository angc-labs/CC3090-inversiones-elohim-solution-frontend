"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ClientesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/usuarios");
  }, [router]);

  return (
    <p className="text-sm text-slate-500">Redirigiendo a usuarios…</p>
  );
}
