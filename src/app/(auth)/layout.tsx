import { GuestAuthGate } from "@/components/features/auth/GuestAuthGate";
import { GoogleAuthProvider } from "@/components/features/auth/GoogleAuthProvider";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <GoogleAuthProvider>
      <GuestAuthGate>{children}</GuestAuthGate>
    </GoogleAuthProvider>
  );
}
