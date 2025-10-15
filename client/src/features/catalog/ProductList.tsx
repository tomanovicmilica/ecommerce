import type { Product } from "../../app/models/product";
import { useAppSelector } from "../../app/store/configureStore";
import ProductCard from "./ProductCard";
import ProductCardSkeleton from "./ProductSceleton";

interface Props {
  products: Product[];
}

export default function ProductList({ products }: Props) {
    const {productsLoaded} = useAppSelector(state => state.catalog);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products && products.length > 0 ? (
       products.map((p) =>
          !productsLoaded ? (
            <ProductCardSkeleton key={p.productId} />
          ) : (
            <ProductCard key={p.productId} product={p} />
          )
        )
      ) : (
        <p className="text-dark-grey">Nema proizvoda</p>
      )}
    </div>
  );
}