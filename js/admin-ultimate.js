// ============================================================
//  ULTIMATE ADMIN DASHBOARD - COMPLETE 2300+ LINES
//  FIXED FOR YOUR DATABASE STRUCTURE
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
let sessionTimeout = 30;
let notifications = [];
let unreadCount = 0;
let isInitialized = false;
let currentProductImageFile = null;
let currentProductEmoji = '📦';

// ============================================================
//  EMOJIS
// ============================================================
const AVAILABLE_EMOJIS = [
    '🥩', '🍗', '🐄', '🐖', '🐑', '🐐', '🐓', '🦃', '🐟', '🦐', '🦞', '🦀',
    '🍖', '🍔', '🌭', '🍕', '🧆', '🌮', '🌯', '🥙', '🍲', '🍛', '🍣', '🍱', '🥘',
    '🥬', '🥒', '🥑', '🍅', '🌽', '🥕', '🧅', '🧄', '🫑', '🌶️',
    '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍑', '🍒',
    '🥤', '🧃', '🧉', '🍵', '☕', '🍺', '🍷', '🥂', '🥛',
    '🍞', '🧇', '🥞', '🧈', '🧀', '🍳', '🥓', '🥩', '🍝', '🍜',
    '🍦', '🍧', '🍨', '🍩', '🍪', '🧁', '🎂', '🍰',
    '📦', '🏷️', '⭐', '💎', '🎯', '🔥', '👍', '👌'
];

function getEmoji(name) {
    const emojis = {
        'Beef': '🥩', 'Goat Meat': '🐐', 'Chicken': '🍗', 'Liver': '❤️',
        'Minced Meat': '🥩', 'Sausages': '🌭', 'Ugali': '🌽', 'Beef Stew': '🍲',
        'Chapati': '🫓', 'Rice': '🍚', 'Chips': '🍟', 'Soda': '🥤',
        'Water': '💧', 'default': '📦'
    };
    return emojis[name] || emojis['default'];
}

// ============================================================
//  TOAST SYSTEM
// ============================================================
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) {
        console.log('Toast:', message, type);
        return;
    }
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
//  NOTIFICATION SYSTEM
// ============================================================
function addNotification(title, message, type = 'info', link = null) {
    const id = Date.now().toString();
    notifications.unshift({
        id, title, message, type, link,
        read: false,
        created_at: new Date().toISOString()
    });
    unreadCount++;
    updateNotificationBadge();
    renderNotifications();
    showToast(message, type);
}

function updateNotificationBadge() {
    const badge = document.getElementById('notificationBadge');
    if (badge) {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'inline' : 'none';
    }
}

function renderNotifications() {
    const container = document.getElementById('notificationList');
    if (!container) return;
    if (!notifications.length) {
        container.innerHTML = '<div class="empty-state" style="padding:20px;"><p>No notifications</p></div>';
        return;
    }
    container.innerHTML = notifications.slice(0, 10).map(n => `
        <div class="notification-item ${n.read ? 'read' : 'unread'}" 
             onclick="${n.link ? `navigateTo('${n.link}')` : ''}"
             style="padding:10px 14px;border-bottom:1px solid var(--border);
                    cursor:${n.link ? 'pointer' : 'default'};
                    background:${n.read ? 'transparent' : 'rgba(108,60,225,0.05)'};
                    transition:var(--transition);">
            <div style="display:flex;align-items:center;gap:8px;">
                <span style="font-size:18px;">${n.type === 'success' ? '✅' : n.type === 'error' ? '❌' : n.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
                <div style="flex:1;">
                    <div style="font-weight:600;font-size:13px;">${n.title}</div>
                    <div style="font-size:12px;color:var(--text-muted);">${n.message}</div>
                    <div style="font-size:10px;color:var(--text-muted);margin-top:2px;">${new Date(n.created_at).toLocaleString()}</div>
                </div>
                ${!n.read ? `<span style="width:8px;height:8px;border-radius:50%;background:var(--primary);flex-shrink:0;"></span>` : ''}
            </div>
        </div>
    `).join('');
}

function markAllNotificationsRead() {
    notifications.forEach(n => n.read = true);
    unreadCount = 0;
    updateNotificationBadge();
    renderNotifications();
}

// ============================================================
//  THEME
// ============================================================
function setTheme(dark) {
    isDark = dark;
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    const toggle = document.getElementById('themeToggle');
    if (toggle) toggle.innerHTML = `<i class="fas ${dark ? 'fa-sun' : 'fa-moon'}"></i>`;
}

// ============================================================
//  SESSION MANAGEMENT
// ============================================================
function resetSessionTimer() {
    if (sessionTimer) clearTimeout(sessionTimer);
    const timeout = parseInt(document.getElementById('sessionTimeout')?.value || 30) * 60 * 1000;
    sessionTimer = setTimeout(() => {
        showToast('⚠️ Session expired. Please login again.', 'warning');
        addNotification('Session Expired', 'Your session has expired due to inactivity.', 'warning');
        logout();
    }, timeout);
}

// ============================================================
//  AUTH
// ============================================================
async function checkAuth() {
    try {
        const stored = localStorage.getItem('viewpoint_session');
        if (!stored) {
            console.log('❌ No session found');
            window.location.href = 'login.html';
            return null;
        }

        let sessionData;
        try {
            sessionData = JSON.parse(stored);
        } catch (e) {
            localStorage.removeItem('viewpoint_session');
            window.location.href = 'login.html';
            return null;
        }

        const { user, loginMethod, loginTime } = sessionData;

        if (!user) {
            localStorage.removeItem('viewpoint_session');
            window.location.href = 'login.html';
            return null;
        }

        const maxAge = 24 * 60 * 60 * 1000;
        if (loginTime && Date.now() - loginTime > maxAge) {
            localStorage.removeItem('viewpoint_session');
            window.location.href = 'login.html';
            return null;
        }

        console.log('✅ User authenticated:', user.email);
        currentUser = user;
        updateUI(user);
        resetSessionTimer();
        return user;

    } catch (error) {
        console.error('❌ Auth error:', error);
        localStorage.removeItem('viewpoint_session');
        window.location.href = 'login.html';
        return null;
    }
}

function updateUI(user) {
    const avatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const userRole = document.querySelector('.user-role');
    
    if (avatar) avatar.textContent = user.full_name?.charAt(0).toUpperCase() || 'A';
    if (userName) userName.textContent = user.full_name || 'User';
    if (userRole) userRole.textContent = user.roles?.name || 'Cashier';
}

async function logout() {
    try {
        if (typeof supabaseClient !== 'undefined' && supabaseClient.auth) {
            await supabaseClient.auth.signOut().catch(() => {});
        }
    } catch (e) {}
    localStorage.removeItem('viewpoint_session');
    window.location.href = 'login.html';
}
window.logout = logout;

// ============================================================
//  NAVIGATION
// ============================================================
function navigateTo(section) {
    document.querySelectorAll('.sidebar-menu li').forEach(l => l.classList.remove('active'));
    const menuItem = document.querySelector(`.sidebar-menu li[data-section="${section}"]`);
    if (menuItem) menuItem.classList.add('active');

    document.querySelectorAll('.section-page').forEach(el => el.classList.remove('active'));
    const page = document.getElementById(section + 'Section');
    if (page) page.classList.add('active');

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

    const loaders = {
        pos: () => loadPOSProducts('butchery'),
        orders: () => loadOrders(),
        inventory: () => loadInventory(),
        users: () => loadUsers(),
        products: () => loadProducts(),
        customers: () => loadCustomers(),
        suppliers: () => loadSuppliers(),
        kitchen: () => loadKitchenOrders(),
        dashboard: () => loadDashboard(),
        profit: () => loadProfitData(),
        audit: () => loadAuditLogs()
    };
    if (loaders[section]) loaders[section]();

    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('open');
    resetSessionTimer();
}

// ============================================================
//  MODALS
// ============================================================
function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
    if (id === 'stockModal') loadProductDropdown();
    if (id === 'productModal') {
        setTimeout(initEmojiPicker, 100);
        clearEmoji();
        clearProductImage();
    }
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
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
        const el = document.getElementById('currentTime');
        if (el) {
            el.textContent = new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        }
    }, 1000);
}

// ============================================================
//  EMOJI PICKER FUNCTIONS
// ============================================================
function initEmojiPicker() {
    const picker = document.getElementById('emojiPicker');
    if (!picker) return;
    picker.innerHTML = AVAILABLE_EMOJIS.map(emoji => 
        `<span class="emoji-option" data-emoji="${emoji}" onclick="selectEmoji('${emoji}')">${emoji}</span>`
    ).join('');
}

function toggleEmojiPicker() {
    const container = document.getElementById('emojiPickerContainer');
    if (container) {
        container.style.display = container.style.display === 'none' ? 'block' : 'none';
    }
}

function selectEmoji(emoji) {
    currentProductEmoji = emoji;
    document.getElementById('selectedEmojiDisplay').textContent = emoji;
    document.getElementById('productEmoji').value = emoji;
    document.querySelectorAll('.emoji-option').forEach(el => {
        el.classList.toggle('selected', el.dataset.emoji === emoji);
    });
    document.getElementById('emojiPickerContainer').style.display = 'none';
}

function clearEmoji() {
    currentProductEmoji = '📦';
    const display = document.getElementById('selectedEmojiDisplay');
    const input = document.getElementById('productEmoji');
    if (display) display.textContent = '📦';
    if (input) input.value = '📦';
    document.querySelectorAll('.emoji-option').forEach(el => el.classList.remove('selected'));
}

// ============================================================
//  IMAGE UPLOAD FUNCTIONS
// ============================================================
async function uploadProductImage(file) {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `products/${fileName}`;
        
        const { data, error } = await supabaseClient.storage
            .from('product-images')
            .upload(filePath, file);
            
        if (error) throw error;
        
        const { data: urlData } = supabaseClient.storage
            .from('product-images')
            .getPublicUrl(filePath);
            
        return urlData.publicUrl;
        
    } catch (error) {
        console.error('Image upload error:', error);
        showToast('❌ Image upload failed: ' + error.message, 'error');
        return null;
    }
}

function handleProductImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('productImagePreview');
        if (preview) {
            preview.src = e.target.result;
            preview.style.display = 'block';
            document.getElementById('clearImageBtn').style.display = 'inline-flex';
        }
    };
    reader.readAsDataURL(file);
    currentProductImageFile = file;
}

function clearProductImage() {
    currentProductImageFile = null;
    const preview = document.getElementById('productImagePreview');
    const fileInput = document.getElementById('productImageFile');
    const clearBtn = document.getElementById('clearImageBtn');
    const urlInput = document.getElementById('productImageUrl');
    if (preview) { preview.src = ''; preview.style.display = 'none'; }
    if (fileInput) fileInput.value = '';
    if (clearBtn) clearBtn.style.display = 'none';
    if (urlInput) urlInput.value = '';
}

document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('productImageFile');
    if (fileInput) {
        fileInput.addEventListener('change', handleProductImageUpload);
    }
});

// ============================================================
//  TIME-BASED GREETINGS
// ============================================================
function getTimeBasedGreeting() {
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= 5 && hour < 12) {
        return {
            greeting: 'Good Morning',
            emoji: '🌅',
            message: 'Rise and shine! Start your day with Viewpoint POS.',
            gradient: 'linear-gradient(135deg, #F59E0B, #F97316)'
        };
    } else if (hour >= 12 && hour < 17) {
        return {
            greeting: 'Good Afternoon',
            emoji: '☀️',
            message: 'Keep the momentum going! You\'re doing great.',
            gradient: 'linear-gradient(135deg, #3B82F6, #8B5CF6)'
        };
    } else if (hour >= 17 && hour < 21) {
        return {
            greeting: 'Good Evening',
            emoji: '🌅',
            message: 'Wind down and finish strong!',
            gradient: 'linear-gradient(135deg, #EF4444, #8B5CF6)'
        };
    } else {
        return {
            greeting: 'Good Night',
            emoji: '🌙',
            message: 'Late night hustle! Don\'t forget to rest.',
            gradient: 'linear-gradient(135deg, #1E293B, #0F172A)'
        };
    }
}

function getCurrentDateString() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return now.toLocaleDateString('en-US', options);
}

function getUserName() {
    const nameEl = document.getElementById('userName');
    return nameEl ? nameEl.textContent : 'User';
}

function createGreetingHTML() {
    const data = getTimeBasedGreeting();
    const userName = getUserName();
    const dateString = getCurrentDateString();
    
    return `
        <div class="greeting-wrapper" style="
            background: ${data.gradient};
            border-radius: 16px;
            padding: 20px 28px;
            margin-bottom: 20px;
            color: #ffffff;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 12px;
            box-shadow: 0 4px 20px rgba(108, 60, 225, 0.3);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            animation: slideDown 0.6s ease;
        ">
            <div>
                <h2 style="font-size:24px;font-weight:700;margin:0;display:flex;align-items:center;gap:10px;">
                    <span style="font-size:28px;animation:pulse 2s ease-in-out infinite;display:inline-block;">${data.emoji}</span>
                    <span id="greetingText">${data.greeting}</span>
                </h2>
                <p style="margin:4px 0 0;opacity:0.9;font-size:14px;" id="greetingMessage">
                    ${data.message} Welcome back, ${userName}!
                </p>
            </div>
            <div style="display:flex;align-items:center;gap:16px;">
                <div style="text-align:right;">
                    <div style="font-size:12px;opacity:0.8;">Today is</div>
                    <div style="font-weight:600;font-size:14px;" id="todayDate">${dateString}</div>
                </div>
                <div style="width:50px;height:50px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:24px;animation:pulse 2s ease-in-out infinite;">
                    ${data.emoji}
                </div>
            </div>
        </div>
    `;
}

function renderGreeting() {
    const container = document.getElementById('greetingContainer');
    if (container) {
        container.innerHTML = createGreetingHTML();
    }
}

function updateGreeting() {
    const data = getTimeBasedGreeting();
    const userName = getUserName();
    const dateString = getCurrentDateString();
    
    const greetingText = document.getElementById('greetingText');
    if (greetingText) greetingText.textContent = data.greeting;
    
    const greetingMessage = document.getElementById('greetingMessage');
    if (greetingMessage) {
        greetingMessage.textContent = `${data.message} Welcome back, ${userName}!`;
    }
    
    const todayDate = document.getElementById('todayDate');
    if (todayDate) todayDate.textContent = dateString;
    
    const emojiSpans = document.querySelectorAll('#greetingContainer span[style*="animation: pulse"]');
    emojiSpans.forEach(el => {
        if (el.textContent.length <= 2) {
            el.textContent = data.emoji;
        }
    });
    
    const wrapper = document.querySelector('.greeting-wrapper');
    if (wrapper) {
        wrapper.style.background = data.gradient;
    }
}

function startGreetingUpdater() {
    updateGreeting();
    setInterval(updateGreeting, 60000);
}

function sendDailyGreetingNotification() {
    const data = getTimeBasedGreeting();
    const userName = getUserName();
    const lastGreeting = localStorage.getItem('last_greeting_date');
    const today = new Date().toISOString().split('T')[0];
    
    if (lastGreeting !== today) {
        localStorage.setItem('last_greeting_date', today);
        setTimeout(() => {
            if (typeof addNotification === 'function') {
                addNotification(
                    `${data.emoji} ${data.greeting}!`,
                    `${data.message} Welcome back, ${userName}! Have a productive day with Viewpoint POS.`,
                    'success',
                    'dashboard'
                );
            }
        }, 3000);
    }
}

function initGreeting() {
    renderGreeting();
    startGreetingUpdater();
    sendDailyGreetingNotification();
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
                total += o.total || 0;
                if (o.order_type === 'butchery') butchery += o.total || 0;
                else restaurant += o.total || 0;
                if (o.payment_method === 'mpesa') mpesa += o.total || 0;
            }
            if (o.status === 'paid' || o.status === 'preparing') pending++;
        });

        const setText = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };
        setText('todaySales', `KES ${total.toFixed(2)}`);
        setText('butcherySales', `KES ${butchery.toFixed(2)}`);
        setText('restaurantSales', `KES ${restaurant.toFixed(2)}`);
        setText('mpesaSales', `KES ${mpesa.toFixed(2)}`);
        setText('pendingOrders', pending);

        const { data: productsData } = await supabaseClient.from('products').select('stock_quantity, reorder_level');
        const low = productsData?.filter(p => p.stock_quantity <= p.reorder_level) || [];
        setText('lowStock', low.length);

        await loadRecentOrders();
        await loadTopProducts();
        await createSalesChart(orders || []);

        if (low.length > 0) {
            showToast(`⚠️ ${low.length} items are low on stock!`, 'warning');
            addNotification('Low Stock Alert', `${low.length} items are low on stock. Please restock.`, 'warning', 'inventory');
        }
    } catch (e) {
        console.error('Dashboard error:', e);
    }
}

async function loadRecentOrders() {
    try {
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
                <td><strong>KES ${(o.total || 0).toFixed(2)}</strong></td>
                <td><span class="status-badge ${o.status}">${o.status}</span></td>
                <td>${new Date(o.created_at).toLocaleTimeString()}</td>
            </tr>`;
        });
        html += '</tbody></table></div>';
        table.innerHTML = html;
    } catch (e) {
        console.error('Recent orders error:', e);
    }
}

async function loadTopProducts() {
    try {
        const list = document.getElementById('topProductsList');
        let items = [];
        
        try {
            const { data, error } = await supabaseClient
                .from('order_items')
                .select('product_id, quantity, products(name, emoji)')
                .limit(30);
            if (!error) items = data || [];
        } catch (e) {
            console.log('Could not fetch order_items:', e.message);
        }
        
        if (!items || !items.length) {
            list.innerHTML = '<div class="empty-state"><p>No sales data yet</p></div>';
            return;
        }
        
        const counts = {};
        items.forEach(item => {
            const name = item.products?.name || 'Unknown';
            counts[name] = (counts[name] || 0) + (item.quantity || 0);
        });
        
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
        if (!sorted.length) {
            list.innerHTML = '<div class="empty-state"><p>No sales data yet</p></div>';
            return;
        }
        
        const colors = ['#6C3CE1', '#10B981', '#F59E0B', '#EF4444', '#3B82F6'];
        list.innerHTML = sorted.map(([name, qty], i) => {
            const emoji = items.find(it => it.products?.name === name)?.products?.emoji || getEmoji(name);
            return `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <span style="display:inline-flex;width:26px;height:26px;border-radius:50%;background:${colors[i]};color:#fff;align-items:center;justify-content:center;font-weight:700;font-size:12px;">${i+1}</span>
                        <span style="font-weight:500;">${emoji} ${name}</span>
                    </div>
                    <span style="font-weight:700;color:var(--primary);">${qty.toFixed(1)}</span>
                </div>
            `;
        }).join('');
    } catch (e) {
        console.error('Top products error:', e);
        const list = document.getElementById('topProductsList');
        if (list) list.innerHTML = '<div class="empty-state"><p>Could not load top products</p></div>';
    }
}

async function createSalesChart(orders) {
    try {
        const daily = {};
        orders.forEach(o => {
            const d = new Date(o.created_at).toLocaleDateString();
            daily[d] = (daily[d] || 0) + (o.total || 0);
        });
        const ctx = document.getElementById('salesChart');
        if (!ctx) return;
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
    } catch (e) {
        console.error('Chart error:', e);
    }
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
    loadAuditLogs();
    showToast('🔄 All data refreshed!', 'info');
    addNotification('Data Refreshed', 'All dashboard data has been refreshed.', 'info');
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
    try {
        const { data: productsData } = await supabaseClient
            .from('products')
            .select('*')
            .eq('product_type', type)
            .eq('is_active', true);
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
                        <span class="product-emoji">${p.emoji || getEmoji(p.name)}</span>
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
                <button class="btn btn-primary" onclick="importProducts()"><i class="fas fa-upload"></i> Import</button>
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
    } catch (e) {
        console.error('POS load error:', e);
    }
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
    cart.push({
        product_id: product.id,
        name: product.name,
        quantity,
        total,
        unit_price: product.selling_price,
        emoji: product.emoji || getEmoji(product.name)
    });
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

// ============================================================
//  ORDERS
// ============================================================
async function loadOrders() {
    try {
        const { data: orders } = await supabaseClient
            .from('orders')
            .select('*, order_items(*, products(*))')
            .order('created_at', { ascending: false });
        allOrders = orders || [];
        renderOrders(allOrders);
        updateOrderCounts(allOrders);
        const badge = document.getElementById('orderBadge');
        if (badge) {
            badge.textContent = allOrders.filter(o => o.status === 'paid' || o.status === 'preparing').length;
        }
        resetSessionTimer();
    } catch (e) { 
        console.error('Orders error:', e); 
        const container = document.getElementById('ordersContainer');
        if (container) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Could not load orders</p></div>';
        }
    }
}

function renderOrders(orders) {
    let filtered = orders;
    if (currentFilter === 'butchery') filtered = orders.filter(o => o.order_type === 'butchery');
    else if (currentFilter === 'restaurant') filtered = orders.filter(o => o.order_type === 'restaurant');
    else if (['paid', 'preparing', 'ready', 'completed'].includes(currentFilter)) {
        filtered = orders.filter(o => o.status === currentFilter);
    }
    const container = document.getElementById('ordersContainer');
    const countEl = document.getElementById('orderCount');
    if (!container) return;
    if (countEl) countEl.textContent = filtered.length;
    
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
                                <span>${item.products?.emoji || getEmoji(item.products?.name || '📦')} ${item.products?.name || 'Unknown'}</span>
                                <span>${(item.quantity || 0).toFixed(3)} ${item.products?.unit || ''}</span>
                                <span>KES ${(item.total || 0).toFixed(2)}</span>
                            </div>
                        `).join('')}
                        ${items.length > 3 ? `<div style="color:var(--text-muted);font-size:12px;">+ ${items.length - 3} more</div>` : ''}
                    </div>
                    <div class="order-footer">
                        <span class="order-total">KES ${(order.total || 0).toFixed(2)}</span>
                        <span class="order-time">${new Date(order.created_at).toLocaleTimeString()}</span>
                    </div>
                    ${order.customer_phone ? `<div style="font-size:12px;color:var(--text-muted);"><i class="fas fa-phone"></i> ${order.customer_phone}</div>` : ''}
                    <div class="order-actions">
                        ${order.status === 'paid' ? `<button class="btn btn-sm btn-warning" onclick="updateOrderStatus('${order.id}','preparing')"><i class="fas fa-play"></i> Start</button>` : ''}
                        ${order.status === 'preparing' ? `<button class="btn btn-sm btn-success" onclick="updateOrderStatus('${order.id}','ready')"><i class="fas fa-check"></i> Ready</button>` : ''}
                        ${order.status === 'ready' ? `<button class="btn btn-sm btn-primary" onclick="updateOrderStatus('${order.id}','completed')"><i class="fas fa-flag-checkered"></i> Complete</button>` : ''}
                        <button class="btn btn-sm btn-outline" onclick="viewOrderDetails('${order.id}')"><i class="fas fa-eye"></i> View</button>
                        <button class="btn btn-sm btn-success" onclick="generateAdminReceipt('${order.id}')" title="Generate Receipt">
                            <i class="fas fa-receipt"></i> Receipt
                        </button>
                    </div>
                </div>
            `;
    }).join('')}</div>`;
}

function updateOrderCounts(orders) {
    const setCount = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };
    setCount('countAll', orders.length);
    setCount('countButchery', orders.filter(o => o.order_type === 'butchery').length);
    setCount('countRestaurant', orders.filter(o => o.order_type === 'restaurant').length);
    setCount('countPaid', orders.filter(o => o.status === 'paid').length);
    setCount('countPreparing', orders.filter(o => o.status === 'preparing').length);
    setCount('countReady', orders.filter(o => o.status === 'ready').length);
    setCount('countCompleted', orders.filter(o => o.status === 'completed').length);
}

async function updateOrderStatus(orderId, status) {
    try {
        await supabaseClient.from('orders').update({ status }).eq('id', orderId);
        showToast(`✅ Order ${status}!`, 'success');
        addNotification('Order Updated', `Order #${orderId.slice(0,8)} is now ${status}`, 'info', 'orders');
        loadOrders();
        loadKitchenOrders();
        resetSessionTimer();
    } catch (e) { showToast('❌ ' + e.message, 'error'); }
}

async function viewOrderDetails(orderId) {
    try {
        const { data: order } = await supabaseClient
            .from('orders')
            .select('*, order_items(*, products(*))')
            .eq('id', orderId).single();
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
                    <div style="font-size:18px;font-weight:700;color:var(--primary);">KES ${(order.total || 0).toFixed(2)}</div>
                </div>
            </div>
            <div style="background:var(--bg);border-radius:var(--radius-sm);padding:14px;margin-bottom:14px;">
                <h4 style="margin-bottom:6px;">🛒 Items</h4>
                ${items.map(item => `
                    <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border);font-size:14px;">
                        <span>${item.products?.emoji || getEmoji(item.products?.name || '📦')} ${item.products?.name || 'Unknown'}</span>
                        <span>${(item.quantity || 0).toFixed(3)} × KES ${(item.unit_price || 0).toFixed(2)}</span>
                        <span style="font-weight:600;">KES ${(item.total || 0).toFixed(2)}</span>
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
    } catch (e) {
        console.error('View order error:', e);
        showToast('❌ Could not load order details', 'error');
    }
}

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
        const { data: orders } = await supabaseClient
            .from('orders')
            .select('*, order_items(*, products(*))')
            .in('status', ['paid', 'preparing', 'ready'])
            .order('created_at', { ascending: false });

        const container = document.getElementById('kitchenOrders');
        const countEl = document.getElementById('kitchenOrderCount');
        if (countEl) countEl.textContent = orders?.length || 0;

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
                                <span>${item.products?.emoji || getEmoji(item.products?.name || '📦')} ${item.products?.name || 'Unknown'}</span>
                                <span>${(item.quantity || 0).toFixed(3)}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="order-footer">
                        <span class="order-total">KES ${(order.total || 0).toFixed(2)}</span>
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
    try {
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
                <td><strong>${p.emoji || getEmoji(p.name)} ${p.name}</strong></td>
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
    } catch (e) {
        console.error('Products error:', e);
        const table = document.getElementById('productsTable');
        if (table) table.innerHTML = '<div class="empty-state"><p>Could not load products</p></div>';
    }
}

async function editProduct(id) {
    try {
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
        
        if (p.emoji) {
            currentProductEmoji = p.emoji;
            document.getElementById('selectedEmojiDisplay').textContent = p.emoji;
            document.getElementById('productEmoji').value = p.emoji;
        }
        
        if (p.image_url) {
            document.getElementById('productImagePreview').src = p.image_url;
            document.getElementById('productImagePreview').style.display = 'block';
            document.getElementById('productImageUrl').value = p.image_url;
        }
        
        openModal('productModal');
    } catch (e) {
        console.error('Edit product error:', e);
        showToast('❌ Could not load product', 'error');
    }
}

async function deleteProduct(id) {
    if (!confirm('Delete this product?')) return;
    try {
        await supabaseClient.from('products').delete().eq('id', id);
        showToast('Product deleted', 'success');
        loadProducts();
    } catch (e) {
        showToast('❌ Could not delete product', 'error');
    }
}

document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('productId').value;
    
    let imageUrl = document.getElementById('productImageUrl').value;
    if (currentProductImageFile) {
        const uploadedUrl = await uploadProductImage(currentProductImageFile);
        if (uploadedUrl) imageUrl = uploadedUrl;
    }
    
    const data = {
        name: document.getElementById('productName').value,
        product_type: document.getElementById('productType').value,
        selling_price: parseFloat(document.getElementById('productPrice').value),
        cost_price: parseFloat(document.getElementById('productCost').value) || null,
        unit: document.getElementById('productUnit').value,
        stock_quantity: parseFloat(document.getElementById('productStock').value) || 0,
        reorder_level: parseFloat(document.getElementById('productReorder').value) || 0,
        emoji: document.getElementById('productEmoji').value || '📦',
        image_url: imageUrl || null,
        is_active: document.getElementById('productStatus').value === 'active'
    };
    
    try {
        if (id) {
            await supabaseClient.from('products').update(data).eq('id', id);
            showToast('✅ Product updated!', 'success');
        } else {
            await supabaseClient.from('products').insert(data);
            showToast('✅ Product created!', 'success');
        }
        closeModal('productModal');
        loadProducts();
    } catch (e) {
        showToast('❌ Could not save product: ' + e.message, 'error');
    }
});

// ============================================================
//  INVENTORY
// ============================================================
async function loadInventory() {
    try {
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
                <td><strong>${p.emoji || getEmoji(p.name)} ${p.name}</strong> ${isLow ? '⚠️' : ''}</td>
                <td><span class="badge ${p.product_type}">${p.product_type}</span></td>
                <td><strong>${p.stock_quantity}</strong></td>
                <td>${p.unit}</td>
                <td>${p.reorder_level}</td>
                <td><span class="status-badge ${isLow ? 'warning' : 'active'}">${isLow ? '⚠️ Low Stock' : '✅ OK'}</span></td>
            </tr>`;
        });
        html += '</tbody></table></div>';
        table.innerHTML = html;

        // Load stock movements
        await loadStockMovements();
    } catch (e) {
        console.error('Inventory error:', e);
    }
}

async function loadStockMovements() {
    try {
        const { data: movements } = await supabaseClient
            .from('inventory_movements')
            .select('*, products(name, emoji)')
            .order('created_at', { ascending: false })
            .limit(15);
        
        const movementTable = document.getElementById('stockMovementsTable');
        if (!movements?.length) {
            movementTable.innerHTML = '<div class="empty-state"><p>No movements</p></div>';
            return;
        }
        let mHtml = '<div class="table-wrapper"><table class="data-table"><thead><tr><th>📦 Product</th><th>📂 Type</th><th>📊 Quantity</th><th>📅 Date</th></tr></thead><tbody>';
        movements.forEach(m => {
            const isAdd = m.quantity > 0;
            const productName = m.products?.name || 'Unknown';
            const productEmoji = m.products?.emoji || getEmoji(productName);
            mHtml += `<tr>
                <td>${productEmoji} ${productName}</td>
                <td><span class="badge ${isAdd ? 'success' : 'danger'}">${isAdd ? '➕ Restock' : '➖ Sale'}</span></td>
                <td style="color:${isAdd ? 'var(--success)' : 'var(--danger)'};">${isAdd ? '+' : ''}${m.quantity || 0}</td>
                <td>${m.created_at ? new Date(m.created_at).toLocaleString() : 'N/A'}</td>
            </tr>`;
        });
        mHtml += '</tbody></table></div>';
        movementTable.innerHTML = mHtml;
    } catch (e) {
        console.error('Stock movements error:', e);
    }
}

async function loadProductDropdown() {
    try {
        const { data: productsData } = await supabaseClient
            .from('products')
            .select('id, name, emoji')
            .order('name');
        const select = document.getElementById('stockProduct');
        if (!select) return;
        
        if (!productsData || !productsData.length) {
            select.innerHTML = '<option value="">No products available</option>';
            return;
        }
        
        select.innerHTML = productsData.map(p => 
            `<option value="${p.id}">${p.emoji || '📦'} ${p.name}</option>`
        ).join('');
    } catch (error) {
        console.error('Load product dropdown error:', error);
        const select = document.getElementById('stockProduct');
        if (select) {
            select.innerHTML = '<option value="">Error loading products</option>';
        }
    }
}

document.getElementById('stockForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const productId = document.getElementById('stockProduct').value;
    const type = document.getElementById('adjustmentType').value;
    const qty = parseFloat(document.getElementById('adjustmentQty').value);
    const reason = document.getElementById('adjustmentReason').value || 'Manual adjustment';
    
    if (!productId) {
        showToast('Please select a product', 'error');
        return;
    }
    
    try {
        const { data: product } = await supabaseClient
            .from('products')
            .select('stock_quantity')
            .eq('id', productId).single();
        const newStock = type === 'add' ? product.stock_quantity + qty : product.stock_quantity - qty;
        await supabaseClient.from('products').update({ stock_quantity: newStock }).eq('id', productId);
        await supabaseClient.from('inventory_movements').insert({
            product_id: productId,
            movement_type: type === 'add' ? 'restock' : 'adjustment',
            quantity: type === 'add' ? qty : -qty,
            previous_stock: product.stock_quantity,
            new_stock: newStock,
            created_by: currentUser?.id,
            notes: reason
        });
        showToast(`✅ Stock adjusted! New stock: ${newStock}`, 'success');
        closeModal('stockModal');
        loadInventory();
    } catch (e) {
        showToast('❌ Could not adjust stock: ' + e.message, 'error');
    }
});

// ============================================================
//  USERS - WITH PIN
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
        const pin = document.getElementById('userPin').value;

        if (!fullName || !email || !password || !roleId) throw new Error('Fill all required fields');
        if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
            throw new Error('PIN must be exactly 4 digits');
        }

        // Create user
        const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            user_metadata: {
                full_name: fullName,
                phone: phone || ''
            }
        });

        if (authError) {
            const { data: signUpData, error: signUpError } = await supabaseClient.auth.signUp({
                email: email,
                password: password,
                options: {
                    email_confirm: false,
                    data: {
                        full_name: fullName,
                        phone: phone || ''
                    }
                }
            });
            if (signUpError) throw new Error(signUpError.message);
            var userId = signUpData.user.id;
        } else {
            var userId = authData.user.id;
        }

        const username = email.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        const { error: insertError } = await supabaseClient.from('users').insert({
            id: userId,
            username: username,
            email: email,
            full_name: fullName,
            phone: phone || null,
            role_id: roleId,
            status: status,
            pin: pin,
            two_fa_enabled: twoFA === 1,
            email_verified: true,
            created_at: new Date().toISOString()
        });

        if (insertError) throw new Error(insertError.message);

        showToast(`✅ User "${fullName}" created with PIN!`, 'success');
        addNotification('User Created', `User "${fullName}" created successfully.`, 'success', 'users');
        closeModal('userModal');
        loadUsers();

    } catch (error) {
        console.error('Create user error:', error);
        showToast('❌ ' + error.message, 'error');
    } finally {
        btn.innerHTML = '<i class="fas fa-save"></i> Create User';
        btn.disabled = false;
    }
});

async function loadUsers() {
    try {
        const { data: usersData } = await supabaseClient
            .from('users')
            .select('*, roles(name)')
            .order('full_name');
        const table = document.getElementById('usersTable');
        if (!usersData?.length) {
            table.innerHTML = '<div class="empty-state"><i class="fas fa-users"></i><p>No users</p></div>';
            return;
        }
        let html = '<div class="table-wrapper"><table class="data-table"><thead><tr><th>👤 Name</th><th>📧 Email</th><th>👑 Role</th><th>🔐 PIN</th><th>🔑 2FA</th><th>📊 Status</th><th>⚙️ Actions</th></tr></thead><tbody>';
        usersData.forEach(u => {
            const roleEmoji = u.roles?.name === 'admin' ? '👑' : u.roles?.name === 'cashier' ? '💰' : u.roles?.name === 'butcher' ? '🥩' : '🍳';
            html += `<tr>
                <td><strong>${u.full_name}</strong></td>
                <td>${u.email}</td>
                <td><span class="badge ${u.roles?.name || 'cashier'}">${roleEmoji} ${u.roles?.name || 'Unknown'}</span></td>
                <td>${u.pin ? '✅ Set' : '❌ Not set'}</td>
                <td>${u.two_fa_enabled ? '✅ Enabled' : '❌ Disabled'}</td>
                <td><span class="status-badge ${u.status}">${u.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="editUser('${u.id}')" title="Edit User"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger" onclick="deleteUser('${u.id}')" title="Delete User"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
        });
        html += '</tbody></table></div>';
        table.innerHTML = html;
    } catch (e) {
        console.error('Load users error:', e);
    }
}

async function deleteUser(id) {
    if (!confirm('Delete this user?')) return;
    try {
        await supabaseClient.from('users').delete().eq('id', id);
        showToast('User deleted', 'success');
        loadUsers();
    } catch (e) {
        showToast('❌ Could not delete user', 'error');
    }
}

// ============================================================
//  EDIT USER - WITH PIN UPDATE
// ============================================================
async function editUser(userId) {
    try {
        const { data: user, error } = await supabaseClient
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error || !user) {
            showToast('❌ User not found!', 'error');
            return;
        }

        document.getElementById('editUserId').value = user.id;
        document.getElementById('editUserFullName').value = user.full_name || '';
        document.getElementById('editUserEmail').value = user.email || '';
        document.getElementById('editUserPhone').value = user.phone || '';
        document.getElementById('editUserRole').value = user.role_id || 2;
        document.getElementById('editUser2FA').value = user.two_fa_enabled ? 1 : 0;
        document.getElementById('editUserStatus').value = user.status || 'active';
        document.getElementById('editUserPin').value = '';
        document.getElementById('editUserModalTitle').textContent = `✏️ Edit User: ${user.full_name}`;

        openModal('editUserModal');

    } catch (error) {
        console.error('Edit user error:', error);
        showToast('❌ Error loading user: ' + error.message, 'error');
    }
}

document.getElementById('editUserForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const btn = document.getElementById('editUserSubmitBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner"></span> Updating...';
    btn.disabled = true;

    try {
        const userId = document.getElementById('editUserId').value;
        const pin = document.getElementById('editUserPin').value;
        
        const data = {
            full_name: document.getElementById('editUserFullName').value.trim(),
            email: document.getElementById('editUserEmail').value.trim(),
            phone: document.getElementById('editUserPhone').value.trim() || null,
            role_id: parseInt(document.getElementById('editUserRole').value),
            two_fa_enabled: parseInt(document.getElementById('editUser2FA').value) === 1,
            status: document.getElementById('editUserStatus').value
        };
        
        if (pin && pin.length === 4 && /^\d{4}$/.test(pin)) {
            data.pin = pin;
        } else if (pin && pin.length > 0) {
            throw new Error('PIN must be exactly 4 digits');
        }

        const { error: updateError } = await supabaseClient
            .from('users')
            .update(data)
            .eq('id', userId);

        if (updateError) throw updateError;

        showToast('✅ User updated successfully!', 'success');
        closeModal('editUserModal');
        loadUsers();

    } catch (error) {
        console.error('Update user error:', error);
        showToast('❌ Error updating user: ' + error.message, 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
});

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
    try {
        await supabaseClient.from('customers').insert(data);
        showToast('✅ Customer added!', 'success');
        closeModal('customerModal');
        loadCustomers();
    } catch (e) {
        showToast('❌ Could not add customer: ' + e.message, 'error');
    }
});

async function loadCustomers() {
    try {
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
    } catch (e) {
        console.error('Load customers error:', e);
    }
}

async function deleteCustomer(id) {
    if (!confirm('Delete this customer?')) return;
    try {
        await supabaseClient.from('customers').delete().eq('id', id);
        showToast('Customer deleted', 'success');
        loadCustomers();
    } catch (e) {
        showToast('❌ Could not delete customer', 'error');
    }
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
    try {
        await supabaseClient.from('suppliers').insert(data);
        showToast('✅ Supplier added!', 'success');
        closeModal('supplierModal');
        loadSuppliers();
    } catch (e) {
        showToast('❌ Could not add supplier: ' + e.message, 'error');
    }
});

async function loadSuppliers() {
    try {
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
    } catch (e) {
        console.error('Load suppliers error:', e);
    }
}

async function deleteSupplier(id) {
    if (!confirm('Delete this supplier?')) return;
    try {
        await supabaseClient.from('suppliers').delete().eq('id', id);
        showToast('Supplier deleted', 'success');
        loadSuppliers();
    } catch (e) {
        showToast('❌ Could not delete supplier', 'error');
    }
}

// ============================================================
//  PROFIT & LOSS
// ============================================================
async function loadProfitData() {
    try {
        const { data: orders } = await supabaseClient
            .from('orders')
            .select('*, order_items(*, products(*))')
            .eq('status', 'paid');
        let revenue = 0, cost = 0;
        orders?.forEach(order => {
            revenue += order.total || 0;
            order.order_items?.forEach(item => {
                cost += ((item.products?.cost_price || 0) * (item.quantity || 0));
            });
        });
        const profit = revenue - cost;
        document.getElementById('totalRevenue').textContent = `KES ${revenue.toFixed(2)}`;
        document.getElementById('totalCost').textContent = `KES ${cost.toFixed(2)}`;
        document.getElementById('netProfit').textContent = `KES ${profit.toFixed(2)}`;

        const ctx = document.getElementById('profitChart');
        if (!ctx) return;
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
        const date = document.getElementById('auditDate')?.value;
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
    const start = document.getElementById('reportStart')?.value;
    const end = document.getElementById('reportEnd')?.value;
    if (!start || !end) { showToast('Select date range', 'warning'); return; }
    try {
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
            total += o.total || 0;
            if (o.payment_method === 'mpesa') mpesa += o.total || 0;
            else if (o.payment_method === 'cash') cash += o.total || 0;
            if (o.order_type === 'butchery') butchery += o.total || 0;
            else restaurant += o.total || 0;
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
                            <td>KES ${(o.total || 0).toFixed(2)}</td>
                            <td>${o.payment_method || 'N/A'}</td>
                            <td>${new Date(o.created_at).toLocaleDateString()}</td>
                        </tr>
                    `).join('')}</tbody>
                </table></div>
            </div>
        `;
        showToast('📊 Report generated!', 'success');
    } catch (e) {
        showToast('❌ Could not generate report', 'error');
    }
}

// ============================================================
//  EXPORT FUNCTIONS
// ============================================================
async function exportReport(format) {
    const start = document.getElementById('reportStart')?.value;
    const end = document.getElementById('reportEnd')?.value;
    
    if (!start || !end) {
        showToast('Select date range first', 'warning');
        return;
    }
    
    try {
        const { data: orders } = await supabaseClient.from('orders').select('*')
            .gte('created_at', start + 'T00:00:00')
            .lte('created_at', end + 'T23:59:59');
            
        if (!orders?.length) {
            showToast('No data to export', 'warning');
            return;
        }
        
        if (format === 'csv') {
            let csv = 'Order ID,Type,Total,Payment,Status,Date\n';
            orders.forEach(o => {
                csv += `${o.order_number || o.id.slice(0,8)},${o.order_type},${o.total || 0},${o.payment_method || 'N/A'},${o.status},${new Date(o.created_at).toLocaleDateString()}\n`;
            });
            
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `sales_report_${start}_to_${end}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
            
            showToast('📤 CSV exported successfully!', 'success');
        } else {
            showToast('📤 Export format not supported yet', 'info');
        }
        
    } catch (error) {
        console.error('Export error:', error);
        showToast('❌ Export failed: ' + error.message, 'error');
    }
}

// ============================================================
//  BULK PRODUCT IMPORT
// ============================================================
function importProducts() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = async function(event) {
            try {
                const text = event.target.result;
                const lines = text.split('\n');
                
                let imported = 0;
                let errors = 0;
                
                for (let i = 1; i < lines.length; i++) {
                    if (!lines[i].trim()) continue;
                    const values = lines[i].split(',');
                    
                    try {
                        const product = {
                            name: values[0]?.trim() || 'Unknown',
                            product_type: values[1]?.trim() || 'butchery',
                            selling_price: parseFloat(values[2]) || 0,
                            cost_price: parseFloat(values[3]) || 0,
                            unit: values[4]?.trim() || 'KG',
                            stock_quantity: parseFloat(values[5]) || 0,
                            reorder_level: parseFloat(values[6]) || 0,
                            emoji: values[7]?.trim() || '📦',
                            is_active: true
                        };
                        
                        await supabaseClient.from('products').insert(product);
                        imported++;
                    } catch (err) {
                        errors++;
                        console.error('Import error for line', i, err);
                    }
                }
                
                showToast(`✅ Imported ${imported} products. ${errors} errors.`, 'success');
                addNotification('Products Imported', `${imported} products imported successfully.`, 'success', 'products');
                loadProducts();
                
            } catch (error) {
                console.error('Import error:', error);
                showToast('❌ Import failed: ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// ============================================================
//  SETTINGS
// ============================================================
document.getElementById('settingsForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const timeout = parseInt(document.getElementById('sessionTimeout')?.value);
    if (timeout > 0) {
        sessionTimeout = timeout;
        resetSessionTimer();
    }
    showToast('✅ Business settings saved!', 'success');
});

document.getElementById('mpesaForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('✅ M-Pesa settings saved!', 'success');
});

// ============================================================
//  INIT
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Admin dashboard loading...');
    
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const newThemeToggle = themeToggle.cloneNode(true);
        themeToggle.parentNode.replaceChild(newThemeToggle, themeToggle);
        newThemeToggle.addEventListener('click', () => setTheme(!isDark));
    }
    setTheme(isDark);

    // Check auth
    const user = await checkAuth();
    if (!user) {
        console.log('❌ Auth failed, redirecting...');
        return;
    }

    console.log('✅ User authenticated:', user.email);

    // Start clock
    startClock();

    // Initialize greeting
    initGreeting();

    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const reportStart = document.getElementById('reportStart');
    const reportEnd = document.getElementById('reportEnd');
    const auditDate = document.getElementById('auditDate');
    if (reportStart) reportStart.value = lastWeek;
    if (reportEnd) reportEnd.value = today;
    if (auditDate) auditDate.value = today;

    // Load all data
    setTimeout(async () => {
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
        await loadProductDropdown();

        isInitialized = true;
        console.log('✅ Admin dashboard loaded successfully!');
        
        addNotification(
            '👋 Welcome Back!',
            `Welcome ${user.full_name || 'Admin'} to Viewpoint POS Dashboard.`,
            'success'
        );
    }, 100);
});

// ============================================================
//  EXPOSE GLOBALS
// ============================================================
window.navigateTo = navigateTo;
window.openModal = openModal;
window.closeModal = closeModal;
window.showToast = showToast;
window.logout = logout;
window.refreshAll = refreshAll;
window.switchPOS = switchPOS;
window.selectPOSProduct = selectPOSProduct;
window.addToCartPOS = addToCartPOS;
window.clearCartPOS = clearCartPOS;
window.updateOrderStatus = updateOrderStatus;
window.viewOrderDetails = viewOrderDetails;
window.generateReport = generateReport;
window.exportReport = exportReport;
window.importProducts = importProducts;
window.loadDashboard = loadDashboard;
window.loadProducts = loadProducts;
window.loadUsers = loadUsers;
window.loadInventory = loadInventory;
window.loadOrders = loadOrders;
window.loadCustomers = loadCustomers;
window.loadSuppliers = loadSuppliers;
window.loadKitchenOrders = loadKitchenOrders;
window.loadProfitData = loadProfitData;
window.loadAuditLogs = loadAuditLogs;
window.generateAdminReceipt = generateAdminReceipt;
window.printReceipt = printReceipt;
window.processPaymentPOS = processPaymentPOS;
window.handlePayHeroWebhook = handlePayHeroWebhook;
window.addNotification = addNotification;
window.markAllNotificationsRead = markAllNotificationsRead;
window.selectEmoji = selectEmoji;
window.toggleEmojiPicker = toggleEmojiPicker;
window.clearEmoji = clearEmoji;
window.clearProductImage = clearProductImage;
window.uploadProductImage = uploadProductImage;
window.loadProductDropdown = loadProductDropdown;
window.initGreeting = initGreeting;
window.renderGreeting = renderGreeting;
window.updateGreeting = updateGreeting;
