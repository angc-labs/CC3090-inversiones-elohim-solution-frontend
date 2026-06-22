import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host") || "";

  // Evitar procesar archivos estáticos o rutas internas de Next.js
  if (
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/api") ||
    url.pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Extraer el subdominio
  let subdomain = "";

  if (hostname.includes("localhost:3000")) {
    const parts = hostname.split(".localhost:3000");
    if (parts.length > 1) {
      subdomain = parts[0];
    }
  } else if (hostname.includes("lvh.me:3000")) {
    const parts = hostname.split(".lvh.me:3000");
    if (parts.length > 1) {
      subdomain = parts[0];
    }
  } else {
    // Soporte para dominio de producción dinámico
    const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN; // ej. elohimshop.com
    if (mainDomain && hostname.includes(mainDomain)) {
      const parts = hostname.split(`.${mainDomain}`);
      if (parts.length > 1) {
        subdomain = parts[0];
      }
    }
  }

  // Si hay un subdominio de tienda activo (ignorando 'www' y 'admin')
  if (subdomain && subdomain !== "www" && subdomain !== "admin") {
    // Si el usuario entra a la raíz de la tienda, reescribir internamente a la página del constructor (preview)
    if (url.pathname === "/") {
      url.pathname = `/preview/${subdomain.toLowerCase()}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
