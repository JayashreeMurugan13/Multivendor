'use client';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/hooks/redux';
import { setSellerCredentials } from '@/store/slices/sellerAuthSlice';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import ForgotPasswordModal from '@/components/shared/ForgotPasswordModal';

export default function SellerLoginPage() {
  const [showPwd, setShowPwd] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string; password: string }>();

  const login = useMutation({
    mutationFn: (data: any) => api.post('/auth/seller/login', data),
    onSuccess: (res) => {
      dispatch(setSellerCredentials(res.data));
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('role', 'seller');
      toast.success(`Welcome back, ${res.data.user.shopName}!`);
      router.push('/seller/dashboard');
    },
    onError: (e: any) => {
      const msg = e.response?.data?.message || 'Login failed';
      if (msg.includes('review') || msg.includes('pending')) {
        toast.error('⏳ Your application is pending admin approval. Please wait.');
      } else if (msg.includes('rejected')) {
        toast.error('❌ Your application was rejected. Contact support.');
      } else if (msg.includes('suspended')) {
        toast.error('🚫 Your account is suspended. Contact support.');
      } else {
        toast.error(msg);
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-white dark:from-slate-900 dark:to-slate-800 px-4">
      {showForgot && <ForgotPasswordModal role="seller" onClose={() => setShowForgot(false)} />}
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="text-3xl font-black italic">
            <span className="text-[#2874F0]">BUY</span><span className="text-yellow-400">ZONE</span>
          </Link>
          <p className="text-slate-500 mt-1 text-sm">Seller Office</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-5">
            <h2 className="text-lg font-black uppercase tracking-tight">Seller Login</h2>
            <p className="text-xs text-emerald-100 mt-1">Only approved sellers can access the dashboard.</p>
          </div>

          <div className="p-6 space-y-5">
            {/* Info box */}
            <div className="bg-blue-50 dark:bg-slate-900 border border-blue-100 dark:border-slate-700 rounded p-3 text-xs space-y-2">
              <p className="font-bold flex items-center gap-1.5 text-[#2874F0]">
                <ShieldCheck size={14} /> Approval Required
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                New sellers must be <span className="font-bold text-emerald-600">approved by Admin</span> before login.
                Go to <Link href="/admin/login" className="font-bold text-rose-600 underline">Admin Panel</Link> to approve pending sellers.
              </p>
              <div className="border-t dark:border-slate-700 pt-2 mt-2">
                <p className="font-bold text-slate-500">Pre-approved test seller:</p>
                <p className="font-mono text-slate-700 dark:text-slate-300">raman@zonetech.in / password123</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(d => login.mutate(d))} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 uppercase mb-1 font-bold">Business Email</label>
                <input {...register('email', { required: 'Email is required' })}
                  type="email" placeholder="seller@example.com"
                  className="w-full bg-slate-50 dark:bg-slate-900 p-3 rounded border dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-slate-500 uppercase mb-1 font-bold">Password</label>
                <div className="relative">
                  <input {...register('password', { required: 'Password is required' })}
                    type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-slate-900 p-3 rounded border dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm pr-10" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>
              <button type="submit" disabled={login.isPending}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold p-3 rounded uppercase tracking-wider shadow transition-colors">
                {login.isPending ? 'Verifying...' : 'Login to Seller Dashboard'}
              </button>
            </form>

            <p className="text-center text-xs text-slate-500 border-t dark:border-slate-700 pt-4">
              New seller?{' '}
              <Link href="/seller/register" className="text-[#2874F0] font-bold hover:underline">
                Submit Application →
              </Link>
              <span className="mx-2">·</span>
              <button onClick={() => setShowForgot(true)} className="text-slate-400 hover:text-[#2874F0] hover:underline">Forgot Password?</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
