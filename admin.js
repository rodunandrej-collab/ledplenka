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

