'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Plus, Trash2, Edit2, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

type AddrForm = { name: string; phone: string; street: string; city: string; state: string; country: string; postalCode: string; type: string };

export default function CustomerAddressesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const qc = useQueryClient();
  const { register, handleSubmit, reset, setValue } = useForm<AddrForm>({ defaultValues: { country: 'India', type: 'home' } });

  const { data, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => api.get('/customer/addresses').then(r => r.data),
  });

  const save = useMutation({
    mutationFn: (d: any) => editing ? api.put(`/customer/addresses/${editing._id}`, d) : api.post('/customer/addresses', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['addresses'] }); toast.success(editing ? 'Address updated' : 'Address added'); closeForm(); },
  });

  const del = useMutation({
    mutationFn: (id: string) => api.delete(`/customer/addresses/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['addresses'] }); toast.success('Address removed'); },
  });

  const setDefault = useMutation({
    mutationFn: (id: string) => api.put(`/customer/addresses/${id}/default`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['addresses'] }),
  });

  const openEdit = (addr: any) => {
    setEditing(addr);
    Object.entries(addr).forEach(([k, v]) => setValue(k as any, v as any));
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditing(null); reset({ country: 'India', type: 'home' }); };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">My Addresses</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm flex items-center gap-1">
          <Plus className="h-4 w-4" /> Add Address
        </button>
      </div>

      {showForm && (
        <div className="card p-5 mb-5">
          <h3 className="font-semibold mb-4">{editing ? 'Edit Address' : 'New Address'}</h3>
          <form onSubmit={handleSubmit(d => save.mutate(d))} className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium mb-1">Full Name</label><input {...register('name', { required: true })} className="input" /></div>
            <div><label className="block text-xs font-medium mb-1">Phone</label><input {...register('phone', { required: true })} className="input" /></div>
            <div className="col-span-2"><label className="block text-xs font-medium mb-1">Street Address</label><input {...register('street', { required: true })} className="input" /></div>
            <div><label className="block text-xs font-medium mb-1">City</label><input {...register('city', { required: true })} className="input" /></div>
            <div><label className="block text-xs font-medium mb-1">State</label><input {...register('state', { required: true })} className="input" /></div>
            <div><label className="block text-xs font-medium mb-1">Postal Code</label><input {...register('postalCode', { required: true })} className="input" /></div>
            <div>
              <label className="block text-xs font-medium mb-1">Type</label>
              <select {...register('type')} className="input">
                <option value="home">Home</option>
                <option value="work">Work</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="col-span-2 flex gap-3">
              <button type="submit" disabled={save.isPending} className="btn-primary flex-1">{save.isPending ? 'Saving...' : 'Save Address'}</button>
              <button type="button" onClick={closeForm} className="btn-outline flex-1">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? <LoadingSpinner /> : (
        <div className="space-y-3">
          {data?.addresses?.map((addr: any) => (
            <div key={addr._id} className={`card p-4 border-2 transition-colors ${addr.isDefault ? 'border-primary-300 dark:border-primary-700' : 'border-transparent'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold">{addr.name}</p>
                    <span className="badge bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 capitalize text-xs">{addr.type}</span>
                    {addr.isDefault && <span className="badge bg-primary-100 dark:bg-primary-900/30 text-primary-600 text-xs">Default</span>}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{addr.phone}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{addr.street}, {addr.city}, {addr.state} - {addr.postalCode}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {!addr.isDefault && (
                    <button onClick={() => setDefault.mutate(addr._id)} className="p-1.5 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg text-green-500" title="Set as default">
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  )}
                  <button onClick={() => openEdit(addr)} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-blue-500">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => del.mutate(addr._id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {!data?.addresses?.length && (
            <div className="card p-10 text-center text-gray-500">
              <p>No addresses saved. Add one to get started.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
