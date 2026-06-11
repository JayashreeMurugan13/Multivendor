import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs py-10 border-t border-slate-800/80 mt-16">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3">
          <span className="text-xl font-black italic text-white">
            BUY<span className="text-yellow-400">ZONE</span>
          </span>
          <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
            Experience high-fidelity multi-vendor commercial retail logistics. Auditing and delivering secure, verified consumer dispatch parameters worldwide.
          </p>
          <div className="flex gap-3 pt-1">
            {['f', 't', 'in', 'yt'].map(s => (
              <button key={s} className="w-7 h-7 bg-slate-800 hover:bg-[#2874F0] rounded text-[10px] font-bold uppercase transition-colors">
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h5 className="font-bold text-white uppercase text-[10px] tracking-wider mb-3">Consumer Solutions</h5>
          <ul className="space-y-2">
            <li><Link href="/shop" className="hover:text-white block">Browse Marketplace Catalog</Link></li>
            <li><Link href="/customer/orders" className="hover:text-white block">Track Consignment Status</Link></li>
            <li><Link href="/customer/profile" className="hover:text-white block">Loyalty Point Accruals</Link></li>
            <li><Link href="/customer/wishlist" className="hover:text-white block">My Wishlist</Link></li>
            <li><Link href="/cart" className="hover:text-white block">Shopping Cart</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="font-bold text-white uppercase text-[10px] tracking-wider mb-3">Merchant Systems</h5>
          <ul className="space-y-2">
            <li>
              <Link href="/seller/register" className="hover:text-white font-black text-emerald-400 block">
                Apply for retail rights
              </Link>
            </li>
            <li><Link href="/seller/login" className="hover:text-white block">Merchant login</Link></li>
            <li><Link href="/seller/dashboard" className="hover:text-white block">Seller dashboard</Link></li>
            <li><a href="#" className="hover:text-white block">Tax compliance rules</a></li>
            <li><a href="#" className="hover:text-white block">Payment policy</a></li>
          </ul>
        </div>

        <div>
          <h5 className="font-bold text-white uppercase text-[10px] tracking-wider mb-3">Global Corporate HQ</h5>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            BUYZONE Enterprises Private Limited, Building-7, Cyber City Logistics Enclave, Outer Ring Road, Bengaluru, Karnataka, India - 560103.
          </p>
          <div className="mt-4 space-y-1.5">
            <h5 className="font-bold text-white uppercase text-[10px] tracking-wider">Company</h5>
            {['About Us', 'Careers', 'Press', 'Privacy Policy', 'Terms of Service'].map(item => (
              <div key={item}><a href="#" className="hover:text-white block">{item}</a></div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 text-center border-t border-slate-800/60 pt-6 mt-8 text-slate-600 text-[10px]">
        &copy; {new Date().getFullYear()} BUYZONE Multi-Vendor Platform, Inc. All rights reserved. Built with ❤️ in India.
      </div>
    </footer>
  );
}
