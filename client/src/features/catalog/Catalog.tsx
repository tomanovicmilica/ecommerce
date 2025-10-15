import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import Pagination from "../../app/components/Pagination";
import useProducts from "../../app/hooks/useProducts";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { useAppDispatch, useAppSelector } from "../../app/store/configureStore";
import { setProductParams, setPageNumber } from "./catalogSlice";
import ProductList from "./ProductList";
import ProductSearch from "./ProductSearch";
import { ProductType } from "../../app/models/product";

const sortOptions = [
  { value: "name", label: "Ime" },
  { value: "priceDesc", label: "Cena - od više prema nižoj" },
  { value: "price", label: "Cena - od niže prema višoj" },
];

const productTypeOptions = [
  { value: ProductType.Physical.toString(), label: "Fizički proizvod" },
  { value: ProductType.Digital.toString(), label: "Digitalni proizvod" },
];

export default function Catalog() {
  const { products, categories, filtersLoaded, metaData } = useProducts();
  const { productParams } = useAppSelector((state) => state.catalog);
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();

  const [sortOpen, setSortOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);

  // Handle URL parameters for category filtering
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam && !productParams.categories.includes(categoryParam)) {
      dispatch(setProductParams({ categories: [categoryParam] }));
    }
  }, [searchParams, dispatch, productParams.categories]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setSortOpen(false);
        setCategoryOpen(false);
        setTypeOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!filtersLoaded) return <LoadingComponent />;

  const handleSortChange = (value: string) => {
    dispatch(setProductParams({ orderBy: value }));
    setSortOpen(false);
  };

  const handleCategoryToggle = (categoryName: string) => {
    const currentCategories = productParams.categories;
    const newCategories = currentCategories.includes(categoryName)
      ? currentCategories.filter(c => c !== categoryName)
      : [...currentCategories, categoryName];
    dispatch(setProductParams({ categories: newCategories }));
  };

  const handleTypeToggle = (typeValue: string) => {
    const currentTypes = productParams.productTypes;
    const newTypes = currentTypes.includes(typeValue)
      ? currentTypes.filter(t => t !== typeValue)
      : [...currentTypes, typeValue];
    dispatch(setProductParams({ productTypes: newTypes }));
  };

  return (
    <div className="space-y-6">
      {/* Banner Image */}
      <div className="w-full h-48 bg-gradient-to-r from-brown to-beige rounded-xl overflow-hidden shadow-sm">
        <div className="w-full h-full flex items-center justify-center bg-black/10">
          <div className="text-center text-white">
            <h2 className="text-3xl font-bold mb-2">Istrazite nase proizvode</h2>
            <p className="text-lg opacity-90">Pronadjite bas ono sto trazite</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <ProductSearch />
      </div>

      {/* Filter Dropdowns */}
      <div className="flex flex-wrap gap-3 mb-6">
          {/* Sort Dropdown */}
          <div className="relative dropdown-container">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-brown border-b border-transparent hover:border-brown transition-colors"
            >
              <span>
                Sortiranje: {sortOptions.find(opt => opt.value === productParams.orderBy)?.label}
              </span>
              <ChevronDown className={`w-3 h-3 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
            </button>
            {sortOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-light-grey rounded-lg shadow-lg z-10">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`w-full text-left px-4 py-2 hover:bg-light-grey first:rounded-t-lg last:rounded-b-lg text-dark-grey ${
                      productParams.orderBy === option.value ? 'bg-beige font-semibold' : ''
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          
          <div className="relative dropdown-container">
            <button
              onClick={() => setCategoryOpen(!categoryOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-brown border-b border-transparent hover:border-brown transition-colors"
            >
              <span>
                Kategorije {productParams.categories.length > 0 && `(${productParams.categories.length})`}
              </span>
              <ChevronDown className={`w-3 h-3 transition-transform ${categoryOpen ? 'rotate-180' : ''}`} />
            </button>
            {categoryOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-light-grey rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                {categories?.map((category) => (
                  <label
                    key={category.name}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-light-grey cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={productParams.categories.includes(category.name)}
                      onChange={() => handleCategoryToggle(category.name)}
                      className="rounded border-brown text-brown focus:ring-brown"
                    />
                    <span className="text-sm text-dark-grey">{category.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Product Type Dropdown */}
          <div className="relative dropdown-container">
            <button
              onClick={() => setTypeOpen(!typeOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-brown border-b border-transparent hover:border-brown transition-colors"
            >
              <span>
                Tip {productParams.productTypes.length > 0 && `(${productParams.productTypes.length})`}
              </span>
              <ChevronDown className={`w-3 h-3 transition-transform ${typeOpen ? 'rotate-180' : ''}`} />
            </button>
            {typeOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-light-grey rounded-lg shadow-lg z-10">
                {productTypeOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-light-grey cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={productParams.productTypes.includes(option.value)}
                      onChange={() => handleTypeToggle(option.value)}
                      className="rounded border-brown text-brown focus:ring-brown"
                    />
                    <span className="text-sm text-dark-grey">{option.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

      {/* Product List */}
      <ProductList products={products} />

      {/* Pagination */}
      {metaData && metaData.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            metaData={metaData}
            onPageChange={(page) => dispatch(setPageNumber({ pageNumber: page }))}
          />
        </div>
      )}
    </div>
  );
}