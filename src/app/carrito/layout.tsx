import { ClientAuthGate } from "@/components/features/auth/ClientAuthGate";

export default function CarritoLayout({ children }: { children: React.ReactNode }) {
  return <ClientAuthGate>{children}</ClientAuthGate>;
}
