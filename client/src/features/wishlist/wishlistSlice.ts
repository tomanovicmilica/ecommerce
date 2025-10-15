import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Product } from "../../app/models/product";

interface WishlistState {
  items: Product[];
}

const initialState: WishlistState = {
  items: [],
};

export const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addToWishlist: (state, action: PayloadAction<Product>) => {
      const product = action.payload;

      // Check if product already exists in wishlist
      const existingItem = state.items.find(
        (item) => item.productId === product.productId
      );

      if (!existingItem) {
        state.items.push(product);
      }
    },
    removeFromWishlist: (state, action: PayloadAction<number>) => {
      const productId = action.payload;
      state.items = state.items.filter(
        (item) => item.productId !== productId
      );
    },
    toggleWishlist: (state, action: PayloadAction<Product>) => {
      const product = action.payload;
      const existingItemIndex = state.items.findIndex(
        (item) => item.productId === product.productId
      );

      if (existingItemIndex >= 0) {
        // Remove if exists
        state.items.splice(existingItemIndex, 1);
      } else {
        // Add if doesn't exist
        state.items.push(product);
      }
    },
    clearWishlist: (state) => {
      state.items = [];
    },
    loadWishlistFromStorage: (state, action: PayloadAction<Product[]>) => {
      state.items = action.payload;
    },
  },
});

export const {
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  clearWishlist,
  loadWishlistFromStorage,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;