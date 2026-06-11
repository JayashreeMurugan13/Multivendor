import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartItem {
  product: any;
  quantity: number;
  price: number;
}

interface CartState {
  items: CartItem[];
  couponCode: string;
  discount: number;
}

const initialState: CartState = { items: [], couponCode: '', discount: 0 };

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload || [];
    },
    setCoupon: (state, action: PayloadAction<{ code: string; discount: number }>) => {
      state.couponCode = action.payload.code;
      state.discount = action.payload.discount;
    },
    clearCartState: (state) => {
      state.items = [];
      state.couponCode = '';
      state.discount = 0;
    },
  },
});

export const { setCart, setCoupon, clearCartState } = cartSlice.actions;
export default cartSlice.reducer;
