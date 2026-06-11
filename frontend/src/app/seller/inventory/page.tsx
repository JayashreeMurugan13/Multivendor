'use client';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Package } from 'lucide-react';
import api from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function SellerInventoryPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['seller-inventory'],
    queryFn: () => api.get('/seller/products', { params: { limit: 100 } }).then(r => r.data),
  });

  const products = data?.products || [];
  const lowStock = products.filter((p: any) => p.stock <= 10);
  const outOfStock = products.filter((p: any) => p.stock === 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Inventory Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-4 flex items-center gap-3">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl"><Package className="h-5 w-5 text-blue-600" /></div>
          <div><p className="text-sm text-gray-500">Total Products</p><p className="text-2xl font-bold">{products.length}</p></div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-xl"><AlertTriangle className="h-5 w-5 text-yellow-600" /></div>
          <div><p className="text-sm text-gray-500">Low Stock (≤10)</p><p className="text-2xl font-bold text-yellow-600">{lowStock.length}</p></div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl"><AlertTriangle className="h-5 w-5 text-red-600" /></div>
          <div><p className="text-sm text-gray-500">Out of Stock</p><p className="text-2xl font-bold text-red-600">{outOfStock.length}</p></div>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
          <p className="font-semibold text-yellow-700 dark:text-yellow-400 mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Low Stock Alert
          </p>
          <div className="space-y-2">
            {lowStock.map((p: any) => (
              <div key={p._id} className="flex items-center justify-between text-sm">
                <span className="font-medium">{p.name}</span>
                <span className={`font-bold ${p.stock === 0 ? 'text-red-600' : 'text-yellow-600'}`}>
                  {p.stock === 0 ? 'OUT OF STOCK' : `${p.stock} left`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading ? <LoadingSpinner size="lg" /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left">SKU</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Stock</th>
                <th className="px-4 py-3 text-left">Total Sold</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {products.map((p: any) => (
                <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.images?.[0]} alt="" className="w-8 h-8 rounded-lg object-cover bg-gray-100" />
                      <span className="font-medium line-clamp-1 max-w-[160px]">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.sku || '-'}</td>
                  <td className="px-4 py-3 text-gray-500">{p.category?.name || p.category || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${p.stock === 0 ? 'text-red-600' : p.stock <= 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">{p.totalSold || 0}</td>
                  <td className="px-4 py-3">
                    <span className={`badge capitalize ${
                      p.status === 'approved' ? 'bg-green-100 text-green-700' :
                      p.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>{p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
