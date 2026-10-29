// src/services/storeService.js
// ShopLedger Multi-Tenant SaaS Engine with Offline-First Persistence & Firebase Sync

// Pre-seeded independent demo stores illustrating the multi-tenancy model
export const DEMO_STORES = [
  {
    id: "store_emeka_elec",
    name: "Emeka Electronics & Electricals",
    category: "Electrical Equipment",
    storeCode: "EMEKA-10",
    phone: "08031234567",
    address: "Alaba International Market, Lagos",
    adminPin: "1234",
    ownerEmail: "emeka@gmail.com",
    products: [
      { id: "p_ee_1", name: "2.5mm Single Core Copper Cable (100m)", category: "Cables", cost: 18500, price: 23000, stock: 15, reorderLevel: 5 },
      { id: "p_ee_2", name: "18W Cool White LED Ceiling Bulb", category: "Lighting", cost: 1100, price: 1700, stock: 40, reorderLevel: 10 },
      { id: "p_ee_3", name: "13A Double Switch Socket (Schneider)", category: "Switches & Sockets", cost: 2400, price: 3500, stock: 25, reorderLevel: 8 },
      { id: "p_ee_4", name: "6-Way Extension Socket (Heavy Duty)", category: "Accessories", cost: 4200, price: 6000, stock: 12, reorderLevel: 4 },
      { id: "p_ee_5", name: "40A Changeover Switch Box", category: "Power & Distribution", cost: 14000, price: 18500, stock: 4, reorderLevel: 5 } // Low stock!
    ],
    categories: ["Cables", "Lighting", "Switches & Sockets", "Accessories", "Power & Distribution"],
    cashiers: [
      { id: "c_ee_1", name: "Chidi (Sales Rep)", pin: "1111", phone: "08099887766", role: "cashier", status: "active" }
    ],
    expenses: [
      { id: "e_ee_1", title: "Diesel for Shop Generator", category: "Generator/Fuel", amount: 15000, date: new Date().toISOString().slice(0, 10), note: "15 Litres" }
    ]
  },
  {
    id: "store_mama_nkechi",
    name: "Mama Nkechi Provision Store",
    category: "Groceries & Provisions",
    storeCode: "NKECHI-20",
    phone: "08029876543",
    address: "Surulere, Lagos",
    adminPin: "1234",
    ownerEmail: "nkechi@gmail.com",
    products: [
      { id: "p_mn_1", name: "Peak Evaporated Milk (158g)", category: "Dairy", cost: 480, price: 600, stock: 72, reorderLevel: 24 },
      { id: "p_mn_2", name: "Golden Penny Family Loaf Bread", category: "Bakery", cost: 1100, price: 1400, stock: 18, reorderLevel: 10 },
      { id: "p_mn_3", name: "Milo Refill Pack (500g)", category: "Beverages", cost: 2800, price: 3400, stock: 6, reorderLevel: 10 }, // Low stock!
      { id: "p_mn_4", name: "Dangote Refined Sugar (500g)", category: "Provisions", cost: 950, price: 1200, stock: 30, reorderLevel: 10 },
      { id: "p_mn_5", name: "Cabin Biscuit Carton (Small)", category: "Snacks", cost: 3200, price: 4000, stock: 8, reorderLevel: 5 }
    ],
    categories: ["Dairy", "Bakery", "Beverages", "Provisions", "Snacks"],
    cashiers: [
      { id: "c_mn_1", name: "Blessing (Cashier)", pin: "2222", phone: "08055443322", role: "cashier", status: "active" }
    ],
    expenses: [
      { id: "e_mn_1", title: "Bakery Van Delivery Fee", category: "Transport", amount: 2000, date: new Date().toISOString().slice(0, 10), note: "Bread delivery" }
    ]
  },
  {
    id: "store_apex_pharmacy",
    name: "HealthPlus Community Pharmacy",
    category: "Pharmaceuticals & Healthcare",
    storeCode: "PHARM-30",
    phone: "08076543210",
    address: "Ikeja, Lagos",
    adminPin: "1234",
    ownerEmail: "pharmacist@gmail.com",
    products: [
      { id: "p_ap_1", name: "Emzor Paracetamol 500mg (Pack of 96)", category: "Analgesics", cost: 900, price: 1400, stock: 50, reorderLevel: 15 },
      { id: "p_ap_2", name: "Coartem 80/480mg (Malaria Dose)", category: "Antimalarials", cost: 2600, price: 3500, stock: 22, reorderLevel: 10 },
      { id: "p_ap_3", name: "Vitamin C 1000mg Effervescent (20s)", category: "Supplements", cost: 2100, price: 3000, stock: 5, reorderLevel: 8 }, // Low stock!
      { id: "p_ap_4", name: "Dettol Antiseptic Liquid (250ml)", category: "First Aid", cost: 1800, price: 2400, stock: 16, reorderLevel: 6 }
    ],
    categories: ["Analgesics", "Antimalarials", "Supplements", "First Aid"],
    cashiers: [
      { id: "c_ap_1", name: "Femi (Counter Dispenser)", pin: "3333", phone: "08123456789", role: "cashier", status: "active" }
    ],
    expenses: [
      { id: "e_ap_1", title: "Pharmacy Premises Sanitation", category: "Maintenance", amount: 5000, date: new Date().toISOString().slice(0, 10), note: "Weekly cleaning" }
    ]
  }
];

// Helper to get local tenant storage key
function getStoreKey(storeId, subKey) {
  return `shopledger_${storeId}_${subKey}`;
}

// ==========================================
// STORE REGISTRY & SELECTION
// ==========================================

export function getAllRegisteredStores() {
  const customStoresRaw = localStorage.getItem('shopledger_custom_stores');
  let customStores = [];
  try {
    customStores = customStoresRaw ? JSON.parse(customStoresRaw) : [];
  } catch (e) {
    customStores = [];
  }
  return [...DEMO_STORES, ...customStores];
}

export function registerNewStore({ name, phone, address, adminPin, category, ownerEmail }) {
  const storeId = "store_" + Date.now();
  const num = Math.floor(1000 + Math.random() * 9000);
  const prefix = (name.replace(/[^a-zA-Z]/g, '').slice(0, 4) || "SHOP").toUpperCase();
  const storeCode = `${prefix}-${num.toString().slice(-2)}`;

  const newStore = {
    id: storeId,
    name: name.trim(),
    category: category || "Retail Store",
    storeCode: storeCode,
    phone: phone || "",
    address: address || "Nigeria",
    adminPin: adminPin || "1234",
    ownerEmail: ownerEmail || "owner@example.com",
    products: [],
    categories: ["General"],
    cashiers: [],
    expenses: []
  };

  const existing = getAllRegisteredStores();
  const customOnly = existing.filter(s => !DEMO_STORES.some(d => d.id === s.id));
  customOnly.push(newStore);
  localStorage.setItem('shopledger_custom_stores', JSON.stringify(customOnly));

  // Initialize store storage
  localStorage.setItem(getStoreKey(storeId, 'products'), JSON.stringify([]));
  localStorage.setItem(getStoreKey(storeId, 'categories'), JSON.stringify(["General"]));
  localStorage.setItem(getStoreKey(storeId, 'cashiers'), JSON.stringify([]));
  localStorage.setItem(getStoreKey(storeId, 'sales'), JSON.stringify([]));
  localStorage.setItem(getStoreKey(storeId, 'expenses'), JSON.stringify([]));

  return newStore;
}

export function getStoreById(storeId) {
  const stores = getAllRegisteredStores();
  return stores.find(s => s.id === storeId) || null;
}

export function getStoreByCode(storeCode) {
  if (!storeCode) return null;
  const clean = storeCode.trim().toUpperCase();
  const stores = getAllRegisteredStores();
  return stores.find(s => s.storeCode.toUpperCase() === clean) || null;
}

// ==========================================
// TENANT DATA ISOLATION (PRODUCTS, STOCKS)
// Strictly scoped to storeId!
// ==========================================

export function getStoreProducts(storeId) {
  if (!storeId) return [];
  const stored = localStorage.getItem(getStoreKey(storeId, 'products'));
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      // fallback
    }
  }
  // Initialize from store definition if available
  const store = getStoreById(storeId);
  if (store && store.products) {
    localStorage.setItem(getStoreKey(storeId, 'products'), JSON.stringify(store.products));
    return store.products;
  }
  return [];
}

export function saveStoreProduct(storeId, productData) {
  const products = getStoreProducts(storeId);
  if (productData.id) {
    // Edit existing
    const index = products.findIndex(p => p.id === productData.id);
    if (index !== -1) {
      products[index] = { ...products[index], ...productData };
    }
  } else {
    // New product
    const newProduct = {
      id: "prod_" + Date.now(),
      name: productData.name,
      category: productData.category || "General",
      cost: Number(productData.cost) || 0,
      price: Number(productData.price) || 0,
      stock: Number(productData.stock) || 0,
      reorderLevel: Number(productData.reorderLevel) || 10
    };
    products.push(newProduct);
  }
  localStorage.setItem(getStoreKey(storeId, 'products'), JSON.stringify(products));
  return products;
}

export function deleteStoreProduct(storeId, productId) {
  const products = getStoreProducts(storeId).filter(p => p.id !== productId);
  localStorage.setItem(getStoreKey(storeId, 'products'), JSON.stringify(products));
  return products;
}

export function quickRestockProduct(storeId, productId, addedQuantity) {
  const products = getStoreProducts(storeId);
  const item = products.find(p => p.id === productId);
  if (item) {
    item.stock = (Number(item.stock) || 0) + Number(addedQuantity);
    localStorage.setItem(getStoreKey(storeId, 'products'), JSON.stringify(products));
  }
  return products;
}

// ==========================================
// CATEGORIES
// ==========================================

export function getStoreCategories(storeId) {
  const stored = localStorage.getItem(getStoreKey(storeId, 'categories'));
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  const store = getStoreById(storeId);
  if (store && store.categories) {
    localStorage.setItem(getStoreKey(storeId, 'categories'), JSON.stringify(store.categories));
    return store.categories;
  }
  return ["General"];
}

export function addStoreCategory(storeId, categoryName) {
  const cats = getStoreCategories(storeId);
  const trimmed = categoryName.trim();
  if (trimmed && !cats.includes(trimmed)) {
    cats.push(trimmed);
    localStorage.setItem(getStoreKey(storeId, 'categories'), JSON.stringify(cats));
  }
  return cats;
}

// ==========================================
// CASHIER / STAFF MANAGEMENT (TENANT ISOLATED)
// ==========================================

export function getStoreCashiers(storeId) {
  const stored = localStorage.getItem(getStoreKey(storeId, 'cashiers'));
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  const store = getStoreById(storeId);
  if (store && store.cashiers) {
    localStorage.setItem(getStoreKey(storeId, 'cashiers'), JSON.stringify(store.cashiers));
    return store.cashiers;
  }
  return [];
}

export function addCashierToStore({ storeId, name, pin, phone }) {
  const cashiers = getStoreCashiers(storeId);
  const store = getStoreById(storeId);
  if (!store) throw new Error("Store not found");

  // Check if PIN already used in this store
  if (cashiers.some(c => c.pin === pin)) {
    throw new Error(`PIN "${pin}" is already assigned to another cashier in this store. Please pick a different 4-digit PIN.`);
  }

  const newCashier = {
    id: "cashier_" + Date.now(),
    name: name.trim(),
    pin: pin.trim(),
    phone: phone ? phone.trim() : "",
    role: "cashier",
    status: "active",
    createdAt: new Date().toISOString()
  };

  cashiers.push(newCashier);
  localStorage.setItem(getStoreKey(storeId, 'cashiers'), JSON.stringify(cashiers));

  // Build the WhatsApp message
  const origin = window.location.origin;
  const joinUrl = `${origin}/?code=${store.storeCode}&pin=${pin}`;
  const whatsappText = `*Welcome to ${store.name}!* 🎉\n` +
    `You have been invited as Cashier for our store register.\n\n` +
    `🏪 *Store:* ${store.name}\n` +
    `🔑 *Store Code:* ${store.storeCode}\n` +
    `🔢 *Your PIN:* ${pin}\n\n` +
    `Tap the link to open your POS register:\n${joinUrl}`;

  return {
    cashier: newCashier,
    storeCode: store.storeCode,
    whatsappUrl: `https://wa.me/?text=${encodeURIComponent(whatsappText)}`,
    joinUrl
  };
}

export function removeCashierFromStore(storeId, cashierId) {
  const cashiers = getStoreCashiers(storeId).filter(c => c.id !== cashierId);
  localStorage.setItem(getStoreKey(storeId, 'cashiers'), JSON.stringify(cashiers));
  return cashiers;
}

// Cashier verification: strictly requires matching storeCode AND that store's PIN
export function verifyCashierLogin(storeCode, pin) {
  const store = getStoreByCode(storeCode);
  if (!store) {
    return { success: false, message: `Store Code "${storeCode}" was not found.` };
  }

  const cashiers = getStoreCashiers(store.id);
  const matchingCashier = cashiers.find(c => c.pin === pin && c.status === "active");

  if (matchingCashier) {
    return {
      success: true,
      store: store,
      cashier: matchingCashier,
      role: "cashier"
    };
  }

  // Allow store owner to use their admin PIN on cashier POS
  if (store.adminPin === pin) {
    return {
      success: true,
      store: store,
      cashier: { id: "owner_" + store.id, name: "Store Owner (" + store.name + ")", role: "admin" },
      role: "admin"
    };
  }

  return { success: false, message: "Incorrect PIN for this store. Please re-enter." };
}

// ==========================================
// SALES & CHECKOUT (TENANT ISOLATED)
// ==========================================

export function getStoreSales(storeId) {
  const stored = localStorage.getItem(getStoreKey(storeId, 'sales'));
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  return [];
}

export function recordStoreSale(storeId, { items, cashierName, paymentMethod }) {
  const products = getStoreProducts(storeId);
  let totalAmount = 0;
  let totalProfit = 0;

  // Deduct stock and calculate profit
  items.forEach(cartItem => {
    const prod = products.find(p => p.id === cartItem.id);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - cartItem.quantity);
      const unitCost = Number(prod.cost) || 0;
      totalProfit += (cartItem.price - unitCost) * cartItem.quantity;
    }
    totalAmount += cartItem.price * cartItem.quantity;
  });

  // Save updated product stocks
  localStorage.setItem(getStoreKey(storeId, 'products'), JSON.stringify(products));

  const sales = getStoreSales(storeId);
  const receiptNo = "SL-" + Date.now().toString().slice(-6) + "-" + Math.floor(100 + Math.random() * 900);
  const newSale = {
    id: "sale_" + Date.now(),
    receiptNumber: receiptNo,
    date: new Date().toISOString().slice(0, 10),
    timestamp: Date.now(),
    dateTimeStr: new Date().toLocaleString('en-NG', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }),
    cashierName: cashierName || "Cashier",
    paymentMethod: paymentMethod || "Cash",
    items: items.map(i => ({
      id: i.id,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      lineTotal: i.price * i.quantity
    })),
    amount: totalAmount,
    profit: totalProfit
  };

  sales.unshift(newSale);
  localStorage.setItem(getStoreKey(storeId, 'sales'), JSON.stringify(sales));

  return { sale: newSale, updatedProducts: products };
}

// ==========================================
// EXPENSES (TENANT ISOLATED)
// ==========================================

export function getStoreExpenses(storeId) {
  const stored = localStorage.getItem(getStoreKey(storeId, 'expenses'));
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  const store = getStoreById(storeId);
  if (store && store.expenses) {
    localStorage.setItem(getStoreKey(storeId, 'expenses'), JSON.stringify(store.expenses));
    return store.expenses;
  }
  return [];
}

export function addStoreExpense(storeId, { title, category, amount, note }) {
  const expenses = getStoreExpenses(storeId);
  const newExp = {
    id: "exp_" + Date.now(),
    title: title.trim(),
    category: category || "Miscellaneous",
    amount: Number(amount) || 0,
    note: note || "",
    date: new Date().toISOString().slice(0, 10),
    timestamp: Date.now()
  };
  expenses.unshift(newExp);
  localStorage.setItem(getStoreKey(storeId, 'expenses'), JSON.stringify(expenses));
  return expenses;
}

export function deleteStoreExpense(storeId, expenseId) {
  const expenses = getStoreExpenses(storeId).filter(e => e.id !== expenseId);
  localStorage.setItem(getStoreKey(storeId, 'expenses'), JSON.stringify(expenses));
  return expenses;
}

// Formatting
export function formatNaira(amount) {
  const num = Number(amount) || 0;
  return '₦' + num.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
