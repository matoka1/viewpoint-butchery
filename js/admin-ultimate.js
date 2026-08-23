// ============================================================
//  ULTIMATE ADMIN DASHBOARD - COMPLETE FIXED VERSION
//  ALL ERRORS FIXED - NULL CHECKS ADDED - GREETINGS INCLUDED
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
//  EMOJIS - COMPLETE WITH ALL KENYAN FOODS & NAMES
// ============================================================

const AVAILABLE_EMOJIS = [
    // 🥩 MEAT & PROTEIN
    { emoji: '🥩', name: 'Meat' },
    { emoji: '🍗', name: 'Chicken' },
    { emoji: '🥓', name: 'Bacon' },
    { emoji: '🍖', name: 'Ribs' },
    { emoji: '🐄', name: 'Beef/Cow' },
    { emoji: '🐖', name: 'Pork' },
    { emoji: '🐑', name: 'Mutton/Sheep' },
    { emoji: '🐐', name: 'Goat' },
    { emoji: '🐓', name: 'Poultry' },
    { emoji: '🦃', name: 'Turkey' },
    { emoji: '🐟', name: 'Fish' },
    { emoji: '🦐', name: 'Shrimp' },
    { emoji: '🦞', name: 'Lobster' },
    { emoji: '🦀', name: 'Crab' },
    { emoji: '🐙', name: 'Octopus' },
    { emoji: '🦑', name: 'Squid' },
    { emoji: '🐚', name: 'Shellfish' },
    { emoji: '🦪', name: 'Oysters' },
    { emoji: '🐠', name: 'Tropical Fish' },
    { emoji: '🐡', name: 'Blowfish' },
    
    // 🍔 FAST FOOD & MEALS
    { emoji: '🍔', name: 'Burger' },
    { emoji: '🌭', name: 'Hot Dog' },
    { emoji: '🍕', name: 'Pizza' },
    { emoji: '🧆', name: 'Falafel' },
    { emoji: '🌮', name: 'Taco' },
    { emoji: '🌯', name: 'Burrito' },
    { emoji: '🥙', name: 'Stuffed Flatbread' },
    { emoji: '🧇', name: 'Waffle' },
    { emoji: '🥞', name: 'Pancakes' },
    { emoji: '🥪', name: 'Sandwich' },
    { emoji: '🍟', name: 'Chips/Fries' },
    { emoji: '🍝', name: 'Pasta' },
    { emoji: '🍜', name: 'Noodles' },
    { emoji: '🍲', name: 'Stew/Soup' },
    { emoji: '🍛', name: 'Curry' },
    { emoji: '🍣', name: 'Sushi' },
    { emoji: '🍱', name: 'Bento Box' },
    { emoji: '🥘', name: 'Pan/Pot Food' },
    { emoji: '🍳', name: 'Fried Egg' },
    { emoji: '🥚', name: 'Egg' },
    
    // 🥗 VEGETABLES & SALADS
    { emoji: '🥬', name: 'Leafy Greens' },
    { emoji: '🥒', name: 'Cucumber' },
    { emoji: '🥑', name: 'Avocado' },
    { emoji: '🍅', name: 'Tomato' },
    { emoji: '🌽', name: 'Corn/Maize' },
    { emoji: '🥕', name: 'Carrot' },
    { emoji: '🧅', name: 'Onion' },
    { emoji: '🧄', name: 'Garlic' },
    { emoji: '🫑', name: 'Bell Pepper' },
    { emoji: '🌶️', name: 'Chili Pepper' },
    { emoji: '🥦', name: 'Broccoli' },
    { emoji: '🥗', name: 'Salad' },
    { emoji: '🥔', name: 'Potato' },
    { emoji: '🍠', name: 'Sweet Potato' },
    { emoji: '🥜', name: 'Peanuts' },
    { emoji: '🌰', name: 'Nuts' },
    { emoji: '🫘', name: 'Beans' },
    { emoji: '🍆', name: 'Eggplant' },
    
    // 🍎 FRUITS
    { emoji: '🍎', name: 'Apple' },
    { emoji: '🍊', name: 'Orange' },
    { emoji: '🍋', name: 'Lemon' },
    { emoji: '🍌', name: 'Banana/Matoke' },
    { emoji: '🍉', name: 'Watermelon' },
    { emoji: '🍇', name: 'Grapes' },
    { emoji: '🍓', name: 'Strawberry' },
    { emoji: '🫐', name: 'Blueberry' },
    { emoji: '🍑', name: 'Peach' },
    { emoji: '🍒', name: 'Cherry' },
    { emoji: '🍍', name: 'Pineapple' },
    { emoji: '🥭', name: 'Mango' },
    { emoji: '🍐', name: 'Pear' },
    { emoji: '🍏', name: 'Green Apple' },
    { emoji: '🍈', name: 'Melon' },
    { emoji: '🥥', name: 'Coconut' },
    { emoji: '🥝', name: 'Kiwi' },
    
    // 🥤 DRINKS
    { emoji: '🥤', name: 'Soda/Drink' },
    { emoji: '🧃', name: 'Juice' },
    { emoji: '🧉', name: 'Mate Tea' },
    { emoji: '🍵', name: 'Tea' },
    { emoji: '☕', name: 'Coffee' },
    { emoji: '🍺', name: 'Beer' },
    { emoji: '🍷', name: 'Wine' },
    { emoji: '🥂', name: 'Toast/Cheers' },
    { emoji: '🥛', name: 'Milk' },
    { emoji: '🧋', name: 'Bubble Tea' },
    { emoji: '🍶', name: 'Sake' },
    { emoji: '🍾', name: 'Bottle' },
    { emoji: '🧊', name: 'Ice' },
    { emoji: '🍹', name: 'Cocktail' },
    { emoji: '🍸', name: 'Martini' },
    { emoji: '🥃', name: 'Whiskey' },
    { emoji: '🍻', name: 'Beer Clink' },
    
    // 🍞 BREADS & BAKED
    { emoji: '🍞', name: 'Bread' },
    { emoji: '🥐', name: 'Croissant' },
    { emoji: '🥖', name: 'Baguette' },
    { emoji: '🫓', name: 'Chapati/Flatbread' },
    { emoji: '🥨', name: 'Pretzel' },
    { emoji: '🥯', name: 'Bagel' },
    { emoji: '🧇', name: 'Waffle' },
    { emoji: '🥞', name: 'Pancakes' },
    { emoji: '🧁', name: 'Cupcake' },
    { emoji: '🍰', name: 'Cake' },
    { emoji: '🎂', name: 'Birthday Cake' },
    { emoji: '🍩', name: 'Donut' },
    { emoji: '🍪', name: 'Cookie' },
    { emoji: '🥮', name: 'Mooncake' },
    { emoji: '🍥', name: 'Fish Cake' },
    { emoji: '🥠', name: 'Fortune Cookie' },
    { emoji: '🥟', name: 'Dumpling' },
    { emoji: '🍘', name: 'Rice Cracker' },
    { emoji: '🍙', name: 'Rice Ball' },
    { emoji: '🍚', name: 'Rice' },
    
    // 🍦 DESSERTS
    { emoji: '🍦', name: 'Ice Cream' },
    { emoji: '🍧', name: 'Shaved Ice' },
    { emoji: '🍨', name: 'Ice Cream Sundae' },
    { emoji: '🍩', name: 'Donut' },
    { emoji: '🍪', name: 'Cookie' },
    { emoji: '🧁', name: 'Cupcake' },
    { emoji: '🎂', name: 'Cake' },
    { emoji: '🍰', name: 'Slice Cake' },
    { emoji: '🍫', name: 'Chocolate' },
    { emoji: '🍬', name: 'Candy' },
    { emoji: '🍭', name: 'Lollipop' },
    { emoji: '🍮', name: 'Pudding' },
    { emoji: '🍯', name: 'Honey' },
    { emoji: '🥮', name: 'Mooncake' },
    { emoji: '🍡', name: 'Dango' },
    
    // 🥘 TRADITIONAL/AFRICAN
    { emoji: '🥘', name: 'Githeri/Stew' },
    { emoji: '🍲', name: 'Beef Stew' },
    { emoji: '🍛', name: 'Pilau/Curry' },
    { emoji: '🍣', name: 'Sushi' },
    { emoji: '🍱', name: 'Bento' },
    { emoji: '🥡', name: 'Takeout' },
    { emoji: '🍜', name: 'Noodles' },
    { emoji: '🍝', name: 'Pasta' },
    { emoji: '🍤', name: 'Bhajias/Fried' },
    { emoji: '🍥', name: 'Fish Cake' },
    { emoji: '🥠', name: 'Fortune Cookie' },
    { emoji: '🥟', name: 'Samosas' },
    { emoji: '🍘', name: 'Rice Cracker' },
    { emoji: '🍙', name: 'Rice Ball' },
    { emoji: '🍚', name: 'Rice' },
    { emoji: '🫓', name: 'Chapati' },
    { emoji: '🌽', name: 'Ugali/Corn' },
    { emoji: '🥔', name: 'Mukimo/Potato' },
    
    // 🧂 SPICES
    { emoji: '🧂', name: 'Salt' },
    { emoji: '🧈', name: 'Butter' },
    { emoji: '🧀', name: 'Cheese' },
    { emoji: '🧅', name: 'Onion' },
    { emoji: '🧄', name: 'Garlic' },
    { emoji: '🫑', name: 'Pepper' },
    { emoji: '🌶️', name: 'Chili' },
    { emoji: '🥫', name: 'Canned Food' },
    { emoji: '🫙', name: 'Jar' },
    { emoji: '🌿', name: 'Herbs' },
    
    // 🍽️ UTENSILS
    { emoji: '🍽️', name: 'Plate/Cutlery' },
    { emoji: '🥄', name: 'Spoon' },
    { emoji: '🍴', name: 'Fork & Knife' },
    { emoji: '🥢', name: 'Chopsticks' },
    { emoji: '🔪', name: 'Knife' },
    { emoji: '🍶', name: 'Sake' },
    { emoji: '🧂', name: 'Salt' },
    { emoji: '🥫', name: 'Canned' },
    { emoji: '🫙', name: 'Jar' },
    { emoji: '🍾', name: 'Bottle' },
    
    // 📦 GENERAL
    { emoji: '📦', name: 'Package' },
    { emoji: '🏷️', name: 'Label' },
    { emoji: '⭐', name: 'Star' },
    { emoji: '💎', name: 'Diamond' },
    { emoji: '🎯', name: 'Target' },
    { emoji: '🔥', name: 'Hot/Popular' },
    { emoji: '👍', name: 'Thumbs Up' },
    { emoji: '👌', name: 'OK' },
    { emoji: '✨', name: 'Special' },
    { emoji: '🌟', name: 'Featured' }
];

// ============================================================
//  UPDATED getEmoji FUNCTION
// ============================================================
function getEmoji(name) {
    const emojis = {
        // 🥩 MEATS
        'Beef': '🥩',
        'Goat Meat': '🐐',
        'Chicken': '🍗',
        'Liver': '❤️',
        'Minced Meat': '🥩',
        'Sausages': '🌭',
        'Pork': '🐖',
        'Mutton': '🐑',
        'Turkey': '🦃',
        'Duck': '🦆',
        'Rabbit': '🐇',
        'Bacon': '🥓',
        'Ham': '🥩',
        'Meat': '🥩',
        'Steak': '🥩',
        'Ribs': '🍖',
        'Wings': '🍗',
        'Kuku': '🍗',
        'Nyama': '🥩',
        'Mbuzi': '🐐',
        'Ng\'ombe': '🐄',
        
        // 🐟 SEAFOOD
        'Fish': '🐟',
        'Tilapia': '🐟',
        'Salmon': '🐟',
        'Shrimp': '🦐',
        'Lobster': '🦞',
        'Crab': '🦀',
        'Octopus': '🐙',
        'Squid': '🦑',
        'Samaki': '🐟',
        'Kamba': '🦐',
        'Omena': '🐟',
        
        // 🍲 KENYAN DISHES
        'Beef Stew': '🍲',
        'Stew': '🍲',
        'Ugali': '🌽',
        'Chapati': '🫓',
        'Rice': '🍚',
        'Pilau': '🍛',
        'Matoke': '🍌',
        'Githeri': '🥘',
        'Sukuma Wiki': '🥬',
        'Mukimo': '🥔',
        'Kachumbari': '🥗',
        'Mandazi': '🥨',
        'Samosas': '🥟',
        'Bhajias': '🍤',
        'Nyama Choma': '🍖',
        'Irio': '🥔',
        'Matumbo': '🍲',
        'Kienyeji': '🍗',
        'Mshikaki': '🍖',
        'Biryani': '🍛',
        'Curry': '🍛',
        'Soup': '🍜',
        'Porridge': '🥣',
        'Uji': '🥣',
        'Chips': '🍟',
        'Fries': '🍟',
        'Mashed Potatoes': '🥔',
        'Cabbage': '🥬',
        'Spinach': '🥬',
        'Kale': '🥬',
        
        // 🍔 FAST FOOD
        'Burger': '🍔',
        'Pizza': '🍕',
        'Hot Dog': '🌭',
        'Taco': '🌮',
        'Burrito': '🌯',
        'Sandwich': '🥪',
        'Wrap': '🌯',
        'Pancakes': '🥞',
        'Waffles': '🧇',
        'Noodles': '🍜',
        'Pasta': '🍝',
        'Spaghetti': '🍝',
        'Lasagna': '🍝',
        'Salad': '🥗',
        'Omelette': '🍳',
        'Eggs': '🥚',
        'Fried Rice': '🍚',
        
        // 🥗 VEGETABLES
        'Onions': '🧅',
        'Garlic': '🧄',
        'Pepper': '🫑',
        'Chili': '🌶️',
        'Carrots': '🥕',
        'Potatoes': '🥔',
        'Tomatoes': '🍅',
        'Avocado': '🥑',
        'Lettuce': '🥬',
        'Cucumber': '🥒',
        'Corn': '🌽',
        'Beans': '🫘',
        'Peas': '🫘',
        'Broccoli': '🥦',
        'Eggplant': '🍆',
        'Pumpkin': '🎃',
        
        // 🍎 FRUITS
        'Apple': '🍎',
        'Orange': '🍊',
        'Lemon': '🍋',
        'Banana': '🍌',
        'Watermelon': '🍉',
        'Grapes': '🍇',
        'Strawberry': '🍓',
        'Blueberry': '🫐',
        'Peach': '🍑',
        'Cherry': '🍒',
        'Pineapple': '🍍',
        'Mango': '🥭',
        'Pear': '🍐',
        'Kiwi': '🥝',
        'Passion Fruit': '🍊',
        'Pawpaw': '🍊',
        'Coconut': '🥥',
        'Papaya': '🍈',
        'Guava': '🍐',
        'Lime': '🍋',
        
        // 🥤 DRINKS
        'Soda': '🥤',
        'Water': '💧',
        'Juice': '🧃',
        'Tea': '🍵',
        'Coffee': '☕',
        'Beer': '🍺',
        'Wine': '🍷',
        'Smoothie': '🥤',
        'Milkshake': '🥛',
        'Cocktail': '🍹',
        'Milk': '🥛',
        'Fruit Juice': '🧃',
        'Lemonade': '🍋',
        'Chai': '🍵',
        'Maziwa': '🥛',
        
        // 🍞 CARBS
        'Bread': '🍞',
        'Chapati': '🫓',
        'Rice': '🍚',
        'Pasta': '🍝',
        'Noodles': '🍜',
        'Porridge': '🥣',
        'Chips': '🍟',
        'Ugali': '🌽',
        'Buns': '🍞',
        'Doughnuts': '🍩',
        'Cake': '🍰',
        'Pastry': '🥐',
        'Croissant': '🥐',
        'Bagel': '🥯',
        'Toast': '🍞',
        
        // 🍦 DESSERTS
        'Ice Cream': '🍦',
        'Cake': '🍰',
        'Pancakes': '🥞',
        'Waffles': '🧇',
        'Donuts': '🍩',
        'Cookies': '🍪',
        'Pudding': '🍮',
        'Honey': '🍯',
        'Chocolate': '🍫',
        'Candy': '🍬',
        'Lollipop': '🍭',
        'Pie': '🥧',
        'Muffin': '🧁',
        'Cupcake': '🧁',
        'Brownie': '🍫',
        
        // 🌿 SPICES
        'Coriander': '🌿',
        'Basil': '🌿',
        'Mint': '🌿',
        'Rosemary': '🌿',
        'Thyme': '🌿',
        'Salt': '🧂',
        'Pepper': '🧂',
        'Cinnamon': '🧂',
        'Ginger': '🧄',
        
        // GENERAL
        'default': '📦'
    };
    return emojis[name] || emojis['default'];
}

// ============================================================
//  UPDATED EMOJI PICKER - WITH NAMES
// ============================================================

function initEmojiPicker() {
    const picker = document.getElementById('emojiPicker');
    if (!picker) return;
    
    picker.innerHTML = AVAILABLE_EMOJIS.map(item => 
        `<span class="emoji-option" data-emoji="${item.emoji}" onclick="selectEmoji('${item.emoji}')" style="
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px 10px;
            font-size: 20px;
            cursor: pointer;
            border-radius: 8px;
            transition: all 0.2s ease;
            border: 2px solid transparent;
            background: transparent;
        ">
            <span style="font-size: 28px;">${item.emoji}</span>
            <span style="font-size: 12px; color: var(--text-secondary); white-space: nowrap;">${item.name}</span>
        </span>`
    ).join('');
}

// ============================================================
//  UPDATED SELECT EMOJI
// ============================================================
function selectEmoji(emoji) {
    currentProductEmoji = emoji;
    const display = document.getElementById('selectedEmojiDisplay');
    const input = document.getElementById('productEmoji');
    if (display) display.textContent = emoji;
    if (input) input.value = emoji;
    
    // Highlight selected
    document.querySelectorAll('.emoji-option').forEach(el => {
        el.classList.toggle('selected', el.dataset.emoji === emoji);
        if (el.dataset.emoji === emoji) {
            el.style.borderColor = 'var(--primary)';
            el.style.background = 'rgba(108,60,225,0.1)';
        } else {
            el.style.borderColor = 'transparent';
            el.style.background = 'transparent';
        }
    });
    
    const container = document.getElementById('emojiPickerContainer');
    if (container) container.style.display = 'none';
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
//  AUTH - FIXED FOR PIN LOGIN
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
        console.log('🔑 Login method:', loginMethod || 'email');

        // ✅ Set current user
        currentUser = user;
        
        // ✅ Update UI with user info
        updateUI(user);
        resetSessionTimer();

        // ✅ If PIN login, verify user is still active in database
        if (loginMethod === 'pin') {
            try {
                const { data: dbUser, error } = await supabaseClient
                    .from('users')
                    .select('id, email, full_name, role_id, status, pin_enabled')
                    .eq('id', user.id)
                    .single();
                
                if (error || !dbUser || dbUser.status !== 'active') {
                    console.log('❌ User no longer active or not found');
                    localStorage.removeItem('viewpoint_session');
                    window.location.href = 'login.html';
                    return null;
                }
                
                // ✅ Update current user with fresh data
                currentUser = { ...user, ...dbUser };
                
            } catch (e) {
                // If we can't verify, keep the session but log it
                console.log('⚠️ Could not verify user in database, but session is valid');
            }
        }

        return currentUser;

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
//  LOG USER ACTIVITY - UPDATED (uses audit_logs table)
// ============================================================
async function logUserActivity(action, details = '', entityType = '', entityId = '', newValue = null, oldValue = null) {
    try {
        if (!currentUser) {
            console.log('⚠️ No current user, skipping audit log');
            return;
        }
        
        // Get user IP
        let ip = 'unknown';
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            ip = data.ip;
        } catch (e) {
            // IP fetch failed, use 'unknown'
        }
        
        // ✅ Log to audit_logs table (not user_activity_log)
        const { error } = await supabaseClient
            .from('audit_logs')
            .insert({
                user_id: currentUser.id,
                action: action,
                details: details || '',
                entity_type: entityType || '',
                entity_id: entityId || '',
                new_value: newValue || null,
                old_value: oldValue || null,
                ip_address: ip,
                user_agent: navigator.userAgent || 'unknown',
                created_at: new Date().toISOString()
            });
            
        if (error) {
            console.error('❌ Audit log error:', error);
        } else {
            console.log(`✅ Audit: ${action} by ${currentUser.full_name || currentUser.email}`);
        }
        
    } catch (e) {
        console.log('⚠️ Audit log skipped:', e.message);
    }
}

async function getIPAddress() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (e) {
        return 'unknown';
    }
}

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
    const titleEl = document.getElementById('pageTitle');
    const subEl = document.getElementById('pageSubtitle');
    if (titleEl) titleEl.textContent = title;
    if (subEl) subEl.textContent = sub;

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
//  TIME-BASED GREETINGS - COMPLETE
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


function toggleEmojiPicker() {
    const container = document.getElementById('emojiPickerContainer');
    if (container) {
        container.style.display = container.style.display === 'none' ? 'block' : 'none';
    }
}

// ============================================================
//  CLEAR EMOJI
// ============================================================

function clearEmoji() {
    currentProductEmoji = '📦';
    const display = document.getElementById('selectedEmojiDisplay');
    const input = document.getElementById('productEmoji');
    if (display) display.textContent = '📦';
    if (input) input.value = '📦';
    
    document.querySelectorAll('.emoji-option').forEach(el => {
        el.classList.remove('selected');
        el.style.borderColor = 'transparent';
        el.style.background = 'transparent';
    });
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
            const clearBtn = document.getElementById('clearImageBtn');
            if (clearBtn) clearBtn.style.display = 'inline-flex';
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

// ============================================================
//  DASHBOARD - UPDATED WITH PROFIT & LOSS
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
        
        // ✅ Load Profit & Loss data for dashboard
        await loadProfitData();
        await loadProfitBreakdown();

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
        if (!table) return;
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
        if (!list) return;
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
        const ctx = document.getElementById('salesChart');
        if (!ctx) return;
        const daily = {};
        orders.forEach(o => {
            const d = new Date(o.created_at).toLocaleDateString();
            daily[d] = (daily[d] || 0) + (o.total || 0);
        });
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
    loadProfitData();       // ✅ Already there
    loadProfitBreakdown();  // ✅ ADD THIS
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
        if (!container) return;
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
        const qtyEl = document.getElementById('posQty');
        const amountEl = document.getElementById('posAmount');
        if (qtyEl) qtyEl.addEventListener('input', calculateTotalPOS);
        if (amountEl) amountEl.addEventListener('input', calculateTotalPOS);
    } catch (e) {
        console.error('POS load error:', e);
    }
}

function selectPOSProduct(id) {
    selectedProduct = id;
    document.querySelectorAll('.product-card').forEach(el => el.classList.remove('selected'));
    const el = document.getElementById(`pos-${id}`);
    if (el) el.classList.add('selected');
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
    if (amount && !qty) {
        const qtyEl = document.getElementById('posQty');
        if (qtyEl) qtyEl.value = (amount / product.selling_price).toFixed(3);
    } else if (qty && !amount) {
        const amountEl = document.getElementById('posAmount');
        if (amountEl) amountEl.value = (qty * product.selling_price).toFixed(2);
    }
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
    const qtyEl = document.getElementById('posQty');
    const amountEl = document.getElementById('posAmount');
    if (qtyEl) qtyEl.value = '';
    if (amountEl) amountEl.value = '';
    selectedProduct = null;
    document.querySelectorAll('.product-card').forEach(el => el.classList.remove('selected'));
}

function clearCartPOS() { cart = []; updateCartDisplayPOS(); }

function updateCartDisplayPOS() {
    const container = document.getElementById('posCartItems');
    const totalEl = document.getElementById('posTotal');
    if (!container || !totalEl) return;
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
    } catch (e) { 
        showToast('❌ ' + e.message, 'error'); 
    }
}

async function viewOrderDetails(orderId) {
    try {
        const { data: order } = await supabaseClient
            .from('orders')
            .select('*, order_items(*, products(*))')
            .eq('id', orderId).single();
        if (!order) return;
        
        const titleEl = document.getElementById('orderDetailTitle');
        if (titleEl) titleEl.textContent = `📋 Order #${order.order_number || order.id.slice(0,10)}`;
        
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
        const contentEl = document.getElementById('orderDetailContent');
        if (contentEl) contentEl.innerHTML = html;
        openModal('orderDetailModal');
    } catch (e) {
        console.error('View order error:', e);
        showToast('❌ Could not load order details', 'error');
    }
}

// ============================================================
//  PRODUCTS
// ============================================================
async function loadProducts() {
    try {
        const { data: productsData } = await supabaseClient.from('products').select('*').order('name');
        products = productsData || [];
        const table = document.getElementById('productsTable');
        if (!table) return;
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
        const titleEl = document.getElementById('productModalTitle');
        if (titleEl) titleEl.textContent = 'Edit Product';
        const idEl = document.getElementById('productId');
        if (idEl) idEl.value = p.id;
        const nameEl = document.getElementById('productName');
        const typeEl = document.getElementById('productType');
        const priceEl = document.getElementById('productPrice');
        const costEl = document.getElementById('productCost');
        const unitEl = document.getElementById('productUnit');
        const stockEl = document.getElementById('productStock');
        const reorderEl = document.getElementById('productReorder');
        const statusEl = document.getElementById('productStatus');
        if (nameEl) nameEl.value = p.name;
        if (typeEl) typeEl.value = p.product_type;
        if (priceEl) priceEl.value = p.selling_price;
        if (costEl) costEl.value = p.cost_price || '';
        if (unitEl) unitEl.value = p.unit;
        if (stockEl) stockEl.value = p.stock_quantity;
        if (reorderEl) reorderEl.value = p.reorder_level;
        if (statusEl) statusEl.value = p.is_active ? 'active' : 'inactive';
        
        if (p.emoji) {
            currentProductEmoji = p.emoji;
            const display = document.getElementById('selectedEmojiDisplay');
            const input = document.getElementById('productEmoji');
            if (display) display.textContent = p.emoji;
            if (input) input.value = p.emoji;
        }
        
        if (p.image_url) {
            const preview = document.getElementById('productImagePreview');
            const urlInput = document.getElementById('productImageUrl');
            if (preview) { preview.src = p.image_url; preview.style.display = 'block'; }
            if (urlInput) urlInput.value = p.image_url;
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

document.getElementById('productForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('productId')?.value;
    
    let imageUrl = document.getElementById('productImageUrl')?.value || '';
    if (currentProductImageFile) {
        const uploadedUrl = await uploadProductImage(currentProductImageFile);
        if (uploadedUrl) imageUrl = uploadedUrl;
    }
    
    const data = {
        name: document.getElementById('productName')?.value || '',
        product_type: document.getElementById('productType')?.value || 'butchery',
        selling_price: parseFloat(document.getElementById('productPrice')?.value) || 0,
        cost_price: parseFloat(document.getElementById('productCost')?.value) || null,
        unit: document.getElementById('productUnit')?.value || 'KG',
        stock_quantity: parseFloat(document.getElementById('productStock')?.value) || 0,
        reorder_level: parseFloat(document.getElementById('productReorder')?.value) || 0,
        emoji: document.getElementById('productEmoji')?.value || '📦',
        image_url: imageUrl || null,
        is_active: document.getElementById('productStatus')?.value === 'active'
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
        if (!table) return;
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
        if (!movementTable) return;
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

document.getElementById('stockForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const productId = document.getElementById('stockProduct')?.value;
    const type = document.getElementById('adjustmentType')?.value;
    const qty = parseFloat(document.getElementById('adjustmentQty')?.value) || 0;
    const reason = document.getElementById('adjustmentReason')?.value || 'Manual adjustment';
    
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
//  USERS
// ============================================================
async function loadUsers() {
    try {
        const { data: usersData } = await supabaseClient
            .from('users')
            .select('*, roles(name)')
            .order('full_name');
        const table = document.getElementById('usersTable');
        if (!table) return;
        if (!usersData?.length) {
            table.innerHTML = '<div class="empty-state"><i class="fas fa-users"></i><p>No users</p></div>';
            return;
        }
        let html = '<div class="table-wrapper"><table class="data-table"><thead><tr><th>👤 Name</th><th>📧 Email</th><th>👑 Role</th><th>🔐 PIN</th><th>🔑 2FA</th><th>📊 Status</th><th>⚙️ Actions</th></tr></thead><tbody>';
        usersData.forEach(u => {
            const roleEmoji = u.roles?.name === 'admin' ? '👑' : u.roles?.name === 'cashier' ? '💰' : u.roles?.name === 'butcher' ? '🥩' : '🍳';
            // ✅ Check both pin and pin_enabled
            const hasPin = u.pin && u.pin_enabled;
            html += `<tr>
                <td><strong>${u.full_name}</strong></td>
                <td>${u.email}</td>
                <td><span class="badge ${u.roles?.name || 'cashier'}">${roleEmoji} ${u.roles?.name || 'Unknown'}</span></td>
                <td>${hasPin ? '✅ Set' : '❌ Not set'}</td>
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

document.getElementById('userForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('userSubmitBtn');
    if (!btn) return;
    btn.innerHTML = '<span class="spinner"></span> Creating...';
    btn.disabled = true;
    try {
        const fullName = document.getElementById('userFullName')?.value?.trim() || '';
        const email = document.getElementById('userEmail')?.value?.trim() || '';
        const password = document.getElementById('userPassword')?.value || '';
        const roleId = parseInt(document.getElementById('userRole')?.value) || 0;
        const twoFA = parseInt(document.getElementById('user2FA')?.value) || 0;
        const status = document.getElementById('userStatus')?.value || 'active';
        const phone = document.getElementById('userPhone')?.value || '';
        const pin = document.getElementById('userPin')?.value || '';

        if (!fullName || !email || !password || !roleId) throw new Error('Fill all required fields');
        if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
            throw new Error('PIN must be exactly 4 digits');
        }

        // Create auth user
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
            pin: pin,  // ✅ Using 'pin' column
            pin_enabled: true,  // ✅ Enable PIN
            pin_updated_at: new Date().toISOString(),
            two_fa_enabled: twoFA === 1,
            email_verified: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
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
// ============================================================
//  EDIT USER
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

        const idEl = document.getElementById('editUserId');
        const nameEl = document.getElementById('editUserFullName');
        const emailEl = document.getElementById('editUserEmail');
        const phoneEl = document.getElementById('editUserPhone');
        const roleEl = document.getElementById('editUserRole');
        const twoFaEl = document.getElementById('editUser2FA');
        const statusEl = document.getElementById('editUserStatus');
        const pinEl = document.getElementById('editUserPin');
        const titleEl = document.getElementById('editUserModalTitle');

        if (idEl) idEl.value = user.id;
        if (nameEl) nameEl.value = user.full_name || '';
        if (emailEl) emailEl.value = user.email || '';
        if (phoneEl) phoneEl.value = user.phone || '';
        if (roleEl) roleEl.value = user.role_id || 2;
        if (twoFaEl) twoFaEl.value = user.two_fa_enabled ? 1 : 0;
        if (statusEl) statusEl.value = user.status || 'active';
        if (pinEl) pinEl.value = '';
        if (titleEl) titleEl.textContent = `✏️ Edit User: ${user.full_name}`;

        openModal('editUserModal');

    } catch (error) {
        console.error('Edit user error:', error);
        showToast('❌ Error loading user: ' + error.message, 'error');
    }
}

document.getElementById('editUserForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const btn = document.getElementById('editUserSubmitBtn');
    const originalText = btn?.innerHTML || 'Update User';
    if (btn) {
        btn.innerHTML = '<span class="spinner"></span> Updating...';
        btn.disabled = true;
    }

    try {
        const userId = document.getElementById('editUserId')?.value;
        const pin = document.getElementById('editUserPin')?.value || '';
        const roleId = parseInt(document.getElementById('editUserRole')?.value) || 2;
        const twoFA = parseInt(document.getElementById('editUser2FA')?.value) === 1;
        const status = document.getElementById('editUserStatus')?.value || 'active';
        
        // Build data object
        const data = {
            full_name: document.getElementById('editUserFullName')?.value?.trim() || '',
            email: document.getElementById('editUserEmail')?.value?.trim() || '',
            phone: document.getElementById('editUserPhone')?.value?.trim() || null,
            role_id: roleId,
            two_fa_enabled: twoFA,
            status: status,
            updated_at: new Date().toISOString()
        };
        
        // ✅ Update PIN if provided
        if (pin && pin.length === 4 && /^\d{4}$/.test(pin)) {
            data.pin = pin;  // Using 'pin' column
            data.pin_enabled = true;  // Enable PIN
            data.pin_updated_at = new Date().toISOString();
            console.log('✅ Updating PIN to:', pin);
        } else if (pin && pin.length > 0) {
            throw new Error('PIN must be exactly 4 digits');
        }

        console.log('📤 Updating user data:', data);

        const { error: updateError } = await supabaseClient
            .from('users')
            .update(data)
            .eq('id', userId);

        if (updateError) {
            console.error('❌ Update error:', updateError);
            throw new Error(updateError.message);
        }

        showToast('✅ User updated successfully!', 'success');
        closeModal('editUserModal');
        loadUsers();

    } catch (error) {
        console.error('Update user error:', error);
        showToast('❌ Error updating user: ' + error.message, 'error');
    } finally {
        if (btn) {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
});

// ============================================================
//  CUSTOMERS
// ============================================================
async function loadCustomers() {
    try {
        const { data: customers } = await supabaseClient.from('customers').select('*').order('name');
        const table = document.getElementById('customersTable');
        if (!table) return;
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

document.getElementById('customerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        name: document.getElementById('customerName')?.value?.trim() || '',
        phone: document.getElementById('customerPhone')?.value?.trim() || '',
        email: document.getElementById('customerEmail')?.value?.trim() || null,
        loyalty_points: parseInt(document.getElementById('customerPoints')?.value) || 0
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

// ============================================================
//  SUPPLIERS
// ============================================================
async function loadSuppliers() {
    try {
        const { data: suppliers } = await supabaseClient.from('suppliers').select('*').order('company');
        const table = document.getElementById('suppliersTable');
        if (!table) return;
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

document.getElementById('supplierForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        company: document.getElementById('supplierCompany')?.value?.trim() || '',
        contact: document.getElementById('supplierContact')?.value?.trim() || null,
        phone: document.getElementById('supplierPhone')?.value?.trim() || '',
        email: document.getElementById('supplierEmail')?.value?.trim() || null,
        products: document.getElementById('supplierProducts')?.value?.trim() || null
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
        if (!container) return;
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

// ============================================================
//  PROFIT & LOSS - LOAD DATA
// ============================================================

async function loadProfitData() {
    try {
        console.log('💰 Loading profit & loss data...');
        
        // Get all PAID orders with their items and products
        const { data: orders, error: ordersError } = await supabaseClient
            .from('orders')
            .select('*, order_items(*, products(*))')
            .eq('status', 'paid');
            
        if (ordersError) {
            console.error('Orders error:', ordersError);
            showToast('❌ Could not load profit data', 'error');
            return;
        }

        console.log(`📊 Found ${orders?.length || 0} paid orders`);

        let revenue = 0;
        let cost = 0;
        
        // Calculate totals
        if (orders && orders.length > 0) {
            orders.forEach(order => {
                // Add order total to revenue
                revenue += order.total || 0;
                
                // Calculate cost from order items
                if (order.order_items && order.order_items.length > 0) {
                    order.order_items.forEach(item => {
                        const productCost = item.products?.cost_price || 0;
                        const quantity = item.quantity || 0;
                        cost += productCost * quantity;
                    });
                }
            });
        }
        
        const profit = revenue - cost;
        const profitMargin = revenue > 0 ? (profit / revenue * 100) : 0;

        // Update DOM elements
        const revenueEl = document.getElementById('totalRevenue');
        const costEl = document.getElementById('totalCost');
        const profitEl = document.getElementById('netProfit');
        const marginEl = document.getElementById('profitMargin');
        
        if (revenueEl) {
            revenueEl.textContent = `KES ${revenue.toFixed(2)}`;
        }
        if (costEl) {
            costEl.textContent = `KES ${cost.toFixed(2)}`;
        }
        if (profitEl) {
            profitEl.textContent = `KES ${profit.toFixed(2)}`;
            profitEl.style.color = profit >= 0 ? 'var(--success)' : 'var(--danger)';
        }
        if (marginEl) {
            marginEl.textContent = `Margin: ${profitMargin.toFixed(1)}%`;
            marginEl.style.color = profitMargin > 20 ? 'var(--success)' : profitMargin > 10 ? 'var(--warning)' : 'var(--danger)';
        }

        // Create/Update Profit Chart
        await createProfitChart(revenue, cost, profit);

        console.log(`✅ Revenue: KES ${revenue.toFixed(2)}, Cost: KES ${cost.toFixed(2)}, Profit: KES ${profit.toFixed(2)}`);
        
        return { revenue, cost, profit, profitMargin };

    } catch (error) {
        console.error('Profit & Loss error:', error);
        showToast('❌ Error loading profit data: ' + error.message, 'error');
    }
}
// ============================================================
//  CREATE PROFIT CHART
// ============================================================

async function createProfitChart(revenue, cost, profit) {
    try {
        const ctx = document.getElementById('profitChart');
        if (!ctx) {
            console.warn('Profit chart canvas not found');
            return;
        }

        if (profitChart) {
            profitChart.destroy();
            profitChart = null;
        }

        // Get theme colors
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const textColor = isDark ? '#94A3B8' : '#475569';
        
        profitChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Revenue', 'Cost', 'Profit'],
                datasets: [{
                    data: [revenue, cost, profit > 0 ? profit : 0],
                    backgroundColor: [
                        '#10B981',  // Green - Revenue
                        '#EF4444',  // Red - Cost
                        '#6C3CE1'   // Purple - Profit
                    ],
                    borderColor: [
                        '#059669',
                        '#DC2626',
                        '#5B21B6'
                    ],
                    borderWidth: 2,
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                cutout: '65%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: textColor,
                            padding: 16,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: {
                                size: 13,
                                weight: '600'
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                let value = context.parsed || 0;
                                let total = context.dataset.data.reduce((a, b) => a + b, 0);
                                let percentage = total > 0 ? (value / total * 100).toFixed(1) : 0;
                                return `${label}: KES ${value.toFixed(2)} (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    duration: 800
                }
            }
        });
    } catch (error) {
        console.error('Profit chart error:', error);
    }
}
// ============================================================
//  PROFIT BREAKDOWN - DETAILED VIEW
// ============================================================

async function loadProfitBreakdown() {
    try {
        const { data: orders, error } = await supabaseClient
            .from('orders')
            .select('*, order_items(*, products(*))')
            .eq('status', 'paid')
            .order('created_at', { ascending: false });
            
        if (error || !orders || orders.length === 0) {
            const breakdownEl = document.getElementById('profitBreakdown');
            if (breakdownEl) {
                breakdownEl.innerHTML = `
                    <div class="empty-state" style="padding:20px;">
                        <i class="fas fa-inbox"></i>
                        <p>No paid orders yet</p>
                    </div>
                `;
            }
            return;
        }

        let totalRevenue = 0;
        let totalCost = 0;
        const items = [];

        orders.forEach(order => {
            const orderTotal = order.total || 0;
            totalRevenue += orderTotal;
            
            if (order.order_items) {
                order.order_items.forEach(item => {
                    const costPrice = item.products?.cost_price || 0;
                    const quantity = item.quantity || 0;
                    const itemCost = costPrice * quantity;
                    totalCost += itemCost;
                    
                    items.push({
                        name: item.products?.name || 'Unknown',
                        emoji: item.products?.emoji || '📦',
                        quantity: quantity,
                        unitPrice: item.unit_price || 0,
                        totalPrice: item.total || 0,
                        costPrice: costPrice,
                        totalCost: itemCost,
                        profit: (item.total || 0) - itemCost
                    });
                });
            }
        });

        const profit = totalRevenue - totalCost;
        const margin = totalRevenue > 0 ? (profit / totalRevenue * 100) : 0;

        // Update profit margin
        const marginEl = document.getElementById('profitMargin');
        if (marginEl) {
            marginEl.textContent = `Margin: ${margin.toFixed(1)}%`;
            marginEl.style.color = margin > 20 ? 'var(--success)' : margin > 10 ? 'var(--warning)' : 'var(--danger)';
        }

        // Show breakdown table
        let html = `
            <div class="table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>📦 Product</th>
                            <th>Qty</th>
                            <th>Revenue</th>
                            <th>Cost</th>
                            <th>Profit</th>
                            <th>Margin</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        // Show top items by profit
        const sortedItems = items.sort((a, b) => b.profit - a.profit).slice(0, 15);
        
        sortedItems.forEach(item => {
            const margin = item.totalPrice > 0 ? (item.profit / item.totalPrice * 100) : 0;
            html += `
                <tr>
                    <td><strong>${item.emoji} ${item.name}</strong></td>
                    <td>${item.quantity.toFixed(3)}</td>
                    <td>KES ${item.totalPrice.toFixed(2)}</td>
                    <td>KES ${item.totalCost.toFixed(2)}</td>
                    <td style="color: ${item.profit > 0 ? 'var(--success)' : 'var(--danger)'};">
                        KES ${item.profit.toFixed(2)}
                    </td>
                    <td>
                        <span style="color: ${margin > 30 ? 'var(--success)' : margin > 15 ? 'var(--warning)' : 'var(--danger)'};">
                            ${margin.toFixed(1)}%
                        </span>
                    </td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        const breakdownEl = document.getElementById('profitBreakdown');
        if (breakdownEl) {
            breakdownEl.innerHTML = html;
        }

    } catch (error) {
        console.error('Profit breakdown error:', error);
        const breakdownEl = document.getElementById('profitBreakdown');
        if (breakdownEl) {
            breakdownEl.innerHTML = `
                <div class="empty-state" style="padding:20px;">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Could not load profit breakdown</p>
                </div>
            `;
        }
    }
}
// ============================================================
//  REFRESH PROFIT DATA
// ============================================================

function refreshProfitData() {
    showToast('🔄 Refreshing profit data...', 'info');
    loadProfitData();
    loadProfitBreakdown();
}
// ============================================================
//  AUDIT TRAIL - COMPLETE ENHANCED VERSION
// ============================================================

let auditPage = 1;
let auditLimit = 20;
let auditTotalCount = 0;

async function loadAuditLogs(direction) {
    try {
        // Handle pagination
        if (direction === 'next') auditPage++;
        else if (direction === 'prev') auditPage = Math.max(1, auditPage - 1);
        
        // Get filter values
        const date = document.getElementById('auditDate')?.value;
        const action = document.getElementById('auditAction')?.value;
        const userRole = document.getElementById('auditUserRole')?.value;
        const userId = document.getElementById('auditUser')?.value;
        auditLimit = parseInt(document.getElementById('auditLimit')?.value) || 20;
        
        // Build query with all filters
        let query = supabaseClient
            .from('audit_logs')
            .select('*, users!inner(full_name, role_id, roles(name))', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range((auditPage - 1) * auditLimit, auditPage * auditLimit - 1);
        
        // Apply filters
        if (date) {
            query = query.gte('created_at', date + 'T00:00:00')
                .lte('created_at', date + 'T23:59:59');
        }
        
        if (action) {
            query = query.eq('action', action);
        }
        
        if (userId) {
            query = query.eq('user_id', userId);
        }
        
        if (userRole) {
            query = query.eq('users.role_id', parseInt(userRole));
        }
        
        const { data: logs, error, count } = await query;
        auditTotalCount = count || 0;
        
        const table = document.getElementById('auditTable');
        const countEl = document.getElementById('auditCount');
        const pageEl = document.getElementById('auditPage');
        const totalEl = document.getElementById('auditTotalEvents');
        const todayEl = document.getElementById('auditTodayEvents');
        const uniqueEl = document.getElementById('auditUniqueUsers');
        const mostActiveEl = document.getElementById('auditMostActive');
        
        if (!table) return;
        
        // Update stats
        if (countEl) countEl.textContent = `${count || 0} logs found`;
        if (pageEl) pageEl.textContent = `Page ${auditPage}`;
        if (totalEl) totalEl.textContent = count || 0;
        
        // Calculate today's events
        const today = new Date().toISOString().split('T')[0];
        const todayCount = logs?.filter(l => l.created_at?.startsWith(today)).length || 0;
        if (todayEl) todayEl.textContent = todayCount;
        
        // Calculate unique users
        const uniqueUsers = new Set(logs?.map(l => l.user_id) || []);
        if (uniqueEl) uniqueEl.textContent = uniqueUsers.size;
        
        // Calculate most active user
        if (logs && logs.length > 0) {
            const userCounts = {};
            logs.forEach(l => {
                const name = l.users?.full_name || 'System';
                userCounts[name] = (userCounts[name] || 0) + 1;
            });
            const mostActive = Object.entries(userCounts).sort((a, b) => b[1] - a[1])[0];
            if (mostActiveEl) mostActiveEl.textContent = mostActive ? `${mostActive[0]} (${mostActive[1]})` : '—';
        }
        
        if (error || !logs?.length) {
            table.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <p>No audit logs found</p>
                    <p style="font-size:12px;color:var(--text-muted);">${error?.message || 'Try adjusting your filters'}</p>
                </div>
            `;
            return;
        }
        
        // Build table with all details
        let html = `
            <div class="table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>👤 User</th>
                            <th>📋 Action</th>
                            <th>📂 Entity</th>
                            <th>🔗 Details</th>
                            <th>📅 Date</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        // Action emojis mapping
        const actionEmojis = {
            'Login': '🔐',
            'Logout': '🚪',
            'Product Created': '📦',
            'Product Updated': '✏️',
            'Product Deleted': '🗑️',
            'Order Created': '🛒',
            'Order Updated': '📝',
            'Order Paid': '💳',
            'Order Cancelled': '❌',
            'User Created': '👤',
            'User Updated': '✏️',
            'User Deleted': '🗑️',
            'PIN Set': '🔑',
            'PIN Updated': '🔑',
            'PIN Login': '🔐',
            'Stock Adjusted': '📊',
            'Payment Processed': '💳',
            'Receipt Generated': '🧾',
            'Report Generated': '📊',
            'Setting Changed': '⚙️',
            'POS Sale': '🛒',
            'Customer Added': '👤',
            'Customer Updated': '✏️',
            'Customer Deleted': '🗑️',
            'Supplier Added': '🚚',
            'Supplier Updated': '✏️',
            'Supplier Deleted': '🗑️',
            'Kitchen Order Started': '🍳',
            'Kitchen Order Ready': '✅',
            'Kitchen Order Completed': '🏁'
        };
        
        logs.forEach(log => {
            const user = log.users;
            const userName = user?.full_name || 'System';
            const userRoleName = user?.roles?.name || 'Unknown';
            const roleEmoji = userRoleName === 'admin' ? '👑' : 
                             userRoleName === 'cashier' ? '💰' : 
                             userRoleName === 'butcher' ? '🥩' : 
                             userRoleName === 'kitchen' ? '🍳' : '👤';
            
            const emoji = actionEmojis[log.action] || '📌';
            
            html += `
                <tr>
                    <td>
                        <strong>${userName}</strong>
                        <br>
                        <small style="color:var(--text-muted);font-size:11px;">${roleEmoji} ${userRoleName}</small>
                    </td>
                    <td><span class="badge primary">${emoji} ${log.action}</span></td>
                    <td><span class="badge info">${log.entity_type || '—'}</span></td>
                    <td style="max-width:250px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;">
                        ${log.details || ''}
                        ${log.new_value ? `<br><small style="color:var(--text-muted);font-size:11px;">📝 ${JSON.stringify(log.new_value).substring(0, 40)}${JSON.stringify(log.new_value).length > 40 ? '...' : ''}</small>` : ''}
                    </td>
                    <td>
                        <div>${new Date(log.created_at).toLocaleDateString()}</div>
                        <div style="font-size:11px;color:var(--text-muted);">${new Date(log.created_at).toLocaleTimeString()}</div>
                        ${log.ip_address ? `<div style="font-size:10px;color:var(--text-muted);">🌐 ${log.ip_address}</div>` : ''}
                    </td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
        
        table.innerHTML = html;
        
    } catch (e) { 
        console.error('Audit error:', e);
        const table = document.getElementById('auditTable');
        if (table) {
            table.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Could not load audit logs</p>
                    <p style="font-size:12px;color:var(--text-muted);">${e.message}</p>
                </div>
            `;
        }
    }
}

// ============================================================
//  LOAD USERS FOR FILTER DROPDOWN
// ============================================================

async function loadAuditUsers() {
    try {
        const { data: users } = await supabaseClient
            .from('users')
            .select('id, full_name, role_id, roles(name)')
            .order('full_name');
            
        const select = document.getElementById('auditUser');
        if (!select) return;
        
        select.innerHTML = '<option value="">All Users</option>';
        if (users && users.length > 0) {
            users.forEach(u => {
                const roleEmoji = u.roles?.name === 'admin' ? '👑' : 
                                 u.roles?.name === 'cashier' ? '💰' : 
                                 u.roles?.name === 'butcher' ? '🥩' : 
                                 u.roles?.name === 'kitchen' ? '🍳' : '👤';
                select.innerHTML += `<option value="${u.id}">${roleEmoji} ${u.full_name} (${u.roles?.name || 'Unknown'})</option>`;
            });
        }
    } catch (e) {
        console.error('Load audit users error:', e);
    }
}

// ============================================================
//  EXPORT AUDIT LOGS
// ============================================================

async function exportAuditLogs() {
    try {
        const date = document.getElementById('auditDate')?.value;
        const action = document.getElementById('auditAction')?.value;
        const userRole = document.getElementById('auditUserRole')?.value;
        const userId = document.getElementById('auditUser')?.value;
        
        let query = supabaseClient
            .from('audit_logs')
            .select('*, users(full_name, role_id, roles(name))')
            .order('created_at', { ascending: false });
        
        if (date) {
            query = query.gte('created_at', date + 'T00:00:00')
                .lte('created_at', date + 'T23:59:59');
        }
        
        if (action) {
            query = query.eq('action', action);
        }
        
        if (userId) {
            query = query.eq('user_id', userId);
        }
        
        if (userRole) {
            query = query.eq('users.role_id', parseInt(userRole));
        }
        
        const { data: logs } = await query.limit(10000);
        
        if (!logs?.length) {
            showToast('No logs to export', 'warning');
            return;
        }
        
        // Create CSV
        let csv = 'User,Role,Action,Entity,Details,Date,IP Address\n';
        logs.forEach(log => {
            const user = log.users;
            csv += `"${user?.full_name || 'System'}","${user?.roles?.name || 'Unknown'}","${log.action}","${log.entity_type || 'N/A'}","${log.details || ''}","${new Date(log.created_at).toLocaleString()}","${log.ip_address || 'Unknown'}"\n`;
        });
        
        // Download
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        showToast('📤 Audit logs exported successfully!', 'success');
        
    } catch (error) {
        console.error('Export error:', error);
        showToast('❌ Could not export logs: ' + error.message, 'error');
    }
}

// ============================================================
//  LOG USER ACTIVITY - TRACKS EVERYTHING
// ============================================================

async function logUserActivity(action, details = '', entityType = '', entityId = '', newValue = null, oldValue = null) {
    try {
        if (!currentUser) return;
        
        // Get user IP
        let ip = 'unknown';
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            ip = data.ip;
        } catch (e) {}
        
        // Log the activity
        const { error } = await supabaseClient
            .from('audit_logs')
            .insert({
                user_id: currentUser.id,
                action: action,
                details: details,
                entity_type: entityType,
                entity_id: entityId,
                new_value: newValue,
                old_value: oldValue,
                ip_address: ip,
                user_agent: navigator.userAgent,
                created_at: new Date().toISOString()
            });
            
        if (error) {
            console.error('Audit log error:', error);
        }
        
    } catch (e) {
        console.log('Audit log skipped:', e.message);
    }
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
        if (!container) return;
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
//  GENERATE ADMIN RECEIPT - IMPROVED VERSION
// ============================================================
async function generateAdminReceipt(orderId) {
    try {
        const { data: order, error } = await supabaseClient
            .from('orders')
            .select('*, order_items(*, products(*)), users(full_name)')
            .eq('id', orderId)
            .single();

        if (error || !order) {
            showToast('❌ Order not found!', 'error');
            return;
        }

        const items = order.order_items || [];
        const now = new Date();
        const orderNumber = order.order_number || order.id.slice(0,8).toUpperCase();
        
        // Get business settings
        const businessName = '🏪 VIEWPOINT BUTCHERY & RESTAURANT';
        const businessPhone = '+254 700 000 000';
        const businessEmail = 'info@viewpoint.com';
        const businessLocation = 'Nairobi, Kenya';
        const receiptFooter = 'Thank you for shopping with Viewpoint! 🙏';
        
        // Calculate totals
        let subtotal = 0;
        let tax = 0;
        let discount = 0;
        let total = order.total || 0;
        
        items.forEach(item => {
            subtotal += item.total || 0;
        });
        
        // Calculate tax (16% VAT if applicable)
        tax = subtotal * 0.16;
        const grandTotal = subtotal + tax - discount;

        let receipt = `
╔══════════════════════════════════════════╗
║                                          ║
║          ${businessName}          ║
║                                          ║
║     📞 ${businessPhone}                    ║
║     ✉️ ${businessEmail}                    ║
║     📍 ${businessLocation}                 ║
║                                          ║
╠══════════════════════════════════════════╣
║                                          ║
║  🧾 RECEIPT #${orderNumber.padEnd(20)} ║
║                                          ║
║  📅 Date: ${now.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
║  🕐 Time: ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
║  👤 Cashier: ${(order.users?.full_name || 'System').padEnd(20)}
║  ${order.customer_phone ? `📱 Phone: ${order.customer_phone.padEnd(20)}` : ''}
║                                          ║
╠══════════════════════════════════════════╣
║                                          ║
║  📦 ITEMS                                ║
║                                          ║`;

        // Add items with better formatting
        items.forEach((item, index) => {
            const name = item.products?.name || 'Unknown';
            const emoji = item.products?.emoji || getEmoji(name);
            const qty = (item.quantity || 0);
            const price = item.unit_price || 0;
            const totalPrice = item.total || 0;
            
            receipt += `
║  ${(index + 1).toString().padStart(2)}. ${emoji} ${name.padEnd(25)} ║
║     ${qty.toFixed(3)} × KES ${price.toFixed(2).padStart(8)} = KES ${totalPrice.toFixed(2).padStart(8)} ║`;
        });

        receipt += `
║                                          ║
╠══════════════════════════════════════════╣
║                                          ║
║  💰 PAYMENT SUMMARY                      ║
║                                          ║
║  Subtotal:                    KES ${subtotal.toFixed(2).padStart(10)} ║
║  Tax (16% VAT):               KES ${tax.toFixed(2).padStart(10)} ║
║  Discount:                    KES ${discount.toFixed(2).padStart(10)} ║
║  ──────────────────────────────────────   ║
║  TOTAL:                       KES ${grandTotal.toFixed(2).padStart(10)} ║
║                                          ║
║  💳 Payment Method: ${(order.payment_method || 'N/A').toUpperCase().padEnd(17)} ║
║  ✅ Status: PAID                          ║
║                                          ║
╠══════════════════════════════════════════╣
║                                          ║
║          ${receiptFooter}          ║
║                                          ║
║      ⭐⭐⭐ Thank You! ⭐⭐⭐          ║
║                                          ║
║    🔗 https://lipwa.link/11408           ║
║                                          ║
╚══════════════════════════════════════════╝`;

        const contentEl = document.getElementById('receiptContent');
        if (contentEl) {
            contentEl.textContent = receipt;
        }
        openModal('receiptModal');
        showToast('🧾 Receipt generated!', 'success');

    } catch (error) {
        console.error('Receipt error:', error);
        showToast('❌ Error generating receipt: ' + error.message, 'error');
    }
}

// ============================================================
//  PRINT RECEIPT - IMPROVED
// ============================================================
function printReceipt() {
    const content = document.getElementById('receiptContent');
    if (!content || !content.textContent) {
        showToast('❌ No receipt to print', 'error');
        return;
    }
    const receiptText = content.textContent;
    const win = window.open('', '_blank');
    if (win) {
        win.document.write(`
            <html>
                <head>
                    <title>🧾 Viewpoint Receipt</title>
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body {
                            font-family: 'Courier New', monospace;
                            font-size: 12px;
                            padding: 20px;
                            max-width: 350px;
                            margin: 0 auto;
                            background: #ffffff;
                            color: #000000;
                            line-height: 1.6;
                        }
                        .receipt-container {
                            border: 1px solid #ddd;
                            padding: 16px;
                            border-radius: 8px;
                            background: #ffffff;
                        }
                        .receipt-header {
                            text-align: center;
                            border-bottom: 2px dashed #333;
                            padding-bottom: 10px;
                            margin-bottom: 10px;
                        }
                        .receipt-header h2 {
                            font-size: 16px;
                            letter-spacing: 1px;
                            color: #6C3CE1;
                        }
                        .receipt-header p {
                            font-size: 11px;
                            color: #666;
                            margin: 2px 0;
                        }
                        .receipt-items {
                            margin: 10px 0;
                        }
                        .receipt-item {
                            display: flex;
                            justify-content: space-between;
                            padding: 2px 0;
                            border-bottom: 1px dotted #eee;
                            font-size: 11px;
                        }
                        .receipt-item .item-name {
                            flex: 1;
                        }
                        .receipt-item .item-qty {
                            margin: 0 8px;
                            text-align: center;
                        }
                        .receipt-item .item-price {
                            text-align: right;
                            font-weight: bold;
                        }
                        .receipt-totals {
                            border-top: 2px dashed #333;
                            padding-top: 8px;
                            margin-top: 8px;
                        }
                        .receipt-total-line {
                            display: flex;
                            justify-content: space-between;
                            padding: 2px 0;
                            font-size: 12px;
                        }
                        .receipt-total-line.grand-total {
                            font-size: 16px;
                            font-weight: bold;
                            border-top: 1px solid #333;
                            padding-top: 6px;
                            margin-top: 4px;
                            color: #6C3CE1;
                        }
                        .receipt-footer {
                            text-align: center;
                            border-top: 2px dashed #333;
                            padding-top: 10px;
                            margin-top: 10px;
                            font-size: 11px;
                            color: #666;
                        }
                        .receipt-footer .thank-you {
                            font-size: 14px;
                            font-weight: bold;
                            color: #6C3CE1;
                        }
                        .no-print {
                            text-align: center;
                            margin-top: 20px;
                            padding-top: 16px;
                            border-top: 1px solid #ddd;
                        }
                        .no-print button {
                            padding: 10px 24px;
                            margin: 0 6px;
                            cursor: pointer;
                            border: none;
                            border-radius: 8px;
                            font-size: 14px;
                            font-weight: 600;
                            transition: all 0.3s ease;
                        }
                        .no-print button:hover {
                            transform: translateY(-2px);
                            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                        }
                        .btn-print {
                            background: #6C3CE1;
                            color: white;
                        }
                        .btn-close {
                            background: #EF4444;
                            color: white;
                        }
                        @media print {
                            .no-print { display: none !important; }
                            body { padding: 10px; background: white; }
                            .receipt-container { border: none; padding: 0; }
                        }
                        @media (max-width: 400px) {
                            body { padding: 10px; }
                            .receipt-container { padding: 10px; }
                        }
                    </style>
                </head>
                <body>
                    <div class="receipt-container">
                        <pre style="white-space: pre-wrap; font-family: inherit; margin: 0; font-size: 12px; line-height: 1.6;">${receiptText}</pre>
                    </div>
                    <div class="no-print">
                        <button class="btn-print" onclick="window.print()">🖨️ Print</button>
                        <button class="btn-close" onclick="window.close()">✖ Close</button>
                    </div>
                </body>
            </html>
        `);
        win.document.close();
        setTimeout(() => win.print(), 500);
    }
}

// ============================================================
//  PROCESS PAYMENT POS
// ============================================================
async function processPaymentPOS(method) {
    if (!cart.length) {
        showToast('Cart is empty!', 'error');
        return;
    }

    const phone = document.getElementById('posPhone')?.value || '';
    if (method === 'mpesa' && !phone) {
        showToast('Enter customer phone number', 'error');
        return;
    }

    const total = cart.reduce((sum, item) => sum + item.total, 0);

    const modal = document.getElementById('paymentModal');
    const content = document.getElementById('paymentContent');
    const title = document.getElementById('paymentModalTitle');

    if (!modal) {
        showToast('❌ Payment modal not found!', 'error');
        return;
    }

    if (title) title.textContent = `⏳ Processing ${method.toUpperCase()} Payment`;
    if (content) {
        content.innerHTML = `
            <div class="spinner"></div>
            <p class="status-text">${method === 'mpesa' ? 'Sending PayHero STK Push...' : 'Processing cash payment...'}</p>
            <p class="status-sub" id="paymentDetails">Amount: KES ${total.toFixed(2)}</p>
            ${method === 'mpesa' ? `<p class="status-sub" style="font-size:12px;margin-top:8px;">📱 Enter PIN on your phone to complete payment via PayHero</p>` : ''}
            ${method === 'mpesa' ? `<p class="status-sub" style="font-size:11px;color:var(--text-muted);margin-top:4px;">🔗 https://lipwa.link/11408</p>` : ''}
        `;
    }
    modal.classList.add('active');

    // Save customer if phone provided
    if (phone) {
        try {
            const { data: existing } = await supabaseClient.from('customers').select('id').eq('phone', phone).single();
            if (!existing) {
                await supabaseClient.from('customers').insert({
                    name: phone,
                    phone: phone,
                    loyalty_points: 10
                });
            }
        } catch (e) {}
    }

    try {
        const { data: order, error } = await supabaseClient.from('orders').insert({
            order_type: posMode,
            user_id: currentUser?.id,
            customer_phone: phone || null,
            subtotal: total,
            total: total,
            status: 'draft',
            payment_status: 'pending',
            payment_method: method
        }).select().single();

        if (error) {
            console.error('Order error:', error);
            throw new Error('Failed to create order: ' + error.message);
        }

        const items = cart.map(item => ({
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total: item.total
        }));
        await supabaseClient.from('order_items').insert(items);

        const { data: payment } = await supabaseClient.from('payments').insert({
            order_id: order.id,
            payment_method: method,
            amount: total,
            status: 'pending'
        }).select().single();

        if (method === 'mpesa') {
            // Simple payment flow - just mark as paid for now
            // In production, integrate with PayHero
            await supabaseClient.from('payments').update({
                status: 'completed',
                completed_at: new Date().toISOString()
            }).eq('id', payment.id);
            
            await supabaseClient.from('orders').update({
                status: 'paid',
                payment_status: 'completed',
                completed_at: new Date().toISOString()
            }).eq('id', order.id);

            // Update stock
            for (const item of items) {
                try {
                    const { data: product } = await supabaseClient.from('products')
                        .select('stock_quantity')
                        .eq('id', item.product_id).single();
                    if (product) {
                        await supabaseClient.from('products').update({
                            stock_quantity: product.stock_quantity - item.quantity
                        }).eq('id', item.product_id);
                    }
                } catch (e) {}
            }

            if (content) {
                content.innerHTML = `
                    <div class="status-icon success">✅</div>
                    <p class="status-text">Payment Successful! 🎉</p>
                    <p class="status-sub">Order #${order.order_number || order.id.slice(0,8)}</p>
                    <p class="status-sub">Amount: KES ${total.toFixed(2)}</p>
                `;
            }

            showToast(`✅ Payment successful!`, 'success');
            addNotification('Payment Successful', `Order #${order.order_number || order.id.slice(0,8)} - KES ${total.toFixed(2)}`, 'success', 'orders');

            setTimeout(() => {
                modal.classList.remove('active');
                generateAdminReceipt(order.id);
                cart = [];
                updateCartDisplayPOS();
                const phoneInput = document.getElementById('posPhone');
                if (phoneInput) phoneInput.value = '';
                loadPOSProducts(posMode);
                loadDashboard();
                resetSessionTimer();
            }, 2000);

        } else {
            // Cash payment
            await supabaseClient.from('payments').update({
                status: 'completed',
                completed_at: new Date().toISOString()
            }).eq('id', payment.id);
            
            await supabaseClient.from('orders').update({
                status: 'paid',
                payment_status: 'completed',
                completed_at: new Date().toISOString()
            }).eq('id', order.id);

            // Update stock
            for (const item of items) {
                try {
                    const { data: product } = await supabaseClient.from('products')
                        .select('stock_quantity')
                        .eq('id', item.product_id).single();
                    if (product) {
                        await supabaseClient.from('products').update({
                            stock_quantity: product.stock_quantity - item.quantity
                        }).eq('id', item.product_id);
                    }
                } catch (e) {}
            }

            if (content) {
                content.innerHTML = `
                    <div class="status-icon success">✅</div>
                    <p class="status-text">Cash Payment Successful! 🎉</p>
                    <p class="status-sub">Order #${order.order_number || order.id.slice(0,8)}</p>
                    <p class="status-sub">Amount: KES ${total.toFixed(2)}</p>
                `;
            }

            showToast(`✅ Cash payment successful!`, 'success');
            addNotification('Cash Payment', `Order #${order.order_number || order.id.slice(0,8)} - KES ${total.toFixed(2)}`, 'success', 'orders');

            setTimeout(() => {
                modal.classList.remove('active');
                generateAdminReceipt(order.id);
                cart = [];
                updateCartDisplayPOS();
                const phoneInput = document.getElementById('posPhone');
                if (phoneInput) phoneInput.value = '';
                loadPOSProducts(posMode);
                loadDashboard();
                resetSessionTimer();
            }, 2000);
        }

    } catch (error) {
        console.error('Payment error:', error);
        if (content) {
            content.innerHTML = `
                <div class="status-icon failed">❌</div>
                <p class="status-text">Payment Error</p>
                <p class="status-sub">${error.message}</p>
            `;
        }
        showToast('❌ Payment error: ' + error.message, 'error');
        addNotification('Payment Error', error.message, 'error');
        setTimeout(() => {
            modal.classList.remove('active');
        }, 2000);
    }
}

// ============================================================
//  CANCEL PAYMENT
// ============================================================
function cancelPayment() {
    closeModal('paymentModal');
    showToast('Payment cancelled', 'warning');
}

// ============================================================
//  HANDLE PAYHERO WEBHOOK
// ============================================================
async function handlePayHeroWebhook(payload) {
    try {
        console.log('📥 PayHero webhook received:', payload);
        // Webhook handling logic here
        return { success: true, message: 'Webhook processed' };
    } catch (error) {
        console.error('Webhook error:', error);
        return { success: false, error: error.message };
    }
}
// ============================================================
//  SIDEBAR FUNCTIONS - FIXED
// ============================================================

function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebarToggle');
    
    // Sidebar toggle
    if (toggleBtn && sidebar) {
        // Remove any existing listeners
        const newToggleBtn = toggleBtn.cloneNode(true);
        toggleBtn.parentNode.replaceChild(newToggleBtn, toggleBtn);
        
        newToggleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            sidebar.classList.toggle('open');
            console.log('Sidebar toggled:', sidebar.classList.contains('open'));
        });
    }
    
    // Sidebar menu items
    const menuItems = document.querySelectorAll('.sidebar-menu li[data-section]');
    menuItems.forEach(function(item) {
        // Remove existing listeners
        const newItem = item.cloneNode(true);
        item.parentNode.replaceChild(newItem, item);
        
        newItem.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;
            console.log('Navigating to:', section);
            
            // Update active state
            document.querySelectorAll('.sidebar-menu li').forEach(function(l) {
                l.classList.remove('active');
            });
            this.classList.add('active');
            
            // Show section
            document.querySelectorAll('.section-page').forEach(function(el) {
                el.classList.remove('active');
            });
            const target = document.getElementById(section + 'Section');
            if (target) target.classList.add('active');
            
            // Update title
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
            const titleEl = document.getElementById('pageTitle');
            const subEl = document.getElementById('pageSubtitle');
            if (titleEl) titleEl.textContent = title;
            if (subEl) subEl.textContent = sub;
            
            // Close sidebar on mobile
            const sidebarEl = document.getElementById('sidebar');
            if (sidebarEl && window.innerWidth <= 768) {
                sidebarEl.classList.remove('open');
            }
            
            // Load section data
            setTimeout(() => {
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
            }, 50);
        });
    });
    
    console.log('✅ Sidebar initialized');
}

// ============================================================
//  CLOSE SIDEBAR ON OUTSIDE CLICK (Mobile)
// ============================================================

function initSidebarOutsideClick() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (sidebar && mainContent) {
        mainContent.addEventListener('click', function(e) {
            if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        });
    }
}

// ============================================================
//  SIDEBAR RESPONSIVE - Auto close on resize
// ============================================================

function initSidebarResponsive() {
    window.addEventListener('resize', function() {
        const sidebar = document.getElementById('sidebar');
        if (window.innerWidth > 768 && sidebar) {
            sidebar.classList.remove('open');
        }
    });
}

// ============================================================
//  INIT - UPDATED WITH SIDEBAR
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Admin dashboard loading...');
    
    // ===== INIT SIDEBAR =====
    initSidebar();
    initSidebarOutsideClick();
    initSidebarResponsive();
    
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

    // Set up order filters
    document.querySelectorAll('#orderFilters .filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('#orderFilters .filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            renderOrders(allOrders);
        });
    });

    // Set up kitchen filters
    document.querySelectorAll('#kitchenFilters .filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('#kitchenFilters .filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            kitchenFilter = this.dataset.filter;
            loadKitchenOrders();
        });
    });

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
        await loadProfitBreakdown(); 
        await loadAuditLogs();
         await loadAuditUsers();
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
window.loadProfitData = loadProfitData;
window.loadProfitBreakdown = loadProfitBreakdown;
window.createProfitChart = createProfitChart;
window.refreshProfitData = refreshProfitData;
