'use client';
import { useQuery } from '@tanstack/react-query';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SlidersHorizontal } from 'lucide-react';
import api from '@/lib/api';
import ProductCard from '@/components/ui/ProductCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

const CATEGORY_LIST = ['Electronics', 'Mobiles', 'Fashion', 'Beauty & Health', 'Home & Living', 'Appliances', 'Grocery', 'Sports', 'Books', 'Toys', 'Automotive'];

function ShopContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);
  const [minPrice, setMinPrice] = useState(params.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(params.get('maxPrice') || '');

  const search = params.get('search') || '';
  const category = params.get('category') || '';
  const sort = params.get('sort') || 'newest';
  const page = parseInt(params.get('page') || '1');

  const { data, isLoading } = useQuery({
    queryKey: ['products', search, category, sort, minPrice, maxPrice, page],
    queryFn: () => api.get('/shop/products', {
      params: { search, category, sort, minPrice: minPrice || undefined, maxPrice: maxPrice || undefined, page, limit: 20 }
    }).then(r => r.data),
  });

  const updateParam = (key: string, value: string) => {
    const p = new URLSearchParams(params.toString());
    if (value) p.set(key, value); else p.delete(key);
    p.delete('page');
    router.push(`/shop?${p.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h3 className="text-xl font-bold tracking-tight uppercase border-l-4 border-[#2874F0] pl-3">
          {search ? `Results for "${search}"` : category || 'All Products'}
          {data && <span className="text-sm font-normal text-slate-400 ml-2">({data.total} items)</span>}
        </h3>
        <div className="flex items-center gap-3">
          <button onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-2 px-3 py-2 border dark:border-slate-700 rounded text-xs font-bold hover:border-[#2874F0] transition-colors md:hidden">
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>
          <select value={sort} onChange={e => updateParam('sort', e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border dark:border-slate-600 rounded p-2 text-xs focus:ring-1 focus:ring-[#2874F0] outline-none">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-6">
        <aside className={`${filterOpen ? 'block' : 'hidden'} md:block w-full md:w-56 flex-shrink-0`}>
          <div className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 space-y-5 sticky top-24">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-700">
              <h4 className="font-bold text-xs uppercase flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-[#2874F0]" /> Filters
              </h4>
              <button onClick={() => router.push('/shop')} className="text-xs text-[#2874F0] hover:underline font-semibold">Clear All</button>
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase mb-2">Price Range</h4>
              <div className="flex gap-2">
                <input type="number" placeholder="Min" value={minPrice}
                  onChange={e => setMinPrice(e.target.value)}
                  className="input text-xs py-1.5" />
                <input type="number" placeholder="Max" value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                  className="input text-xs py-1.5" />
              </div>
              <button onClick={() => { updateParam('minPrice', minPrice); updateParam('maxPrice', maxPrice); }}
                className="btn-primary w-full mt-2 py-1.5 text-xs">Apply</button>
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase mb-2">Categories</h4>
              {CATEGORY_LIST.map(cat => (
                <button key={cat} onClick={() => updateParam('category', category === cat ? '' : cat)}
                  className={`block w-full text-left px-2 py-1.5 text-xs rounded transition-colors mb-0.5 font-semibold ${
                    category === cat ? 'bg-blue-50 dark:bg-blue-950/30 text-[#2874F0] font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="flex-1">
          {isLoading ? (
            <div className="py-20"><LoadingSpinner size="lg" /></div>
          ) : !data?.products?.length ? (
            <div className="bg-white dark:bg-slate-800 rounded-lg p-16 text-center border dark:border-slate-700">
              <div className="text-5xl mb-4">🔍</div>
              <h4 className="font-bold text-lg">No products found</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-2">Try expanding your price range or clearing the search query.</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border dark:border-slate-700 mb-4">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Showing {data.products.length} items</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded uppercase">Active Sellers Online</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {data.products.map((p: any) => <ProductCard key={p._id} product={p} />)}
              </div>
              {data.pages > 1 && (
                <div className="flex justify-center gap-2 mt-8 flex-wrap">
                  {Array.from({ length: data.pages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => updateParam('page', String(p))}
                      className={`px-4 py-2 rounded text-xs font-bold transition-colors ${
                        page === p ? 'bg-[#2874F0] text-white' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}>
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="py-20"><LoadingSpinner size="lg" /></div>}>
      <ShopContent />
    </Suspense>
  );
}
