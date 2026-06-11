'use client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Trash2, ShoppingBag, X, Tag } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { setCart, setCoupon } from '@/store/slices/cartSlice';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function CartPage() {
  const dispatch = useAppDispatch();
  const { items, couponCode, discount } = useAppSelector(s => s.cart);
  const { user } = useAppSelector(s => s.customerAuth);
  const [couponInput, setCouponInput] = useState('');

  const { isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await api.get('/cart');
      dispatch(setCart(res.data.cart?.items || []));
      return res.data;
    },
    enabled: !!user,
  });

  const updateQty = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      api.post('/cart/add', { productId, quantity }),
    onSuccess: (res) => dispatch(setCart(res.data.cart.items)),
  });

  const removeItem = useMutation({
    mutationFn: (productId: string) => api.delete(`/cart/remove/${productId}`),
    onSuccess: (res) => {
      dispatch(setCart(res.data.cart.items));
      toast.success('Removed from cart');
    },
  });

  const applyCoupon = useMutation({
    mutationFn: () => api.post('/cart/coupon', { code: couponInput, cartTotal: subtotal }),
    onSuccess: (res) => {
      dispatch(setCoupon({ code: couponInput.toUpperCase(), discount: res.data.discount }));
      toast.success(`Coupon "${couponInput.toUpperCase()}" applied!`);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Invalid coupon'),
  });

  // Not logged in
  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-slate-300 mb-4" />
        <h2 className="text-xl font-bold mb-2">Please login to view your cart</h2>
        <Link href="/customer/login" className="btn-primary inline-block mt-2">Login</Link>
      </div>
    );
  }

  if (isLoading) return <div className="py-40"><LoadingSpinner size="lg" /></div>;

  const subtotal = items.reduce((s, i) => s + (i.price || i.product?.finalPrice || 0) * i.quantity, 0);
  const gst = Math.round(subtotal * 0.18);
  const shipping = subtotal === 0 ? 0 : subtotal >= 1500 ? 0 : 150;
  const total = Math.max(0, subtotal + gst + shipping - discount);

  if (!items.length) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-xl font-bold mb-6 border-l-4 border-[#2874F0] pl-3">Shopping Cart</h1>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-16 text-center border dark:border-slate-700">
          <ShoppingBag className="h-16 w-16 mx-auto text-slate-300 mb-4" />
          <h3 className="font-bold text-lg text-slate-500 mb-2">Your cart is empty</h3>
          <p className="text-slate-400 text-sm mb-6">Add products to get started</p>
          <Link href="/shop" className="btn-primary">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-6 border-l-4 border-[#2874F0] pl-3">
        Shopping Cart <span className="text-slate-400 font-normal text-base">({items.length} {items.length === 1 ? 'item' : 'items'})</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item: any) => {
            const product = item.product;
            if (!product) return null;
            const productId = typeof product === 'string' ? product : product._id;
            const name = product?.name || 'Product';
            const image = product?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=60';
            const price = item.price || product?.finalPrice || 0;
            const category = typeof product?.category === 'object' ? product?.category?.name : product?.category;

            return (
              <div key={productId} className="bg-white dark:bg-slate-800 p-4 rounded-lg border dark:border-slate-700 flex gap-4 items-start shadow-sm">
                {/* Product image */}
                <Link href={`/product/${product?.slug || productId}`}>
                  <img src={image} alt={name}
                    className="w-20 h-20 object-contain bg-slate-50 dark:bg-slate-900 rounded-lg flex-shrink-0" />
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  {category && <p className="text-[10px] font-bold text-[#2874F0] uppercase mb-0.5">{category}</p>}
                  <Link href={`/product/${product?.slug || productId}`}>
                    <h4 className="font-semibold text-sm text-slate-800 dark:text-white line-clamp-2 hover:text-[#2874F0]">{name}</h4>
                  </Link>
                  <p className="text-sm font-black text-slate-900 dark:text-white mt-1">₹{price.toLocaleString()}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Item total: ₹{(price * item.quantity).toLocaleString()}</p>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center border dark:border-slate-600 rounded overflow-hidden">
                      <button
                        onClick={() => item.quantity > 1
                          ? updateQty.mutate({ productId, quantity: item.quantity - 1 })
                          : removeItem.mutate(productId)}
                        className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-sm border-r dark:border-slate-600">
                        −
                      </button>
                      <span className="px-4 py-1.5 text-sm font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQty.mutate({ productId, quantity: item.quantity + 1 })}
                        disabled={item.quantity >= (product?.stock || 99)}
                        className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-sm border-l dark:border-slate-600 disabled:opacity-40">
                        +
                      </button>
                    </div>
                    <button onClick={() => removeItem.mutate(productId)}
                      className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium">
                      <Trash2 size={13} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          {/* Coupon */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border dark:border-slate-700">
            <h3 className="font-bold text-sm flex items-center gap-2 mb-3"><Tag size={14} className="text-[#2874F0]" /> Apply Coupon</h3>
            <div className="flex gap-2">
              <input
                value={couponInput}
                onChange={e => setCouponInput(e.target.value.toUpperCase())}
                placeholder="Enter coupon code"
                className="input text-xs flex-1 uppercase"
              />
              <button
                onClick={() => applyCoupon.mutate()}
                disabled={!couponInput || applyCoupon.isPending}
                className="bg-[#2874F0] text-white px-3 py-2 text-xs font-bold rounded disabled:opacity-50">
                Apply
              </button>
            </div>
            {couponCode && (
              <div className="mt-2 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 px-3 py-2 rounded text-xs font-bold flex justify-between items-center">
                <span>✓ {couponCode} applied</span>
                <button onClick={() => dispatch(setCoupon({ code: '', discount: 0 }))}><X size={12} /></button>
              </div>
            )}
          </div>

          {/* Price Summary */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border dark:border-slate-700">
            <h3 className="font-bold text-sm uppercase border-b pb-3 dark:border-slate-700 mb-3">Price Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal ({items.length} items)</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>GST (18%)</span>
                <span>₹{gst.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Delivery</span>
                <span className={shipping === 0 ? 'text-green-500 font-semibold' : ''}>
                  {shipping === 0 ? 'FREE' : `₹${shipping}`}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Coupon Discount</span>
                  <span>−₹{discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-base pt-3 border-t dark:border-slate-700">
                <span>Total Amount</span>
                <span className="text-[#2874F0]">₹{total.toLocaleString()}</span>
              </div>
              {subtotal > 0 && subtotal < 1500 && (
                <p className="text-xs text-orange-500">Add ₹{(1500 - subtotal).toLocaleString()} more for FREE delivery</p>
              )}
            </div>
            <Link href="/checkout"
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-slate-900 py-3 rounded font-black text-sm uppercase tracking-wide text-center block mt-4 shadow">
              Proceed to Checkout →
            </Link>
            <Link href="/shop" className="block text-center text-xs text-[#2874F0] mt-2 hover:underline">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
