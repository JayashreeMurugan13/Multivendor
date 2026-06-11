'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Plus, Trash2, Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function AdminBannersPage() {
  const [showForm, setShowForm] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const qc = useQueryClient();
  const { register, handleSubmit, reset } = useForm<any>();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: () => api.get('/admin/banners').then(r => r.data),
  });

  const create = useMutation({
    mutationFn: (d: any) => {
      const fd = new FormData();
      Object.entries(d).forEach(([k, v]) => fd.append(k, String(v)));
      if (file) fd.append('image', file);
      return api.post('/admin/banners', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-banners'] }); toast.success('Banner created'); setShowForm(false); setFile(null); reset(); },
  });

  const del = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/banners/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-banners'] }); toast.success('Banner deleted'); },
  });

  const toggle = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.put(`/admin/banners/${id}`, { isActive: !isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-banners'] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Banner Management</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Banner
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5 mb-6">
          <h3 className="font-semibold text-white mb-4">New Banner</h3>
          <form onSubmit={handleSubmit(d => create.mutate(d))} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-300">Title</label>
              <input {...register('title', { required: true })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-300">Subtitle</label>
              <input {...register('subtitle')} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-300">Link URL</label>
              <input {...register('link')} placeholder="/shop?sale=true" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-300">Sort Order</label>
              <input {...register('sortOrder')} type="number" defaultValue={0} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-2 text-gray-300">Banner Image</label>
              <div className="border-2 border-dashed border-gray-700 rounded-xl p-4 text-center">
                <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="hidden" id="banner-img" />
                <label htmlFor="banner-img" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto text-gray-600 mb-2" />
                  <p className="text-sm text-gray-500">{file ? file.name : 'Click to upload'}</p>
                </label>
              </div>
            </div>
            <div className="col-span-2 flex gap-3">
              <button type="submit" disabled={create.isPending} className="btn-primary flex-1">
                {create.isPending ? 'Creating...' : 'Create Banner'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-800 text-gray-300 hover:bg-gray-700 py-2.5 rounded-lg font-semibold text-sm transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? <LoadingSpinner size="lg" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.banners?.map((b: any) => (
            <div key={b._id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              {b.image && <img src={b.image} alt={b.title} className="w-full h-36 object-cover" />}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-white">{b.title}</p>
                    {b.subtitle && <p className="text-sm text-gray-400">{b.subtitle}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => toggle.mutate({ id: b._id, isActive: b.isActive })}
                      className={`px-2 py-1 rounded-lg text-xs font-medium ${b.isActive ? 'bg-green-900/30 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
                      {b.isActive ? 'Active' : 'Inactive'}
                    </button>
                    <button onClick={() => del.mutate(b._id)} className="p-1.5 bg-red-900/30 text-red-400 hover:bg-red-900/50 rounded-lg">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {!data?.banners?.length && (
            <div className="col-span-2 text-center py-12 text-gray-500">No banners yet. Add one to get started.</div>
          )}
        </div>
      )}
    </div>
  );
}
