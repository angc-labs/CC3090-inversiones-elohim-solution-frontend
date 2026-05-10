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
  onAddToCart?: () => void;
}

export function ProductCard({
  productId,
  name,
  description,
  price,
  badge,
  image,
  href,
  onAddToCart,
}: ProductCardProps) {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isAdding, setIsAdding] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const imageSrc = image ?? "/placeholder.png";

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
        cantidad: 1,
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
      {/* Product Card Container */}
      <div className="relative h-full">
        {/* Top colored card with image area and icons */}
        <div
          className="rounded-2xl h-80 relative flex items-start justify-between p-4 overflow-hidden bg-gray-100"
        >
          {/* Background image */}
          <Image
            width={100}
            height={100}
            src={imageSrc}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />

          {/* Badge */}
          {badge && (
            <div className="relative z-10 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
              <span className="text-xs font-semibold text-gray-700">
                💎 {badge}
              </span>
            </div>
          )}
          {/* Heart icon */}
          <button className="relative duration-300! z-10 p-2! hover:bg-accent bg-white rounded-full shadow-md hover:shadow-lg transition-shadow">
            <CiHeart className="text-xl" />
          </button>
        </div>

        {/* Bottom white card with product info - overlapping */}
        <div className="relative mt-5! mx-2 rounded-2xl p-5 transition-shadow flex flex-col h-full gap-2">

          {/* Product name */}
          <h3 className="text-sm font-bold text-slate-900 mb-2">{name}</h3>

          {/* Description */}
          <p className="text-xs text-gray-600 mb-3 leading-tight">
            {description}
          </p>

          {/* Price */}
          <p className="text-xl font-bold text-slate-900 mb-4">{price}</p>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={onAddToCart}
              disabled={!onAddToCart}
              className="w-full py-3! bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-full font-semibold text-sm hover:shadow-md 
            transition-shadow flex items-center justify-center gap-2
            hover:bg-gradient-to-r hover:from-blue-800 hover:to-blue-700 duration-1000! disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CiShoppingCart className="text-xl" />
              {isAdding ? "Agregando..." : "Añadir"}
            </button>
            {href && (
              <Link
                href={href}
                className="inline-flex w-full items-center justify-center rounded-full border border-blue-600 px-4 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
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
