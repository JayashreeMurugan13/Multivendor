'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { CheckCircle, XCircle, Star } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const TABS = ['pending', 'approved', 'rejected'];

export default function AdminProductsPage() {
  const [tab, setTab] = useState('pending');
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', tab, page],
    queryFn: () => api.get('/admin/products', { params: { status: tab, page, limit: 15 } }).then(r => r.data),
  });

  const moderate = useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) =>
      api.put(`/admin/products/${id}/moderate`, { action }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Product updated'); },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Product Moderation</h1>
      <div className="flex gap-2 mb-6">
        {TABS.map(t => (
          <button key={t} onClick={() => { setTab(t); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
              tab === t ? 'bg-primary-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}>{t}</button>
        ))}
      </div>

      {isLoading ? <LoadingSpinner size="lg" /> : (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-800 text-gray-400">
              <tr>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Seller</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Price</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {data?.products?.map((p: any) => (
                <tr key={p._id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.images?.[0]} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-800 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-white line-clamp-1">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.category?.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-300">{p.seller?.shopName}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-white font-semibold">₹{p.finalPrice?.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {tab === 'pending' && (
                        <>
                          <button onClick={() => moderate.mutate({ id: p._id, action: 'approve' })}
                            className="p-1.5 bg-green-900/30 hover:bg-green-900/50 rounded-lg text-green-400">
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button onClick={() => moderate.mutate({ id: p._id, action: 'reject' })}
                            className="p-1.5 bg-red-900/30 hover:bg-red-900/50 rounded-lg text-red-400">
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {tab === 'approved' && (
                        <button onClick={() => moderate.mutate({ id: p._id, action: 'feature' })}
                          className="p-1.5 bg-yellow-900/30 hover:bg-yellow-900/50 rounded-lg text-yellow-400">
                          <Star className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data?.products?.length && <p className="text-center text-gray-500 py-10">No {tab} products</p>}
        </div>
      )}
    </div>
  );
}
