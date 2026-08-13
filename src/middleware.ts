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
  const hostWithoutPort = hostname.split(":")[0];

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
    // Soporte para dominio de producción dinámico (por defecto dmhub.fun)
    const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || "dmhub.fun";
    if (mainDomain && hostWithoutPort.endsWith(mainDomain)) {
      const prefix = hostWithoutPort.slice(0, hostWithoutPort.length - mainDomain.length);
      if (prefix.endsWith(".")) {
        subdomain = prefix.slice(0, -1);
      }
    }
  }

  // Si hay un subdominio de tienda activo (ignorando 'www' y 'admin')
  if (subdomain && subdomain !== "www" && subdomain !== "admin") {
    if (!url.pathname.startsWith("/preview/")) {
      url.pathname = `/preview/${subdomain.toLowerCase()}${url.pathname === "/" ? "" : url.pathname}`;
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
