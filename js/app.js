/**
 * ALLTECH SUPPORT - Main Application
 * Application initialization, routing, and core functionality
 */

const App = (() => {
  // Module registry
  const modules = {};

  // ========== SIDEBAR COMPONENT ==========

  const renderSidebar = () => {
    const menuItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Icons.home },
      { id: 'clientes', label: 'Clientes', icon: Icons.users },
      { id: 'contratos', label: 'Contratos', icon: Icons.fileText },
      { id: 'visitas', label: 'Visitas / Servicios', icon: Icons.wrench },
      { id: 'proformas', label: 'Proformas', icon: Icons.fileText },
      { id: 'productos', label: 'Productos / Servicios', icon: Icons.package },
      { id: 'equipos', label: 'Equipos', icon: Icons.monitor },
      { id: 'software', label: 'Software', icon: Icons.monitor },
      { id: 'calendario', label: 'Calendario', icon: Icons.calendar },
      { id: 'reportes', label: 'Reportes', icon: Icons.barChart },
      { id: 'configuracion', label: 'Configuración', icon: Icons.settings }
    ];

    // Get permissions dynamically from DataService
    const currentModule = State.get('currentModule');
    const user = State.get('user');

    // Get user's role permissions from DataService
    const rolePermissions = user && user.role ? DataService.getRolePermissions(user.role) : null;

    // Get user's allowed modules (individual user restriction)
    const userAllowedModules = user && user.allowedModules ? user.allowedModules : [];

    // Filter items based on permissions AND allowed modules
    const visibleItems = menuItems.filter(item => {
      // Dashboard is always visible
      if (item.id === 'dashboard') return true;

      // Check if user has read permission for this module (role-based)
      const hasRolePermission = rolePermissions && rolePermissions[item.id] && rolePermissions[item.id].read === true;

      // Check if module is in user's allowed modules (user-based)
      // If allowedModules is empty or undefined, allow all (backwards compatibility with Admin)
      const isModuleAllowed = !userAllowedModules || userAllowedModules.length === 0 || userAllowedModules.includes(item.id);

      // User needs BOTH role permission AND module to be allowed
      return hasRolePermission && isModuleAllowed;
    });



    return `
      <aside class="sidebar" id="sidebar">
        <div class="sidebar__header">
          <img src="assets/logo.png" alt="ALLTECH Logo" class="sidebar__logo-img" style="max-width: 120px; height: auto; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));">
        </div>
        
        <nav class="sidebar__nav">
          <ul class="sidebar__menu">
            ${visibleItems.map(item => `
              <li class="sidebar__menu-item">
                <a href="#${item.id}" 
                   class="sidebar__menu-link ${currentModule === item.id ? 'active' : ''}"
                   data-module="${item.id}">
                  <span class="sidebar__menu-icon">${item.icon}</span>
                  ${item.label}
                </a>
              </li>
            `).join('')}
          </ul>
        </nav>
        
        <div class="sidebar__footer">
          <div class="sidebar__user">
            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1a73e8&color=fff" 
                 alt="${user.name}" 
                 class="sidebar__user-avatar">
            <div class="sidebar__user-info">
              <div class="sidebar__user-name">${user.name}</div>
            </div>
          </div>
        </div>
      </aside>
    `;
  };

  // ========== HEADER COMPONENT ==========

  const renderHeader = () => {
    const currentModule = State.get('currentModule');
    const theme = State.get('theme');
    const user = State.get('user');

    const titles = {
      dashboard: 'Dashboard',
      clientes: 'Clientes',
      contratos: 'Contratos',
      visitas: 'Visitas / Servicios',
      proformas: 'Proformas / Cotizaciones',
      productos: 'Productos y Servicios',
      equipos: 'Equipos',
      software: 'Software y Licencias',
      calendario: 'Calendario',
      reportes: 'Reportes',
      configuracion: 'Configuración'
    };

    return `
      <header class="header">
        <button class="header__menu-btn btn btn--ghost btn--icon" id="menuToggle">
          ${Icons.menu}
        </button>
        <h1 class="header__title">${titles[currentModule] || 'Dashboard'}</h1>
        
        <div class="header__search">
          <span class="header__search-icon">${Icons.search}</span>
          <input type="text" 
                 class="header__search-input" 
                 placeholder="Buscar...">
        </div>
        
        <div class="header__actions">
          <div class="dropdown">
            <button class="header__action-btn" id="notificationsBtn" onclick="App.toggleNotifications()">
              ${Icons.bell}
              <span class="badge">3</span>
            </button>
            <div class="dropdown__menu dropdown__menu--right" id="notificationsDropdown">
                <div class="dropdown__header">Notificaciones</div>
                <div class="notification-list">
                    <div class="notification-item unread">
                        <div class="notification-icon warning">${Icons.alertCircle}</div>
                        <div class="notification-content">
                            <div class="notification-title">Contrato por vencer</div>
                            <div class="notification-time">Hace 2 horas</div>
                        </div>
                    </div>
                    <div class="notification-item unread">
                        <div class="notification-icon info">${Icons.info}</div>
                        <div class="notification-content">
                            <div class="notification-title">Nueva visita asignada</div>
                            <div class="notification-time">Hace 4 horas</div>
                        </div>
                    </div>
                     <div class="notification-item">
                        <div class="notification-icon success">${Icons.checkCircle}</div>
                        <div class="notification-content">
                            <div class="notification-title">Proforma aprobada</div>
                            <div class="notification-time">Ayer</div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
          
          
          <div class="dropdown">
             <button class="header__avatar-btn" onclick="App.toggleUserMenu()">
                 <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1a73e8&color=fff&size=44" 
                    alt="${user.name}" 
                    class="header__avatar">
             </button>
             <ul class="dropdown__menu dropdown__menu--right" id="userDropdown">
                <li class="dropdown__header">${user.name}<br><small>${user.email}</small></li>
                <li class="dropdown__divider"></li>
                <li class="dropdown__item" onclick="App.navigate('configuracion')">
                  ${Icons.user} Mi Perfil
                </li>
                <li class="dropdown__item" onclick="App.navigate('configuracion')">
                  ${Icons.settings} Configuración
                </li>
                <li class="dropdown__item" onclick="App.handleSwitchUser()">
                  ${Icons.refreshCw} Cambiar Perfil
                </li>
                <li class="dropdown__item" onclick="App.handleLogout()" style="color: var(--color-danger);">
                  ${Icons.logOut} Cerrar Sesión
                </li>
              </ul>
          </div>
        </div>
      </header>
    `;
  };

  // ========== LOGIN COMPONENT ==========
  // Usando LoginModule nuevo con Supabase y fondo negro
  const renderLogin = () => {
    return LoginModule.render();
  };

  // ========== AUTH ACTIONS ==========
  // El login ahora lo maneja LoginModule.handleLogin()

  const handleLogout = async () => {
    if (confirm('¿Cerrar sesión?')) {
      await signOut(); // Cerrar sesión en Supabase
      State.logout();
      render();
    }
  };

  const handleSwitchUser = () => {
    // Close user dropdown first
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) dropdown.classList.remove('show');

    // Log out and return to login screen
    State.logout();
    render();
  };

  const toggleUserMenu = () => {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) dropdown.classList.toggle('show');
  };

  // ========== DASHBOARD MODULE ==========

  const renderDashboard = () => {
    const stats = DataService.getDashboardStats();
    const activities = DataService.getRecentActivities();
    const savingsPlans = DataService.getSavingsPlans();
    const bankAccounts = DataService.getBankAccounts();
    const user = State.get('user');
    const proformas = DataService.getProformasSync().sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 5);

    // Get upcoming visits
    const allVisitas = DataService.getVisitasSync();
    const today = new Date();
    const upcomingVisitas = allVisitas
      .filter(v => new Date(v.fechaInicio) >= today && !v.trabajoRealizado)
      .sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio))
      .slice(0, 5);

    return `
      <div class="dashboard">
        <!-- Stats Row -->
        <div class="dashboard__row dashboard__row--stats">
          <div class="stat-card stat-card--primary">
            <div class="stat-card__header">
              <div class="stat-card__icon">${Icons.wallet}</div>
              <span class="stat-card__trend stat-card__trend--${stats.clientesActivos.trendDirection}">
                ${stats.clientesActivos.trendDirection === 'up' ? Icons.trendingUp : Icons.trendingDown}
                ${Math.abs(stats.clientesActivos.trend)}%
              </span>
            </div>
            <span class="stat-card__label">Clientes Activos</span>
            <span class="stat-card__value">${stats.clientesActivos.value}</span>
            <span class="stat-card__period">vs mes anterior</span>
          </div>

          <div class="stat-card stat-card--success">
            <div class="stat-card__header">
              <div class="stat-card__icon">${Icons.arrowDownLeft}</div>
              <span class="stat-card__trend stat-card__trend--${stats.serviciosMes.trendDirection}">
                ${stats.serviciosMes.trendDirection === 'up' ? Icons.trendingUp : Icons.trendingDown}
                ${Math.abs(stats.serviciosMes.trend)}%
              </span>
            </div>
            <span class="stat-card__label">Servicios del Mes</span>
            <span class="stat-card__value">${stats.serviciosMes.value}</span>
            <span class="stat-card__period">vs mes anterior</span>
          </div>

          <div class="stat-card stat-card--warning">
            <div class="stat-card__header">
              <div class="stat-card__icon">${Icons.arrowUpRight}</div>
              <span class="stat-card__trend stat-card__trend--${stats.ingresosMes.trendDirection}">
                ${stats.ingresosMes.trendDirection === 'up' ? Icons.trendingUp : Icons.trendingDown}
                ${Math.abs(stats.ingresosMes.trend)}%
              </span>
            </div>
            <span class="stat-card__label">Ingresos (USD)</span>
            <span class="stat-card__value">$${stats.ingresosMes.value.toFixed(2)}</span>
            <span class="stat-card__period">vs mes anterior</span>
          </div>

          <div class="stat-card stat-card--info">
            <div class="stat-card__header">
              <div class="stat-card__icon">${Icons.piggyBank}</div>
              <span class="stat-card__trend stat-card__trend--${stats.contratosActivos.trendDirection}">
                ${stats.contratosActivos.trendDirection === 'up' ? Icons.trendingUp : Icons.trendingDown}
                ${Math.abs(stats.contratosActivos.trend)}%
              </span>
            </div>
            <span class="stat-card__label">Contratos Activos</span>
            <span class="stat-card__value">${stats.contratosActivos.value}</span>
            <span class="stat-card__period">vs mes anterior</span>
          </div>
        </div>

        <!-- Upcoming Visits Alert -->
        ${upcomingVisitas.length > 0 ? `
          <div class="card" style="background: linear-gradient(135deg, var(--color-primary-50) 0%, var(--bg-secondary) 100%); border-left: 4px solid var(--color-primary-500);">
            <div class="card__header">
              <h3 class="card__title">${Icons.calendar} Próximas Visitas Programadas</h3>
              <button class="btn btn--ghost btn--sm" onclick="App.navigate('visitas')">
                Ver Todas
              </button>
            </div>
            <div class="card__body">
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--spacing-md);">
                ${upcomingVisitas.map(visita => {
      const cliente = DataService.getClienteById(visita.clienteId);
      const equipo = DataService.getEquipoById(visita.equipoId);
      const fechaVisita = new Date(visita.fechaInicio);
      const diasRestantes = Math.ceil((fechaVisita - today) / (1000 * 60 * 60 * 24));

      return `
                    <div class="upcoming-visit-card" style="padding: var(--spacing-md); background: var(--bg-secondary); border-radius: var(--border-radius-md); border: 1px solid var(--border-color);">
                      <div style="display: flex; gap: var(--spacing-md); margin-bottom: var(--spacing-sm);">
                        <div style="flex-shrink: 0; width: 48px; height: 48px; border-radius: var(--border-radius-md); background: var(--color-primary-100); color: var(--color-primary-600); display: flex; flex-direction: column; align-items: center; justify-content: center; font-weight: var(--font-weight-bold);">
                          <div style="font-size: var(--font-size-lg);">${fechaVisita.getDate()}</div>
                          <div style="font-size: var(--font-size-xs); text-transform: uppercase;">${fechaVisita.toLocaleDateString('es-NI', { month: 'short' })}</div>
                        </div>
                        <div style="flex: 1; min-width: 0;">
                          <div style="font-weight: var(--font-weight-semibold); color: var(--text-primary); margin-bottom: var(--spacing-xs);">${visita.tipoVisita}</div>
                          <div style="font-size: var(--font-size-sm); color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            ${Icons.user} ${cliente?.nombreCliente || 'Cliente N/A'}
                          </div>
                          ${equipo ? `
                            <div style="font-size: var(--font-size-xs); color: var(--text-muted); margin-top: 2px;">
                              ${Icons.monitor} ${equipo.nombreEquipo}
                            </div>
                          ` : ''}
                        </div>
                      </div>
                      <div style="display: flex; align-items: center; justify-content: space-between; padding-top: var(--spacing-sm); border-top: 1px solid var(--border-color);">
                        <span class="badge badge--${diasRestantes === 0 ? 'danger' : diasRestantes <= 2 ? 'warning' : 'primary'}" style="font-size: var(--font-size-xs);">
                          ${diasRestantes === 0 ? 'Hoy' : diasRestantes === 1 ? 'Mañana' : `En ${diasRestantes} días`}
                        </span>
                        <button class="btn btn--ghost btn--icon btn--sm" onclick="App.navigate('visitas')" title="Ver detalles">
                          ${Icons.arrowRight}
                        </button>
                      </div>
                    </div>
                  `;
    }).join('')}
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Quick Actions Row (Moved to top) -->
        <div class="card">
          <div class="card__header">
            <h3 class="card__title">Acciones Rápidas</h3>
          </div>
          <div class="card__body">
            <div style="display: flex; gap: var(--spacing-md); flex-wrap: wrap;">
              <button class="btn btn--primary" onclick="App.navigate('visitas')">
                ${Icons.plus} Nueva Visita
              </button>
              <button class="btn btn--secondary" onclick="App.navigate('clientes')">
                ${Icons.users} Nuevo Cliente
              </button>
              <button class="btn btn--secondary" onclick="App.navigate('proformas')">
                ${Icons.fileText} Nueva Proforma
              </button>
              <button class="btn btn--secondary" onclick="App.navigate('contratos')">
                ${Icons.fileText} Nuevo Contrato
              </button>
              <button class="btn btn--secondary" onclick="App.navigate('equipos')">
                ${Icons.monitor} Nuevo Equipo
              </button>
              <button class="btn btn--secondary" onclick="ReportesModule.generateGeneralReport()">
                ${Icons.barChart} Reporte General
              </button>
            </div>
          </div>
        </div>

        <!-- Main Row -->
        <div class="dashboard__row dashboard__row--main">
          <!-- Chart Card -->
          <div class="card">
            <div class="card__header">
              <h3 class="card__title">Estadísticas ALLTECH</h3>
              <div class="dropdown">
                <button class="btn btn--ghost btn--sm dropdown__trigger">
                  Esta Semana
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
              </div>
            </div>
            <div class="card__body">
              <div style="display: flex; align-items: baseline; gap: var(--spacing-md); margin-bottom: var(--spacing-lg);">
                <span class="text-sm text-muted">Ingresos por mes</span>
                <span style="font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold);">$12,345.00</span>
                <span class="text-sm text-success">+5%</span>
              </div>
              <div style="display: flex; gap: var(--spacing-lg); margin-bottom: var(--spacing-md);">
                <div style="display: flex; align-items: center; gap: var(--spacing-xs);">
                  <span style="width: 12px; height: 12px; background: var(--color-primary-500); border-radius: 2px;"></span>
                  <span class="text-sm">Ingresos</span>
                </div>
                <div style="display: flex; align-items: center; gap: var(--spacing-xs);">
                  <span style="width: 12px; height: 12px; background: var(--color-success); border-radius: 2px;"></span>
                  <span class="text-sm">Beneficio</span>
                </div>
              </div>
              <div class="chart-container">
                <canvas id="statsChart"></canvas>
              </div>
            </div>
          </div>

          <!-- Right Panel -->
          <div style="display: flex; flex-direction: column; gap: var(--spacing-lg);">
            <!-- User Profile Card -->
            <div class="card">
              <div class="user-profile-card">
                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1a73e8&color=fff&size=80" 
                     alt="${user.name}" 
                     class="user-profile-card__avatar">
                <div class="user-profile-card__name">${user.name}</div>
                <div class="user-profile-card__email">${user.email}</div>
                <div class="user-profile-card__actions">
                  <div class="user-profile-card__action">
                    <div class="user-profile-card__action-icon">${Icons.phone}</div>
                    <span class="user-profile-card__action-label">Contacto</span>
                  </div>
                  <div class="user-profile-card__action">
                    <div class="user-profile-card__action-icon">${Icons.user}</div>
                    <span class="user-profile-card__action-label">Perfil</span>
                  </div>
                  <div class="user-profile-card__action">
                    <div class="user-profile-card__action-icon">${Icons.info}</div>
                    <span class="user-profile-card__action-label">Info</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Savings Plans -->
             <div class="card">
              <div class="card__header">
                <h3 class="card__title">Plan de Metas</h3>
                <button class="btn btn--ghost btn--icon">${Icons.moreVertical}</button>
              </div>
              <div class="card__body" style="padding: var(--spacing-md) 0;">
                <div class="savings-plan">
                  ${savingsPlans.map(plan => `
                    <div class="savings-plan__item">
                      <div class="savings-plan__icon" style="background: ${plan.id === 1 ? 'var(--color-primary-50)' : 'var(--color-success-light)'};">
                        ${plan.icon}
                      </div>
                      <div class="savings-plan__info">
                        <div class="savings-plan__title">${plan.title}</div>
                        <div class="savings-plan__subtitle">${plan.subtitle}</div>
                      </div>
                      <div class="savings-plan__progress">
                        <div class="progress ${plan.id === 1 ? '' : 'progress--success'}">
                          <div class="progress__bar" style="width: ${plan.percent}%"></div>
                        </div>
                      </div>
                      <div class="savings-plan__amount">
                        <div class="savings-plan__value">$${plan.target.toLocaleString()}</div>
                        <div class="savings-plan__percent">${plan.percent}%</div>
                      </div>
                    </div >
  `).join('')}
                </div>
              </div>
            </div>

            <!-- Recent Proformas -->
            <div class="card">
              <div class="card__header">
                <h3 class="card__title">Proformas Recientes</h3>
                <button class="btn btn--ghost btn--sm" onclick="App.navigate('proformas')">
                  Ver Todas
                </button>
              </div>
              <div class="card__body" style="padding: 0;">
                ${proformas.length > 0 ? `
                  <table class="data-table">
                    <tbody class="data-table__body">
                      ${proformas.map(p => {
      const cliente = DataService.getClienteById(p.clienteId);
      return `
                          <tr style="cursor: pointer;" onclick="App.navigate('proformas')">
                            <td>
                              <div style="font-weight: var(--font-weight-medium);">${p.proformaId}</div>
                              <div class="text-xs text-muted">${cliente?.empresa || 'N/A'}</div>
                            </td>
                            <td>
                              <span class="badge ${p.estado === 'Activa' ? 'badge--primary' :
          p.estado === 'Aprobada' ? 'badge--success' :
            p.estado === 'Vencida' ? 'badge--warning' : 'badge--neutral'
        }">
                                ${p.estado}
                              </span>
                            </td>
                            <td style="text-align: right;">
                              <div style="font-weight: var(--font-weight-semibold);">${p.moneda === 'USD' ? '$' : 'C$'}${p.total.toFixed(2)}</div>
                              <div class="text-xs text-muted">${new Date(p.fecha).toLocaleDateString('es-NI')}</div>
                            </td>
                          </tr>
                        `;
    }).join('')}
                    </tbody>
                  </table>
                ` : '<p class="text-muted text-center" style="padding: var(--spacing-lg);">No hay proformas</p>'}
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activities Table -->
        <div class="card">
          <div class="card__header">
            <h3 class="card__title">Actividades Recientes</h3>
            <div style="display: flex; gap: var(--spacing-md);">
              <div class="header__search" style="width: 200px;">
                <span class="header__search-icon">${Icons.search}</span>
                <input type="text" 
                       class="header__search-input" 
                       placeholder="Buscar archivo...">
              </div>
              <button class="btn btn--ghost btn--sm">
                ${Icons.filter} Filtrar
              </button>
            </div>
          </div>
          <div class="card__body" style="padding: 0;">
            <table class="data-table">
              <thead class="data-table__head">
                <tr>
                  <th>No</th>
                  <th>No. Servicio</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Monto</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody class="data-table__body">
                ${activities.map((activity, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td><span class="font-medium">${activity.numero}</span></td>
                    <td>${activity.cliente}</td>
                    <td>${activity.fecha}</td>
                    <td>
                      <span class="badge ${activity.estado === 'Completado' ? 'badge--success' : 'badge--warning'}">
                        ${activity.estado}
                      </span>
                    </td>
                    <td>${activity.monto}</td>
                    <td>
                      <div style="display: flex; gap: var(--spacing-xs);">
                        <button class="btn btn--ghost btn--icon btn--sm">${Icons.eye}</button>
                        <button class="btn btn--ghost btn--icon btn--sm">${Icons.edit}</button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  };

  // ========== MODULE PLACEHOLDER ==========

  const renderModulePlaceholder = (moduleName) => {
    const titles = {
      clientes: 'Gestión de Clientes',
      contratos: 'Gestión de Contratos',
      visitas: 'Visitas y Servicios',
      equipos: 'Inventario de Equipos',
      calendario: 'Calendario de Mantenimiento',
      reportes: 'Reportes e Historial',
      configuracion: 'Configuración del Sistema'
    };

    return `
      <div class="empty-state">
        <div class="empty-state__icon">${Icons.settings}</div>
        <h2 class="empty-state__title">${titles[moduleName] || moduleName}</h2>
        <p class="empty-state__description">
          Este módulo está en desarrollo. Pronto estará disponible con todas las funcionalidades.
        </p>
        <button class="btn btn--primary" onclick="App.navigate('dashboard')">
          Volver al Dashboard
        </button>
      </div>
    `;
  };

  // ========== CHART INITIALIZATION ==========

  const initChart = () => {
    const canvas = document.getElementById('statsChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const chartData = DataService.getChartData();

    // Get dimensions
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = 200;

    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartWidth = canvas.width - padding.left - padding.right;
    const chartHeight = canvas.height - padding.top - padding.bottom;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get max value
    const maxValue = Math.max(...chartData.revenue, ...chartData.profit);
    const scale = chartHeight / maxValue;

    // Draw grid lines
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(canvas.width - padding.right, y);
      ctx.stroke();

      // Y-axis labels
      ctx.fillStyle = '#868e96';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'right';
      const value = Math.round(maxValue - (maxValue / 4) * i);
      ctx.fillText(`$${value}`, padding.left - 8, y + 4);
    }

    // Draw X-axis labels
    const barGroupWidth = chartWidth / chartData.labels.length;
    ctx.fillStyle = '#868e96';
    ctx.textAlign = 'center';
    chartData.labels.forEach((label, i) => {
      const x = padding.left + barGroupWidth * i + barGroupWidth / 2;
      ctx.fillText(label, x, canvas.height - 8);
    });

    // Draw bars
    const barWidth = barGroupWidth * 0.3;
    const gap = 4;

    chartData.revenue.forEach((value, i) => {
      const x = padding.left + barGroupWidth * i + barGroupWidth / 2 - barWidth - gap / 2;
      const barHeight = value * scale;
      const y = padding.top + chartHeight - barHeight;

      // Revenue bar (gradient)
      const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
      gradient.addColorStop(0, '#1a73e8');
      gradient.addColorStop(1, '#155cb9');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 4);
      ctx.fill();
    });

    chartData.profit.forEach((value, i) => {
      const x = padding.left + barGroupWidth * i + barGroupWidth / 2 + gap / 2;
      const barHeight = value * scale;
      const y = padding.top + chartHeight - barHeight;

      // Profit bar (gradient)
      const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
      gradient.addColorStop(0, '#28a745');
      gradient.addColorStop(1, '#1e7e34');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 4);
      ctx.fill();
    });

    // Highlight Friday
    const fridayIndex = 5;
    const fridayX = padding.left + barGroupWidth * fridayIndex + barGroupWidth / 2;

    // Draw tooltip box
    const tooltipWidth = 80;
    const tooltipHeight = 50;
    const tooltipX = fridayX - tooltipWidth / 2;
    const tooltipY = padding.top - 10;

    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 6);
    ctx.fill();

    // Tooltip text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Viernes', fridayX, tooltipY + 15);
    ctx.fillText(`Ingresos: $${chartData.revenue[fridayIndex]}`, fridayX, tooltipY + 30);
    ctx.fillText(`Beneficio: $${chartData.profit[fridayIndex]}`, fridayX, tooltipY + 42);
  };

  // ========== ROUTING ==========

  const navigate = (module) => {
    State.setCurrentModule(module);
    render();
  };

  // ========== RENDER ==========

  const render = () => {
    const appContainer = document.getElementById('app');
    if (!appContainer) return;

    // Verify Authentication
    if (!State.get('isAuthenticated')) {
      appContainer.innerHTML = renderLogin();
      return;
    }

    const currentModule = State.get('currentModule');

    let moduleContent;
    switch (currentModule) {
      case 'dashboard':
        moduleContent = renderDashboard();
        break;
      case 'clientes':
        moduleContent = ClientesModule.render();
        break;
      case 'contratos':
        moduleContent = ContratosModule.render();
        break;
      case 'visitas':
        moduleContent = VisitasModule.render();
        break;
      case 'proformas':
        moduleContent = ProformasModule.render();
        break;
      case 'productos':
        moduleContent = ProductosModule.render();
        break;
      case 'equipos':
        moduleContent = EquiposModule.render();
        break;
      case 'software':
        moduleContent = SoftwareModule.render();
        break;
      case 'calendario':
        moduleContent = CalendarioModule.render();
        break;
      case 'reportes':
        moduleContent = ReportesModule.render();
        break;
      case 'configuracion':
        moduleContent = ConfigModule.render();
        break;
      default:
        moduleContent = renderModulePlaceholder(currentModule);
    }

    appContainer.innerHTML = `
      ${renderSidebar()}
      <main class="main">
        ${renderHeader()}
        <div class="content">
          ${moduleContent}
        </div>
      </main>
    `;

    // Initialize chart after render
    if (currentModule === 'dashboard') {
      requestAnimationFrame(() => {
        initChart();
      });
    }

    // Attach event listeners
    attachEventListeners();
  };

  // ========== EVENT LISTENERS ==========

  const attachEventListeners = () => {
    // Navigation links
    document.querySelectorAll('.sidebar__menu-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const module = link.dataset.module;
        navigate(module);
      });
    });

    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        State.toggleTheme();
        render();
      });
    }

    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
      menuToggle.addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
      });
    }

    // Close notifications and user menu when clicking outside
    document.addEventListener('click', (e) => {
      const notifDropdown = document.getElementById('notificationsDropdown');
      const notifBtn = document.getElementById('notificationsBtn');
      const userDropdown = document.getElementById('userDropdown');
      const userBtn = document.querySelector('.header__avatar-btn'); // Adjusted selector

      if (notifDropdown && notifBtn && !notifDropdown.contains(e.target) && !notifBtn.contains(e.target)) {
        notifDropdown.classList.remove('show');
      }

      // This logic needs to be robust. 
      // The button click handler might toggle it immediately back on if we are not careful.
      // But since we use onclick on the button, this specific listener is for clicking OUTSIDE.
      // So we check if click target is NOT the button and NOT the dropdown.

      if (userDropdown && userBtn && !userDropdown.contains(e.target) && !userBtn.contains(e.target)) {
        userDropdown.classList.remove('show');
      }
    });

    // Handle hash changes
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.slice(1) || 'dashboard';
      if (hash !== State.get('currentModule')) {
        navigate(hash);
      }
    });
  };

  // ========== INITIALIZATION ==========

  const init = () => {
    // Initialize state
    State.init();

    // Check initial hash
    const initialModule = window.location.hash.slice(1) || 'dashboard';
    State.setCurrentModule(initialModule);

    // Initial render
    render();

    // Handle window resize for chart
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (State.get('currentModule') === 'dashboard') {
          initChart();
        }
      }, 250);
    });

    console.log('ALLTECH initialized');
  };

  // ========== NOTIFICATIONS TOGGLE ==========

  const toggleNotifications = () => {
    const dropdown = document.getElementById('notificationsDropdown');
    if (dropdown) dropdown.classList.toggle('show');
  };

  // ========== TOAST NOTIFICATIONS ==========

  const showNotification = (message, type = 'info') => {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `toast-notification toast-notification--${type}`;
    notification.innerHTML = `
      <span class="toast-notification__icon">
        ${type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '⚠' : 'ℹ'}
      </span>
      <span class="toast-notification__message">${message}</span>
    `;

    // Add styles if not present
    if (!document.getElementById('toast-styles')) {
      const style = document.createElement('style');
      style.id = 'toast-styles';
      style.textContent = `
        .toast-notification {
          position: fixed;
          bottom: 20px;
          right: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 20px;
          background: var(--bg-secondary);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          z-index: 10000;
          animation: slideInRight 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
          border-left: 4px solid var(--color-info-500);
        }
        .toast-notification--success { border-left-color: var(--color-success-500); }
        .toast-notification--error { border-left-color: var(--color-danger-500); }
        .toast-notification--warning { border-left-color: var(--color-warning-500); }
        .toast-notification__icon { font-size: 18px; }
        .toast-notification--success .toast-notification__icon { color: var(--color-success-500); }
        .toast-notification--error .toast-notification__icon { color: var(--color-danger-500); }
        .toast-notification--warning .toast-notification__icon { color: var(--color-warning-500); }
        .toast-notification--info .toast-notification__icon { color: var(--color-info-500); }
        .toast-notification__message { color: var(--text-primary); font-size: var(--font-size-sm); }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  // ========== PUBLIC API ==========
  return {
    init,
    navigate,
    render,
    refreshCurrentModule: render,
    handleLogout,
    handleSwitchUser,
    toggleUserMenu,
    toggleNotifications,
    showNotification
  };
})();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', App.init);
