"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CiHeart, CiShoppingCart } from "react-icons/ci";
import Image from "next/image";
import { agregarArticuloCarrito } from "@/lib/api/carrito";
import { useAuthStore } from "@/stores/useAuthStore";

interface ProductCardProps {
  productId: string;
  name: string;
  description: string;
  price: string;
  rating: number;
  badge: string | null;
  image?: string;
  href?: string;
}

export function ProductCard({
  productId,
  name,
  description,
  price,
  badge,
  image,
  href,
}: ProductCardProps) {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [isAdding, setIsAdding] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const imageSrc = image ?? "/placeholder.png";

  // Convertir precio a número
  const unitPrice = parseFloat(price.replace("Q", ""));

  // Lógica de descuentos por volumen
  const getDiscount = (qty: number) => {
    if (qty >= 30) return 0.15;
    if (qty >= 20) return 0.06;
    if (qty >= 10) return 0.03;
    return 0;
  };

  const discount = getDiscount(quantity);

  const originalTotal = unitPrice * quantity;
  const subtotal = originalTotal * (1 - discount);
  const savings = originalTotal - subtotal;

  const handleAddToCart = async () => {
    if (!isAuthenticated || !token) {
      router.push("/login");
      return;
    }

    setIsAdding(true);
    setFeedback(null);

    try {
      await agregarArticuloCarrito(token, {
        productoId: productId,
        cantidad: quantity,
      });
      setFeedback("Agregado al carrito");
    } catch {
      setFeedback("No se pudo agregar al carrito");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="h-full bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow px-4! py-3!">
      <div className="relative h-full">

        {/* Imagen */}
        <div className="rounded-2xl h-80 relative flex items-start justify-between p-4 overflow-hidden bg-gray-100">
          <Image
            width={100}
            height={100}
            src={imageSrc}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />

          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />

          {badge && (
            <div className="relative z-10 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
              <span className="text-xs font-semibold text-gray-700">
                💎 {badge}
              </span>
            </div>
          )}

          <button className="relative z-10 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow">
            <CiHeart className="text-xl" />
          </button>
        </div>

        {/* Info */}
        <div className="relative mt-5 mx-2 rounded-2xl p-5 flex flex-col gap-2">

          <h3 className="text-sm font-bold text-slate-900 mb-2">{name}</h3>

          <p className="text-xs text-gray-600 mb-3 leading-tight">
            {description}
          </p>

          {/* PRECIOS */}
          <div className="mb-3">

            {/* Precio unitario */}
            <p className="text-sm text-gray-500">
              Precio unitario: {price}
            </p>

            {/* Precio original tachado si hay descuento */}
            {discount > 0 && (
              <p className="text-sm text-gray-400 line-through">
                Q{originalTotal.toFixed(2)}
              </p>
            )}

            {/* Descuento */}
            {discount > 0 && (
              <p className="text-xs text-green-600 font-semibold">
                Descuento: {(discount * 100).toFixed(0)}%
              </p>
            )}

            {/* Total final */}
            <p className="text-xl font-bold text-slate-900">
              Total: Q{subtotal.toFixed(2)}
            </p>

            {/* Ahorro */}
            {discount > 0 && (
              <p className="text-xs text-green-700 font-medium">
                Ahorras: Q{savings.toFixed(2)}
              </p>
            )}
          </div>

          {/* CONTROLES DE CANTIDAD */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-3 py-1 bg-gray-200 rounded-lg"
            >
              -
            </button>

            <span className="font-semibold">{quantity}</span>

            <button
              onClick={() => setQuantity(quantity + 1)}
              className="px-3 py-1 bg-gray-200 rounded-lg"
            >
              +
            </button>
          </div>

          {/* BOTONES */}
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => void handleAddToCart()}
              disabled={isAdding}
              className="w-full py-3 bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-full font-semibold text-sm hover:shadow-md 
              flex items-center justify-center gap-2
              hover:from-blue-800 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <CiShoppingCart className="text-xl" />
              {isAdding ? "Agregando..." : "Añadir"}
            </button>

            {href && (
              <Link
                href={href}
                className="inline-flex w-full items-center justify-center rounded-full border border-blue-600 px-4 py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50"
              >
                Ver detalle
              </Link>
            )}
          </div>

          {feedback && (
            <p className="mt-2 text-xs font-medium text-slate-600">
              {feedback}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
