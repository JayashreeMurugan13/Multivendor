'use client';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/hooks/redux';
import { setAdminCredentials } from '@/store/slices/adminAuthSlice';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import ForgotPasswordModal from '@/components/shared/ForgotPasswordModal';

export default function AdminLoginPage() {
  const [showPwd, setShowPwd] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string; password: string }>();

  const login = useMutation({
    mutationFn: (data: any) => api.post('/auth/admin/login', data),
    onSuccess: (res) => {
      dispatch(setAdminCredentials(res.data));
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('role', 'admin');
      toast.success('Welcome, Admin!');
      router.push('/admin/dashboard');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Invalid credentials'),
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      {showForgot && <ForgotPasswordModal role="admin" onClose={() => setShowForgot(false)} />}
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-black italic">
            <span className="text-white">BUY</span><span className="text-yellow-400">ZONE</span>
          </Link>
          <p className="text-slate-400 mt-2 text-sm">Admin Control Panel</p>
        </div>

        <div className="bg-slate-900 rounded-lg p-8 border border-slate-700 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <span className="text-3xl">👑</span>
            <h1 className="text-lg font-bold uppercase tracking-wide text-white">Enterprise Operations Sign In</h1>
            <p className="text-xs font-bold uppercase text-rose-500">Authorized Personnel Only</p>
          </div>

          {/* Credentials hint */}
          <div className="bg-slate-800 border border-slate-600 rounded p-3 text-xs text-slate-300 space-y-1">
            <p className="font-bold text-yellow-400">Admin Credentials:</p>
            <p>Email: <span className="text-white font-mono">admin@buyzone.com</span></p>
            <p>Password: <span className="text-white font-mono">password123</span></p>
          </div>

          <form onSubmit={handleSubmit(d => login.mutate(d))} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 uppercase mb-1 font-bold">Admin Email</label>
              <input {...register('email', { required: 'Email is required' })}
                type="email" placeholder="admin@buyzone.com"
                className="w-full bg-slate-800 border border-slate-600 rounded p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-slate-400 uppercase mb-1 font-bold">Password</label>
              <div className="relative">
                <input {...register('password', { required: 'Password is required' })}
                  type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                  className="w-full bg-slate-800 border border-slate-600 rounded p-3 pr-10 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500" />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={login.isPending}
              className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-white font-bold p-3 rounded uppercase tracking-wider shadow transition-colors">
              {login.isPending ? 'Verifying...' : 'Sign In to Admin Panel'}
            </button>
            <button type="button" onClick={() => setShowForgot(true)}
              className="w-full text-xs text-slate-500 hover:text-slate-300 hover:underline pt-1">
              Forgot Password?
            </button>
          </form>
        </div>

        <div className="mt-4 flex justify-center gap-6 text-xs text-slate-500">
          <Link href="/" className="hover:text-white transition-colors">← Customer Store</Link>
          <Link href="/seller/login" className="hover:text-white transition-colors">Seller Office</Link>
        </div>
      </div>
    </div>
  );
}
