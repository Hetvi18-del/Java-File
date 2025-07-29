// DocuChain JavaScript - Document Management & Blockchain Simulation

// Global variables
let documents = [];
let currentUser = null;
let blockchainData = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadSampleDocuments();
    startStatsAnimation();
    setupEventListeners();
});

// Initialize application
function initializeApp() {
    // Check if user is logged in (simulate with localStorage)
    const userData = localStorage.getItem('docuchain_user');
    if (userData) {
        currentUser = JSON.parse(userData);
        updateUIForLoggedInUser();
    }
    
    // Initialize blockchain with genesis block
    if (blockchainData.length === 0) {
        blockchainData.push({
            index: 0,
            timestamp: new Date().toISOString(),
            data: 'Genesis Block',
            previousHash: '0',
            hash: generateHash('Genesis Block' + new Date().toISOString() + '0'),
            nonce: 0
        });
    }
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    setupSmoothScrolling();
    setupMobileMenu();
    
    // File upload
    setupFileUpload();
    
    // Search and filter
    setupSearchAndFilter();
    
    // Modals
    setupModals();
    
    // Forms
    setupForms();
    
    // Verification
    setupVerification();
}

// Smooth scrolling for navigation links
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Mobile menu toggle
function setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
}

// File upload functionality
function setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    
    if (uploadArea && fileInput) {
        // Drag and drop
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('dragleave', handleDragLeave);
        uploadArea.addEventListener('drop', handleDrop);
        
        // File input change
        fileInput.addEventListener('change', handleFileSelect);
    }
}

// Handle drag over
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

// Handle drag leave
function handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
}

// Handle file drop
function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    processFiles(files);
}

// Handle file selection
function handleFileSelect(e) {
    const files = e.target.files;
    processFiles(files);
}

// Process uploaded files
function processFiles(files) {
    Array.from(files).forEach(file => {
        if (isValidFileType(file)) {
            uploadDocument(file);
        } else {
            showNotification('Invalid file type. Please upload PDF, DOC, DOCX, JPG, or PNG files.', 'error');
        }
    });
}

// Validate file type
function isValidFileType(file) {
    const allowedTypes = ['application/pdf', 'application/msword', 
                         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                         'image/jpeg', 'image/jpg', 'image/png'];
    return allowedTypes.includes(file.type);
}

// Upload document to blockchain
async function uploadDocument(file) {
    try {
        showNotification('Processing document...', 'info');
        
        // Simulate file processing
        const fileHash = await generateFileHash(file);
        const verificationId = generateVerificationId();
        
        // Create document record
        const document = {
            id: generateId(),
            name: file.name,
            type: getDocumentType(file.name),
            size: formatFileSize(file.size),
            hash: fileHash,
            verificationId: verificationId,
            timestamp: new Date().toISOString(),
            status: 'verified',
            owner: currentUser ? currentUser.email : 'anonymous@example.com',
            blockIndex: blockchainData.length
        };
        
        // Add to blockchain
        const block = createBlock(document);
        blockchainData.push(block);
        
        // Add to documents array
        documents.unshift(document);
        
        // Update UI
        renderDocuments();
        updateStats();
        
        showNotification(`Document "${file.name}" successfully uploaded and verified on blockchain!`, 'success');
        
    } catch (error) {
        console.error('Upload error:', error);
        showNotification('Error uploading document. Please try again.', 'error');
    }
}

// Generate file hash (simulation)
function generateFileHash(file) {
    return new Promise((resolve) => {
        // Simulate hash generation
        setTimeout(() => {
            const hash = generateHash(file.name + file.size + Date.now());
            resolve(hash);
        }, 1000);
    });
}

// Generate simple hash (simulation)
function generateHash(data) {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
}

// Generate verification ID
function generateVerificationId() {
    return 'DC-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Generate unique ID
function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

// Get document type based on filename
function getDocumentType(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    const typeMap = {
        'pdf': 'document',
        'doc': 'document',
        'docx': 'document',
        'jpg': 'image',
        'jpeg': 'image',
        'png': 'image'
    };
    return typeMap[extension] || 'other';
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Create blockchain block
function createBlock(data) {
    const previousBlock = blockchainData[blockchainData.length - 1];
    const block = {
        index: blockchainData.length,
        timestamp: new Date().toISOString(),
        data: data,
        previousHash: previousBlock.hash,
        hash: '',
        nonce: 0
    };
    
    // Mine block (simplified proof of work)
    block.hash = mineBlock(block);
    return block;
}

// Mine block (simplified)
function mineBlock(block) {
    while (true) {
        const hash = generateHash(
            block.index + 
            block.timestamp + 
            JSON.stringify(block.data) + 
            block.previousHash + 
            block.nonce
        );
        
        // Simple difficulty - hash must start with '0'
        if (hash.startsWith('0')) {
            return hash;
        }
        block.nonce++;
    }
}

// Render documents in the grid
function renderDocuments() {
    const grid = document.getElementById('documentsGrid');
    if (!grid) return;
    
    const filteredDocs = getFilteredDocuments();
    
    if (filteredDocs.length === 0) {
        grid.innerHTML = '<div class="no-documents">No documents found</div>';
        return;
    }
    
    grid.innerHTML = filteredDocs.map(doc => `
        <div class="document-card" data-id="${doc.id}">
            <div class="document-header">
                <div class="document-icon">
                    <i class="fas fa-${getDocumentIcon(doc.type)}"></i>
                </div>
                <span class="document-status status-${doc.status}">${doc.status}</span>
            </div>
            <div class="document-title">${doc.name}</div>
            <div class="document-meta">
                <div>Size: ${doc.size}</div>
                <div>Uploaded: ${formatDate(doc.timestamp)}</div>
                <div>ID: ${doc.verificationId}</div>
            </div>
            <div class="document-actions">
                <button class="btn-primary btn-small" onclick="viewDocument('${doc.id}')">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="btn-secondary btn-small" onclick="shareDocument('${doc.id}')">
                    <i class="fas fa-share"></i> Share
                </button>
                <button class="btn-secondary btn-small" onclick="downloadVerification('${doc.id}')">
                    <i class="fas fa-download"></i> Proof
                </button>
            </div>
        </div>
    `).join('');
}

// Get document icon based on type
function getDocumentIcon(type) {
    const iconMap = {
        'document': 'file-alt',
        'image': 'image',
        'other': 'file'
    };
    return iconMap[type] || 'file';
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

// Get filtered documents based on search and category
function getFilteredDocuments() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('categoryFilter')?.value || '';
    
    return documents.filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(searchTerm) ||
                            doc.verificationId.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || doc.category === categoryFilter;
        
        return matchesSearch && matchesCategory;
    });
}

// Setup search and filter functionality
function setupSearchAndFilter() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(renderDocuments, 300));
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', renderDocuments);
    }
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Document actions
function viewDocument(id) {
    const doc = documents.find(d => d.id === id);
    if (doc) {
        showDocumentDetails(doc);
    }
}

function shareDocument(id) {
    const doc = documents.find(d => d.id === id);
    if (doc) {
        const shareUrl = `${window.location.origin}?verify=${doc.verificationId}`;
        copyToClipboard(shareUrl);
        showNotification('Document verification link copied to clipboard!', 'success');
    }
}

function downloadVerification(id) {
    const doc = documents.find(d => d.id === id);
    if (doc) {
        const block = blockchainData.find(b => b.data.id === id);
        const verificationData = {
            document: doc,
            blockchain: block,
            verification: {
                timestamp: new Date().toISOString(),
                verified: true,
                hash: doc.hash
            }
        };
        
        downloadJSON(verificationData, `verification-${doc.verificationId}.json`);
        showNotification('Verification proof downloaded!', 'success');
    }
}

// Show document details modal
function showDocumentDetails(doc) {
    const modal = createModal('Document Details', `
        <div class="document-details">
            <h3>${doc.name}</h3>
            <div class="detail-row">
                <strong>Verification ID:</strong> ${doc.verificationId}
            </div>
            <div class="detail-row">
                <strong>File Hash:</strong> ${doc.hash}
            </div>
            <div class="detail-row">
                <strong>Upload Date:</strong> ${formatDate(doc.timestamp)}
            </div>
            <div class="detail-row">
                <strong>File Size:</strong> ${doc.size}
            </div>
            <div class="detail-row">
                <strong>Status:</strong> <span class="status-${doc.status}">${doc.status}</span>
            </div>
            <div class="detail-row">
                <strong>Blockchain Block:</strong> #${doc.blockIndex}
            </div>
            <div class="blockchain-info">
                <h4>Blockchain Verification</h4>
                <p>This document is permanently recorded on the DocuChain blockchain and cannot be tampered with.</p>
            </div>
        </div>
    `);
    
    showModal(modal);
}

// Verification functionality
function setupVerification() {
    // Check URL for verification parameter
    const urlParams = new URLSearchParams(window.location.search);
    const verifyId = urlParams.get('verify');
    if (verifyId) {
        document.getElementById('verifyInput').value = verifyId;
        verifyDocument();
    }
}

// Verify document
function verifyDocument() {
    const input = document.getElementById('verifyInput');
    const resultDiv = document.getElementById('verifyResult');
    
    if (!input || !resultDiv) return;
    
    const verificationId = input.value.trim();
    if (!verificationId) {
        showVerificationResult('Please enter a verification ID', false);
        return;
    }
    
    // Show loading
    resultDiv.innerHTML = '<div class="loading"></div> Verifying document...';
    resultDiv.style.display = 'block';
    resultDiv.className = 'verify-result';
    
    // Simulate verification process
    setTimeout(() => {
        const doc = documents.find(d => d.verificationId === verificationId);
        if (doc) {
            const block = blockchainData.find(b => b.data.id === doc.id);
            showVerificationResult(`
                <h4>✅ Document Verified</h4>
                <p><strong>Document:</strong> ${doc.name}</p>
                <p><strong>Upload Date:</strong> ${formatDate(doc.timestamp)}</p>
                <p><strong>File Hash:</strong> ${doc.hash}</p>
                <p><strong>Blockchain Block:</strong> #${block.index}</p>
                <p><strong>Status:</strong> Authentic and unmodified</p>
            `, true);
        } else {
            showVerificationResult('❌ Document not found or invalid verification ID', false);
        }
    }, 2000);
}

// Show verification result
function showVerificationResult(message, success) {
    const resultDiv = document.getElementById('verifyResult');
    if (resultDiv) {
        resultDiv.innerHTML = message;
        resultDiv.className = `verify-result ${success ? 'success' : 'error'}`;
        resultDiv.style.display = 'block';
    }
}

// Modal functionality
function setupModals() {
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            hideModal(e.target);
        }
    });
    
    // Close modals when clicking close button
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('close')) {
            const modal = e.target.closest('.modal');
            if (modal) hideModal(modal);
        }
    });
}

// Show login modal
function showLogin() {
    const modal = document.getElementById('loginModal');
    if (modal) showModal(modal);
}

// Show register modal
function showRegister() {
    const modal = document.getElementById('registerModal');
    if (modal) showModal(modal);
}

// Show upload functionality
function showUpload() {
    const uploadSection = document.querySelector('.upload-section');
    if (uploadSection) {
        uploadSection.scrollIntoView({ behavior: 'smooth' });
        document.getElementById('fileInput')?.click();
    }
}

// Show verify functionality
function showVerify() {
    const verifySection = document.querySelector('.verification-section');
    if (verifySection) {
        verifySection.scrollIntoView({ behavior: 'smooth' });
        document.getElementById('verifyInput')?.focus();
    }
}

// Show modal
function showModal(modal) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Hide modal
function hideModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Create custom modal
function createModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>${title}</h2>
            ${content}
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

// Form handling
function setupForms() {
    // Login form
    const loginForm = document.querySelector('#loginModal form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Register form
    const registerForm = document.querySelector('#registerModal form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Contact form
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContact);
    }
}

// Handle login
function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email') || e.target.querySelector('input[type="email"]').value;
    const password = formData.get('password') || e.target.querySelector('input[type="password"]').value;
    
    // Simulate login
    if (email && password) {
        currentUser = { email, name: email.split('@')[0] };
        localStorage.setItem('docuchain_user', JSON.stringify(currentUser));
        updateUIForLoggedInUser();
        hideModal(document.getElementById('loginModal'));
        showNotification('Successfully logged in!', 'success');
    }
}

// Handle registration
function handleRegister(e) {
    e.preventDefault();
    const inputs = e.target.querySelectorAll('input');
    const name = inputs[0].value;
    const email = inputs[1].value;
    const password = inputs[2].value;
    const confirmPassword = inputs[3].value;
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    // Simulate registration
    currentUser = { email, name };
    localStorage.setItem('docuchain_user', JSON.stringify(currentUser));
    updateUIForLoggedInUser();
    hideModal(document.getElementById('registerModal'));
    showNotification('Account created successfully!', 'success');
}

// Handle contact form
function handleContact(e) {
    e.preventDefault();
    showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
    e.target.reset();
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
    const navButtons = document.querySelector('.nav-buttons');
    if (navButtons && currentUser) {
        navButtons.innerHTML = `
            <span>Welcome, ${currentUser.name}</span>
            <button class="btn-secondary" onclick="logout()">Logout</button>
        `;
    }
}

// Logout
function logout() {
    currentUser = null;
    localStorage.removeItem('docuchain_user');
    location.reload();
}

// Load sample documents
function loadSampleDocuments() {
    const sampleDocs = [
        {
            id: generateId(),
            name: 'University_Degree.pdf',
            type: 'document',
            category: 'academic',
            size: '2.4 MB',
            hash: generateHash('sample1'),
            verificationId: 'DC-UNIV2024A',
            timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
            status: 'verified',
            owner: 'john.doe@example.com',
            blockIndex: 1
        },
        {
            id: generateId(),
            name: 'Passport_Copy.jpg',
            type: 'image',
            category: 'identity',
            size: '1.8 MB',
            hash: generateHash('sample2'),
            verificationId: 'DC-PASS2024B',
            timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
            status: 'verified',
            owner: 'jane.smith@example.com',
            blockIndex: 2
        },
        {
            id: generateId(),
            name: 'Employment_Contract.pdf',
            type: 'document',
            category: 'legal',
            size: '856 KB',
            hash: generateHash('sample3'),
            verificationId: 'DC-EMPL2024C',
            timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
            status: 'verified',
            owner: 'mike.johnson@example.com',
            blockIndex: 3
        }
    ];
    
    documents = sampleDocs;
    
    // Add corresponding blockchain blocks
    sampleDocs.forEach(doc => {
        const block = createBlock(doc);
        if (blockchainData.length <= doc.blockIndex) {
            blockchainData.push(block);
        }
    });
    
    renderDocuments();
    updateStats();
}

// Update statistics
function updateStats() {
    const docsCount = document.getElementById('documentsCount');
    const verificationsCount = document.getElementById('verificationsCount');
    
    if (docsCount) {
        animateNumber(docsCount, documents.length + 1244);
    }
    
    if (verificationsCount) {
        animateNumber(verificationsCount, documents.length * 3 + 5829);
    }
}

// Animate numbers
function animateNumber(element, target) {
    const start = parseInt(element.textContent.replace(/,/g, '')) || 0;
    const increment = (target - start) / 100;
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current).toLocaleString();
    }, 20);
}

// Start stats animation
function startStatsAnimation() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                updateStats();
                observer.unobserve(entry.target);
            }
        });
    });
    
    const statsSection = document.querySelector('.hero-stats');
    if (statsSection) {
        observer.observe(statsSection);
    }
}

// Utility functions
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
    } else {
        // Fallback
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
}

function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        z-index: 3000;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
    
    // Manual close
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'info': 'info-circle',
        'warning': 'exclamation-triangle'
    };
    return icons[type] || 'info-circle';
}

function getNotificationColor(type) {
    const colors = {
        'success': '#10b981',
        'error': '#ef4444',
        'info': '#3b82f6',
        'warning': '#f59e0b'
    };
    return colors[type] || '#3b82f6';
}

// Add notification animations to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        margin-left: auto;
    }
`;
document.head.appendChild(style);