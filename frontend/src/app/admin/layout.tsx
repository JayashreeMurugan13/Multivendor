'use client';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { adminLogout } from '@/store/slices/adminAuthSlice';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Users, Store, Package, ShoppingBag, Image, Tag, LogOut, Menu, X, Shield } from 'lucide-react';
import { useState } from 'react';
import api from '@/lib/api';

const NAV = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/sellers', label: 'Sellers', icon: Store },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/coupons', label: 'Coupons', icon: Tag },
  { href: '/admin/banners', label: 'Banners', icon: Image },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { admin } = useAppSelector(s => s.adminAuth);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (pathname === '/admin/login') return;
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('accessToken');
    const adminData = localStorage.getItem('admin');
    if (!token || role !== 'admin' || !adminData) {
      router.replace('/admin/login');
    }
  }, [router, pathname]);

  if (pathname === '/admin/login') return <>{children}</>;

  const adminData = admin || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('admin') || 'null') : null);
  if (!adminData) return null;

  const handleLogout = async () => {
    try { await api.post('/auth/admin/logout'); } catch {}
    dispatch(adminLogout());
    router.push('/admin/login');
  };

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      <aside className={`${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static inset-y-0 left-0 z-40 w-60 bg-gray-900 border-r border-gray-800 flex flex-col transition-transform duration-300`}>
        <div className="p-5 border-b border-gray-800">
          <span className="text-xl font-black text-primary-500">BUY<span className="text-white">ZONE</span></span>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Shield className="h-3 w-3" /> Admin Panel</p>
        </div>
        <div className="p-4 border-b border-gray-800">
          <p className="font-semibold text-white text-sm">{adminData.name}</p>
          <p className="text-xs text-gray-400 capitalize">{adminData.role}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                pathname.startsWith(href) ? 'bg-primary-500 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}>
              <Icon className="h-4 w-4" /> {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-800">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 w-full text-sm text-red-400 hover:bg-red-900/20 rounded-xl transition-colors">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setOpen(false)} />}

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center gap-3 md:hidden">
          <button onClick={() => setOpen(!open)} className="text-white">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="font-bold text-white">Admin Panel</span>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-950 text-white">{children}</main>
      </div>
    </div>
  );
}
