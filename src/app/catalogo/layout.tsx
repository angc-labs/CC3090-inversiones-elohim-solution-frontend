import { ClientAuthGate } from "@/components/features/auth/ClientAuthGate";

export default function CatalogoLayout({ children }: { children: React.ReactNode }) {
  return <ClientAuthGate>{children}</ClientAuthGate>;
}
