'use client';
import { useState } from 'react';
import { X, Mail, KeyRound, Lock, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Props {
  role: 'customer' | 'seller' | 'admin';
  onClose: () => void;
}

type Step = 'email' | 'otp' | 'password' | 'done';

export default function ForgotPasswordModal({ role, onClose }: Props) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const base = `/auth/${role}`;

  const sendOtp = async () => {
    if (!email) return toast.error('Enter your email');
    setLoading(true);
    try {
      await api.post(`${base}/forgot-password`, { email });
      toast.success('OTP sent to your email!');
      setStep('otp');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) return toast.error('Enter 6-digit OTP');
    setLoading(true);
    try {
      await api.post(`${base}/verify-otp`, { email, otp });
      setStep('password');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  const resetPassword = async () => {
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    if (password !== confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await api.post(`${base}/reset-password`, { email, otp, password });
      setStep('done');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Reset failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b dark:border-slate-700">
          <h3 className="font-bold text-sm uppercase tracking-wide">Reset Password</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">

          {step === 'email' && (
            <>
              <div className="text-center">
                <Mail className="h-10 w-10 text-blue-500 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Enter your registered email to receive OTP</p>
              </div>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-slate-50 dark:bg-slate-900 p-3 rounded border dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                onKeyDown={e => e.key === 'Enter' && sendOtp()}
              />
              <button onClick={sendOtp} disabled={loading}
                className="w-full bg-[#2874F0] hover:bg-blue-500 disabled:opacity-60 text-white font-bold p-3 rounded text-sm uppercase tracking-wider">
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </>
          )}

          {step === 'otp' && (
            <>
              <div className="text-center">
                <KeyRound className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Enter the 6-digit OTP sent to</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{email}</p>
              </div>
              <input
                type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000" maxLength={6}
                className="w-full bg-slate-50 dark:bg-slate-900 p-3 rounded border dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-center text-2xl font-bold tracking-widest"
                onKeyDown={e => e.key === 'Enter' && verifyOtp()}
              />
              <button onClick={verifyOtp} disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold p-3 rounded text-sm uppercase tracking-wider">
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <button onClick={() => { setStep('email'); setOtp(''); }}
                className="w-full text-sm text-slate-500 hover:underline">
                ← Change email
              </button>
            </>
          )}

          {step === 'password' && (
            <>
              <div className="text-center">
                <Lock className="h-10 w-10 text-purple-500 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Set your new password</p>
              </div>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="New password (min 6 chars)"
                className="w-full bg-slate-50 dark:bg-slate-900 p-3 rounded border dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
              />
              <input
                type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                placeholder="Confirm new password"
                className="w-full bg-slate-50 dark:bg-slate-900 p-3 rounded border dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
                onKeyDown={e => e.key === 'Enter' && resetPassword()}
              />
              <button onClick={resetPassword} disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white font-bold p-3 rounded text-sm uppercase tracking-wider">
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </>
          )}

          {step === 'done' && (
            <div className="text-center py-4 space-y-3">
              <CheckCircle className="h-14 w-14 text-emerald-500 mx-auto" />
              <h4 className="font-bold text-lg">Password Reset!</h4>
              <p className="text-sm text-slate-500">Your password has been updated. You can now login.</p>
              <button onClick={onClose}
                className="w-full bg-[#2874F0] hover:bg-blue-500 text-white font-bold p-3 rounded text-sm uppercase tracking-wider">
                Go to Login
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
