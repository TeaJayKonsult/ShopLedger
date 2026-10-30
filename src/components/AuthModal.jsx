// src/components/AuthModal.jsx
import React, { useState } from 'react';
import { ShoppingCart, ShieldCheck, UserPlus, LogIn, X, KeyRound, Mail, Lock, Sparkles } from 'lucide-react';
import {
  registerUserWithEmail,
  loginUserWithEmail,
  loginUserWithGoogle,
  verifyCashierLogin
} from '../services/storeService';

export default function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
  onCashierSuccess,
  initialMode = 'signin',
  initialStoreCode = '',
  initialPin = ''
}) {
  const [activeTab, setActiveTab] = useState(initialMode); // 'signin' | 'signup' | 'cashier'
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Email Auth State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Cashier Quick PIN State
  const [cashierCode, setCashierCode] = useState(initialStoreCode);
  const [cashierPin, setCashierPin] = useState(initialPin);

  if (!isOpen) return null;

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const user = await loginUserWithEmail(email, password);
      onAuthSuccess(user);
      onClose();
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setErrorMsg('Invalid email or password. Please try again.');
      } else {
        setErrorMsg(err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const user = await registerUserWithEmail(email, password);
      onAuthSuccess(user);
      onClose();
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('This email is already registered. Please sign in instead.');
      } else {
        setErrorMsg(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      const user = await loginUserWithGoogle();
      onAuthSuccess(user);
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Google sign-in was cancelled or encountered an error.');
    } finally {
      setLoading(false);
    }
  };

  const handleCashierSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await verifyCashierLogin(cashierCode, cashierPin);
      if (res.success) {
        onCashierSuccess({
          store: res.store,
          role: res.role,
          cashierName: res.cashier.name
        });
        onClose();
      } else {
        setErrorMsg(res.message);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to verify cashier login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-orange-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 text-white flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-lg font-black tracking-tight">Access ShopLedger</h2>
            <p className="text-xs text-purple-200">POS &amp; Inventory for Nigerian Retail Stores</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 p-1.5 gap-1 text-xs font-bold shrink-0">
          <button
            onClick={() => { setActiveTab('signin'); setErrorMsg(''); }}
            className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'signin' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn size={14} />
            <span>Owner Login</span>
          </button>
          <button
            onClick={() => { setActiveTab('signup'); setErrorMsg(''); }}
            className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'signup' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus size={14} />
            <span>Sign Up</span>
          </button>
          <button
            onClick={() => { setActiveTab('cashier'); setErrorMsg(''); }}
            className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'cashier' ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShoppingCart size={14} />
            <span>Cashier PIN</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold leading-relaxed">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* TAB 1: OWNER SIGN IN */}
          {activeTab === 'signin' && (
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@yourshop.com"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-sm focus:border-purple-600 outline-none transition"
                  />
                  <Mail className="absolute left-3.5 top-3.5 text-slate-400" size={17} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-sm focus:border-purple-600 outline-none transition"
                  />
                  <Lock className="absolute left-3.5 top-3.5 text-slate-400" size={17} />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-lg shadow-purple-600/25 hover:opacity-95 transition active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <span>Sign In to Store Dashboard</span>
                )}
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                <div className="relative flex justify-center text-[11px] uppercase"><span className="bg-white px-2 text-slate-400 font-bold">Or continue with</span></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full py-3 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-2 shadow-2xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google Account</span>
              </button>

              <div className="text-center text-xs text-slate-500 pt-2">
                Don't have a store account?{' '}
                <button
                  type="button"
                  onClick={() => { setActiveTab('signup'); setErrorMsg(''); }}
                  className="font-bold text-purple-700 hover:underline"
                >
                  Register here
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: OWNER SIGN UP */}
          {activeTab === 'signup' && (
            <form onSubmit={handleEmailSignUp} className="space-y-3.5">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-800 leading-relaxed">
                ✨ <strong>Step 1:</strong> Register your email. Next, you'll set your store business name and admin PIN!
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@yourshop.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-sm focus:border-purple-600 outline-none transition"
                  />
                  <Mail className="absolute left-3.5 top-3.5 text-slate-400" size={17} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password (Min 6 characters)</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-sm focus:border-purple-600 outline-none transition"
                  />
                  <Lock className="absolute left-3.5 top-3.5 text-slate-400" size={17} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Confirm Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-sm focus:border-purple-600 outline-none transition"
                  />
                  <Lock className="absolute left-3.5 top-3.5 text-slate-400" size={17} />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/25 hover:opacity-95 transition active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <span>Create Account &amp; Setup Store</span>
                )}
              </button>

              <div className="text-center text-xs text-slate-500 pt-1">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => { setActiveTab('signin'); setErrorMsg(''); }}
                  className="font-bold text-purple-700 hover:underline"
                >
                  Sign in here
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: CASHIER QUICK PIN LOGIN */}
          {activeTab === 'cashier' && (
            <form onSubmit={handleCashierSubmit} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-pink-50 border border-pink-100 text-xs text-pink-900 leading-relaxed">
                <strong>🛒 Cashier Quick Login:</strong> Cashiers do not need an email! Just enter your assigned <strong>Store Code</strong> and <strong>4-digit PIN</strong>.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Store Code</label>
                <input
                  type="text"
                  required
                  value={cashierCode}
                  onChange={(e) => setCashierCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SHOP-12"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-extrabold text-purple-800 uppercase tracking-wide focus:border-purple-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">4-Digit PIN</label>
                <div className="relative">
                  <input
                    type="password"
                    maxLength={4}
                    required
                    value={cashierPin}
                    onChange={(e) => setCashierPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xl font-black tracking-widest text-center text-slate-800 focus:border-pink-500 outline-none"
                  />
                  <KeyRound className="absolute right-4 top-3.5 text-slate-400" size={18} />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25 hover:opacity-95 transition active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <span>Access Cashier POS Register</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
