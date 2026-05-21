import { ClientAuthGate } from "@/components/features/auth/ClientAuthGate";

export default function PerfilLayout({ children }: { children: React.ReactNode }) {
  return <ClientAuthGate>{children}</ClientAuthGate>;
}
