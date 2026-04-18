interface ProductCardProps {
  id: number;
  name: string;
  description: string;
  price: string;
  rating: number;
  reviews: number;
  badge: string | null;
  color: string;
  image: string;
}

export function ProductCard({
  name,
  description,
  price,
  reviews,
  badge,
  color,
  image,
}: ProductCardProps) {
  return (
    <div className="h-full">
      {/* Product Card Container */}
      <div className="relative h-full">
        {/* Top colored card with image area and icons */}
        <div
          className="rounded-2xl h-80 relative flex items-start justify-between p-4 overflow-hidden bg-gray-100"
        >
          {/* Background image */}
          <img
            src={image}
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
          <button className="relative z-10 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow">
            <span className="text-xl">♡</span>
          </button>
          {/* Cart icon */}
          <button className="absolute bottom-4 right-4 z-10 p-2 bg-white/80 rounded-lg shadow-md hover:shadow-lg transition-shadow text-lg">
            🛒
          </button>
        </div>

        {/* Bottom white card with product info - overlapping */}
        <div className="relative -mt-12 mx-2 rounded-2xl bg-white p-5 shadow-md hover:shadow-lg transition-shadow">
          {/* Stars and reviews */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-lg">
                  ⭐
                </span>
              ))}
            </div>
            <span className="text-xs text-gray-500 font-medium">
              {reviews}
            </span>
          </div>

          {/* Product name */}
          <h3 className="text-sm font-bold text-slate-900 mb-2">{name}</h3>

          {/* Description */}
          <p className="text-xs text-gray-600 mb-3 leading-tight">
            {description}
          </p>

          {/* Price */}
          <p className="text-xl font-bold text-slate-900 mb-4">{price}</p>

          {/* Add to cart button */}
          <button className="w-full py-3 bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-full font-semibold text-sm hover:shadow-md transition-shadow flex items-center justify-center gap-2">
            <span>🛒</span> Añadir al carrito
          </button>
        </div>
      </div>
    </div>
  );
}
