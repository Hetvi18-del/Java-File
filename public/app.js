// Global variables
let currentUser = null;
let authToken = localStorage.getItem('authToken');
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentMenuItems = [];

// API base URL
const API_BASE = '/api';

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    setupEventListeners();
    updateCartUI();
});

// Check authentication status
function checkAuthStatus() {
    if (authToken) {
        fetchUserProfile();
    } else {
        showSection('login');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Register form
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    
    // Admin login form
    document.getElementById('adminLoginForm').addEventListener('submit', handleAdminLogin);
}

// Authentication functions
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            showAlert('Login successful!', 'success');
            setupUserInterface();
            
            if (currentUser.role === 'admin') {
                showSection('admin');
                loadAdminDashboard();
            } else {
                showSection('dashboard');
                loadDashboard();
            }
        } else {
            showAlert(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showAlert('Network error. Please try again.', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('registerName').value,
        email: document.getElementById('registerEmail').value,
        studentId: document.getElementById('registerStudentId').value,
        phone: document.getElementById('registerPhone').value,
        department: document.getElementById('registerDepartment').value,
        year: parseInt(document.getElementById('registerYear').value),
        password: document.getElementById('registerPassword').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            showAlert('Registration successful!', 'success');
            setupUserInterface();
            showSection('dashboard');
            loadDashboard();
        } else {
            if (data.errors) {
                showAlert(data.errors.map(err => err.msg).join(', '), 'error');
            } else {
                showAlert(data.message || 'Registration failed', 'error');
            }
        }
    } catch (error) {
        console.error('Registration error:', error);
        showAlert('Network error. Please try again.', 'error');
    }
}

async function handleAdminLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success && data.user.role === 'admin') {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            showAlert('Admin login successful!', 'success');
            setupUserInterface();
            showSection('admin');
            loadAdminDashboard();
        } else {
            showAlert('Invalid admin credentials', 'error');
        }
    } catch (error) {
        console.error('Admin login error:', error);
        showAlert('Network error. Please try again.', 'error');
    }
}

async function fetchUserProfile() {
    try {
        const response = await fetch(`${API_BASE}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            setupUserInterface();
            
            if (currentUser.role === 'admin') {
                showSection('admin');
                loadAdminDashboard();
            } else {
                showSection('dashboard');
                loadDashboard();
            }
        } else {
            logout();
        }
    } catch (error) {
        console.error('Profile fetch error:', error);
        logout();
    }
}

function setupUserInterface() {
    document.getElementById('authButtons').style.display = 'none';
    document.getElementById('userMenu').style.display = 'flex';
    document.getElementById('navLinks').style.display = 'flex';
    
    if (currentUser) {
        document.getElementById('walletBalance').textContent = `₹${currentUser.walletBalance}`;
        document.getElementById('userName').textContent = `Welcome, ${currentUser.name}!`;
        document.getElementById('userDetails').textContent = 
            currentUser.role === 'admin' ? 'Administrator' : 
            `${currentUser.studentId} | ${currentUser.department} | Year ${currentUser.year}`;
        document.getElementById('dashboardWalletBalance').textContent = `₹${currentUser.walletBalance}`;
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    cart = [];
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('cart');
    
    document.getElementById('authButtons').style.display = 'flex';
    document.getElementById('userMenu').style.display = 'none';
    document.getElementById('navLinks').style.display = 'none';
    
    updateCartUI();
    showSection('login');
    showAlert('Logged out successfully', 'success');
}

// Section navigation
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.main-content');
    sections.forEach(section => section.classList.remove('active'));
    
    // Show target section
    const targetSection = document.getElementById(`${sectionName}Section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Load section data
    switch(sectionName) {
        case 'menu':
            loadMenu();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'wallet':
            loadWallet();
            break;
        case 'admin':
            loadAdminDashboard();
            break;
    }
}

// Dashboard functions
async function loadDashboard() {
    if (!currentUser) return;
    
    try {
        // Load recent orders
        const ordersResponse = await fetch(`${API_BASE}/orders/my-orders?limit=3`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (ordersResponse.ok) {
            const ordersData = await ordersResponse.json();
            // Display recent orders in dashboard
        }
        
        // Load wallet stats
        const walletResponse = await fetch(`${API_BASE}/wallet/stats`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (walletResponse.ok) {
            const walletData = await walletResponse.json();
            // Display wallet stats
        }
        
    } catch (error) {
        console.error('Dashboard load error:', error);
    }
}

// Menu functions
async function loadMenu() {
    const menuGrid = document.getElementById('menuGrid');
    menuGrid.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    
    try {
        const response = await fetch(`${API_BASE}/menu`);
        const data = await response.json();
        
        if (data.success) {
            currentMenuItems = data.data;
            displayMenuItems(currentMenuItems);
        } else {
            menuGrid.innerHTML = '<p>Failed to load menu items</p>';
        }
    } catch (error) {
        console.error('Menu load error:', error);
        menuGrid.innerHTML = '<p>Error loading menu</p>';
    }
}

function displayMenuItems(items) {
    const menuGrid = document.getElementById('menuGrid');
    
    if (items.length === 0) {
        menuGrid.innerHTML = '<p>No items available</p>';
        return;
    }
    
    menuGrid.innerHTML = items.map(item => `
        <div class="menu-item" data-category="${item.category}">
            <div class="item-image">
                ${item.image ? `<img src="${item.image}" alt="${item.name}">` : '<i class="fas fa-utensils"></i>'}
            </div>
            <div class="item-content">
                <div class="item-header">
                    <h3 class="item-title">${item.name}</h3>
                    <span class="item-price">₹${item.price}</span>
                </div>
                <p class="item-description">${item.description}</p>
                <div class="item-tags">
                    ${item.isVegetarian ? '<span class="tag">🌱 Veg</span>' : ''}
                    ${item.isVegan ? '<span class="tag">🌿 Vegan</span>' : ''}
                    ${item.isGlutenFree ? '<span class="tag">🌾 Gluten Free</span>' : ''}
                    ${item.spiceLevel !== 'none' ? `<span class="tag">🌶️ ${item.spiceLevel}</span>` : ''}
                </div>
                <div class="item-footer">
                    <div class="quantity-control">
                        <button class="qty-btn" onclick="changeQuantity('${item._id}', -1)">-</button>
                        <input type="number" class="qty-input" id="qty-${item._id}" value="1" min="1" max="10">
                        <button class="qty-btn" onclick="changeQuantity('${item._id}', 1)">+</button>
                    </div>
                    <button class="btn btn-primary" onclick="addToCart('${item._id}')">
                        <i class="fas fa-plus"></i>
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function filterMenu(category) {
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Filter items
    const filteredItems = category === 'all' ? 
        currentMenuItems : 
        currentMenuItems.filter(item => item.category === category);
    
    displayMenuItems(filteredItems);
}

function changeQuantity(itemId, change) {
    const qtyInput = document.getElementById(`qty-${itemId}`);
    const currentQty = parseInt(qtyInput.value);
    const newQty = Math.max(1, Math.min(10, currentQty + change));
    qtyInput.value = newQty;
}

// Cart functions
function addToCart(itemId) {
    if (!currentUser) {
        showAlert('Please login to add items to cart', 'warning');
        return;
    }
    
    const item = currentMenuItems.find(item => item._id === itemId);
    const quantity = parseInt(document.getElementById(`qty-${itemId}`).value);
    
    if (!item) return;
    
    const existingItem = cart.find(cartItem => cartItem._id === itemId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            _id: item._id,
            name: item.name,
            price: item.price,
            quantity: quantity,
            image: item.image
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
    showAlert(`${item.name} added to cart!`, 'success');
}

function updateCartUI() {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    document.getElementById('cartCount').textContent = cartCount;
    document.getElementById('cartTotalAmount').textContent = cartTotal;
    
    if (cartCount > 0) {
        document.getElementById('cartButton').style.display = 'block';
        document.getElementById('cartTotal').style.display = 'block';
    } else {
        document.getElementById('cartButton').style.display = 'none';
        document.getElementById('cartTotal').style.display = 'none';
    }
    
    updateCartContent();
}

function updateCartContent() {
    const cartContent = document.getElementById('cartContent');
    
    if (cart.length === 0) {
        cartContent.innerHTML = '<p>Your cart is empty</p>';
        return;
    }
    
    cartContent.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div>
                <h4>${item.name}</h4>
                <p>₹${item.price} x ${item.quantity}</p>
            </div>
            <div>
                <span>₹${item.price * item.quantity}</span>
                <button onclick="removeFromCart('${item._id}')" style="background: none; border: none; color: #ff4757; cursor: pointer; margin-left: 1rem;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function removeFromCart(itemId) {
    cart = cart.filter(item => item._id !== itemId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
}

function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    cartSidebar.classList.toggle('open');
}

async function checkout() {
    if (!currentUser || cart.length === 0) return;
    
    const orderData = {
        items: cart.map(item => ({
            menuItem: item._id,
            quantity: item.quantity
        })),
        paymentMethod: 'wallet'
    };
    
    try {
        const response = await fetch(`${API_BASE}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(orderData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            cart = [];
            localStorage.removeItem('cart');
            updateCartUI();
            toggleCart();
            
            // Update wallet balance
            await fetchUserProfile();
            
            showAlert('Order placed successfully!', 'success');
            showSection('orders');
        } else {
            showAlert(data.message || 'Order failed', 'error');
        }
    } catch (error) {
        console.error('Checkout error:', error);
        showAlert('Network error. Please try again.', 'error');
    }
}

// Orders functions
async function loadOrders() {
    const ordersList = document.getElementById('ordersList');
    ordersList.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    
    try {
        const response = await fetch(`${API_BASE}/orders/my-orders`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayOrders(data.data);
        } else {
            ordersList.innerHTML = '<p>Failed to load orders</p>';
        }
    } catch (error) {
        console.error('Orders load error:', error);
        ordersList.innerHTML = '<p>Error loading orders</p>';
    }
}

function displayOrders(orders) {
    const ordersList = document.getElementById('ordersList');
    
    if (orders.length === 0) {
        ordersList.innerHTML = '<p>No orders found</p>';
        return;
    }
    
    ordersList.innerHTML = orders.map(order => `
        <div class="order-item">
            <div class="order-header">
                <div>
                    <h3>Order #${order.orderNumber}</h3>
                    <p>${new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <span class="order-status status-${order.status}">${order.status.toUpperCase()}</span>
            </div>
            <div class="order-items">
                ${order.items.map(item => `
                    <p>${item.quantity}x ${item.menuItem.name} - ₹${item.price * item.quantity}</p>
                `).join('')}
            </div>
            <div class="order-footer">
                <strong>Total: ₹${order.totalAmount}</strong>
                ${order.status === 'pending' || order.status === 'confirmed' ? 
                    `<button class="btn btn-outline" onclick="cancelOrder('${order._id}')">Cancel</button>` : ''}
            </div>
        </div>
    `).join('');
}

async function cancelOrder(orderId) {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/orders/${orderId}/cancel`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('Order cancelled successfully', 'success');
            loadOrders();
            await fetchUserProfile(); // Update wallet balance
        } else {
            showAlert(data.message || 'Cancel failed', 'error');
        }
    } catch (error) {
        console.error('Cancel order error:', error);
        showAlert('Network error. Please try again.', 'error');
    }
}

// Wallet functions
async function loadWallet() {
    try {
        const [balanceResponse, transactionsResponse, statsResponse] = await Promise.all([
            fetch(`${API_BASE}/wallet/balance`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            }),
            fetch(`${API_BASE}/wallet/transactions`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            }),
            fetch(`${API_BASE}/wallet/stats`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            })
        ]);
        
        const balanceData = await balanceResponse.json();
        const transactionsData = await transactionsResponse.json();
        const statsData = await statsResponse.json();
        
        if (balanceData.success) {
            document.getElementById('walletBalanceDisplay').textContent = `₹${balanceData.balance}`;
        }
        
        if (transactionsData.success) {
            displayTransactions(transactionsData.data);
        }
        
        if (statsData.success) {
            displayWalletStats(statsData.data);
        }
        
    } catch (error) {
        console.error('Wallet load error:', error);
    }
}

function displayTransactions(transactions) {
    const transactionsList = document.getElementById('transactionsList');
    
    if (transactions.length === 0) {
        transactionsList.innerHTML = '<p>No transactions found</p>';
        return;
    }
    
    transactionsList.innerHTML = `
        <h3>Recent Transactions</h3>
        ${transactions.map(transaction => `
            <div class="order-item">
                <div class="order-header">
                    <div>
                        <h4>${transaction.description}</h4>
                        <p>${new Date(transaction.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span class="${transaction.type === 'credit' ? 'text-success' : 'text-danger'}">
                        ${transaction.type === 'credit' ? '+' : '-'}₹${transaction.amount}
                    </span>
                </div>
                <p>Balance after: ₹${transaction.balanceAfter}</p>
            </div>
        `).join('')}
    `;
}

function displayWalletStats(stats) {
    // Display monthly spending and other stats
    const monthlySpent = stats.monthlySpending.reduce((total, month) => total + month.totalSpent, 0);
    const totalOrdersCount = stats.monthlySpending.reduce((total, month) => total + month.orderCount, 0);
    
    document.getElementById('monthlySpending').textContent = `₹${monthlySpent}`;
    document.getElementById('totalOrders').textContent = totalOrdersCount;
}

function showRechargeModal() {
    const amount = prompt('Enter amount to recharge (₹10 - ₹5000):');
    if (!amount || isNaN(amount) || amount < 10 || amount > 5000) {
        showAlert('Please enter a valid amount between ₹10 and ₹5000', 'warning');
        return;
    }
    
    const paymentMethod = prompt('Select payment method:\n1. Card\n2. UPI\n3. Net Banking\n\nEnter 1, 2, or 3:');
    const methods = { '1': 'card', '2': 'upi', '3': 'net-banking' };
    
    if (!methods[paymentMethod]) {
        showAlert('Please select a valid payment method', 'warning');
        return;
    }
    
    rechargeWallet(parseFloat(amount), methods[paymentMethod]);
}

async function rechargeWallet(amount, paymentMethod) {
    try {
        const response = await fetch(`${API_BASE}/wallet/recharge`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ amount, paymentMethod })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert(`Wallet recharged successfully! New balance: ₹${data.data.newBalance}`, 'success');
            await fetchUserProfile(); // Update wallet balance
            loadWallet(); // Refresh wallet section
        } else {
            showAlert(data.message || 'Recharge failed', 'error');
        }
    } catch (error) {
        console.error('Recharge error:', error);
        showAlert('Network error. Please try again.', 'error');
    }
}

// Admin functions
async function loadAdminDashboard() {
    const adminContent = document.getElementById('adminContent');
    adminContent.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    
    try {
        const response = await fetch(`${API_BASE}/admin/dashboard`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayAdminDashboard(data.data);
        } else {
            adminContent.innerHTML = '<p>Failed to load dashboard</p>';
        }
    } catch (error) {
        console.error('Admin dashboard error:', error);
        adminContent.innerHTML = '<p>Error loading dashboard</p>';
    }
}

function displayAdminDashboard(data) {
    const adminContent = document.getElementById('adminContent');
    
    adminContent.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-users"></i></div>
                <div class="stat-value">${data.overview.totalUsers}</div>
                <div class="stat-label">Total Students</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-shopping-cart"></i></div>
                <div class="stat-value">${data.overview.todayOrders}</div>
                <div class="stat-label">Today's Orders</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-rupee-sign"></i></div>
                <div class="stat-value">₹${data.overview.todayRevenue}</div>
                <div class="stat-label">Today's Revenue</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-clock"></i></div>
                <div class="stat-value">${data.overview.pendingOrders}</div>
                <div class="stat-label">Pending Orders</div>
            </div>
        </div>
        
        <div class="menu-section">
            <h3>Recent Orders</h3>
            <div class="orders-list">
                ${data.recentOrders.map(order => `
                    <div class="order-item">
                        <div class="order-header">
                            <div>
                                <h4>Order #${order.orderNumber}</h4>
                                <p>${order.user.name} (${order.user.studentId})</p>
                            </div>
                            <span class="order-status status-${order.status}">${order.status.toUpperCase()}</span>
                        </div>
                        <p>Total: ₹${order.totalAmount}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function showAdminPanel(panel) {
    // Update active nav
    document.querySelectorAll('.admin-nav a').forEach(link => link.classList.remove('active'));
    event.target.classList.add('active');
    
    switch(panel) {
        case 'dashboard':
            loadAdminDashboard();
            break;
        case 'menu':
            loadAdminMenu();
            break;
        case 'orders':
            loadAdminOrders();
            break;
        case 'users':
            loadAdminUsers();
            break;
        case 'analytics':
            loadAdminAnalytics();
            break;
    }
}

async function loadAdminMenu() {
    const adminContent = document.getElementById('adminContent');
    adminContent.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    
    try {
        const response = await fetch(`${API_BASE}/menu`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayAdminMenu(data.data);
        }
    } catch (error) {
        console.error('Admin menu error:', error);
    }
}

function displayAdminMenu(items) {
    const adminContent = document.getElementById('adminContent');
    
    adminContent.innerHTML = `
        <div class="section-header">
            <h2>Menu Management</h2>
            <button class="btn btn-primary" onclick="showAddItemModal()">
                <i class="fas fa-plus"></i>
                Add Item
            </button>
        </div>
        
        <div class="menu-grid">
            ${items.map(item => `
                <div class="menu-item">
                    <div class="item-image">
                        ${item.image ? `<img src="${item.image}" alt="${item.name}">` : '<i class="fas fa-utensils"></i>'}
                    </div>
                    <div class="item-content">
                        <div class="item-header">
                            <h3 class="item-title">${item.name}</h3>
                            <span class="item-price">₹${item.price}</span>
                        </div>
                        <p class="item-description">${item.description}</p>
                        <div class="item-footer">
                            <span class="${item.isAvailable ? 'text-success' : 'text-danger'}">
                                ${item.isAvailable ? 'Available' : 'Unavailable'}
                            </span>
                            <div>
                                <button class="btn btn-outline" onclick="toggleItemAvailability('${item._id}')">
                                    ${item.isAvailable ? 'Disable' : 'Enable'}
                                </button>
                                <button class="btn btn-primary" onclick="editItem('${item._id}')">
                                    Edit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

async function loadAdminOrders() {
    const adminContent = document.getElementById('adminContent');
    adminContent.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    
    try {
        const response = await fetch(`${API_BASE}/orders/admin/all`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayAdminOrders(data.data);
        }
    } catch (error) {
        console.error('Admin orders error:', error);
    }
}

function displayAdminOrders(orders) {
    const adminContent = document.getElementById('adminContent');
    
    adminContent.innerHTML = `
        <div class="section-header">
            <h2>Order Management</h2>
        </div>
        
        <div class="orders-list">
            ${orders.map(order => `
                <div class="order-item">
                    <div class="order-header">
                        <div>
                            <h3>Order #${order.orderNumber}</h3>
                            <p>${order.user.name} (${order.user.studentId}) - ${order.user.phone}</p>
                            <p>${new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <select onchange="updateOrderStatus('${order._id}', this.value)" class="form-control">
                                <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                                <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                                <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>Preparing</option>
                                <option value="ready" ${order.status === 'ready' ? 'selected' : ''}>Ready</option>
                                <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
                                <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                            </select>
                        </div>
                    </div>
                    <div class="order-items">
                        ${order.items.map(item => `
                            <p>${item.quantity}x ${item.menuItem.name} - ₹${item.price * item.quantity}</p>
                        `).join('')}
                    </div>
                    <div class="order-footer">
                        <strong>Total: ₹${order.totalAmount}</strong>
                        <span class="order-status status-${order.status}">${order.status.toUpperCase()}</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

async function updateOrderStatus(orderId, status) {
    try {
        const response = await fetch(`${API_BASE}/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ status })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('Order status updated successfully', 'success');
        } else {
            showAlert(data.message || 'Update failed', 'error');
        }
    } catch (error) {
        console.error('Update order status error:', error);
        showAlert('Network error. Please try again.', 'error');
    }
}

// Utility functions
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} show`;
    alertDiv.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; float: right; cursor: pointer;">×</button>
    `;
    
    alertContainer.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Make functions globally available
window.showSection = showSection;
window.logout = logout;
window.filterMenu = filterMenu;
window.changeQuantity = changeQuantity;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.toggleCart = toggleCart;
window.checkout = checkout;
window.loadOrders = loadOrders;
window.cancelOrder = cancelOrder;
window.showRechargeModal = showRechargeModal;
window.showAdminPanel = showAdminPanel;
window.updateOrderStatus = updateOrderStatus;