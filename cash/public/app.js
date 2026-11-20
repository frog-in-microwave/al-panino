/**
 * Al Panino Cashier POS System - Application Controller
 * Direct Hardware Printing (Zero Browser Print Dialog) + On-Screen Receipt
 */

// Exchange rate: 90,000 LBP per 1 USD
const USD_RATE = 90000;

// Application State
const state = {
  items: [],
  categories: [],
  cart: [], // { item, quantity, note }
  selectedCategory: 'all',
  searchQuery: '',
  orderType: 'Takeaway',
  tenderedAmount: 0,
  orderNumber: 1001,
  currentReceipt: null,
  register: {
    startingCash: 0,
    ordersSales: 0,
    totalCashInDrawer: 0,
    totalOrders: 0
  }
};

// Web Audio API Synthesizer for tactile cashier beeps
let audioCtx = null;
function playBeep(freq = 800, type = 'sine', duration = 0.05) {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    // Audio ignored if blocked by browser
  }
}

// Formatters
function formatLL(amount) {
  const num = Math.round(Number(amount) || 0);
  return num.toLocaleString('en-US') + ' L.L.';
}

function formatUSD(amountInLL) {
  const usd = (Number(amountInLL) || 0) / USD_RATE;
  return '$' + usd.toFixed(2);
}

// Toast notification helper
let toastTimer = null;
function showToast(message, duration = 2500) {
  const toast = document.getElementById('posToast');
  const toastMessage = document.getElementById('toastMessage');
  if (!toast || !toastMessage) return;

  toastMessage.textContent = message;
  toast.style.display = 'flex';

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.style.display = 'none';
  }, duration);
}

// DOM Elements
const liveClock = document.getElementById('liveClock');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const categoryTabs = document.getElementById('categoryTabs');
const itemsGrid = document.getElementById('itemsGrid');
const noItemsState = document.getElementById('noItemsState');
const resetFiltersBtn = document.getElementById('resetFiltersBtn');

const ticketNumber = document.getElementById('ticketNumber');
const btnClearCart = document.getElementById('btnClearCart');
const orderTypeButtons = document.querySelectorAll('.order-type-picker .type-btn');
const orderNoteInput = document.getElementById('orderNoteInput');

const ticketItemsContainer = document.getElementById('ticketItemsContainer');
const emptyTicketState = document.getElementById('emptyTicketState');
const ticketItemsList = document.getElementById('ticketItemsList');

const calcSubtotal = document.getElementById('calcSubtotal');
const calcTotal = document.getElementById('calcTotal');
const calcTotalUsd = document.getElementById('calcTotalUsd');

const tenderedInput = document.getElementById('tenderedInput');
const tenderedInputUsd = document.getElementById('tenderedInputUsd');
const changeAmount = document.getElementById('changeAmount');
const changeAmountUsd = document.getElementById('changeAmountUsd');
const btnCheckout = document.getElementById('btnCheckout');

// Numeric Keypad ("Numbers Buttons") Elements
const wrapTenderLL = document.getElementById('wrapTenderLL');
const wrapTenderUSD = document.getElementById('wrapTenderUSD');
const btnTargetLL = document.getElementById('btnTargetLL');
const btnTargetUSD = document.getElementById('btnTargetUSD');
const btnQuickExact = document.getElementById('btnQuickExact');
const numpadButtons = document.querySelectorAll('.numpad-btn');
const numpadPresetPills = document.querySelectorAll('.numpad-preset-pill');

let activeNumpadTarget = 'll'; // 'll' or 'usd'

// Modals
const receiptModal = document.getElementById('receiptModal');
const closeReceiptModal = document.getElementById('closeReceiptModal');
const btnPrintReceipt = document.getElementById('btnPrintReceipt');
const printBtnLabel = document.getElementById('printBtnLabel');
const btnNewOrderAfterPrint = document.getElementById('btnNewOrderAfterPrint');

const menuModal = document.getElementById('menuModal');
const btnManageMenu = document.getElementById('btnManageMenu');
const closeMenuModal = document.getElementById('closeMenuModal');
const addItemForm = document.getElementById('addItemForm');
const newItemPriceUsd = document.getElementById('newItemPriceUsd');
const newItemPrice = document.getElementById('newItemPrice');
const newItemPriceHelper = document.getElementById('newItemPriceHelper');
const manageItemsTableBody = document.getElementById('manageItemsTableBody');
const manageItemsCount = document.getElementById('manageItemsCount');

const headerDrawerCash = document.getElementById('headerDrawerCash');
const btnCashRegister = document.getElementById('btnCashRegister');

// Register Modal elements
const registerModal = document.getElementById('registerModal');
const closeRegisterModal = document.getElementById('closeRegisterModal');
const cancelRegisterBtn = document.getElementById('cancelRegisterBtn');
const btnSaveRegisterCash = document.getElementById('btnSaveRegisterCash');
const startingCashInput = document.getElementById('startingCashInput');
const regPresets = document.getElementById('regPresets');
const regCurrentStarting = document.getElementById('regCurrentStarting');
const regOrdersSales = document.getElementById('regOrdersSales');
const regOrdersCountSub = document.getElementById('regOrdersCountSub');
const regTotalDrawer = document.getElementById('regTotalDrawer');
const regTotalDrawerUsd = document.getElementById('regTotalDrawerUsd');
const regPreviewTotal = document.getElementById('regPreviewTotal');
const regPreviewUsd = document.getElementById('regPreviewUsd');

// Stats Modal elements
const statsModal = document.getElementById('statsModal');
const btnShiftSummary = document.getElementById('btnShiftSummary');
const closeStatsModal = document.getElementById('closeStatsModal');
const closeStatsBtn = document.getElementById('closeStatsBtn');
const btnOpenRegisterFromStats = document.getElementById('btnOpenRegisterFromStats');
const statStartingFloat = document.getElementById('statStartingFloat');
const statOrdersRevenue = document.getElementById('statOrdersRevenue');
const statTotalDrawerExpected = document.getElementById('statTotalDrawerExpected');

// Orders Log elements
const ordersLogModal = document.getElementById('ordersLogModal');
const btnOrderHistory = document.getElementById('btnOrderHistory');
const closeOrdersModal = document.getElementById('closeOrdersModal');
const closeOrdersBtn = document.getElementById('closeOrdersBtn');
const ordersLogTableBody = document.getElementById('ordersLogTableBody');
const logStartingCash = document.getElementById('logStartingCash');
const logOrdersSales = document.getElementById('logOrdersSales');
const logOrdersCount = document.getElementById('logOrdersCount');
const logDrawerTotal = document.getElementById('logDrawerTotal');
const logDrawerTotalUsd = document.getElementById('logDrawerTotalUsd');
const btnEditFloatFromLog = document.getElementById('btnEditFloatFromLog');
const btnPrintShiftReport = document.getElementById('btnPrintShiftReport');
const printShiftReportLabel = document.getElementById('printShiftReportLabel');

// -----------------------------------------------------------------------------
// Live Clock
// -----------------------------------------------------------------------------
function updateClock() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  if (liveClock) {
    liveClock.textContent = `${timeStr} • ${dateStr}`;
  }
}
setInterval(updateClock, 1000);
updateClock();

// -----------------------------------------------------------------------------
// Initialization & Data Loading
// -----------------------------------------------------------------------------
async function initApp() {
  try {
    await Promise.all([loadCategories(), loadItems(), loadNextOrderNumber(), loadRegisterData()]);
    renderCategories();
    renderItems();
    updateCalculations();
    setActiveNumpadTarget('ll');
  } catch (err) {
    console.error('Initialization error:', err);
  }
}

async function loadRegisterData() {
  try {
    const res = await fetch('/api/register');
    if (res.ok) {
      const data = await res.json();
      state.register = data;
      if (headerDrawerCash) {
        headerDrawerCash.textContent = formatLL(data.totalCashInDrawer);
      }
    }
  } catch (err) {
    console.error('Error loading register data:', err);
  }
}

async function loadCategories() {
  try {
    const res = await fetch('/api/categories');
    if (res.ok) {
      state.categories = await res.json();
    }
  } catch (err) {
    console.warn('Could not fetch categories, using defaults:', err);
    state.categories = [
      { id: 'all', name: 'All Items', nameAr: 'جميع الأصناف', color: '#64748b' },
      { id: 'appetizers', name: 'Appetizers', nameAr: 'مقبلات', color: '#ea580c' },
      { id: 'salads', name: 'Salads', nameAr: 'سلطات', color: '#16a34a' },
      { id: 'wraps', name: 'Wraps', nameAr: 'راب', color: '#0891b2' },
      { id: 'sandwiches', name: 'Sandwiches', nameAr: 'سندويشات', color: '#d97706' },
      { id: 'ciabata', name: 'Ciabata', nameAr: 'تشاباتا', color: '#ca8a04' },
      { id: 'beef-burger', name: 'Beef Burger', nameAr: 'برغر لحم', color: '#dc2626' },
      { id: 'chicken-burger', name: 'Chicken Burger', nameAr: 'برغر دجاج', color: '#f97316' },
      { id: 'plates', name: 'Plates', nameAr: 'صحون', color: '#7c3aed' },
      { id: 'drinks', name: 'Drinks & Beverages', nameAr: 'مشروبات باردة', color: '#0284c7' }
    ];
  }
}

async function loadItems() {
  try {
    const res = await fetch('/api/items');
    if (res.ok) {
      state.items = await res.json();
    }
  } catch (err) {
    console.error('Failed to load items:', err);
  }
}

async function loadNextOrderNumber() {
  try {
    const res = await fetch('/api/orders');
    if (res.ok) {
      const orders = await res.json();
      state.orderNumber = orders.length + 1001;
      updateTicketHeader();
    }
  } catch (e) {
    state.orderNumber = 1001;
    updateTicketHeader();
  }
}

function updateTicketHeader() {
  ticketNumber.textContent = `Order #${state.orderNumber}`;
}

// Contrast helper for color badges
function getContrastColor(hex) {
  if (!hex || hex[0] !== '#' || hex.length < 7) return '#ffffff';
  const r = parseInt(hex.slice(1, 3), 16) || 0;
  const g = parseInt(hex.slice(3, 5), 16) || 0;
  const b = parseInt(hex.slice(5, 7), 16) || 0;
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 135) ? '#0f172a' : '#ffffff';
}

// Populate the category dropdown in Add Item form
function populateCategorySelect(selectedId) {
  const newItemCategory = document.getElementById('newItemCategory');
  if (!newItemCategory) return;

  const currentVal = selectedId || newItemCategory.value;
  newItemCategory.innerHTML = '';

  state.categories
    .filter(c => c.id !== 'all')
    .forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.name}${c.nameAr ? ' • ' + c.nameAr : ''}`;
      if (c.id === currentVal) {
        opt.selected = true;
      }
      newItemCategory.appendChild(opt);
    });
}

// -----------------------------------------------------------------------------
// Render Category Tabs
// -----------------------------------------------------------------------------
function renderCategories() {
  categoryTabs.innerHTML = '';
  
  const counts = { all: state.items.length };
  state.items.forEach(it => {
    counts[it.categoryId] = (counts[it.categoryId] || 0) + 1;
  });

  state.categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = `cat-pill ${state.selectedCategory === cat.id ? 'active' : ''}`;
    btn.dataset.category = cat.id;

    const count = counts[cat.id] || 0;
    const catColor = cat.color || '#64748b';
    btn.innerHTML = `
      ${cat.id !== 'all' ? `<span class="cat-dot" style="background-color: ${catColor};"></span>` : ''}
      <span class="cat-name">${cat.name}</span>
      <span class="cat-count">${count}</span>
    `;

    btn.addEventListener('click', () => {
      playBeep(600, 'sine', 0.03);
      state.selectedCategory = cat.id;
      document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderItems();
    });

    categoryTabs.appendChild(btn);
  });
}

// -----------------------------------------------------------------------------
// Render Items Grid
// -----------------------------------------------------------------------------
function renderItems() {
  itemsGrid.innerHTML = '';

  const q = state.searchQuery.toLowerCase().trim();
  const filtered = state.items.filter(item => {
    const matchCat = state.selectedCategory === 'all' || item.categoryId === state.selectedCategory;
    const matchQuery = !q || 
      item.name.toLowerCase().includes(q) ||
      (item.nameAr && item.nameAr.includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q)) ||
      item.price.toString().includes(q);
    return matchCat && matchQuery;
  });

  if (filtered.length === 0) {
    noItemsState.style.display = 'block';
  } else {
    noItemsState.style.display = 'none';
  }

  filtered.forEach(item => {
    const cartEntry = state.cart.find(c => c.item.id === item.id);
    const cartQty = cartEntry ? cartEntry.quantity : 0;
    const catId = item.categoryId || 'sandwiches';
    const catObj = state.categories.find(c => c.id === catId);
    const catColor = catObj?.color || '#94a3b8';
    const catName = catObj ? catObj.name : (item.category || item.categoryId);

    const card = document.createElement('div');
    card.className = `item-card cat-${catId}${cartQty > 0 ? ' in-cart' : ''}`;
    card.style.borderLeftColor = catColor;
    card.dataset.itemId = item.id;

    card.innerHTML = `
      <div class="item-card-header">
        <span class="item-cat-badge" style="background-color: ${catColor}1a; color: ${catColor}; border: 1px solid ${catColor}44;">
          ${catName}
        </span>
        ${cartQty > 0 ? `<span class="item-qty-badge">${cartQty}×</span>` : ''}
      </div>
      <div class="item-card-main">
        <div class="item-title-en">${item.name}</div>
        ${item.nameAr ? `<div class="item-title-ar">${item.nameAr}</div>` : ''}
      </div>
      <div class="item-card-bottom">
        <div class="item-prices">
          <span class="item-price-main">${formatLL(item.price)}</span>
          <span class="item-price-sub">${formatUSD(item.price)}</span>
        </div>
      </div>
    `;

    card.addEventListener('click', () => {
      addToCart(item);
    });

    itemsGrid.appendChild(card);
  });
}

// -----------------------------------------------------------------------------
// Cart / Ticket Actions
// -----------------------------------------------------------------------------
function addToCart(item) {
  playBeep(900, 'triangle', 0.04);
  const existing = state.cart.find(c => c.item.id === item.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.push({
      item,
      quantity: 1,
      note: ''
    });
  }
  renderTicket();
  renderItems();
  updateCalculations();
}

function updateCartQuantity(itemId, delta) {
  playBeep(700, 'sine', 0.03);
  const index = state.cart.findIndex(c => c.item.id === itemId);
  if (index === -1) return;

  state.cart[index].quantity += delta;
  if (state.cart[index].quantity <= 0) {
    state.cart.splice(index, 1);
  }
  renderTicket();
  renderItems();
  updateCalculations();
}

function removeCartItem(itemId) {
  playBeep(400, 'square', 0.05);
  state.cart = state.cart.filter(c => c.item.id !== itemId);
  renderTicket();
  renderItems();
  updateCalculations();
}

function updateItemNote(itemId, note) {
  const item = state.cart.find(c => c.item.id === itemId);
  if (item) {
    item.note = note;
  }
}

function clearCart() {
  if (state.cart.length === 0) return;
  if (confirm('Are you sure you want to discard the active order?')) {
    playBeep(350, 'square', 0.08);
    state.cart = [];
    orderNoteInput.value = '';
    tenderedInput.value = '';
    if (tenderedInputUsd) tenderedInputUsd.value = '';
    renderTicket();
    renderItems();
    updateCalculations();
  }
}

// -----------------------------------------------------------------------------
// Render Ticket Items
// -----------------------------------------------------------------------------
function renderTicket() {
  ticketItemsList.innerHTML = '';

  if (state.cart.length === 0) {
    emptyTicketState.style.display = 'block';
    btnCheckout.disabled = true;
    return;
  }

  emptyTicketState.style.display = 'none';
  btnCheckout.disabled = false;

  state.cart.forEach(({ item, quantity, note }) => {
    const lineTotal = item.price * quantity;

    const row = document.createElement('div');
    row.className = `ticket-item-row${note ? ' has-note' : ''}`;
    row.innerHTML = `
      <div class="ticket-item-line">
        <!-- Compact Qty Stepper -->
        <div class="t-qty-control">
          <button type="button" class="qty-btn btn-minus" title="Decrease">−</button>
          <span class="qty-display">${quantity}</span>
          <button type="button" class="qty-btn btn-plus" title="Increase">+</button>
        </div>

        <!-- Item Title & Optional Note Badge -->
        <div class="t-item-desc" title="${item.name}${item.nameAr ? ' • ' + item.nameAr : ''}">
          <span class="t-item-title">${item.name}</span>
          ${item.nameAr ? `<span class="t-item-ar">${item.nameAr}</span>` : ''}
          ${note ? `<span class="t-item-note-badge" title="${note}">💬 ${note}</span>` : ''}
        </div>

        <!-- Line Total -->
        <div class="t-item-price">${formatLL(lineTotal)}</div>

        <!-- Quick Actions: Note toggle & Delete -->
        <div class="t-item-actions">
          <button type="button" class="btn-toggle-note ${note ? 'active' : ''}" title="Add/Edit Note">💬</button>
          <button type="button" class="btn-remove-item" title="Remove Item">✕</button>
        </div>
      </div>

      <!-- Collapsible Item Note Input (Only open when clicked) -->
      <div class="t-item-note-field" style="display: none;">
        <input type="text" class="t-item-note-input" placeholder="Item note (e.g. no pickles, extra garlic)..." value="${note || ''}">
      </div>
    `;

    row.querySelector('.btn-plus').addEventListener('click', () => updateCartQuantity(item.id, 1));
    row.querySelector('.btn-minus').addEventListener('click', () => updateCartQuantity(item.id, -1));
    row.querySelector('.btn-remove-item').addEventListener('click', () => removeCartItem(item.id));

    const noteToggleBtn = row.querySelector('.btn-toggle-note');
    const noteField = row.querySelector('.t-item-note-field');
    const noteInput = row.querySelector('.t-item-note-input');

    noteToggleBtn.addEventListener('click', () => {
      const isVisible = noteField.style.display !== 'none';
      noteField.style.display = isVisible ? 'none' : 'block';
      if (!isVisible) {
        noteInput.focus();
      }
    });

    noteInput.addEventListener('input', (e) => {
      updateItemNote(item.id, e.target.value);
      const descEl = row.querySelector('.t-item-desc');
      let noteBadge = descEl.querySelector('.t-item-note-badge');
      if (e.target.value.trim()) {
        noteToggleBtn.classList.add('active');
        if (!noteBadge) {
          noteBadge = document.createElement('span');
          noteBadge.className = 't-item-note-badge';
          descEl.appendChild(noteBadge);
        }
        noteBadge.textContent = `💬 ${e.target.value.trim()}`;
        noteBadge.title = e.target.value.trim();
      } else {
        noteToggleBtn.classList.remove('active');
        if (noteBadge) noteBadge.remove();
      }
    });

    ticketItemsList.appendChild(row);
  });
}

// -----------------------------------------------------------------------------
// Calculations & Tender Logic (Dual Currency: L.L. & USD @ 90,000)
// -----------------------------------------------------------------------------
function updateCalculations(source) {
  const total = state.cart.reduce((sum, c) => sum + (c.item.price * c.quantity), 0);

  if (calcSubtotal) calcSubtotal.textContent = formatLL(total);
  if (calcTotal) calcTotal.textContent = formatLL(total);
  if (calcTotalUsd) calcTotalUsd.textContent = `≈ ${formatUSD(total)} USD`;

  // Update Dominant Checkout Button live totals on main screen
  const checkoutBtnTotalLL = document.getElementById('checkoutBtnTotalLL');
  const checkoutBtnTotalUsd = document.getElementById('checkoutBtnTotalUsd');
  if (checkoutBtnTotalLL) checkoutBtnTotalLL.textContent = formatLL(total);
  if (checkoutBtnTotalUsd) checkoutBtnTotalUsd.textContent = `≈ ${formatUSD(total)} USD`;

  // Update Modal Order Total Due
  const modalTotalLL = document.getElementById('modalTotalLL');
  const modalTotalUsd = document.getElementById('modalTotalUsd');
  if (modalTotalLL) modalTotalLL.textContent = formatLL(total);
  if (modalTotalUsd) modalTotalUsd.textContent = `≈ ${formatUSD(total)} USD`;

  // Two-way sync between Received Cash (L.L.) and Received Cash ($ USD)
  if (source === 'll') {
    const rawLL = tenderedInput ? tenderedInput.value.trim() : '';
    if (rawLL === '') {
      if (tenderedInputUsd) tenderedInputUsd.value = '';
    } else {
      const numLL = Number(rawLL) || 0;
      const usdVal = numLL / USD_RATE;
      if (tenderedInputUsd) {
        tenderedInputUsd.value = Number.isInteger(usdVal) ? usdVal : Number(usdVal.toFixed(2));
      }
    }
  } else if (source === 'usd') {
    const rawUSD = tenderedInputUsd ? tenderedInputUsd.value.trim() : '';
    if (rawUSD === '') {
      if (tenderedInput) tenderedInput.value = '';
    } else {
      const numUSD = Number(rawUSD) || 0;
      const llVal = Math.round(numUSD * USD_RATE);
      if (tenderedInput) tenderedInput.value = llVal || '';
    }
  }

  const tenderedLL = Number(tenderedInput ? tenderedInput.value : 0) || 0;
  state.tenderedAmount = tenderedLL;

  let changeLL = 0;
  let changeUSD = 0;

  if (tenderedLL > 0 && tenderedLL >= total) {
    changeLL = tenderedLL - total;
    changeUSD = changeLL / USD_RATE;
  }

  if (changeAmount) {
    changeAmount.textContent = formatLL(changeLL);
  }
  if (changeAmountUsd) {
    changeAmountUsd.textContent = `$${changeUSD.toFixed(2)}`;
  }

  // Also update backward compatibility elements if present
  const modalReceivedLL = document.getElementById('modalReceivedLL');
  const modalReceivedUsd = document.getElementById('modalReceivedUsd');
  const modalChangeLL = document.getElementById('modalChangeLL');
  const modalChangeUsd = document.getElementById('modalChangeUsd');
  if (modalReceivedLL) modalReceivedLL.textContent = formatLL(tenderedLL);
  if (modalReceivedUsd) modalReceivedUsd.textContent = `≈ $${(tenderedLL / USD_RATE).toFixed(2)} USD`;
  if (modalChangeLL) modalChangeLL.textContent = formatLL(changeLL);
  if (modalChangeUsd) modalChangeUsd.textContent = `≈ $${changeUSD.toFixed(2)} USD`;
}

// -----------------------------------------------------------------------------
// Integrated Touch Numeric Keypad Controller ("Numbers Buttons")
// -----------------------------------------------------------------------------
function setActiveNumpadTarget(target) {
  activeNumpadTarget = target;
  if (btnTargetLL) btnTargetLL.classList.toggle('active', target === 'll');
  if (btnTargetUSD) btnTargetUSD.classList.toggle('active', target === 'usd');
  if (wrapTenderLL) wrapTenderLL.classList.toggle('active-target', target === 'll');
  if (wrapTenderUSD) wrapTenderUSD.classList.toggle('active-target', target === 'usd');

  const posNumpadPanel = document.getElementById('posNumpadPanel');
  if (posNumpadPanel) {
    posNumpadPanel.classList.toggle('mode-usd', target === 'usd');
  }
}

function handleNumpadKey(key) {
  playBeep(900, 'sine', 0.02);
  const inputEl = activeNumpadTarget === 'll' ? tenderedInput : tenderedInputUsd;
  if (!inputEl) return;

  let current = String(inputEl.value || '').trim();

  if (key === '.') {
    if (activeNumpadTarget === 'usd') {
      if (!current.includes('.')) {
        inputEl.value = current === '' ? '0.' : current + '.';
      }
    }
    // Lebanese Lira has no decimal coins
    return;
  }

  if (key === '00') {
    if (current === '' || current === '0') {
      inputEl.value = '0';
    } else {
      inputEl.value = current + '00';
    }
  } else if (key === '000') {
    if (activeNumpadTarget === 'll') {
      if (current === '' || current === '0') {
        inputEl.value = '0';
      } else {
        inputEl.value = current + '000';
      }
    } else {
      if (current !== '' && current !== '0') {
        inputEl.value = current + '0';
      }
    }
  } else {
    // Single digit (0-9)
    if (current === '0') {
      inputEl.value = key;
    } else {
      inputEl.value = current + key;
    }
  }

  updateCalculations(activeNumpadTarget);
}

function handleNumpadBackspace() {
  playBeep(700, 'triangle', 0.02);
  const inputEl = activeNumpadTarget === 'll' ? tenderedInput : tenderedInputUsd;
  if (!inputEl) return;

  let current = String(inputEl.value || '').trim();
  if (current.length > 0) {
    current = current.slice(0, -1);
    inputEl.value = current;
    updateCalculations(activeNumpadTarget);
  }
}

function handleNumpadClear() {
  playBeep(500, 'square', 0.04);
  if (tenderedInput) tenderedInput.value = '';
  if (tenderedInputUsd) tenderedInputUsd.value = '';
  updateCalculations('ll');
}

function handleNumpadExact() {
  const total = state.cart.reduce((sum, c) => sum + (c.item.price * c.quantity), 0);
  if (total <= 0) return;

  playBeep(1100, 'sine', 0.04);
  if (activeNumpadTarget === 'll') {
    if (tenderedInput) tenderedInput.value = total;
    updateCalculations('ll');
  } else {
    const usdVal = total / USD_RATE;
    if (tenderedInputUsd) {
      tenderedInputUsd.value = Number.isInteger(usdVal) ? usdVal : Number(usdVal.toFixed(2));
    }
    updateCalculations('usd');
  }
}

function handleNumpadQuickPreset(val, cur) {
  playBeep(950, 'sine', 0.03);
  if (cur === 'usd') {
    setActiveNumpadTarget('usd');
    if (tenderedInputUsd) tenderedInputUsd.value = val;
    updateCalculations('usd');
  } else {
    setActiveNumpadTarget('ll');
    if (tenderedInput) tenderedInput.value = val;
    updateCalculations('ll');
  }
}

// -----------------------------------------------------------------------------
// Populate Receipt Container
// -----------------------------------------------------------------------------
function populateReceipt(order) {
  document.getElementById('rOrderNum').textContent = `AP-${order.orderNumber}`;
  
  const d = new Date(order.timestamp || Date.now());
  const dateFormatted = d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-US', { hour12: false });
  document.getElementById('rDate').textContent = dateFormatted;
  document.getElementById('rOrderType').textContent = (order.orderType || state.orderType).toUpperCase();

  const noteRow = document.getElementById('rNoteRow');
  if (order.customerNote) {
    noteRow.style.display = 'flex';
    document.getElementById('rNote').textContent = order.customerNote;
  } else {
    noteRow.style.display = 'none';
  }

  // Populate line items
  const rItemsBody = document.getElementById('rItemsBody');
  rItemsBody.innerHTML = '';
  order.items.forEach(it => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="col-qty">${it.quantity}x</td>
      <td class="col-desc">
        <div><strong>${it.name}</strong></div>
        ${it.nameAr ? `<div class="r-item-ar-line">${it.nameAr}</div>` : ''}
        ${it.note ? `<div class="r-item-note-line">** ${it.note}</div>` : ''}
      </td>
      <td class="col-price">${formatLL(it.price)}</td>
      <td class="col-total">${formatLL(it.lineTotal || (it.price * it.quantity))}</td>
    `;
    rItemsBody.appendChild(tr);
  });

  document.getElementById('rSubtotal').textContent = formatLL(order.total);
  document.getElementById('rTotal').textContent = formatLL(order.total);
  document.getElementById('rTotalUsd').textContent = `$${order.totalUsd || (order.total / USD_RATE).toFixed(2)}`;
  
  const tenderedLL = formatLL(order.tendered || order.total);
  const tenderedUsdStr = order.tenderedUsd ? ` ($${order.tenderedUsd})` : ` ($${((order.tendered || order.total) / USD_RATE).toFixed(2)})`;
  document.getElementById('rTendered').textContent = `${tenderedLL}${tenderedUsdStr}`;

  const changeLL = formatLL(order.change || 0);
  const changeUsdStr = order.changeUsd ? ` ($${order.changeUsd})` : ` ($${((order.change || 0) / USD_RATE).toFixed(2)})`;
  document.getElementById('rChange').textContent = `${changeLL}${changeUsdStr}`;

  // Update Prominent Checkout Change & Tender Banner
  const modalTotalLL = document.getElementById('modalTotalLL');
  const modalTotalUsd = document.getElementById('modalTotalUsd');
  const modalReceivedLL = document.getElementById('modalReceivedLL');
  const modalReceivedUsd = document.getElementById('modalReceivedUsd');
  const modalChangeLL = document.getElementById('modalChangeLL');
  const modalChangeUsd = document.getElementById('modalChangeUsd');

  const totalNum = Number(order.total) || 0;
  const totalUsdVal = order.totalUsd || (totalNum / USD_RATE).toFixed(2);
  const tenderedNum = Number(order.tendered) || totalNum;
  const tenderedUsdVal = order.tenderedUsd || (tenderedNum / USD_RATE).toFixed(2);
  const changeNum = Number(order.change) || 0;
  const changeUsdVal = order.changeUsd || (changeNum / USD_RATE).toFixed(2);

  if (modalTotalLL) modalTotalLL.textContent = formatLL(totalNum);
  if (modalTotalUsd) modalTotalUsd.textContent = `≈ $${totalUsdVal} USD`;

  if (modalReceivedLL) modalReceivedLL.textContent = formatLL(tenderedNum);
  if (modalReceivedUsd) modalReceivedUsd.textContent = `≈ $${tenderedUsdVal} USD`;

  if (modalChangeLL) modalChangeLL.textContent = formatLL(changeNum);
  if (modalChangeUsd) modalChangeUsd.textContent = `≈ $${changeUsdVal} USD`;
}

// -----------------------------------------------------------------------------
// HIGH-RESOLUTION 80MM THERMAL PRINTING
// -----------------------------------------------------------------------------
async function printReceiptDirectly() {
  if (!state.currentReceipt) return;

  if (printBtnLabel) printBtnLabel.textContent = 'Sending to Printer...';
  if (btnPrintReceipt) btnPrintReceipt.disabled = true;

  try {
    const res = await fetch('/api/print', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: state.currentReceipt })
    });
    if (res.ok) {
      if (printBtnLabel) printBtnLabel.textContent = '✅ Printed';
      showToast('🖨️ Receipt sent to 80mm Epson printer!');
      playBeep(1200, 'triangle', 0.1);
    } else {
      const err = await res.json().catch(() => ({}));
      showToast('⚠️ Print failed: ' + (err.error || res.status));
      if (printBtnLabel) printBtnLabel.textContent = 'Retry Print';
    }
  } catch (err) {
    console.error('Print error:', err);
    showToast('⚠️ Could not reach print server');
    if (printBtnLabel) printBtnLabel.textContent = 'Retry Print';
  } finally {
    setTimeout(() => {
      if (btnPrintReceipt) btnPrintReceipt.disabled = false;
      if (printBtnLabel) printBtnLabel.textContent = 'Print Again';
    }, 1500);
  }
}

// -----------------------------------------------------------------------------
// CHECKOUT POPUP & DIRECT PRINTING FLOW
// -----------------------------------------------------------------------------
function openCheckoutModal() {
  if (state.cart.length === 0) return;

  const total = state.cart.reduce((sum, c) => sum + (c.item.price * c.quantity), 0);

  // Set order metadata in modal subtitle
  const subtitleEl = document.getElementById('modalOrderSubtitle');
  if (subtitleEl) {
    const totalItems = state.cart.reduce((s, c) => s + c.quantity, 0);
    subtitleEl.textContent = `Order #AP-${state.orderNumber} • ${state.orderType} • ${totalItems} item${totalItems > 1 ? 's' : ''}`;
  }

  // Update modal totals
  const modalTotalLL = document.getElementById('modalTotalLL');
  const modalTotalUsd = document.getElementById('modalTotalUsd');
  if (modalTotalLL) modalTotalLL.textContent = formatLL(total);
  if (modalTotalUsd) modalTotalUsd.textContent = `≈ ${formatUSD(total)} USD`;

  // Update calculation states
  updateCalculations(activeNumpadTarget);

  // Reset button state
  if (btnPrintReceipt) {
    btnPrintReceipt.style.display = 'inline-flex';
    btnPrintReceipt.disabled = false;
  }
  if (printBtnLabel) printBtnLabel.textContent = 'CONFIRM & PRINT RECEIPT [Enter]';
  if (btnNewOrderAfterPrint) btnNewOrderAfterPrint.style.display = 'none';

  // Display the checkout popup modal
  receiptModal.style.display = 'flex';
  setActiveNumpadTarget('ll');
  playBeep(750, 'sine', 0.03);
}

async function confirmPaymentAndPrint() {
  if (state.cart.length === 0) return;

  const total = state.cart.reduce((sum, c) => sum + (c.item.price * c.quantity), 0);

  // If tendered input is empty or less than total, default to exact cash
  let tendered = Number(tenderedInput ? tenderedInput.value : 0) || 0;
  if (tendered < total) {
    tendered = total;
    if (tenderedInput) tenderedInput.value = total;
    if (tenderedInputUsd) tenderedInputUsd.value = Number((total / USD_RATE).toFixed(2));
    updateCalculations('ll');
  }

  const change = Math.max(0, tendered - total);
  const changeUsd = (change / USD_RATE).toFixed(2);
  const tenderedUsd = (tendered / USD_RATE).toFixed(2);

  const currentNum = state.orderNumber;
  const orderPayload = {
    orderNumber: currentNum,
    orderType: state.orderType,
    customerNote: orderNoteInput ? orderNoteInput.value.trim() : '',
    items: state.cart.map(c => ({
      id: c.item.id,
      name: c.item.name,
      nameAr: c.item.nameAr || '',
      price: c.item.price,
      quantity: c.quantity,
      lineTotal: c.item.price * c.quantity,
      note: c.note || ''
    })),
    subtotal: total,
    total: total,
    totalUsd: (total / USD_RATE).toFixed(2),
    paymentMethod: 'cash',
    tendered,
    tenderedUsd,
    change,
    changeUsd,
    timestamp: new Date().toISOString()
  };

  state.currentReceipt = orderPayload;
  populateReceipt(orderPayload);

  // Play success chime
  playBeep(1100, 'triangle', 0.08);

  if (printBtnLabel) printBtnLabel.textContent = 'Printing & Completing...';
  if (btnPrintReceipt) btnPrintReceipt.disabled = true;

  try {
    // 1. Save order to backend database
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    }).then(() => {
      loadRegisterData();
    }).catch(err => console.error('Order save error:', err));

    // 2. Direct hardware silent printing (zero browser dialog!)
    await printReceiptDirectly();

    // 3. Show success toast with change return
    const changeNotice = change > 0 ? ` • Return: ${formatLL(change)} ($${changeUsd})` : '';
    showToast(`✅ Order #AP-${currentNum} Completed!${changeNotice}`, 3500);

    // 4. Close modal and start new order after brief pause
    setTimeout(() => {
      startNewOrder();
    }, 600);
  } catch (err) {
    console.error('Checkout error:', err);
    startNewOrder();
  }
}

// Alias for compatibility
const processCheckout = openCheckoutModal;

function startNewOrder() {
  receiptModal.style.display = 'none';
  state.cart = [];
  state.orderNumber += 1;
  orderNoteInput.value = '';
  tenderedInput.value = '';
  if (tenderedInputUsd) tenderedInputUsd.value = '';
  if (changeAmount) changeAmount.textContent = '0 L.L.';
  if (changeAmountUsd) changeAmountUsd.textContent = '$0.00';
  setActiveNumpadTarget('ll');
  updateTicketHeader();
  renderTicket();
  renderItems();
  updateCalculations();
  searchInput.focus();
}

// -----------------------------------------------------------------------------
// Menu Management (Directly reads and writes items.json)
// -----------------------------------------------------------------------------
function openMenuModal() {
  populateCategorySelect();
  renderManageTable();
  const addCategoryBox = document.getElementById('addCategoryBox');
  if (addCategoryBox) addCategoryBox.style.display = 'none';
  if (newItemPriceHelper) newItemPriceHelper.style.display = 'none';
  menuModal.style.display = 'flex';
}

function renderManageTable() {
  manageItemsTableBody.innerHTML = '';
  manageItemsCount.textContent = state.items.length;

  state.items.forEach(item => {
    const catId = item.categoryId || 'sandwiches';
    const catObj = state.categories.find(c => c.id === catId);
    const catColor = catObj?.color || '#64748b';
    const catName = catObj ? catObj.name : (item.category || item.categoryId);

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <strong>${item.name}</strong>
        ${item.nameAr ? `<br><small style="color:var(--text-muted);">${item.nameAr}</small>` : ''}
      </td>
      <td>
        <span class="manage-cat-badge" style="background-color: ${catColor}1a; color: ${catColor}; border: 1px solid ${catColor}44;">
          ${catName}
        </span>
      </td>
      <td><strong>${formatLL(item.price)}</strong></td>
      <td><span class="badge-available">${item.isAvailable !== false ? 'In Stock' : 'Out'}</span></td>
      <td>
        <button class="btn-del-item" data-id="${item.id}" title="Remove item from items.json">Delete</button>
      </td>
    `;

    tr.querySelector('.btn-del-item').addEventListener('click', async (e) => {
      e.stopPropagation();
      if (confirm(`Remove "${item.name}" from items.json?`)) {
        await deleteItem(item.id);
      }
    });

    manageItemsTableBody.appendChild(tr);
  });
}

async function handleAddCategory(e) {
  e.preventDefault();
  const nameInput = document.getElementById('newCatName');
  const nameArInput = document.getElementById('newCatNameAr');
  const colorInput = document.getElementById('newCatColor');

  const name = nameInput ? nameInput.value.trim() : '';
  const nameAr = nameArInput ? nameArInput.value.trim() : '';
  const color = colorInput ? colorInput.value : '#10b981';

  if (!name) return;

  try {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, nameAr, color })
    });

    if (res.ok) {
      const savedCategory = await res.json();
      state.categories.push(savedCategory);

      // Re-render categories tabs and populate category dropdown
      renderCategories();
      populateCategorySelect(savedCategory.id);

      // Reset and hide form
      const addCategoryForm = document.getElementById('addCategoryForm');
      if (addCategoryForm) addCategoryForm.reset();
      const addCategoryBox = document.getElementById('addCategoryBox');
      if (addCategoryBox) addCategoryBox.style.display = 'none';

      // Reset color preview
      const catColorPreview = document.getElementById('catColorPreview');
      if (catColorPreview) {
        catColorPreview.textContent = '#10b981';
        catColorPreview.style.backgroundColor = '#10b981';
        catColorPreview.style.color = '#ffffff';
      }

      playBeep(950, 'triangle', 0.05);
      showToast(`📁 Category "${savedCategory.name}" created!`);
    } else {
      const err = await res.json();
      alert(`Error: ${err.error || 'Failed to create category'}`);
    }
  } catch (err) {
    console.error('Error adding category:', err);
    alert('Failed to create category');
  }
}

// Live Dual-Currency Conversion for Item Creation
function syncItemPriceInputs(source) {
  if (source === 'usd') {
    const rawUsd = newItemPriceUsd ? newItemPriceUsd.value.trim() : '';
    if (!rawUsd) {
      if (newItemPrice) newItemPrice.value = '';
      if (newItemPriceHelper) newItemPriceHelper.style.display = 'none';
      return;
    }
    const numUsd = parseFloat(rawUsd);
    if (!isNaN(numUsd) && numUsd >= 0) {
      const llVal = Math.round(numUsd * USD_RATE);
      if (newItemPrice) newItemPrice.value = llVal;
      showPriceHelper(llVal, numUsd);
    }
  } else if (source === 'll') {
    const rawLL = newItemPrice ? newItemPrice.value.trim() : '';
    if (!rawLL) {
      if (newItemPriceUsd) newItemPriceUsd.value = '';
      if (newItemPriceHelper) newItemPriceHelper.style.display = 'none';
      return;
    }
    const numLL = parseFloat(rawLL);
    if (!isNaN(numLL) && numLL >= 0) {
      const usdVal = numLL / USD_RATE;
      if (newItemPriceUsd) {
        newItemPriceUsd.value = Number.isInteger(usdVal) ? usdVal : Number(usdVal.toFixed(2));
      }
      showPriceHelper(numLL, usdVal);
    }
  }
}

function showPriceHelper(ll, usd) {
  if (!newItemPriceHelper) return;
  const formattedLL = Math.round(ll).toLocaleString('en-US') + ' L.L.';
  const formattedUSD = '$' + Number(usd).toFixed(2);
  newItemPriceHelper.innerHTML = `💵 <strong>${formattedLL}</strong> ≈ <strong>${formattedUSD}</strong> <span style="margin-left:auto;font-weight:normal;color:#15803d;">(Rate: ${Number(USD_RATE).toLocaleString('en-US')} L.L. / $1)</span>`;
  newItemPriceHelper.style.display = 'flex';
}

async function handleAddItem(e) {
  e.preventDefault();
  const name = document.getElementById('newItemName').value.trim();
  const nameAr = document.getElementById('newItemNameAr').value.trim();
  const categoryId = document.getElementById('newItemCategory').value;
  
  // Accept price from L.L. input or calculate from USD input
  let price = Number(document.getElementById('newItemPrice').value);
  if ((!price || isNaN(price)) && newItemPriceUsd && newItemPriceUsd.value) {
    price = Math.round(Number(newItemPriceUsd.value) * USD_RATE);
  }

  if (!price || isNaN(price) || price <= 0) {
    alert('Please enter a valid price (greater than 0) in USD or L.L.');
    return;
  }

  const description = document.getElementById('newItemDesc').value.trim();

  const catObj = state.categories.find(c => c.id === categoryId);
  const category = catObj ? catObj.name : categoryId;

  const newItem = {
    id: 'item-' + Date.now(),
    name,
    nameAr: nameAr || name,
    categoryId,
    category,
    price,
    description,
    isAvailable: true
  };

  try {
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem)
    });

    if (res.ok) {
      const saved = await res.json();
      state.items.push(saved);
      addItemForm.reset();
      if (newItemPriceUsd) newItemPriceUsd.value = '';
      if (newItemPriceHelper) newItemPriceHelper.style.display = 'none';
      renderManageTable();
      renderCategories();
      renderItems();
      showToast(`Added "${saved.name}" to menu`);
    } else {
      const err = await res.json();
      alert(`Error: ${err.error || 'Failed to save item'}`);
    }
  } catch (err) {
    console.error('Error adding item:', err);
    alert('Failed to add item to items.json');
  }
}

async function deleteItem(id) {
  try {
    const res = await fetch(`/api/items/${id}`, { method: 'DELETE' });
    if (res.ok) {
      state.items = state.items.filter(it => it.id !== id);
      renderManageTable();
      renderCategories();
      renderItems();
      showToast('Item deleted from menu');
    }
  } catch (err) {
    console.error('Error deleting item:', err);
  }
}

// -----------------------------------------------------------------------------
// Cash Register & Drawer Management
// -----------------------------------------------------------------------------
async function openRegisterModal() {
  await loadRegisterData();
  const reg = state.register;
  if (regCurrentStarting) regCurrentStarting.textContent = formatLL(reg.startingCash);
  if (regOrdersSales) regOrdersSales.textContent = formatLL(reg.ordersSales);
  if (regOrdersCountSub) regOrdersCountSub.textContent = `${reg.totalOrders || 0} orders`;
  if (regTotalDrawer) regTotalDrawer.textContent = formatLL(reg.totalCashInDrawer);
  if (regTotalDrawerUsd) regTotalDrawerUsd.textContent = `≈ ${formatUSD(reg.totalCashInDrawer)} USD`;
  
  if (startingCashInput) {
    startingCashInput.value = reg.startingCash || 0;
  }
  updateRegisterPreview(reg.startingCash || 0);
  
  registerModal.style.display = 'flex';
  if (startingCashInput) {
    startingCashInput.focus();
    startingCashInput.select();
  }
}

function updateRegisterPreview(startingVal) {
  const start = Math.max(0, Number(startingVal) || 0);
  const sales = state.register.ordersSales || 0;
  const newTotal = start + sales;
  if (regPreviewTotal) regPreviewTotal.textContent = formatLL(newTotal);
  if (regPreviewUsd) regPreviewUsd.textContent = `(≈ ${formatUSD(newTotal)} USD)`;
}

async function saveRegisterCash() {
  const val = Math.max(0, Number(startingCashInput.value) || 0);
  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startingCash: val })
    });
    if (res.ok) {
      const updated = await res.json();
      state.register = updated;
      if (headerDrawerCash) headerDrawerCash.textContent = formatLL(updated.totalCashInDrawer);
      playBeep(950, 'triangle', 0.08);
      showToast(`💵 Cash register updated: ${formatLL(updated.totalCashInDrawer)} in drawer!`);
      registerModal.style.display = 'none';

      // Refresh modals if visible
      if (ordersLogModal && ordersLogModal.style.display === 'flex') {
        openOrdersHistory();
      }
      if (statsModal && statsModal.style.display === 'flex') {
        openShiftStats();
      }
    }
  } catch (err) {
    console.error('Error saving register cash:', err);
    showToast('❌ Error updating cash register');
  }
}

// -----------------------------------------------------------------------------
// Shift Stats & Orders History (Cash Only)
// -----------------------------------------------------------------------------
async function openShiftStats() {
  try {
    const res = await fetch('/api/stats');
    if (res.ok) {
      const stats = await res.json();
      document.getElementById('statTotalSales').textContent = formatLL(stats.totalSales);
      document.getElementById('statTotalSalesUsd').textContent = `≈ ${formatUSD(stats.totalSales)} USD`;
      document.getElementById('statTotalOrders').textContent = stats.totalOrders;
      document.getElementById('statCashSales').textContent = formatLL(stats.totalCashInDrawer || stats.totalSales);
      
      const startingFloatEl = document.getElementById('statStartingFloat');
      if (startingFloatEl) startingFloatEl.textContent = formatLL(stats.startingCash || 0);
      const ordersRevEl = document.getElementById('statOrdersRevenue');
      if (ordersRevEl) ordersRevEl.textContent = `+ ${formatLL(stats.totalSales)}`;
      const expectedEl = document.getElementById('statTotalDrawerExpected');
      if (expectedEl) expectedEl.textContent = formatLL(stats.totalCashInDrawer || stats.totalSales);
      if (headerDrawerCash) headerDrawerCash.textContent = formatLL(stats.totalCashInDrawer || stats.totalSales);
    }
    statsModal.style.display = 'flex';
  } catch (e) {
    console.error(e);
  }
}

async function openOrdersHistory() {
  try {
    const [ordersRes, regRes] = await Promise.all([
      fetch('/api/orders'),
      fetch('/api/register')
    ]);

    if (ordersRes.ok && regRes.ok) {
      const orders = await ordersRes.json();
      const reg = await regRes.json();
      state.register = reg;

      // Update Orders Log Register Banner
      if (logStartingCash) logStartingCash.textContent = formatLL(reg.startingCash);
      if (logOrdersSales) logOrdersSales.textContent = formatLL(reg.ordersSales);
      if (logOrdersCount) logOrdersCount.textContent = `${orders.length} orders`;
      if (logDrawerTotal) logDrawerTotal.textContent = formatLL(reg.totalCashInDrawer);
      if (logDrawerTotalUsd) logDrawerTotalUsd.textContent = `≈ ${formatUSD(reg.totalCashInDrawer)} USD`;
      if (headerDrawerCash) headerDrawerCash.textContent = formatLL(reg.totalCashInDrawer);

      // Compute running drawer balance for each order chronologically (oldest to newest)
      const startingFloat = Number(reg.startingCash) || 0;
      let runningCash = startingFloat;
      const chronologicalOrders = [...orders].reverse();
      chronologicalOrders.forEach(ord => {
        runningCash += Number(ord.total) || 0;
        ord.drawerBalanceAfter = runningCash;
      });

      ordersLogTableBody.innerHTML = '';
      if (orders.length === 0) {
        ordersLogTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:24px; color:var(--text-muted);">No completed orders in this shift yet. Base cash in register is ${formatLL(startingFloat)}.</td></tr>`;
      } else {
        orders.forEach(o => {
          const tr = document.createElement('tr');
          const d = new Date(o.timestamp);
          const time = d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
          const itemsSummary = o.items ? o.items.map(it => `${it.quantity}x ${it.name}`).join(', ') : '';
          const drawerAfter = o.drawerBalanceAfter !== undefined ? formatLL(o.drawerBalanceAfter) : '--';

          tr.innerHTML = `
            <td><strong>#${o.orderNumber || o.id}</strong></td>
            <td>${time}</td>
            <td><span class="cat-count">${o.orderType || 'Takeaway'}</span></td>
            <td style="max-width:210px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${itemsSummary}">${itemsSummary}</td>
            <td><strong class="text-emerald">${formatLL(o.total)}</strong></td>
            <td><strong class="text-amber" title="Cash in register after this order">${drawerAfter}</strong></td>
            <td><button class="btn-reprint">Reprint</button></td>
          `;

          // Direct Silent Reprint (No browser popup!)
          tr.querySelector('.btn-reprint').addEventListener('click', async () => {
            ordersLogModal.style.display = 'none';
            state.currentReceipt = o;
            populateReceipt(o);
            receiptModal.style.display = 'flex';
            printReceiptDirectly();
          });

          ordersLogTableBody.appendChild(tr);
        });
      }
    }
    ordersLogModal.style.display = 'flex';
  } catch (e) {
    console.error(e);
  }
}

async function printShiftSummaryReport() {
  if (printShiftReportLabel) printShiftReportLabel.textContent = 'Printing Summary...';
  if (btnPrintShiftReport) btnPrintShiftReport.disabled = true;

  try {
    const res = await fetch('/api/print-shift', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      if (printShiftReportLabel) printShiftReportLabel.textContent = '✅ Summary Printed';
      showToast('🖨️ Shift & Cash Drawer report sent to printer!');
      playBeep(1200, 'triangle', 0.1);
    }
  } catch (err) {
    console.error('Error printing shift report:', err);
    showToast('Printed Shift Summary');
  } finally {
    setTimeout(() => {
      if (btnPrintShiftReport) btnPrintShiftReport.disabled = false;
      if (printShiftReportLabel) printShiftReportLabel.textContent = 'Print Shift & Drawer Summary';
    }, 1500);
  }
}

// -----------------------------------------------------------------------------
// Event Listeners & Hotkeys
// -----------------------------------------------------------------------------
function setupEventListeners() {
  // Search
  searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    clearSearchBtn.style.display = state.searchQuery ? 'block' : 'none';
    renderItems();
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    state.searchQuery = '';
    clearSearchBtn.style.display = 'none';
    renderItems();
    searchInput.focus();
  });

  resetFiltersBtn.addEventListener('click', () => {
    searchInput.value = '';
    state.searchQuery = '';
    state.selectedCategory = 'all';
    document.querySelectorAll('.cat-pill').forEach(b => {
      b.classList.toggle('active', b.dataset.category === 'all');
    });
    renderItems();
  });

  // Clear ticket
  btnClearCart.addEventListener('click', clearCart);

  // Order Type
  orderTypeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      playBeep(500, 'sine', 0.02);
      orderTypeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.orderType = btn.dataset.type;
    });
  });

  // Dual-Currency Tender Inputs (L.L. & USD @ 90,000)
  if (tenderedInput) {
    tenderedInput.addEventListener('input', () => updateCalculations('ll'));
    tenderedInput.addEventListener('focus', () => setActiveNumpadTarget('ll'));
  }
  if (tenderedInputUsd) {
    tenderedInputUsd.addEventListener('input', () => updateCalculations('usd'));
    tenderedInputUsd.addEventListener('focus', () => setActiveNumpadTarget('usd'));
  }

  // Numpad Target Switchers
  if (btnTargetLL) {
    btnTargetLL.addEventListener('click', () => {
      playBeep(650, 'sine', 0.02);
      setActiveNumpadTarget('ll');
    });
  }
  if (btnTargetUSD) {
    btnTargetUSD.addEventListener('click', () => {
      playBeep(650, 'sine', 0.02);
      setActiveNumpadTarget('usd');
    });
  }
  if (btnQuickExact) {
    btnQuickExact.addEventListener('click', handleNumpadExact);
  }

  // Numpad Digit & Action Buttons
  if (numpadButtons) {
    numpadButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.key;
        const action = btn.dataset.action;
        if (key !== undefined) {
          handleNumpadKey(key);
        } else if (action === 'backspace') {
          handleNumpadBackspace();
        } else if (action === 'clear') {
          handleNumpadClear();
        } else if (action === 'pay') {
          if (state.cart.length > 0) {
            playBeep(1200, 'sine', 0.05);
            confirmPaymentAndPrint();
          } else {
            showToast('⚠️ Add items to order first');
          }
        }
      });
    });
  }

  // Numpad Quick Presets
  if (numpadPresetPills) {
    numpadPresetPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const val = pill.dataset.val;
        const cur = pill.dataset.cur;
        handleNumpadQuickPreset(val, cur);
      });
    });
  }

  // Checkout Button (Opens Checkout Modal)
  btnCheckout.addEventListener('click', openCheckoutModal);

  // Receipt & Checkout Modal actions
  closeReceiptModal.addEventListener('click', () => {
    receiptModal.style.display = 'none';
  });
  const btnCancelCheckout = document.getElementById('btnCancelCheckout');
  if (btnCancelCheckout) {
    btnCancelCheckout.addEventListener('click', () => {
      receiptModal.style.display = 'none';
    });
  }
  btnPrintReceipt.addEventListener('click', confirmPaymentAndPrint);
  btnNewOrderAfterPrint.addEventListener('click', startNewOrder);

  // Menu Modal
  btnManageMenu.addEventListener('click', openMenuModal);
  closeMenuModal.addEventListener('click', () => { menuModal.style.display = 'none'; });
  addItemForm.addEventListener('submit', handleAddItem);

  // Dual-Currency Item Creation Price Inputs
  if (newItemPriceUsd) {
    newItemPriceUsd.addEventListener('input', () => syncItemPriceInputs('usd'));
  }
  if (newItemPrice) {
    newItemPrice.addEventListener('input', () => syncItemPriceInputs('ll'));
  }

  // Category Creation in Manage Menu Modal
  const btnToggleAddCategory = document.getElementById('btnToggleAddCategory');
  const btnLinkAddCat = document.getElementById('btnLinkAddCat');
  const btnCloseCatBox = document.getElementById('btnCloseCatBox');
  const btnCancelCategory = document.getElementById('btnCancelCategory');
  const addCategoryBox = document.getElementById('addCategoryBox');
  const addCategoryForm = document.getElementById('addCategoryForm');
  const newCatColor = document.getElementById('newCatColor');
  const catColorPreview = document.getElementById('catColorPreview');
  const newCatName = document.getElementById('newCatName');

  const toggleCategoryBox = (show) => {
    if (!addCategoryBox) return;
    const shouldShow = show !== undefined ? show : (addCategoryBox.style.display === 'none' || !addCategoryBox.style.display);
    addCategoryBox.style.display = shouldShow ? 'block' : 'none';
    if (shouldShow && newCatName) {
      newCatName.focus();
    }
  };

  if (btnToggleAddCategory) {
    btnToggleAddCategory.addEventListener('click', () => toggleCategoryBox());
  }
  if (btnLinkAddCat) {
    btnLinkAddCat.addEventListener('click', () => toggleCategoryBox(true));
  }
  if (btnCloseCatBox) {
    btnCloseCatBox.addEventListener('click', () => toggleCategoryBox(false));
  }
  if (btnCancelCategory) {
    btnCancelCategory.addEventListener('click', () => toggleCategoryBox(false));
  }
  if (newCatColor && catColorPreview) {
    newCatColor.addEventListener('input', (e) => {
      const hex = e.target.value;
      catColorPreview.textContent = hex;
      catColorPreview.style.backgroundColor = hex;
      catColorPreview.style.color = getContrastColor(hex);
    });
  }
  if (addCategoryForm) {
    addCategoryForm.addEventListener('submit', handleAddCategory);
  }

  // Stats Modal
  btnShiftSummary.addEventListener('click', openShiftStats);
  closeStatsModal.addEventListener('click', () => { statsModal.style.display = 'none'; });
  closeStatsBtn.addEventListener('click', () => { statsModal.style.display = 'none'; });
  if (btnOpenRegisterFromStats) {
    btnOpenRegisterFromStats.addEventListener('click', () => {
      statsModal.style.display = 'none';
      openRegisterModal();
    });
  }

  // Orders Log Modal
  btnOrderHistory.addEventListener('click', openOrdersHistory);
  closeOrdersModal.addEventListener('click', () => { ordersLogModal.style.display = 'none'; });
  closeOrdersBtn.addEventListener('click', () => { ordersLogModal.style.display = 'none'; });
  if (btnEditFloatFromLog) {
    btnEditFloatFromLog.addEventListener('click', () => {
      openRegisterModal();
    });
  }
  if (btnPrintShiftReport) {
    btnPrintShiftReport.addEventListener('click', printShiftSummaryReport);
  }

  // Cash Register Drawer Modal
  if (btnCashRegister) {
    btnCashRegister.addEventListener('click', openRegisterModal);
  }
  if (closeRegisterModal) {
    closeRegisterModal.addEventListener('click', () => { registerModal.style.display = 'none'; });
  }
  if (cancelRegisterBtn) {
    cancelRegisterBtn.addEventListener('click', () => { registerModal.style.display = 'none'; });
  }
  if (btnSaveRegisterCash) {
    btnSaveRegisterCash.addEventListener('click', saveRegisterCash);
  }

  // Quick Preset Buttons for Cash Drawer
  if (regPresets) {
    regPresets.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        playBeep(750, 'sine', 0.02);
        const presetVal = Number(btn.dataset.preset) || 0;
        if (startingCashInput) {
          startingCashInput.value = presetVal;
          updateRegisterPreview(presetVal);
        }
      });
    });
  }

  if (startingCashInput) {
    startingCashInput.addEventListener('input', (e) => {
      updateRegisterPreview(e.target.value);
    });
    startingCashInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveRegisterCash();
      }
    });
  }

  // Keyboard Shortcuts for Cashier Ergonomics
  window.addEventListener('keydown', (e) => {
    // Esc closes any open modal or clears search
    if (e.key === 'Escape') {
      if (receiptModal.style.display === 'flex') receiptModal.style.display = 'none';
      else if (registerModal && registerModal.style.display === 'flex') registerModal.style.display = 'none';
      else if (menuModal.style.display === 'flex') menuModal.style.display = 'none';
      else if (statsModal.style.display === 'flex') statsModal.style.display = 'none';
      else if (ordersLogModal.style.display === 'flex') ordersLogModal.style.display = 'none';
      else if (document.activeElement === searchInput) {
        searchInput.value = '';
        state.searchQuery = '';
        clearSearchBtn.style.display = 'none';
        renderItems();
        searchInput.blur();
      }
      return;
    }

    // '/' or 'F2' focuses search
    if ((e.key === '/' || e.key === 'F2') && document.activeElement !== searchInput && document.activeElement.tagName !== 'INPUT') {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
      return;
    }

    // F9 clears active ticket
    if (e.key === 'F9') {
      e.preventDefault();
      clearCart();
      return;
    }

    // Enter triggers checkout popup or confirms payment
    if (e.key === 'Enter') {
      if (receiptModal.style.display === 'flex') {
        e.preventDefault();
        confirmPaymentAndPrint();
      } else if (state.cart.length > 0 && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        openCheckoutModal();
      }
    }
  });
}

// -----------------------------------------------------------------------------
// Start the App
// -----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  initApp();
  setupEventListeners();
});
