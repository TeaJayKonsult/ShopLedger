// src/components/LandingPage.jsx
import React from 'react';
import {
  Store, ShoppingCart, ShieldCheck, Zap, Smartphone, BarChart3,
  CheckCircle2, ArrowRight, Mail, Phone, MapPin, Users, HeartHandshake
} from 'lucide-react';

export default function LandingPage({ onOpenAuth }) {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FFF5F0] text-slate-800">
      {/* ==================== HERO SECTION ==================== */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6">
        {/* Soft background glow blobs */}
        <div className="absolute top-[-100px] right-[-100px] w-96 h-96 rounded-full bg-[#FF8FA3]/20 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-100px] left-[-100px] w-96 h-96 rounded-full bg-[#C8B6FF]/20 blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-purple-200 backdrop-blur-sm text-purple-800 text-xs font-bold tracking-wide mb-6 shadow-xs">
            <Zap size={14} className="text-purple-600" />
            <span>SMART POS &amp; INVENTORY FOR NIGERIAN STORES</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] mb-5">
            Empower Your Retail Business with{' '}
            <span className="bg-gradient-to-r from-purple-700 via-pink-600 to-rose-500 bg-clip-text text-transparent">
              ShopLedger
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8 font-medium leading-relaxed">
            Record cash and transfer sales, prevent out-of-stock, log generator and shop expenses, track net profits, and issue instant WhatsApp receipts. Works offline and on any phone.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14">
            <button
              onClick={() => onOpenAuth('signup')}
              className="w-full sm:w-auto px-8 py-4 rounded-full font-black text-sm bg-gradient-to-r from-purple-700 via-pink-600 to-rose-500 text-white shadow-xl shadow-purple-600/30 hover:opacity-95 transition active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Get Started — Create Store</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => onOpenAuth('cashier')}
              className="w-full sm:w-auto px-7 py-4 rounded-full font-bold text-sm bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition active:scale-95 flex items-center justify-center gap-2 shadow-xs"
            >
              <ShoppingCart size={16} className="text-pink-600" />
              <span>🛒 Cashier PIN Register</span>
            </button>
          </div>

          {/* Key Metrics / Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-3xl border border-orange-100 shadow-xs">
              <div className="text-2xl font-black text-purple-700">₦0</div>
              <div className="text-xs text-slate-500 font-semibold mt-0.5">Free Trial &amp; Quick Setup</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-3xl border border-orange-100 shadow-xs">
              <div className="text-2xl font-black text-emerald-600">100%</div>
              <div className="text-xs text-slate-500 font-semibold mt-0.5">Isolated Multi-Tenancy</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-3xl border border-orange-100 shadow-xs">
              <div className="text-2xl font-black text-pink-600">4-Digit</div>
              <div className="text-xs text-slate-500 font-semibold mt-0.5">Simple Cashier PINs</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-3xl border border-orange-100 shadow-xs">
              <div className="text-2xl font-black text-indigo-600">Offline</div>
              <div className="text-xs text-slate-500 font-semibold mt-0.5">Reliable on Any Network</div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FEATURES SECTION ==================== */}
      <section id="features" className="py-16 px-4 sm:px-6 bg-white border-y border-orange-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-black text-purple-700 uppercase tracking-widest bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
              Complete Retail Toolset
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              Everything Your Shop Needs to Grow
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Built specifically for provisions, electricals, supermarkets, pharmacies, and small traders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-3xl bg-[#FFF5F0]/60 border border-orange-100 shadow-xs hover:border-purple-200 transition">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 text-white flex items-center justify-center mb-4 shadow-md shadow-purple-600/20">
                <ShoppingCart size={22} />
              </div>
              <h3 className="font-black text-base text-slate-900 mb-2">Fast Touch POS Register</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Add products with one tap, calculate change accurately, accept Cash, Bank Transfer, or POS Card, and prevent inventory discrepancies.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-3xl bg-[#FFF5F0]/60 border border-orange-100 shadow-xs hover:border-pink-200 transition">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center mb-4 shadow-md shadow-pink-500/20">
                <Store size={22} />
              </div>
              <h3 className="font-black text-base text-slate-900 mb-2">Automatic Stock &amp; Low Alerts</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Stocks decrease automatically with every checkout. Instant low-stock warning banners notify you before you run out of fast-selling goods.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-3xl bg-[#FFF5F0]/60 border border-orange-100 shadow-xs hover:border-emerald-200 transition">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center mb-4 shadow-md shadow-emerald-600/20">
                <Smartphone size={22} />
              </div>
              <h3 className="font-black text-base text-slate-900 mb-2">Instant WhatsApp Receipts</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Send professional digital receipts directly to your customers' WhatsApp with 1 tap, reducing paper roll costs and building customer loyalty.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-3xl bg-[#FFF5F0]/60 border border-orange-100 shadow-xs hover:border-amber-200 transition">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center mb-4 shadow-md shadow-amber-500/20">
                <BarChart3 size={22} />
              </div>
              <h3 className="font-black text-base text-slate-900 mb-2">Real Net Profit Tracking</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Know your real profit! Automatically calculates gross profit per sale, logs generator diesel, shop rent, logistics, and reports your true Net Profit.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-3xl bg-[#FFF5F0]/60 border border-orange-100 shadow-xs hover:border-purple-200 transition">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center mb-4 shadow-md shadow-indigo-600/20">
                <Users size={22} />
              </div>
              <h3 className="font-black text-base text-slate-900 mb-2">Simple Cashier PINs</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                No passwords or email confirmations for clerks. Give your cashiers a 4-digit PIN. Cashiers can only make sales and cannot view profits or expenses.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-3xl bg-[#FFF5F0]/60 border border-orange-100 shadow-xs hover:border-rose-200 transition">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-red-600 text-white flex items-center justify-center mb-4 shadow-md shadow-rose-600/20">
                <ShieldCheck size={22} />
              </div>
              <h3 className="font-black text-base text-slate-900 mb-2">100% Isolated Multi-Tenancy</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your business data is strictly private. Store A can never see Store B's stocks, sales, or prices. Secured with Firestore zero-trust rules.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== PRICING SECTION ==================== */}
      <section id="pricing" className="py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-black text-pink-600 uppercase tracking-widest bg-pink-50 px-3 py-1 rounded-full border border-pink-100">
              Simple &amp; Transparent
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              Affordable Plans for Every Shop
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Start free today. Upgrade only when your retail store grows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free Starter */}
            <div className="bg-white p-7 rounded-3xl border border-orange-100 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">Starter Plan</span>
                <div className="text-3xl font-black text-slate-900 mt-1">₦0</div>
                <p className="text-xs text-slate-500 mt-1 mb-5">Free for single shop owners starting out.</p>

                <div className="space-y-2.5 text-xs text-slate-600 font-medium">
                  <div className="flex items-center gap-2"><CheckCircle2 size={15} className="text-emerald-500" /> Up to 200 Products</div>
                  <div className="flex items-center gap-2"><CheckCircle2 size={15} className="text-emerald-500" /> Unlimited POS Sales</div>
                  <div className="flex items-center gap-2"><CheckCircle2 size={15} className="text-emerald-500" /> 1 Cashier PIN</div>
                  <div className="flex items-center gap-2"><CheckCircle2 size={15} className="text-emerald-500" /> WhatsApp Receipts</div>
                  <div className="flex items-center gap-2"><CheckCircle2 size={15} className="text-emerald-500" /> Works Offline (PWA)</div>
                </div>
              </div>

              <button
                onClick={() => onOpenAuth('signup')}
                className="mt-6 w-full py-3 rounded-2xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 transition active:scale-95"
              >
                Start Free Account
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-gradient-to-b from-purple-900 to-indigo-900 text-white p-7 rounded-3xl shadow-xl flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-pink-500 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                Most Popular
              </div>

              <div>
                <span className="text-xs font-bold text-purple-300 uppercase">Growth Store Pro</span>
                <div className="text-3xl font-black text-white mt-1">₦3,500 <span className="text-xs font-normal text-purple-300">/ month</span></div>
                <p className="text-xs text-purple-200 mt-1 mb-5">For busy supermarkets, electrical &amp; pharmacy stores.</p>

                <div className="space-y-2.5 text-xs text-purple-100 font-medium">
                  <div className="flex items-center gap-2"><CheckCircle2 size={15} className="text-pink-400" /> Unlimited Products &amp; Stock</div>
                  <div className="flex items-center gap-2"><CheckCircle2 size={15} className="text-pink-400" /> Multiple Cashier Registers</div>
                  <div className="flex items-center gap-2"><CheckCircle2 size={15} className="text-pink-400" /> Operating Expense Tracking (Fuel, Rent)</div>
                  <div className="flex items-center gap-2"><CheckCircle2 size={15} className="text-pink-400" /> Automated Net Profit Reports</div>
                  <div className="flex items-center gap-2"><CheckCircle2 size={15} className="text-pink-400" /> CSV Excel Spreadsheet Exports</div>
                  <div className="flex items-center gap-2"><CheckCircle2 size={15} className="text-pink-400" /> Priority WhatsApp Support</div>
                </div>
              </div>

              <button
                onClick={() => onOpenAuth('signup')}
                className="mt-6 w-full py-3 rounded-2xl font-extrabold text-xs bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30 hover:opacity-95 transition active:scale-95"
              >
                Register &amp; Claim 14-Day Pro Trial
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== ABOUT & CONTACT SECTION ==================== */}
      <section id="about" className="py-16 px-4 sm:px-6 bg-white border-t border-orange-100">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold mb-3">
              <HeartHandshake size={14} />
              <span>ABOUT TEAJAY KONSULT LTD</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-4">
              Built for Nigerian Merchants, by Nigerian Software Engineers
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
              <strong>TeaJay Konsult Ltd</strong> is a technology and business solutions company based in Lagos, Nigeria. We understand the daily realities of Nigerian businesses: erratic power, generator fuel costs, fluctuating internet connectivity, and the need for simple bookkeeping without complicated enterprise software.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              ShopLedger was created to give every local trader, supermarket, pharmacy, and boutique the same digital precision and profit analytics enjoyed by multinational stores—right on their mobile phone.
            </p>
          </div>

          <div id="contact" className="bg-[#FFF5F0] p-6 sm:p-8 rounded-3xl border border-orange-200 shadow-sm space-y-4">
            <h3 className="font-black text-base text-slate-900">Get in Touch with Our Team</h3>
            <p className="text-xs text-slate-500">Need onboarding assistance or have custom feature requests for your store?</p>

            <div className="space-y-3 pt-2 text-xs font-medium text-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Mail size={16} />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Email Address</div>
                  <a href="mailto:teajaykonsult@gmail.com" className="font-bold text-purple-700 hover:underline">
                    teajaykonsult@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Phone size={16} />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Direct Phone &amp; WhatsApp</div>
                  <a href="tel:+2349068290856" className="font-bold text-emerald-700 hover:underline">
                    +234 906 829 0856
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center">
                  <MapPin size={16} />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Location</div>
                  <span className="font-bold text-slate-800">Lagos, Nigeria</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onOpenAuth('signup')}
              className="mt-3 w-full py-3 rounded-2xl font-black text-xs bg-purple-700 hover:bg-purple-800 text-white shadow-md shadow-purple-700/20 transition active:scale-95"
            >
              Open Your Store Now
            </button>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="py-10 px-4 sm:px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center font-black text-base shadow-sm">
              SL
            </div>
            <div>
              <div className="font-black text-base tracking-tight">ShopLedger</div>
              <div className="text-[11px] text-slate-400">POS &amp; Inventory for Nigerian Retail Stores</div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-400 font-medium">
            <button onClick={() => scrollToSection('features')} className="hover:text-white transition">Features</button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-white transition">Pricing</button>
            <button onClick={() => scrollToSection('about')} className="hover:text-white transition">About Us</button>
            <button onClick={() => scrollToSection('contact')} className="hover:text-white transition">Contact</button>
          </div>

          <div className="text-xs text-slate-500">
            © 2026 TeaJay Konsult Ltd. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
