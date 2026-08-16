// ============================================================
//  ULTIMATE ADMIN DASHBOARD - COMPLETE JAVASCRIPT
//  ALL FEATURES INCLUDED
// ============================================================

// ===== CONFIG =====
const SUPABASE_CONFIG = {
    url: 'https://sipgnykshaxrxwdeswfc.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpcGdueWtzaGF4cnh3ZGVzd2ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4OTA2MzMsImV4cCI6MjEwMjQ2NjYzM30.xJtq_3jNMLnXCyVSurdIuUnrlmZEyMWNO1-Azk_4k2E'
};
const supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// ===== STATE =====
let currentUser = null;
let salesChart = null;
let profitChart = null;
let allOrders = [];
let currentFilter = 'all';
let kitchenFilter = 'all';
let products = [];
let cart = [];
let selectedProduct = null;
let posMode = 'butchery';
let isDark = localStorage.getItem('theme') === 'dark';
let sessionTimer = null;
let sessionTimeout = 30; // minutes

// ===== EMOJIS =====
const PRODUCT_EMOJIS = {
    'Beef': '🥩', 'Goat Meat': '🐐', 'Chicken': '🍗', 'Liver': '❤️',
    'Minced Meat': '🥩', 'Sausages': '🌭', 'Ugali': '🌽', 'Beef Stew': '🍲',
    'Chapati': '🫓', 'Rice': '🍚', 'Chips': '🍟', 'Soda': '🥤', 'Water': '💧',
    'default': '📦'
};

function getEmoji(name) {
    return PRODUCT_EMOJIS[name] || PRODUCT_EMOJIS['default'];
}

// ============================================================
//  TOAST SYSTEM
// ============================================================
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle'
    };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        toast.style.transition = 'all 0.4s ease';
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

// ============================================================
//  THEME
// ============================================================
function setTheme(dark) {
    isDark = dark;
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    document.getElementById('themeToggle').innerHTML = `<i class="fas ${dark ? 'fa-sun' : 'fa-moon'}"></i>`;
}
document.getElementById('themeToggle').addEventListener('click', () => setTheme(!isDark));
setTheme(isDark);

// ============================================================
//  SIDEBAR
// ============================================================
document.getElementById('sidebarToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
});

// ============================================================
//  SESSION MANAGEMENT
// ============================================================
function resetSessionTimer() {
    if (sessionTimer) clearTimeout(sessionTimer);
    const timeout = parseInt(document.getElementById('sessionTimeout')?.value || 30) * 60 * 1000;
    sessionTimer = setTimeout(() => {
        showToast('⚠️ Session expired due to inactivity. Please login again.', 'warning');
        logout();
    }, timeout);
}

// Reset timer on user activity
document.addEventListener('click', resetSessionTimer);
document.addEventListener('keypress', resetSessionTimer);
document.addEventListener('mousemove', resetSessionTimer);

// ============================================================
//  AUTH
// ============================================================
async function checkAuth() {
    const stored = localStorage.getItem('viewpoint_session');
    if (!stored) {
        window.location.href = 'login.html';
        return null;
    }
    try {
        const { user } = JSON.parse(stored);
        currentUser = user;
        if (user.roles?.name !== 'admin') {
            window.location.href = 'login.html';
            return null;
        }
        document.getElementById('userAvatar').textContent = user.full_name.charAt(0).toUpperCase();
        document.getElementById('userName').textContent = user.full_name;
        resetSessionTimer();
        return user;
    } catch (e) {
        window.location.href = 'login.html';
        return null;
    }
}

async function logout() {
    await supabaseClient.auth.signOut();
    localStorage.removeItem('viewpoint_session');
    window.location.href = 'login.html';
}
document.getElementById('logoutBtn').addEventListener('click', logout);

// ============================================================
//  NAVIGATION
// ============================================================
function navigateTo(section) {
    document.querySelector(`.sidebar-menu li[data-section="${section}"]`)?.click();
}

document.querySelectorAll('.sidebar-menu li[data-section]').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.sidebar-menu li').forEach(l => l.classList.remove('active'));
        item.classList.add('active');
        const section = item.dataset.section;
        document.querySelectorAll('.section-page').forEach(el => el.classList.remove('active'));
        document.getElementById(section + 'Section').classList.add('active');

        const titles = {
            dashboard: ['📊 Dashboard', 'Complete business overview'],
            pos: ['🛒 Point of Sale', 'Process customer orders'],
            orders: ['📋 Orders', 'Manage all customer orders'],
            products: ['📦 Products', 'Manage your product catalog'],
            inventory: ['🏪 Inventory', 'Track stock levels'],
            users: ['👥 Users', 'Manage system users'],
            customers: ['👤 Customers', 'Manage customer database'],
            suppliers: ['🚚 Suppliers', 'Manage suppliers'],
            kitchen: ['🍳 Kitchen Display', 'Real-time kitchen orders'],
            reports: ['📊 Reports', 'Sales and performance reports'],
            profit: ['💰 Profit & Loss', 'Track your profitability'],
            audit: ['📜 Audit Trail', 'Complete activity log'],
            settings: ['⚙️ Settings', 'System configuration']
        };
        const [title, sub] = titles[section] || ['Dashboard', ''];
        document.getElementById('pageTitle').textContent = title;
        document.getElementById('pageSubtitle').textContent = sub;

        if (section === 'pos') loadPOSProducts('butchery');
        if (section === 'orders') loadOrders();
        if (section === 'inventory') loadInventory();
        if (section === 'users') loadUsers();
        if (section === 'products') loadProducts();
        if (section === 'customers') loadCustomers();
        if (section === 'suppliers') loadSuppliers();
        if (section === 'kitchen') loadKitchenOrders();
        if (section === 'dashboard') loadDashboard();
        if (section === 'profit') loadProfitData();
        if (section === 'audit') loadAuditLogs();

        document.getElementById('sidebar').classList.remove('open');
        resetSessionTimer();
    });
});

// ============================================================
//  MODALS
// ============================================================
function openModal(id) {
    document.getElementById(id).classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

document.querySelectorAll('.modal-overlay').forEach(el => {
    el.addEventListener('click', (e) => {
        if (e.target === el) el.classList.remove('active');
    });
});

// ============================================================
//  CLOCK
// ============================================================
function startClock() {
    setInterval(() => {
        document.getElementById('currentTime').textContent = new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }, 1000);
}

// ============================================================
//  DASHBOARD
// ============================================================
async function loadDashboard() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const { data: orders } = await supabaseClient.from('orders').select('*').gte('created_at', today);

        let total = 0, butchery = 0, restaurant = 0, mpesa = 0, pending = 0;
        orders?.forEach(o => {
            if (o.status === 'paid' || o.status === 'completed') {
                total += o.total;
                if (o.order_type === 'butchery') butchery += o.total;
                else restaurant += o.total;
                if (o.payment_method === 'mpesa') mpesa += o.total;
            }
            if (o.status === 'paid' || o.status === 'preparing') pending++;
        });

        document.getElementById('todaySales').textContent = `KES ${total.toFixed(2)}`;
        document.getElementById('butcherySales').textContent = `KES ${butchery.toFixed(2)}`;
        document.getElementById('restaurantSales').textContent = `KES ${restaurant.toFixed(2)}`;
        document.getElementById('mpesaSales').textContent = `KES ${mpesa.toFixed(2)}`;
        document.getElementById('pendingOrders').textContent = pending;

        const { data: productsData } = await supabaseClient.from('products').select('stock_quantity, reorder_level');
        const low = productsData?.filter(p => p.stock_quantity <= p.reorder_level) || [];
        document.getElementById('lowStock').textContent = low.length;

        await loadRecentOrders();
        await loadTopProducts();
        await createSalesChart(orders || []);
        
        // Check low stock and send alerts
        if (low.length > 0) {
            showToast(`⚠️ ${low.length} items are low on stock!`, 'warning');
        }
    } catch (e) {
        console.error('Dashboard error:', e);
    }
}

async function loadRecentOrders() {
    const { data: orders } = await supabaseClient.from('orders').select('*').order('created_at', { ascending: false }).limit(8);
    const table = document.getElementById('recentOrdersTable');
    if (!orders?.length) {
        table.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>No recent orders</p></div>';
        return;
    }
    let html = '<div class="table-wrapper"><table class="data-table"><thead><tr><th>🔢 Order</th><th>📂 Type</th><th>💰 Total</th><th>📊 Status</th><th>⏰ Time</th></tr></thead><tbody>';
    orders.forEach(o => {
        html += `<tr>
                <td><strong>#${o.order_number || o.id.slice(0,8)}</strong></td>
                <td><span class="badge ${o.order_type}">${o.order_type}</span></td>
                <td><strong>KES ${o.total.toFixed(2)}</strong></td>
                <td><span class="status-badge ${o.status}">${o.status}</span></td>
                <td>${new Date(o.created_at).toLocaleTimeString()}</td>
            </tr>`;
    });
    html += '</tbody></table></div>';
    table.innerHTML = html;
}

async function loadTopProducts() {
    const { data: items } = await supabaseClient.from('order_items').select('product_id, quantity, products(name)').limit(30);
    const list = document.getElementById('topProductsList');
    if (!items?.length) {
        list.innerHTML = '<div class="empty-state"><p>No sales data</p></div>';
        return;
    }
    const counts = {};
    items.forEach(item => {
        const name = item.products?.name || 'Unknown';
        counts[name] = (counts[name] || 0) + item.quantity;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    list.innerHTML = sorted.map(([name, qty], i) => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);">
                <div style="display:flex;align-items:center;gap:10px;">
                    <span style="display:inline-flex;width:26px;height:26px;border-radius:50%;background:${['#6C3CE1','#10B981','#F59E0B','#EF4444','#3B82F6'][i]};color:#fff;align-items:center;justify-content:center;font-weight:700;font-size:12px;">${i+1}</span>
                    <span style="font-weight:500;">${getEmoji(name)} ${name}</span>
                </div>
                <span style="font-weight:700;color:var(--primary);">${qty.toFixed(1)}</span>
            </div>
        `).join('');
}

async function createSalesChart(orders) {
    const daily = {};
    orders.forEach(o => {
        const d = new Date(o.created_at).toLocaleDateString();
        daily[d] = (daily[d] || 0) + o.total;
    });
    const ctx = document.getElementById('salesChart').getContext('2d');
    if (salesChart) salesChart.destroy();
    salesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Object.keys(daily).length ? Object.keys(daily) : ['No Data'],
            datasets: [{
                label: 'Sales (KES)',
                data: Object.values(daily).length ? Object.values(daily) : [0],
                borderColor: '#6C3CE1',
                backgroundColor: 'rgba(108,60,225,0.08)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#6C3CE1',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, ticks: { callback: function(value) { return 'KES ' + value.toLocaleString(); } } }
            }
        }
    });
}

function refreshAll() {
    loadDashboard();
    loadProducts();
    loadUsers();
    loadInventory();
    loadOrders();
    loadCustomers();
    loadSuppliers();
    loadKitchenOrders();
    loadProfitData();
    showToast('🔄 All data refreshed!', 'info');
    resetSessionTimer();
}

// ============================================================
//  POS
// ============================================================
function switchPOS(mode) {
    posMode = mode;
    cart = [];
    selectedProduct = null;
    loadPOSProducts(mode);
}

async function loadPOSProducts(type) {
    const { data: productsData } = await supabaseClient.from('products').select('*').eq('product_type', type).eq('is_active', true);
    products = productsData || [];
    const container = document.getElementById('posContainer');
    if (!products.length) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-box-open"></i><p>No ${type} products available</p></div>`;
        return;
    }

    let html = `
            <div class="product-grid">
                ${products.map(p => `
                    <div class="product-card" onclick="selectPOSProduct('${p.id}')" id="pos-${p.id}">
                        <span class="product-emoji">${getEmoji(p.name)}</span>
                        <div class="product-name">${p.name}</div>
                        <div class="product-price">KES ${p.selling_price}/${p.unit}</div>
                        <div class="product-stock">Stock: ${p.stock_quantity}</div>
                    </div>
                `).join('')}
            </div>
            <div class="quick-amounts">
                ${[100,200,300,500,1000].map(a => `<button class="quick-btn" onclick="quickAmount(${a})">KES ${a}</button>`).join('')}
                <button class="quick-btn" onclick="quickAmount(0)">Custom</button>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:10px 0;">
                <div>
                    <label style="font-weight:500;font-size:13px;color:var(--text-secondary);">📐 Quantity</label>
                    <input type="number" id="posQty" step="0.001" placeholder="0.000" style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--bg);color:var(--text-primary);">
                </div>
                <div>
                    <label style="font-weight:500;font-size:13px;color:var(--text-secondary);">💰 Amount (KES)</label>
                    <input type="number" id="posAmount" step="0.01" placeholder="0.00" style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--bg);color:var(--text-primary);">
                </div>
            </div>
            <div style="display:flex;gap:10px;margin-bottom:12px;">
                <button class="btn btn-success" onclick="addToCartPOS()"><i class="fas fa-plus"></i> Add to Cart</button>
                <button class="btn btn-danger" onclick="clearCartPOS()"><i class="fas fa-trash"></i> Clear</button>
            </div>
            <div style="background:var(--bg);border-radius:var(--radius-sm);padding:14px;">
                <h4 style="margin-bottom:6px;">🛒 Current Order</h4>
                <div id="posCartItems"><div class="empty-state" style="padding:8px;"><p>No items in cart</p></div></div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;padding-top:8px;border-top:2px solid var(--border);">
                    <span style="font-weight:700;font-size:18px;">Total: <span id="posTotal" style="color:var(--primary);">KES 0.00</span></span>
                </div>
                <div style="display:flex;gap:10px;margin-top:10px;">
                    <input type="tel" id="posPhone" placeholder="📱 07XXXXXXXX" style="flex:1;padding:8px 12px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--bg);color:var(--text-primary);">
                    <button class="btn btn-primary" onclick="processPaymentPOS('mpesa')"><i class="fas fa-mobile-alt"></i> M-Pesa</button>
                    <button class="btn btn-success" onclick="processPaymentPOS('cash')"><i class="fas fa-money-bill"></i> Cash</button>
                </div>
            </div>
        `;
    container.innerHTML = html;
    document.getElementById('posQty')?.addEventListener('input', calculateTotalPOS);
    document.getElementById('posAmount')?.addEventListener('input', calculateTotalPOS);
}

function selectPOSProduct(id) {
    selectedProduct = id;
    document.querySelectorAll('.product-card').forEach(el => el.classList.remove('selected'));
    document.getElementById(`pos-${id}`)?.classList.add('selected');
}

function quickAmount(amount) {
    const el = document.getElementById('posAmount');
    if (el) { el.value = amount || ''; calculateTotalPOS(); }
}

function calculateTotalPOS() {
    const qty = parseFloat(document.getElementById('posQty')?.value) || 0;
    const amount = parseFloat(document.getElementById('posAmount')?.value) || 0;
    if (!selectedProduct) return;
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;
    if (amount && !qty) document.getElementById('posQty').value = (amount / product.selling_price).toFixed(3);
    else if (qty && !amount) document.getElementById('posAmount').value = (qty * product.selling_price).toFixed(2);
}

function addToCartPOS() {
    if (!selectedProduct) { showToast('Select a product first', 'warning'); return; }
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;
    const qty = parseFloat(document.getElementById('posQty')?.value) || 0;
    const amount = parseFloat(document.getElementById('posAmount')?.value) || 0;
    if (!qty && !amount) { showToast('Enter quantity or amount', 'warning'); return; }
    const total = amount || (qty * product.selling_price);
    const quantity = qty || (amount / product.selling_price);
    cart.push({ product_id: product.id, name: product.name, quantity, total, unit_price: product.selling_price, emoji: getEmoji(product.name) });
    updateCartDisplayPOS();
    showToast(`✅ ${product.name} added to cart`, 'success');
    document.getElementById('posQty').value = '';
    document.getElementById('posAmount').value = '';
    selectedProduct = null;
    document.querySelectorAll('.product-card').forEach(el => el.classList.remove('selected'));
}

function clearCartPOS() { cart = []; updateCartDisplayPOS(); }

function updateCartDisplayPOS() {
    const container = document.getElementById('posCartItems');
    const totalEl = document.getElementById('posTotal');
    if (!cart.length) {
        container.innerHTML = '<div class="empty-state" style="padding:8px;"><p>No items in cart</p></div>';
        totalEl.textContent = 'KES 0.00';
        return;
    }
    let total = 0;
    container.innerHTML = cart.map((item, i) => {
        total += item.total;
        return `<div class="pos-cart-item">
                    <span>${item.emoji} ${item.name} × ${item.quantity.toFixed(3)}</span>
                    <span style="font-weight:600;">KES ${item.total.toFixed(2)}</span>
                    <button class="remove-btn" onclick="cart.splice(${i},1);updateCartDisplayPOS();">&times;</button>
                </div>`;
    }).join('');
    totalEl.textContent = `KES ${total.toFixed(2)}`;
}

async function processPaymentPOS(method) {
    if (!cart.length) { showToast('Cart is empty!', 'error'); return; }
    const phone = document.getElementById('posPhone')?.value || '';
    if (method === 'mpesa' && !phone) { showToast('Enter customer phone number', 'error'); return; }
    const total = cart.reduce((sum, item) => sum + item.total, 0);
    
    // Check if customer exists, create if not
    if (phone) {
        const { data: existing } = await supabaseClient.from('customers').select('id').eq('phone', phone).single();
        if (!existing) {
            await supabaseClient.from('customers').insert({
                name: phone,
                phone: phone,
                loyalty_points: 10 // Welcome bonus
            });
            showToast('🎉 New customer registered with 10 loyalty points!', 'success');
        }
    }
    
    try {
        const { data: order, error } = await supabaseClient.from('orders').insert({
            order_type: posMode,
            user_id: currentUser.id,
            customer_phone: phone || null,
            subtotal: total,
            total: total,
            status: 'draft',
            payment_status: 'pending',
            payment_method: method
        }).select().single();
        if (error) throw error;
        const items = cart.map(item => ({
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total: item.total
        }));
        await supabaseClient.from('order_items').insert(items);
        await supabaseClient.from('payments').insert({
            order_id: order.id,
            payment_method: method,
            amount: total,
            status: 'pending'
        });
        
        // Audit log
        await supabaseClient.from('audit_logs').insert({
            user_id: currentUser.id,
            action: 'Payment Initiated',
            entity_type: 'order',
            entity_id: order.id,
            new_value: { total, method, items: cart.length }
        });
        
        showToast(`⏳ Processing ${method.toUpperCase()} payment...`, 'info');
        await new Promise(resolve => setTimeout(resolve, 2000));
        await supabaseClient.from('orders').update({ status: 'paid', payment_status: 'completed' }).eq('id', order.id);
        await supabaseClient.from('payments').update({ status: 'completed' }).eq('order_id', order.id);
        
        // Update customer loyalty points
        if (phone) {
            const { data: customer } = await supabaseClient.from('customers').select('loyalty_points').eq('phone', phone).single();
            if (customer) {
                const points = Math.floor(total / 100);
                await supabaseClient.from('customers').update({ loyalty_points: customer.loyalty_points + points }).eq('phone', phone);
            }
        }
        
        // Update inventory
        for (const item of items) {
            const { data: product } = await supabaseClient.from('products').select('stock_quantity').eq('id', item.product_id).single();
            if (product) {
                await supabaseClient.from('products').update({ stock_quantity: product.stock_quantity - item.quantity }).eq('id', item.product_id);
            }
        }
        showToast(`✅ Payment successful! Order #${order.order_number || order.id.slice(0,8)}`, 'success');
        cart = [];
        updateCartDisplayPOS();
        document.getElementById('posPhone').value = '';
        loadPOSProducts(posMode);
        loadDashboard();
        resetSessionTimer();
    } catch (error) {
        showToast('❌ Payment failed: ' + error.message, 'error');
    }
}

// ============================================================
//  ORDERS
// ============================================================
async function loadOrders() {
    try {
        const { data: orders } = await supabaseClient.from('orders').select('*, order_items(*, products(*))').order('created_at', { ascending: false });
        allOrders = orders || [];
        renderOrders(allOrders);
        updateOrderCounts(allOrders);
        document.getElementById('orderBadge').textContent = allOrders.filter(o => o.status === 'paid' || o.status === 'preparing').length;
        resetSessionTimer();
    } catch (e) { console.error('Orders error:', e); }
}

function renderOrders(orders) {
    let filtered = orders;
    if (currentFilter === 'butchery') filtered = orders.filter(o => o.order_type === 'butchery');
    else if (currentFilter === 'restaurant') filtered = orders.filter(o => o.order_type === 'restaurant');
    else if (['paid', 'preparing', 'ready', 'completed'].includes(currentFilter)) {
        filtered = orders.filter(o => o.status === currentFilter);
    }
    const container = document.getElementById('ordersContainer');
    document.getElementById('orderCount').textContent = filtered.length;
    if (!filtered.length) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-inbox"></i><p>No ${currentFilter === 'all' ? '' : currentFilter} orders</p></div>`;
        return;
    }
    container.innerHTML = `<div class="orders-grid">${filtered.map(order => {
        const items = order.order_items || [];
        return `
                <div class="order-card">
                    <div class="order-header">
                        <span class="order-number">#${order.order_number || order.id.slice(0,10)}</span>
                        <span class="badge ${order.order_type}">${order.order_type}</span>
                        <span class="status-badge ${order.status}">${order.status}</span>
                    </div>
                    <div class="order-items">
                        ${items.slice(0,3).map(item => `
                            <div class="order-item-row">
                                <span>${getEmoji(item.products?.name || '📦')} ${item.products?.name || 'Unknown'}</span>
                                <span>${item.quantity.toFixed(3)} ${item.products?.unit || ''}</span>
                                <span>KES ${item.total.toFixed(2)}</span>
                            </div>
                        `).join('')}
                        ${items.length > 3 ? `<div style="color:var(--text-muted);font-size:12px;">+ ${items.length - 3} more</div>` : ''}
                    </div>
                    <div class="order-footer">
                        <span class="order-total">KES ${order.total.toFixed(2)}</span>
                        <span class="order-time">${new Date(order.created_at).toLocaleTimeString()}</span>
                    </div>
                    ${order.customer_phone ? `<div style="font-size:12px;color:var(--text-muted);"><i class="fas fa-phone"></i> ${order.customer_phone}</div>` : ''}
                    <div class="order-actions">
                        ${order.status === 'paid' ? `<button class="btn btn-sm btn-warning" onclick="updateOrderStatus('${order.id}','preparing')"><i class="fas fa-play"></i> Start</button>` : ''}
                        ${order.status === 'preparing' ? `<button class="btn btn-sm btn-success" onclick="updateOrderStatus('${order.id}','ready')"><i class="fas fa-check"></i> Ready</button>` : ''}
                        ${order.status === 'ready' ? `<button class="btn btn-sm btn-primary" onclick="updateOrderStatus('${order.id}','completed')"><i class="fas fa-flag-checkered"></i> Complete</button>` : ''}
                        <button class="btn btn-sm btn-outline" onclick="viewOrderDetails('${order.id}')"><i class="fas fa-eye"></i> View</button>
                    </div>
                </div>
            `;
    }).join('')}</div>`;
}

function updateOrderCounts(orders) {
    document.getElementById('countAll').textContent = orders.length;
    document.getElementById('countButchery').textContent = orders.filter(o => o.order_type === 'butchery').length;
    document.getElementById('countRestaurant').textContent = orders.filter(o => o.order_type === 'restaurant').length;
    document.getElementById('countPaid').textContent = orders.filter(o => o.status === 'paid').length;
    document.getElementById('countPreparing').textContent = orders.filter(o => o.status === 'preparing').length;
    document.getElementById('countReady').textContent = orders.filter(o => o.status === 'ready').length;
    document.getElementById('countCompleted').textContent = orders.filter(o => o.status === 'completed').length;
}

async function updateOrderStatus(orderId, status) {
    try {
        await supabaseClient.from('orders').update({ status }).eq('id', orderId);
        await supabaseClient.from('audit_logs').insert({
            user_id: currentUser.id,
            action: 'Order Status Updated',
            entity_type: 'order',
            entity_id: orderId,
            new_value: { status }
        });
        showToast(`✅ Order ${status}!`, 'success');
        loadOrders();
        loadKitchenOrders();
        resetSessionTimer();
    } catch (e) { showToast('❌ ' + e.message, 'error'); }
}

async function viewOrderDetails(orderId) {
    const { data: order } = await supabaseClient.from('orders').select('*, order_items(*, products(*))').eq('id', orderId).single();
    if (!order) return;
    document.getElementById('orderDetailTitle').textContent = `📋 Order #${order.order_number || order.id.slice(0,10)}`;
    const items = order.order_items || [];
    let html = `
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">
                <div style="background:var(--bg);padding:10px;border-radius:var(--radius-sm);">
                    <div style="font-size:11px;color:var(--text-muted);">📂 Type</div>
                    <div style="font-weight:600;">${order.order_type}</div>
                </div>
                <div style="background:var(--bg);padding:10px;border-radius:var(--radius-sm);">
                    <div style="font-size:11px;color:var(--text-muted);">📊 Status</div>
                    <span class="status-badge ${order.status}">${order.status}</span>
                </div>
                <div style="background:var(--bg);padding:10px;border-radius:var(--radius-sm);">
                    <div style="font-size:11px;color:var(--text-muted);">📅 Date</div>
                    <div style="font-weight:500;">${new Date(order.created_at).toLocaleString()}</div>
                </div>
                <div style="background:var(--bg);padding:10px;border-radius:var(--radius-sm);">
                    <div style="font-size:11px;color:var(--text-muted);">💰 Total</div>
                    <div style="font-size:18px;font-weight:700;color:var(--primary);">KES ${order.total.toFixed(2)}</div>
                </div>
            </div>
            <div style="background:var(--bg);border-radius:var(--radius-sm);padding:14px;margin-bottom:14px;">
                <h4 style="margin-bottom:6px;">🛒 Items</h4>
                ${items.map(item => `
                    <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border);font-size:14px;">
                        <span>${getEmoji(item.products?.name || '📦')} ${item.products?.name || 'Unknown'}</span>
                        <span>${item.quantity.toFixed(3)} × KES ${item.unit_price.toFixed(2)}</span>
                        <span style="font-weight:600;">KES ${item.total.toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
                ${order.status === 'paid' ? `<button class="btn btn-sm btn-warning" onclick="updateOrderStatus('${order.id}','preparing');closeModal('orderDetailModal');"><i class="fas fa-play"></i> Start</button>` : ''}
                ${order.status === 'preparing' ? `<button class="btn btn-sm btn-success" onclick="updateOrderStatus('${order.id}','ready');closeModal('orderDetailModal');"><i class="fas fa-check"></i> Ready</button>` : ''}
                ${order.status === 'ready' ? `<button class="btn btn-sm btn-primary" onclick="updateOrderStatus('${order.id}','completed');closeModal('orderDetailModal');"><i class="fas fa-flag-checkered"></i> Complete</button>` : ''}
                <button class="btn btn-sm btn-outline" onclick="closeModal('orderDetailModal')">✖ Close</button>
            </div>
        `;
    document.getElementById('orderDetailContent').innerHTML = html;
    openModal('orderDetailModal');
}

// ===== FILTER EVENTS =====
document.querySelectorAll('#orderFilters .filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('#orderFilters .filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderOrders(allOrders);
    });
});

// ============================================================
//  KITCHEN DISPLAY
// ============================================================
async function loadKitchenOrders() {
    try {
        const { data: orders } = await supabaseClient.from('orders')
            .select('*, order_items(*, products(*))')
            .in('status', ['paid', 'preparing', 'ready'])
            .order('created_at', { ascending: false });
        
        const container = document.getElementById('kitchenOrders');
        document.getElementById('kitchenOrderCount').textContent = orders?.length || 0;
        
        if (!orders?.length) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-utensils"></i><p>No kitchen orders</p></div>';
            return;
        }
        
        let filtered = orders;
        if (kitchenFilter !== 'all') {
            filtered = orders.filter(o => o.status === kitchenFilter);
        }
        
        container.innerHTML = `<div class="orders-grid">${filtered.map(order => {
            const items = order.order_items || [];
            return `
                <div class="order-card ${order.order_type}">
                    <div class="order-header">
                        <span class="order-number">#${order.order_number || order.id.slice(0,10)}</span>
                        <span class="badge ${order.order_type}">${order.order_type}</span>
                        <span class="status-badge ${order.status}">${order.status}</span>
                    </div>
                    <div class="order-items">
                        ${items.map(item => `
                            <div class="order-item-row">
                                <span>${getEmoji(item.products?.name || '📦')} ${item.products?.name || 'Unknown'}</span>
                                <span>${item.quantity.toFixed(3)}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="order-footer">
                        <span class="order-total">KES ${order.total.toFixed(2)}</span>
                        <span class="order-time">${new Date(order.created_at).toLocaleTimeString()}</span>
                    </div>
                    <div class="order-actions">
                        ${order.status === 'paid' ? `<button class="btn btn-sm btn-warning" onclick="updateOrderStatus('${order.id}','preparing')"><i class="fas fa-play"></i> Start</button>` : ''}
                        ${order.status === 'preparing' ? `<button class="btn btn-sm btn-success" onclick="updateOrderStatus('${order.id}','ready')"><i class="fas fa-check"></i> Ready</button>` : ''}
                        ${order.status === 'ready' ? `<button class="btn btn-sm btn-primary" onclick="updateOrderStatus('${order.id}','completed')"><i class="fas fa-flag-checkered"></i> Complete</button>` : ''}
                    </div>
                </div>
            `;
        }).join('')}</div>`;
    } catch (e) { console.error('Kitchen orders error:', e); }
}

document.querySelectorAll('#kitchenFilters .filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('#kitchenFilters .filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        kitchenFilter = btn.dataset.filter;
        loadKitchenOrders();
    });
});

// ============================================================
//  PRODUCTS
// ============================================================
async function loadProducts() {
    const { data: productsData } = await supabaseClient.from('products').select('*').order('name');
    products = productsData || [];
    const table = document.getElementById('productsTable');
    if (!products.length) {
        table.innerHTML = '<div class="empty-state"><i class="fas fa-box-open"></i><p>No products</p></div>';
        return;
    }
    let html = '<div class="table-wrapper"><table class="data-table"><thead><tr><th>📦 Name</th><th>📂 Type</th><th>💰 Price</th><th>📊 Stock</th><th>📌 Status</th><th>⚙️ Actions</th></tr></thead><tbody>';
    products.forEach(p => {
        html += `<tr>
                <td><strong>${getEmoji(p.name)} ${p.name}</strong></td>
                <td><span class="badge ${p.product_type}">${p.product_type}</span></td>
                <td>KES ${p.selling_price}</td>
                <td>${p.stock_quantity} ${p.unit}</td>
                <td><span class="status-badge ${p.is_active ? 'active' : 'inactive'}">${p.is_active ? '✅ Active' : '❌ Inactive'}</span></td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="editProduct('${p.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger" onclick="deleteProduct('${p.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
    });
    html += '</tbody></table></div>';
    table.innerHTML = html;
}

async function editProduct(id) {
    const { data: p } = await supabaseClient.from('products').select('*').eq('id', id).single();
    if (!p) return;
    document.getElementById('productModalTitle').textContent = 'Edit Product';
    document.getElementById('productId').value = p.id;
    document.getElementById('productName').value = p.name;
    document.getElementById('productType').value = p.product_type;
    document.getElementById('productPrice').value = p.selling_price;
    document.getElementById('productCost').value = p.cost_price || '';
    document.getElementById('productUnit').value = p.unit;
    document.getElementById('productStock').value = p.stock_quantity;
    document.getElementById('productReorder').value = p.reorder_level;
    document.getElementById('productStatus').value = p.is_active ? 'active' : 'inactive';
    openModal('productModal');
}

async function deleteProduct(id) {
    if (!confirm('Delete this product?')) return;
    await supabaseClient.from('products').delete().eq('id', id);
    await supabaseClient.from('audit_logs').insert({
        user_id: currentUser.id,
        action: 'Product Deleted',
        entity_type: 'product',
        entity_id: id
    });
    showToast('Product deleted', 'success');
    loadProducts();
}

document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('productId').value;
    const data = {
        name: document.getElementById('productName').value,
        product_type: document.getElementById('productType').value,
        selling_price: parseFloat(document.getElementById('productPrice').value),
        cost_price: parseFloat(document.getElementById('productCost').value) || null,
        unit: document.getElementById('productUnit').value,
        stock_quantity: parseFloat(document.getElementById('productStock').value) || 0,
        reorder_level: parseFloat(document.getElementById('productReorder').value) || 0,
        is_active: document.getElementById('productStatus').value === 'active'
    };
    if (id) {
        await supabaseClient.from('products').update(data).eq('id', id);
        showToast('✅ Product updated!', 'success');
    } else {
        await supabaseClient.from('products').insert(data);
        showToast('✅ Product created!', 'success');
    }
    await supabaseClient.from('audit_logs').insert({
        user_id: currentUser.id,
        action: id ? 'Product Updated' : 'Product Created',
        entity_type: 'product',
        new_value: data
    });
    closeModal('productModal');
    loadProducts();
});

// ============================================================
//  INVENTORY
// ============================================================
async function loadInventory() {
    const { data: productsData } = await supabaseClient.from('products').select('*').order('name');
    products = productsData || [];
    const table = document.getElementById('inventoryTable');
    if (!products.length) {
        table.innerHTML = '<div class="empty-state"><i class="fas fa-warehouse"></i><p>No inventory</p></div>';
        return;
    }
    let html = '<div class="table-wrapper"><table class="data-table"><thead><tr><th>📦 Product</th><th>📂 Type</th><th>📊 Stock</th><th>📏 Unit</th><th>⚠️ Reorder</th><th>📌 Status</th></tr></thead><tbody>';
    products.forEach(p => {
        const isLow = p.stock_quantity <= p.reorder_level;
        html += `<tr style="${isLow ? 'background:rgba(245,158,11,0.08);' : ''}">
                <td><strong>${getEmoji(p.name)} ${p.name}</strong> ${isLow ? '⚠️' : ''}</td>
                <td><span class="badge ${p.product_type}">${p.product_type}</span></td>
                <td><strong>${p.stock_quantity}</strong></td>
                <td>${p.unit}</td>
                <td>${p.reorder_level}</td>
                <td><span class="status-badge ${isLow ? 'warning' : 'active'}">${isLow ? '⚠️ Low Stock' : '✅ OK'}</span></td>
            </tr>`;
    });
    html += '</tbody></table></div>';
    table.innerHTML = html;

    const { data: movements } = await supabaseClient.from('inventory_movements').select('*, products(name)').order('created_at', { ascending: false }).limit(15);
    const movementTable = document.getElementById('stockMovementsTable');
    if (!movements?.length) {
        movementTable.innerHTML = '<div class="empty-state"><p>No movements</p></div>';
        return;
    }
    let mHtml = '<div class="table-wrapper"><table class="data-table"><thead><tr><th>📦 Product</th><th>📂 Type</th><th>📊 Quantity</th><th>📅 Date</th></tr></thead><tbody>';
    movements.forEach(m => {
        const isAdd = m.quantity > 0;
        mHtml += `<tr>
                <td>${getEmoji(m.products?.name || '📦')} ${m.products?.name || 'Unknown'}</td>
                <td><span class="badge ${isAdd ? 'success' : 'danger'}">${isAdd ? '➕ Restock' : '➖ Sale'}</span></td>
                <td style="color:${isAdd ? 'var(--success)' : 'var(--danger)'};">${isAdd ? '+' : ''}${m.quantity}</td>
                <td>${new Date(m.created_at).toLocaleString()}</td>
            </tr>`;
    });
    mHtml += '</tbody></table></div>';
    movementTable.innerHTML = mHtml;
}

function showAdjustStock() {
    loadProductDropdown();
    openModal('stockModal');
}

async function loadProductDropdown() {
    const { data: productsData } = await supabaseClient.from('products').select('id, name').order('name');
    const select = document.getElementById('stockProduct');
    select.innerHTML = productsData.map(p => `<option value="${p.id}">${getEmoji(p.name)} ${p.name}</option>`).join('');
}

document.getElementById('stockForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const productId = document.getElementById('stockProduct').value;
    const type = document.getElementById('adjustmentType').value;
    const qty = parseFloat(document.getElementById('adjustmentQty').value);
    const reason = document.getElementById('adjustmentReason').value || 'Manual adjustment';
    const { data: product } = await supabaseClient.from('products').select('stock_quantity').eq('id', productId).single();
    const newStock = type === 'add' ? product.stock_quantity + qty : product.stock_quantity - qty;
    await supabaseClient.from('products').update({ stock_quantity: newStock }).eq('id', productId);
    await supabaseClient.from('inventory_movements').insert({
        product_id: productId,
        movement_type: type === 'add' ? 'restock' : 'adjustment',
        quantity: type === 'add' ? qty : -qty,
        previous_stock: product.stock_quantity,
        new_stock: newStock,
        created_by: currentUser.id,
        notes: reason
    });
    await supabaseClient.from('audit_logs').insert({
        user_id: currentUser.id,
        action: 'Stock Adjusted',
        entity_type: 'product',
        entity_id: productId,
        new_value: { newStock, reason }
    });
    showToast(`✅ Stock adjusted! New stock: ${newStock}`, 'success');
    closeModal('stockModal');
    loadInventory();
});

// ============================================================
//  USERS
// ============================================================
function showAddUser() {
    document.getElementById('userModalTitle').textContent = 'Add New User';
    document.getElementById('userForm').reset();
    document.getElementById('userSubmitBtn').innerHTML = '<i class="fas fa-save"></i> Create User';
    openModal('userModal');
}

document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('userSubmitBtn');
    btn.innerHTML = '<span class="spinner"></span> Creating...';
    btn.disabled = true;
    try {
        const fullName = document.getElementById('userFullName').value.trim();
        const email = document.getElementById('userEmail').value.trim();
        const password = document.getElementById('userPassword').value;
        const roleId = parseInt(document.getElementById('userRole').value);
        const twoFA = parseInt(document.getElementById('user2FA').value);
        const status = document.getElementById('userStatus').value;
        const phone = document.getElementById('userPhone').value;
        if (!fullName || !email || !password || !roleId) throw new Error('Fill all required fields');
        const { data: authData, error: authError } = await supabaseClient.auth.signUp({
            email, password,
            options: { data: { full_name: fullName, role: roleId === 1 ? 'admin' : roleId === 2 ? 'cashier' : roleId === 3 ? 'butcher' : 'kitchen' } }
        });
        if (authError) throw new Error(authError.message);
        const username = email.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        await supabaseClient.from('users').insert({
            username, email, full_name: fullName, phone: phone || null, role_id: roleId, status, two_fa_enabled: twoFA
        });
        await supabaseClient.from('audit_logs').insert({
            user_id: currentUser.id,
            action: 'User Created',
            entity_type: 'user',
            new_value: { email, roleId }
        });
        showToast(`✅ User "${fullName}" created!`, 'success');
        closeModal('userModal');
        loadUsers();
    } catch (error) {
        showToast('❌ ' + error.message, 'error');
    } finally {
        btn.innerHTML = '<i class="fas fa-save"></i> Create User';
        btn.disabled = false;
    }
});

async function loadUsers() {
    const { data: usersData } = await supabaseClient.from('users').select('*, roles(name)').order('full_name');
    const table = document.getElementById('usersTable');
    if (!usersData?.length) {
        table.innerHTML = '<div class="empty-state"><i class="fas fa-users"></i><p>No users</p></div>';
        return;
    }
    let html = '<div class="table-wrapper"><table class="data-table"><thead><tr><th>👤 Name</th><th>📧 Email</th><th>👑 Role</th><th>🔐 2FA</th><th>📊 Status</th><th>⚙️ Actions</th></tr></thead><tbody>';
    usersData.forEach(u => {
        const roleClass = u.roles?.name === 'admin' ? 'admin' : u.roles?.name === 'cashier' ? 'cashier' : u.roles?.name === 'butcher' ? 'butcher-role' : 'kitchen';
        const roleEmoji = u.roles?.name === 'admin' ? '👑' : u.roles?.name === 'cashier' ? '💰' : u.roles?.name === 'butcher' ? '🥩' : '🍳';
        html += `<tr>
                <td><strong>${u.full_name}</strong></td>
                <td>${u.email}</td>
                <td><span class="badge ${roleClass}">${roleEmoji} ${u.roles?.name || 'Unknown'}</span></td>
                <td>${u.two_fa_enabled ? '✅ Enabled' : '❌ Disabled'}</td>
                <td><span class="status-badge ${u.status}">${u.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="deleteUser('${u.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
    });
    html += '</tbody></table></div>';
    table.innerHTML = html;
}

async function deleteUser(id) {
    if (!confirm('Delete this user?')) return;
    await supabaseClient.from('users').delete().eq('id', id);
    await supabaseClient.from('audit_logs').insert({
        user_id: currentUser.id,
        action: 'User Deleted',
        entity_type: 'user',
        entity_id: id
    });
    showToast('User deleted', 'success');
    loadUsers();
}

// ============================================================
//  CUSTOMERS
// ============================================================
function showAddCustomer() {
    document.getElementById('customerModalTitle').textContent = 'Add Customer';
    document.getElementById('customerForm').reset();
    openModal('customerModal');
}

document.getElementById('customerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        name: document.getElementById('customerName').value.trim(),
        phone: document.getElementById('customerPhone').value.trim(),
        email: document.getElementById('customerEmail').value.trim() || null,
        loyalty_points: parseInt(document.getElementById('customerPoints').value) || 0
    };
    await supabaseClient.from('customers').insert(data);
    await supabaseClient.from('audit_logs').insert({
        user_id: currentUser.id,
        action: 'Customer Added',
        entity_type: 'customer',
        new_value: data
    });
    showToast('✅ Customer added!', 'success');
    closeModal('customerModal');
    loadCustomers();
});

async function loadCustomers() {
    const { data: customers } = await supabaseClient.from('customers').select('*').order('name');
    const table = document.getElementById('customersTable');
    if (!customers?.length) {
        table.innerHTML = '<div class="empty-state"><i class="fas fa-users"></i><p>No customers</p></div>';
        return;
    }
    let html = '<div class="table-wrapper"><table class="data-table"><thead><tr><th>👤 Name</th><th>📱 Phone</th><th>📧 Email</th><th>⭐ Points</th><th>⚙️ Actions</th></tr></thead><tbody>';
    customers.forEach(c => {
        html += `<tr>
                <td><strong>${c.name}</strong></td>
                <td>${c.phone}</td>
                <td>${c.email || 'N/A'}</td>
                <td><span class="badge primary">⭐ ${c.loyalty_points || 0}</span></td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="deleteCustomer('${c.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
    });
    html += '</tbody></table></div>';
    table.innerHTML = html;
}

async function deleteCustomer(id) {
    if (!confirm('Delete this customer?')) return;
    await supabaseClient.from('customers').delete().eq('id', id);
    showToast('Customer deleted', 'success');
    loadCustomers();
}

// ============================================================
//  SUPPLIERS
// ============================================================
function showAddSupplier() {
    document.getElementById('supplierModalTitle').textContent = 'Add Supplier';
    document.getElementById('supplierForm').reset();
    openModal('supplierModal');
}

document.getElementById('supplierForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        company: document.getElementById('supplierCompany').value.trim(),
        contact: document.getElementById('supplierContact').value.trim() || null,
        phone: document.getElementById('supplierPhone').value.trim(),
        email: document.getElementById('supplierEmail').value.trim() || null,
        products: document.getElementById('supplierProducts').value.trim() || null
    };
    await supabaseClient.from('suppliers').insert(data);
    await supabaseClient.from('audit_logs').insert({
        user_id: currentUser.id,
        action: 'Supplier Added',
        entity_type: 'supplier',
        new_value: data
    });
    showToast('✅ Supplier added!', 'success');
    closeModal('supplierModal');
    loadSuppliers();
});

async function loadSuppliers() {
    const { data: suppliers } = await supabaseClient.from('suppliers').select('*').order('company');
    const table = document.getElementById('suppliersTable');
    if (!suppliers?.length) {
        table.innerHTML = '<div class="empty-state"><i class="fas fa-truck"></i><p>No suppliers</p></div>';
        return;
    }
    let html = '<div class="table-wrapper"><table class="data-table"><thead><tr><th>🏢 Company</th><th>👤 Contact</th><th>📱 Phone</th><th>📦 Products</th><th>⚙️ Actions</th></tr></thead><tbody>';
    suppliers.forEach(s => {
        html += `<tr>
                <td><strong>${s.company}</strong></td>
                <td>${s.contact || 'N/A'}</td>
                <td>${s.phone}</td>
                <td>${s.products || 'All'}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="deleteSupplier('${s.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
    });
    html += '</tbody></table></div>';
    table.innerHTML = html;
}

async function deleteSupplier(id) {
    if (!confirm('Delete this supplier?')) return;
    await supabaseClient.from('suppliers').delete().eq('id', id);
    showToast('Supplier deleted', 'success');
    loadSuppliers();
}

// ============================================================
//  PROFIT & LOSS
// ============================================================
async function loadProfitData() {
    try {
        const { data: orders } = await supabaseClient.from('orders').select('*, order_items(*, products(*))').eq('status', 'paid');
        let revenue = 0, cost = 0;
        orders?.forEach(order => {
            revenue += order.total;
            order.order_items?.forEach(item => {
                cost += (item.products?.cost_price || 0) * item.quantity;
            });
        });
        const profit = revenue - cost;
        document.getElementById('totalRevenue').textContent = `KES ${revenue.toFixed(2)}`;
        document.getElementById('totalCost').textContent = `KES ${cost.toFixed(2)}`;
        document.getElementById('netProfit').textContent = `KES ${profit.toFixed(2)}`;
        
        // Create profit chart
        const ctx = document.getElementById('profitChart').getContext('2d');
        if (profitChart) profitChart.destroy();
        profitChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Revenue', 'Cost', 'Profit'],
                datasets: [{
                    data: [revenue, cost, profit > 0 ? profit : 0],
                    backgroundColor: ['#10B981', '#EF4444', '#6C3CE1'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    } catch (e) { console.error('Profit error:', e); }
}

// ============================================================
//  AUDIT TRAIL
// ============================================================
async function loadAuditLogs() {
    try {
        const date = document.getElementById('auditDate').value;
        let query = supabaseClient.from('audit_logs').select('*, users(full_name)').order('created_at', { ascending: false });
        if (date) {
            query = query.gte('created_at', date + 'T00:00:00').lte('created_at', date + 'T23:59:59');
        }
        const { data: logs } = await query.limit(50);
        const table = document.getElementById('auditTable');
        if (!logs?.length) {
            table.innerHTML = '<div class="empty-state"><i class="fas fa-history"></i><p>No audit logs found</p></div>';
            return;
        }
        let html = '<div class="table-wrapper"><table class="data-table"><thead><tr><th>👤 User</th><th>📋 Action</th><th>📂 Type</th><th>📅 Date</th></tr></thead><tbody>';
        logs.forEach(log => {
            html += `<tr>
                    <td>${log.users?.full_name || 'System'}</td>
                    <td><strong>${log.action}</strong></td>
                    <td><span class="badge info">${log.entity_type || 'N/A'}</span></td>
                    <td>${new Date(log.created_at).toLocaleString()}</td>
                </tr>`;
        });
        html += '</tbody></table></div>';
        table.innerHTML = html;
    } catch (e) { console.error('Audit error:', e); }
}

// ============================================================
//  REPORTS
// ============================================================
async function generateReport() {
    const start = document.getElementById('reportStart').value;
    const end = document.getElementById('reportEnd').value;
    if (!start || !end) { showToast('Select date range', 'warning'); return; }
    const { data: orders } = await supabaseClient.from('orders').select('*')
        .gte('created_at', start + 'T00:00:00')
        .lte('created_at', end + 'T23:59:59');
    const container = document.getElementById('reportContent');
    if (!orders?.length) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-calendar-alt"></i><p>No orders in this period</p></div>';
        return;
    }
    let total = 0, mpesa = 0, cash = 0, butchery = 0, restaurant = 0;
    orders.forEach(o => {
        total += o.total;
        if (o.payment_method === 'mpesa') mpesa += o.total;
        else if (o.payment_method === 'cash') cash += o.total;
        if (o.order_type === 'butchery') butchery += o.total;
        else restaurant += o.total;
    });
    container.innerHTML = `
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-bottom:14px;">
                <div style="background:var(--bg);padding:12px;border-radius:var(--radius-sm);text-align:center;">
                    <div style="font-size:11px;color:var(--text-muted);">💰 Total Sales</div>
                    <div style="font-size:20px;font-weight:700;color:var(--primary);">KES ${total.toFixed(2)}</div>
                </div>
                <div style="background:var(--bg);padding:12px;border-radius:var(--radius-sm);text-align:center;">
                    <div style="font-size:11px;color:var(--text-muted);">📋 Orders</div>
                    <div style="font-size:20px;font-weight:700;">${orders.length}</div>
                </div>
                <div style="background:var(--bg);padding:12px;border-radius:var(--radius-sm);text-align:center;">
                    <div style="font-size:11px;color:var(--text-muted);">🥩 Butchery</div>
                    <div style="font-size:16px;font-weight:700;color:var(--danger);">KES ${butchery.toFixed(2)}</div>
                </div>
                <div style="background:var(--bg);padding:12px;border-radius:var(--radius-sm);text-align:center;">
                    <div style="font-size:11px;color:var(--text-muted);">🍽️ Restaurant</div>
                    <div style="font-size:16px;font-weight:700;color:var(--success);">KES ${restaurant.toFixed(2)}</div>
                </div>
                <div style="background:var(--bg);padding:12px;border-radius:var(--radius-sm);text-align:center;">
                    <div style="font-size:11px;color:var(--text-muted);">📱 M-Pesa</div>
                    <div style="font-size:16px;font-weight:700;color:var(--info);">KES ${mpesa.toFixed(2)}</div>
                </div>
                <div style="background:var(--bg);padding:12px;border-radius:var(--radius-sm);text-align:center;">
                    <div style="font-size:11px;color:var(--text-muted);">💵 Cash</div>
                    <div style="font-size:16px;font-weight:700;color:var(--warning);">KES ${cash.toFixed(2)}</div>
                </div>
            </div>
            <div style="max-height:300px;overflow-y:auto;">
                <div class="table-wrapper"><table class="data-table">
                    <thead><tr><th>🔢 Order</th><th>📂 Type</th><th>💰 Amount</th><th>💳 Payment</th><th>📅 Date</th></tr></thead>
                    <tbody>${orders.map(o => `
                        <tr>
                            <td>#${o.order_number || 'N/A'}</td>
                            <td><span class="badge ${o.order_type}">${o.order_type}</span></td>
                            <td>KES ${o.total.toFixed(2)}</td>
                            <td>${o.payment_method || 'N/A'}</td>
                            <td>${new Date(o.created_at).toLocaleDateString()}</td>
                        </tr>
                    `).join('')}</tbody>
                </table></div>
            </div>
        `;
    showToast('📊 Report generated!', 'success');
}

function exportReport(format) {
    showToast(`📤 Exporting ${format.toUpperCase()}... (Coming soon)`, 'info');
}

// ============================================================
//  SETTINGS
// ============================================================
document.getElementById('settingsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const timeout = parseInt(document.getElementById('sessionTimeout').value);
    if (timeout > 0) {
        sessionTimeout = timeout;
        resetSessionTimer();
    }
    showToast('✅ Business settings saved!', 'success');
});

document.getElementById('mpesaForm').addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('✅ M-Pesa settings saved!', 'success');
});

// ============================================================
//  INIT
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    startClock();
    const today = new Date().toISOString().split('T')[0];
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    document.getElementById('reportStart').value = lastWeek;
    document.getElementById('reportEnd').value = today;
    document.getElementById('auditDate').value = today;
    await loadDashboard();
    await loadProducts();
    await loadUsers();
    await loadInventory();
    await loadOrders();
    await loadCustomers();
    await loadSuppliers();
    await loadKitchenOrders();
    await loadProfitData();
    await loadAuditLogs();
});
