// src/components/AuthModal.jsx
import React, { useState } from 'react';
import { ShoppingCart, ShieldCheck, PlusCircle, X, Sparkles, KeyRound } from 'lucide-react';
import { DEMO_STORES, registerNewStore, verifyCashierLogin } from '../services/storeService';

export default function AuthModal({ isOpen, onClose, onLoginSuccess, initialStoreCode = '', initialPin = '' }) {
  const [activeTab, setActiveTab] = useState(initialStoreCode ? 'cashier' : 'demo');
  const [errorMsg, setErrorMsg] = useState('');

  // Cashier Login State
  const [cashierCode, setCashierCode] = useState(initialStoreCode || 'EMEKA-10');
  const [cashierPin, setCashierPin] = useState(initialPin || '1111');

  // New Store Registration State
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreCategory, setNewStoreCategory] = useState('Provisions & Groceries');
  const [newStorePhone, setNewStorePhone] = useState('');
  const [newStorePin, setNewStorePin] = useState('1234');
  const [newStoreEmail, setNewStoreEmail] = useState('');

  if (!isOpen) return null;

  const handleCashierSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const res = verifyCashierLogin(cashierCode, cashierPin);
    if (res.success) {
      onLoginSuccess({
        store: res.store,
        role: 'cashier',
        cashierName: res.cashier.name
      });
      onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleDemoStoreSelect = (store) => {
    onLoginSuccess({
      store,
      role: 'admin',
      cashierName: 'Owner'
    });
    onClose();
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!newStoreName.trim()) {
      setErrorMsg('Store name is required.');
      return;
    }
    const store = registerNewStore({
      name: newStoreName,
      category: newStoreCategory,
      phone: newStorePhone,
      adminPin: newStorePin,
      ownerEmail: newStoreEmail
    });
    onLoginSuccess({
      store,
      role: 'admin',
      cashierName: 'Owner'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-orange-100 overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 text-white flex justify-between items-center">
          <div>
            <h2 className="text-lg font-black tracking-tight">Access ShopLedger SaaS</h2>
            <p className="text-xs text-purple-200">Independent multi-tenant retail platform</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 p-1.5 gap-1.5 text-xs font-bold">
          <button
            onClick={() => { setActiveTab('demo'); setErrorMsg(''); }}
            className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'demo' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles size={14} />
            <span>Switch Stores (Demo)</span>
          </button>
          <button
            onClick={() => { setActiveTab('cashier'); setErrorMsg(''); }}
            className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'cashier' ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShoppingCart size={14} />
            <span>Cashier PIN Login</span>
          </button>
          <button
            onClick={() => { setActiveTab('new_store'); setErrorMsg(''); }}
            className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'new_store' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <PlusCircle size={14} />
            <span>Create Store</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* TAB 1: DEMO MULTI-TENANT TEST STORES */}
          {activeTab === 'demo' && (
            <div>
              <div className="text-xs text-slate-500 mb-3 font-medium">
                Select an independent store tenant below to see strict product &amp; stock isolation in action:
              </div>
              <div className="space-y-2.5">
                {DEMO_STORES.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => handleDemoStoreSelect(s)}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition cursor-pointer flex items-center justify-between group active:scale-[0.99]"
                  >
                    <div>
                      <div className="font-extrabold text-sm text-slate-800 group-hover:text-purple-900">
                        {s.name}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md text-[10px]">
                          Code: {s.storeCode}
                        </span>
                        <span>{s.category}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        📦 Sample stock: {s.products.map(p => p.name.split(' ')[0]).slice(0, 3).join(', ')}...
                      </div>
                    </div>
                    <button className="text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-100 text-purple-800 group-hover:bg-purple-600 group-hover:text-white transition">
                      Open Store
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: CASHIER QUICK PIN LOGIN */}
          {activeTab === 'cashier' && (
            <form onSubmit={handleCashierSubmit} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-pink-50 border border-pink-100 text-xs text-pink-900 leading-relaxed">
                <strong>🛒 Cashier Quick Login:</strong> Cashiers do not need emails or passwords! Just type the <strong>Store Code</strong> and your <strong>4-digit PIN</strong>.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Store Code</label>
                <input
                  type="text"
                  required
                  value={cashierCode}
                  onChange={(e) => setCashierCode(e.target.value.toUpperCase())}
                  placeholder="e.g. EMEKA-10 or NKECHI-20"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-extrabold text-purple-800 uppercase tracking-wide focus:border-purple-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">4-Digit Cashier PIN</label>
                <div className="relative">
                  <input
                    type="password"
                    maxLength={4}
                    required
                    value={cashierPin}
                    onChange={(e) => setCashierPin(e.target.value)}
                    placeholder="••••"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xl font-bold tracking-widest text-center text-slate-800 focus:border-pink-500 outline-none"
                  />
                  <KeyRound className="absolute right-4 top-3.5 text-slate-400" size={18} />
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Demo PINs: Chidi for Emeka = <code className="font-bold text-purple-700">1111</code> | Blessing for Mama Nkechi = <code className="font-bold text-purple-700">2222</code>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25 hover:opacity-95 transition active:scale-[0.98]"
              >
                Access Cashier POS Register
              </button>
            </form>
          )}

          {/* TAB 3: REGISTER NEW INDEPENDENT STORE */}
          {activeTab === 'new_store' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Store Business Name *</label>
                <input
                  type="text"
                  required
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  placeholder="e.g. Alaba Electronics, Mama Joy Provisions"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-purple-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Store Category</label>
                <select
                  value={newStoreCategory}
                  onChange={(e) => setNewStoreCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-purple-600 outline-none bg-white font-medium text-slate-700"
                >
                  <option value="Provisions & Groceries">Provisions &amp; Groceries</option>
                  <option value="Electricals & Electronics">Electricals &amp; Electronics</option>
                  <option value="Pharmacy & Patent Medicine">Pharmacy &amp; Patent Medicine</option>
                  <option value="Boutique & Fashion">Boutique &amp; Fashion</option>
                  <option value="Building Materials">Building Materials</option>
                  <option value="Phone Accessories">Phone &amp; Computer Accessories</option>
                  <option value="Other Retail">Other Retail Business</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Store Phone</label>
                  <input
                    type="tel"
                    value={newStorePhone}
                    onChange={(e) => setNewStorePhone(e.target.value)}
                    placeholder="08012345678"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-purple-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Admin Unlock PIN *</label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    value={newStorePin}
                    onChange={(e) => setNewStorePin(e.target.value)}
                    placeholder="1234"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-center font-bold tracking-widest focus:border-purple-600 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/25 hover:opacity-95 transition active:scale-[0.98]"
              >
                Create Independent Store
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
