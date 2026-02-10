/**
 * ALLTECH SUPPORT - Configuración Module
 * System settings and user preferences
 */

const ConfigModule = (() => {
  let currentTab = 'perfil'; // Track current tab

  const render = () => {
    // Reset to default tab if not explicitly set
    if (!currentTab) currentTab = 'perfil';

    const user = State.get('user');
    const theme = State.get('theme');
    const config = DataService.getConfig();

    // Check permissions
    const canManageUsers = DataService.canPerformAction(user.role, 'usuarios', 'read');
    const canManageRoles = DataService.canPerformAction(user.role, 'configuracion', 'update'); // Assuming roles management requires config update

    return `
      <div class="module-container">
        <div class="module-header">
          <div class="module-header__left">
            <h2 class="module-title">Configuración</h2>
            <p class="module-subtitle">Preferencias del sistema y gestión de usuarios</p>
          </div>
        </div>

        <!-- Tabs Navigation -->
        <div class="card" style="margin-bottom: var(--spacing-lg);">
          <div class="card__body" style="padding: 0;">
            <div class="settings-tabs">
              <button class="settings-tab ${currentTab === 'perfil' ? 'active' : ''}" 
                      onclick="ConfigModule.switchTab('perfil')">
                ${Icons.user} Mi Perfil
              </button>
              ${canManageUsers ? `
              <button class="settings-tab ${currentTab === 'usuarios' ? 'active' : ''}" 
                      onclick="ConfigModule.switchTab('usuarios')">
                ${Icons.users} Gestión de Usuarios
              </button>
              ` : ''}
              ${canManageRoles ? `
              <button class="settings-tab ${currentTab === 'roles' ? 'active' : ''}" 
                      onclick="ConfigModule.switchTab('roles')">
                ${Icons.shield} Roles y Permisos
              </button>
              ` : ''}
              ${canManageRoles ? `
              <button class="settings-tab ${currentTab === 'bitacora' ? 'active' : ''}" 
                      onclick="ConfigModule.switchTab('bitacora')">
                ${Icons.fileText} Bitácora
              </button>
              ` : ''}
              ${canManageRoles ? `
              <button class="settings-tab ${currentTab === 'reportes-editor' ? 'active' : ''}" 
                      onclick="ConfigModule.switchTab('reportes-editor')">
                ${Icons.edit} Editor de Reportes
              </button>
              ` : ''}
              <button class="settings-tab ${currentTab === 'sistema' ? 'active' : ''}" 
                      onclick="ConfigModule.switchTab('sistema')">
                ${Icons.settings} Sistema
              </button>
            </div>
          </div>
        </div>

        <!-- Tab Content -->
        <div class="settings-layout">
          ${currentTab === 'perfil' ? renderPerfilTab(user, theme) : ''}
          ${currentTab === 'usuarios' && canManageUsers ? renderUsuariosTab() : ''}
          ${currentTab === 'roles' && canManageRoles ? renderRolesTab() : ''}
          ${currentTab === 'bitacora' && canManageRoles ? renderBitacoraTab() : ''}
          ${currentTab === 'reportes-editor' && canManageRoles ? renderReportesEditorTab() : ''}
          ${currentTab === 'sistema' ? renderSistemaTab(config) : ''}
        </div>
      </div>

      <div id="configModal"></div>
    `;
  };

  // ========== TAB RENDERERS ==========

  const renderPerfilTab = (user, theme) => {
    return `
      <!-- User Profile -->
      <div class="card">
        <div class="card__header">
          <h4 class="card__title">${Icons.user} Perfil de Usuario</h4>
        </div>
        <div class="card__body">
          <div class="settings-profile">
            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1a73e8&color=fff&size=100" 
                 alt="${user.name}" 
                 class="settings-profile__avatar">
            <div class="settings-profile__info">
              <h3 class="settings-profile__name">${user.name}</h3>
              <p class="settings-profile__email">${user.email}</p>
              <span class="badge badge--primary" style="margin-top: var(--spacing-xs);">${user.role}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  const renderUsuariosTab = () => {
    const users = DataService.getUsersSync() || [];
    const user = State.get('user');
    const canCreate = DataService.canPerformAction(user.role, 'usuarios', 'create');
    const canUpdate = DataService.canPerformAction(user.role, 'usuarios', 'update');
    const canDelete = DataService.canPerformAction(user.role, 'usuarios', 'delete');

    return `
      <div class="card">
        <div class="card__header">
          <h4 class="card__title">${Icons.users} Gestión de Usuarios</h4>
          ${canCreate ? `
          <button class="btn btn--primary btn--sm" onclick="ConfigModule.openCreateUser()">
            ${Icons.plus} Nuevo Usuario
          </button>
          ` : ''}
        </div>
        <div class="card__body" style="padding: 0;">
          ${users.length > 0 ? `
            <table class="data-table">
              <thead class="data-table__head">
                <tr>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody class="data-table__body">
                ${users.map(u => `
                  <tr>
                    <td>
                      <div class="flex items-center gap-md">
                        <div class="avatar avatar--sm">
                          <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=1a73e8&color=fff" 
                               alt="${u.name}">
                        </div>
                        <div>
                          <div class="font-medium">${u.name}</div>
                          <div class="text-xs text-muted">${u.username}</div>
                        </div>
                      </div>
                    </td>
                    <td>${u.email}</td>
                    <td><span class="badge badge--primary">${u.role}</span></td>
                    <td><span class="badge badge--success">Activo</span></td>
                    <td>
                      <div class="flex gap-xs">
                        ${canUpdate ? `
                        <button class="btn btn--ghost btn--icon btn--sm" 
                                onclick="ConfigModule.editUser('${u.username}')"
                                title="Editar">
                          ${Icons.edit}
                        </button>
                        ` : ''}
                        ${canDelete ? `
                        <button class="btn btn--ghost btn--icon btn--sm" 
                                onclick="ConfigModule.deleteUser('${u.username}')"
                                title="Eliminar">
                          ${Icons.trash}
                        </button>
                        ` : ''}
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : `
            <div class="empty-state">
              <div class="empty-state__icon">${Icons.users}</div>
              <h3 class="empty-state__title">No hay usuarios</h3>
              <p class="empty-state__description">Crea tu primer usuario para comenzar</p>
              ${canCreate ? `
              <button class="btn btn--primary" onclick="ConfigModule.openCreateUser()">
                ${Icons.plus} Crear Usuario
              </button>
              ` : ''}
            </div>
          `}
        </div>
      </div>
    `;
  };

  const renderRolesTab = () => {
    const allRoles = DataService.getAvailableRoles();
    const allModulos = [
      { id: 'clientes', name: 'Clientes', icon: Icons.users },
      { id: 'contratos', name: 'Contratos', icon: Icons.fileText },
      { id: 'visitas', name: 'Visitas', icon: Icons.calendar },
      { id: 'pedidos', name: 'Pedidos', icon: Icons.shoppingCart },
      { id: 'proformas', name: 'Proformas', icon: Icons.fileText },
      { id: 'productos', name: 'Productos', icon: Icons.package },
      { id: 'equipos', name: 'Equipos', icon: Icons.monitor },
      { id: 'software', name: 'Software', icon: Icons.code },
      { id: 'calendario', name: 'Calendario', icon: Icons.calendar },
      { id: 'reportes', name: 'Reportes', icon: Icons.barChart },
      { id: 'configuracion', name: 'Configuración', icon: Icons.settings },
      { id: 'usuarios', name: 'Usuarios', icon: Icons.users }
    ];

    return `
      <div class="card">
        <div class="card__header">
          <h4 class="card__title">${Icons.shield} Roles y Permisos</h4>
          <p class="text-sm text-muted" style="margin-top: var(--spacing-xs);">
            Configure permisos granulares (Crear, Leer, Editar, Eliminar) por módulo y rol
          </p>
        </div>
        <div class="card__body">
          ${allRoles.map(roleName => {
      const rolePerms = DataService.getRolePermissions(roleName) || {};

      return `
            <div class="role-permissions-card" style="margin-bottom: var(--spacing-xl); background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--border-radius-lg); overflow: hidden;">
              <div style="padding: var(--spacing-lg); background: var(--bg-tertiary); border-bottom: 1px solid var(--border-color);">
                <h5 style="font-size: var(--font-size-lg); font-weight: var(--font-weight-semibold); margin-bottom: var(--spacing-xs); display: flex; align-items: center; gap: var(--spacing-sm);">
                  ${Icons.shield} ${roleName}
                </h5>
                <p class="text-sm text-muted">Control granular de permisos por módulo</p>
              </div>
              
              <div style="overflow-x: auto;">
                <table class="permissions-table" style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="background: var(--bg-tertiary); border-bottom: 2px solid var(--border-color);">
                      <th style="padding: var(--spacing-md); text-align: left; font-weight: var(--font-weight-semibold); min-width: 180px;">Módulo</th>
                      <th style="padding: var(--spacing-md); text-align: center; font-weight: var(--font-weight-semibold); width: 100px;">
                        <div style="display: flex; flex-direction: column; align-items: center; gap: var(--spacing-xs);">
                          <span style="color: var(--color-primary-600);">${Icons.plus}</span>
                          <span style="font-size: var(--font-size-xs);">Crear</span>
                        </div>
                      </th>
                      <th style="padding: var(--spacing-md); text-align: center; font-weight: var(--font-weight-semibold); width: 100px;">
                        <div style="display: flex; flex-direction: column; align-items: center; gap: var(--spacing-xs);">
                          <span style="color: var(--color-success);">${Icons.eye}</span>
                          <span style="font-size: var(--font-size-xs);">Leer</span>
                        </div>
                      </th>
                      <th style="padding: var(--spacing-md); text-align: center; font-weight: var(--font-weight-semibold); width: 100px;">
                        <div style="display: flex; flex-direction: column; align-items: center; gap: var(--spacing-xs);">
                          <span style="color: var(--color-warning);">${Icons.edit}</span>
                          <span style="font-size: var(--font-size-xs);">Editar</span>
                        </div>
                      </th>
                      <th style="padding: var(--spacing-md); text-align: center; font-weight: var(--font-weight-semibold); width: 100px;">
                        <div style="display: flex; flex-direction: column; align-items: center; gap: var(--spacing-xs);">
                          <span style="color: var(--color-danger);">${Icons.trash}</span>
                          <span style="font-size: var(--font-size-xs);">Eliminar</span>
                        </div>
                      </th>
                      <th style="padding: var(--spacing-md); text-align: center; font-weight: var(--font-weight-semibold); width: 120px;">
                        <span style="font-size: var(--font-size-xs);">Acceso Total</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    ${allModulos.map(modulo => {
        const perms = rolePerms[modulo.id] || { create: false, read: false, update: false, delete: false };
        const hasFullAccess = perms.create && perms.read && perms.update && perms.delete;
        const hasNoAccess = !perms.create && !perms.read && !perms.update && !perms.delete;
        const hasReadOnly = perms.read && !perms.create && !perms.update && !perms.delete;

        return `
                      <tr style="border-bottom: 1px solid var(--border-color); ${perms.read ? 'background: var(--bg-primary);' : ''}">
                        <td style="padding: var(--spacing-md);">
                          <div style="display: flex; align-items: center; gap: var(--spacing-sm);">
                            <span style="color: ${perms.read ? 'var(--text-primary)' : 'var(--text-muted)'};">${modulo.icon}</span>
                            <span style="font-weight: var(--font-weight-medium); color: ${perms.read ? 'var(--text-primary)' : 'var(--text-muted)'};">${modulo.name}</span>
                            ${hasFullAccess ? '<span class="badge badge--success" style="font-size: var(--font-size-xs); margin-left: var(--spacing-xs);">Full</span>' : ''}
                            ${hasReadOnly ? '<span class="badge badge--warning" style="font-size: var(--font-size-xs); margin-left: var(--spacing-xs);">Solo Lectura</span>' : ''}
                            ${hasNoAccess ? '<span class="badge badge--neutral" style="font-size: var(--font-size-xs); margin-left: var(--spacing-xs);">Sin Acceso</span>' : ''}
                          </div>
                        </td>
                        <td style="padding: var(--spacing-md); text-align: center;">
                          <input type="checkbox" 
                                 class="permission-checkbox"
                                 ${perms.create ? 'checked' : ''}
                                 ${!perms.read ? 'disabled' : ''}
                                 onchange="ConfigModule.toggleSpecificPermission('${roleName}', '${modulo.id}', 'create', this.checked)"
                                 style="cursor: ${!perms.read ? 'not-allowed' : 'pointer'}; width: 18px; height: 18px;">
                        </td>
                        <td style="padding: var(--spacing-md); text-align: center;">
                          <input type="checkbox" 
                                 class="permission-checkbox"
                                 ${perms.read ? 'checked' : ''}
                                 onchange="ConfigModule.toggleSpecificPermission('${roleName}', '${modulo.id}', 'read', this.checked)"
                                 style="cursor: pointer; width: 18px; height: 18px;">
                        </td>
                        <td style="padding: var(--spacing-md); text-align: center;">
                          <input type="checkbox" 
                                 class="permission-checkbox"
                                 ${perms.update ? 'checked' : ''}
                                 ${!perms.read ? 'disabled' : ''}
                                 onchange="ConfigModule.toggleSpecificPermission('${roleName}', '${modulo.id}', 'update', this.checked)"
                                 style="cursor: ${!perms.read ? 'not-allowed' : 'pointer'}; width: 18px; height: 18px;">
                        </td>
                        <td style="padding: var(--spacing-md); text-align: center;">
                          <input type="checkbox" 
                                 class="permission-checkbox"
                                 ${perms.delete ? 'checked' : ''}
                                 ${!perms.read ? 'disabled' : ''}
                                 onchange="ConfigModule.toggleSpecificPermission('${roleName}', '${modulo.id}', 'delete', this.checked)"
                                 style="cursor: ${!perms.read ? 'not-allowed' : 'pointer'}; width: 18px; height: 18px;">
                        </td>
                        <td style="padding: var(--spacing-md); text-align: center;">
                          <input type="checkbox" 
                                 class="permission-checkbox-full"
                                 ${hasFullAccess ? 'checked' : ''}
                                 onchange="ConfigModule.toggleFullAccess('${roleName}', '${modulo.id}', this.checked)"
                                 style="cursor: pointer; width: 18px; height: 18px;">
                        </td>
                      </tr>
                      `;
      }).join('')}
                  </tbody>
                </table>
              </div>
              
              <div style="padding: var(--spacing-md); background: var(--bg-tertiary); border-top: 1px solid var(--border-color); font-size: var(--font-size-xs); color: var(--text-muted);">
                <strong>Nota:</strong> Para poder Crear, Editar o Eliminar registros, el permiso de "Leer" debe estar activo.
              </div>
            </div>
            `;
    }).join('')}
        </div>
      </div>
    `;
  };

  const renderBitacoraTab = () => {
    const logs = LogService.getLogs();
    const stats = LogService.getStats();
    // Use window.matchMedia to check logical resolution if needed, but here simple slice
    const displayLogs = logs.slice(0, 50);

    const getAccionBadge = (accion) => {
      const badges = {
        'create': '<span class="badge badge--success">Crear</span>',
        'read': '<span class="badge badge--info">Leer</span>',
        'update': '<span class="badge badge--warning">Editar</span>',
        'delete': '<span class="badge badge--danger">Eliminar</span>'
      };
      return badges[accion] || `<span class="badge badge--neutral">${accion}</span>`;
    };

    const formatDate = (isoString) => {
      if (!isoString) return '-';
      const date = new Date(isoString);
      return date.toLocaleString('es-NI', { dateStyle: 'short', timeStyle: 'short' });
    };

    return `
      <div class="card">
        <div class="card__header">
          <h4 class="card__title">${Icons.fileText} Bitácora del Sistema</h4>
          <p class="text-sm text-muted" style="margin-top: var(--spacing-xs);">
            Registro de auditoría de actividad del sistema
          </p>
        </div>
        <div class="card__body">
          <!-- Stats Cards -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--spacing-md); margin-bottom: var(--spacing-lg);">
             <div style="padding: var(--spacing-md); background: var(--bg-secondary); border-radius: var(--border-radius-md); border-left: 4px solid var(--color-primary-500);">
               <div class="text-sm text-muted">Total Registros</div>
               <div style="font-size: 1.5rem; font-weight: bold;">${stats.total}</div>
             </div>
             <div style="padding: var(--spacing-md); background: var(--bg-secondary); border-radius: var(--border-radius-md); border-left: 4px solid var(--color-danger);">
               <div class="text-sm text-muted">Eliminaciones</div>
               <div style="font-size: 1.5rem; font-weight: bold;">${stats.porAccion.delete || 0}</div>
             </div>
             <div style="padding: var(--spacing-md); background: var(--bg-secondary); border-radius: var(--border-radius-md); border-left: 4px solid var(--color-success);">
               <div class="text-sm text-muted">Creaciones</div>
               <div style="font-size: 1.5rem; font-weight: bold;">${stats.porAccion.create || 0}</div>
             </div>
          </div>

          <!-- Actions Toolbar -->
          <div style="display: flex; gap: var(--spacing-sm); margin-bottom: var(--spacing-md);">
            <button class="btn btn--secondary" onclick="App.refreshCurrentModule()">
              ${Icons.refresh} Actualizar
            </button>
            <button class="btn btn--secondary" onclick="ConfigModule.exportarBitacora()">
              ${Icons.download} Exportar JSON
            </button>
            <button class="btn btn--danger" onclick="if(confirm('¿Borrar historial?')) ConfigModule.limpiarBitacora()">
              ${Icons.trash} Limpiar
            </button>
          </div>

          <!-- Table -->
          <div style="overflow-x: auto;">
             <table class="table" style="width: 100%; text-align: left; border-collapse: collapse;">
               <thead>
                 <tr style="background: var(--bg-tertiary);">
                   <th style="padding: var(--spacing-sm); border-bottom: 2px solid var(--border-color);">Fecha</th>
                   <th style="padding: var(--spacing-sm); border-bottom: 2px solid var(--border-color);">Usuario</th>
                   <th style="padding: var(--spacing-sm); border-bottom: 2px solid var(--border-color);">Módulo</th>
                   <th style="padding: var(--spacing-sm); border-bottom: 2px solid var(--border-color);">Acción</th>
                   <th style="padding: var(--spacing-sm); border-bottom: 2px solid var(--border-color);">Detalle</th>
                 </tr>
               </thead>
               <tbody>
                 ${displayLogs.length > 0 ? displayLogs.map(log => `
                   <tr style="border-bottom: 1px solid var(--border-color);">
                     <td style="padding: var(--spacing-sm); font-size: var(--font-size-sm);">${formatDate(log.timestamp)}</td>
                     <td style="padding: var(--spacing-sm);">${log.nombreUsuario || log.usuario}</td>
                     <td style="padding: var(--spacing-sm);"><span class="badge badge--neutral">${log.modulo}</span></td>
                     <td style="padding: var(--spacing-sm);">${getAccionBadge(log.accion)}</td>
                     <td style="padding: var(--spacing-sm); font-size: var(--font-size-sm);">${log.descripcion || '-'}</td>
                   </tr>
                 `).join('') : `
                   <tr><td colspan="5" style="padding: var(--spacing-lg); text-align: center; color: var(--text-muted);">No hay registros</td></tr>
                 `}
               </tbody>
             </table>
          </div>
          ${logs.length > 50 ? `<div class="text-xs text-muted" style="margin-top: var(--spacing-sm); text-align: center;">Mostrando últimos 50 eventos</div>` : ''}
        </div>
      </div>
    `;
  };

  // ========== REPORT EDITOR TAB ==========
  const renderReportesEditorTab = () => {
    // Trigger init after render
    requestAnimationFrame(() => {
      if (typeof ReportEditorModule !== 'undefined') {
        ReportEditorModule.init();
      }
    });

    // Return the report editor content
    if (typeof ReportEditorModule !== 'undefined') {
      return ReportEditorModule.render();
    }

    return `
      <div class="card">
        <div class="card__body">
          <p class="text-muted">El módulo de Editor de Reportes no está disponible.</p>
        </div>
      </div>
    `;
  };

  const renderSistemaTab = (config) => {
    const theme = State.get('theme') || 'light';

    return `
      <!-- Appearance -->
      <div class=\"card\">
        <div class=\"card__header\">
          <h4 class=\"card__title\">${Icons.sun} Apariencia</h4>
        </div>
        <div class=\"card__body\">
          <div class=\"settings-group\">
            <div class=\"settings-item\">
              <div class=\"settings-item__info\">
                <h5 class=\"settings-item__title\">Tema de la Aplicaci\u00f3n</h5>
                <p class=\"settings-item__description\">Selecciona el modo de visualizaci\u00f3n preferido</p>
              </div>
              <div class=\"theme-selector\">
                <button class=\"theme-option ${theme === 'light' ? 'active' : ''}\" 
                        onclick=\"ConfigModule.setTheme('light')\">
                  ${Icons.sun}
                  <span>Claro</span>
                </button>
                <button class=\"theme-option ${theme === 'dark' ? 'active' : ''}\" 
                        onclick=\"ConfigModule.setTheme('dark')\">
                  ${Icons.moon}
                  <span>Oscuro</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Currency Settings -->
      <div class="card">
        <div class="card__header">
          <h4 class="card__title">${Icons.wallet} Moneda y Finanzas</h4>
        </div>
        <div class="card__body">
          <div class="settings-group">
            <div class="settings-item">
              <div class="settings-item__info">
                <h5 class="settings-item__title">Moneda Principal</h5>
                <p class="settings-item__description">Moneda por defecto para nuevos registros</p>
              </div>
              <select class="form-select" style="width: 150px;" 
                      onchange="ConfigModule.setMoneda(this.value)">
                <option value="USD" ${config.monedaPrincipal === 'USD' ? 'selected' : ''}>USD ($)</option>
                <option value="NIO" ${config.monedaPrincipal === 'NIO' ? 'selected' : ''}>NIO (C$)</option>
              </select>
            </div>
            <div class="settings-item">
              <div class="settings-item__info">
                <h5 class="settings-item__title">Tipo de Cambio USD/NIO</h5>
                <p class="settings-item__description">Tasa de conversión actual (ejemplo: 36.85)</p>
              </div>
              <div style="display: flex; align-items: center; gap: var(--spacing-sm);">
                <span class="text-sm text-muted">1 USD =</span>
                <input type="number" class="form-input" 
                       style="width: 120px; text-align: right; font-weight: var(--font-weight-semibold);"
                       value="${config.tipoCambio}" 
                       step="0.01"
                       min="0"
                       placeholder="36.85"
                       onchange="ConfigModule.setTipoCambio(this.value)">
                <span class="text-sm text-muted">C$</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Notifications -->
      <div class="card">
        <div class="card__header">
          <h4 class="card__title">${Icons.bell} Notificaciones</h4>
        </div>
        <div class="card__body">
          <div class="settings-group">
            <div class="settings-item">
              <div class="settings-item__info">
                <h5 class="settings-item__title">Alertas de Contratos</h5>
                <p class="settings-item__description">Notificar cuando un contrato está por vencer</p>
              </div>
              <label class="toggle">
                <input type="checkbox" class="toggle__input" 
                       ${config.alertasContratos ? 'checked' : ''}
                       onchange="ConfigModule.toggleAlertasContratos(this.checked)">
                <span class="toggle__track"><span class="toggle__thumb"></span></span>
              </label>
            </div>
            <div class="settings-item">
              <div class="settings-item__info">
                <h5 class="settings-item__title">Días de Anticipación</h5>
                <p class="settings-item__description">Días antes del vencimiento para alertar</p>
              </div>
              <input type="number" class="form-input" style="width: 100px;"
                     value="${config.diasAnticipacion}"
                     min="1" max="90"
                     onchange="ConfigModule.setDiasAnticipacion(this.value)">
            </div>
            <div class="settings-item">
              <div class="settings-item__info">
                <h5 class="settings-item__title">Recordatorios de Visitas</h5>
                <p class="settings-item__description">Enviar recordatorio antes de visitas programadas</p>
              </div>
              <label class="toggle">
                <input type="checkbox" class="toggle__input" 
                       ${config.recordatoriosVisitas ? 'checked' : ''}
                       onchange="ConfigModule.toggleRecordatoriosVisitas(this.checked)">
                <span class="toggle__track"><span class="toggle__thumb"></span></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Data Management -->
      <div class="card">
        <div class="card__header">
          <h4 class="card__title">${Icons.settings} Gestión de Datos</h4>
        </div>
        <div class="card__body">
          <div class="settings-group">
            <div class="settings-item">
              <div class="settings-item__info">
                <h5 class="settings-item__title">Exportar Datos</h5>
                <p class="settings-item__description">Descargar todos los datos del sistema</p>
              </div>
              <button class="btn btn--secondary btn--sm" onclick="ConfigModule.exportData()">
                ${Icons.fileText} Exportar
              </button>
            </div>
            <div class="settings-item">
              <div class="settings-item__info">
                <h5 class="settings-item__title">Limpiar Caché Local</h5>
                <p class="settings-item__description">Eliminar datos temporales del navegador</p>
              </div>
              <button class="btn btn--secondary btn--sm" onclick="ConfigModule.clearCache()">
                ${Icons.trash} Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- About -->
      <div class="card">
        <div class="card__header">
          <h4 class="card__title">${Icons.info} Acerca de</h4>
        </div>
        <div class="card__body">
          <div class="about-info">
            <img src="assets/logo.png" alt="ALLTECH Logo" class="about-logo-img" style="max-width: 180px; height: auto; margin-bottom: var(--spacing-md); filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));">
            <h3>ALLTECH</h3>
            <p class="text-muted">Sistema de Gestión de Soporte Técnico</p>
            <p class="text-sm">Versión 1.0.1</p>
            <p class="text-sm" style="margin-top: var(--spacing-sm); color: var(--text-secondary);">
              📍 Camoapa, Nicaragua
            </p>
            <p class="text-xs text-muted" style="margin-top: var(--spacing-md);">
              Desarrollado por ALLTECH © 2026
            </p>
          </div>
        </div>
      </div>
    `;
  };

  // ========== ACTIONS ==========

  const switchTab = (tab) => {
    // Permission check before switching
    const user = State.get('user');
    if (tab === 'usuarios' && !DataService.canPerformAction(user.role, 'usuarios', 'read')) {
      alert('Acceso denegado');
      return;
    }
    if (tab === 'roles' && !DataService.canPerformAction(user.role, 'configuracion', 'update')) {
      alert('Acceso denegado');
      return;
    }

    currentTab = tab;
    App.refreshCurrentModule();
  };

  const toggleSpecificPermission = (role, moduleId, action, enabled) => {
    const currentPerms = DataService.getRolePermissions(role) || {};
    const newPerms = JSON.parse(JSON.stringify(currentPerms)); // Deep copy

    // Initialize module permissions if not exists
    if (!newPerms[moduleId]) {
      newPerms[moduleId] = { create: false, read: false, update: false, delete: false };
    }

    // Update specific permission
    newPerms[moduleId][action] = enabled;

    // Validation: If disabling 'read', disable all other permissions
    if (action === 'read' && !enabled) {
      newPerms[moduleId].create = false;
      newPerms[moduleId].update = false;
      newPerms[moduleId].delete = false;
    }

    // Validation: If enabling create/update/delete, ensure 'read' is enabled
    if ((action === 'create' || action === 'update' || action === 'delete') && enabled) {
      newPerms[moduleId].read = true;
    }

    // Save to DataService
    DataService.updateRolePermissions(role, newPerms);

    // Refresh view
    App.refreshCurrentModule();
  };

  const toggleFullAccess = (role, moduleId, enabled) => {
    const currentPerms = DataService.getRolePermissions(role) || {};
    const newPerms = JSON.parse(JSON.stringify(currentPerms)); // Deep copy

    // Set all permissions to the same value
    newPerms[moduleId] = {
      create: enabled,
      read: enabled,
      update: enabled,
      delete: enabled
    };

    // Save to DataService
    DataService.updateRolePermissions(role, newPerms);

    // Refresh view
    App.refreshCurrentModule();
  };

  const togglePermission = (role, moduleId, enabled) => {
    // Legacy function - redirect to toggleFullAccess for backwards compatibility
    toggleFullAccess(role, moduleId, enabled);
  };

  const setTheme = (theme) => {
    State.set('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    App.refreshCurrentModule();
  };

  const setMoneda = (moneda) => {
    DataService.updateConfig({ monedaPrincipal: moneda });
    App.refreshCurrentModule();
  };

  const setTipoCambio = (valor) => {
    DataService.updateConfig({ tipoCambio: parseFloat(valor) });
  };

  const toggleAlertasContratos = (enabled) => {
    DataService.updateConfig({ alertasContratos: enabled });
  };

  const toggleRecordatoriosVisitas = (enabled) => {
    DataService.updateConfig({ recordatoriosVisitas: enabled });
  };

  const setDiasAnticipacion = (dias) => {
    DataService.updateConfig({ diasAnticipacion: parseInt(dias) });
  };

  const openEditProfile = () => {
    const user = State.get('user');
    document.getElementById('configModal').innerHTML = `
      <div class="modal-overlay open" onclick="ConfigModule.closeModal(event)">
        <div class="modal" onclick="event.stopPropagation()">
          <div class="modal__header">
            <h3 class="modal__title">Editar Perfil</h3>
            <button class="modal__close" onclick="ConfigModule.closeModal()">${Icons.x}</button>
          </div>
          <form class="modal__body" onsubmit="ConfigModule.saveProfile(event)">
            <div class="form-group">
              <label class="form-label">Nombre</label>
              <input type="text" name="name" class="form-input" value="${user.name}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Correo Electrónico</label>
              <input type="email" name="email" class="form-input" value="${user.email}" required>
            </div>
            <div class="modal__footer" style="margin: calc(-1 * var(--spacing-lg)); margin-top: var(--spacing-lg); padding: var(--spacing-lg); border-top: 1px solid var(--border-color);">
              <button type="button" class="btn btn--secondary" onclick="ConfigModule.closeModal()">Cancelar</button>
              <button type="submit" class="btn btn--primary">Guardar</button>
            </div>
          </form>
        </div>
      </div>
    `;
  };

  const saveProfile = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    State.setNested('user.name', formData.get('name'));
    State.setNested('user.email', formData.get('email'));
    closeModal();
    App.refreshCurrentModule();
  };

  const exportData = () => {
    const data = DataService.exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'alltech-support-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearCache = () => {
    if (confirm('¿Estás seguro de que deseas limpiar la caché local?')) {
      localStorage.clear();
      State.init();
      App.refreshCurrentModule();
    }
  };

  const closeModal = (event) => {
    if (event && event.target !== event.currentTarget) return;
    document.getElementById('configModal').innerHTML = '';
  };

  const openCreateUser = () => {
    const availableModules = [
      { id: 'clientes', name: 'Clientes', icon: Icons.users },
      { id: 'contratos', name: 'Contratos', icon: Icons.fileText },
      { id: 'visitas', name: 'Visitas', icon: Icons.calendar },
      { id: 'pedidos', name: 'Pedidos', icon: Icons.shoppingCart },
      { id: 'proformas', name: 'Proformas', icon: Icons.fileText },
      { id: 'productos', name: 'Productos', icon: Icons.package },
      { id: 'equipos', name: 'Equipos', icon: Icons.monitor },
      { id: 'software', name: 'Software', icon: Icons.code },
      { id: 'calendario', name: 'Calendario', icon: Icons.calendar },
      { id: 'reportes', name: 'Reportes', icon: Icons.barChart },
      { id: 'configuracion', name: 'Configuración', icon: Icons.settings }
    ];

    document.getElementById('configModal').innerHTML = `
      <div class="modal-overlay open" onclick="ConfigModule.closeModal(event)">
        <div class="modal" onclick="event.stopPropagation()" style="max-width: 700px;">
          <div class="modal__header">
            <h3 class="modal__title">Crear Nuevo Usuario</h3>
            <button class="modal__close" onclick="ConfigModule.closeModal()">${Icons.x}</button>
          </div>
          <form class="modal__body" onsubmit="ConfigModule.saveNewUser(event)">
            <div class="form-group">
              <label class="form-label">Nombre Completo</label>
              <input type="text" name="name" class="form-input" placeholder="Ej: Juan Pérez" required>
            </div>
            <div class="form-group">
              <label class="form-label">Nombre de Usuario</label>
              <input type="text" name="username" class="form-input" placeholder="Ej: jperez" required>
            </div>
            <div class="form-group">
              <label class="form-label">Correo Electrónico</label>
              <input type="email" name="email" class="form-input" placeholder="usuario@empresa.com" required>
            </div>
            <div class="form-group">
              <label class="form-label">Contraseña</label>
              <input type="password" name="password" class="form-input" placeholder="Mínimo 6 caracteres" minlength="6" required>
            </div>
            <div class="form-group">
              <label class="form-label">Rol del Usuario</label>
              <select name="role" class="form-select" required>
                <option value="">Seleccionar rol...</option>
                <option value="Administrador">Administrador</option>
                <option value="Ejecutivo de Ventas">Ejecutivo de Ventas</option>
                <option value="Tecnico">Técnico / Instalador</option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">Módulos Accesibles</label>
              <p class="text-xs text-muted" style="margin-bottom: var(--spacing-sm);">
                Selecciona los módulos que este usuario podrá ver. Si no seleccionas ninguno, tendrá acceso a todos los módulos según su rol.
              </p>
              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: var(--spacing-sm); padding: var(--spacing-md); background: var(--bg-tertiary); border-radius: var(--border-radius-md);">
                ${availableModules.map(module => `
                  <label style="display: flex; align-items: center; gap: var(--spacing-sm); cursor: pointer;">
                    <input type="checkbox" name="modules" value="${module.id}" style="cursor: pointer;">
                    <span style="font-size: var(--font-size-sm);">${module.icon} ${module.name}</span>
                  </label>
                `).join('')}
              </div>
            </div>
            
            <div class="modal__footer" style="margin: calc(-1 * var(--spacing-lg)); margin-top: var(--spacing-lg); padding: var(--spacing-lg); border-top: 1px solid var(--border-color);">
              <button type="button" class="btn btn--secondary" onclick="ConfigModule.closeModal()">Cancelar</button>
              <button type="submit" class="btn btn--primary">${Icons.plus} Crear Usuario</button>
            </div>
          </form>
        </div>
      </div>
    `;
  };

  const saveNewUser = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const submitBtn = event.target.querySelector('button[type="submit"]');

    // Deshabilitar botón
    submitBtn.disabled = true;
    submitBtn.innerHTML = '⏳ Creando usuario...';

    // Get selected modules
    const selectedModules = Array.from(formData.getAll('modules'));

    const userData = {
      name: formData.get('name'),
      username: formData.get('username'),
      email: formData.get('email'),
      password: formData.get('password'),
      role: formData.get('role'),
      allowedModules: selectedModules
    };

    try {
      // Crear usuario en Supabase Auth + Profile
      const result = await createUser(userData);

      if (result.error) {
        showToast(`Error al crear usuario: ${result.error}`, 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = `${Icons.plus} Crear Usuario`;
        return;
      }

      showToast('Usuario creado exitosamente', 'success');
      closeModal();
      currentTab = 'usuarios';
      App.refreshCurrentModule();
    } catch (error) {
      console.error('Error creating user:', error);
      showToast(`Error: ${error.message}`, 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = `${Icons.plus} Crear Usuario`;
    }
  };

  const editUser = (username) => {
    const user = DataService.getUserByUsername(username);
    if (!user) return;

    const availableModules = [
      { id: 'clientes', name: 'Clientes', icon: Icons.users },
      { id: 'contratos', name: 'Contratos', icon: Icons.fileText },
      { id: 'visitas', name: 'Visitas', icon: Icons.calendar },
      { id: 'pedidos', name: 'Pedidos', icon: Icons.shoppingCart },
      { id: 'proformas', name: 'Proformas', icon: Icons.fileText },
      { id: 'productos', name: 'Productos', icon: Icons.package },
      { id: 'equipos', name: 'Equipos', icon: Icons.monitor },
      { id: 'software', name: 'Software', icon: Icons.code },
      { id: 'calendario', name: 'Calendario', icon: Icons.calendar },
      { id: 'reportes', name: 'Reportes', icon: Icons.barChart },
      { id: 'configuracion', name: 'Configuración', icon: Icons.settings }
    ];

    const userModules = user.allowedModules || [];

    document.getElementById('configModal').innerHTML = `
      <div class="modal-overlay open" onclick="ConfigModule.closeModal(event)">
        <div class="modal" onclick="event.stopPropagation()" style="max-width: 700px;">
          <div class="modal__header">
            <h3 class="modal__title">Editar Usuario</h3>
            <button class="modal__close" onclick="ConfigModule.closeModal()">${Icons.x}</button>
          </div>
          <form class="modal__body" onsubmit="ConfigModule.saveEditUser(event, '${username}')">
            <div class="form-group">
              <label class="form-label">Nombre de Usuario</label>
              <input type="text" class="form-input" value="${user.username}" disabled style="background: var(--bg-tertiary); cursor: not-allowed;">
              <p class="text-xs text-muted" style="margin-top: var(--spacing-xs);">El nombre de usuario no puede modificarse</p>
            </div>
            <div class="form-group">
              <label class="form-label">Nombre Completo</label>
              <input type="text" name="name" class="form-input" value="${user.name}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Correo Electrónico</label>
              <input type="email" name="email" class="form-input" value="${user.email}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Contraseña</label>
              <input type="password" name="password" class="form-input" placeholder="Dejar en blanco para no cambiar" minlength="6">
              <p class="text-xs text-muted" style="margin-top: var(--spacing-xs);">Solo completa si deseas cambiar la contraseña</p>
            </div>
            <div class="form-group">
              <label class="form-label">Rol del Usuario</label>
              <select name="role" class="form-select" required>
                <option value="Administrador" ${user.role === 'Administrador' ? 'selected' : ''}>Administrador</option>
                <option value="Ejecutivo de Ventas" ${user.role === 'Ejecutivo de Ventas' ? 'selected' : ''}>Ejecutivo de Ventas</option>
                <option value="Tecnico" ${user.role === 'Tecnico' ? 'selected' : ''}>Técnico / Instalador</option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">Módulos Accesibles</label>
              <p class="text-xs text-muted" style="margin-bottom: var(--spacing-sm);">
                Selecciona los módulos que este usuario podrá ver. Si no seleccionas ninguno, tendrá acceso a todos los módulos según su rol.
              </p>
              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: var(--spacing-sm); padding: var(--spacing-md); background: var(--bg-tertiary); border-radius: var(--border-radius-md);">
                ${availableModules.map(module => `
                  <label style="display: flex; align-items: center; gap: var(--spacing-sm); cursor: pointer;">
                    <input type="checkbox" name="modules" value="${module.id}" ${userModules.includes(module.id) ? 'checked' : ''} style="cursor: pointer;">
                    <span style="font-size: var(--font-size-sm);">${module.icon} ${module.name}</span>
                  </label>
                `).join('')}
              </div>
            </div>
            <div class="modal__footer" style="margin: calc(-1 * var(--spacing-lg)); margin-top: var(--spacing-lg); padding: var(--spacing-lg); border-top: 1px solid var(--border-color);">
              <button type="button" class="btn btn--secondary" onclick="ConfigModule.closeModal()">Cancelar</button>
              <button type="submit" class="btn btn--primary">${Icons.save} Guardar Cambios</button>
            </div>
          </form>
        </div>
      </div>
    `;
  };

  const saveEditUser = (event, username) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    // Get selected modules
    const selectedModules = Array.from(formData.getAll('modules'));

    const updates = {
      name: formData.get('name'),
      email: formData.get('email'),
      role: formData.get('role'),
      allowedModules: selectedModules
    };

    // Only include password if provided
    const password = formData.get('password');
    if (password && password.trim()) {
      updates.password = password;
    }

    DataService.updateUser(username, updates);
    closeModal();
    App.refreshCurrentModule();
  };

  const deleteUser = (username) => {
    if (confirm(`¿Estás seguro de que deseas eliminar el usuario ${username}?`)) {
      DataService.deleteUser(username);
      App.refreshCurrentModule();
    }
  };

  const exportarBitacora = () => {
    const logsJson = LogService.exportLogs();
    const blob = new Blob([logsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bitacora_alltech_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const limpiarBitacora = () => {
    LogService.clearLogs();
    App.refreshCurrentModule();
  };

  const showToast = (message, type = 'info') => {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
      <div class="toast__icon">${type === 'success' ? Icons.checkCircle : type === 'error' ? Icons.alertCircle : Icons.info}</div>
      <div class="toast__message">${message}</div>
    `;

    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Remove after 3s
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3000);
  };

  return {
    render, switchTab, setTheme, setMoneda, setTipoCambio,
    toggleAlertasContratos, toggleRecordatoriosVisitas, setDiasAnticipacion,
    openEditProfile, saveProfile, exportData, clearCache, closeModal,
    togglePermission, toggleSpecificPermission, toggleFullAccess,
    openCreateUser, saveNewUser, editUser, saveEditUser, deleteUser,
    openCreateUser, saveNewUser, editUser, saveEditUser, deleteUser,
    exportarBitacora, limpiarBitacora, showToast
  };
})();
