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
        <img
          src={product.pictureUrl}
          alt={product.name}
          className={`w-full h-full object-contain transition-transform duration-300 group-hover:scale-110 ${
            isOutOfStock ? "opacity-50 grayscale" : ""
          }`}
        />
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