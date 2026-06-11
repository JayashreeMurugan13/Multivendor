'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Plus, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function AdminCouponsPage() {
  const [showForm, setShowForm] = useState(false);
  const qc = useQueryClient();
  const { register, handleSubmit, reset } = useForm<any>();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: () => api.get('/admin/coupons').then(r => r.data),
  });

  const create = useMutation({
    mutationFn: (d: any) => api.post('/admin/coupons', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-coupons'] }); toast.success('Coupon created'); setShowForm(false); reset(); },
  });

  const toggle = useMutation({
    mutationFn: (id: string) => api.put(`/admin/coupons/${id}/toggle`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-coupons'] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Coupons</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> Create Coupon
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">New Coupon</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white"><X className="h-4 w-4" /></button>
          </div>
          <form onSubmit={handleSubmit(d => create.mutate(d))} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-300">Coupon Code</label>
              <input {...register('code', { required: true })} placeholder="SUMMER20" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 uppercase" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-300">Type</label>
              <select {...register('type', { required: true })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-300">Value</label>
              <input {...register('value', { required: true })} type="number" placeholder="10" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-300">Max Discount (₹)</label>
              <input {...register('maxDiscount')} type="number" placeholder="500" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-300">Min Order (₹)</label>
              <input {...register('minOrder')} type="number" placeholder="200" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-300">Usage Limit</label>
              <input {...register('usageLimit')} type="number" placeholder="100" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1 text-gray-300">Expiry Date</label>
              <input {...register('expiresAt', { required: true })} type="datetime-local" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div className="col-span-2 flex gap-3">
              <button type="submit" disabled={create.isPending} className="btn-primary flex-1">
                {create.isPending ? 'Creating...' : 'Create Coupon'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-800 text-gray-300 hover:bg-gray-700 py-2.5 rounded-lg font-semibold text-sm transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? <LoadingSpinner size="lg" /> : (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-800 text-gray-400">
              <tr>
                <th className="px-4 py-3 text-left">Code</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Value</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Used</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Expires</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {data?.coupons?.map((c: any) => (
                <tr key={c._id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-primary-400">{c.code}</td>
                  <td className="px-4 py-3 text-gray-300 capitalize">{c.type}</td>
                  <td className="px-4 py-3 text-white font-semibold">{c.type === 'percentage' ? `${c.value}%` : `₹${c.value}`}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-400">{c.usedCount || 0}/{c.usageLimit || '∞'}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-400 text-xs">
                    {new Date(c.expiresAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggle.mutate(c._id)} className="flex items-center gap-1 text-sm">
                      {c.isActive
                        ? <><ToggleRight className="h-5 w-5 text-green-400" /><span className="text-green-400">Active</span></>
                        : <><ToggleLeft className="h-5 w-5 text-gray-500" /><span className="text-gray-500">Inactive</span></>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data?.coupons?.length && <p className="text-center text-gray-500 py-10">No coupons yet</p>}
        </div>
      )}
    </div>
  );
}
