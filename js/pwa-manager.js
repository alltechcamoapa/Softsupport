/**
 * ============================================
 * ALLTECH SUPPORT - PWA Manager
 * Handles PWA installation, updates, and native-like features
 * Following reglas-desarrollo.md architecture patterns
 * ============================================
 */

const PWAManager = (function () {
    'use strict';

    // Private state
    let _deferredPrompt = null;
    let _isInstalled = false;
    let _isUpdateAvailable = false;
    let _swRegistration = null;

    // ===== INITIALIZATION =====

    async function init() {
        console.log('📱 PWAManager: Initializing...');

        // Check if already installed
        _isInstalled = checkIfInstalled();

        // Register Service Worker
        await registerServiceWorker();

        // Setup install prompt handler
        setupInstallPrompt();

        // Setup iOS specific handling
        setupIOSHandling();

        // Setup app-like behavior
        setupAppBehavior();

        // Setup network status monitoring
        setupNetworkMonitoring();

        // Setup viewport for full screen
        setupViewport();

        console.log('✅ PWAManager: Initialized', { installed: _isInstalled });

        return { isInstalled: _isInstalled };
    }

    // ===== SERVICE WORKER =====

    async function registerServiceWorker() {
        if (!('serviceWorker' in navigator)) {
            console.warn('⚠️ PWAManager: Service Worker not supported');
            return;
        }

        try {
            _swRegistration = await navigator.serviceWorker.register('/service-worker.js', {
                scope: '/'
            });

            console.log('✅ PWAManager: Service Worker registered', _swRegistration);

            // Check for updates
            _swRegistration.addEventListener('updatefound', () => {
                const newWorker = _swRegistration.installing;

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        _isUpdateAvailable = true;
                        showUpdateNotification();
                    }
                });
            });

            // Handle controller change (new service worker active)
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('🔄 PWAManager: New service worker active');
            });

        } catch (error) {
            console.error('❌ PWAManager: Service Worker registration failed:', error);
        }
    }

    // ===== INSTALL HANDLING =====

    function setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (event) => {
            console.log('📲 PWAManager: Install prompt available');

            // Prevent default mini-infobar
            event.preventDefault();

            // Store event for later
            _deferredPrompt = event;

            // Show custom install UI if not installed
            if (!_isInstalled) {
                showInstallBanner();
            }
        });

        // Track when app is installed
        window.addEventListener('appinstalled', () => {
            console.log('✅ PWAManager: App installed!');
            _isInstalled = true;
            _deferredPrompt = null;
            hideInstallBanner();

            // Optionally show celebration
            showInstallSuccess();
        });
    }

    function checkIfInstalled() {
        // Check display mode
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return true;
        }

        // Check iOS standalone
        if (window.navigator.standalone === true) {
            return true;
        }

        // Check if running from installed shortcut
        if (document.referrer.includes('android-app://')) {
            return true;
        }

        return false;
    }

    async function promptInstall() {
        if (!_deferredPrompt) {
            console.warn('⚠️ PWAManager: No install prompt available');
            return false;
        }

        // Show browser's install prompt
        _deferredPrompt.prompt();

        // Wait for user choice
        const { outcome } = await _deferredPrompt.userChoice;

        console.log('📲 PWAManager: Install outcome:', outcome);

        _deferredPrompt = null;

        return outcome === 'accepted';
    }

    // ===== iOS SPECIFIC =====

    function setupIOSHandling() {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

        if (isIOS && !_isInstalled) {
            // Show iOS install instructions after a delay
            setTimeout(() => {
                showIOSInstallInstructions();
            }, 3000);
        }

        // Handle iOS notch and home indicator
        if (isIOS) {
            document.body.classList.add('is-ios');
        }
    }

    function showIOSInstallInstructions() {
        const banner = document.createElement('div');
        banner.id = 'iosInstallBanner';
        banner.className = 'pwa-ios-banner';
        banner.innerHTML = `
      <div class="pwa-ios-banner__content">
        <div class="pwa-ios-banner__icon">📲</div>
        <div class="pwa-ios-banner__text">
          <strong>Instala ALLTECH</strong>
          <span>Toca <strong>Compartir</strong> y luego <strong>"Agregar a Inicio"</strong></span>
        </div>
        <button class="pwa-ios-banner__close" onclick="PWAManager.hideIOSBanner()">✕</button>
      </div>
    `;
        document.body.appendChild(banner);

        // Auto-hide after 10 seconds
        setTimeout(() => {
            hideIOSBanner();
        }, 10000);
    }

    function hideIOSBanner() {
        const banner = document.getElementById('iosInstallBanner');
        if (banner) {
            banner.classList.add('pwa-ios-banner--hidden');
            setTimeout(() => banner.remove(), 300);
        }
    }

    // ===== APP-LIKE BEHAVIOR =====

    function setupAppBehavior() {
        // Prevent pull-to-refresh on mobile (can be annoying in app mode)
        document.body.style.overscrollBehavior = 'contain';

        // Prevent context menu on long press (app-like)
        document.addEventListener('contextmenu', (e) => {
            if (_isInstalled) {
                e.preventDefault();
            }
        });

        // Handle back button for app navigation
        setupBackButtonHandling();

        // Handle wake lock to keep screen on during active use
        setupWakeLock();

        // Smooth scrolling
        document.documentElement.style.scrollBehavior = 'smooth';

        // Disable text selection on UI elements (app-like)
        if (_isInstalled) {
            document.body.classList.add('pwa-installed');
        }
    }

    function setupBackButtonHandling() {
        // Track navigation history for back button
        window.addEventListener('popstate', (event) => {
            // Custom back navigation logic can go here
            console.log('🔙 PWAManager: Back button pressed');
        });

        // Prevent accidental back navigation
        if (_isInstalled) {
            history.pushState(null, '', location.href);
            window.addEventListener('popstate', () => {
                history.pushState(null, '', location.href);
            });
        }
    }

    async function setupWakeLock() {
        if (!('wakeLock' in navigator)) {
            return;
        }

        let wakeLock = null;

        const requestWakeLock = async () => {
            try {
                wakeLock = await navigator.wakeLock.request('screen');
                console.log('🔒 PWAManager: Wake lock acquired');

                wakeLock.addEventListener('release', () => {
                    console.log('🔓 PWAManager: Wake lock released');
                });
            } catch (err) {
                console.warn('⚠️ PWAManager: Wake lock failed:', err);
            }
        };

        // Request on visibility change
        document.addEventListener('visibilitychange', () => {
            if (wakeLock !== null && document.visibilityState === 'visible') {
                requestWakeLock();
            }
        });
    }

    // ===== VIEWPORT SETUP =====

    function setupViewport() {
        // Ensure viewport covers full screen including notches
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
        }

        // Set theme color based on current theme
        updateThemeColor();

        // Listen for theme changes
        const themeObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'data-theme') {
                    updateThemeColor();
                }
            });
        });

        themeObserver.observe(document.documentElement, { attributes: true });
    }

    function updateThemeColor() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const color = isDark ? '#0d1117' : '#1a73e8';

        let themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (!themeColorMeta) {
            themeColorMeta = document.createElement('meta');
            themeColorMeta.name = 'theme-color';
            document.head.appendChild(themeColorMeta);
        }
        themeColorMeta.content = color;
    }

    // ===== NETWORK MONITORING =====

    function setupNetworkMonitoring() {
        const updateOnlineStatus = () => {
            const isOnline = navigator.onLine;
            document.body.classList.toggle('is-offline', !isOnline);

            if (!isOnline) {
                showOfflineIndicator();
            } else {
                hideOfflineIndicator();
            }
        };

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);

        // Initial check
        updateOnlineStatus();
    }

    function showOfflineIndicator() {
        if (document.getElementById('offlineIndicator')) return;

        const indicator = document.createElement('div');
        indicator.id = 'offlineIndicator';
        indicator.className = 'pwa-offline-indicator';
        indicator.innerHTML = `
      <span class="pwa-offline-indicator__icon">📴</span>
      <span class="pwa-offline-indicator__text">Sin conexión</span>
    `;
        document.body.appendChild(indicator);
    }

    function hideOfflineIndicator() {
        const indicator = document.getElementById('offlineIndicator');
        if (indicator) {
            indicator.classList.add('pwa-offline-indicator--hidden');
            setTimeout(() => indicator.remove(), 300);
        }
    }

    // ===== UI NOTIFICATIONS =====

    function showInstallBanner() {
        if (document.getElementById('pwaInstallBanner')) return;

        const banner = document.createElement('div');
        banner.id = 'pwaInstallBanner';
        banner.className = 'pwa-install-banner';
        banner.innerHTML = `
      <div class="pwa-install-banner__content">
        <img src="assets/logo.png" alt="ALLTECH" class="pwa-install-banner__logo">
        <div class="pwa-install-banner__text">
          <strong>ALLTECH Soporte</strong>
          <span>Instala la app para mejor experiencia</span>
        </div>
      </div>
      <div class="pwa-install-banner__actions">
        <button class="pwa-install-banner__dismiss" onclick="PWAManager.hideInstallBanner()">Ahora no</button>
        <button class="pwa-install-banner__install" onclick="PWAManager.promptInstall()">Instalar</button>
      </div>
    `;
        document.body.appendChild(banner);

        // Animate in
        requestAnimationFrame(() => {
            banner.classList.add('pwa-install-banner--visible');
        });
    }

    function hideInstallBanner() {
        const banner = document.getElementById('pwaInstallBanner');
        if (banner) {
            banner.classList.remove('pwa-install-banner--visible');
            setTimeout(() => banner.remove(), 300);
        }
    }

    function showUpdateNotification() {
        const notification = document.createElement('div');
        notification.id = 'pwaUpdateNotification';
        notification.className = 'pwa-update-notification';
        notification.innerHTML = `
      <div class="pwa-update-notification__content">
        <span class="pwa-update-notification__icon">🔄</span>
        <span class="pwa-update-notification__text">Nueva versión disponible</span>
      </div>
      <button class="pwa-update-notification__button" onclick="PWAManager.applyUpdate()">
        Actualizar
      </button>
    `;
        document.body.appendChild(notification);

        requestAnimationFrame(() => {
            notification.classList.add('pwa-update-notification--visible');
        });
    }

    function showInstallSuccess() {
        const toast = document.createElement('div');
        toast.className = 'pwa-toast pwa-toast--success';
        toast.innerHTML = `
      <span class="pwa-toast__icon">🎉</span>
      <span class="pwa-toast__text">¡ALLTECH instalado correctamente!</span>
    `;
        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add('pwa-toast--visible');
        });

        setTimeout(() => {
            toast.classList.remove('pwa-toast--visible');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    function applyUpdate() {
        if (_swRegistration?.waiting) {
            _swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        window.location.reload();
    }

    // ===== PUBLIC API =====

    return {
        init,
        promptInstall,
        applyUpdate,
        hideInstallBanner,
        hideIOSBanner,

        // Getters
        get isInstalled() { return _isInstalled; },
        get isUpdateAvailable() { return _isUpdateAvailable; },
        get canInstall() { return _deferredPrompt !== null; }
    };

})();

// Auto-initialize when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PWAManager.init());
} else {
    PWAManager.init();
}
