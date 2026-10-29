// src/components/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Package, Users, Receipt, DollarSign, BarChart3,
  Settings, Plus, Trash2, Share2, Copy, Download, AlertTriangle, ArrowRight,
  TrendingUp, CheckCircle, Sparkles
} from 'lucide-react';
import {
  getStoreProducts, saveStoreProduct, deleteStoreProduct, quickRestockProduct,
  getStoreCategories, addStoreCategory,
  getStoreCashiers, addCashierToStore, removeCashierFromStore,
  getStoreSales, getStoreExpenses, addStoreExpense, deleteStoreExpense,
  formatNaira, DEMO_STORES
} from '../services/storeService';

export default function AdminDashboard({ store, onLaunchPOS, onSwitchStore }) {
  const [activeTab, setActiveTab] = useState('overview');

  // Tenant State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cashiers, setCashiers] = useState([]);
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);

  // Modals & Forms
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [prodForm, setProdForm] = useState({ name: '', category: '', cost: '', price: '', stock: '', reorderLevel: '10' });

  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [expForm, setExpForm] = useState({ title: '', category: 'Generator/Fuel', amount: '', note: '' });

  // Cashier Invite Form
  const [cashierName, setCashierName] = useState('');
  const [cashierPin, setCashierPin] = useState('');
  const [cashierPhone, setCashierPhone] = useState('');
  const [inviteResult, setInviteResult] = useState(null);
  const [staffError, setStaffError] = useState('');

  // Reload data for this store
  const reloadData = () => {
    if (!store) return;
    setProducts(getStoreProducts(store.id));
    setCategories(getStoreCategories(store.id));
    setCashiers(getStoreCashiers(store.id));
    setSales(getStoreSales(store.id));
    setExpenses(getStoreExpenses(store.id));
  };

  useEffect(() => {
    reloadData();
    setInviteResult(null);
  }, [store?.id]);

  // Financial Calculations
  const todayStr = new Date().toISOString().slice(0, 10);
  const todaySalesList = sales.filter(s => s.date === todayStr);
  const todayRevenue = todaySalesList.reduce((sum, s) => sum + (s.amount || 0), 0);
  const todayProfit = todaySalesList.reduce((sum, s) => sum + (s.profit || 0), 0);

  const totalRevenue = sales.reduce((sum, s) => sum + (s.amount || 0), 0);
  const totalGrossProfit = sales.reduce((sum, s) => sum + (s.profit || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netProfit = totalGrossProfit - totalExpenses;

  const lowStockItems = products.filter(p => p.stock <= (p.reorderLevel || 10));

  // Product Actions
  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!prodForm.name.trim() || !prodForm.price) return;
    saveStoreProduct(store.id, prodForm);
    setProdForm({ name: '', category: '', cost: '', price: '', stock: '', reorderLevel: '10' });
    setShowAddProductModal(false);
    reloadData();
  };

  const handleDeleteProduct = (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    deleteStoreProduct(store.id, productId);
    reloadData();
  };

  const handleRestock = (productId) => {
    quickRestockProduct(store.id, productId, 10);
    reloadData();
  };

  // Staff / Cashier Actions
  const handleAddCashier = (e) => {
    e.preventDefault();
    setStaffError('');
    try {
      const res = addCashierToStore({
        storeId: store.id,
        name: cashierName,
        pin: cashierPin,
        phone: cashierPhone
      });
      setInviteResult(res);
      setCashierName('');
      setCashierPin('');
      setCashierPhone('');
      reloadData();
    } catch (err) {
      setStaffError(err.message);
    }
  };

  const handleRemoveCashier = (cashierId) => {
    if (!confirm('Remove this cashier? They will lose register access immediately.')) return;
    removeCashierFromStore(store.id, cashierId);
    reloadData();
  };

  const handleCopyStoreCode = () => {
    navigator.clipboard.writeText(store.storeCode);
    alert(`Store Code "${store.storeCode}" copied! Share it with your cashiers.`);
  };

  // Expense Actions
  const handleSaveExpense = (e) => {
    e.preventDefault();
    if (!expForm.title.trim() || !expForm.amount) return;
    addStoreExpense(store.id, expForm);
    setExpForm({ title: '', category: 'Generator/Fuel', amount: '', note: '' });
    setShowAddExpenseModal(false);
    reloadData();
  };

  // CSV Exports
  const handleExportSales = () => {
    if (sales.length === 0) return alert('No sales records to export.');
    let csv = "ReceiptNumber,Date,Amount,Profit,Cashier,PaymentMethod\n";
    sales.forEach(s => {
      csv += `"${s.receiptNumber}","${s.dateTimeStr}","${s.amount}","${s.profit}","${s.cashierName}","${s.paymentMethod}"\n`;
    });
    downloadCsvFile(csv, `${store.name.replace(/\s+/g, '_')}_sales.csv`);
  };

  const handleExportExpenses = () => {
    if (expenses.length === 0) return alert('No expenses records to export.');
    let csv = "Title,Category,Amount,Date,Note\n";
    expenses.forEach(e => {
      csv += `"${e.title}","${e.category}","${e.amount}","${e.date}","${e.note}"\n`;
    });
    downloadCsvFile(csv, `${store.name.replace(/\s+/g, '_')}_expenses.csv`);
  };

  const downloadCsvFile = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-5 pb-24 animate-fadeIn">
      {/* Multi-Tenancy Store Banner */}
      <div className="mb-4 bg-white rounded-3xl p-4 sm:p-5 border border-orange-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🏪</span>
            <h2 className="text-lg sm:text-xl font-black text-slate-800">{store.name}</h2>
            <span className="font-bold text-xs bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full">
              Code: {store.storeCode}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {store.category} &nbsp;·&nbsp; {store.address || 'Nigeria'} &nbsp;·&nbsp; Admin PIN: <code className="font-bold text-purple-700">{store.adminPin || '1234'}</code>
          </p>
        </div>

        {/* Quick actions in top banner */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onLaunchPOS}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-extrabold bg-gradient-to-r from-pink-500 to-rose-500 hover:opacity-95 text-white shadow-md shadow-pink-500/20 active:scale-95 transition"
          >
            <Receipt size={15} />
            <span>Open Cashier Register</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-5 no-scrollbar bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'inventory', label: `Inventory (${products.length})`, icon: Package },
          { id: 'staff', label: `Staff / Cashiers (${cashiers.length})`, icon: Users },
          { id: 'expenses', label: `Expenses (${expenses.length})`, icon: DollarSign },
          { id: 'reports', label: 'Financial Reports', icon: BarChart3 },
          { id: 'settings', label: 'Store Settings', icon: Settings }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl whitespace-nowrap transition ${
                isActive
                  ? 'bg-purple-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* TAB 1: OVERVIEW */}
      {/* ========================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-3xl border border-orange-100 shadow-sm">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Today's Sales</div>
              <div className="text-xl sm:text-2xl font-black text-slate-800 mt-1">{formatNaira(todayRevenue)}</div>
              <div className="text-[11px] text-purple-600 font-semibold mt-1">{todaySalesList.length} receipts issued</div>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-orange-100 shadow-sm">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Today's Gross Profit</div>
              <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">{formatNaira(todayProfit)}</div>
              <div className="text-[11px] text-slate-400 mt-1">Selling price - Cost</div>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-orange-100 shadow-sm">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Products in Stock</div>
              <div className="text-xl sm:text-2xl font-black text-purple-700 mt-1">{products.length}</div>
              <div className="text-[11px] text-slate-400 mt-1">{categories.length} categories</div>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-orange-100 shadow-sm">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Low Stock Alerts</div>
              <div className="text-xl sm:text-2xl font-black text-rose-600 mt-1">{lowStockItems.length}</div>
              <div className="text-[11px] text-rose-500 font-semibold mt-1">Needs reordering</div>
            </div>
          </div>

          {/* Low Stock Warning Card */}
          {lowStockItems.length > 0 && (
            <div className="p-4 rounded-3xl bg-rose-50 border border-rose-200">
              <div className="flex items-center gap-2 font-black text-rose-800 text-sm mb-2">
                <AlertTriangle size={16} />
                <span>Stock Reorder Warning for {store.name}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {lowStockItems.map(item => (
                  <div key={item.id} className="bg-white px-3 py-1.5 rounded-xl border border-rose-200 text-xs flex items-center gap-2 shadow-xs">
                    <span className="font-bold text-slate-800">{item.name}</span>
                    <span className="text-rose-600 font-black">({item.stock} left)</span>
                    <button
                      onClick={() => handleRestock(item.id)}
                      className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-700 hover:bg-purple-700 hover:text-white transition"
                    >
                      +10
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div
              onClick={() => setShowAddProductModal(true)}
              className="bg-white p-4 rounded-3xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/30 transition cursor-pointer flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-slate-800 text-sm">Add New Product</div>
                <div className="text-xs text-slate-400">Add stock item with cost and price</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <Plus size={16} />
              </div>
            </div>

            <div
              onClick={() => setActiveTab('staff')}
              className="bg-white p-4 rounded-3xl border border-slate-200 hover:border-pink-300 hover:bg-pink-50/30 transition cursor-pointer flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-slate-800 text-sm">Invite Cashier</div>
                <div className="text-xs text-slate-400">Add clerk with 4-digit PIN</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center font-bold">
                <Users size={16} />
              </div>
            </div>

            <div
              onClick={() => setShowAddExpenseModal(true)}
              className="bg-white p-4 rounded-3xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/30 transition cursor-pointer flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-slate-800 text-sm">Record Expense</div>
                <div className="text-xs text-slate-400">Fuel, rent, salaries, transport</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <DollarSign size={16} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: INVENTORY & STOCK */}
      {/* ========================================================= */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-orange-100 shadow-sm">
            <div>
              <h3 className="font-extrabold text-sm text-slate-800">
                Products in {store.name}
              </h3>
              <p className="text-xs text-slate-400">Only items for this business are shown here</p>
            </div>
            <button
              onClick={() => setShowAddProductModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold bg-purple-700 text-white shadow-sm hover:opacity-95 transition"
            >
              <Plus size={14} />
              <span>Add Product</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-orange-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {products.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No products added yet. Click "Add Product" to stock your store.
                </div>
              ) : (
                products.map(prod => {
                  const profitMargin = (prod.price || 0) - (prod.cost || 0);
                  const isLow = prod.stock <= (prod.reorderLevel || 10);

                  return (
                    <div key={prod.id} className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-slate-50/60 transition">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-800 truncate">{prod.name}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {prod.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs mt-1 text-slate-500 flex-wrap">
                          <span>Selling: <strong className="text-purple-700">{formatNaira(prod.price)}</strong></span>
                          <span>Cost: <strong>{formatNaira(prod.cost || 0)}</strong></span>
                          <span>Profit: <strong className="text-emerald-600">+{formatNaira(profitMargin)}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-1 sm:pt-0">
                        <div className="text-right">
                          <span className={`text-xs font-black px-2 py-1 rounded-lg ${
                            prod.stock <= 0 ? 'bg-rose-100 text-rose-700' :
                            isLow ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            Stock: {prod.stock}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleRestock(prod.id)}
                            className="px-2.5 py-1 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 transition"
                            title="Quick add 10 units"
                          >
                            +10
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-1.5 rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: STAFF & CASHIER INVITATION */}
      {/* ========================================================= */}
      {activeTab === 'staff' && (
        <div className="space-y-4">
          {/* Store Code Box */}
          <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-5 rounded-3xl shadow-md">
            <div className="text-xs font-bold text-purple-300 uppercase tracking-wide">
              Store Cashier Access Code
            </div>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="text-2xl sm:text-3xl font-black tracking-widest text-white">
                {store.storeCode}
              </span>
              <button
                onClick={handleCopyStoreCode}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/20 hover:bg-white/30 text-white transition active:scale-95"
              >
                <Copy size={13} />
                <span>Copy Code</span>
              </button>
            </div>
            <p className="text-xs text-purple-200 mt-2 max-w-lg leading-relaxed">
              Cashiers log in directly using this <strong>Store Code</strong> and their <strong>4-digit PIN</strong>. No passwords or emails needed!
            </p>
          </div>

          {/* Invite Cashier Form */}
          <div className="bg-white p-5 rounded-3xl border border-orange-100 shadow-sm">
            <h3 className="font-extrabold text-sm text-slate-800 mb-1">
              Add New Cashier to {store.name}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Cashiers can make sales and issue receipts, but cannot view profit margins, expenses, or settings.
            </p>

            {staffError && (
              <div className="mb-3 p-3 rounded-2xl bg-rose-50 text-rose-700 text-xs font-semibold">
                ⚠️ {staffError}
              </div>
            )}

            <form onSubmit={handleAddCashier} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Cashier Name *</label>
                <input
                  type="text"
                  required
                  value={cashierName}
                  onChange={(e) => setCashierName(e.target.value)}
                  placeholder="e.g. Chinedu, Blessing"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-purple-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Assign 4-Digit PIN *</label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  value={cashierPin}
                  onChange={(e) => setCashierPin(e.target.value)}
                  placeholder="••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-center font-bold tracking-widest focus:border-purple-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">WhatsApp Phone (Optional)</label>
                <input
                  type="tel"
                  value={cashierPhone}
                  onChange={(e) => setCashierPhone(e.target.value)}
                  placeholder="08012345678"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-purple-600 outline-none"
                />
              </div>

              <div className="sm:col-span-3 pt-1">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-extrabold bg-purple-700 hover:bg-purple-800 text-white shadow-md shadow-purple-700/20 transition active:scale-95"
                >
                  Create Cashier &amp; Generate WhatsApp Invite
                </button>
              </div>
            </form>

            {/* Generated WhatsApp Invitation Card */}
            {inviteResult && (
              <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 animate-fadeIn">
                <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm mb-1">
                  <CheckCircle size={16} />
                  <span>Cashier "{inviteResult.cashier.name}" Added Successfully!</span>
                </div>
                <div className="text-xs text-emerald-700 mb-3">
                  Store Code: <strong>{inviteResult.storeCode}</strong> &nbsp;·&nbsp; PIN: <strong>{inviteResult.pin}</strong>
                </div>
                <button
                  onClick={() => window.open(inviteResult.whatsappUrl, '_blank')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition active:scale-95"
                >
                  <Share2 size={14} />
                  <span>Send Login Credentials on WhatsApp</span>
                </button>
              </div>
            )}
          </div>

          {/* Active Cashiers List */}
          <div className="bg-white rounded-3xl border border-orange-100 shadow-sm p-4">
            <h4 className="font-extrabold text-sm text-slate-800 mb-3">Active Cashiers ({cashiers.length})</h4>
            <div className="divide-y divide-slate-100">
              {cashiers.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs">
                  No cashiers registered yet. Use the form above to add a cashier.
                </div>
              ) : (
                cashiers.map(c => (
                  <div key={c.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-extrabold text-sm text-slate-800">{c.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Access PIN: <code className="font-bold text-purple-700">{c.pin}</code> {c.phone ? `· ${c.phone}` : ''}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveCashier(c.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                      title="Remove cashier"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: EXPENSES */}
      {/* ========================================================= */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-orange-100 shadow-sm">
            <div>
              <h3 className="font-extrabold text-sm text-slate-800">
                Operating Expenses ({formatNaira(totalExpenses)})
              </h3>
              <p className="text-xs text-slate-400">Track generator fuel, shop rent, logistics, salaries</p>
            </div>
            <button
              onClick={() => setShowAddExpenseModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold bg-amber-600 text-white shadow-sm hover:opacity-95 transition"
            >
              <Plus size={14} />
              <span>Record Expense</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-orange-100 shadow-sm divide-y divide-slate-100">
            {expenses.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No expenses logged yet.
              </div>
            ) : (
              expenses.map(exp => (
                <div key={exp.id} className="p-3.5 flex items-center justify-between">
                  <div>
                    <div className="font-extrabold text-sm text-slate-800">{exp.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {exp.category} &nbsp;·&nbsp; {exp.date} {exp.note ? `· ${exp.note}` : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-sm text-rose-600">
                      -{formatNaira(exp.amount)}
                    </span>
                    <button
                      onClick={() => { deleteStoreExpense(store.id, exp.id); reloadData(); }}
                      className="p-1 text-slate-300 hover:text-rose-600 transition"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: FINANCIAL REPORTS & EXPORT */}
      {/* ========================================================= */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-3xl border border-orange-100 shadow-sm">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Gross Sales Revenue</div>
              <div className="text-xl font-black text-slate-800 mt-1">{formatNaira(totalRevenue)}</div>
              <div className="text-xs text-slate-400 mt-1">{sales.length} transactions total</div>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-orange-100 shadow-sm">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Total Expenses</div>
              <div className="text-xl font-black text-rose-600 mt-1">{formatNaira(totalExpenses)}</div>
              <div className="text-xs text-slate-400 mt-1">{expenses.length} expense items</div>
            </div>

            <div className="bg-emerald-50 p-4 rounded-3xl border border-emerald-200 shadow-sm">
              <div className="text-[11px] font-bold text-emerald-800 uppercase">Net Business Profit</div>
              <div className="text-2xl font-black text-emerald-700 mt-1">{formatNaira(netProfit)}</div>
              <div className="text-xs text-emerald-600 mt-1">Gross profit - expenses</div>
            </div>
          </div>

          {/* CSV Export Card */}
          <div className="bg-white p-5 rounded-3xl border border-orange-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h4 className="font-extrabold text-sm text-slate-800">Export Store Data (CSV)</h4>
              <p className="text-xs text-slate-400">Download formatted Excel/CSV spreadsheets for your accountants</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExportSales}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                <Download size={14} />
                <span>Sales CSV</span>
              </button>
              <button
                onClick={handleExportExpenses}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                <Download size={14} />
                <span>Expenses CSV</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: SETTINGS */}
      {/* ========================================================= */}
      {activeTab === 'settings' && (
        <div className="bg-white p-5 rounded-3xl border border-orange-100 shadow-sm max-w-xl space-y-4">
          <h3 className="font-extrabold text-sm text-slate-800">Store Profile &amp; Security</h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Store Name</label>
            <input
              type="text"
              readOnly
              value={store.name}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Store Code</label>
            <input
              type="text"
              readOnly
              value={store.storeCode}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 font-mono font-bold text-purple-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Admin Unlock PIN (4 digits)</label>
            <input
              type="text"
              readOnly
              value={store.adminPin || '1234'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 font-mono font-bold tracking-widest text-slate-700"
            />
            <p className="text-[11px] text-slate-400 mt-1">This PIN prevents cashiers from switching to the admin dashboard.</p>
          </div>
        </div>
      )}

      {/* ==================== ADD PRODUCT MODAL ==================== */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-5 border border-orange-100">
            <h3 className="font-black text-slate-800 text-base mb-1">Add Product to {store.name}</h3>
            <p className="text-xs text-slate-400 mb-4">Stock will only exist for this store tenant</p>

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={prodForm.name}
                  onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                  placeholder="e.g. 2.5mm Cable, Milo 500g"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  value={prodForm.category}
                  onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                  placeholder="e.g. Cables, Dairy, Lighting"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Cost Price (₦)</label>
                  <input
                    type="number"
                    value={prodForm.cost}
                    onChange={(e) => setProdForm({ ...prodForm, cost: e.target.value })}
                    placeholder="e.g. 1500"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Selling Price (₦) *</label>
                  <input
                    type="number"
                    required
                    value={prodForm.price}
                    onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                    placeholder="e.g. 2000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={prodForm.stock}
                    onChange={(e) => setProdForm({ ...prodForm, stock: e.target.value })}
                    placeholder="e.g. 25"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Reorder Level Alert</label>
                  <input
                    type="number"
                    value={prodForm.reorderLevel}
                    onChange={(e) => setProdForm({ ...prodForm, reorderLevel: e.target.value })}
                    placeholder="10"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-purple-700 text-white shadow-md shadow-purple-700/20"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== ADD EXPENSE MODAL ==================== */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-5 border border-orange-100">
            <h3 className="font-black text-slate-800 text-base mb-1">Record Expense</h3>
            <p className="text-xs text-slate-400 mb-4">{store.name}</p>

            <form onSubmit={handleSaveExpense} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={expForm.title}
                  onChange={(e) => setExpForm({ ...expForm, title: e.target.value })}
                  placeholder="e.g. Generator Fuel, Shop Rent"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={expForm.category}
                  onChange={(e) => setExpForm({ ...expForm, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none bg-white font-medium"
                >
                  <option value="Generator/Fuel">Generator / Fuel</option>
                  <option value="Shop Rent">Shop Rent</option>
                  <option value="Salaries">Staff Salaries</option>
                  <option value="Transport">Restock Transport</option>
                  <option value="Utilities">Electricity / Utilities</option>
                  <option value="Maintenance">Maintenance &amp; Repairs</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Amount (₦) *</label>
                <input
                  type="number"
                  required
                  value={expForm.amount}
                  onChange={(e) => setExpForm({ ...expForm, amount: e.target.value })}
                  placeholder="e.g. 5000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-purple-600"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-amber-600 text-white shadow-md shadow-amber-600/20"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
