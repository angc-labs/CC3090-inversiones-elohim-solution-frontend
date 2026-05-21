import { ClientAuthGate } from "@/components/features/auth/ClientAuthGate";

export default function CambiarContrasenaLayout({ children }: { children: React.ReactNode }) {
  return <ClientAuthGate>{children}</ClientAuthGate>;
}
