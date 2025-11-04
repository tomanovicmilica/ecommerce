import { Link } from "react-router-dom";
import { currencyFormat } from "../../app/util/util";
import type { Product } from "../../app/models/product";
import { useWishlist } from "../../app/hooks/useWishlist";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { toggleProductInWishlist, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.productId);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleProductInWishlist(product);
  };

  const isOutOfStock = product.variants && product.variants.length > 0
    ? product.variants.every(variant => variant.quantityInStock === 0)
    : false;

  return (
    <div className="group">
      {/* Card with Image Only */}
      <Link
        to={`/catalog/${product.productId}`}
        className="block bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 h-80 relative cursor-pointer"
      >
        {(product.pictureUrl || product.imageUrl) ? (
          <img
            src={product.pictureUrl || product.imageUrl}
            alt={product.name}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null; // Prevent infinite loop
              target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect width="400" height="400" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';
            }}
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 ${
              isOutOfStock ? "opacity-50 grayscale" : ""
            }`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <svg
              className="w-24 h-24 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-lg">
              Nema na stanju
            </span>
          </div>
        )}
        {/* Wishlist Heart Button */}
        <button
          onClick={handleWishlistClick}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white transition-all duration-200 shadow-md hover:shadow-lg z-10"
        >
          <svg
            className={`w-5 h-5 transition-colors ${
              inWishlist ? "text-brown fill-current" : "text-gray-400 hover:text-brown"
            }`}
            fill={inWishlist ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </Link>

      {/* Product Info Below Card */}
      <div className="mt-3 text-center">
        {/* Product Name */}
        <h3 className="text-sm font-medium text-dark-grey mb-1">
          {product.name}
        </h3>
        {/* Product Price */}
        <div className="text-lg font-bold text-brown">
          {currencyFormat(product.price)}
        </div>
      </div>
    </div>
  );
}