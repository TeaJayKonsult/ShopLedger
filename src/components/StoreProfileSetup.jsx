// src/components/StoreProfileSetup.jsx
import React, { useState } from 'react';
import { Store, ShieldCheck, Phone, MapPin, KeyRound, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { createStoreProfile } from '../services/storeService';

export default function StoreProfileSetup({ user, onProfileComplete, onLogout }) {
  const [storeName, setStoreName] = useState('');
  const [category, setCategory] = useState('Provisions & Groceries');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [adminPin, setAdminPin] = useState('1234');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Live preview store code prefix
  const previewCode = (storeName.replace(/[^a-zA-Z]/g, '').slice(0, 4) || 'SHOP').toUpperCase() + '-XX';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!storeName.trim()) {
      setErrorMsg('Please enter your business or store name.');
      return;
    }
    if (!adminPin || adminPin.length !== 4) {
      setErrorMsg('Please enter a 4-digit Store Admin PIN.');
      return;
    }

    setLoading(true);
    try {
      const newStore = await createStoreProfile({
        ownerId: user.uid,
        ownerEmail: user.email,
        name: storeName.trim(),
        category,
        phone,
        address,
        adminPin
      });
      onProfileComplete(newStore);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to setup store profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl border border-orange-100 overflow-hidden">
        {/* Top Gradient Banner */}
        <div className="bg-gradient-to-r from-purple-800 via-pink-600 to-rose-500 text-white p-6 sm:p-8 relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-[11px] font-black uppercase tracking-wider mb-2">
            <Sparkles size={13} />
            <span>Step 2 of 2: Company Profile Setup</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Set Up Your Store Profile
          </h1>
          <p className="text-xs sm:text-sm text-purple-100 mt-1 font-medium">
            Account created for <span className="underline font-bold">{user?.email}</span>. Configure your store details to launch your POS &amp; Inventory dashboard.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Business / Store Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Store / Business Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g. Mama Nkechi Provisions or Emeka Electronics"
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-800 focus:border-purple-600 focus:ring-2 focus:ring-purple-100 outline-none transition"
              />
              <Store className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              This will appear on all your digital customer WhatsApp receipts and reports.
            </p>
          </div>

          {/* Business Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Store Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-700 focus:border-purple-600 focus:ring-2 focus:ring-purple-100 outline-none bg-white transition"
            >
              <option value="Provisions & Groceries">🥫 Provisions &amp; Groceries</option>
              <option value="Electricals & Electronics">⚡ Electricals &amp; Electronics</option>
              <option value="Pharmacy & Patent Medicine">💊 Pharmacy &amp; Patent Medicine</option>
              <option value="Supermarket & Minimart">🛒 Supermarket &amp; Minimart</option>
              <option value="Boutique & Fashion">👗 Boutique &amp; Fashion</option>
              <option value="Phone & Computer Accessories">📱 Phone &amp; Computer Accessories</option>
              <option value="Building Materials & Hardware">🧱 Building Materials &amp; Hardware</option>
              <option value="Cosmetics & Beauty">💄 Cosmetics &amp; Beauty</option>
              <option value="Automobile Spare Parts">🚗 Automobile Spare Parts</option>
              <option value="Restaurant & Fast Food">🍲 Restaurant &amp; Fast Food</option>
              <option value="Other Retail">🏪 Other Retail Business</option>
            </select>
          </div>

          {/* Phone and Admin PIN in Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Official Phone / WhatsApp <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08012345678"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-800 focus:border-purple-600 focus:ring-2 focus:ring-purple-100 outline-none transition"
                />
                <Phone className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                4-Digit Admin PIN <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  maxLength={4}
                  required
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="1234"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-base font-black text-center tracking-widest text-slate-800 focus:border-purple-600 focus:ring-2 focus:ring-purple-100 outline-none transition"
                />
                <KeyRound className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 bg-purple-50 p-2.5 rounded-xl border border-purple-100">
            🔒 <strong>Admin PIN:</strong> Used to access financial profit reports, edit stock prices, and switch from Cashier POS to Admin mode.
          </p>

          {/* Physical Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Store Address / Location
            </label>
            <div className="relative">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Shop 4B, Alaba Market, Ojo, Lagos"
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-800 focus:border-purple-600 focus:ring-2 focus:ring-purple-100 outline-none transition"
              />
              <MapPin className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
            </div>
          </div>

          {/* Live Store Code Badge Preview */}
          <div className="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-200/80 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase text-orange-800">Your Store Code (Preview)</div>
              <div className="text-xs text-slate-600 mt-0.5">Your cashiers will use this code to log in</div>
            </div>
            <div className="px-3 py-1 rounded-xl bg-orange-200 text-orange-950 font-black text-xs tracking-wider">
              {previewCode}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl font-black text-sm bg-gradient-to-r from-purple-700 via-pink-600 to-rose-500 text-white shadow-xl shadow-purple-600/30 hover:opacity-95 transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Configuring Store Database...</span>
              </span>
            ) : (
              <>
                <span>Complete Setup &amp; Launch Dashboard</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onLogout}
              className="text-xs font-semibold text-slate-400 hover:text-rose-600 transition"
            >
              Sign out and return to landing page
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
