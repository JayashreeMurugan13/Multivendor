'use client';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/hooks/redux';
import { setCredentials } from '@/store/slices/customerAuthSlice';
import api from '@/lib/api';
import toast from 'react-hot-toast';

type FormData = { name: string; email: string; phone: string; password: string; confirm: string };

export default function CustomerRegisterPage() {
  const [showPwd, setShowPwd] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>();

  const signup = useMutation({
    mutationFn: (data: any) => api.post('/auth/customer/register', data),
    onSuccess: (res) => {
      dispatch(setCredentials(res.data));
      toast.success('Account created! Welcome to BUYZONE');
      router.push('/');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Registration failed'),
  });

  const onSubmit = ({ confirm, ...data }: FormData) => signup.mutate(data);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800 px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-black text-primary-500">
            BUY<span className="text-gray-800 dark:text-white">ZONE</span>
          </Link>
          <p className="text-gray-500 mt-2">Create your account to start shopping.</p>
        </div>
        <div className="card p-8">
          <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-primary-500" /> Create Account
          </h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input {...register('name', { required: 'Name is required' })} placeholder="John Doe" className="input" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/, message: 'Invalid email' } })}
                type="email" placeholder="you@example.com" className="input" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input {...register('phone')} type="tel" placeholder="+91 98765 43210" className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <div className="relative">
                <input {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                  type={showPwd ? 'text' : 'password'} placeholder="Min 6 characters" className="input pr-10" />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
              <input {...register('confirm', { validate: v => v === watch('password') || 'Passwords do not match' })}
                type="password" placeholder="Re-enter password" className="input" />
              {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm.message}</p>}
            </div>
            <button type="submit" disabled={signup.isPending} className="btn-primary w-full">
              {signup.isPending ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/customer/login" className="text-primary-500 font-medium hover:underline">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
