import { GuestAuthGate } from "@/components/features/auth/GuestAuthGate";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <GuestAuthGate>{children}</GuestAuthGate>;
}
