import { Link } from "react-router-dom";
import { useWishlist } from "../../app/hooks/useWishlist";
import { currencyFormat } from "../../app/util/util";

export default function WishlistPage() {
  const { wishlistItems, removeProductFromWishlist, clearAllWishlist } = useWishlist();

  if (wishlistItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-dark-grey mb-8">Moja lista zelja</h1>
        <div className="text-center py-16">
          <svg
            className="w-24 h-24 text-light-grey mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <h2 className="text-xl font-semibold text-dark-grey mb-2">Tvoja lista zelja je prazna.</h2>
          <p className="text-light-grey mb-6">Dodaj proizvode koji ti se svidjaju na svoju listu zelja!</p>
          <Link
            to="/catalog"
            className="inline-block bg-brown text-white px-6 py-3 rounded-lg font-medium hover:bg-dark-grey transition-colors"
          >
            Pregledaj proizvode
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-dark-grey">
          Moja lista želja ({wishlistItems.length} stavki)
        </h1>
        {wishlistItems.length > 0 && (
          <button
            onClick={clearAllWishlist}
            className="text-dark-grey hover:text-brown font-medium transition-colors"
          >
            Izbriši sve
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlistItems.map((product) => (
          <div
            key={product.productId}
            className="bg-white rounded-xl overflow-hidden shadow-sm border border-light-grey hover:shadow-md transition-shadow"
          >
            {/* Product Image */}
            <div className="relative aspect-square bg-gray-50 p-4">
              <Link to={`/catalog/${product.productId}`}>
                <img
                  src={product.pictureUrl}
                  alt={product.name}
                  className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                />
              </Link>
              {/* Remove Button */}
              <button
                onClick={() => removeProductFromWishlist(product.productId)}
                className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white rounded-full shadow-md hover:shadow-lg transition-all"
              >
                <svg
                  className="w-4 h-4 text-gray-500 hover:text-dark-grey"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Product Info */}
            <div className="p-4">
              <Link to={`/catalog/${product.productId}`}>
                <h3 className="font-medium text-dark-grey mb-2 hover:text-brown transition-colors overflow-hidden text-sm" style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {product.name}
                </h3>
              </Link>
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-semibold text-brown">
                  {currencyFormat(product.price)}
                </span>
                <span className="text-xs text-gray-500 bg-beige px-2 py-1 rounded">
                  {product.categoryName}
                </span>
              </div>
              <Link
                to={`/catalog/${product.productId}`}
                className="w-full block text-center bg-brown text-white py-2 px-4 rounded-lg font-medium hover:bg-dark-grey transition-colors text-sm"
              >
                Pogledaj proizvod
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}