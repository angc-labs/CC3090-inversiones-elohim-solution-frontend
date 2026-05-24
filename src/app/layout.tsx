import type { Metadata } from "next";
import "./globals.css";
import { SessionExpirationWarning } from "@/components/features/auth/SessionExpirationWarning";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Esmira - Tienda en línea",
  description: "Tienda en línea de Esmira",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen! bg-[#fafafa]! antialiased! text-gray-900!">
        {children}

        <Toaster richColors position="top-right" />

        <SessionExpirationWarning />
      </body>
    </html>
  );
}