import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Customer } from '@/types';

interface AuthState {
  user: Customer | null;
  token: string | null;
}

const initialState: AuthState = { user: null, token: null };

const customerAuthSlice = createSlice({
  name: 'customerAuth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: Customer; accessToken: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.accessToken;
      if (typeof window !== 'undefined') {
        localStorage.setItem('customer', JSON.stringify(action.payload.user));
        localStorage.setItem('accessToken', action.payload.accessToken);
        localStorage.setItem('role', 'customer');
      }
    },
    rehydrateCustomer: (state) => {
      if (typeof window !== 'undefined') {
        const u = localStorage.getItem('customer');
        const t = localStorage.getItem('accessToken');
        const role = localStorage.getItem('role');
        if (u && t && role === 'customer') {
          state.user = JSON.parse(u);
          state.token = t;
        }
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      if (typeof window !== 'undefined') localStorage.clear();
    },
  },
});

export const { setCredentials, rehydrateCustomer, logout } = customerAuthSlice.actions;
export default customerAuthSlice.reducer;
