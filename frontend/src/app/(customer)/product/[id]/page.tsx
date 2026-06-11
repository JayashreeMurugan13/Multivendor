'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, use } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Star, Truck, RotateCcw, Shield, ChevronLeft, ChevronRight, Plus, Minus, Share2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { setCart } from '@/store/slices/cartSlice';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ProductCard from '@/components/ui/ProductCard';

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const dispatch = useAppDispatch();
  const qc = useQueryClient();
  const { user } = useAppSelector(s => s.customerAuth);

  const { data, isLoading } = useQuery({
    queryKey: ['product', resolvedParams.id],
    queryFn: () => api.get(`/shop/products/${resolvedParams.id}`).then(r => r.data),
  });

  const { data: related } = useQuery({
    queryKey: ['related', resolvedParams.id],
    queryFn: () => api.get('/shop/products', { params: { limit: 6 } }).then(r => r.data),
    enabled: !!data,
  });

  const addToCart = useMutation({
    mutationFn: () => api.post('/cart/add', { productId: data.product._id, quantity: qty }),
    onSuccess: (res) => {
      dispatch(setCart(res.data.cart.items));
      toast.success('Added to cart!');
    },
    onError: () => toast.error('Please login first'),
  });

  const addToWishlist = useMutation({
    mutationFn: () => api.post('/customer/wishlist', { productId: data.product._id }),
    onSuccess: () => toast.success('Added to wishlist!'),
    onError: () => toast.error('Please login first'),
  });

  if (isLoading) return <div className="py-40"><LoadingSpinner size="lg" /></div>;
  if (!data?.product) return <div className="text-center py-40">Product not found</div>;

  const { product } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
        {/* Images */}
        <div>
          <div className="relative aspect-square bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden mb-3">
            <img src={product.images[activeImg] || '/placeholder.png'} alt={product.name}
              className="w-full h-full object-contain" />
            {product.images.length > 1 && (
              <>
                <button onClick={() => setActiveImg(i => (i - 1 + product.images.length) % product.images.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-700 shadow p-2 rounded-full">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={() => setActiveImg(i => (i + 1) % product.images.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-700 shadow p-2 rounded-full">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {product.images.map((img: string, i: number) => (
              <button key={i} onClick={() => setActiveImg(i)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${i === activeImg ? 'border-primary-500' : 'border-transparent'}`}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div>
          <p className="text-sm text-primary-500 font-medium mb-1">{product.seller?.shopName}</p>
          <h1 className="text-2xl font-bold mb-3">{product.name}</h1>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-sm">{product.ratings.average.toFixed(1)}</span>
            </div>
            <span className="text-sm text-gray-500">{product.ratings.count} ratings</span>
            <span className="text-sm text-gray-400">|</span>
            <span className="text-sm text-green-600">{product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}</span>
          </div>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-black text-primary-500">₹{product.finalPrice.toLocaleString()}</span>
            {product.discount > 0 && (
              <>
                <span className="text-lg text-gray-400 line-through">₹{product.price.toLocaleString()}</span>
                <span className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded text-sm font-semibold">{product.discount}% OFF</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-4 mb-6">
            <span className="font-medium text-sm">Quantity:</span>
            <div className="flex items-center border rounded-lg overflow-hidden">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800">
                <Minus className="h-4 w-4" />
              </button>
              <span className="px-4 py-2 font-medium border-x">{qty}</span>
              <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            <button onClick={() => addToCart.mutate()} disabled={!product.stock || addToCart.isPending}
              className="flex-1 btn-primary flex items-center justify-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              {addToCart.isPending ? 'Adding...' : 'Add to Cart'}
            </button>
            <button onClick={() => addToWishlist.mutate()} className="p-3 border-2 rounded-lg hover:border-red-400 hover:text-red-500 transition-colors">
              <Heart className="h-5 w-5" />
            </button>
            <button className="p-3 border-2 rounded-lg hover:border-gray-400 transition-colors">
              <Share2 className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { icon: Truck, text: 'Free Delivery', sub: 'On orders ₹500+' },
              { icon: RotateCcw, text: '7 Day Return', sub: 'Easy returns' },
              { icon: Shield, text: 'Secure Payment', sub: '100% safe' },
            ].map(({ icon: Icon, text, sub }) => (
              <div key={text} className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <Icon className="h-5 w-5 mx-auto mb-1 text-primary-500" />
                <div className="text-xs font-semibold">{text}</div>
                <div className="text-xs text-gray-500">{sub}</div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm">
            <span className="font-medium">Sold by:</span> {product.seller?.shopName}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-10">
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto">
          {['description', 'specifications', 'reviews'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium capitalize whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'description' && (
          <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
            {product.description || 'No description available.'}
          </div>
        )}
        {activeTab === 'specifications' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {product.specifications?.length ? product.specifications.map((spec: any, i: number) => (
              <div key={i} className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="font-medium text-sm min-w-[120px] text-gray-600 dark:text-gray-400">{spec.key}</span>
                <span className="text-sm">{spec.value}</span>
              </div>
            )) : <p className="text-gray-500">No specifications available.</p>}
          </div>
        )}
        {activeTab === 'reviews' && (
          <div className="text-center py-10 text-gray-500">
            <Star className="h-10 w-10 mx-auto mb-2 text-gray-300" />
            <p>No reviews yet. Be the first to review!</p>
          </div>
        )}
      </div>

      {/* Related products */}
      {related?.products?.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-5">Similar Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {related.products.slice(0, 6).map((p: any) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
