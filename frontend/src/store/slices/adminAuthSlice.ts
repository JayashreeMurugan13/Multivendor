import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Admin } from '@/types';

interface AdminAuthState {
  admin: Admin | null;
  token: string | null;
}

const initialState: AdminAuthState = { admin: null, token: null };

const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState,
  reducers: {
    setAdminCredentials: (state, action: PayloadAction<{ user: Admin; accessToken: string }>) => {
      state.admin = action.payload.user;
      state.token = action.payload.accessToken;
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin', JSON.stringify(action.payload.user));
        localStorage.setItem('accessToken', action.payload.accessToken);
        localStorage.setItem('role', 'admin');
      }
    },
    rehydrateAdmin: (state) => {
      if (typeof window !== 'undefined') {
        const a = localStorage.getItem('admin');
        const t = localStorage.getItem('accessToken');
        const role = localStorage.getItem('role');
        if (a && t && role === 'admin') {
          state.admin = JSON.parse(a);
          state.token = t;
        }
      }
    },
    adminLogout: (state) => {
      state.admin = null;
      state.token = null;
      if (typeof window !== 'undefined') localStorage.clear();
    },
  },
});

export const { setAdminCredentials, rehydrateAdmin, adminLogout } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;
