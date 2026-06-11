'use client';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Filter, Star, ShoppingCart, Heart, Compass } from 'lucide-react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { setCart } from '@/store/slices/cartSlice';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const BANNERS = [
  { title: 'SUMMER MEGADEALS!', desc: 'Extra 10% instant rebate on HDFC Credit Cards.', bg: 'from-blue-600 to-indigo-800' },
  { title: 'FESTIVAL OF GADGETS', desc: 'Up to ₹10,000 off on premium dual OLED laptops.', bg: 'from-pink-600 to-purple-800' },
  { title: 'ORGANIC GROCERY', desc: 'Sourced daily from clean agricultural spaces.', bg: 'from-teal-600 to-emerald-800' },
];

const SORT_OPTIONS = [
  { value: 'popular', label: 'Popularity / Relevance' },
  { value: 'low-to-high', label: 'Price: Low to High' },
  { value: 'high-to-low', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];

export default function HomePage() {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector(s => s.cart);
  const [bannerIdx, setBannerIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 28, seconds: 45 });
  const [sortBy, setSortBy] = useState('popular');
  const [maxPrice, setMaxPrice] = useState(100000);
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    const t = setInterval(() => setBannerIdx(i => (i + 1) % BANNERS.length), 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { hours: prev.hours, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 4, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['featured'],
    queryFn: () => api.get('/shop/products/featured').then(r => r.data),
  });

  const allProducts = data?.trending || data?.bestSellers || [];

  const filtered = useMemo(() => {
    return [...allProducts]
      .filter((p: any) => p.finalPrice <= maxPrice)
      .sort((a: any, b: any) => {
        if (sortBy === 'low-to-high') return a.finalPrice - b.finalPrice;
        if (sortBy === 'high-to-low') return b.finalPrice - a.finalPrice;
        if (sortBy === 'rating') return b.ratings?.average - a.ratings?.average;
        return 0;
      });
  }, [allProducts, sortBy, maxPrice]);

  const handleAddToCart = async (product: any) => {
    try {
      const res = await api.post('/cart/add', { productId: product._id, quantity: 1 });
      dispatch(setCart(res.data.cart.items));
      toast.success(`🛒 Added "${product.name}" to cart`);
    } catch {
      toast.error('Please login to add to cart');
    }
  };

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-6">

      {/* Hero Banner */}
      <div className={`relative rounded-lg overflow-hidden shadow-xl bg-gradient-to-br ${BANNERS[bannerIdx].bg} text-white min-h-[200px] md:min-h-[280px] flex items-center p-8 md:p-12 transition-all duration-700`}>
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent z-0" />
        <div className="relative z-10 max-w-lg space-y-3">
          <span className="bg-yellow-400 text-slate-950 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
            BUYZONE PRIME BONANZA
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">{BANNERS[bannerIdx].title}</h2>
          <p className="text-xs md:text-sm text-slate-200">{BANNERS[bannerIdx].desc}</p>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-200">Sale ends in:</span>
            <span className="text-yellow-400 font-bold text-sm">
              {pad(timeLeft.hours)}h {pad(timeLeft.minutes)}m {pad(timeLeft.seconds)}s
            </span>
          </div>
          <Link
            href="/shop"
            className="bg-[#2874F0] hover:bg-blue-500 text-white text-[11px] font-bold uppercase py-2.5 px-6 rounded-sm tracking-wider shadow hover:scale-105 transition-all flex items-center gap-2 w-fit"
          >
            Shop Exclusive Catalog <ArrowRight size={14} />
          </Link>
        </div>

        <div className="absolute right-4 bottom-4 flex gap-2">
          {BANNERS.map((_, idx) => (
            <button key={idx} onClick={() => setBannerIdx(idx)}
              className={`h-2.5 w-2.5 rounded-full ${idx === bannerIdx ? 'bg-white' : 'bg-white/40'}`} />
          ))}
        </div>
        <button onClick={() => setBannerIdx(i => (i - 1 + BANNERS.length) % BANNERS.length)}
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50">
          <ChevronLeft size={18} />
        </button>
        <button onClick={() => setBannerIdx(i => (i + 1) % BANNERS.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Catalog + Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Left: Filters + AI Shopper */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 space-y-6">
            <div className="flex justify-between items-center border-b pb-3 dark:border-slate-700">
              <h4 className="font-bold text-sm uppercase flex items-center gap-2">
                <Filter size={16} className="text-[#2874F0]" /> Filters
              </h4>
              <button onClick={() => { setSortBy('popular'); setMaxPrice(100000); }}
                className="text-xs text-[#2874F0] hover:underline font-semibold">
                Clear All
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
                MAX PRICE: ₹{maxPrice.toLocaleString()}
              </label>
              <input type="range" min="1000" max="100000" step="1000"
                value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#2874F0]" />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>₹1,000</span><span>₹1,00,000+</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block">SORT BY</label>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-700 border dark:border-slate-600 rounded p-2 text-xs focus:ring-1 focus:ring-[#2874F0] outline-none">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* AI Personal Shopper */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 p-5 rounded-lg border border-blue-100 dark:border-slate-700 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <span className="text-xs font-black text-indigo-800 dark:text-indigo-300 uppercase tracking-wider">AI Personal Shopper</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
              Based on your browsing, our recommendation model suggests checking out the latest <span className="font-bold text-[#2874F0] dark:text-blue-400">Electronics & Mobiles</span> for best deals today.
            </p>
            <Link href="/shop?category=Electronics"
              className="text-xs font-bold text-[#2874F0] dark:text-blue-400 flex items-center gap-1 hover:underline">
              View recommendations <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* Right: Product grid */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border dark:border-slate-700">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Showing {filtered.length || allProducts.length} Premium items
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded uppercase">
              Active Sellers Online
            </span>
          </div>

          {isLoading ? (
            <div className="py-20"><LoadingSpinner size="lg" /></div>
          ) : allProducts.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-lg p-16 text-center border dark:border-slate-700">
              <span className="text-5xl">🛍️</span>
              <h4 className="mt-4 font-bold text-lg">Marketplace loading...</h4>
              <p className="text-xs text-slate-400 mt-2">Connect the backend to display live products.</p>
              {/* Demo cards when no API */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 text-left">
                {[
                  { name: 'ZoneBook Pro Ultra 15.6" OLED Laptop', price: 89999, orig: 120000, cat: 'Electronics', rating: 4.8, img: 'https://images.unsplash.com/photo-1496181130204-755241524eab?w=400&auto=format&fit=crop&q=60' },
                  { name: 'Horizon Pro 5G SmartPhone (256GB)', price: 24999, orig: 35000, cat: 'Mobiles', rating: 4.5, img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=60' },
                  { name: 'Smart RoboClean Vacuum Mop', price: 18999, orig: 29999, cat: 'Appliances', rating: 4.6, img: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=60' },
                ].map(p => {
                  const savings = Math.round(((p.orig - p.price) / p.orig) * 100);
                  return (
                    <div key={p.name} className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all flex flex-col group">
                      <div className="relative bg-slate-50 dark:bg-slate-900 h-44 flex items-center justify-center p-3">
                        <img src={p.img} alt={p.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" />
                        <span className="absolute top-2 right-2 bg-yellow-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded shadow">{savings}% OFF</span>
                      </div>
                      <div className="p-4 flex-1 flex flex-col space-y-3">
                        <div>
                          <span className="text-[10px] font-bold text-[#2874F0] uppercase">{p.cat}</span>
                          <h4 className="font-bold text-sm text-slate-800 dark:text-white line-clamp-2 leading-snug mt-0.5">{p.name}</h4>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              {p.rating} <Star size={10} className="fill-white" />
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-black text-slate-900 dark:text-white">₹{p.price.toLocaleString()}</span>
                            <span className="text-xs text-slate-400 line-through">₹{p.orig.toLocaleString()}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t dark:border-slate-700 text-xs font-bold mt-2">
                            <button className="border py-1.5 rounded-sm flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-700">
                              <Heart size={14} /> Save
                            </button>
                            <button className="bg-[#2874F0] hover:bg-blue-500 text-white py-1.5 rounded-sm flex items-center justify-center gap-1.5 shadow">
                              <ShoppingCart size={14} /> Add
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(filtered.length > 0 ? filtered : allProducts).map((p: any) => {
                const savings = p.discount || 0;
                const inWishlist = wishlist.includes(p._id);
                return (
                  <div key={p._id} className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all flex flex-col group">
                    <Link href={`/product/${p.slug || p._id}`} className="relative bg-slate-50 dark:bg-slate-900 h-44 flex items-center justify-center p-3">
                      <img src={p.images?.[0] || '/placeholder.png'} alt={p.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" />
                      {savings > 0 && (
                        <span className="absolute top-2 right-2 bg-yellow-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded shadow">{savings}% OFF</span>
                      )}
                      {p.isFlashSale && (
                        <span className="absolute top-2 left-2 bg-[#2874F0] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-tight shadow">TRENDING</span>
                      )}
                    </Link>
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-[#2874F0] uppercase">{p.category}</span>
                        <Link href={`/product/${p.slug || p._id}`}>
                          <h4 className="font-bold text-sm text-slate-800 dark:text-white line-clamp-2 leading-snug hover:text-[#2874F0] transition-colors">{p.name}</h4>
                        </Link>
                        <div className="flex items-center gap-1.5">
                          <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            {p.ratings?.average?.toFixed(1) || '4.5'} <Star size={10} className="fill-white" />
                          </span>
                          <span className="text-[11px] text-slate-400">({p.ratings?.count || 0} reviews)</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-black text-slate-900 dark:text-white">₹{p.finalPrice?.toLocaleString()}</span>
                          {savings > 0 && <span className="text-xs text-slate-400 line-through">₹{p.price?.toLocaleString()}</span>}
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t dark:border-slate-700 text-xs font-bold mt-2">
                          <button
                            onClick={() => {
                              setWishlist(w => inWishlist ? w.filter(id => id !== p._id) : [...w, p._id]);
                              toast(inWishlist ? '❤️ Removed from wishlist' : '❤️ Added to wishlist');
                            }}
                            className={`border py-1.5 rounded-sm flex items-center justify-center gap-1.5 ${inWishlist ? 'bg-red-50 dark:bg-red-950/20 text-red-500 border-red-200' : 'hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                          >
                            <Heart size={14} className={inWishlist ? 'fill-current' : ''} />
                            {inWishlist ? 'Liked' : 'Save'}
                          </button>
                          <button onClick={() => handleAddToCart(p)}
                            className="bg-[#2874F0] hover:bg-blue-500 text-white py-1.5 rounded-sm flex items-center justify-center gap-1.5 shadow">
                            <ShoppingCart size={14} /> Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recently Viewed */}
      <div className="bg-slate-100 dark:bg-slate-900 rounded-lg p-5 border dark:border-slate-800">
        <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
          <Compass size={16} className="text-amber-500" /> Recently Viewed Catalog Items
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'ZoneBook Pro Ultra OLED Laptop', price: 89999, img: 'https://images.unsplash.com/photo-1496181130204-755241524eab?w=200&auto=format&fit=crop&q=60' },
            { name: 'Smart RoboClean Vacuum Mop', price: 18999, img: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200&auto=format&fit=crop&q=60' },
          ].map(item => (
            <Link key={item.name} href="/shop"
              className="bg-white dark:bg-slate-800 p-3 rounded border dark:border-slate-700 flex items-center gap-3 cursor-pointer hover:shadow transition-shadow">
              <img src={item.img} alt={item.name} className="w-10 h-10 object-contain" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold truncate">{item.name}</p>
                <p className="text-xs font-black text-[#2874F0]">₹{item.price.toLocaleString()}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Become Seller CTA */}
      <section className="bg-gradient-to-r from-[#2874F0] to-indigo-600 rounded-lg p-8 text-white text-center shadow-lg">
        <h2 className="text-2xl md:text-3xl font-black mb-2">Start Selling on BUYZONE</h2>
        <p className="opacity-90 mb-6 text-sm">Join thousands of verified sellers. Submit compliance documents and grow your business today.</p>
        <Link href="/seller/register"
          className="bg-yellow-400 text-slate-900 font-black px-8 py-3 rounded-sm hover:bg-yellow-300 hover:scale-105 transition-all inline-flex items-center gap-2 text-sm uppercase tracking-wider">
          Apply for Retail Rights <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}
