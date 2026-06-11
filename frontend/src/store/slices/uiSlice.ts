import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: { darkMode: false, cartOpen: false, mobileMenuOpen: false },
  reducers: {
    toggleDark: (state) => {
      state.darkMode = !state.darkMode;
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', state.darkMode);
      }
    },
    setCartOpen: (state, action: PayloadAction<boolean>) => { state.cartOpen = action.payload; },
    setMobileMenu: (state, action: PayloadAction<boolean>) => { state.mobileMenuOpen = action.payload; },
  },
});

export const { toggleDark, setCartOpen, setMobileMenu } = uiSlice.actions;
export default uiSlice.reducer;
