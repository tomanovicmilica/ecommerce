import { useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store/configureStore";
import {
  addViewedProduct,
  loadViewHistoryFromStorage,
} from "../../features/userHistory/userHistorySlice";
import type { Product } from "../models/product";

const LOCAL_STORAGE_KEY = "user_viewed_products";

export const useUserHistory = () => {
  const dispatch = useAppDispatch();
  const { viewedProducts } = useAppSelector((state) => state.userHistory);

  // Load viewing history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedHistory) {
      try {
        const parsedHistory: Product[] = JSON.parse(savedHistory);
        dispatch(loadViewHistoryFromStorage(parsedHistory));
      } catch (error) {
        console.error("Failed to parse viewing history from localStorage:", error);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
  }, [dispatch]);

  // Save to localStorage whenever viewedProducts changes
  useEffect(() => {
    if (viewedProducts.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(viewedProducts));
    }
  }, [viewedProducts]);

  const addToViewHistory = useCallback((product: Product) => {
    dispatch(addViewedProduct(product));
  }, [dispatch]);

  const getRecommendedProducts = useCallback((
    currentProductId: number,
    excludeCurrentProduct = true
  ): Product[] => {
    let recommendations = viewedProducts;

    if (excludeCurrentProduct) {
      recommendations = recommendations.filter(
        (product) => product.productId !== currentProductId
      );
    }

    // Return up to 4 products for recommendations
    return recommendations.slice(0, 4);
  }, [viewedProducts]);

  return {
    viewedProducts,
    addToViewHistory,
    getRecommendedProducts,
  };
};