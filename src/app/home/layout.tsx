import { ClientAuthGate } from "@/components/features/auth/ClientAuthGate";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return <ClientAuthGate>{children}</ClientAuthGate>;
}
