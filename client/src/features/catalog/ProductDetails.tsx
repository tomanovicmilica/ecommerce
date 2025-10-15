import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { toast } from 'react-toastify';
import { Download, ShoppingCart } from 'lucide-react';
import LoadingComponent from "../../app/layout/LoadingComponent";
import { useAppSelector, useAppDispatch } from "../../app/store/configureStore";
import { addBasketItemAsync, removeBasketItemAsync } from "../basket/basketSlice";
import { fetchProductAsync, productSelectors } from "./catalogSlice";
import { useProductVariants } from "../../app/hooks/useProductVariants";
import { useVariantSelection } from "../../app/hooks/useVariantSelection";
import { useBasketItem } from "../../app/hooks/useBasketItem";
import { useUserHistory } from "../../app/hooks/useUserHistory";
import { useWishlist } from "../../app/hooks/useWishlist";
import { useDigitalDownloads } from "../../app/hooks/useDigitalDownloads";
import { ProductType } from "../../app/models/product";
import RecommendedProducts from "./RecommendedProducts";
/* import CustomizedDialogs from "../../app/components/CustomizedDialogs"; */

export default function ProductDetails() {
  useAppSelector((state) => state.basket);
  const dispatch = useAppDispatch();
  const { productId } = useParams<{ productId: string }>();
  const product = useAppSelector((state) =>
    productSelectors.selectById(state, Number(productId!))
  );
  const { status: productStatus } = useAppSelector((state) => state.catalog);
  const { user } = useAppSelector((state) => state.account);

  const [quantity, setQuantity] = useState(1); // Always 1, but hidden from user
  const lastTrackedProductId = useRef<number | null>(null);

  // Use custom hooks
  const { attributeMap, findVariantByAttributes } = useProductVariants(product);
  const {
    selectedVariant,
    allAttributesSelected,
    handleAttributeSelect,
    isAttributeSelected
  } = useVariantSelection({ attributeMap, findVariantByAttributes });
  const { basketItem } = useBasketItem({
    productId: product?.productId || 0,
    selectedVariant
  });
  const { addToViewHistory, getRecommendedProducts } = useUserHistory();
  const { toggleProductInWishlist, isInWishlist } = useWishlist();
  const { downloads, fetchUserDownloads, downloadFile } = useDigitalDownloads();

  const isAdmin = user?.roles?.includes('Admin') || false;

  useEffect(() => {
    // Don't update quantity from basketItem since we always want to add 1
    if (!product && productId)
      dispatch(fetchProductAsync(parseInt(productId)));
  }, [productId, product, dispatch]);

  // Track product view when product is loaded
  useEffect(() => {
    if (product && product.productId && lastTrackedProductId.current !== product.productId) {
      addToViewHistory(product);
      lastTrackedProductId.current = product.productId;
    }
  }, [product, addToViewHistory]);

  useEffect(() => {
    if (user && product?.productType === ProductType.Digital) {
      fetchUserDownloads();
    }
  }, [user, product, fetchUserDownloads]);

  // Removed handleInputChange since quantity input is hidden

  function handleUpdateCart() {
    if (!product) return;

    if (!allAttributesSelected || !selectedVariant) {
      toast.warning("Molim te izaberi sve opcije proizvoda!");
      return;
    }

    const attributeValueIds = selectedVariant.attributeValueIds;
    if (!attributeValueIds || attributeValueIds.length === 0) {
      console.error("attributeValueIds is empty or undefined!");
      return;
    }

    // Check if we have enough stock
    const currentCartQuantity = basketItem?.quantity || 0;
    const availableStock = selectedVariant.quantityInStock;

    if (availableStock < 1) {
      alert("Proizvod nije dostupan!");
      return;
    }

    if (currentCartQuantity >= availableStock) {
      alert(`Maksimalna dostupna količina je ${availableStock}. Vec imate ${currentCartQuantity} u korpi.`);
      return;
    }

    // Always add 1 item to cart
    dispatch(
      addBasketItemAsync({
        productId: product.productId,
        quantity: 1,
        attributeValueIds,
      })
    );
  }

  // Check if user already owns this digital product
  const ownedDownload = product?.productType === ProductType.Digital ?
    downloads.find(download => (download.productId === product.productId || download.orderItemId) && (download.isActive !== false && download.canDownload)) :
    null;

  function handleDownloadProduct() {
    if (ownedDownload) {
      downloadFile(ownedDownload.downloadId || ownedDownload.id, ownedDownload.productName);
    }
  }


  if (productStatus.includes("pending"))
    return <LoadingComponent />;

  /*if (!product) return <NotFound />;*/
  if (!product) return <p className="text-dark-grey">Proizvod nije pronađen</p>;

  // Get recommended products based on viewing history
  const recommendedProducts = getRecommendedProducts(product.productId);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-14">
      {/* LEFT IMAGE */}
      <div className="pl-8">
        <img
          src={product.pictureUrl}
          alt={product.name}
          className="w-4/5 rounded-2xl shadow"
        />
      </div>

      {/* RIGHT DETAILS */}
      <div className="ml-16">
        <h1 className="text-3xl font-bold text-dark-grey">{product.name}</h1>
        <p className="text-lg text-brown font-semibold my-2 mt-3.5 mb-6">
          {(product.price)} rsd
        </p>

       

        {Object.keys(attributeMap).map((attrName) => (
          <div key={attrName} className="mb-4">
            <p className="font-medium text-brown">{attrName}</p>
            <div className="flex gap-2 mt-1">
              {attributeMap[attrName].map((value) => (
                <button
                  key={value}
                  className={`px-3 py-1 rounded border ${
                    isAttributeSelected(attrName, value) ? "bg-brown text-white border-brown" : "bg-transparent border-brown text-dark-grey hover:bg-light-grey"
                  }`}
                  onClick={() => handleAttributeSelect(attrName, value)}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* STOCK INFO FOR PHYSICAL PRODUCTS */}
        {product?.productType === ProductType.Physical && selectedVariant && (
          <div className="mb-4 p-3 bg-white rounded-lg border border-beige">
            <p className="text-sm text-dark-grey">
              <span className="font-medium text-brown">
                {selectedVariant.quantityInStock > 0 ? "In Stock" : "Out of Stock"}
              </span>
              {basketItem && (
                <span className="ml-2">
                  (You have {basketItem.quantity} in cart)
                </span>
              )}
            </p>
          </div>
        )}

        {/* DIGITAL PRODUCT INFO */}
        {product?.productType === ProductType.Digital && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 font-medium">📱 Digitalni proizvod</p>
            <p className="text-xs text-blue-600 mt-1">
              Odmah dostupan za preuzimanje nakon kupovine
              {product.isInstantDelivery && " • Trenutna dostava"}
            </p>
          </div>
        )}

        {/* DIGITAL PRODUCT ACTIONS */}
        {!isAdmin && product?.productType === ProductType.Digital && (
          <div className="mt-6">
            {ownedDownload ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 text-sm font-medium mb-2">✓ Već posedujete ovaj digitalni proizvod</p>
                  <p className="text-green-600 text-xs">
                    Preuzimanja: {ownedDownload.downloadCount}/{ownedDownload.maxDownloads}
                    {(ownedDownload.expiryDate || ownedDownload.expiresAt) && (
                      <span className="ml-2">• Ističe: {new Date(ownedDownload.expiryDate || ownedDownload.expiresAt).toLocaleDateString('sr-RS')}</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleDownloadProduct}
                    disabled={!(ownedDownload.isActive !== false && ownedDownload.canDownload) || ownedDownload.downloadCount >= ownedDownload.maxDownloads}
                    className="inline-flex items-center px-8 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Preuzmi odmah
                  </button>

                  {/* Wishlist Button */}
                  <button
                    onClick={() => product && toggleProductInWishlist(product)}
                    className="flex items-center justify-center w-12 h-12 rounded-lg border-2 border-brown hover:bg-light-grey hover:text-white transition-all duration-200"
                  >
                    <svg
                      className={`w-5 h-5 transition-colors ${
                        product && isInWishlist(product.productId)
                          ? "text-brown fill-current"
                          : "text-brown hover:text-white"
                      }`}
                      fill={product && isInWishlist(product.productId) ? "currentColor" : "none"}
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
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                {/* Add to Cart Button for Digital Products */}
                <button
                  onClick={handleUpdateCart}
                  className="inline-flex items-center px-8 py-3 rounded-lg bg-brown text-white font-medium hover:bg-dark-grey transition-colors"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Kupi digitalni proizvod
                </button>

                {/* Wishlist Button */}
                <button
                  onClick={() => product && toggleProductInWishlist(product)}
                  className="flex items-center justify-center w-12 h-12 rounded-lg border-2 border-brown hover:bg-light-grey hover:text-white transition-all duration-200"
                >
                  <svg
                    className={`w-5 h-5 transition-colors ${
                      product && isInWishlist(product.productId)
                        ? "text-brown fill-current"
                        : "text-brown hover:text-white"
                    }`}
                    fill={product && isInWishlist(product.productId) ? "currentColor" : "none"}
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
              </div>
            )}
          </div>
        )}

        {/* PHYSICAL PRODUCT ACTIONS */}
        {!isAdmin && product?.productType === ProductType.Physical && (
          <div className="flex items-center gap-4 mt-4">
            {/* Add to Cart Button */}
            <button
              disabled={
                selectedVariant && selectedVariant.quantityInStock < 1 ||
                selectedVariant && (basketItem?.quantity || 0) >= selectedVariant.quantityInStock
              }
              onClick={handleUpdateCart}
              className="px-8 py-3 rounded-lg bg-brown text-white font-medium hover:bg-dark-grey disabled:bg-light-grey disabled:cursor-not-allowed transition-colors"
            >
              {selectedVariant && selectedVariant.quantityInStock < 1
                ? "Nema na stanju"
                : selectedVariant && (basketItem?.quantity || 0) >= selectedVariant.quantityInStock
                ? "Maksimalna količina dodana"
                : "Dodaj u korpu"
              }
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => product && toggleProductInWishlist(product)}
              className="flex items-center justify-center w-12 h-12 rounded-lg border-2 border-brown hover:bg-light-grey hover:text-white transition-all duration-200"
            >
              <svg
                className={`w-5 h-5 transition-colors ${
                  product && isInWishlist(product.productId)
                    ? "text-brown fill-current"
                    : "text-brown hover:text-white"
                }`}
                fill={product && isInWishlist(product.productId) ? "currentColor" : "none"}
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
          </div>
        )}

        {/* EXTRA DIALOG */}
        {/* <div className="mt-4">
          <CustomizedDialogs />
        </div> */}
      </div>
    </div>

     {/* TABLE REPLACEMENT */}
        <div className="bg-transparent rounded-xl p-4 shadow-sm text-sm mt-16 w-1/2">
          <div className="grid grid-cols-2 py-2 border-b border-light-grey">
            <span className="font-medium text-brown">Opis</span>
            <span className="text-dark-grey">{product.description}</span>
          </div>
          <div className="grid grid-cols-2 py-2 border-b border-light-grey">
            <span className="font-medium text-brown">Kategorija</span>
            <span className="text-dark-grey">{product.categoryName}</span>
          </div>
        </div>

    {/* RECOMMENDED PRODUCTS SECTION */}
    <RecommendedProducts
      products={recommendedProducts}
      title="Recommended for you"
    />
  </div>
  );
}