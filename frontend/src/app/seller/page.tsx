'use client';
import Link from 'next/link';
import { Store, LogIn, FileText, CheckCircle, Clock, ShieldCheck } from 'lucide-react';

export default function BecomeSellerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4 py-12">
      <div className="max-w-3xl w-full">

        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="text-3xl font-black italic">
            <span className="text-[#2874F0]">BUY</span><span className="text-yellow-400">ZONE</span>
          </Link>
          <h1 className="text-2xl font-black mt-4 uppercase tracking-tight">Seller Portal</h1>
          <p className="text-slate-500 mt-2 text-sm">Join thousands of verified sellers on India's premier marketplace</p>
        </div>

        {/* Two cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* New Seller - Register */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md p-8 flex flex-col">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
              <Store className="h-7 w-7 text-emerald-600" />
            </div>
            <h2 className="text-lg font-black uppercase tracking-tight mb-2">New Seller</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 flex-1">
              Apply to become a seller. Fill in your business details, upload compliance documents, and wait for admin approval.
            </p>
            <div className="space-y-2 mb-6 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-emerald-500" /> Fill business & GST details</div>
              <div className="flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-emerald-500" /> Upload documents (GST, PAN, etc.)</div>
              <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-amber-500" /> Wait for admin approval (1-2 days)</div>
              <div className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-blue-500" /> Login & start selling</div>
            </div>
            <Link href="/seller/register"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg text-sm uppercase tracking-wider text-center transition-colors">
              Apply Now →
            </Link>
          </div>

          {/* Approved Seller - Login */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md p-8 flex flex-col">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="h-7 w-7 text-[#2874F0]" />
            </div>
            <h2 className="text-lg font-black uppercase tracking-tight mb-2">Approved Seller</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 flex-1">
              Already applied and got approved by admin? Login to your seller dashboard to manage products, orders and earnings.
            </p>
            <div className="space-y-2 mb-6 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Application approved by admin</div>
              <div className="flex items-center gap-2"><LogIn className="h-3.5 w-3.5 text-blue-500" /> Login with registered email</div>
              <div className="flex items-center gap-2"><Store className="h-3.5 w-3.5 text-emerald-500" /> Manage products & orders</div>
              <div className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-blue-500" /> Track earnings & withdrawals</div>
            </div>
            <Link href="/seller/login"
              className="w-full bg-[#2874F0] hover:bg-blue-500 text-white font-bold py-3 rounded-lg text-sm uppercase tracking-wider text-center transition-colors">
              Login to Dashboard →
            </Link>
          </div>

        </div>

        {/* Info note */}
        <div className="mt-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-xs text-amber-700 dark:text-amber-300 text-center">
          <strong>Note:</strong> New applications require admin approval before you can login. You will be notified via email once approved.
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          <Link href="/" className="hover:text-slate-600">← Back to Marketplace</Link>
        </p>
      </div>
    </div>
  );
}
