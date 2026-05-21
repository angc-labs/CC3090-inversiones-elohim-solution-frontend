import { ClientAuthGate } from "@/components/features/auth/ClientAuthGate";

export default function TransaccionLayout({ children }: { children: React.ReactNode }) {
  return <ClientAuthGate>{children}</ClientAuthGate>;
}
