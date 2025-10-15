// src/store/configureStore.ts
import { configureStore } from "@reduxjs/toolkit";
import { catalogSlice } from "../../features/catalog/catalogSlice";
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import { categorySlice } from "../../features/catalog/categorySlice";
import { basketSlice } from "../../features/basket/basketSlice";
import { accountSlice } from "../../features/account/accountSlice";
import { userHistorySlice } from "../../features/userHistory/userHistorySlice";
import { wishlistSlice } from "../../features/wishlist/wishlistSlice";

export const store = configureStore({
  reducer: {
    catalog: catalogSlice.reducer,
    category: categorySlice.reducer,
    basket: basketSlice.reducer,
    account: accountSlice.reducer,
    userHistory: userHistorySlice.reducer,
    wishlist: wishlistSlice.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['account/signInUser/rejected', 'account/fetchCurrentUser/rejected'],
        ignoredPaths: ['payload.headers'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;