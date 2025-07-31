// Progressive Web App functionality and general app logic

// Service Worker registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/static/sw.js')
            .then(registration => {
                console.log('Service Worker registered successfully:', registration.scope);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    });
}

// App installation prompt
let deferredPrompt;
const installButton = document.createElement('button');
installButton.className = 'btn btn-outline-primary btn-sm';
installButton.innerHTML = '<i class="fas fa-download me-1"></i>Install App';
installButton.style.display = 'none';

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install button in navbar
    const navbar = document.querySelector('.navbar-nav');
    if (navbar) {
        const li = document.createElement('li');
        li.className = 'nav-item';
        li.appendChild(installButton);
        navbar.appendChild(li);
        installButton.style.display = 'block';
    }
});

installButton.addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        deferredPrompt = null;
        installButton.style.display = 'none';
    }
});

// Handle app installation
window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    installButton.style.display = 'none';
});

// Utility functions
const ExpenseTracker = {
    // Format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    // Format date
    formatDate(date) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(new Date(date));
    },

    // Show loading state
    showLoading(element) {
        element.classList.add('loading');
        element.disabled = true;
    },

    // Hide loading state
    hideLoading(element) {
        element.classList.remove('loading');
        element.disabled = false;
    },

    // Show toast notification
    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container') || this.createToastContainer();
        
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : type} border-0`;
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        // Remove toast element after it's hidden
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    },

    // Create toast container if it doesn't exist
    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        container.style.zIndex = '1100';
        document.body.appendChild(container);
        return container;
    },

    // Vibration feedback for mobile
    vibrate(pattern = [100]) {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    },

    // Local storage helpers
    storage: {
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                console.error('Failed to save to localStorage:', e);
                return false;
            }
        },

        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                console.error('Failed to read from localStorage:', e);
                return defaultValue;
            }
        },

        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (e) {
                console.error('Failed to remove from localStorage:', e);
                return false;
            }
        }
    },

    // Network status
    online: navigator.onLine,

    // Initialize offline handling
    initOfflineHandling() {
        window.addEventListener('online', () => {
            this.online = true;
            this.showToast('Connection restored', 'success');
        });

        window.addEventListener('offline', () => {
            this.online = false;
            this.showToast('You are offline. Some features may not work.', 'warning');
        });
    },

    // Form validation helpers
    validateAmount(amount) {
        const num = parseFloat(amount);
        return !isNaN(num) && num > 0 && num < 1000000;
    },

    validateDescription(description) {
        return description && description.trim().length >= 2 && description.trim().length <= 200;
    },

    // Keyboard shortcuts
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only trigger shortcuts when not in an input field
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
                return;
            }

            // Shortcuts
            switch (e.key) {
                case 'a':
                case 'A':
                    if (!e.ctrlKey && !e.metaKey) {
                        e.preventDefault();
                        window.location.href = '/add';
                    }
                    break;
                case 'h':
                case 'H':
                    if (!e.ctrlKey && !e.metaKey) {
                        e.preventDefault();
                        window.location.href = '/';
                    }
                    break;
                case 'e':
                case 'E':
                    if (!e.ctrlKey && !e.metaKey) {
                        e.preventDefault();
                        window.location.href = '/expenses';
                    }
                    break;
                case 's':
                case 'S':
                    if (!e.ctrlKey && !e.metaKey) {
                        e.preventDefault();
                        window.location.href = '/summary';
                    }
                    break;
                case '?':
                    e.preventDefault();
                    this.showKeyboardShortcuts();
                    break;
            }
        });
    },

    // Show keyboard shortcuts help
    showKeyboardShortcuts() {
        const shortcuts = [
            { key: 'A', description: 'Add new expense' },
            { key: 'H', description: 'Go to home' },
            { key: 'E', description: 'View all expenses' },
            { key: 'S', description: 'View summary' },
            { key: '?', description: 'Show this help' }
        ];

        const shortcutsList = shortcuts.map(s => 
            `<div class="d-flex justify-content-between">
                <kbd class="me-3">${s.key}</kbd>
                <span>${s.description}</span>
            </div>`
        ).join('');

        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-keyboard me-2"></i>Keyboard Shortcuts
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="d-grid gap-2">
                            ${shortcutsList}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();

        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    }
};

// Initialize app features when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    ExpenseTracker.initOfflineHandling();
    ExpenseTracker.initKeyboardShortcuts();

    // Auto-focus on first input field
    const firstInput = document.querySelector('input[type="text"], input[type="number"]');
    if (firstInput && !firstInput.value) {
        firstInput.focus();
    }

    // Enhanced form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            const amountInput = form.querySelector('input[name="amount"]');
            const descriptionInput = form.querySelector('input[name="description"]');

            if (amountInput && !ExpenseTracker.validateAmount(amountInput.value)) {
                e.preventDefault();
                ExpenseTracker.showToast('Please enter a valid amount between $0.01 and $999,999.99', 'error');
                amountInput.focus();
                return;
            }

            if (descriptionInput && !ExpenseTracker.validateDescription(descriptionInput.value)) {
                e.preventDefault();
                ExpenseTracker.showToast('Description must be between 2 and 200 characters', 'error');
                descriptionInput.focus();
                return;
            }
        });
    });

    // Auto-format amount inputs
    const amountInputs = document.querySelectorAll('input[name="amount"]');
    amountInputs.forEach(input => {
        input.addEventListener('blur', () => {
            if (input.value) {
                const value = parseFloat(input.value);
                if (!isNaN(value)) {
                    input.value = value.toFixed(2);
                }
            }
        });
    });

    // Add haptic feedback to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            ExpenseTracker.vibrate([10]);
        });
    });
});

// Make ExpenseTracker globally available
window.ExpenseTracker = ExpenseTracker;
