import { useEffect } from "react";
import { categorySelectors, fetchCategoriesAsync } from "../../features/catalog/categorySlice";
import { useAppDispatch, useAppSelector } from "../store/configureStore";

export default function useProductTypes() {
    const categories = useAppSelector(categorySelectors.selectAll);
    const { categoriesLoaded} = useAppSelector(state => state.category);
    const dispatch = useAppDispatch();

    useEffect(() => {
      if (!categoriesLoaded) dispatch(fetchCategoriesAsync());
    }, [categoriesLoaded, dispatch])

    return {
        categories,
        categoriesLoaded
    }
}