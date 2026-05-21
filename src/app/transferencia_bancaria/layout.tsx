import { ClientAuthGate } from "@/components/features/auth/ClientAuthGate";

export default function TransferenciaLayout({ children }: { children: React.ReactNode }) {
  return <ClientAuthGate>{children}</ClientAuthGate>;
}
