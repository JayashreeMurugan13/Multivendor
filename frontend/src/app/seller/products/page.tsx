'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Upload, Package, ImagePlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const CATEGORIES = ['Electronics','Mobiles','Fashion','Beauty & Health','Home & Living','Appliances','Grocery','Sports','Books','Toys','Automotive'];

export default function SellerProductsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [specs, setSpecs] = useState([{ key: '', value: '' }]);
  const [page, setPage] = useState(1);
  const qc = useQueryClient();
  const { register, handleSubmit, reset, setValue } = useForm<any>();

  const { data, isLoading } = useQuery({
    queryKey: ['seller-products', page],
    queryFn: () => api.get('/seller/products', { params: { page, limit: 10 } }).then(r => r.data),
  });

  const save = useMutation({
    mutationFn: (fd: FormData) => editing
      ? api.put(`/seller/products/${editing._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      : api.post('/seller/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['seller-products'] });
      toast.success(editing ? 'Product updated!' : 'Product added! Pending admin approval.');
      closeForm();
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const del = useMutation({
    mutationFn: (id: string) => api.delete(`/seller/products/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['seller-products'] }); toast.success('Product deleted'); },
  });

  const addImages = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'));
    setImages(p => [...p, ...arr]);
    arr.forEach(f => {
      const reader = new FileReader();
      reader.onload = e => setPreviews(p => [...p, e.target?.result as string]);
      reader.readAsDataURL(f);
    });
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addImages(e.dataTransfer.files);
  }, [addImages]);

  const removeImage = (i: number) => {
    setImages(p => p.filter((_, j) => j !== i));
    setPreviews(p => p.filter((_, j) => j !== i));
  };

  const openEdit = (p: any) => {
    setEditing(p);
    setValue('name', p.name); setValue('sku', p.sku); setValue('brand', p.brand);
    setValue('price', p.price); setValue('discount', p.discount); setValue('stock', p.stock);
    setValue('description', p.description); setValue('category', typeof p.category === 'object' ? (p.category?.name || '') : (p.category || ''));
    setSpecs(p.specifications?.length ? p.specifications : [{ key: '', value: '' }]);
    setPreviews(p.images || []);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false); setEditing(null); reset();
    setImages([]); setPreviews([]); setSpecs([{ key: '', value: '' }]);
  };

  const onSubmit = (data: any) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => fd.append(k, String(v ?? '')));
    fd.append('specifications', JSON.stringify(specs.filter(s => s.key)));
    images.forEach(img => fd.append('images', img));
    save.mutate(fd);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products ({data?.total || 0})</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      {isLoading ? <div className="py-20"><LoadingSpinner size="lg" /></div> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Category</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Price</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Stock</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {data?.products?.map((p: any) => (
                <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.images?.[0] || '/placeholder.png'} alt={p.name}
                        className="w-12 h-12 rounded-lg object-cover bg-gray-100 flex-shrink-0 border border-gray-200" />
                      <div>
                        <p className="font-medium line-clamp-1">{p.name}</p>
                        <p className="text-xs text-gray-400">SKU: {p.sku || '-'}</p>
                        {p.images?.length > 1 && <p className="text-xs text-blue-500">{p.images.length} images</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-500 capitalize">{typeof p.category === 'object' ? p.category?.name : p.category}</td>
                  <td className="px-4 py-3 hidden md:table-cell font-semibold">
                    ₹{p.finalPrice?.toLocaleString()}
                    {p.discount > 0 && <span className="text-xs text-green-600 ml-1">({p.discount}% off)</span>}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={p.stock < 10 ? 'text-red-500 font-medium' : ''}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge capitalize text-xs ${
                      p.status === 'approved' ? 'bg-green-100 text-green-700' :
                      p.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-blue-500">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => { if (confirm('Delete this product?')) del.mutate(p._id); }}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data?.products?.length && (
            <div className="text-center py-12 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No products yet. Add your first product!</p>
            </div>
          )}
        </div>
      )}

      {data?.pages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: data.pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${page === p ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200'}`}>
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Product Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

              <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                <h2 className="text-lg font-bold">{editing ? 'Edit Product' : 'Add New Product'}</h2>
                <button onClick={closeForm} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-5">

                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Product Name *</label>
                    <input {...register('name', { required: true })} className="input" placeholder="e.g. Sony WH-1000XM5 Headphones" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">SKU</label>
                    <input {...register('sku')} className="input" placeholder="SKU-001" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Brand</label>
                    <input {...register('brand')} className="input" placeholder="Brand name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Category *</label>
                    <select {...register('category', { required: true })} className="input">
                      <option value="">Select category</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Price (₹) *</label>
                    <input {...register('price', { required: true })} type="number" min="0" className="input" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Discount (%)</label>
                    <input {...register('discount')} type="number" min="0" max="99" className="input" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Stock *</label>
                    <input {...register('stock', { required: true })} type="number" min="0" className="input" placeholder="0" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea {...register('description')} rows={3} className="input resize-none"
                      placeholder="Describe your product..." />
                  </div>
                </div>

                {/* Specifications */}
                <div>
                  <label className="block text-sm font-medium mb-2">Specifications</label>
                  <div className="space-y-2">
                    {specs.map((s, i) => (
                      <div key={i} className="flex gap-2">
                        <input value={s.key} onChange={e => setSpecs(p => p.map((x, j) => j === i ? { ...x, key: e.target.value } : x))}
                          className="input flex-1" placeholder="e.g. Color" />
                        <input value={s.value} onChange={e => setSpecs(p => p.map((x, j) => j === i ? { ...x, value: e.target.value } : x))}
                          className="input flex-1" placeholder="e.g. Black" />
                        <button type="button" onClick={() => setSpecs(p => p.filter((_, j) => j !== i))}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg flex-shrink-0">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => setSpecs(p => [...p, { key: '', value: '' }])}
                    className="mt-2 text-sm text-primary-500 hover:underline flex items-center gap-1">
                    <Plus className="h-3 w-3" /> Add specification
                  </button>
                </div>

                {/* Image Upload - Drag & Drop */}
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                    <ImagePlus className="h-4 w-4" /> Product Images
                  </label>

                  {/* Drop Zone */}
                  <div
                    onDragOver={e => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={onDrop}
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
                      dragging ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-primary-400'
                    }`}
                    onClick={() => document.getElementById('img-input')?.click()}
                  >
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {dragging ? 'Drop images here!' : 'Drag & drop images or click to browse'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB each</p>
                    <input id="img-input" type="file" multiple accept="image/*" className="hidden"
                      onChange={e => e.target.files && addImages(e.target.files)} />
                  </div>

                  {/* Image Previews */}
                  {previews.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-3">
                      {previews.map((src, i) => (
                        <div key={i} className="relative group aspect-square">
                          <img src={src} alt="" className="w-full h-full object-cover rounded-lg border border-gray-200" />
                          <button type="button" onClick={() => removeImage(i)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                  <button type="button" onClick={closeForm} className="btn-outline flex-1">Cancel</button>
                  <button type="submit" disabled={save.isPending} className="btn-primary flex-1">
                    {save.isPending ? 'Saving...' : editing ? 'Update Product' : 'Add Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
