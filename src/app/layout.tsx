import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ELOHIM - Tienda en línea",
  description: "Tienda en línea de Inversiones Elohim S.A.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#fafafa] antialiased text-gray-900">
        {children}
      </body>
    </html>
  );
}