'use client';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Upload, Store, CheckCircle } from 'lucide-react';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const STEPS = ['Business Info', 'Documents', 'Store Info'];

export default function SellerRegisterPage() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [files, setFiles] = useState<Record<string, File>>({});
  const router = useRouter();
  const { register, handleSubmit, trigger, formState: { errors } } = useForm<any>();

  const handleFile = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFiles(p => ({ ...p, [field]: e.target.files![0] }));
  };

  const nextStep = async () => {
    const fields: Record<number, string[]> = {
      0: ['businessName', 'shopName', 'ownerName', 'email', 'phone', 'password', 'gstNumber', 'panNumber'],
      1: ['address.street', 'address.city', 'address.state', 'address.postalCode'],
    };
    const ok = await trigger(fields[step]);
    if (ok) setStep(s => s + 1);
  };

  const submit = useMutation({
    mutationFn: (data: any) => {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (typeof v === 'object' && !(v instanceof File)) fd.append(k, JSON.stringify(v));
        else fd.append(k, v as string);
      });
      Object.entries(files).forEach(([k, f]) => fd.append(k, f));
      return api.post('/auth/seller/register', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: () => setSubmitted(true),
    onError: (e: any) => toast.error(e.response?.data?.message || 'Registration failed'),
  });

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-black mb-2">Application Submitted!</h1>
          <p className="text-gray-500 mb-2">Your seller application is under review.</p>
          <p className="text-gray-500 mb-6">We'll notify you via email once approved. This usually takes 1–2 business days.</p>
          <div className="flex flex-col gap-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl mb-6 text-sm text-yellow-700 dark:text-yellow-300">
            <p className="font-semibold">Application Status: PENDING APPROVAL</p>
            <p>You cannot login until your application is approved by admin.</p>
          </div>
          <Link href="/" className="btn-primary">Back to Home</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-black text-primary-500">
            BUY<span className="text-gray-800 dark:text-white">ZONE</span>
          </Link>
          <p className="text-gray-500 mt-2">Start selling on India's premier marketplace</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                i <= step ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
              }`}>{i + 1}</div>
              <span className={`text-sm hidden sm:block ${i === step ? 'font-semibold' : 'text-gray-400'}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`w-8 h-0.5 ${i < step ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'}`} />}
            </div>
          ))}
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit(d => submit.mutate(d))}>
            {step === 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Store className="h-5 w-5" /> Business Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: 'businessName', label: 'Business Name', full: true },
                    { name: 'shopName', label: 'Shop Name' },
                    { name: 'ownerName', label: 'Owner Name' },
                    { name: 'email', label: 'Email', type: 'email', full: true },
                    { name: 'phone', label: 'Mobile Number' },
                    { name: 'password', label: 'Password', type: 'password' },
                    { name: 'gstNumber', label: 'GST Number' },
                    { name: 'panNumber', label: 'PAN Number' },
                  ].map(({ name, label, type = 'text', full }) => (
                    <div key={name} className={full ? 'col-span-2' : ''}>
                      <label className="block text-sm font-medium mb-1">{label}</label>
                      <input {...register(name, { required: `${label} is required` })}
                        type={type} placeholder={label} className="input" />
                      {(errors as any)[name] && <p className="text-red-500 text-xs mt-1">{(errors as any)[name]?.message}</p>}
                    </div>
                  ))}
                </div>
                <h3 className="font-semibold mt-4">Business Address</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: 'address.street', label: 'Street', full: true },
                    { name: 'address.city', label: 'City' },
                    { name: 'address.state', label: 'State' },
                    { name: 'address.country', label: 'Country' },
                    { name: 'address.postalCode', label: 'Postal Code' },
                  ].map(({ name, label, full }) => (
                    <div key={name} className={full ? 'col-span-2' : ''}>
                      <label className="block text-sm font-medium mb-1">{label}</label>
                      <input {...register(name)} placeholder={label} className="input" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Upload className="h-5 w-5" /> Documents</h2>
                {[
                  { field: 'gstCertificate', label: 'GST Certificate' },
                  { field: 'panCard', label: 'PAN Card' },
                  { field: 'businessLicense', label: 'Business License' },
                  { field: 'cancelledCheque', label: 'Cancelled Cheque' },
                ].map(({ field, label }) => (
                  <div key={field} className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <label className="block text-sm font-medium mb-2">{label}</label>
                    <input type="file" accept="image/*,.pdf" onChange={handleFile(field)}
                      className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-600 hover:file:bg-primary-100 cursor-pointer" />
                    {files[field] && <p className="text-xs text-green-600 mt-1">✓ {files[field].name}</p>}
                  </div>
                ))}
                <div>
                  <h3 className="font-semibold mb-3">Bank Account Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { name: 'bankDetails.accountNumber', label: 'Account Number' },
                      { name: 'bankDetails.ifsc', label: 'IFSC Code' },
                      { name: 'bankDetails.bankName', label: 'Bank Name' },
                      { name: 'bankDetails.accountHolder', label: 'Account Holder' },
                    ].map(({ name, label }) => (
                      <div key={name}>
                        <label className="block text-sm font-medium mb-1">{label}</label>
                        <input {...register(name)} placeholder={label} className="input" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold mb-4">Store Information</h2>
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <label className="block text-sm font-medium mb-2">Store Logo</label>
                  <input type="file" accept="image/*" onChange={handleFile('storeLogo')}
                    className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-600 hover:file:bg-primary-100 cursor-pointer" />
                  {files.storeLogo && <p className="text-xs text-green-600 mt-1">✓ {files.storeLogo.name}</p>}
                </div>
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <label className="block text-sm font-medium mb-2">Store Banner</label>
                  <input type="file" accept="image/*" onChange={handleFile('storeBanner')}
                    className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-600 hover:file:bg-primary-100 cursor-pointer" />
                  {files.storeBanner && <p className="text-xs text-green-600 mt-1">✓ {files.storeBanner.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Store Description</label>
                  <textarea {...register('storeDescription')} rows={4}
                    placeholder="Tell customers about your store..." className="input resize-none" />
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              {step > 0 && (
                <button type="button" onClick={() => setStep(s => s - 1)} className="btn-outline flex-1">← Back</button>
              )}
              {step < STEPS.length - 1 ? (
                <button type="button" onClick={nextStep} className="btn-primary flex-1">Next →</button>
              ) : (
                <button type="submit" disabled={submit.isPending} className="btn-primary flex-1">
                  {submit.isPending ? 'Submitting...' : 'Submit Application'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
