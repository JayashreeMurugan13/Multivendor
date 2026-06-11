'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, ShoppingCart, Heart } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useAppDispatch } from '@/hooks/redux';
import { setCart } from '@/store/slices/cartSlice';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function WishlistPage() {
  const dispatch = useAppDispatch();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => api.get('/customer/wishlist').then(r => r.data),
  });

  const remove = useMutation({
    mutationFn: (productId: string) => api.post('/customer/wishlist/toggle', { productId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Removed from wishlist');
    },
  });

  const addToCart = useMutation({
    mutationFn: (productId: string) => api.post('/cart/add', { productId, quantity: 1 }),
    onSuccess: (res: any) => {
      dispatch(setCart(res.data.cart.items));
      toast.success('Added to cart!');
    },
    onError: () => toast.error('Failed to add to cart'),
  });

  if (isLoading) return <div className="py-20"><LoadingSpinner size="lg" /></div>;

  const items: any[] = data?.wishlist?.products || [];

  return (
    <div>
      <h1 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Heart className="h-5 w-5 text-red-500 fill-red-500" />
        My Wishlist <span className="text-slate-400 font-normal text-base">({items.length} items)</span>
      </h1>

      {!items.length ? (
        <div className="card p-16 text-center">
          <Heart className="h-16 w-16 mx-auto text-slate-200 dark:text-slate-700 mb-4" />
          <h3 className="font-bold text-lg text-slate-500 mb-2">Your wishlist is empty</h3>
          <p className="text-slate-400 text-sm mb-6">Save items you love to buy them later</p>
          <Link href="/shop" className="btn-primary">Discover Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((product: any) => {
            const image = product?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=60';
            const category = typeof product?.category === 'object' ? product?.category?.name : product?.category;
            return (
              <div key={product._id} className="bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow group">
                {/* Image */}
                <div className="relative bg-slate-50 dark:bg-slate-900 h-40 flex items-center justify-center p-3">
                  <Link href={`/product/${product.slug || product._id}`}>
                    <img src={image} alt={product.name}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" />
                  </Link>
                  {product.discount > 0 && (
                    <span className="absolute top-2 right-2 bg-yellow-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded">
                      {product.discount}% OFF
                    </span>
                  )}
                  <button
                    onClick={() => remove.mutate(product._id)}
                    className="absolute top-2 left-2 bg-white dark:bg-slate-800 p-1.5 rounded-full shadow text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Info */}
                <div className="p-3 space-y-2">
                  {category && <p className="text-[10px] font-bold text-[#2874F0] uppercase">{category}</p>}
                  <Link href={`/product/${product.slug || product._id}`}>
                    <h4 className="font-semibold text-sm line-clamp-2 hover:text-[#2874F0] transition-colors">{product.name}</h4>
                  </Link>
                  <div className="flex items-baseline gap-2">
                    <span className="font-black text-base text-slate-900 dark:text-white">₹{product.finalPrice?.toLocaleString()}</span>
                    {product.discount > 0 && (
                      <span className="text-xs text-slate-400 line-through">₹{product.price?.toLocaleString()}</span>
                    )}
                  </div>
                  <button
                    onClick={() => addToCart.mutate(product._id)}
                    disabled={addToCart.isPending}
                    className="w-full bg-[#2874F0] hover:bg-blue-600 text-white py-2 rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60">
                    <ShoppingCart className="h-3.5 w-3.5" />
                    Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
