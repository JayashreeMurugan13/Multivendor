import { configureStore } from '@reduxjs/toolkit';
import customerAuthReducer from './slices/customerAuthSlice';
import sellerAuthReducer from './slices/sellerAuthSlice';
import adminAuthReducer from './slices/adminAuthSlice';
import cartReducer from './slices/cartSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    customerAuth: customerAuthReducer,
    sellerAuth: sellerAuthReducer,
    adminAuth: adminAuthReducer,
    cart: cartReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
