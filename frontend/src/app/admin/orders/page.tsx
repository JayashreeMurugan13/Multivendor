'use client';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import api from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page, status],
    queryFn: () => api.get('/admin/orders', { params: { page, limit: 20, status: status || undefined } }).then(r => r.data),
  });

  const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-900/30 text-yellow-400',
    confirmed: 'bg-blue-900/30 text-blue-400',
    shipped: 'bg-purple-900/30 text-purple-400',
    delivered: 'bg-green-900/30 text-green-400',
    cancelled: 'bg-red-900/30 text-red-400',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">All Orders ({data?.total || 0})</h1>
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="">All Status</option>
          {['pending','confirmed','packed','shipped','out_for_delivery','delivered','cancelled'].map(s => (
            <option key={s} value={s} className="capitalize">{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {isLoading ? <LoadingSpinner size="lg" /> : (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-800 text-gray-400">
              <tr>
                <th className="px-4 py-3 text-left">Order ID</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Payment</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {data?.orders?.map((order: any) => (
                <tr key={order._id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-300">#{order._id.slice(-8).toUpperCase()}</td>
                  <td className="px-4 py-3">
                    <p className="text-white font-medium">{order.customer?.name}</p>
                    <p className="text-xs text-gray-400">{order.customer?.email}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`badge text-xs capitalize ${order.paymentStatus === 'paid' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white font-semibold">₹{order.total?.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs capitalize ${STATUS_COLORS[order.orderStatus] || STATUS_COLORS.pending}`}>
                      {order.orderStatus?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-400 text-xs">
                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data?.orders?.length && <p className="text-center text-gray-500 py-10">No orders found</p>}
        </div>
      )}
      {data?.total > 20 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: Math.ceil(data.total / 20) }, (_, i) => i + 1).slice(0, 10).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`px-3 py-1.5 rounded-lg text-sm ${page === p ? 'bg-primary-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
