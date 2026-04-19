// ==================== CONFIG ====================
const WHATSAPP_NUMBER = '923157339199'; // Change this to your WhatsApp number
const CURRENCY = 'Rs';

// ==================== MENU DATA ====================
const menuData = {
    streetSnacks: [
        {
            id: 1,
            name: 'Samosa Chaat',
            description: 'Crispy samosas with tangy tamarind chutney and spiced yogurt topping',
            price: 450,
            category: 'street-snacks',
            image: 'menu_item_1.png'
        },
        {
            id: 2,
            name: 'Dahi Bhallay',
            description: 'Soft and fluffy yogurt dumplings in a sweet and savory syrup',
            price: 350,
            category: 'street-snacks',
            image: 'menu_item_2.jpeg'
        }
    ],
    coldDrinks: [
        {
            id: 3,
            name: 'Pepsi',
            description: 'Ice-cold refreshing cola drink',
            price: 150,
            category: 'cold-drinks',
            image: 'pepsi.png'
        },
        {
            id: 4,
            name: 'Fanta',
            description: 'Vibrant fruity flavor in a chilled glass',
            price: 150,
            category: 'cold-drinks',
            image: 'fanta.png'
        }
    ]
};

// ==================== STATE MANAGEMENT ====================
let cart = [];

// ==================== DOM ELEMENTS ====================
const cartToggle = document.getElementById('cartToggle');
const cartDrawer = document.getElementById('cartDrawer');
const cartBadge = document.getElementById('cartBadge');
const cartOverlay = document.getElementById('cartOverlay');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const totalPriceEl = document.getElementById('totalPrice');
const placeOrderBtn = document.getElementById('placeOrderBtn');
const orderModal = document.getElementById('orderModal');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const orderForm = document.getElementById('orderForm');
const streetSnacksGrid = document.getElementById('streetSnacksGrid');
const coldDrinksGrid = document.getElementById('coldDrinksGrid');

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
    initializeMenu();
    setupEventListeners();
    loadCartFromLocalStorage();
});

// ==================== MENU INITIALIZATION ====================
function initializeMenu() {
    renderMenuCategory(menuData.streetSnacks, streetSnacksGrid);
    renderMenuCategory(menuData.coldDrinks, coldDrinksGrid);
}

function renderMenuCategory(items, container) {
    container.innerHTML = items.map(item => `
        <div class="menu-card" data-item-id="${item.id}">
            <div class="item-image">
                <img src="assets/menu/${item.image}" alt="${item.name}" loading="lazy">
            </div>
            <h3 class="item-name">${item.name}</h3>
            <p class="item-description">${item.description}</p>
            <p class="item-price">${CURRENCY} ${item.price}</p>
            
            <div class="quantity-selector">
                <button class="qty-btn minus-btn" data-item-id="${item.id}">−</button>
                <span class="qty-display" data-qty-display="${item.id}">1</span>
                <button class="qty-btn plus-btn" data-item-id="${item.id}">+</button>
            </div>
            
            <button class="add-to-cart-btn" data-item-id="${item.id}">
                Add to Cart
            </button>
        </div>
    `).join('');

    // Attach event listeners to buttons
    container.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', handleAddToCart);
    });

    container.querySelectorAll('.minus-btn').forEach(btn => {
        btn.addEventListener('click', handleQuantityDecrease);
    });

    container.querySelectorAll('.plus-btn').forEach(btn => {
        btn.addEventListener('click', handleQuantityIncrease);
    });
}

// ==================== QUANTITY HANDLERS ====================
function handleQuantityDecrease(e) {
    const itemId = e.target.dataset.itemId;
    const qtyDisplay = document.querySelector(`[data-qty-display="${itemId}"]`);
    let qty = parseInt(qtyDisplay.textContent);
    if (qty > 1) {
        qty--;
        qtyDisplay.textContent = qty;
    }
}

function handleQuantityIncrease(e) {
    const itemId = e.target.dataset.itemId;
    const qtyDisplay = document.querySelector(`[data-qty-display="${itemId}"]`);
    let qty = parseInt(qtyDisplay.textContent);
    qty++;
    qtyDisplay.textContent = qty;
}

// ==================== ADD TO CART ====================
function handleAddToCart(e) {
    const itemId = parseInt(e.target.dataset.itemId);
    const qtyDisplay = document.querySelector(`[data-qty-display="${itemId}"]`);
    const quantity = parseInt(qtyDisplay.textContent);

    const item = findItemById(itemId);
    if (!item) return;

    addToCart(item, quantity);

    // Visual feedback
    e.target.classList.add('added');
    e.target.textContent = '✓ Added';
    setTimeout(() => {
        e.target.classList.remove('added');
        e.target.textContent = 'Add to Cart';
        qtyDisplay.textContent = '1';
    }, 1500);

    // Show cart with animation
    openCart();
}

function findItemById(id) {
    return [...menuData.streetSnacks, ...menuData.coldDrinks].find(item => item.id === id);
}

function addToCart(item, quantity) {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            ...item,
            quantity: quantity
        });
    }

    saveCartToLocalStorage();
    updateCartUI();
    
    // Trigger badge animation
    cartBadge.style.animation = 'none';
    setTimeout(() => {
        cartBadge.style.animation = 'popIn 0.3s ease-out';
    }, 10);
}

// ==================== CART MANAGEMENT ====================
function updateCartUI() {
    updateCartBadge();
    renderCartItems();
    updateCartTotal();
    updatePlaceOrderBtn();
}

function updateCartBadge() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalItems;
}

function renderCartItems() {
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-message">Your cart is empty</p>';
        return;
    }

    cartItemsContainer.innerHTML = cart.map((item, index) => `
        <div class="cart-item" data-cart-index="${index}">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-details">${item.quantity} × ${CURRENCY} ${item.price}</div>
            </div>
            <div class="cart-item-price">${CURRENCY} ${item.price * item.quantity}</div>
            <button class="remove-item-btn" data-cart-index="${index}">×</button>
        </div>
    `).join('');

    // Attach remove listeners
    cartItemsContainer.querySelectorAll('.remove-item-btn').forEach(btn => {
        btn.addEventListener('click', handleRemoveItem);
    });
}

function handleRemoveItem(e) {
    const index = parseInt(e.target.dataset.cartIndex);
    cart.splice(index, 1);
    saveCartToLocalStorage();
    updateCartUI();
}

function updateCartTotal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalPriceEl.textContent = `${CURRENCY} ${total}`;
}

function updatePlaceOrderBtn() {
    placeOrderBtn.disabled = cart.length === 0;
}

// ==================== CART VISIBILITY ====================
function openCart() {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// ==================== MODAL MANAGEMENT ====================
function openOrderModal() {
    orderModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    renderOrderSummary();
    updateSummaryTotal();
}

function closeOrderModal() {
    orderModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function renderOrderSummary() {
    const summaryContainer = document.getElementById('orderSummary');
    if (cart.length === 0) {
        summaryContainer.innerHTML = '<p>No items in cart</p>';
        return;
    }

    summaryContainer.innerHTML = cart.map(item => `
        <div class="summary-item">
            <span>${item.name} × ${item.quantity}</span>
            <span>${CURRENCY} ${item.price * item.quantity}</span>
        </div>
    `).join('');
}

function updateSummaryTotal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('summaryTotal').textContent = `${CURRENCY} ${total}`;
}

// ==================== WHATSAPP INTEGRATION ====================
function generateOrderMessage(customerName, customerPhone, customerAddress) {
    let message = `Hello, I want to place an order:\n\n`;

    cart.forEach(item => {
        message += `${item.name} x${item.quantity}\n`;
    });

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += `\nTotal: ${CURRENCY} ${total}\n\n`;
    message += `Name: ${customerName}\n`;
    message += `Address: ${customerAddress}\n`;
    message += `Phone: ${customerPhone}`;

    return encodeURIComponent(message);
}

function sendOrderViaWhatsApp(customerName, customerPhone, customerAddress) {
    const message = generateOrderMessage(customerName, customerPhone, customerAddress);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    
    window.open(whatsappUrl, '_blank');

    // Clear cart after sending
    setTimeout(() => {
        cart = [];
        saveCartToLocalStorage();
        updateCartUI();
        closeCart();
        closeOrderModal();
    }, 500);
}

// ==================== FORM HANDLING ====================
function handleOrderFormSubmit(e) {
    e.preventDefault();

    const customerName = document.getElementById('customerName').value.trim();
    const customerPhone = document.getElementById('customerPhone').value.trim();
    const customerAddress = document.getElementById('customerAddress').value.trim();

    if (!customerName || !customerPhone || !customerAddress) {
        alert('Please fill in all fields');
        return;
    }

    sendOrderViaWhatsApp(customerName, customerPhone, customerAddress);
    
    // Reset form
    orderForm.reset();
}

// ==================== LOCAL STORAGE ====================
function saveCartToLocalStorage() {
    localStorage.setItem('nocapcrunchCart', JSON.stringify(cart));
}

function loadCartFromLocalStorage() {
    const saved = localStorage.getItem('nocapcrunchCart');
    if (saved) {
        cart = JSON.parse(saved);
        updateCartUI();
    }
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    // Cart toggle
    cartToggle.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    // Place order
    placeOrderBtn.addEventListener('click', openOrderModal);

    // Modal
    modalCloseBtn.addEventListener('click', closeOrderModal);
    orderModal.addEventListener('click', (e) => {
        if (e.target === orderModal) closeOrderModal();
    });

    // Form
    orderForm.addEventListener('submit', handleOrderFormSubmit);

    // Close modals when clicking outside
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCart();
            closeOrderModal();
        }
    });
}

// ==================== UTILITY: Update WhatsApp Number ====================
// To change the WhatsApp number, simply update the WHATSAPP_NUMBER at the top
// Example: const WHATSAPP_NUMBER = '923334567890';
