import { useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../app/store/configureStore";
import { setProductParams } from "./catalogSlice";
import debounce from "lodash.debounce";

export default function ProductSearch() {
  const { productParams } = useAppSelector((state) => state.catalog);
  const [searchTerm, setSearchTerm] = useState(productParams.searchTerm);
  const dispatch = useAppDispatch();

  // Debounce input (1000ms)
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      dispatch(setProductParams({ searchTerm: value }));
    }, 1000),
    [dispatch]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    debouncedSearch(e.target.value);
  };

  return (
    <div className="w-full">
      <input
        type="text"
        placeholder="Pretraži proizvode..."
        value={searchTerm || ""}
        onChange={handleChange}
        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 shadow-sm focus:border-light-grey focus:ring-2 focus:ring-light-grey focus:outline-none"
      />
    </div>
  );
}