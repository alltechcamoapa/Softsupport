/**
 * ALLTECH SUPPORT - Notification Service
 * Sistema de notificaciones dinámicas y alertas
 */

const NotificationService = (() => {
    // ========== STATE ==========
    let notifications = [];
    let unreadCount = 0;

    // ========== INITIALIZATION ==========
    const init = () => {
        console.log('🔔 NotificationService: Inicializando...');
        generateNotifications();
        updateBadge();
    };

    // ========== GENERATE DYNAMIC NOTIFICATIONS ==========
    const generateNotifications = () => {
        notifications = [];
        const now = new Date();

        // 1. Contratos por vencer (próximos 15 días)
        const contratos = DataService.getContratosSync();
        contratos.forEach(contrato => {
            if (contrato.fechaFin) {
                const fechaFin = new Date(contrato.fechaFin);
                const diasRestantes = Math.ceil((fechaFin - now) / (1000 * 60 * 60 * 24));

                if (diasRestantes > 0 && diasRestantes <= 15) {
                    const cliente = DataService.getClienteById(contrato.clienteId);
                    notifications.push({
                        id: `contract-${contrato.contratoId || contrato.id}`,
                        type: diasRestantes <= 5 ? 'danger' : 'warning',
                        icon: 'alertCircle',
                        title: `Contrato por vencer`,
                        message: `${cliente?.empresa || 'Cliente'} - ${diasRestantes} días restantes`,
                        time: 'Vence ' + fechaFin.toLocaleDateString('es-NI'),
                        action: () => App.navigate('contratos'),
                        unread: true
                    });
                }
            }
        });

        // 2. Visitas programadas para hoy o mañana
        const visitas = DataService.getVisitasSync();
        visitas.forEach(visita => {
            if (visita.fechaInicio && !visita.trabajoRealizado) {
                const fechaVisita = new Date(visita.fechaInicio);
                const diasHastaVisita = Math.ceil((fechaVisita - now) / (1000 * 60 * 60 * 24));

                if (diasHastaVisita >= 0 && diasHastaVisita <= 1) {
                    const cliente = DataService.getClienteById(visita.clienteId);
                    notifications.push({
                        id: `visit-${visita.visitaId || visita.id}`,
                        type: diasHastaVisita === 0 ? 'danger' : 'info',
                        icon: 'calendar',
                        title: diasHastaVisita === 0 ? 'Visita HOY' : 'Visita mañana',
                        message: `${cliente?.empresa || 'Cliente'} - ${visita.tipoVisita || 'Mantenimiento'}`,
                        time: fechaVisita.toLocaleTimeString('es-NI', { hour: '2-digit', minute: '2-digit' }),
                        action: () => App.navigate('visitas'),
                        unread: true
                    });
                }
            }
        });

        // 3. Proformas activas pendientes de aprobación
        const proformas = DataService.getProformasSync();
        const proformasActivas = proformas.filter(p => p.estado === 'Activa');
        if (proformasActivas.length > 0) {
            notifications.push({
                id: 'proformas-pending',
                type: 'info',
                icon: 'fileText',
                title: 'Proformas pendientes',
                message: `${proformasActivas.length} proforma(s) esperando aprobación`,
                time: 'Revisar',
                action: () => App.navigate('proformas'),
                unread: false
            });
        }

        // 4. Equipos en estado de reparación
        const equipos = DataService.getEquiposSync();
        const equiposReparacion = equipos.filter(e => e.estado === 'En Reparación' || e.estado === 'Mantenimiento');
        if (equiposReparacion.length > 0) {
            notifications.push({
                id: 'equipos-repair',
                type: 'warning',
                icon: 'monitor',
                title: 'Equipos en reparación',
                message: `${equiposReparacion.length} equipo(s) requieren atención`,
                time: 'Ver lista',
                action: () => App.navigate('equipos'),
                unread: false
            });
        }

        // Calcular no leídas
        unreadCount = notifications.filter(n => n.unread).length;

        // Ordenar por prioridad (danger > warning > info)
        const priority = { danger: 0, warning: 1, info: 2 };
        notifications.sort((a, b) => priority[a.type] - priority[b.type]);

        console.log(`🔔 NotificationService: ${notifications.length} notificaciones generadas (${unreadCount} no leídas)`);
    };

    // ========== UPDATE BADGE ==========
    const updateBadge = () => {
        const badge = document.querySelector('#notificationsBtn .badge');
        if (badge) {
            if (unreadCount > 0) {
                badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    };

    // ========== RENDER NOTIFICATIONS LIST ==========
    const renderList = () => {
        if (notifications.length === 0) {
            return `
                <div class="notification-empty" style="padding: var(--spacing-lg); text-align: center; color: var(--text-muted);">
                    <div style="font-size: 24px; margin-bottom: var(--spacing-sm);">🎉</div>
                    <div>¡Todo al día!</div>
                    <div style="font-size: var(--font-size-xs);">No hay notificaciones pendientes</div>
                </div>
            `;
        }

        return notifications.map((n, index) => `
            <div class="notification-item ${n.unread ? 'unread' : ''} animate-fadeInRight stagger-${Math.min(index + 1, 8)}" 
                 onclick="NotificationService.handleClick('${n.id}')" 
                 style="cursor: pointer;">
                <div class="notification-icon ${n.type}">${Icons[n.icon] || Icons.bell}</div>
                <div class="notification-content">
                    <div class="notification-title">${n.title}</div>
                    <div class="notification-message" style="font-size: var(--font-size-xs); color: var(--text-secondary); margin-top: 2px;">${n.message}</div>
                    <div class="notification-time">${n.time}</div>
                </div>
            </div>
        `).join('');
    };

    // ========== HANDLE NOTIFICATION CLICK ==========
    const handleClick = (id) => {
        const notification = notifications.find(n => n.id === id);
        if (notification) {
            // Marcar como leída
            notification.unread = false;
            unreadCount = notifications.filter(n => n.unread).length;
            updateBadge();

            // Cerrar dropdown
            const dropdown = document.getElementById('notificationsDropdown');
            if (dropdown) dropdown.classList.remove('show');

            // Ejecutar acción
            if (notification.action) {
                notification.action();
            }
        }
    };

    // ========== MARK ALL AS READ ==========
    const markAllAsRead = () => {
        notifications.forEach(n => n.unread = false);
        unreadCount = 0;
        updateBadge();

        // Re-render list
        const list = document.querySelector('.notification-list');
        if (list) {
            list.innerHTML = renderList();
        }
    };

    // ========== REFRESH NOTIFICATIONS ==========
    const refresh = () => {
        generateNotifications();
        updateBadge();

        const list = document.querySelector('.notification-list');
        if (list) {
            list.innerHTML = renderList();
        }
    };

    // ========== SHOW TOAST NOTIFICATION ==========
    const showToast = (message, type = 'info', duration = 4000) => {
        const toastContainer = document.getElementById('toastContainer') || createToastContainer();

        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.innerHTML = `
            <div class="toast__icon">${getToastIcon(type)}</div>
            <div class="toast__content">
                <div class="toast__message">${message}</div>
            </div>
            <button class="toast__close" onclick="this.parentElement.remove()">×</button>
        `;

        toastContainer.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            toast.classList.add('toast--exit');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    };

    const createToastContainer = () => {
        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(container);
        return container;
    };

    const getToastIcon = (type) => {
        const icons = {
            success: Icons.checkCircle || '✓',
            warning: Icons.alertCircle || '⚠',
            danger: Icons.xCircle || '✕',
            info: Icons.info || 'ℹ'
        };
        return icons[type] || icons.info;
    };

    // ========== GETTERS ==========
    const getNotifications = () => notifications;
    const getUnreadCount = () => unreadCount;

    // ========== PUBLIC API ==========
    return {
        init,
        refresh,
        renderList,
        handleClick,
        markAllAsRead,
        updateBadge,
        showToast,
        getNotifications,
        getUnreadCount
    };
})();

// Make globally available
if (typeof window !== 'undefined') {
    window.NotificationService = NotificationService;
}
