'use client';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { toggleDark, setMobileMenu } from '@/store/slices/uiSlice';
import { logout } from '@/store/slices/customerAuthSlice';
import { Moon, Sun, ShoppingCart, Heart, User, Search, Menu, X, Award, LogOut, Package, ChevronDown, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

const CATEGORIES = [
  { name: 'Electronics', icon: '💻' },
  { name: 'Mobiles', icon: '📱' },
  { name: 'Fashion', icon: '👕' },
  { name: 'Beauty & Health', icon: '💄' },
  { name: 'Home & Living', icon: '🏠' },
  { name: 'Appliances', icon: '🔌' },
  { name: 'Grocery', icon: '🍎' },
  { name: 'Sports', icon: '⚽' },
  { name: 'Books', icon: '📚' },
  { name: 'Toys', icon: '🧸' },
  { name: 'Automotive', icon: '🚗' },
];

export default function Header() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { darkMode, mobileMenuOpen } = useAppSelector(s => s.ui);
  const { user } = useAppSelector(s => s.customerAuth);
  const { admin } = useAppSelector(s => s.adminAuth);
  const { items } = useAppSelector(s => s.cart);
  const [search, setSearch] = useState('');
  const [userMenu, setUserMenu] = useState(false);

  const cartCount = items.reduce((s, i) => s + i.quantity, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/shop?search=${encodeURIComponent(search)}`);
  };

  const handleLogout = async () => {
    await api.post('/auth/customer/logout');
    dispatch(logout());
    router.push('/');
    setUserMenu(false);
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Top promo bar */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-600 dark:from-blue-900 dark:to-indigo-950 text-white text-xs px-4 py-2 text-center font-semibold tracking-wide">
        <span className="bg-yellow-400 text-slate-900 text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wider mr-2">⚡ HOT DEAL</span>
        18% GST included automatically. Free shipping on orders above ₹1,500 · Use <span className="text-yellow-400 font-bold">BUYZONE10</span> for 10% off
      </div>

      {/* Main nav — Flipkart blue */}
      <div className="bg-[#2874F0] text-white py-3 px-4 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0 cursor-pointer">
            <div className="text-2xl font-black tracking-wider italic text-white flex items-center">
              BUY<span className="text-yellow-400">ZONE</span>
            </div>
            <div className="text-[10px] -mt-1 text-slate-100 font-semibold flex items-center gap-1 italic">
              Explore <span className="text-yellow-300 font-bold flex items-center gap-0.5">Plus <Award size={10} /></span>
            </div>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:flex">
            <div className="flex w-full bg-white text-slate-800 rounded-sm shadow-inner overflow-hidden">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search for products, brands, electronics and more..."
                className="w-full px-4 py-2 text-sm focus:outline-none placeholder:text-slate-400"
              />
              <button type="submit" className="p-2 text-[#2874F0] hover:scale-105 transition-transform px-3">
                <Search size={18} />
              </button>
            </div>
          </form>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center space-x-5 text-sm">

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenu(!userMenu)}
                  className="hover:text-yellow-300 transition-colors flex items-center gap-1.5 font-semibold"
                >
                  <User size={16} /> {user.name.split(' ')[0]} <ChevronDown size={12} />
                </button>
                {userMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded shadow-xl border border-slate-100 dark:border-slate-700 py-1 z-50 text-slate-800 dark:text-slate-100">
                    <Link href="/customer/profile" onClick={() => setUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700">
                      <User size={14} /> My Profile
                    </Link>
                    <Link href="/customer/orders" onClick={() => setUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700">
                      <Package size={14} /> My Orders
                    </Link>
                    <Link href="/customer/wishlist" onClick={() => setUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700">
                      <Heart size={14} /> Wishlist
                    </Link>
                    <hr className="my-1 border-slate-100 dark:border-slate-700" />
                    <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-slate-50 dark:hover:bg-slate-700 w-full">
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/customer/login" className="hover:text-yellow-300 font-semibold flex items-center gap-1.5">
                <User size={16} /> Login
              </Link>
            )}

            <Link href="/cart" className="relative flex items-center gap-1.5 font-bold hover:text-yellow-300 transition-colors">
              <ShoppingCart size={18} />
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-3 -right-3 bg-yellow-400 text-slate-900 text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-[#2874F0]">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link href="/customer/wishlist" className="hover:text-slate-200 flex items-center gap-1.5">
              <Heart size={16} />
              <span>Wishlist</span>
            </Link>

            <Link href="/seller" className="bg-yellow-400 text-slate-900 font-bold px-3 py-1 rounded-sm text-xs shadow-sm hover:bg-yellow-300">
              Become Seller
            </Link>

            {admin ? (
              <Link href="/admin/dashboard" className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1 rounded-sm text-xs shadow-sm flex items-center gap-1">
                <ShieldCheck size={13} /> Admin Panel
              </Link>
            ) : (
              <Link href="/admin/login" className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1 rounded-sm text-xs shadow-sm flex items-center gap-1">
                <ShieldCheck size={13} /> Admin
              </Link>
            )}

            <button onClick={() => dispatch(toggleDark())} className="p-2 hover:bg-white/10 rounded-full">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          {/* Mobile icons */}
          <div className="flex items-center gap-2 md:hidden">
            <button onClick={() => dispatch(toggleDark())} className="p-1.5 hover:bg-white/10 rounded-full">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link href="/cart" className="relative p-1.5 hover:bg-white/10 rounded-full">
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-slate-900 text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">{cartCount}</span>
              )}
            </Link>
            <button onClick={() => dispatch(setMobileMenu(!mobileMenuOpen))} className="p-1.5 hover:bg-white/10 rounded-full">
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Category nav bar */}
      <nav className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center space-x-6 px-4 py-2.5 whitespace-nowrap">
          <Link
            href="/shop"
            className="flex flex-col items-center gap-0.5 group text-slate-600 dark:text-slate-300 hover:text-[#2874F0] focus:outline-none"
          >
            <span className="text-lg">🛍️</span>
            <span className="text-[10px] font-extrabold uppercase tracking-tight">All Offers</span>
          </Link>
          {CATEGORIES.map(cat => (
            <Link
              key={cat.name}
              href={`/shop?category=${encodeURIComponent(cat.name)}`}
              className="flex flex-col items-center gap-0.5 group text-slate-600 dark:text-slate-300 hover:text-[#2874F0] focus:outline-none"
            >
              <span className="text-lg group-hover:scale-110 transition-transform">{cat.icon}</span>
              <span className="text-[10px] font-extrabold uppercase tracking-tight">{cat.name}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-4 py-4 space-y-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="input flex-1 py-2"
            />
            <button type="submit" className="btn-primary py-2 px-3"><Search size={16} /></button>
          </form>
          {!user ? (
            <div className="flex gap-2">
              <Link href="/customer/login" className="btn-primary flex-1 text-center text-sm">Login</Link>
              <Link href="/customer/register" className="btn-outline flex-1 text-center text-sm">Register</Link>
            </div>
          ) : (
            <button onClick={handleLogout} className="text-sm text-red-500 font-semibold w-full text-left">Logout</button>
          )}
          <div className="grid grid-cols-4 gap-2">
            {CATEGORIES.map(cat => (
              <Link key={cat.name} href={`/shop?category=${encodeURIComponent(cat.name)}`}
                className="text-center py-2 px-1 text-xs rounded bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700">
                <div>{cat.icon}</div>
                <div className="mt-0.5 truncate">{cat.name}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
