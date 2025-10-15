import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/configureStore";
import { fetchFilters, fetchProductsAsync, productSelectors } from "../../features/catalog/catalogSlice";

export default function useProducts() {
    const products = useAppSelector(productSelectors.selectAll);
    const { productsLoaded, filtersLoaded, categories, metaData, productParams} = useAppSelector(state => state.catalog);
    const dispatch = useAppDispatch();

    useEffect(() => {
      if (!productsLoaded) dispatch(fetchProductsAsync());
    }, [productsLoaded, dispatch])

    useEffect(() => {
      if (!filtersLoaded) dispatch(fetchFilters());
    }, [dispatch, filtersLoaded]);

    return {
        products,
        productsLoaded,
        filtersLoaded,
        categories,
        metaData
    }
}