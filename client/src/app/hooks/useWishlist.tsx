import { useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store/configureStore";
import {
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  clearWishlist,
  loadWishlistFromStorage,
} from "../../features/wishlist/wishlistSlice";
import type { Product } from "../models/product";

const LOCAL_STORAGE_PREFIX = "user_wishlist_";

export const useWishlist = () => {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.wishlist);
  const { user } = useAppSelector((state) => state.account);

  // Get user-specific localStorage key
  const getStorageKey = useCallback(() => {
    return user?.email ? `${LOCAL_STORAGE_PREFIX}${user.email}` : `${LOCAL_STORAGE_PREFIX}guest`;
  }, [user?.email]);

  // Load wishlist from localStorage when user changes or component mounts
  useEffect(() => {
    const storageKey = getStorageKey();
    const savedWishlist = localStorage.getItem(storageKey);

    if (savedWishlist) {
      try {
        const parsedWishlist: Product[] = JSON.parse(savedWishlist);
        dispatch(loadWishlistFromStorage(parsedWishlist));
      } catch (error) {
        console.error("Failed to parse wishlist from localStorage:", error);
        localStorage.removeItem(storageKey);
      }
    } else {
      // Clear wishlist if no saved data for this user
      dispatch(loadWishlistFromStorage([]));
    }
  }, [dispatch, getStorageKey]);

  // Save to localStorage whenever wishlist items change
  useEffect(() => {
    const storageKey = getStorageKey();
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, getStorageKey]);

  const addProductToWishlist = useCallback((product: Product) => {
    dispatch(addToWishlist(product));
  }, [dispatch]);

  const removeProductFromWishlist = useCallback((productId: number) => {
    dispatch(removeFromWishlist(productId));
  }, [dispatch]);

  const toggleProductInWishlist = useCallback((product: Product) => {
    dispatch(toggleWishlist(product));
  }, [dispatch]);

  const clearAllWishlist = useCallback(() => {
    dispatch(clearWishlist());
  }, [dispatch]);

  const isInWishlist = useCallback((productId: number): boolean => {
    return items.some((item) => item.productId === productId);
  }, [items]);

  const wishlistCount = items.length;

  return {
    wishlistItems: items,
    wishlistCount,
    addProductToWishlist,
    removeProductFromWishlist,
    toggleProductInWishlist,
    clearAllWishlist,
    isInWishlist,
  };
};