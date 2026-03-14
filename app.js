/* ════════════════════════════════════════════
   MODA — app.js
   Autenticación simulada + Carrito de compras
   usando localStorage (Client-Side State)
════════════════════════════════════════════ */

// ── PRODUCTOS ──────────────────────────────
const PRODUCTS = [
  { id: 1, name: 'Blazer Clásico', category: 'ropa', price: 899, emoji: '🧥', desc: 'Corte slim fit, perfecto para cualquier ocasión.' },
  { id: 2, name: 'Vestido Floral', category: 'ropa', price: 650, emoji: '👗', desc: 'Tela ligera, ideal para primavera y verano.' },
  { id: 3, name: 'Jeans Premium', category: 'ropa', price: 550, emoji: '👖', desc: 'Denim de alta calidad, corte recto.' },
  { id: 4, name: 'Camisa de Lino', category: 'ropa', price: 420, emoji: '👔', desc: 'Fresca y elegante para días calurosos.' },
  { id: 5, name: 'Bolsa de Cuero', category: 'accesorios', price: 1200, emoji: '👜', desc: 'Cuero genuino, varios compartimentos.' },
  { id: 6, name: 'Cinturón Trenzado', category: 'accesorios', price: 320, emoji: '🪢', desc: 'Hecho a mano, tallas ajustables.' },
  { id: 7, name: 'Gafas de Sol', category: 'accesorios', price: 480, emoji: '🕶️', desc: 'Protección UV400, montura italiana.' },
  { id: 8, name: 'Reloj Minimalista', category: 'accesorios', price: 1800, emoji: '⌚', desc: 'Esfera limpia, correa de piel.' },
  { id: 9, name: 'Sneakers Blancos', category: 'calzado', price: 750, emoji: '👟', desc: 'Suela ergonómica, estilo urbano.' },
  { id: 10, name: 'Botas de Cuero', category: 'calzado', price: 1400, emoji: '🥾', desc: 'Resistentes al agua, toque vintage.' },
  { id: 11, name: 'Sandalias Planas', category: 'calzado', price: 380, emoji: '🩴', desc: 'Ligeras y cómodas, suela acolchada.' },
  { id: 12, name: 'Tacones Elegantes', category: 'calzado', price: 920, emoji: '👠', desc: 'Clásicos y versátiles para toda ocasión.' },
];

// ── ESTADO ─────────────────────────────────
let currentFilter = 'all';
let cartOpen = false;

// ── UTILIDADES LOCALSTORAGE ─────────────────

function getUsers() {
  return JSON.parse(localStorage.getItem('moda_users') || '[]');
}

function saveUsers(users) {
  localStorage.setItem('moda_users', JSON.stringify(users));
}

function getSession() {
  return JSON.parse(localStorage.getItem('moda_session') || 'null');
}

function saveSession(user) {
  localStorage.setItem('moda_session', JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem('moda_session');
}

function getCart() {
  const session = getSession();
  if (!session) return [];
  const key = `moda_cart_${session.email}`;
  return JSON.parse(localStorage.getItem(key) || '[]');
}

function saveCart(cart) {
  const session = getSession();
  if (!session) return;
  const key = `moda_cart_${session.email}`;
  localStorage.setItem(key, JSON.stringify(cart));
}

// ── AUTH ────────────────────────────────────

function switchTab(tab) {
  document.getElementById('login-form').classList.toggle('hidden', tab !== 'login');
  document.getElementById('register-form').classList.toggle('hidden', tab !== 'register');
  document.querySelectorAll('.tab-btn').forEach((b, i) => {
    b.classList.toggle('active', (i === 0 && tab === 'login') || (i === 1 && tab === 'register'));
  });
}

function login() {
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const pass  = document.getElementById('login-pass').value;
  const errEl = document.getElementById('login-error');
  errEl.textContent = '';

  if (!email || !pass) { errEl.textContent = 'Completa todos los campos.'; return; }

  // Usuario demo incluido siempre
  const demoUser = { name: 'Usuario Demo', email: 'usuario@demo.com', password: '1234' };
  const users = [...getUsers(), demoUser];
  const found = users.find(u => u.email === email && u.password === pass);

  if (!found) { errEl.textContent = 'Correo o contraseña incorrectos.'; return; }

  saveSession({ name: found.name, email: found.email });
  initApp();
}

function register() {
  const name  = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim().toLowerCase();
  const pass  = document.getElementById('reg-pass').value;
  const errEl = document.getElementById('reg-error');
  errEl.textContent = '';

  if (!name || !email || !pass) { errEl.textContent = 'Completa todos los campos.'; return; }
  if (pass.length < 4) { errEl.textContent = 'La contraseña debe tener al menos 4 caracteres.'; return; }

  const users = getUsers();
  if (users.find(u => u.email === email)) { errEl.textContent = 'Este correo ya está registrado.'; return; }

  users.push({ name, email, password: pass });
  saveUsers(users);
  saveSession({ name, email });
  initApp();
}

function logout() {
  clearSession();
  document.getElementById('app').classList.add('hidden');
  document.getElementById('auth-overlay').classList.remove('hidden');
  // Limpiar campos
  ['login-email', 'login-pass', 'reg-name', 'reg-email', 'reg-pass'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  switchTab('login');
}

// ── INICIALIZAR APP ─────────────────────────

function initApp() {
  const session = getSession();
  if (!session) return;

  document.getElementById('auth-overlay').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  document.getElementById('nav-user').textContent = `Hola, ${session.name.split(' ')[0]} 👋`;

  renderProducts('all');
  updateCartUI();
}

// ── PRODUCTOS ──────────────────────────────

function filterProducts(category, btn) {
  currentFilter = category;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderProducts(category);
}

function renderProducts(category) {
  const grid = document.getElementById('products-grid');
  const filtered = category === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.category === category);

  grid.innerHTML = filtered.map((p, i) => `
    <div class="product-card" style="animation-delay:${i * 0.06}s">
      <div class="product-img">${p.emoji}</div>
      <div class="product-body">
        <p class="product-category">${p.category}</p>
        <h3 class="product-name">${p.name}</h3>
        <p class="product-desc">${p.desc}</p>
        <div class="product-footer">
          <span class="product-price">$${p.price.toFixed(2)}</span>
          <button class="btn-add" onclick="addToCart(${p.id})">+ Agregar</button>
        </div>
      </div>
    </div>
  `).join('');
}

// ── CARRITO ────────────────────────────────

function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  let cart = getCart();
  const existing = cart.find(i => i.id === productId);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, emoji: product.emoji, qty: 1 });
  }

  saveCart(cart);
  updateCartUI();
  showToast(`${product.emoji} ${product.name} agregado al carrito`);
}

function changeQty(productId, delta) {
  let cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== productId);
  }

  saveCart(cart);
  updateCartUI();
}

function clearCart() {
  saveCart([]);
  updateCartUI();
  showToast('🗑️ Carrito vaciado');
}

function checkout() {
  const cart = getCart();
  if (cart.length === 0) { showToast('Tu carrito está vacío'); return; }

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  saveCart([]);
  updateCartUI();
  toggleCart();
  showToast(`✅ Compra realizada — Total: $${total.toFixed(2)}`);
}

function updateCartUI() {
  const cart = getCart();
  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);
  const totalPrice = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  document.getElementById('cart-count').textContent = totalItems;
  document.getElementById('cart-total').textContent = `$${totalPrice.toFixed(2)}`;

  const itemsEl = document.getElementById('cart-items');
  if (cart.length === 0) {
    itemsEl.innerHTML = '<p class="cart-empty">Tu carrito está vacío 🛍️</p>';
    return;
  }

  itemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <span class="cart-item-icon">${item.emoji}</span>
      <div class="cart-item-info">
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</p>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
      </div>
    </div>
  `).join('');
}

function toggleCart() {
  cartOpen = !cartOpen;
  document.getElementById('cart-sidebar').classList.toggle('hidden', !cartOpen);
  document.getElementById('cart-overlay-bg').classList.toggle('hidden', !cartOpen);
}

// ── TOAST ──────────────────────────────────

let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 2500);
}

// ── ARRANQUE ───────────────────────────────
(function init() {
  const session = getSession();
  if (session) {
    initApp();
  }
})();
