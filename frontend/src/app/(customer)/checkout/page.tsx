'use client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Plus } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { clearCartState } from '@/store/slices/cartSlice';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const PAYMENT_METHODS = ['Razorpay', 'Cash On Delivery'];

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items, couponCode, discount } = useAppSelector(s => s.cart);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Razorpay');
  const [showDummyRazorpay, setShowDummyRazorpay] = useState(false);
  const [dummyOrderData, setDummyOrderData] = useState<any>(null);
  const [dummyPayStep, setDummyPayStep] = useState<'select'|'processing'|'done'>('select');
  const [dummyUpi, setDummyUpi] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ name: '', phone: '', street: '', city: '', state: '', country: 'India', postalCode: '', type: 'home' });

  const { data: addrData, refetch } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => api.get('/customer/addresses').then(r => r.data),
  });

  useEffect(() => {
    if (addrData?.addresses?.length && !selectedAddress) {
      const def = addrData.addresses.find((a: any) => a.isDefault) || addrData.addresses[0];
      setSelectedAddress(def._id);
    }
  }, [addrData]);

  const addAddress = useMutation({
    mutationFn: () => api.post('/customer/addresses', newAddress),
    onSuccess: (res) => {
      setSelectedAddress(res.data.address._id);
      setShowAddressForm(false);
      refetch();
      toast.success('📍 Address saved');
    },
  });

  const placeOrder = useMutation({
    mutationFn: () => {
      const addr = addrData?.addresses?.find((a: any) => a._id === selectedAddress);
      const pm = paymentMethod === 'Razorpay' ? 'razorpay' : 'cod';
      return api.post('/orders', { addressId: selectedAddress, address: addr, paymentMethod: pm, couponCode });
    },
    onSuccess: (res) => {
      dispatch(clearCartState());
      if (res.data.razorpayOrder) {
        setDummyOrderData(res.data);
        setDummyPayStep('select');
        setShowDummyRazorpay(true);
      } else {
        toast.success('🚀 Order successfully placed!');
        router.push('/customer/orders');
      }
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Order failed'),
  });

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const gstTax = Math.round(subtotal * 0.18);
  const shipping = subtotal > 1500 || subtotal === 0 ? 0 : 150;
  const total = Math.max(0, subtotal + gstTax + shipping - discount);
  const pointsAccrued = Math.round(total * 0.05);

  const handleDummyPay = async () => {
    setDummyPayStep('processing');
    await new Promise(r => setTimeout(r, 2000));
    await api.post('/orders/verify-razorpay', {
      razorpay_order_id: dummyOrderData.razorpayOrder.id,
      razorpay_payment_id: 'pay_dummy_' + Date.now(),
      razorpay_signature: '',
      dummy: true,
    });
    setDummyPayStep('done');
    await new Promise(r => setTimeout(r, 1200));
    setShowDummyRazorpay(false);
    toast.success('🚀 Payment successful! Order placed.');
    router.push('/customer/orders');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <h3 className="text-xl font-bold tracking-tight uppercase border-l-4 border-[#2874F0] pl-3">
        Logistics & Payment Gateway Setup
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">

          {/* Delivery Address */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border dark:border-slate-700 shadow-sm space-y-4">
            <h4 className="font-bold text-sm uppercase border-b pb-2 dark:border-slate-700">
              1. Confirm Delivery Logistics Address
            </h4>

            {showAddressForm && (
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded border dark:border-slate-700 grid grid-cols-2 gap-3 text-xs">
                {(['name', 'phone', 'street', 'city', 'state', 'postalCode'] as const).map(field => (
                  <input key={field} placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                    value={newAddress[field]}
                    onChange={e => setNewAddress(p => ({ ...p, [field]: e.target.value }))}
                    className="bg-white dark:bg-slate-800 p-2 rounded border dark:border-slate-600 focus:outline-none focus:ring-1 focus:ring-[#2874F0]" />
                ))}
                <button onClick={() => addAddress.mutate()} disabled={addAddress.isPending}
                  className="col-span-2 btn-primary text-xs py-2">
                  Save Address
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addrData?.addresses?.map((addr: any) => (
                <div key={addr._id} onClick={() => setSelectedAddress(addr._id)}
                  className={`p-4 rounded border-2 cursor-pointer transition-all ${selectedAddress === addr._id ? 'border-[#2874F0] bg-blue-50/10' : 'border-slate-200 dark:border-slate-700'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black uppercase text-[#2874F0]">{addr.type} (Default)</span>
                    {selectedAddress === addr._id && <span className="bg-[#2874F0] text-white rounded-full p-0.5"><Check size={10} /></span>}
                  </div>
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {addr.name} · {addr.phone}<br />
                    {addr.street}, {addr.city}, {addr.state} - {addr.postalCode}
                  </p>
                </div>
              ))}

              {!addrData?.addresses?.length && !showAddressForm && (
                <p className="text-xs text-slate-400 py-4 col-span-2 text-center">No addresses saved. Add one below.</p>
              )}
            </div>

            <button onClick={() => setShowAddressForm(!showAddressForm)}
              className="text-xs text-[#2874F0] font-bold hover:underline flex items-center gap-1">
              <Plus size={12} /> Add Custom Alternate Delivery Address
            </button>
          </div>

      {/* Payment Method */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border dark:border-slate-700 shadow-sm space-y-4">
            <h4 className="font-bold text-sm uppercase border-b pb-2 dark:border-slate-700">
              2. Select Secure Payment Gateway
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-bold">
              {PAYMENT_METHODS.map(method => (
                <button key={method} onClick={() => setPaymentMethod(method)}
                  className={`p-3 rounded border text-center transition-all ${
                    paymentMethod === method
                      ? 'bg-slate-900 dark:bg-[#2874F0] text-white border-transparent shadow'
                      : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600'
                  }`}>
                  {method === 'Razorpay' ? '💳 Razorpay' : '🚚 ' + method}
                </button>
              ))}
            </div>
            {paymentMethod === 'Razorpay' && (
              <p className="text-[10px] text-slate-400">Pay securely via UPI, Cards, Net Banking through Razorpay.</p>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border dark:border-slate-700 shadow-sm space-y-4 sticky top-24">
            <h4 className="font-bold text-sm uppercase border-b pb-2 dark:border-slate-700">Order Authorisation</h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Standard IGST (18%)</span><span>₹{gstTax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="text-emerald-500 font-bold">FREE</span> : `₹${shipping}`}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon discount</span><span>-₹{discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Loyalty points accrued (5%)</span>
                <span className="text-emerald-500 font-bold">+{pointsAccrued} Points</span>
              </div>
              <div className="border-t dark:border-slate-700 pt-2 flex justify-between items-center">
                <span className="font-bold uppercase text-sm">Total</span>
                <span className="text-2xl font-black text-[#2874F0]">₹{total.toLocaleString()}</span>
              </div>
            </div>

            {addrData?.addresses?.find((a: any) => a._id === selectedAddress) && (
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded text-xs space-y-1">
                <span className="font-bold text-[10px] text-slate-400 uppercase">Shipping Destination:</span>
                <p className="font-extrabold">
                  {(() => {
                    const addr = addrData.addresses.find((a: any) => a._id === selectedAddress);
                    return `${addr.street}, ${addr.city}, ${addr.state} - ${addr.postalCode}`;
                  })()}
                </p>
              </div>
            )}

            <button onClick={() => placeOrder.mutate()}
              disabled={!selectedAddress || placeOrder.isPending}
              className="w-full bg-[#FF6B35] hover:bg-[#ff5d24] disabled:opacity-50 text-white py-3 rounded font-black text-xs uppercase tracking-wider shadow flex items-center justify-center gap-2">
              {placeOrder.isPending ? <LoadingSpinner size="sm" /> : null}
              Authorize & Place Order
            </button>
          </div>
        </div>
      </div>
      {/* Dummy Razorpay Modal */}
      {showDummyRazorpay && dummyOrderData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            {/* Razorpay Header */}
            <div className="bg-[#2d6ab4] px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-white rounded px-2 py-0.5 text-[#2d6ab4] font-black text-sm">razorpay</div>
                <span className="text-white text-xs opacity-80">Secure Payment</span>
              </div>
              <button onClick={() => setShowDummyRazorpay(false)} className="text-white opacity-60 hover:opacity-100 text-lg leading-none">&times;</button>
            </div>

            <div className="px-5 py-4 bg-slate-50 flex justify-between items-center border-b">
              <div>
                <p className="text-xs text-slate-500">BUYZONE</p>
                <p className="font-black text-lg text-slate-800">₹{(dummyOrderData.razorpayOrder.amount / 100).toLocaleString()}</p>
              </div>
              <div className="text-right text-xs text-slate-400">
                <p>Order ID</p>
                <p className="font-mono text-[10px]">{dummyOrderData.razorpayOrder.id.slice(0, 20)}...</p>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {dummyPayStep === 'select' && (
                <>
                  <p className="text-xs font-bold text-slate-600 uppercase">Pay via UPI</p>
                  <div className="flex gap-2">
                    <input
                      value={dummyUpi}
                      onChange={e => setDummyUpi(e.target.value)}
                      placeholder="Enter UPI ID (e.g. name@upi)"
                      className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6ab4]"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {['GPay', 'PhonePe', 'Paytm'].map(app => (
                      <button key={app} onClick={() => setDummyUpi(app.toLowerCase() + '@okaxis')}
                        className="border rounded-lg p-2 text-xs font-bold text-slate-600 hover:border-[#2d6ab4] hover:text-[#2d6ab4] transition-colors">
                        {app}
                      </button>
                    ))}
                  </div>
                  <div className="border-t pt-3">
                    <p className="text-xs font-bold text-slate-600 uppercase mb-2">Or pay via Card / Net Banking</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <input placeholder="Card number" className="border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#2d6ab4]" />
                      <input placeholder="MM / YY" className="border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#2d6ab4]" />
                    </div>
                  </div>
                  <button onClick={handleDummyPay}
                    className="w-full bg-[#2d6ab4] hover:bg-blue-700 text-white font-black py-3 rounded-lg text-sm transition-colors">
                    Pay ₹{(dummyOrderData.razorpayOrder.amount / 100).toLocaleString()}
                  </button>
                </>
              )}
              {dummyPayStep === 'processing' && (
                <div className="text-center py-8 space-y-3">
                  <LoadingSpinner size="lg" />
                  <p className="text-sm font-bold text-slate-600">Processing Payment...</p>
                  <p className="text-xs text-slate-400">Please do not close this window</p>
                </div>
              )}
              {dummyPayStep === 'done' && (
                <div className="text-center py-8 space-y-3">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Check size={28} className="text-green-600" />
                  </div>
                  <p className="text-sm font-black text-green-600">Payment Successful!</p>
                  <p className="text-xs text-slate-400">Redirecting to your orders...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
