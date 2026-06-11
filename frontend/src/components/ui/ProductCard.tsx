'use client';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { setCart } from '@/store/slices/cartSlice';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Product } from '@/types';

interface Props { product: Product; }

export default function ProductCard({ product }: Props) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(s => s.customerAuth);
  const [wishlisted, setWishlisted] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const savings = product.discount > 0 ? product.discount : 0;

  const handleAddToCart = async () => {
    if (!user) { toast.error('Please login to add items to cart'); return; }
    setCartLoading(true);
    try {
      const res = await api.post('/cart/add', { productId: product._id, quantity: 1 });
      dispatch(setCart(res.data.cart.items));
      toast.success('Added to cart!');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to add to cart');
    } finally {
      setCartLoading(false);
    }
  };

  const handleWishlist = async () => {
    if (!user) { toast.error('Please login to save items'); return; }
    try {
      await api.post('/customer/wishlist/toggle', { productId: product._id });
      setWishlisted(w => !w);
      toast.success(wishlisted ? 'Removed from wishlist' : 'Saved to wishlist ❤️');
    } catch {
      toast.error('Please login first');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all duration-200 flex flex-col group">
      <Link href={`/product/${product.slug}`} className="relative bg-slate-50 dark:bg-slate-900 h-44 flex items-center justify-center p-3">
        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=60'}
          alt={product.name}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
        {product.isFlashSale && (
          <span className="absolute top-2 left-2 bg-[#2874F0] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-tight shadow">
            TRENDING
          </span>
        )}
        {savings > 0 && (
          <span className="absolute top-2 right-2 bg-yellow-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded shadow">
            {savings}% OFF
          </span>
        )}
      </Link>

      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-[#2874F0] uppercase">
            {typeof product.category === 'object' ? product.category?.name : product.category}
          </span>
          <Link href={`/product/${product.slug}`}>
            <h4 className="font-bold text-sm text-slate-800 dark:text-white line-clamp-2 leading-snug group-hover:text-[#2874F0] transition-colors">
              {product.name}
            </h4>
          </Link>
          <div className="flex items-center gap-1.5">
            <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
              {product.ratings?.average?.toFixed(1) || '4.5'} <Star size={10} className="fill-white" />
            </span>
            <span className="text-[11px] text-slate-400 font-medium">({product.ratings?.count || 0})</span>
          </div>
          <p className="text-[10px] text-slate-400 truncate">{product.seller?.shopName}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-black text-slate-900 dark:text-white">₹{product.finalPrice?.toLocaleString()}</span>
            {savings > 0 && (
              <span className="text-xs text-slate-400 line-through">₹{product.price?.toLocaleString()}</span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t dark:border-slate-700 text-xs font-bold">
            <button
              onClick={handleWishlist}
              className={`border py-1.5 rounded-sm flex items-center justify-center gap-1.5 transition-colors ${
                wishlisted
                  ? 'bg-red-50 dark:bg-red-950/20 text-red-500 border-red-200'
                  : 'border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <Heart size={14} className={wishlisted ? 'fill-current' : ''} />
              {wishlisted ? 'Saved' : 'Save'}
            </button>
            <button
              onClick={handleAddToCart}
              disabled={cartLoading}
              className="bg-[#2874F0] hover:bg-blue-500 disabled:opacity-60 text-white py-1.5 rounded-sm flex items-center justify-center gap-1.5 shadow transition-colors"
            >
              <ShoppingCart size={14} />
              {cartLoading ? '...' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
