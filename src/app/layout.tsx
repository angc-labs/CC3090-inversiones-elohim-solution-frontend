import type { Metadata } from "next";
import "./globals.css";
import { SessionExpirationWarning } from "@/components/features/auth/SessionExpirationWarning";
import { ThemeLanguageBootstrap } from "@/components/ui/ThemeLanguageBootstrap";
import { ThemeLanguageProvider } from "@/contexts/ThemeLanguageContext";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "DM Hub - Tienda en línea",
  description: "Tienda en línea de DM Hub",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased bg-slate-50 dark:bg-[#081018] text-slate-900 dark:text-slate-100 transition-colors duration-200">
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