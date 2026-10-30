// src/App.jsx
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import StoreProfileSetup from './components/StoreProfileSetup';
import AdminDashboard from './components/AdminDashboard';
import CashierPOS from './components/CashierPOS';
import AuthModal from './components/AuthModal';
import { auth, onAuthStateChanged } from './services/firebase';
import { getUserStore, verifyCashierLogin, logoutUser } from './services/storeService';

export default function App() {
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [currentStore, setCurrentStore] = useState(null);
  const [currentRole, setCurrentRole] = useState('admin'); // 'admin' | 'cashier'
  const [cashierName, setCashierName] = useState('Store Owner');
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'setup' | 'admin' | 'cashier'

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('signin'); // 'signin' | 'signup' | 'cashier'

  // URL query params for cashier invite link (e.g. ?code=ALABA-12&pin=1111)
  const [urlCode, setUrlCode] = useState('');
  const [urlPin, setUrlPin] = useState('');

  // 1. Listen to Firebase Auth state
  useEffect(() => {
    // Check URL parameters for cashier quick invite
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const pin = params.get('pin');

    if (code && pin) {
      setUrlCode(code);
      setUrlPin(pin);
      verifyCashierLogin(code, pin).then((res) => {
        if (res.success) {
          setCurrentStore(res.store);
          setCurrentRole('cashier');
          setCashierName(res.cashier.name);
          setCurrentView('cashier');
          localStorage.setItem('shopledger_cashier_session', JSON.stringify({
            store: res.store,
            role: 'cashier',
            cashierName: res.cashier.name
          }));
        } else {
          setAuthModalMode('cashier');
          setIsAuthModalOpen(true);
        }
      });
    } else if (code) {
      setUrlCode(code);
      setAuthModalMode('cashier');
      setIsAuthModalOpen(true);
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAuthUser(user);
        // Look up user's store
        try {
          const store = await getUserStore(user.uid);
          if (store) {
            setCurrentStore(store);
            setCurrentRole('admin');
            setCashierName('Store Owner');
            setCurrentView('admin');
          } else {
            // User registered with email, now load Store Profile Setup form!
            setCurrentStore(null);
            setCurrentView('setup');
          }
        } catch (err) {
          console.error("Error retrieving user store:", err);
          setCurrentView('setup');
        }
      } else {
        setAuthUser(null);
        // Check if there is an active Cashier session in localStorage
        const storedCashier = localStorage.getItem('shopledger_cashier_session');
        if (storedCashier) {
          try {
            const parsed = JSON.parse(storedCashier);
            if (parsed && parsed.store) {
              setCurrentStore(parsed.store);
              setCurrentRole('cashier');
              setCashierName(parsed.cashierName || 'Cashier');
              setCurrentView('cashier');
              setAuthLoading(false);
              return;
            }
          } catch (e) {}
        }
        setCurrentStore(null);
        setCurrentView('landing');
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleOpenAuth = (mode = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = async (user) => {
    setAuthUser(user);
    setAuthLoading(true);
    try {
      const store = await getUserStore(user.uid);
      if (store) {
        setCurrentStore(store);
        setCurrentRole('admin');
        setCashierName('Store Owner');
        setCurrentView('admin');
      } else {
        setCurrentStore(null);
        setCurrentView('setup');
      }
    } catch (err) {
      setCurrentView('setup');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleProfileComplete = (newStore) => {
    setCurrentStore(newStore);
    setCurrentRole('admin');
    setCashierName('Store Owner');
    setCurrentView('admin');
  };

  const handleCashierSuccess = ({ store, role, cashierName }) => {
    setCurrentStore(store);
    setCurrentRole(role);
    setCashierName(cashierName || 'Cashier');
    setCurrentView(role === 'admin' ? 'admin' : 'cashier');
    localStorage.setItem('shopledger_cashier_session', JSON.stringify({
      store,
      role,
      cashierName
    }));
  };

  const handleToggleView = (requestedView) => {
    if (requestedView === 'admin_request') {
      setCurrentView('admin');
      setCurrentRole('admin');
    } else {
      setCurrentView(requestedView);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentStore(null);
    setAuthUser(null);
    setCurrentView('landing');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FFF5F0] flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-700 to-pink-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-purple-600/30 animate-bounce">
          SL
        </div>
        <div className="text-sm font-bold text-slate-700">Loading ShopLedger SaaS...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF5F0]/60 font-sans text-slate-800">
      {/* Universal Top Navbar */}
      <Navbar
        currentStore={currentStore}
        currentRole={currentRole}
        cashierName={cashierName}
        userEmail={authUser?.email}
        onToggleView={handleToggleView}
        onLogout={handleLogout}
        onOpenAuth={handleOpenAuth}
      />

      {/* Main Content Area */}
      <main>
        {currentView === 'landing' || (!currentStore && currentView !== 'setup') ? (
          <LandingPage
            onOpenAuth={handleOpenAuth}
          />
        ) : currentView === 'setup' && authUser ? (
          <StoreProfileSetup
            user={authUser}
            onProfileComplete={handleProfileComplete}
            onLogout={handleLogout}
          />
        ) : currentView === 'cashier' && currentStore ? (
          <CashierPOS
            store={currentStore}
            cashierName={cashierName}
            onSwitchToAdmin={() => {
              setCurrentRole('admin');
              setCurrentView('admin');
            }}
            onBackToLanding={() => setCurrentView('landing')}
          />
        ) : currentStore ? (
          <AdminDashboard
            store={currentStore}
            onLaunchPOS={() => setCurrentView('cashier')}
            onSwitchStore={() => {}}
          />
        ) : (
          <LandingPage
            onOpenAuth={handleOpenAuth}
          />
        )}
      </main>

      {/* Auth Modal (Owner Email Sign-In / Sign-Up / Cashier PIN) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        onCashierSuccess={handleCashierSuccess}
        initialMode={authModalMode}
        initialStoreCode={urlCode}
        initialPin={urlPin}
      />
    </div>
  );
}
