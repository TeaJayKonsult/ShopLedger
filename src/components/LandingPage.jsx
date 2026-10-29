// src/components/LandingPage.jsx
import React from 'react';
import { ShoppingBag, Users, Zap, ShieldCheck, ArrowRight, Smartphone, Store, BarChart2 } from 'lucide-react';
import { DEMO_STORES } from '../services/storeService';

export default function LandingPage({ onSelectStore, onOpenAuth }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF5F0] via-white to-[#F0E6FF] text-slate-800">
      {/* Hero Section */}
      <section className="px-4 pt-12 pb-16 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 border border-purple-200 text-purple-800 text-xs font-black tracking-wide mb-6">
          <Zap size={14} className="text-purple-600" />
          <span>BUILT FOR NIGERIAN RETAIL BUSINESSES</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] mb-5">
          POS &amp; Inventory Ledger for{' '}
          <span className="bg-gradient-to-r from-purple-700 via-pink-600 to-rose-500 bg-clip-text text-transparent">
            Small Stores in Nigeria
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto mb-8 font-medium leading-relaxed">
          Record cash and transfer sales, prevent out-of-stock, track profits, issue instant WhatsApp receipts, and manage cashiers with 4-digit PINs. Works seamlessly offline.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
          <button
            onClick={() => onOpenAuth('new_store')}
            className="w-full sm:w-auto px-7 py-3.5 rounded-full font-extrabold text-sm bg-gradient-to-r from-purple-700 to-pink-500 text-white shadow-lg shadow-purple-600/30 hover:opacity-95 transition active:scale-95"
          >
            Create Your Free Store Account
          </button>
          <button
            onClick={() => onOpenAuth('cashier')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-full font-bold text-sm bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition active:scale-95 flex items-center justify-center gap-2"
          >
            <span>🛒 Cashier PIN Register</span>
          </button>
        </div>

        {/* DEMO MULTI-TENANT STORE SWITCHER BANNER */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-5 border border-orange-200 shadow-md max-w-3xl mx-auto text-left">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs font-black uppercase text-purple-700 tracking-wider">
                Independent Multi-Tenant Architecture
              </div>
              <p className="text-xs text-slate-500">
                Tap any store below to verify that stocks and data are 100% strictly isolated:
              </p>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Live Demo Stores
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {DEMO_STORES.map(s => (
              <button
                key={s.id}
                onClick={() => onSelectStore(s)}
                className="p-3 rounded-2xl border border-slate-200 hover:border-purple-400 hover:bg-purple-50/50 text-left transition group active:scale-95"
              >
                <div className="font-extrabold text-xs text-slate-800 group-hover:text-purple-900 truncate">
                  {s.name}
                </div>
                <div className="text-[11px] text-purple-600 font-bold mt-0.5">
                  Code: {s.storeCode}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 truncate">
                  {s.category}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="px-4 py-12 max-w-5xl mx-auto border-t border-orange-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-orange-100 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
              <Store size={20} />
            </div>
            <h3 className="font-extrabold text-sm text-slate-800 mb-1">Strict Multi-Tenancy</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Emeka Electronics will never see Mama Nkechi's provisions or stock. Every business is completely partitioned.
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-orange-100 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-pink-100 text-pink-700 flex items-center justify-center mb-3">
              <Users size={20} />
            </div>
            <h3 className="font-extrabold text-sm text-slate-800 mb-1">Simple Cashier PINs</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              No complex emails or passwords. Give your cashier a 4-digit PIN and share the link directly via WhatsApp!
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-orange-100 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
              <Smartphone size={20} />
            </div>
            <h3 className="font-extrabold text-sm text-slate-800 mb-1">WhatsApp Receipts</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Send professional digital receipts directly to your customers' WhatsApp with 1 tap, reducing paper costs.
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-orange-100 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
              <BarChart2 size={20} />
            </div>
            <h3 className="font-extrabold text-sm text-slate-800 mb-1">Net Profit Tracking</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Automatically calculates profit on every sale and deducts generator fuel, shop rent, and logistics expenses.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-200 text-center text-xs text-slate-500">
        © 2026 ShopLedger SaaS · Developed by TeaJay Konsult Ltd. · Built for Nigerian Retail Stores.
      </footer>
    </div>
  );
}
