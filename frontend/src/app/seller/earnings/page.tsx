'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { DollarSign, TrendingUp, Clock, CheckCircle, ArrowDownCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAppSelector } from '@/hooks/redux';

export default function SellerEarningsPage() {
  const [showWithdraw, setShowWithdraw] = useState(false);
  const { seller } = useAppSelector(s => s.sellerAuth);
  const qc = useQueryClient();
  const { register, handleSubmit, reset } = useForm<{ amount: number; notes: string }>();

  const { data: withdrawals, isLoading } = useQuery({
    queryKey: ['withdrawals'],
    queryFn: () => api.get('/seller/withdrawals').then(r => r.data),
  });

  const { data: dashboard } = useQuery({
    queryKey: ['seller-dashboard'],
    queryFn: () => api.get('/seller/dashboard').then(r => r.data),
  });

  const withdraw = useMutation({
    mutationFn: (data: any) => api.post('/seller/withdrawals', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['withdrawals'] });
      toast.success('Withdrawal request submitted');
      setShowWithdraw(false);
      reset();
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const stats = dashboard?.stats || {};

  const cards = [
    { label: 'Total Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Withdrawable', value: `₹${(seller?.withdrawableBalance || 0).toLocaleString()}`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Pending Payments', value: `₹${(stats.pendingPayments || 0).toLocaleString()}`, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { label: 'Completed Payouts', value: withdrawals?.withdrawals?.filter((w: any) => w.status === 'approved').length || 0, icon: CheckCircle, color: 'text-primary-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Earnings & Payouts</h1>
        <button onClick={() => setShowWithdraw(true)} className="btn-primary flex items-center gap-2">
          <ArrowDownCircle className="h-4 w-4" /> Request Withdrawal
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map(c => (
          <div key={c.label} className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{c.label}</span>
              <div className={`${c.bg} p-2 rounded-lg`}><c.icon className={`h-4 w-4 ${c.color}`} /></div>
            </div>
            <div className="text-2xl font-bold">{c.value}</div>
          </div>
        ))}
      </div>

      {showWithdraw && (
        <div className="card p-5 mb-6 border-2 border-primary-200 dark:border-primary-800">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <ArrowDownCircle className="h-5 w-5 text-primary-500" /> Request Withdrawal
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Available balance: <strong>₹{(seller?.withdrawableBalance || 0).toLocaleString()}</strong>
          </p>
          <form onSubmit={handleSubmit(d => withdraw.mutate(d))} className="flex flex-wrap gap-3">
            <input {...register('amount', { required: true })} type="number" placeholder="Amount (₹)"
              max={seller?.withdrawableBalance} className="input w-48" />
            <input {...register('notes')} placeholder="Notes (optional)" className="input flex-1 min-w-[200px]" />
            <button type="submit" disabled={withdraw.isPending} className="btn-primary">
              {withdraw.isPending ? 'Submitting...' : 'Submit Request'}
            </button>
            <button type="button" onClick={() => setShowWithdraw(false)} className="btn-outline">Cancel</button>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 font-semibold">Withdrawal History</div>
        {isLoading ? <div className="p-8"><LoadingSpinner /></div> : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Notes</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {withdrawals?.withdrawals?.map((w: any) => (
                <tr key={w._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3">{new Date(w.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3 font-semibold">₹{w.amount?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-500">{w.notes || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`badge capitalize ${
                      w.status === 'approved' ? 'bg-green-100 text-green-700' :
                      w.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>{w.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!withdrawals?.withdrawals?.length && !isLoading && (
          <p className="text-center text-gray-500 py-8">No withdrawal requests yet.</p>
        )}
      </div>
    </div>
  );
}
