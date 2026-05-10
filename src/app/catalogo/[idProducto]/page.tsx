import { notFound } from "next/navigation";
import { CatalogoShell } from "@/components/features/catalogo/CatalogoShell";
import { ProductDetail } from "@/components/features/catalogo/ProductDetail";
import { obtenerProductoPorId } from "@/lib/api/productos";
import { ApiError } from "@/lib/api/client";

type ProductoPageProps = {
  params: Promise<{
    idProducto: string;
  }>;
};

async function cargarProducto(idProducto: string) {
  try {
    return await obtenerProductoPorId(idProducto);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

export default async function ProductoPage({ params }: ProductoPageProps) {
  const { idProducto } = await params;

  const product = await cargarProducto(idProducto);

  if (!product) {
    notFound();
  }

  return (
    <CatalogoShell eyebrow="Detalle del producto" showSidebar={false}>
      <ProductDetail product={product} />
    </CatalogoShell>
  );
}
