'use client';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, ShoppingBag, Package, Users, TrendingUp, Clock, ArrowRight, BarChart2 } from 'lucide-react';
import api from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import { useAppSelector } from '@/hooks/redux';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  packed: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function SellerDashboard() {
  const { seller } = useAppSelector(s => s.sellerAuth);

  const { data, isLoading } = useQuery({
    queryKey: ['seller-dashboard'],
    queryFn: () => api.get('/seller/dashboard').then(r => r.data),
  });

  const { data: ordersData } = useQuery({
    queryKey: ['seller-orders-recent'],
    queryFn: () => api.get('/seller/orders', { params: { limit: 5 } }).then(r => r.data),
  });

  const { data: productsData } = useQuery({
    queryKey: ['seller-products-recent'],
    queryFn: () => api.get('/seller/products', { params: { limit: 5 } }).then(r => r.data),
  });

  if (isLoading) return <div className="py-20"><LoadingSpinner size="lg" /></div>;

  const stats = data?.stats || {};
  const monthlySales: number[] = data?.monthlySales || Array(12).fill(0);
  const maxSale = Math.max(...monthlySales, 1);

  const cards = [
    { label: 'Total Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Total Orders', value: stats.totalOrders || 0, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Total Products', value: stats.totalProducts || productsData?.total || 0, icon: Package, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Customers', value: stats.totalCustomers || 0, icon: Users, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { label: 'Withdrawable', value: `₹${(seller?.withdrawableBalance || stats.withdrawableBalance || 0).toLocaleString()}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Pending Payments', value: `₹${(stats.pendingPayments || 0).toLocaleString()}`, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
  ];

  // Mock product performance data
  const topProducts = productsData?.products?.slice(0, 5) || [];
  const maxRevenue = Math.max(...topProducts.map((p: any) => p.finalPrice || 0), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Welcome back, {seller?.shopName || seller?.ownerName}</p>
        </div>
        <Link href="/seller/products" className="btn-primary text-sm flex items-center gap-2">
          <Package className="h-4 w-4" /> Add Product
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{c.label}</span>
              <div className={`${c.bg} p-2 rounded-lg`}><c.icon className={`h-4 w-4 ${c.color}`} /></div>
            </div>
            <div className="text-2xl font-bold">{c.value}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Monthly Sales Chart */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2"><BarChart2 className="h-4 w-4 text-blue-500" /> Monthly Sales</h2>
          </div>
          <div className="flex items-end gap-1 h-40">
            {monthlySales.map((val: number, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-blue-500 hover:bg-blue-400 rounded-t transition-all cursor-pointer relative group"
                  style={{ height: `${Math.max((val / maxSale) * 128, 4)}px` }}
                >
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] bg-gray-800 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                    ₹{val.toLocaleString()}
                  </span>
                </div>
                <span className="text-[9px] text-gray-400">{MONTHS[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Graph (line-style) */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2"><TrendingUp className="h-4 w-4 text-emerald-500" /> Revenue Trend</h2>
          </div>
          <div className="flex items-end gap-1 h-40">
            {monthlySales.map((val: number, i: number) => {
              const prev = monthlySales[i - 1] || 0;
              const color = val >= prev ? 'bg-emerald-500' : 'bg-rose-400';
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full ${color} rounded-t transition-all`}
                    style={{ height: `${Math.max((val / maxSale) * 128, 4)}px` }}
                  />
                  <span className="text-[9px] text-gray-400">{MONTHS[i]}</span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full" /> Growth</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-rose-400 rounded-full" /> Decline</span>
          </div>
        </div>
      </div>

      {/* Product Performance */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Product Performance</h2>
          <Link href="/seller/products" className="text-sm text-primary-500 hover:underline flex items-center gap-1">
            Manage <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="space-y-3">
          {topProducts.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No products yet.</p>}
          {topProducts.map((p: any) => (
            <div key={p._id} className="flex items-center gap-3">
              <img src={p.images?.[0] || '/placeholder.png'} alt="" className="w-9 h-9 rounded-lg object-cover bg-gray-100 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.name}</p>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                  <div
                    className="bg-primary-500 h-1.5 rounded-full"
                    style={{ width: `${((p.finalPrice || 0) / maxRevenue) * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-sm font-semibold flex-shrink-0">₹{(p.finalPrice || 0).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders + Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent Orders</h2>
            <Link href="/seller/orders" className="text-sm text-primary-500 hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {ordersData?.orders?.slice(0, 5).map((order: any) => (
              <div key={order._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">#{order._id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-gray-500">{order.customer?.name}</p>
                </div>
                <span className="font-semibold text-sm">₹{order.total?.toLocaleString()}</span>
                <span className={`badge capitalize text-xs ${STATUS_COLORS[order.orderStatus] || STATUS_COLORS.pending}`}>
                  {order.orderStatus}
                </span>
              </div>
            ))}
            {!ordersData?.orders?.length && <p className="text-gray-500 text-sm text-center py-4">No orders yet</p>}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">My Products</h2>
            <Link href="/seller/products" className="text-sm text-primary-500 hover:underline">Manage</Link>
          </div>
          <div className="space-y-3">
            {productsData?.products?.slice(0, 5).map((product: any) => (
              <div key={product._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                <img src={product.images?.[0] || '/placeholder.png'} alt=""
                  className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">₹{product.finalPrice?.toLocaleString()}</p>
                  <span className={`badge text-xs capitalize ${
                    product.status === 'approved' ? 'bg-green-100 text-green-700' :
                    product.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>{product.status}</span>
                </div>
              </div>
            ))}
            {!productsData?.products?.length && <p className="text-gray-500 text-sm text-center py-4">No products yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
