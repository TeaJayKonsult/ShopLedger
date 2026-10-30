// src/services/storeService.js
// ShopLedger Multi-Tenant SaaS Engine with Real Firebase Firestore Sync & Dynamic Stores

import {
  db, auth, googleProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut
} from './firebase';
import {
  collection, doc, getDoc, getDocs, setDoc,
  addDoc, updateDoc, deleteDoc, query, where, serverTimestamp
} from 'firebase/firestore';

function getStoreKey(storeId, subKey) {
  return `shopledger_${storeId}_${subKey}`;
}

// ==========================================
// USER AUTHENTICATION (EMAIL & PASSWORD / GOOGLE)
// ==========================================

export async function registerUserWithEmail(email, password) {
  const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  return userCredential.user;
}

export async function loginUserWithEmail(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
  return userCredential.user;
}

export async function loginUserWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function logoutUser() {
  localStorage.removeItem('shopledger_cashier_session');
  await signOut(auth);
}

// ==========================================
// STORE REGISTRY & PROFILE SETUP (DYNAMIC TENANTS)
// ==========================================

export function getAllRegisteredStores() {
  const raw = localStorage.getItem('shopledger_all_stores');
  try {
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveStoreLocally(store) {
  const stores = getAllRegisteredStores();
  const idx = stores.findIndex(s => s.id === store.id);
  if (idx !== -1) {
    stores[idx] = store;
  } else {
    stores.push(store);
  }
  localStorage.setItem('shopledger_all_stores', JSON.stringify(stores));
}

/**
 * Fetch the store associated with an authenticated owner UID.
 * Checks Firestore first, with localStorage fallback.
 */
export async function getUserStore(userId) {
  if (!userId) return null;

  // 1. Check local cache first for instant speed
  const cached = localStorage.getItem(`shopledger_user_store_${userId}`);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.id) return parsed;
    } catch (e) {}
  }

  // 2. Check Firestore user reference
  try {
    const userDocSnap = await getDoc(doc(db, "users", userId));
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      if (userData.storeId) {
        const storeSnap = await getDoc(doc(db, "stores", userData.storeId));
        if (storeSnap.exists()) {
          const storeData = { id: storeSnap.id, ...storeSnap.data() };
          saveStoreLocally(storeData);
          localStorage.setItem(`shopledger_user_store_${userId}`, JSON.stringify(storeData));
          return storeData;
        }
      }
    }

    // Secondary query: look for store by ownerId
    const q = query(collection(db, "stores"), where("ownerId", "==", userId));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const firstDoc = querySnapshot.docs[0];
      const storeData = { id: firstDoc.id, ...firstDoc.data() };
      saveStoreLocally(storeData);
      localStorage.setItem(`shopledger_user_store_${userId}`, JSON.stringify(storeData));
      return storeData;
    }
  } catch (err) {
    console.warn("Notice: Fetching user store from Firestore encountered an error (using local cache if available):", err);
  }

  return null;
}

/**
 * Create a brand new store profile after email registration
 */
export async function createStoreProfile({ ownerId, ownerEmail, name, category, phone, address, adminPin }) {
  if (!ownerId) throw new Error("Owner ID is required to create a store.");
  if (!name || !name.trim()) throw new Error("Store business name is required.");

  const storeId = "store_" + Date.now();
  const num = Math.floor(1000 + Math.random() * 9000);
  const cleanName = name.replace(/[^a-zA-Z]/g, '').slice(0, 4) || "SHOP";
  const storeCode = `${cleanName.toUpperCase()}-${num.toString().slice(-2)}`;

  const newStore = {
    id: storeId,
    name: name.trim(),
    category: category || "Retail Store",
    storeCode: storeCode,
    phone: phone ? phone.trim() : "",
    address: address ? address.trim() : "Nigeria",
    adminPin: adminPin ? adminPin.trim() : "1234",
    ownerId: ownerId,
    ownerEmail: ownerEmail || "",
    createdAt: new Date().toISOString()
  };

  // 1. Save locally
  saveStoreLocally(newStore);
  localStorage.setItem(`shopledger_user_store_${ownerId}`, JSON.stringify(newStore));
  localStorage.setItem(getStoreKey(storeId, 'products'), JSON.stringify([]));
  localStorage.setItem(getStoreKey(storeId, 'categories'), JSON.stringify(["General"]));
  localStorage.setItem(getStoreKey(storeId, 'cashiers'), JSON.stringify([]));
  localStorage.setItem(getStoreKey(storeId, 'sales'), JSON.stringify([]));
  localStorage.setItem(getStoreKey(storeId, 'expenses'), JSON.stringify([]));

  // 2. Save in Firestore
  try {
    await setDoc(doc(db, "stores", storeId), {
      ...newStore,
      serverTime: serverTimestamp()
    });

    await setDoc(doc(db, "users", ownerId), {
      storeId: storeId,
      storeCode: storeCode,
      email: ownerEmail || "",
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn("Notice: Firestore profile sync error (offline-ready):", err);
  }

  return newStore;
}

export async function updateStoreProfile(storeId, updates) {
  const stores = getAllRegisteredStores();
  const idx = stores.findIndex(s => s.id === storeId);
  if (idx !== -1) {
    stores[idx] = { ...stores[idx], ...updates };
    localStorage.setItem('shopledger_all_stores', JSON.stringify(stores));
    if (stores[idx].ownerId) {
      localStorage.setItem(`shopledger_user_store_${stores[idx].ownerId}`, JSON.stringify(stores[idx]));
    }
  }

  try {
    await updateDoc(doc(db, "stores", storeId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (err) {
    console.warn("Notice: Firestore profile update error:", err);
  }

  return stores[idx] || null;
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
// TENANT DATA ISOLATION (PRODUCTS & STOCKS)
// ==========================================

export function getStoreProducts(storeId) {
  if (!storeId) return [];
  const stored = localStorage.getItem(getStoreKey(storeId, 'products'));
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {}
  }
  return [];
}

export async function saveStoreProduct(storeId, productData) {
  const products = getStoreProducts(storeId);
  let savedProduct;

  if (productData.id) {
    // Edit existing product
    const index = products.findIndex(p => p.id === productData.id);
    if (index !== -1) {
      products[index] = { ...products[index], ...productData };
      savedProduct = products[index];
    }
  } else {
    // New product
    savedProduct = {
      id: "prod_" + Date.now(),
      name: productData.name,
      category: productData.category || "General",
      cost: Number(productData.cost) || 0,
      price: Number(productData.price) || 0,
      stock: Number(productData.stock) || 0,
      reorderLevel: Number(productData.reorderLevel) || 10
    };
    products.push(savedProduct);
  }

  // 1. Save locally
  localStorage.setItem(getStoreKey(storeId, 'products'), JSON.stringify(products));

  // 2. Sync to Firestore subcollection
  try {
    await setDoc(doc(db, "stores", storeId, "products", savedProduct.id), {
      ...savedProduct,
      updatedAt: serverTimestamp()
    });
  } catch (err) {
    console.warn("Firestore product sync error:", err);
  }

  return products;
}

export async function deleteStoreProduct(storeId, productId) {
  const products = getStoreProducts(storeId).filter(p => p.id !== productId);
  localStorage.setItem(getStoreKey(storeId, 'products'), JSON.stringify(products));

  try {
    await deleteDoc(doc(db, "stores", storeId, "products", productId));
  } catch (err) {
    console.warn("Firestore delete product error:", err);
  }

  return products;
}

export async function quickRestockProduct(storeId, productId, addedQuantity) {
  const products = getStoreProducts(storeId);
  const item = products.find(p => p.id === productId);
  if (item) {
    item.stock = (Number(item.stock) || 0) + Number(addedQuantity);
    localStorage.setItem(getStoreKey(storeId, 'products'), JSON.stringify(products));

    try {
      await updateDoc(doc(db, "stores", storeId, "products", productId), {
        stock: item.stock,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.warn("Firestore stock update error:", err);
    }
  }
  return products;
}

// ==========================================
// CATEGORIES (TENANT ISOLATED)
// ==========================================

export function getStoreCategories(storeId) {
  const stored = localStorage.getItem(getStoreKey(storeId, 'categories'));
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  return ["General"];
}

export async function addStoreCategory(storeId, categoryName) {
  const cats = getStoreCategories(storeId);
  const trimmed = categoryName.trim();
  if (trimmed && !cats.includes(trimmed)) {
    cats.push(trimmed);
    localStorage.setItem(getStoreKey(storeId, 'categories'), JSON.stringify(cats));

    try {
      await addDoc(collection(db, "stores", storeId, "categories"), {
        name: trimmed,
        createdAt: serverTimestamp()
      });
    } catch (err) {}
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
  return [];
}

export async function addCashierToStore({ storeId, name, pin, phone }) {
  const cashiers = getStoreCashiers(storeId);
  const store = getStoreById(storeId);
  if (!store) throw new Error("Store not found");

  if (cashiers.some(c => c.pin === pin)) {
    throw new Error(`PIN "${pin}" is already assigned to another cashier in this store. Please pick a different 4-digit PIN.`);
  }

  const cashierId = "cashier_" + Date.now();
  const newCashier = {
    id: cashierId,
    name: name.trim(),
    pin: pin.trim(),
    phone: phone ? phone.trim() : "",
    role: "cashier",
    status: "active",
    createdAt: new Date().toISOString()
  };

  cashiers.push(newCashier);
  localStorage.setItem(getStoreKey(storeId, 'cashiers'), JSON.stringify(cashiers));

  // Sync to Firebase
  try {
    await setDoc(doc(db, "stores", storeId, "cashiers", cashierId), {
      ...newCashier,
      timestamp: serverTimestamp()
    });
  } catch (err) {
    console.warn("Firestore cashier sync error:", err);
  }

  // Build the WhatsApp invite message
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

export async function removeCashierFromStore(storeId, cashierId) {
  const cashiers = getStoreCashiers(storeId).filter(c => c.id !== cashierId);
  localStorage.setItem(getStoreKey(storeId, 'cashiers'), JSON.stringify(cashiers));

  try {
    await deleteDoc(doc(db, "stores", storeId, "cashiers", cashierId));
  } catch (err) {}

  return cashiers;
}

export async function verifyCashierLogin(storeCode, pin) {
  if (!storeCode || !pin) {
    return { success: false, message: "Store Code and 4-digit PIN are required." };
  }

  const cleanCode = storeCode.trim().toUpperCase();
  let store = getStoreByCode(cleanCode);

  // If not found in local cache, search in live Firestore
  if (!store) {
    try {
      const q = query(collection(db, "stores"), where("storeCode", "==", cleanCode));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docItem = snap.docs[0];
        store = { id: docItem.id, ...docItem.data() };
        saveStoreLocally(store);
      }
    } catch (e) {
      console.warn("Firestore store search error:", e);
    }
  }

  if (!store) {
    return { success: false, message: `Store Code "${cleanCode}" was not found.` };
  }

  // Check store admin PIN
  if (store.adminPin === pin) {
    return {
      success: true,
      store: store,
      cashier: { id: "owner_" + store.id, name: "Store Owner (" + store.name + ")", role: "admin" },
      role: "admin"
    };
  }

  // Check cashier PINs
  let cashiers = getStoreCashiers(store.id);
  if (cashiers.length === 0) {
    // Try fetching from Firestore
    try {
      const snap = await getDocs(collection(db, "stores", store.id, "cashiers"));
      cashiers = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      localStorage.setItem(getStoreKey(store.id, 'cashiers'), JSON.stringify(cashiers));
    } catch (e) {}
  }

  const matchingCashier = cashiers.find(c => c.pin === pin && c.status === "active");
  if (matchingCashier) {
    return {
      success: true,
      store: store,
      cashier: matchingCashier,
      role: "cashier"
    };
  }

  return { success: false, message: "Incorrect PIN for this store. Please verify your 4-digit PIN." };
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

export async function recordStoreSale(storeId, { items, cashierName, paymentMethod }) {
  const products = getStoreProducts(storeId);
  let totalAmount = 0;
  let totalProfit = 0;

  items.forEach(cartItem => {
    const prod = products.find(p => p.id === cartItem.id);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - cartItem.quantity);
      const unitCost = Number(prod.cost) || 0;
      totalProfit += (cartItem.price - unitCost) * cartItem.quantity;
    }
    totalAmount += cartItem.price * cartItem.quantity;
  });

  localStorage.setItem(getStoreKey(storeId, 'products'), JSON.stringify(products));

  const sales = getStoreSales(storeId);
  const receiptNo = "SL-" + Date.now().toString().slice(-6) + "-" + Math.floor(100 + Math.random() * 900);
  const saleId = "sale_" + Date.now();

  const newSale = {
    id: saleId,
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

  // Sync Sale & Stock Deductions to Firestore
  try {
    await setDoc(doc(db, "stores", storeId, "sales", saleId), {
      ...newSale,
      serverTime: serverTimestamp()
    });

    for (let item of items) {
      const prod = products.find(p => p.id === item.id);
      if (prod) {
        await updateDoc(doc(db, "stores", storeId, "products", item.id), {
          stock: prod.stock
        });
      }
    }
  } catch (err) {
    console.warn("Firestore sale sync notice:", err);
  }

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
  return [];
}

export async function addStoreExpense(storeId, { title, category, amount, note }) {
  const expenses = getStoreExpenses(storeId);
  const expId = "exp_" + Date.now();

  const newExp = {
    id: expId,
    title: title.trim(),
    category: category || "Miscellaneous",
    amount: Number(amount) || 0,
    note: note || "",
    date: new Date().toISOString().slice(0, 10),
    timestamp: Date.now()
  };

  expenses.unshift(newExp);
  localStorage.setItem(getStoreKey(storeId, 'expenses'), JSON.stringify(expenses));

  try {
    await setDoc(doc(db, "stores", storeId, "expenses", expId), {
      ...newExp,
      serverTime: serverTimestamp()
    });
  } catch (err) {
    console.warn("Firestore expense sync notice:", err);
  }

  return expenses;
}

export async function deleteStoreExpense(storeId, expenseId) {
  const expenses = getStoreExpenses(storeId).filter(e => e.id !== expenseId);
  localStorage.setItem(getStoreKey(storeId, 'expenses'), JSON.stringify(expenses));

  try {
    await deleteDoc(doc(db, "stores", storeId, "expenses", expenseId));
  } catch (err) {}

  return expenses;
}

// Formatting currency
export function formatNaira(amount) {
  const num = Number(amount) || 0;
  return '₦' + num.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
