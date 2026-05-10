import Link from "next/link";
import { ShoppingCart } from "lucide-react";

type appHeaderProps = {
  onCartClick?: () => void;
  showCart?: boolean;
};

export function appHeader({ onCartClick, showCart = true }: appHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-gray-200/80 bg-white px-6 py-3">
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-white shadow-sm">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <span className="text-sm font-semibold tracking-tight text-gray-900">
          <Link href="/home">ESMIRNA</Link>
        </span>
      </div>

      {showCart && (
        <button
          onClick={onCartClick}
          className="text-gray-400 transition-colors hover:text-gray-600"
          aria-label="Ir al carrito"
        >
          <ShoppingCart className="h-5 w-5" />
        </button>
      )}
    </header>
  );
}