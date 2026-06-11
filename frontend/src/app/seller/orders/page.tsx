'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const STATUSES = ['confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  packed: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-purple-100 text-purple-700',
  out_for_delivery: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function SellerOrdersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['seller-orders', page, statusFilter],
    queryFn: () => api.get('/seller/orders', { params: { page, limit: 15, status: statusFilter || undefined } }).then(r => r.data),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status, trackingId }: { id: string; status: string; trackingId?: string }) =>
      api.put(`/seller/orders/${id}/status`, { status, trackingId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['seller-orders'] }); toast.success('Order status updated'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Orders ({data?.total || 0})</h1>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input w-auto text-sm py-2">
          <option value="">All Status</option>
          {['pending', ...STATUSES, 'cancelled'].map(s => (
            <option key={s} value={s} className="capitalize">{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {isLoading ? <LoadingSpinner size="lg" /> : (
        <div className="space-y-3">
          {data?.orders?.map((order: any) => (
            <div key={order._id} className="card p-4">
              <div className="flex flex-wrap items-start gap-4 justify-between mb-3">
                <div>
                  <p className="font-semibold">#{order._id.slice(-8).toUpperCase()}</p>
                  <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  <p className="text-sm">{order.customer?.name} · {order.customer?.email}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">₹{order.total?.toLocaleString()}</p>
                  <span className={`badge capitalize ${STATUS_COLORS[order.orderStatus] || STATUS_COLORS.pending}`}>
                    {order.orderStatus?.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {order.items?.map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-1.5 text-sm">
                    <img src={item.image} alt="" className="w-6 h-6 rounded object-cover" />
                    <span className="line-clamp-1 max-w-[120px]">{item.name}</span>
                    <span className="text-gray-500">×{item.quantity}</span>
                  </div>
                ))}
              </div>
              {order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled' && (
                <div className="flex gap-2 flex-wrap">
                  {STATUSES.filter(s => STATUSES.indexOf(s) > STATUSES.indexOf(order.orderStatus)).slice(0, 2).map(s => (
                    <button key={s} onClick={() => updateStatus.mutate({ id: order._id, status: s })}
                      className="btn-primary text-xs py-1.5 px-3 capitalize"
                      disabled={updateStatus.isPending}>
                      Mark as {s.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {!data?.orders?.length && (
            <div className="card p-12 text-center text-gray-500">
              <p>No orders found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
