// src/components/Navbar.jsx
import React from 'react';
import { Store, ShoppingBag, Shield, LogOut } from 'lucide-react';

export default function Navbar({
  currentStore,
  currentRole,
  cashierName,
  userEmail,
  onToggleView,
  onLogout,
  onOpenAuth
}) {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-orange-100 shadow-xs px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Brand & Store Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-700 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-purple-500/20 font-black text-lg">
            SL
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-slate-800 text-sm sm:text-base leading-tight">
                {currentStore ? currentStore.name : "ShopLedger"}
              </h1>
              {currentStore && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700">
                  {currentStore.storeCode}
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
              {currentStore ? (
                <>
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{currentRole === 'admin' ? `Owner (${userEmail || 'Admin'})` : `Cashier: ${cashierName || 'Staff'}`}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-400 hidden xs:inline">{currentStore.category || 'Retail Store'}</span>
                </>
              ) : (
                <span>POS &amp; Inventory for Nigerian Stores</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {currentStore ? (
            <>
              {/* View Switcher: Admin vs Cashier */}
              {currentRole === 'admin' ? (
                <button
                  onClick={() => onToggleView('cashier')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-pink-500 hover:bg-pink-600 text-white shadow-xs transition active:scale-95"
                >
                  <ShoppingBag size={14} />
                  <span>Open Cashier POS</span>
                </button>
              ) : (
                <button
                  onClick={() => onToggleView('admin_request')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition active:scale-95"
                  title="Switch to Store Admin (requires Admin PIN)"
                >
                  <Shield size={14} />
                  <span>Admin Mode</span>
                </button>
              )}

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-rose-50 text-slate-500 hover:text-rose-600 font-semibold text-xs transition"
                title="Log Out & Return to Home"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('signin')}
                className="px-3.5 py-1.5 rounded-xl font-bold text-xs text-slate-700 hover:bg-slate-100 transition"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="px-4 py-2 rounded-full font-bold text-xs bg-gradient-to-r from-purple-700 to-pink-500 text-white shadow-md shadow-purple-500/20 hover:opacity-95 transition active:scale-95"
              >
                Open Store
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
