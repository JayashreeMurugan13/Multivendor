'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { User, Camera } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { setCredentials } from '@/store/slices/customerAuthSlice';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function CustomerProfilePage() {
  const { user } = useAppSelector(s => s.customerAuth);
  const dispatch = useAppDispatch();
  const { register, handleSubmit } = useForm({ defaultValues: { name: user?.name || '', phone: user?.phone || '' } });

  const update = useMutation({
    mutationFn: (data: any) => api.put('/auth/customer/profile', data),
    onSuccess: (res) => {
      dispatch(setCredentials({ user: res.data.user, accessToken: localStorage.getItem('accessToken') || '' }));
      toast.success('Profile updated');
    },
  });

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">My Profile</h1>
      <div className="card p-6 max-w-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <User className="h-8 w-8 text-primary-500" />
            </div>
          </div>
          <div>
            <p className="font-bold text-lg">{user?.name}</p>
            <p className="text-gray-500 text-sm">{user?.email}</p>
          </div>
        </div>
        <form onSubmit={handleSubmit(d => update.mutate(d))} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input {...register('name', { required: true })} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input value={user?.email} disabled className="input opacity-60 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input {...register('phone')} type="tel" className="input" />
          </div>
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-500">₹{(user?.wallet || 0).toLocaleString()}</p>
              <p className="text-xs text-gray-500">Wallet Balance</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-500">{user?.rewardPoints || 0}</p>
              <p className="text-xs text-gray-500">Reward Points</p>
            </div>
          </div>
          <button type="submit" disabled={update.isPending} className="btn-primary w-full">
            {update.isPending ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
