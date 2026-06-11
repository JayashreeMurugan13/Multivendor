'use client';
import { Package, MapPin, Heart, User, Wallet, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { logout } from '@/store/slices/customerAuthSlice';
import api from '@/lib/api';
import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const NAV = [
  { href: '/customer/profile', label: 'My Profile', icon: User },
  { href: '/customer/orders', label: 'My Orders', icon: Package },
  { href: '/customer/addresses', label: 'Addresses', icon: MapPin },
  { href: '/customer/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/customer/wallet', label: 'Wallet', icon: Wallet },
];

export default function CustomerDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAppSelector(s => s.customerAuth);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const [hydrated, setHydrated] = useState(false);

  const isAuthPage = pathname === '/customer/login' || pathname === '/customer/register';

  useEffect(() => {
    if (pathname === '/customer/login' || pathname === '/customer/register') return;
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('accessToken');
    const customerData = localStorage.getItem('customer');
    if (!token || role !== 'customer' || !customerData) {
      router.replace('/customer/login');
    } else {
      setHydrated(true);
    }
  }, [router, pathname]);

  if (isAuthPage) return <>{children}</>;

  const userData = user || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('customer') || 'null') : null);

  if (!hydrated || !userData) return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );

  const handleLogout = async () => {
    try { await api.post('/auth/customer/logout'); } catch {}
    dispatch(logout());
    router.push('/');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex gap-6">
        <aside className="hidden md:block w-56 flex-shrink-0">
          <div className="card p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <User className="h-6 w-6 text-primary-500" />
              </div>
              <div>
                <p className="font-semibold text-sm">{userData.name}</p>
                <p className="text-xs text-gray-500">{userData.email}</p>
              </div>
            </div>
          </div>
          <nav className="card p-2 space-y-1">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  pathname === href ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}>
                <Icon className="h-4 w-4" /> {label}
              </Link>
            ))}
            <button onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 w-full text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </nav>
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
