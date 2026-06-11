'use client';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { sellerLogout } from '@/store/slices/sellerAuthSlice';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Package, ShoppingBag, Wallet, BarChart2, LogOut, Store, Menu, X } from 'lucide-react';
import { useState } from 'react';
import api from '@/lib/api';

const NAV = [
  { href: '/seller/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/seller/products', label: 'Products', icon: Package },
  { href: '/seller/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/seller/inventory', label: 'Inventory', icon: BarChart2 },
  { href: '/seller/earnings', label: 'Earnings', icon: Wallet },
];

const AUTH_PATHS = ['/seller/login', '/seller/register'];

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const { seller } = useAppSelector(s => s.sellerAuth);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (AUTH_PATHS.includes(pathname)) return;
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('accessToken');
    const sellerData = localStorage.getItem('seller');
    if (!token || role !== 'seller' || !sellerData) {
      router.replace('/seller/login');
    }
  }, [router, pathname]);

  if (AUTH_PATHS.includes(pathname)) return <>{children}</>;

  const sellerData = seller || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('seller') || 'null') : null);
  if (!sellerData) return null;

  const handleLogout = async () => {
    try { await api.post('/auth/seller/logout'); } catch {}
    dispatch(sellerLogout());
    router.push('/seller/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <aside className={`${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-300`}>
        <div className="p-5 border-b border-gray-100 dark:border-gray-700">
          <Link href="/" className="text-xl font-black text-primary-500">BUY<span className="text-gray-800 dark:text-white">ZONE</span></Link>
          <p className="text-xs text-gray-500 mt-1">Seller Portal</p>
        </div>
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Store className="h-5 w-5 text-primary-500" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{sellerData.shopName}</p>
              <p className="text-xs text-gray-500 truncate">{sellerData.email}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                pathname === href ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}>
              <Icon className="h-4 w-4" /> {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100 dark:border-gray-700">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 w-full text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setOpen(false)} />}

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-3 md:hidden">
          <button onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="font-bold">Seller Dashboard</span>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
