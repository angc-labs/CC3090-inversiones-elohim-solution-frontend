import { notFound } from "next/navigation";
import { CatalogoShell } from "@/components/features/catalogo/CatalogoShell";
import { ProductDetail } from "@/components/features/catalogo/ProductDetail";
import productosData from "@/mock/producto.json";

type ProductoPageProps = {
  params: {
    idProducto: string;
  };
};

export default function ProductoPage({ params }: ProductoPageProps) {
  const product = productosData.productos.find(
    (item) => item.idProducto === params.idProducto
  );

  if (!product) {
    notFound();
  }

  return (
    <CatalogoShell eyebrow="Detalle del producto" showSidebar={false}>
      <ProductDetail product={product} />
    </CatalogoShell>
  );
}
