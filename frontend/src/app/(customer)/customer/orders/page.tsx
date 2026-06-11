'use client';
import { useQuery } from '@tanstack/react-query';
import { Check, Package } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const STAGES = ['Ordered', 'Packed', 'Shipped', 'Delivered'];

const STATUS_MAP: Record<string, string> = {
  pending: 'Ordered', placed: 'Ordered', confirmed: 'Ordered',
  packed: 'Packed', shipped: 'Shipped',
  out_for_delivery: 'Shipped', delivered: 'Delivered',
};

export default function CustomerOrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => api.get('/orders').then(r => r.data),
  });

  if (isLoading) return <div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div>;

  const orders = data?.orders || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <h3 className="text-xl font-bold tracking-tight uppercase border-l-4 border-[#2874F0] pl-3">
        Visual Order Tracking System
      </h3>

      {orders.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg p-16 text-center border dark:border-slate-700 space-y-4">
          <Package size={64} className="mx-auto text-slate-200 dark:text-slate-700" />
          <h4 className="font-bold text-lg">No active tracking references found.</h4>
          <p className="text-xs text-slate-500">Start shopping to see your orders here.</p>
          <Link href="/shop" className="btn-primary inline-block">Shop Now</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order: any) => {
            const mappedStatus = STATUS_MAP[order.orderStatus] || 'Ordered';
            const currentStageIdx = STAGES.indexOf(mappedStatus);
            return (
              <div key={order._id} className="bg-white dark:bg-slate-800 p-6 rounded-lg border dark:border-slate-700 shadow-sm space-y-6">

                {/* Order Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 dark:border-slate-700 gap-2 text-xs">
                  <div>
                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 font-black px-2.5 py-1 rounded">
                      ORDER REF: #{order._id.slice(-8).toUpperCase()}
                    </span>
                    <p className="text-slate-400 mt-2 font-semibold">
                      Placed on: {new Date(order.createdAt).toLocaleDateString('en-IN')} via {order.paymentMethod}
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Total Bill:</span>
                    <p className="text-lg font-black text-[#2874F0]">₹{order.total?.toLocaleString()}</p>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-1 text-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Consignment details:</span>
                  {order.items?.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between font-bold">
                      <span>{item.name} (Qty x{item.quantity})</span>
                      <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Visual Timeline */}
                <div className="pt-8 pb-4">
                  <div className="relative">
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-700 -translate-y-1/2 rounded-full" />
                    <div
                      className="absolute top-1/2 left-0 h-1 bg-emerald-600 dark:bg-emerald-400 -translate-y-1/2 rounded-full transition-all duration-500"
                      style={{ width: `${(currentStageIdx / (STAGES.length - 1)) * 100}%` }}
                    />
                    <div className="relative flex justify-between">
                      {STAGES.map((stage, sIdx) => {
                        const completed = sIdx <= currentStageIdx;
                        return (
                          <div key={stage} className="flex flex-col items-center bg-white dark:bg-slate-800 px-1">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${completed ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-200 text-slate-500 dark:bg-slate-700'}`}>
                              {completed ? <Check size={14} /> : sIdx + 1}
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-tight mt-1.5 ${completed ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                              {stage}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Shipping address */}
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded text-xs space-y-1 border dark:border-slate-700">
                  <span className="font-bold text-[10px] text-slate-400 uppercase">Estimated Shipping Destination:</span>
                  <p className="font-extrabold">
                    {order.shippingAddress
                      ? `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}`
                      : 'Address on file'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
