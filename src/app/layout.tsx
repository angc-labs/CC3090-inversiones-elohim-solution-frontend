import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import "./globals.css";
import { SessionExpirationWarning } from "@/components/features/auth/SessionExpirationWarning";
import { ThemeLanguageBootstrap } from "@/components/ui/ThemeLanguageBootstrap";
import { ThemeLanguageProvider } from "@/contexts/ThemeLanguageContext";
import { Toaster } from "sonner";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DMHub — Plataforma B2B para Distribuidores",
  description: "Gestiona múltiples tiendas, distribuidores y sucursales desde un solo panel unificado. Inventario multi-nodo, precios dinámicos por rol y sincronización en tiempo real.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geist.variable} ${inter.variable}`}>
      <body className="min-h-screen antialiased bg-[#0c141c] text-[#dbe3ef] transition-colors duration-200">
        <ThemeLanguageProvider>
          <ThemeLanguageBootstrap />
          {children}

          <Toaster richColors position="top-right" />

          <SessionExpirationWarning />
        </ThemeLanguageProvider>
      </body>
    </html>
  );
}