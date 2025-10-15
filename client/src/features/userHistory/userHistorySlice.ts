import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Product } from "../../app/models/product";

interface UserHistoryState {
  viewedProducts: Product[];
  maxHistorySize: number;
}

const initialState: UserHistoryState = {
  viewedProducts: [],
  maxHistorySize: 10, // Keep last 10 viewed products
};

export const userHistorySlice = createSlice({
  name: "userHistory",
  initialState,
  reducers: {
    addViewedProduct: (state, action: PayloadAction<Product>) => {
      const product = action.payload;

      // Remove the product if it already exists in history
      state.viewedProducts = state.viewedProducts.filter(
        (p) => p.productId !== product.productId
      );

      // Add to the beginning of the array
      state.viewedProducts.unshift(product);

      // Keep only the maximum number of products
      if (state.viewedProducts.length > state.maxHistorySize) {
        state.viewedProducts = state.viewedProducts.slice(0, state.maxHistorySize);
      }
    },
    clearViewHistory: (state) => {
      state.viewedProducts = [];
    },
    loadViewHistoryFromStorage: (state, action: PayloadAction<Product[]>) => {
      state.viewedProducts = action.payload.slice(0, state.maxHistorySize);
    },
  },
});

export const { addViewedProduct, clearViewHistory, loadViewHistoryFromStorage } =
  userHistorySlice.actions;

export default userHistorySlice.reducer;