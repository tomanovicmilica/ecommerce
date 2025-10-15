import { Link } from "react-router-dom";
import type { Product } from "../../app/models/product";

interface RecommendedProductsProps {
  products: Product[];
  title?: string;
}

export default function RecommendedProducts({
  products,
  title = "Recommended for you"
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
              <img
                src={product.pictureUrl}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
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
                  ${(product.price / 100).toFixed(2)}
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