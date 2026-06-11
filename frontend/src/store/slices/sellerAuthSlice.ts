import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Seller } from '@/types';

interface SellerAuthState {
  seller: Seller | null;
  token: string | null;
}

const initialState: SellerAuthState = { seller: null, token: null };

const sellerAuthSlice = createSlice({
  name: 'sellerAuth',
  initialState,
  reducers: {
    setSellerCredentials: (state, action: PayloadAction<{ user: Seller; accessToken: string }>) => {
      state.seller = action.payload.user;
      state.token = action.payload.accessToken;
      if (typeof window !== 'undefined') {
        localStorage.setItem('seller', JSON.stringify(action.payload.user));
        localStorage.setItem('accessToken', action.payload.accessToken);
        localStorage.setItem('role', 'seller');
      }
    },
    rehydrateSeller: (state) => {
      if (typeof window !== 'undefined') {
        const s = localStorage.getItem('seller');
        const t = localStorage.getItem('accessToken');
        const role = localStorage.getItem('role');
        if (s && t && role === 'seller') {
          state.seller = JSON.parse(s);
          state.token = t;
        }
      }
    },
    sellerLogout: (state) => {
      state.seller = null;
      state.token = null;
      if (typeof window !== 'undefined') localStorage.clear();
    },
  },
});

export const { setSellerCredentials, rehydrateSeller, sellerLogout } = sellerAuthSlice.actions;
export default sellerAuthSlice.reducer;
