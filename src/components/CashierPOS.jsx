// src/components/CashierPOS.jsx
import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Plus, Minus, Trash2, CheckCircle2, Share2, Shield, AlertTriangle, ArrowLeft } from 'lucide-react';
import { getStoreProducts, getStoreCategories, recordStoreSale, formatNaira } from '../services/storeService';

export default function CashierPOS({ store, cashierName, onSwitchToAdmin, onBackToLanding }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  // Receipt Modal State
  const [receipt, setReceipt] = useState(null);

  // Admin PIN prompt modal
  const [showPinModal, setShowPinModal] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Reload products strictly for this store
  const refreshData = () => {
    if (!store) return;
    setProducts(getStoreProducts(store.id));
    setCategories(getStoreCategories(store.id));
  };

  useEffect(() => {
    refreshData();
    setCart([]);
  }, [store?.id]);

  // Cart actions
  const addToCart = (product) => {
    if (product.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(`Only ${product.stock} units available in stock.`);
          return prev;
        }
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === productId);
      if (!existing) return prev;
      const product = products.find(p => p.id === productId);
      const newQty = existing.quantity + delta;

      if (newQty <= 0) {
        return prev.filter(item => item.id !== productId);
      }
      if (product && newQty > product.stock) {
        alert(`Only ${product.stock} units available.`);
        return prev;
      }
      return prev.map(item =>
        item.id === productId ? { ...item, quantity: newQty } : item
      );
    });
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Checkout
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    const { sale, updatedProducts } = await recordStoreSale(store.id, {
      items: cart,
      cashierName,
      paymentMethod
    });

    setProducts(updatedProducts);
    setCart([]);
    setReceipt(sale);
  };

  // WhatsApp receipt share
  const handleShareWhatsApp = (sale) => {
    let msg = `*${store.name.toUpperCase()}*\n`;
    if (store.address) msg += `${store.address}\n`;
    if (store.phone) msg += `Tel: ${store.phone}\n`;
    msg += `--------------------------------\n`;
    msg += `Receipt #: ${sale.receiptNumber}\n`;
    msg += `Date: ${sale.dateTimeStr}\n`;
    msg += `Cashier: ${cashierName}\n`;
    msg += `Payment: ${sale.paymentMethod}\n`;
    msg += `--------------------------------\n`;
    sale.items.forEach(item => {
      msg += `${item.name} x${item.quantity} = ${formatNaira(item.lineTotal)}\n`;
    });
    msg += `--------------------------------\n`;
    msg += `*TOTAL: ${formatNaira(sale.amount)}*\n`;
    msg += `================================\n`;
    msg += `Thank you for your patronage! 🙏`;

    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleVerifyAdminPin = (e) => {
    e.preventDefault();
    if (adminPinInput === (store.adminPin || '1234')) {
      setShowPinModal(false);
      onSwitchToAdmin();
    } else {
      setPinError('Incorrect Admin PIN. Please check with the store owner.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-5 pb-24 animate-fadeIn">
      {/* Top Banner: Store Tenant Name & Role */}
      <div className="mb-4 bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-2xl p-4 shadow-md flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🛒</span>
            <h2 className="text-base sm:text-lg font-black">{store.name}</h2>
            <span className="text-xs bg-white/20 font-bold px-2 py-0.5 rounded-full text-purple-200">
              {store.storeCode}
            </span>
          </div>
          <div className="text-xs text-purple-200 mt-0.5">
            Cashier: <strong>{cashierName}</strong> &nbsp;·&nbsp; {store.address || 'Nigeria'}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setAdminPinInput(''); setPinError(''); setShowPinModal(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
            title="Switch to Store Admin with PIN"
          >
            <Shield size={14} />
            <span>Store Admin</span>
          </button>
        </div>
      </div>

      {/* Main POS Grid: Products (Left) and Cart (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Product Catalog */}
        <div className="lg:col-span-7 space-y-3.5">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${store.name} stock...`}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-sm outline-none focus:border-purple-600 shadow-sm font-medium"
            />
          </div>

          {/* Category Filter Chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === 'ALL'
                  ? 'bg-purple-700 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              All Items ({products.length})
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-purple-700 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Items List */}
          <div className="bg-white rounded-3xl border border-orange-100 shadow-sm p-3.5 divide-y divide-slate-100">
            {filteredProducts.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No products found matching "{searchQuery}".
              </div>
            ) : (
              filteredProducts.map(product => {
                const isOutOfStock = product.stock <= 0;
                const isLowStock = product.stock > 0 && product.stock <= (product.reorderLevel || 10);
                const cartQty = cart.find(c => c.id === product.id)?.quantity || 0;

                return (
                  <div
                    key={product.id}
                    onClick={() => !isOutOfStock && addToCart(product)}
                    className={`py-3 px-2 flex items-center justify-between gap-3 transition rounded-xl ${
                      isOutOfStock ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-purple-50/40 active:scale-[0.99]'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-extrabold text-sm text-slate-800 truncate">
                        {product.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <span className="font-black text-purple-700">
                          {formatNaira(product.price)}
                        </span>
                        <span className="text-slate-300">·</span>
                        {isOutOfStock ? (
                          <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-md text-[10px]">
                            OUT OF STOCK
                          </span>
                        ) : isLowStock ? (
                          <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md text-[10px]">
                            Only {product.stock} left
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">
                            Stock: {product.stock}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {cartQty > 0 && (
                        <span className="w-6 h-6 rounded-full bg-purple-700 text-white font-extrabold text-xs flex items-center justify-center">
                          {cartQty}
                        </span>
                      )}
                      <button
                        disabled={isOutOfStock}
                        className={`w-9 h-9 rounded-2xl flex items-center justify-center transition ${
                          isOutOfStock
                            ? 'bg-slate-100 text-slate-300'
                            : 'bg-orange-100 text-purple-700 hover:bg-purple-700 hover:text-white active:scale-90 shadow-sm'
                        }`}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Cart & Checkout */}
        <div className="lg:col-span-5 space-y-3.5">
          <div className="bg-white rounded-3xl border border-orange-100 shadow-md p-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="text-purple-700" size={18} />
                <h3 className="font-extrabold text-sm text-slate-800">
                  Cart ({totalItemCount} items)
                </h3>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs font-bold text-slate-400 hover:text-rose-600 transition"
                >
                  Clear Cart
                </button>
              )}
            </div>

            {/* Cart Items List */}
            {cart.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Tap items on the left to add to sale
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {cart.map(item => (
                  <div key={item.id} className="p-2.5 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-slate-800 truncate">{item.name}</div>
                      <div className="text-[11px] text-purple-700 font-bold">{formatNaira(item.price)} each</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold active:scale-90"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="font-black text-xs min-w-[20px] text-center text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold active:scale-90"
                      >
                        <Plus size={12} />
                      </button>
                      <span className="font-extrabold text-xs text-slate-800 min-w-[65px] text-right">
                        {formatNaira(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Payment Method Selector */}
            {cart.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="text-[11px] font-bold text-slate-500 uppercase mb-2">Payment Method</div>
                <div className="grid grid-cols-3 gap-1.5">
                  {['Cash', 'Transfer', 'POS Card'].map(method => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 rounded-xl text-xs font-bold transition ${
                        paymentMethod === method
                          ? 'bg-purple-700 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Total and Checkout Button */}
            <div className="mt-4 pt-3 border-t border-dashed border-slate-200">
              <div className="flex justify-between items-baseline mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase">Grand Total:</span>
                <span className="text-2xl font-black text-pink-600">{formatNaira(cartTotal)}</span>
              </div>

              <button
                disabled={cart.length === 0}
                onClick={handleCheckout}
                className="w-full py-3.5 rounded-2xl font-extrabold text-sm bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25 hover:opacity-95 transition active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Complete Sale &amp; Issue Receipt
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SUCCESS RECEIPT MODAL */}
      {receipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-5 border border-orange-100">
            <div className="text-center mb-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 size={28} />
              </div>
              <h3 className="font-black text-slate-800 text-base">{store.name}</h3>
              <p className="text-xs text-slate-500">Official Customer Receipt</p>
            </div>

            {/* Thermal Style Receipt Box */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-mono space-y-1 mb-4 leading-relaxed">
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Receipt: {receipt.receiptNumber}</span>
                <span>{receipt.paymentMethod}</span>
              </div>
              <div className="text-[11px] text-slate-500 pb-1 border-b border-dashed border-slate-300">
                {receipt.dateTimeStr}
              </div>

              <div className="py-1.5 space-y-1">
                {receipt.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="truncate pr-2">{item.name} x{item.quantity}</span>
                    <span className="font-bold">{formatNaira(item.lineTotal)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-dashed border-slate-300 flex justify-between font-bold text-sm">
                <span>TOTAL:</span>
                <span>{formatNaira(receipt.amount)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleShareWhatsApp(receipt)}
                className="w-full py-3 rounded-2xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition active:scale-95"
              >
                <Share2 size={16} />
                <span>Share Receipt on WhatsApp</span>
              </button>
              <button
                onClick={() => setReceipt(null)}
                className="w-full py-2.5 rounded-2xl font-bold text-xs text-slate-600 hover:bg-slate-100 transition"
              >
                Start Next Sale
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN PIN VERIFICATION MODAL */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-xs rounded-3xl shadow-2xl p-5 border border-orange-100 text-center">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-2">
              <Shield size={24} />
            </div>
            <h3 className="font-black text-slate-800 text-base mb-1">Enter Admin PIN</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter <strong>{store.name}</strong>'s 4-digit Store Admin PIN to unlock reports and inventory.
            </p>

            <form onSubmit={handleVerifyAdminPin} className="space-y-3">
              <input
                type="password"
                maxLength={4}
                required
                autoFocus
                value={adminPinInput}
                onChange={(e) => setAdminPinInput(e.target.value)}
                placeholder="••••"
                className="w-32 mx-auto py-2.5 text-center text-2xl font-bold tracking-widest border border-slate-300 rounded-2xl outline-none focus:border-purple-600"
              />
              {pinError && <div className="text-[11px] text-rose-600 font-semibold">{pinError}</div>}
              <div className="text-[11px] text-slate-400">Default PIN: <code className="font-bold text-purple-700">{store.adminPin || '1234'}</code></div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-purple-700 text-white shadow-md shadow-purple-700/20 hover:opacity-95 transition"
                >
                  Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
