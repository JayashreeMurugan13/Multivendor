'use client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, Store, Package, ShoppingBag, DollarSign, Clock } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api.get('/admin/dashboard').then(r => r.data),
  });

  const { data: ordersData } = useQuery({
    queryKey: ['admin-orders-recent'],
    queryFn: () => api.get('/admin/orders', { params: { limit: 8 } }).then(r => r.data),
  });

  const { data: appsData } = useQuery({
    queryKey: ['admin-apps'],
    queryFn: () => api.get('/admin/sellers/applications', { params: { status: 'pending', limit: 5 } }).then(r => r.data),
  });

  if (isLoading) return <div className="py-20"><LoadingSpinner size="lg" /></div>;

  const stats = data?.stats || {};

  const cards = [
    { label: 'Total Users', value: stats.customers || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-900/30' },
    { label: 'Active Sellers', value: stats.sellers || 0, icon: Store, color: 'text-purple-400', bg: 'bg-purple-900/30' },
    { label: 'Total Products', value: stats.products || 0, icon: Package, color: 'text-green-400', bg: 'bg-green-900/30' },
    { label: 'Total Orders', value: stats.orders || 0, icon: ShoppingBag, color: 'text-yellow-400', bg: 'bg-yellow-900/30' },
    { label: 'Total Revenue', value: `₹${(stats.revenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-primary-400', bg: 'bg-orange-900/30' },
    { label: 'Pending Applications', value: stats.pendingApplications || 0, icon: Clock, color: 'text-red-400', bg: 'bg-red-900/30', alert: stats.pendingApplications > 0 },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {cards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className={`bg-gray-900 rounded-2xl p-4 border ${c.alert ? 'border-red-500/50' : 'border-gray-800'}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">{c.label}</span>
              <div className={`${c.bg} p-2 rounded-lg`}><c.icon className={`h-4 w-4 ${c.color}`} /></div>
            </div>
            <div className={`text-2xl font-bold ${c.alert ? 'text-red-400' : 'text-white'}`}>{c.value}</div>
            {c.alert && <p className="text-xs text-red-400 mt-1">Requires attention →</p>}
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Applications */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-400" /> Pending Applications
            </h2>
            <Link href="/admin/sellers" className="text-sm text-primary-400 hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {appsData?.applications?.map((app: any) => (
              <Link key={app._id} href={`/admin/sellers?tab=applications`}
                className="flex items-center justify-between p-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors">
                <div>
                  <p className="font-medium text-sm">{app.businessName}</p>
                  <p className="text-xs text-gray-400">{app.email}</p>
                </div>
                <span className="badge bg-yellow-900/30 text-yellow-400 text-xs">Pending</span>
              </Link>
            ))}
            {!appsData?.applications?.length && (
              <p className="text-gray-500 text-sm text-center py-4">No pending applications</p>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-primary-400 hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {ordersData?.orders?.slice(0, 6).map((order: any) => (
              <div key={order._id} className="flex items-center justify-between p-3 bg-gray-800 rounded-xl">
                <div>
                  <p className="font-medium text-sm">#{order._id.slice(-6).toUpperCase()}</p>
                  <p className="text-xs text-gray-400">{order.customer?.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">₹{order.total?.toLocaleString()}</p>
                  <span className={`badge text-xs capitalize ${
                    order.orderStatus === 'delivered' ? 'bg-green-900/30 text-green-400' :
                    order.orderStatus === 'cancelled' ? 'bg-red-900/30 text-red-400' : 'bg-yellow-900/30 text-yellow-400'
                  }`}>{order.orderStatus}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
