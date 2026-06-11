'use client';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/hooks/redux';
import { setCredentials } from '@/store/slices/customerAuthSlice';
import { setCart } from '@/store/slices/cartSlice';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import ForgotPasswordModal from '@/components/shared/ForgotPasswordModal';

export default function CustomerLoginPage() {
  const [showPwd, setShowPwd] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string; password: string }>();

  const login = useMutation({
    mutationFn: (data: any) => api.post('/auth/customer/login', data),
    onSuccess: async (res) => {
      dispatch(setCredentials(res.data));
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('role', 'customer');
      try {
        const cartRes = await api.get('/cart');
        dispatch(setCart(cartRes.data.cart?.items || []));
      } catch {}
      toast.success(`Welcome back, ${res.data.user.name}!`);
      router.push('/');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Login failed'),
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      {showForgot && <ForgotPasswordModal role="customer" onClose={() => setShowForgot(false)} />}
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-black italic">
            <span className="text-[#2874F0]">BUY</span><span className="text-yellow-400">ZONE</span>
          </Link>
          <p className="text-slate-500 mt-2 text-sm">Welcome back! Sign in to continue.</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-md border border-slate-100 dark:border-slate-700 space-y-6">
          <div className="text-center space-y-2">
            <span className="text-3xl">🛍️</span>
            <h1 className="text-lg font-bold uppercase tracking-wide">Customer Login</h1>
          </div>

          <form onSubmit={handleSubmit(d => login.mutate(d))} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 uppercase mb-1 font-bold">Email Address</label>
              <input {...register('email', { required: 'Email is required' })}
                type="email" placeholder="you@example.com"
                className="w-full bg-slate-50 dark:bg-slate-900 p-3 rounded border dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-[#2874F0]" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-slate-400 uppercase mb-1 font-bold">Password</label>
              <div className="relative">
                <input {...register('password', { required: 'Password is required' })}
                  type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-900 p-3 rounded border dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-[#2874F0] pr-10" />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={login.isPending}
              className="w-full bg-[#2874F0] hover:bg-blue-500 text-white font-bold p-3 rounded uppercase tracking-wider shadow transition-colors">
              {login.isPending ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 border-t dark:border-slate-700 pt-4">
            Don't have an account?{' '}
            <Link href="/customer/register" className="text-[#2874F0] font-bold hover:underline">Register</Link>
            <span className="mx-2">·</span>
            <button onClick={() => setShowForgot(true)} className="text-slate-400 hover:text-[#2874F0] hover:underline">Forgot Password?</button>
          </p>
        </div>
      </div>
    </div>
  );
}
