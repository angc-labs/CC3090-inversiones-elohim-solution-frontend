"use client";

import Link from "next/link";
import { TProducto } from "@/types";
import { ImageCarousel } from "@/components/features/catalogo/ImageCarousel";

type ProductDetailProps = {
  product: TProducto;
};

export function ProductDetail({ product }: ProductDetailProps) {
  const formattedPrice = `Q${product.precio.toFixed(2)}`;
  const expirationDate = product.fechaVencimiento
    ? new Date(product.fechaVencimiento).toLocaleDateString("es-GT", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "No aplica";

  const productImages = [
    product.imagenPrincipal ?? "/placeholder.png",
  ];

  return (
    <div className="grid gap-10 lg:grid-cols-[1.3fr_0.9fr]">
      <section className="rounded-[2rem] bg-white p-6 shadow-sm shadow-slate-200/50">
        <div className="flex flex-col gap-6">
          <ImageCarousel images={productImages} alt={product.nombreProducto} />
        </div>
      </section>

      <aside className="space-y-6">
        <div className="rounded-[2rem] bg-white p-8 shadow-sm shadow-slate-200/50">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-blue-600">Producto</p>
              <h1 className="mt-3 text-4xl font-black text-slate-900">
                {product.nombreProducto}
              </h1>
            </div>
            <div className="rounded-3xl bg-slate-50 px-5 py-4 text-right">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Precio</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{formattedPrice}</p>
            </div>
          </div>

          <p className="mt-6 text-sm leading-7 text-slate-600">
            {product.descripcion ?? "No hay descripción disponible para este producto."}
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Marca</p>
              <p className="mt-3 text-base font-semibold text-slate-900">
                {product.idMarca ?? "No definida"}
              </p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Categoría</p>
              <p className="mt-3 text-base font-semibold text-slate-900">
                {product.categoriaId ?? "No definida"}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Stock</p>
              <p className="mt-3 text-base font-semibold text-slate-900">{product.stockActual}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Vencimiento</p>
              <p className="mt-3 text-base font-semibold text-slate-900">{expirationDate}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              🛒 Añadir al carrito
            </button>
            <Link
              href="/catalogo"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              ← Volver al catálogo
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
