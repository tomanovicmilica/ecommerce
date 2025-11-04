import { Link } from "react-router-dom";
import type { Product } from "../../app/models/product";

interface RecommendedProductsProps {
  products: Product[];
  title?: string;
}

export default function RecommendedProducts({
  products,
  title = "Možda te zanima"
}: RecommendedProductsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 pt-8 border-t border-light-grey">
      <h2 className="text-2xl font-bold text-dark-grey mb-6">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link
            key={product.productId}
            to={`/catalog/${product.productId}`}
            className="group block bg-white rounded-xl shadow-sm border border-light-grey overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="aspect-square overflow-hidden bg-gray-100">
              {(product.pictureUrl || product.imageUrl) ? (
                <img
                  src={product.pictureUrl || product.imageUrl}
                  alt={product.name}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect width="400" height="400" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg
                    className="w-16 h-16 text-gray-400"
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
            </div>
            <div className="p-4">
              <h3 className="font-medium text-dark-grey text-sm mb-2 overflow-hidden" style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}>
                {product.name}
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-brown font-semibold">
                  {product.price} din
                </span>
                <span className="text-xs text-gray-500 bg-beige px-2 py-1 rounded">
                  {product.categoryName}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}