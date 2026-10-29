// src/App.jsx
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import AdminDashboard from './components/AdminDashboard';
import CashierPOS from './components/CashierPOS';
import AuthModal from './components/AuthModal';
import { getStoreById, getStoreByCode, verifyCashierLogin, DEMO_STORES } from './services/storeService';

export default function App() {
  const [currentStore, setCurrentStore] = useState(null);
  const [currentRole, setCurrentRole] = useState('admin'); // 'admin' or 'cashier'
  const [cashierName, setCashierName] = useState('Store Owner');
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'admin' | 'cashier'
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // URL query params for cashier direct link
  const [urlCode, setUrlCode] = useState('');
  const [urlPin, setUrlPin] = useState('');

  useEffect(() => {
    // 1. Check URL parameters for direct WhatsApp invite link (e.g. ?code=EMEKA-10&pin=1111)
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const pin = params.get('pin');

    if (code && pin) {
      setUrlCode(code);
      setUrlPin(pin);
      // Auto-authenticate cashier with valid code and PIN
      const res = verifyCashierLogin(code, pin);
      if (res.success) {
        setCurrentStore(res.store);
        setCurrentRole('cashier');
        setCashierName(res.cashier.name);
        setCurrentView('cashier');
        return;
      } else {
        // Open modal with prefilled data
        setIsAuthModalOpen(true);
      }
    } else if (code) {
      setUrlCode(code);
      setIsAuthModalOpen(true);
    }

    // 2. Default initial state: load Emeka Electronics demo store so user immediately sees real data!
    if (!currentStore) {
      const defaultStore = DEMO_STORES[0]; // Emeka Electronics
      setCurrentStore(defaultStore);
      setCurrentRole('admin');
      setCashierName('Owner');
      setCurrentView('admin');
    }
  }, []);

  const handleLoginSuccess = ({ store, role, cashierName }) => {
    setCurrentStore(store);
    setCurrentRole(role);
    setCashierName(cashierName || (role === 'admin' ? 'Store Owner' : 'Cashier'));
    setCurrentView(role === 'admin' ? 'admin' : 'cashier');
  };

  const handleSwitchStore = (storeId) => {
    const store = getStoreById(storeId);
    if (store) {
      setCurrentStore(store);
      setCurrentRole('admin');
      setCashierName('Store Owner');
      setCurrentView('admin');
    }
  };

  const handleToggleView = (requestedView) => {
    if (requestedView === 'admin_request') {
      // Switching from Cashier to Admin -> will prompt PIN inside CashierPOS
      setCurrentView('admin');
      setCurrentRole('admin');
    } else {
      setCurrentView(requestedView);
    }
  };

  const handleLogout = () => {
    setCurrentStore(null);
    setCurrentView('landing');
  };

  return (
    <div className="min-h-screen bg-[#FFF5F0]/60 font-sans text-slate-800">
      {/* Universal Top Navbar */}
      <Navbar
        currentStore={currentStore}
        currentRole={currentRole}
        cashierName={cashierName}
        onSwitchStore={handleSwitchStore}
        onToggleView={handleToggleView}
        onLogout={handleLogout}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main>
        {currentView === 'landing' || !currentStore ? (
          <LandingPage
            onSelectStore={(store) => {
              setCurrentStore(store);
              setCurrentRole('admin');
              setCashierName('Store Owner');
              setCurrentView('admin');
            }}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        ) : currentView === 'cashier' ? (
          <CashierPOS
            store={currentStore}
            cashierName={cashierName}
            onSwitchToAdmin={() => {
              setCurrentRole('admin');
              setCurrentView('admin');
            }}
            onBackToLanding={() => setCurrentView('landing')}
          />
        ) : (
          <AdminDashboard
            store={currentStore}
            onLaunchPOS={() => setCurrentView('cashier')}
            onSwitchStore={handleSwitchStore}
          />
        )}
      </main>

      {/* Auth / Store Selection Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        initialStoreCode={urlCode}
        initialPin={urlPin}
      />
    </div>
  );
}
