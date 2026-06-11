'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { CheckCircle, XCircle, Eye, Clock, Store, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const TABS = ['pending', 'approved', 'rejected', 'suspended'];

export default function AdminSellersPage() {
  const [tab, setTab] = useState('pending');
  const [selected, setSelected] = useState<any>(null);
  const [reason, setReason] = useState('');
  const [rejectMode, setRejectMode] = useState(false);
  const qc = useQueryClient();

  const isAppTab = tab === 'pending' || tab === 'rejected';

  const { data: appsData, isLoading: appsLoading } = useQuery({
    queryKey: ['admin-applications', tab],
    queryFn: () => api.get('/admin/sellers/applications', { params: { status: tab } }).then(r => r.data),
    enabled: isAppTab,
  });

  const { data: sellersData, isLoading: sellersLoading } = useQuery({
    queryKey: ['admin-sellers', tab],
    queryFn: () => api.get('/admin/sellers', { params: { status: tab } }).then(r => r.data),
    enabled: !isAppTab,
  });

  const review = useMutation({
    mutationFn: ({ id, action, reason }: { id: string; action: string; reason?: string }) =>
      api.put(`/admin/sellers/applications/${id}/review`, { action, reason }),
    onSuccess: (_, { action }) => {
      qc.invalidateQueries({ queryKey: ['admin-applications'] });
      qc.invalidateQueries({ queryKey: ['admin-sellers'] });
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
      toast.success(`✅ Seller ${action === 'approved' ? 'Approved! They can now login.' : 'Rejected.'}`);
      setSelected(null);
      setReason('');
      setRejectMode(false);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Action failed'),
  });

  const toggleSeller = useMutation({
    mutationFn: (id: string) => api.put(`/admin/sellers/${id}/toggle`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-sellers'] });
      toast.success('Seller status updated');
    },
  });

  const isLoading = appsLoading || sellersLoading;
  const items = isAppTab ? appsData?.applications : sellersData?.sellers;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Seller Management</h1>
      <p className="text-gray-400 text-sm mb-6">Review seller applications and manage approved sellers.</p>

      {/* Tab switcher */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
              tab === t ? 'bg-primary-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}>
            {t}
            {t === 'pending' && appsData?.total > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{appsData.total}</span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-20"><LoadingSpinner size="lg" /></div>
      ) : !items?.length ? (
        <div className="text-center py-16 text-gray-500">
          <Store className="h-12 w-12 mx-auto mb-3 text-gray-700" />
          <p className="text-lg font-medium">No {tab} sellers</p>
          {tab === 'pending' && <p className="text-sm mt-1">No pending applications. New sellers will appear here after registration.</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item: any) => (
            <div key={item._id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 hover:border-gray-700 transition-colors">
              <div className="flex flex-wrap items-center gap-4 justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-2xl flex-shrink-0">
                    {item.storeLogo ? <img src={item.storeLogo} alt="" className="w-12 h-12 rounded-xl object-cover" /> : '🏪'}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{item.businessName || item.shopName}</p>
                    <p className="text-xs text-gray-400">{item.email}</p>
                    <p className="text-xs text-gray-500">{item.phone} {item.gstNumber ? `· GST: ${item.gstNumber}` : ''}</p>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => { setSelected(item); setRejectMode(false); setReason(''); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs text-gray-300 transition-colors">
                    <Eye className="h-3.5 w-3.5" /> View Details
                  </button>

                  {tab === 'pending' && (
                    <>
                      <button
                        onClick={() => review.mutate({ id: item._id, action: 'approved' })}
                        disabled={review.isPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-700 hover:bg-green-600 disabled:opacity-50 rounded-lg text-xs text-white font-bold transition-colors">
                        <CheckCircle className="h-3.5 w-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => { setSelected(item); setRejectMode(true); setReason(''); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-900/40 hover:bg-red-900/70 rounded-lg text-xs text-red-400 font-bold transition-colors">
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </button>
                    </>
                  )}

                  {(tab === 'approved' || tab === 'suspended') && (
                    <button
                      onClick={() => toggleSeller.mutate(item._id)}
                      disabled={toggleSeller.isPending}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        tab === 'approved'
                          ? 'bg-red-900/40 text-red-400 hover:bg-red-900/70'
                          : 'bg-green-900/40 text-green-400 hover:bg-green-900/70'
                      }`}>
                      {tab === 'approved' ? 'Suspend' : 'Reactivate'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail / Reject Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) { setSelected(null); setRejectMode(false); }}}>
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-gray-900">
              <h3 className="font-bold text-white text-lg">{selected.businessName || selected.shopName}</h3>
              <button onClick={() => { setSelected(null); setRejectMode(false); }} className="text-gray-400 hover:text-white text-xl">✕</button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ['Owner', selected.ownerName],
                  ['Email', selected.email],
                  ['Phone', selected.phone],
                  ['GST', selected.gstNumber],
                  ['PAN', selected.panNumber],
                  ['Shop Name', selected.shopName],
                  ['City', selected.address?.city],
                  ['State', selected.address?.state],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} className="bg-gray-800 rounded-lg p-3">
                    <p className="text-gray-400 text-xs mb-0.5">{k}</p>
                    <p className="text-white font-medium text-xs">{v}</p>
                  </div>
                ))}
              </div>

              {selected.storeDescription && (
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Store Description</p>
                  <p className="text-white text-sm">{selected.storeDescription}</p>
                </div>
              )}

              {/* Bank details */}
              {selected.bankDetails?.accountNumber && (
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Bank Details</p>
                  <p className="text-white text-xs">{selected.bankDetails.bankName} · {selected.bankDetails.accountNumber} · IFSC: {selected.bankDetails.ifsc}</p>
                </div>
              )}

              {/* Reject with reason */}
              {(tab === 'pending' || rejectMode) && (
                <div className="border-t border-gray-800 pt-4 space-y-3">
                  {rejectMode ? (
                    <>
                      <div className="flex items-center gap-2 text-yellow-400 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span className="font-bold">Provide rejection reason:</span>
                      </div>
                      <textarea
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        rows={3}
                        placeholder="e.g. Documents are unclear, GST number invalid..."
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm resize-none focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                      <div className="flex gap-3">
                        <button onClick={() => { setRejectMode(false); setReason(''); }}
                          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-xl text-sm font-medium">
                          Cancel
                        </button>
                        <button
                          onClick={() => review.mutate({ id: selected._id, action: 'rejected', reason })}
                          disabled={review.isPending || !reason.trim()}
                          className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-2 rounded-xl font-bold text-sm">
                          {review.isPending ? 'Rejecting...' : 'Confirm Reject'}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={() => review.mutate({ id: selected._id, action: 'approved' })}
                        disabled={review.isPending}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        {review.isPending ? 'Approving...' : 'Approve Seller'}
                      </button>
                      <button onClick={() => setRejectMode(true)}
                        className="flex-1 bg-red-900/40 hover:bg-red-900/70 text-red-400 py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                        <XCircle className="h-4 w-4" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
