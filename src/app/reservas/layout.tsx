import { ClientAuthGate } from "@/components/features/auth/ClientAuthGate";

export default function ReservasLayout({ children }: { children: React.ReactNode }) {
  return <ClientAuthGate>{children}</ClientAuthGate>;
}
