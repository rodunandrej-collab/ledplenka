// API base URL
const API_BASE = '';

// Admin credentials (demo)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

// Check if user is logged in
function checkAuth() {
    const isAuthenticated = sessionStorage.getItem('adminAuth') === 'true';
    if (isAuthenticated) {
        showAdminPanel();
    } else {
        showLoginScreen();
    }
}

// Show login screen
function showLoginScreen() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('adminPanel').classList.add('hidden');
}

// Show admin panel
function showAdminPanel() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('adminPanel').classList.remove('hidden');
    loadOrders();
    updateStats();
    setupTabs();
    loadVideos();
}

// Login form handler
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            sessionStorage.setItem('adminAuth', 'true');
            showAdminPanel();
        } else {
            alert('Неверный логин или пароль');
        }
    })
    .catch(error => {
        console.error('Login error:', error);
        alert('Ошибка подключения к серверу');
    });
});

// Logout
function logout() {
    sessionStorage.removeItem('adminAuth');
    showLoginScreen();
}

// Tabs functionality
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            btn.classList.add('active');
            document.getElementById(targetTab + 'Tab').classList.add('active');
        });
    });
}

// Video management
const VIDEO_CONFIG = {
    hero: [
        { id: 'hero-1', title: 'Hero видео 1', location: 'Hero секция - левое видео', selector: '.film-strip-1 video source' },
        { id: 'hero-2', title: 'Hero видео 2', location: 'Hero секция - среднее видео', selector: '.film-strip-2 video source' },
        { id: 'hero-3', title: 'Hero видео 3', location: 'Hero секция - правое видео', selector: '.film-strip-3 video source' }
    ],
    technology: [
        { id: 'tech-1', title: 'Технология видео 1', location: 'Technology секция - карточка 1', selector: '.feature-img-1 video source' },
        { id: 'tech-2', title: 'Технология видео 2', location: 'Technology секция - карточка 2', selector: '.feature-img-2 video source' },
        { id: 'tech-3', title: 'Технология видео 3', location: 'Technology секция - карточка 3', selector: '.feature-img-3 video source' }
    ],
    principle: [
        { id: 'principle-1', title: 'Принцип работы видео 1', location: 'Principle секция - карточка 1', selector: '.feature-1 .principle-img video source' },
        { id: 'principle-2', title: 'Принцип работы видео 2', location: 'Principle секция - карточка 2', selector: '.feature-2 .principle-img video source' },
        { id: 'principle-3', title: 'Принцип работы видео 3', location: 'Principle секция - карточка 3', selector: '.feature-3 .principle-img video source' }
    ],
    exploded: [
        { id: 'exploded-1', title: 'Exploded View видео', location: 'Exploded View секция - центральное видео', selector: '.layer-bottom video source' }
    ]
};

async function loadVideos() {
    try {
        const response = await fetch(`${API_BASE}/api/videos`);
        const result = await response.json();
        
        if (result.success) {
            displayVideos(result.data || {});
        } else {
            // Use default config if no saved data
            displayVideos({});
        }
    } catch (error) {
        console.error('Error loading videos:', error);
        displayVideos({});
    }
}

function displayVideos(savedVideos) {
    const videosGrid = document.getElementById('videosGrid');
    videosGrid.innerHTML = '';
    
    // Flatten all video configs
    const allVideos = [
        ...VIDEO_CONFIG.hero,
        ...VIDEO_CONFIG.technology,
        ...VIDEO_CONFIG.principle,
        ...VIDEO_CONFIG.exploded
    ];
    
    allVideos.forEach(videoConfig => {
        const savedVideo = savedVideos[videoConfig.id] || {};
        const currentPath = savedVideo.path || getCurrentVideoPath(videoConfig.selector);
        
        const videoCard = document.createElement('div');
        videoCard.className = 'video-card';
        videoCard.innerHTML = `
            <div class="video-card-header">
                <div>
                    <div class="video-card-title">${videoConfig.title}</div>
                    <div class="video-card-location">${videoConfig.location}</div>
                </div>
            </div>
            <div class="video-preview-container">
                <video autoplay loop muted playsinline>
                    <source src="${currentPath}" type="video/mp4">
                </video>
            </div>
            <div class="video-input-group">
                <label>Путь к видео (например: images/video.mp4)</label>
                <input type="text" class="video-path-input" data-video-id="${videoConfig.id}" 
                       value="${currentPath}" placeholder="images/video.mp4">
            </div>
            <div class="video-input-group">
                <label>Или загрузите новый файл</label>
                <input type="file" class="video-file-input" data-video-id="${videoConfig.id}" 
                       accept="video/mp4,video/webm,video/ogg">
            </div>
            <div class="video-actions">
                <button class="btn-save-video" data-video-id="${videoConfig.id}" 
                        data-selector="${videoConfig.selector}">Сохранить</button>
            </div>
        `;
        
        videosGrid.appendChild(videoCard);
    });
    
    // Setup event listeners
    setupVideoListeners();
}

function getCurrentVideoPath(selector) {
    // Default paths based on selector
    const defaultPaths = {
        '.film-strip-1 video source': 'images/IMG_4643.MP4',
        '.film-strip-2 video source': 'images/IMG_4644.MP4',
        '.film-strip-3 video source': 'images/IMG_4645.MP4',
        '.feature-img-1 video source': 'images/IMG_4643.MP4',
        '.feature-img-2 video source': 'images/IMG_4644.MP4',
        '.feature-img-3 video source': 'images/IMG_4645.MP4',
        '.feature-1 .principle-img video source': 'images/IMG_4651.MP4',
        '.feature-2 .principle-img video source': 'images/IMG_4647.MP4',
        '.feature-3 .principle-img video source': 'images/IMG_4650.MP4',
        '.layer-bottom video source': 'images/IMG_4651.MP4'
    };
    
    return defaultPaths[selector] || 'images/IMG_4643.MP4';
}

function setupVideoListeners() {
    // File input change
    document.querySelectorAll('.video-file-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const videoId = e.target.getAttribute('data-video-id');
                uploadVideoFile(videoId, file);
            }
        });
    });
    
    // Save button click
    document.querySelectorAll('.btn-save-video').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const videoId = btn.getAttribute('data-video-id');
            const selector = btn.getAttribute('data-selector');
            const pathInput = document.querySelector(`.video-path-input[data-video-id="${videoId}"]`);
            const newPath = pathInput.value.trim();
            
            if (!newPath) {
                alert('Укажите путь к видео');
                return;
            }
            
            btn.disabled = true;
            btn.textContent = 'Сохранение...';
            
            try {
                const response = await fetch(`${API_BASE}/api/videos/${videoId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        path: newPath,
                        selector: selector
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('Видео успешно обновлено!');
                    loadVideos(); // Reload to show updated video
                } else {
                    alert('Ошибка: ' + result.error);
                }
            } catch (error) {
                console.error('Error saving video:', error);
                alert('Ошибка при сохранении видео');
            } finally {
                btn.disabled = false;
                btn.textContent = 'Сохранить';
            }
        });
    });
}

async function uploadVideoFile(videoId, file) {
    const formData = new FormData();
    formData.append('video', file);
    formData.append('videoId', videoId);
    
    const pathInput = document.querySelector(`.video-path-input[data-video-id="${videoId}"]`);
    const saveBtn = document.querySelector(`.btn-save-video[data-video-id="${videoId}"]`);
    
    saveBtn.disabled = true;
    saveBtn.textContent = 'Загрузка...';
    
    try {
        const response = await fetch(`${API_BASE}/api/videos/upload`, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            pathInput.value = result.path;
            alert('Видео успешно загружено! Теперь нажмите "Сохранить" для применения.');
        } else {
            alert('Ошибка загрузки: ' + result.error);
        }
    } catch (error) {
        console.error('Error uploading video:', error);
        alert('Ошибка при загрузке видео');
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Сохранить';
    }
}

// Load orders from server
function loadOrders(filter = 'all') {
    fetch(`${API_BASE}/api/orders`)
        .then(response => response.json())
        .then(result => {
            if (!result.success) {
                throw new Error(result.error || 'Failed to load orders');
            }
            
            let orders = result.data;
            
            // Filter orders
            if (filter !== 'all') {
                orders = orders.filter(order => order.status === filter);
            }
            
            // Sort by date (newest first)
            orders.sort((a, b) => b.timestamp - a.timestamp);
            
            const tbody = document.getElementById('ordersTableBody');
            
            if (orders.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" class="no-orders">Заказов пока нет</td></tr>';
                return;
            }
            
            tbody.innerHTML = orders.map(order => `
                <tr>
                    <td>#${order.id}</td>
                    <td>${order.name}</td>
                    <td><a href="tel:${order.phone}">${order.phone}</a></td>
                    <td><a href="mailto:${order.email}">${order.email}</a></td>
                    <td>${order.area}</td>
                    <td>${formatDate(order.date)}</td>
                    <td>
                        <select class="status-select" data-order-id="${order.id}" onchange="updateOrderStatus(${order.id}, this.value)">
                            <option value="new" ${order.status === 'new' ? 'selected' : ''}>Новый</option>
                            <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>В обработке</option>
                            <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Завершено</option>
                        </select>
                    </td>
                    <td class="actions-cell">
                        <button class="btn-action btn-delete" onclick="deleteOrder(${order.id})">Удалить</button>
                    </td>
                </tr>
            `).join('');
        })
        .catch(error => {
            console.error('Error loading orders:', error);
            const tbody = document.getElementById('ordersTableBody');
            tbody.innerHTML = '<tr><td colspan="8" class="no-orders">Ошибка загрузки заказов</td></tr>';
        });
}

// Update order status
function updateOrderStatus(orderId, newStatus) {
    fetch(`${API_BASE}/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            // Reload orders with current filter
            const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
            loadOrders(activeFilter);
            updateStats();
            showNotification('Статус заказа обновлен');
        } else {
            showNotification('Ошибка обновления статуса');
        }
    })
    .catch(error => {
        console.error('Error updating order:', error);
        showNotification('Ошибка обновления статуса');
    });
}

// Delete order
function deleteOrder(orderId) {
    if (!confirm('Вы уверены, что хотите удалить этот заказ?')) {
        return;
    }
    
    fetch(`${API_BASE}/api/orders/${orderId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
            loadOrders(activeFilter);
            updateStats();
            showNotification('Заказ удален');
        } else {
            showNotification('Ошибка удаления заказа');
        }
    })
    .catch(error => {
        console.error('Error deleting order:', error);
        showNotification('Ошибка удаления заказа');
    });
}

// Update statistics
function updateStats() {
    fetch(`${API_BASE}/api/stats`)
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                const stats = result.data;
                document.getElementById('totalOrders').textContent = stats.total;
                document.getElementById('newOrders').textContent = stats.new;
                document.getElementById('pendingOrders').textContent = stats.processing;
                document.getElementById('completedOrders').textContent = stats.completed;
            }
        })
        .catch(error => {
            console.error('Error loading stats:', error);
        });
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const filter = this.dataset.filter;
        loadOrders(filter);
    });
});

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--card-bg);
        color: var(--white);
        padding: 1rem 2rem;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize
checkAuth();

