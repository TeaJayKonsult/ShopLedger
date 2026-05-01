// common.js – Firebase, auth, install button, helpers

const firebaseConfig = {
  apiKey: "AIzaSyAEV8gjcAv4wTcMwzS9ddm-ooPC8dhBj8Y",
  authDomain: "shopledger-6e10c.firebaseapp.com",
  projectId: "shopledger-6e10c",
  storageBucket: "shopledger-6e10c.firebasestorage.app",
  messagingSenderId: "693117040596",
  appId: "1:693117040596:web:799e63124085d9a91c0841"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

let currentUser = null;
let userRole = null;
let businessSettings = null;
let storeAdminId = null;

// ========== Install button & iOS banner ==========
function setupInstallButton() {
  if (document.getElementById('installBtn')) return;
  const style = document.createElement('style');
  style.id = 'installBtnStyle';
  style.textContent = `
    .perm-install-btn {
      position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
      background: #ff7e9e; color: white; border: none; border-radius: 40px;
      padding: 8px 20px; font-size: 13px; font-weight: 600; cursor: pointer;
      z-index: 1000; display: flex; gap: 6px; white-space: nowrap;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .perm-install-btn:active { transform: translateX(-50%) scale(0.96); }
    .ios-banner {
      display: none; position: fixed; bottom: 80px; left: 16px; right: 16px;
      background: #fff0e6; border: 1px solid #ffb6c1; border-radius: 20px;
      padding: 12px; z-index: 1001; text-align: center; font-size: 13px;
    }
    .ios-banner strong { color: #ff7e9e; }
    .ios-close {
      position: absolute; right: 12px; top: 8px;
      background: none; border: none; font-size: 16px; cursor: pointer;
    }
  `;
  document.head.appendChild(style);
  document.body.insertAdjacentHTML('beforeend', `<button id="installBtn" class="perm-install-btn">📲 Install App</button>`);
  document.body.insertAdjacentHTML('beforeend', `
    <div id="iosBanner" class="ios-banner">
      <button class="ios-close" onclick="this.parentElement.style.display='none'">✕</button>
      <strong>📲 Install ShopLedger</strong><br>
      Tap Share (⬆️) then "Add to Home Screen"
    </div>
  `);
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  if (isIOS && !isStandalone) document.getElementById('iosBanner').style.display = 'block';
  let deferredPrompt = null;
  const installBtn = document.getElementById('installBtn');
  if (window.matchMedia('(display-mode: standalone)').matches && installBtn) installBtn.style.display = 'none';
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn && !window.matchMedia('(display-mode: standalone)').matches) installBtn.style.display = 'flex';
  });
  window.addEventListener('appinstalled', () => { deferredPrompt = null; if (installBtn) installBtn.style.display = 'none'; });
  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') installBtn.style.display = 'none';
        deferredPrompt = null;
      } else {
        alert("📲 Install: Use browser menu (⋮) → 'Add to Home Screen'.");
      }
    });
  }
}

// ========== Auth & role ==========
async function checkAndAssignRole(user) {
  const userDoc = await db.collection('users').doc(user.uid).get();
  if (userDoc.exists) {
    userRole = userDoc.data().role;
    storeAdminId = userDoc.data().storeAdminId || user.uid;
    return;
  }
  const invitationSnap = await db.collection('invitations').where('email', '==', user.email).where('used', '==', false).get();
  if (!invitationSnap.empty) {
    const inv = invitationSnap.docs[0];
    const invData = inv.data();
    userRole = invData.role;
    storeAdminId = invData.storeAdminId;
    await db.collection('users').doc(user.uid).set({
      email: user.email,
      role: userRole,
      storeAdminId: storeAdminId,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    await inv.ref.update({ used: true });
  } else {
    userRole = 'admin';
    storeAdminId = user.uid;
    await db.collection('users').doc(user.uid).set({
      email: user.email,
      role: 'admin',
      storeAdminId: user.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  }
}

async function checkAuth(redirectOnFail = true) {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      unsubscribe();
      if (user) {
        currentUser = user;
        await checkAndAssignRole(user);
        const bizDoc = await db.collection('settings').doc(storeAdminId).get();
        businessSettings = bizDoc.exists ? bizDoc.data() : null;
        resolve(true);
      } else {
        currentUser = null;
        userRole = null;
        businessSettings = null;
        if (redirectOnFail) window.location.href = 'index.html';
        resolve(false);
      }
    });
  });
}

function redirectToDashboard() {
  if (userRole === 'admin') window.location.href = 'admin.html';
  else window.location.href = 'cashier.html';
}

async function inviteCashier(email) {
  if (!email) return { success: false, message: 'Email required' };
  const existingUser = await db.collection('users').where('email', '==', email).get();
  if (!existingUser.empty) return { success: false, message: 'User already registered' };
  await db.collection('invitations').add({
    email: email,
    role: 'cashier',
    storeAdminId: storeAdminId,
    used: false,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  return { success: true, message: `Invitation sent to ${email}. They can sign up and will automatically become cashier.` };
}

function formatMoney(amount) {
  return '₦' + Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
function formatDate(date) {
  if (!date) return '';
  if (typeof date === 'string') date = new Date(date);
  return date.toLocaleDateString('en-NG', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
}
function formatDateTime() {
  return new Date().toLocaleString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function generateReceiptNumber() {
  return 'SL' + Date.now().toString().slice(-8);
}

window.formatMoney = formatMoney;
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
window.generateReceiptNumber = generateReceiptNumber;
window.inviteCashier = inviteCashier;