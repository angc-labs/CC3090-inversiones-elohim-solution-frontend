"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useProductos } from "@/hooks/useProductos";
import { useCarritoStore } from "@/stores/useCarritoStore";
import { ShoppingCart, LogOut } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { productos, isLoading, isError } = useProductos();
  const agregarItem = useCarritoStore(state => state.agregarItem);
  const logout = useAuthStore(state => state.logout);
  const usuario = useAuthStore(state => state.usuario);
  const totalItems = useCarritoStore(state => state.totalItems());
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleAgregarCarrito = (producto: { idProducto: string; nombreProducto: string; precio: number; imagenPrincipal?: string }) => {
    agregarItem({
      productoId: producto.idProducto,
      nombreProducto: producto.nombreProducto,
      precio: producto.precio,
      cantidad: 1,
      imagenPrincipal: producto.imagenPrincipal,
    });
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!isAuthenticated) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f8f6]">
        <div className="flex items-center gap-3 text-gray-400">
          <div className="h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          <span className="text-sm">Cargando productos...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f8f6]">
        <div className="text-center">
          <p className="text-red-400 text-sm">Error al cargar productos</p>
          <button onClick={() => window.location.reload()} className="mt-3 text-xs text-gray-400 underline">Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8f6]">

      {/* Header — mismo estilo que landing */}
      <header className="fixed top-0! z-50! w-full! border-b border-gray-100 bg-white/75 backdrop-blur-md">
        <div className="mx-auto! flex! h-14 max-w-6xl items-center! justify-between! px-4! sm:px-6! lg:px-8!">
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 text-white shadow-sm">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight text-gray-900">ELOHIM</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-xs hidden sm:block">
              Hola, <span className="text-gray-600 font-medium">{usuario?.nombre}</span>
            </span>

            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/carrito")}
                className="h-8 w-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-medium leading-none">
                  {totalItems}
                </span>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="h-8 px-3! text-xs text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto pt-17! max-w-6xl! px-4! sm:px-6! lg:px-8! py-10">

        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 tracking-tight">Catálogo</h2>
          {productos.length > 0 && (
            <p className="text-sm text-gray-400 mt-0.5">{productos.length} productos disponibles</p>
          )}
        </div>

        {productos.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-4xl mb-3 opacity-20">📦</div>
            <p className="text-gray-400 text-sm">No hay productos disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {productos.map((producto) => (
              <Card
                key={producto.idProducto}
                className="group bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200 rounded-xl overflow-hidden shadow-none"
              >
              {/* Imagen */}
              <div className="relative aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                {/* place holder <div className="aspect-square bg-gray-200 animate-pulse rounded-md" /> */}

                {/* badge de nuevo azul */}
                <span className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] px-2 py-1 rounded-md font-semibold shadow-sm z-10">
                  NUEVO
                </span>

                {producto.imagenPrincipal ? (
                  <img
                    src={producto.imagenPrincipal}
                    alt={producto.nombreProducto}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <span className="text-3xl opacity-20">📦</span>
                )}
              </div>

                <CardHeader className="pb-1 px-3 pt-3">
                  <CardTitle className="text-gray-800 text-xs font-medium line-clamp-2 leading-snug">
                    {producto.nombreProducto}
                  </CardTitle>
                </CardHeader>

                <CardContent className="px-3 pb-1">
                  <p className="text-sm font-bold text-gray-900">
                    Q{producto.precio.toFixed(2)}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {producto.stockActual > 0
                      ? `${producto.stockActual} en stock`
                      : "Agotado"}
                  </p>
                </CardContent>

                <CardFooter className="px-3 pb-3">
                  <Button
                    onClick={() => handleAgregarCarrito(producto)}
                    disabled={producto.stockActual === 0}
                    size="sm"
                    className="w-full h-7 text-xs rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors shadow-none"
                  >
                    {producto.stockActual === 0 ? "Sin stock" : "Agregar"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
