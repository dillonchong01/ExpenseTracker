// Service Worker for PWA functionality and offline support

const CACHE_NAME = 'expense-tracker-v1.0.0';
const STATIC_CACHE = 'static-v1.0.0';
const DYNAMIC_CACHE = 'dynamic-v1.0.0';

// Static assets to cache
const staticAssets = [
    '/',
    '/static/css/style.css',
    '/static/js/app.js',
    '/static/js/charts.js',
    '/static/manifest.json',
    '/static/icons/icon-192.svg',
    '/static/icons/icon-512.svg',
    'https://cdn.replit.com/agent/bootstrap-agent-dark-theme.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js'
];

// API endpoints that should be cached
const apiEndpoints = [
    '/api/suggest-category',
    '/api/chart-data/'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Caching static assets...');
                return cache.addAll(staticAssets);
            })
            .then(() => {
                console.log('Static assets cached successfully');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Failed to cache static assets:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker activated successfully');
                return self.clients.claim();
            })
    );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Skip non-HTTP requests
    if (!request.url.startsWith('http')) {
        return;
    }
    
    // Skip Chrome extension requests
    if (request.url.includes('chrome-extension')) {
        return;
    }
    
    // Handle different types of requests
    if (isStaticAsset(request)) {
        // Cache first strategy for static assets
        event.respondWith(cacheFirst(request));
    } else if (isApiRequest(request)) {
        // Network first strategy for API requests
        event.respondWith(networkFirst(request));
    } else if (isPageRequest(request)) {
        // Stale while revalidate for pages
        event.respondWith(staleWhileRevalidate(request));
    } else {
        // Default to network first
        event.respondWith(networkFirst(request));
    }
});

// Cache first strategy - good for static assets
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('Cache first strategy failed:', error);
        return new Response('Offline content not available', { 
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Network first strategy - good for API requests
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('Network failed, trying cache:', error);
        
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline fallback for specific requests
        if (isApiRequest(request)) {
            return new Response(JSON.stringify({
                error: 'Offline',
                message: 'This feature requires an internet connection'
            }), {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        return new Response('You are offline', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Stale while revalidate strategy - good for pages
async function staleWhileRevalidate(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch(error => {
        console.error('Network request failed:', error);
        return cachedResponse;
    });
    
    return cachedResponse || fetchPromise;
}

// Helper functions to identify request types
function isStaticAsset(request) {
    const url = new URL(request.url);
    return (
        url.pathname.includes('/static/') ||
        url.pathname.includes('/icons/') ||
        url.hostname.includes('cdn.') ||
        url.hostname.includes('cdnjs.') ||
        request.destination === 'style' ||
        request.destination === 'script' ||
        request.destination === 'font'
    );
}

function isApiRequest(request) {
    const url = new URL(request.url);
    return url.pathname.startsWith('/api/');
}

function isPageRequest(request) {
    return (
        request.method === 'GET' &&
        request.headers.get('accept')?.includes('text/html')
    );
}

// Background sync for offline expense submissions
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync-expenses') {
        console.log('Background sync triggered for expenses');
        event.waitUntil(syncOfflineExpenses());
    }
});

// Sync offline expenses when connection is restored
async function syncOfflineExpenses() {
    try {
        // This would typically involve:
        // 1. Reading offline expenses from IndexedDB
        // 2. Sending them to the server
        // 3. Clearing the offline storage
        console.log('Syncing offline expenses...');
        
        // For this implementation, we'll just log since we're using in-memory storage
        console.log('Offline sync completed');
    } catch (error) {
        console.error('Failed to sync offline expenses:', error);
    }
}

// Handle push notifications (for future enhancement)
self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();
        
        const options = {
            body: data.body || 'You have a new notification',
            icon: '/static/icons/icon-192.svg',
            badge: '/static/icons/icon-192.svg',
            vibrate: [200, 100, 200],
            tag: 'expense-notification',
            actions: [
                {
                    action: 'view',
                    title: 'View',
                    icon: '/static/icons/icon-192.svg'
                },
                {
                    action: 'dismiss',
                    title: 'Dismiss'
                }
            ]
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title || 'Expense Tracker', options)
        );
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Message handling for communication with main app
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
