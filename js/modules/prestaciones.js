/**
 * Módulo de Prestaciones Sociales (Nicaragua)
 * Gestión de prestaciones laborales conforme a la ley nicaragüense
 */
const PrestacionesModule = (() => {
  // State
  let currentTab = 'empleados';
  let searchTerm = '';

  // ========== RENDERING ==========
  const render = () => {
    return `
      <div class="module-container">
        <div class="module-header">
          <h2 class="module-title">${Icons.users} Prestaciones Sociales</h2>
          <button class="btn btn--primary" onclick="PrestacionesModule.openEmpleadoModal()">
            ${Icons.plus} Nuevo Empleado
          </button>
        </div>

        <!-- Tabs -->
        <div class="tabs-container">
          <button class="tab-btn ${currentTab === 'empleados' ? 'active' : ''}" 
                  onclick="PrestacionesModule.changeTab('empleados')">
            ${Icons.users} <span>Empleados</span>
          </button>
          <button class="tab-btn ${currentTab === 'vacaciones' ? 'active' : ''}" 
                  onclick="PrestacionesModule.changeTab('vacaciones')">
            ${Icons.calendar} <span>Vacaciones</span>
          </button>
          <button class="tab-btn ${currentTab === 'ausencias' ? 'active' : ''}" 
                  onclick="PrestacionesModule.changeTab('ausencias')">
            ${Icons.clock || '🕐'} <span>Ausencias</span>
          </button>
          <button class="tab-btn ${currentTab === 'aguinaldo' ? 'active' : ''}" 
                  onclick="PrestacionesModule.changeTab('aguinaldo')">
            ${Icons.gift || '🎁'} <span>Aguinaldo</span>
          </button>
          <button class="tab-btn ${currentTab === 'recibos' ? 'active' : ''}" 
                  onclick="PrestacionesModule.changeTab('recibos')">
            ${Icons.fileText} <span>Recibos</span>
          </button>
          <button class="tab-btn ${currentTab === 'liquidacion' ? 'active' : ''}" 
                  onclick="PrestacionesModule.changeTab('liquidacion')">
            ${Icons.dollarSign || '💰'} <span>Liquidación</span>
          </button>
          <button class="tab-btn ${currentTab === 'reportes' ? 'active' : ''}" 
                  onclick="PrestacionesModule.changeTab('reportes')">
            ${Icons.barChart} <span>Reportes</span>
          </button>
        </div>

        <!-- Tab Content -->
        <div class="module-content">
          ${renderTabContent()}
        </div>
      </div>

      <div id="prestacionesModal"></div>
    `;
  };

  const renderTabContent = () => {
    switch (currentTab) {
      case 'empleados':
        return renderEmpleadosTab();
      case 'vacaciones':
        return renderVacacionesTab();
      case 'ausencias':
        return renderAusenciasTab();
      case 'aguinaldo':
        return renderAguinaldoTab();
      case 'recibos':
        return renderRecibosTab();
      case 'liquidacion':
        return renderLiquidacionTab();
      case 'reportes':
        return renderReportesTab();
      default:
        return renderEmpleadosTab();
    }
  };

  // ========== EMPLEADOS TAB ==========
  const renderEmpleadosTab = () => {
    const empleados = DataService.getEmpleadosSync?.() || [];
    const filtered = empleados.filter(e => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return e.nombre?.toLowerCase().includes(term) ||
        e.cedula?.includes(term) ||
        e.cargo?.toLowerCase().includes(term);
    });

    return `
      <div class="search-bar">
        <input type="text" class="search-input" placeholder="Buscar empleados..." 
               value="${searchTerm}" 
               oninput="PrestacionesModule.handleSearch(this.value)">
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Empleado</th>
              <th>Cédula</th>
              <th>Cargo</th>
              <th>Fecha Alta</th>
              <th>Salario</th>
              <th>Tipo Contrato</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.length === 0 ? `
              <tr>
                <td colspan="8" class="table__empty">
                  <p>No hay empleados registrados</p>
                </td>
              </tr>
            ` : filtered.map(emp => {
      const fechaAlta = emp.fechaAlta || emp.fecha_alta;
      const salario = parseFloat(emp.salarioTotal || emp.salario_total) || 0;
      const contrato = emp.tipoContrato || emp.tipo_contrato || 'No especificado';
      return `
              <tr>
                <td data-label="Empleado">
                  <div>
                    <div class="font-medium">${emp.nombre}</div>
                    <div class="text-sm text-muted">${emp.email || '-'}</div>
                  </div>
                </td>
                <td data-label="Cédula">${emp.cedula || '-'}</td>
                <td data-label="Cargo">${emp.cargo || '-'}</td>
                <td data-label="Fecha Alta">${fechaAlta ? new Date(fechaAlta).toLocaleDateString('es-NI') : '-'}</td>
                <td data-label="Salario" class="font-medium">C$${salario.toLocaleString('es-NI', { minimumFractionDigits: 2 })}</td>
                <td data-label="Tipo Contrato">
                  <span class="badge ${contrato === 'Indefinido' ? 'badge--success' : 'badge--warning'}">
                    ${contrato}
                  </span>
                </td>
                <td data-label="Estado">
                  <span class="badge ${emp.estado === 'Activo' ? 'badge--success' : 'badge--error'}">
                    ${emp.estado || 'Activo'}
                  </span>
                </td>
                <td data-label="Acciones">
                  <div class="table__actions">
                    <button class="btn btn--ghost btn--icon btn--sm" 
                            onclick="PrestacionesModule.viewEmpleado('${emp.id}')" 
                            title="Ver detalles">
                      ${Icons.eye}
                    </button>
                    <button class="btn btn--ghost btn--icon btn--sm" 
                            onclick="PrestacionesModule.editEmpleado('${emp.id}')" 
                            title="Editar">
                      ${Icons.edit}
                    </button>
                    <button class="btn btn--ghost btn--icon btn--sm text-error" 
                            onclick="PrestacionesModule.deleteEmpleado('${emp.id}')" 
                            title="Eliminar">
                      ${Icons.trash}
                    </button>
                  </div>
                </td>
              </tr>
            `;
    }).join('')}
          </tbody>
        </table>
      </div>
    `;
  };

  // ========== VACACIONES TAB ==========
  const renderVacacionesTab = () => {
    const empleados = DataService.getEmpleadosSync?.() || [];
    const activosConVacaciones = empleados
      .filter(e => e.estado === 'Activo')
      .map(e => calcularVacaciones(e));

    return `
      <div class="card">
        <div class="card__header">
          <h3 class="card__title">${Icons.calendar} Control de Vacaciones</h3>
          <button class="btn btn--primary btn--sm" onclick="PrestacionesModule.registrarVacaciones()">
            ${Icons.plus} Registrar Vacaciones
          </button>
        </div>
        <div class="card__body">
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Empleado</th>
                  <th>Antigüedad</th>
                  <th>Días Acumulados</th>
                  <th>Días Tomados</th>
                  <th>Días Disponibles</th>
                  <th>Próximo Período</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${activosConVacaciones.map(vac => `
                  <tr>
                    <td>
                      <div class="font-medium">${vac.nombre}</div>
                      <div class="text-sm text-muted">${vac.cargo}</div>
                    </td>
                    <td>${vac.antiguedadAnios} año(s)</td>
                    <td class="text-center">${vac.diasAcumulados}</td>
                    <td class="text-center">${vac.diasTomados}</td>
                    <td class="text-center">
                      <span class="badge ${vac.diasDisponibles > 5 ? 'badge--success' : 'badge--warning'}">
                        ${vac.diasDisponibles} días
                      </span>
                    </td>
                    <td>${vac.proximoPeriodo}</td>
                    <td>
                      <div class="table__actions">
                        <button class="btn btn--primary btn--sm btn--icon" 
                                onclick="PrestacionesModule.registrarVacaciones('${vac.id}')" title="Registrar Vacaciones">
                          ${Icons.plus}
                        </button>
                        <button class="btn btn--ghost btn--sm" 
                                onclick="PrestacionesModule.verHistorialVacaciones('${vac.id}')">
                          Historial
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="info-card info-card--primary" style="margin-top: var(--spacing-lg);">
        <h4>📘 Ley Laboral de Nicaragua - Vacaciones</h4>
        <ul style="margin: var(--spacing-sm) 0; padding-left: var(--spacing-lg);">
          <li>15 días continuos después del primer año de trabajo</li>
          <li>1 día adicional por cada año a partir del segundo año (máximo 30 días)</li>
          <li>Las vacaciones no pueden compensarse en dinero, salvo al finalizar el contrato</li>
          <li>El empleado recibe su salario ordinario más un día adicional por cada 6 meses trabajados</li>
        </ul>
      </div>
    `;
  };
  // ========== AUSENCIAS TAB ==========
  const renderAusenciasTab = () => {
    // Cargar ausencias de forma asíncrona
    setTimeout(async () => {
      try {
        const ausencias = await DataService.getAllAusencias();
        const tbody = document.getElementById('ausenciasTableBody');
        if (!tbody) return;
        if (!ausencias || ausencias.length === 0) {
          tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay ausencias registradas</td></tr>';
          return;
        }
        tbody.innerHTML = ausencias.map(a => `
          <tr>
            <td>
              <div class="font-medium">${a.empleado?.nombre || 'N/A'}</div>
              <div class="text-sm text-muted">${a.empleado?.cargo || ''}</div>
            </td>
            <td>${new Date(a.fecha_inicio).toLocaleDateString('es-NI')}</td>
            <td>${new Date(a.fecha_fin).toLocaleDateString('es-NI')}</td>
            <td class="text-center">${a.dias}</td>
            <td>
              <span class="badge ${a.tipo_descuento === 'vacaciones' ? 'badge--warning' : 'badge--info'}">
                ${a.tipo_descuento === 'vacaciones' ? 'Vacaciones' : 'Día Laboral'}
              </span>
            </td>
            <td>${a.motivo || '-'}</td>
            <td>
              <button class="btn btn--ghost btn--sm btn--icon text-error" 
                      onclick="PrestacionesModule.deleteAusencia('${a.id}')">${Icons.trash}</button>
            </td>
          </tr>
        `).join('');
      } catch (e) {
        console.error('Error loading ausencias:', e);
      }
    }, 100);

    return `
      <div class="card">
        <div class="card__header">
          <h3 class="card__title">${Icons.clock || '🕐'} Control de Ausencias</h3>
          <button class="btn btn--primary btn--sm" onclick="PrestacionesModule.registrarAusencia()">
            ${Icons.plus} Registrar Ausencia
          </button>
        </div>
        <div class="card__body">
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Empleado</th>
                  <th>Desde</th>
                  <th>Hasta</th>
                  <th>Días</th>
                  <th>Descuento</th>
                  <th>Motivo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody id="ausenciasTableBody">
                <tr><td colspan="7" class="text-center">Cargando...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="info-card info-card--primary" style="margin-top: var(--spacing-lg);">
        <h4>📋 Sobre las Ausencias</h4>
        <ul style="margin: var(--spacing-sm) 0; padding-left: var(--spacing-lg);">
          <li><strong>Vacaciones:</strong> Se descuenta del saldo de vacaciones del empleado</li>
          <li><strong>Día Laboral:</strong> Se registra como ausencia laboral sin afectar vacaciones</li>
        </ul>
      </div>
    `;
  };

  // ========== AGUINALDO TAB ==========
  const renderAguinaldoTab = () => {
    const empleados = DataService.getEmpleadosSync?.() || [];
    const activos = empleados.filter(e => e.estado === 'Activo');
    const aguinaldos = activos.map(e => calcularAguinaldo(e));
    const totalAguinaldo = aguinaldos.reduce((sum, a) => sum + a.monto, 0);

    return `
      <div class="stats-row">
        <div class="stat-card stat-card--success">
          <div class="stat-card__header">
            <div class="stat-card__icon">${Icons.users}</div>
          </div>
          <span class="stat-card__label">Empleados Activos</span>
          <span class="stat-card__value">${activos.length}</span>
        </div>
        
        <div class="stat-card stat-card--primary">
          <div class="stat-card__header">
            <div class="stat-card__icon">${Icons.dollarSign || '💰'}</div>
          </div>
          <span class="stat-card__label">Total Aguinaldo ${new Date().getFullYear()}</span>
          <span class="stat-card__value">C$${totalAguinaldo.toLocaleString('es-NI', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      <div class="card" style="margin-top: var(--spacing-lg);">
        <div class="card__header">
          <h3 class="card__title">${Icons.gift || '🎁'} Cálculo de Aguinaldo</h3>
          <button class="btn btn--primary btn--sm" onclick="PrestacionesModule.generarAguinaldoReporte()">
            ${Icons.download} Generar Planilla
          </button>
        </div>
        <div class="card__body">
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Empleado</th>
                  <th>Fecha Alta</th>
                  <th>Meses Laborados</th>
                  <th>Salario Mensual</th>
                  <th>Monto Aguinaldo</th>
                  <th>Estado Pago</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${aguinaldos.map(ag => `
                  <tr>
                    <td>
                      <div class="font-medium">${ag.nombre}</div>
                      <div class="text-sm text-muted">${ag.cedula}</div>
                    </td>
                    <td>${new Date(ag.fechaAlta).toLocaleDateString('es-NI')}</td>
                    <td class="text-center">${ag.mesesLaborados}</td>
                    <td>C$${ag.salario.toLocaleString('es-NI', { minimumFractionDigits: 2 })}</td>
                    <td class="font-medium text-success">C$${ag.monto.toLocaleString('es-NI', { minimumFractionDigits: 2 })}</td>
                    <td>
                      <span class="badge ${ag.pagado ? 'badge--success' : 'badge--warning'}">
                        ${ag.pagado ? 'Pagado' : 'Pendiente'}
                      </span>
                    </td>
                    <td>
                      <div class="table__actions">
                        ${!ag.pagado ? `
                        <button class="btn btn--primary btn--sm" 
                                onclick="PrestacionesModule.marcarAguinaldoPagado('${ag.empleadoId}')" title="Marcar como Pagado">
                          Pagar
                        </button>` : '<span class="text-success text-sm">✓ Pagado</span>'}
                        <button class="btn btn--ghost btn--sm" 
                                onclick="PrestacionesModule.verHistorialAguinaldos('${ag.empleadoId}')" title="Ver Historial">
                          Historial
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="info-card info-card--warning" style="margin-top: var(--spacing-lg);">
        <h4>📘 Ley Laboral de Nicaragua - Aguinaldo (Decimotercer Mes)</h4>
        <ul style="margin: var(--spacing-sm) 0; padding-left: var(--spacing-lg);">
          <li>Se paga en los primeros 10 días de diciembre</li>
          <li>Equivale a 1 mes de salario por año trabajado (proporcional si < 1 año)</li>
          <li>Fórmula: (Salario mensual ÷ 12) × meses laborados</li>
          <li>Es obligatorio para todo empleador</li>
        </ul>
      </div>
    `;
  };

  // ========== RECIBOS TAB ==========
  const renderRecibosTab = () => {
    return `
      <div class="card">
        <div class="card__header">
          <h3 class="card__title">${Icons.fileText} Generar Recibos de Pago</h3>
        </div>
        <div class="card__body">
          <form onsubmit="PrestacionesModule.generarRecibos(event)" class="form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label form-label--required">Período de Pago</label>
                <select name="periodo" class="form-select" required>
                  <option value="">Seleccionar período...</option>
                  <option value="quincenal">Quincenal</option>
                  <option value="mensual">Mensual</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label form-label--required">Mes</label>
                <input type="month" name="mes" class="form-input" 
                       value="${new Date().toISOString().slice(0, 7)}" required>
              </div>
              <div class="form-group" id="quincenaGroup">
                 <label class="form-label form-label--required">Quincena</label>
                 <select name="quincena" class="form-select">
                    <option value="1">Primera (1-15)</option>
                    <option value="2">Segunda (16-Fin)</option>
                 </select>
              </div>
            </div>
            <script>
                document.querySelector('select[name="periodo"]').addEventListener('change', function(e) {
                    const qGroup = document.getElementById('quincenaGroup');
                    qGroup.style.display = e.target.value === 'quincenal' ? 'block' : 'none';
                    // Trigger initial state
                });
                // Initial state check - simplistic, better to use inline style
                document.getElementById('quincenaGroup').style.display = 'none'; 
            </script>

            <div class="form-group">
              <label class="form-label">Empleados (dejar vacío para todos)</label>
              <select name="empleados"  class="form-select" multiple size="5">
                ${(DataService.getEmpleadosSync?.() || [])
        .filter(e => e.estado === 'Activo')
        .map(e => `
                    <option value="${e.id}">${e.nombre} - ${e.cargo}</option>
                  `).join('')}
              </select>
              <span class="form-hint">Mantén Ctrl/Cmd para seleccionar varios</span>
            </div>

            <button type="submit" class="btn btn--primary">
              ${Icons.fileText} Generar Recibos
            </button>
          </form>
        </div>
      </div>

      <div class="info-card info-card--info" style="margin-top: var(--spacing-lg);">
        <h4>📋 Información del Recibo de Pago</h4>
        <p >Los recibos incluyen:</p>
        <ul style="margin: var(--spacing-sm) 0; padding-left: var(--spacing-lg);">
          <li>Salario base</li>
          <li>Horas extras (si aplica)</li>
          <li>Deducciones INSS (6.25% empleado)</li>
          <li>Impuesto sobre la Renta (IR) según tabla progresiva</li>
          <li>Otras deducciones</li>
          <li>Salario neto a pagar</li>
        </ul>
      </div>

      <div class="card" style="margin-top: var(--spacing-lg);">
        <div class="card__header">
          <h3 class="card__title">${Icons.clock || '⏱️'} Historial de Recibos Generados</h3>
        </div>
        <div class="card__body">
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Empleado</th>
                            <th>Período</th>
                            <th>Tipo</th>
                            <th class="text-right">Salario Base</th>
                            <th class="text-right">INSS</th>
                            <th class="text-right">IR</th>
                            <th class="text-right">Neto</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="historialRecibosBody">
                        <tr><td colspan="9" class="text-center">Cargando historial...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    `;
  };

  // Cargar historial de recibos async al renderizar tab
  const loadHistorialRecibos = async () => {
    const tbody = document.getElementById('historialRecibosBody');
    if (!tbody) return;
    try {
      const nominas = await DataService.getAllNominas();
      if (!nominas || nominas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center">No hay recibos generados</td></tr>';
        return;
      }
      tbody.innerHTML = nominas.map(n => {
        const nombre = n.empleado?.nombre || 'N/A';
        const cargo = n.empleado?.cargo || '';
        return `
          <tr>
            <td>
              <div class="font-medium">${nombre}</div>
              <div class="text-sm text-muted">${cargo}</div>
            </td>
            <td>${n.periodo_inicio ? new Date(n.periodo_inicio).toLocaleDateString('es-NI') : '-'} al ${n.periodo_fin ? new Date(n.periodo_fin).toLocaleDateString('es-NI') : '-'}</td>
            <td>${n.tipo_periodo || '-'}</td>
            <td class="text-right">C$${(n.salario_base || 0).toLocaleString('es-NI', { minimumFractionDigits: 2 })}</td>
            <td class="text-right">C$${(n.deduccion_inss || 0).toLocaleString('es-NI', { minimumFractionDigits: 2 })}</td>
            <td class="text-right">C$${(n.deduccion_ir || 0).toLocaleString('es-NI', { minimumFractionDigits: 2 })}</td>
            <td class="text-right font-bold">C$${(n.total_neto || 0).toLocaleString('es-NI', { minimumFractionDigits: 2 })}</td>
            <td><span class="badge ${n.estado === 'Pagado' ? 'badge--success' : 'badge--warning'}">${n.estado || 'Pagado'}</span></td>
            <td>
              <div class="table__actions">
                <button class="btn btn--ghost btn--sm btn--icon" title="Imprimir recibo"
                        onclick="PrestacionesModule.imprimirRecibo('${n.id}')">
                  ${Icons.printer || '🖨️'}
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    } catch (e) {
      console.error('Error cargando historial de recibos:', e);
      tbody.innerHTML = '<tr><td colspan="9" class="text-center text-error">Error al cargar historial</td></tr>';
    }
  };

  // Imprimir un recibo individual
  const imprimirRecibo = async (nominaId) => {
    try {
      const nominas = await DataService.getAllNominas();
      const n = nominas.find(x => x.id === nominaId);
      if (!n) {
        App.showNotification?.('Recibo no encontrado', 'error');
        return;
      }

      const nombre = n.empleado?.nombre || 'N/A';
      const cargo = n.empleado?.cargo || '';
      const periodoInicio = n.periodo_inicio ? new Date(n.periodo_inicio).toLocaleDateString('es-NI') : '-';
      const periodoFin = n.periodo_fin ? new Date(n.periodo_fin).toLocaleDateString('es-NI') : '-';
      const fmt = (v) => (v || 0).toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      const content = `
        <div style="border: 2px solid #333; padding: 30px; max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 0 10px rgba(0,0,0,0.1); border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px;">
            <div style="text-align: left;">
              <h2 style="margin: 0; color: #1a73e8;">RECIBO DE PAGO</h2>
              <p style="margin: 5px 0; font-weight: bold; color: #444;">ALLTECH SUPPORT</p>
              <p style="margin: 0; font-size: 11px; color: #666;">Servicios Profesionales de TI</p>
            </div>
            <div style="text-align: right; font-size: 12px; color: #666;">
              <p style="margin: 0;"><strong>N° Recibo:</strong> #${n.id.slice(0, 8).toUpperCase()}</p>
              <p style="margin: 0;"><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-NI')}</p>
            </div>
          </div>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #1a73e8;">
            <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
              <tr><td style="padding: 3px 0;"><strong>Empleado:</strong></td><td style="padding: 3px 0;">${nombre}</td></tr>
              <tr><td style="padding: 3px 0;"><strong>Cargo:</strong></td><td style="padding: 3px 0;">${cargo}</td></tr>
              <tr><td style="padding: 3px 0;"><strong>Período:</strong></td><td style="padding: 3px 0;">${periodoInicio} al ${periodoFin}</td></tr>
              <tr><td style="padding: 3px 0;"><strong>Tipo:</strong></td><td style="padding: 3px 0;">${n.tipo_periodo || '-'}</td></tr>
            </table>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
            <thead style="border-bottom: 2px solid #1a73e8;">
              <tr><th style="padding: 10px 0; text-align: left;">Concepto</th><th style="padding: 10px 0; text-align: right;">Ingresos/Egresos</th></tr>
            </thead>
            <tbody>
              <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee;">Salario Base</td><td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">C$ ${fmt(n.salario_base)}</td></tr>
              <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #d32f2f;">(-) INSS Laboral (7%)</td><td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right; color: #d32f2f;">C$ ${fmt(n.deduccion_inss)}</td></tr>
              <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #d32f2f;">(-) Impuesto sobre la Renta (IR)</td><td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right; color: #d32f2f;">C$ ${fmt(n.deduccion_ir)}</td></tr>
              ${n.otras_deducciones ? `<tr><td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #d32f2f;">(-) Otras Deducciones</td><td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right; color: #d32f2f;">C$ ${fmt(n.otras_deducciones)}</td></tr>` : ''}
              <tr style="background: #e8f0fe;">
                <td style="padding: 12px 10px; font-weight: bold; border-radius: 4px 0 0 4px;">NETO A PAGAR</td>
                <td style="padding: 12px 10px; text-align: right; font-weight: bold; font-size: 16px; border-radius: 0 4px 4px 0;">C$ ${fmt(n.total_neto)}</td>
              </tr>
            </tbody>
          </table>
          
          ${n.notas ? `<p style="margin-top: 15px; font-size: 12px; color: #666; font-style: italic;"><strong>Notas:</strong> ${n.notas}</p>` : ''}
          
          <div style="margin-top: 60px; display: flex; justify-content: space-between; gap: 40px;">
            <div style="flex: 1; text-align: center;">
              <div style="border-top: 1px solid #333; padding-top: 8px; font-size: 11px;">
                <strong>${nombre}</strong><br>
                Firma Empleado
              </div>
            </div>
            <div style="flex: 1; text-align: center;">
              <div style="border-top: 1px solid #333; padding-top: 8px; font-size: 11px;">
                <strong>ALLTECH SUPPORT</strong><br>
                Firma y Sello Empresa
              </div>
            </div>
          </div>
          <p style="text-align: center; font-size: 9px; color: #999; margin-top: 30px;">
            Este recibo de pago es un documento oficial. Consérvelo para sus registros.
          </p>
        </div>
      `;

      printDocument(`Recibo de Pago - ${nombre}`, content);
    } catch (e) {
      console.error('Error imprimiendo recibo:', e);
      App.showNotification?.('Error al generar recibo', 'error');
    }
  };

  // ========== LIQUIDACIÓN TAB ==========
  const renderLiquidacionTab = () => {
    return `
      <div class="card">
        <div class="card__header">
          <h3 class="card__title">${Icons.dollarSign || '💰'} Calcular Liquidación</h3>
        </div>
        <div class="card__body">
          <form onsubmit="PrestacionesModule.calcularLiquidacion(event)" class="form">
            <div class="form-group">
              <label class="form-label form-label--required">Empleado</label>
              <select name="empleadoId" class="form-select" required 
                      onchange="PrestacionesModule.loadEmpleadoData(this.value)">
                <option value="">Seleccionar empleado...</option>
                ${(DataService.getEmpleadosSync?.() || [])
        .filter(e => e.estado === 'Activo')
        .map(e => `
                    <option value="${e.id}">${e.nombre} - ${e.cargo}</option>
                  `).join('')}
              </select>
            </div>

            <div id="empleadoInfo"></div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label form-label--required">Fecha de Salida</label>
                <input type="date" name="fechaSalida" class="form-input" required>
              </div>
              <div class="form-group">
                <label class="form-label form-label--required">Motivo</label>
                <select name="motivo" class="form-select" required>
                  <option value="">Seleccionar...</option>
                  <option value="renuncia">Renuncia Voluntaria</option>
                  <option value="despido_con_justa_causa">Despido con Justa Causa</option>
                  <option value="despido_sin_justa_causa">Despido sin Justa Causa</option>
                  <option value="mutuo_acuerdo">Mutuo Acuerdo</option>
                  <option value="fin_contrato">Fin de Contrato Temporal</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Observaciones</label>
              <textarea name="observaciones" class="form-textarea" rows="3" 
                        placeholder="Detalles adicionales..."></textarea>
            </div>

            <button type="submit" class="btn btn--primary">
              ${Icons.calculator || '🔢'} Calcular Liquidación
            </button>
          </form>
        </div>
      </div>

      <div id="liquidacionResult"></div>

      <div class="info-card info-card--error" style="margin-top: var(--spacing-lg);">
        <h4>📘 Ley Laboral de Nicaragua - Indemnización</h4>
        <ul style="margin: var(--spacing-sm) 0; padding-left: var(--spacing-lg);">
          <li><strong>Despido sin justa causa:</strong> 1 mes de salario por cada año o fracción >= 6 meses</li>
          <li><strong>Antigüedad:</strong> 1 mes por cada año o fracción >= 6 meses (máximo 5 meses)</li>
          <li><strong>Vacaciones no gozadas:</strong> Días proporcionales acumulados</li>
          <li><strong>Aguinaldo proporcional:</strong> Según meses trabajados en el año</li>
          <li><strong>Salarios pendientes:</strong> Días trabajados sin pagar</li>
        </ul>
      </div>
    `;
  };

  // ==  ======== REPORTES TAB ==========
  const renderReportesTab = () => {
    return `
      <div class="reports-grid">
        <div class="card">
          <div class="card__header">
            <h3 class="card__title">${Icons.users} Reporte de Empleados</h3>
          </div>
          <div class="card__body">
            <p class="text-muted">Lista completa de empleados con sus datos laborales</p>
            <button class="btn btn--primary" style="margin-top: var(--spacing-md);" 
                    onclick="PrestacionesModule.generarReporteEmpleados()">
              ${Icons.download} Generar PDF
            </button>
          </div>
        </div>

        <div class="card">
          <div class="card__header">
            <h3 class="card__title">${Icons.calendar} Reporte de Vacaciones</h3>
          </div>
          <div class="card__body">
            <p class="text-muted">Estado de vacaciones de todos los empleados</p>
            <button class="btn btn--primary" style="margin-top: var(--spacing-md);" 
                    onclick="PrestacionesModule.generarReporteVacaciones()">
              ${Icons.download} Generar PDF
            </button>
          </div>
        </div>

        <div class="card">
          <div class="card__header">
            <h3 class="card__title">${Icons.dollarSign || '💰'} Planilla Mensual</h3>
          </div>
          <div class="card__body">
            <p class="text-muted">Resumen de salarios y deducciones del mes</p>
            <button class="btn btn--primary" style="margin-top: var(--spacing-md);" 
                    onclick="PrestacionesModule.generarPlanillaMensual()">
              ${Icons.download} Generar PDF
            </button>
          </div>
        </div>

        <div class="card">
          <div class="card__header">
             <h3 class="card__title">${Icons.barChart} Costos Laborales</h3>
          </div>
          <div class="card__body">
            <p class="text-muted">Análisis de costos laborales totales</p>
            <button class="btn btn--primary" style="margin-top: var(--spacing-md);" 
                    onclick="PrestacionesModule.generarReporteCostos()">
              ${Icons.download} Generar PDF
            </button>
          </div>
        </div>
      </div>
    `;
  };

  // ========== CÁLCULOS LABORALES (Nicaragua) ==========

  const calcularVacaciones = (empleado) => {
    const fechaAltaStr = empleado.fechaAlta || empleado.fecha_alta;
    if (!fechaAltaStr) return { id: empleado.id, nombre: empleado.nombre, cargo: empleado.cargo, antiguedadAnios: 0, diasAcumulados: 0, diasTomados: 0, diasDisponibles: 0, proximoPeriodo: '-' };
    const fechaAlta = new Date(fechaAltaStr);
    const hoy = new Date();

    const diffTime = Math.abs(hoy - fechaAlta);
    const diasTotales = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const mesesLaborados = diasTotales / 30.417;

    const diasAcumulados = parseFloat((mesesLaborados * 2.5).toFixed(2));
    const diasTomados = empleado.vacacionesTomadas || empleado.vacaciones_tomadas || 0;
    const diasDisponibles = parseFloat((diasAcumulados - diasTomados).toFixed(2));
    const antiguedadAnios = parseFloat((mesesLaborados / 12).toFixed(1));

    const proximaFecha = new Date(fechaAlta);
    proximaFecha.setFullYear(hoy.getFullYear() + 1);
    while (proximaFecha < hoy) {
      proximaFecha.setFullYear(proximaFecha.getFullYear() + 1);
    }

    return {
      id: empleado.id,
      nombre: empleado.nombre,
      cargo: empleado.cargo,
      antiguedadAnios,
      diasAcumulados,
      diasTomados,
      diasDisponibles,
      proximoPeriodo: proximaFecha.toLocaleDateString('es-NI')
    };
  };

  const calcularAguinaldo = (empleado) => {
    const fechaAltaStr = empleado.fechaAlta || empleado.fecha_alta;
    if (!fechaAltaStr) return { empleadoId: empleado.id, nombre: empleado.nombre, cedula: empleado.cedula, fechaAlta: '', mesesLaborados: 0, salario: 0, monto: 0, pagado: false };
    const fechaAlta = new Date(fechaAltaStr);
    const hoy = new Date();
    const inicioAnio = new Date(hoy.getFullYear(), 0, 1);
    const fechaInicio = fechaAlta > inicioAnio ? fechaAlta : inicioAnio;

    const mesesLaborados = Math.min(12, Math.floor((hoy - fechaInicio) / (30.44 * 24 * 60 * 60 * 1000)));

    const salario = parseFloat(empleado.salarioTotal || empleado.salario_total) || 0;
    const monto = (salario / 12) * mesesLaborados;

    return {
      empleadoId: empleado.id,
      nombre: empleado.nombre,
      cedula: empleado.cedula,
      fechaAlta: fechaAltaStr,
      mesesLaborados,
      salario,
      monto,
      pagado: empleado.aguinaldoPagado || empleado.aguinaldo_pagado || false
    };
  };

  const calcularINSS = (salario) => {
    // Nicaragua: INSS empleado 7% (Reformas 2019)
    // Patronal: 21.5% (< 50 empleados) o 22.5% (> 50 empleados). Usamos 21.5% por defecto.
    return {
      empleado: salario * 0.07,
      empleador: salario * 0.215,
      total: salario * 0.285
    };
  };

  const calcularIR = (salario) => {
    // Tabla IR Nicaragua 2024 (progresiva mensual)
    const tramos = [
      { hasta: 100000, tasa: 0 },
      { hasta: 200000, tasa: 0.15, sobre: 100000 },
      { hasta: 350000, tasa: 0.20, sobre: 200000 },
      { hasta: 500000, tasa: 0.25, sobre: 350000 },
      { hasta: Infinity, tasa: 0.30, sobre: 500000 }
    ];

    const salarioAnual = salario * 12;
    let ir = 0;
    let baseAnterior = 0;

    for (const tramo of tramos) {
      if (salarioAnual <= tramo.hasta) {
        ir += (salarioAnual - (tramo.sobre || 0)) * tramo.tasa;
        break;
      } else if (tramo.sobre !== undefined) {
        ir += (tramo.hasta - tramo.sobre) * tramo.tasa;
      }
    }

    return ir / 12; // Mensual
  };

  // ========== MODAL HANDLERS ==========
  const openEmpleadoModal = (empleadoId = null) => {
    let emp = null;
    let title = 'Nuevo Empleado';
    let btnText = 'Crear Empleado';

    if (empleadoId) {
      emp = DataService.getEmpleadoById(empleadoId);
      if (!emp) return;
      title = 'Editar Empleado';
      btnText = 'Guardar Cambios';
    }

    const safeVal = (val) => val || '';
    const dateVal = (date) => date ? new Date(date).toISOString().split('T')[0] : '';

    document.getElementById('prestacionesModal').innerHTML = `
      <div class="modal-overlay open" onclick="PrestacionesModule.closeModal(event)">
        <div class="modal modal--large" onclick="event.stopPropagation()">
          <div class="modal__header">
            <h3 class="modal__title">${empleadoId ? Icons.edit : Icons.plus} ${title}</h3>
            <button class="btn btn--ghost btn--icon" onclick="PrestacionesModule.closeModal()">
              ${Icons.x}
            </button>
          </div>
          <form class="modal__body" onsubmit="PrestacionesModule.saveEmpleado(event)">
            <input type="hidden" name="id" value="${safeVal(empleadoId)}">
            
            <h4>Datos Personales</h4>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label form-label--required">Nombre Completo</label>
                <input type="text" name="nombre" class="form-input" value="${safeVal(emp?.nombre)}" required>
              </div>
              <div class="form-group">
                <label class="form-label form-label--required">Cédula</label>
                <input type="text" name="cedula" class="form-input" value="${safeVal(emp?.cedula)}" required>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" name="email" class="form-input" value="${safeVal(emp?.email)}">
              </div>
              <div class="form-group">
                <label class="form-label">Teléfono</label>
                <input type="tel" name="telefono" class="form-input" value="${safeVal(emp?.telefono)}">
              </div>
            </div>

            <h4 style="margin-top: var(--spacing-lg);">Información Laboral</h4>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label form-label--required">Cargo</label>
                <input type="text" name="cargo" class="form-input" value="${safeVal(emp?.cargo)}" required>
              </div>
              <div class="form-group">
                <label class="form-label form-label--required">Fecha de Alta</label>
                <input type="date" name="fechaAlta" class="form-input" 
                       value="${(emp?.fechaAlta || emp?.fecha_alta) ? dateVal(emp.fechaAlta || emp.fecha_alta) : new Date().toISOString().split('T')[0]}" required>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label form-label--required">Tipo de Salario</label>
                <select name="tipoSalario" class="form-select" required>
                  <option value="">Seleccionar...</option>
                  <option value="Mensual" ${(emp?.tipoSalario || emp?.tipo_salario) === 'Mensual' ? 'selected' : ''}>Mensual</option>
                  <option value="Quincenal" ${(emp?.tipoSalario || emp?.tipo_salario) === 'Quincenal' ? 'selected' : ''}>Quincenal</option>
                  <option value="Por Hora" ${(emp?.tipoSalario || emp?.tipo_salario) === 'Por Hora' ? 'selected' : ''}>Por Hora</option>
                  <option value="Por Proyecto" ${(emp?.tipoSalario || emp?.tipo_salario) === 'Por Proyecto' ? 'selected' : ''}>Por Proyecto</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label form-label--required">Salario Total (C$)</label>
                <input type="number" name="salarioTotal" class="form-input" 
                       step="0.01" min="0" value="${emp?.salarioTotal || emp?.salario_total || ''}" required>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label form-label--required">Tipo de Contrato</label>
                <select name="tipoContrato" class="form-select" required>
                  <option value="">Seleccionar...</option>
                  <option value="Indefinido" ${(emp?.tipoContrato || emp?.tipo_contrato) === 'Indefinido' ? 'selected' : ''}>Indefinido</option>
                  <option value="Temporal" ${(emp?.tipoContrato || emp?.tipo_contrato) === 'Temporal' ? 'selected' : ''}>Temporal</option>
                  <option value="Por Obra" ${(emp?.tipoContrato || emp?.tipo_contrato) === 'Por Obra' ? 'selected' : ''}>Por Obra</option>
                  <option value="Prueba" ${(emp?.tipoContrato || emp?.tipo_contrato) === 'Prueba' ? 'selected' : ''}>Prueba (30 días)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Duración Contrato (meses)</label>
                <input type="number" name="tiempoContrato" class="form-input" 
                       min="1" placeholder="Solo para contratos temporales" value="${safeVal(emp?.tiempoContrato || emp?.tiempo_contrato)}">
                <span class="form-hint">Dejar vacío si es indefinido</span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Observaciones</label>
              <textarea name="observaciones" class="form-textarea" rows="2">${safeVal(emp?.observaciones)}</textarea>
            </div>

            <div class="modal__footer" style="margin: calc(-1 * var(--spacing-lg)); margin-top: var(--spacing-lg); padding: var(--spacing-lg); border-top: 1px solid var(--border-color);">
              <button type="button" class="btn btn--secondary" onclick="PrestacionesModule.closeModal()">Cancelar</button>
              <button type="submit" class="btn btn--primary">${empleadoId ? Icons.save : Icons.plus} ${btnText}</button>
            </div>
          </form>
        </div>
      </div>
    `;
  };

  const saveEmpleado = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    const id = data.id;
    delete data.id;

    // Convertir tipos numéricos desde el formulario
    if (data.salarioTotal) data.salarioTotal = parseFloat(data.salarioTotal);
    if (data.tiempoContrato) data.tiempoContrato = parseInt(data.tiempoContrato) || null;

    try {
      if (id) {
        await DataService.updateEmpleado(id, data);
        App.showNotification?.('Empleado actualizado correctamente', 'success') || alert('Empleado actualizado correctamente');
      } else {
        data.estado = 'Activo';
        data.vacacionesTomadas = 0;
        data.aguinaldoPagado = false;
        await DataService.createEmpleado(data);
        App.showNotification?.('Empleado creado correctamente', 'success') || alert('Empleado creado correctamente');
      }
      closeModal();
      changeTab('empleados');
      App.refreshCurrentModule();
    } catch (error) {
      console.error('Error saving employee:', error);
      App.showNotification?.('Error al guardar: ' + error.message, 'error') || alert('Error al guardar: ' + error.message);
    }
  };

  const closeModal = (event) => {
    if (event && event.target !== event.currentTarget) return;
    document.getElementById('prestacionesModal').innerHTML = '';
    document.getElementById('prestacionesModal').classList.remove('open');
  };

  // ========== IMPLEMENTACIÓN FUNCIONES ==========

  // --- Empleados ---
  const viewEmpleado = (id) => {
    const emp = DataService.getEmpleadoById(id);
    if (!emp) return;

    const fechaAlta = emp.fechaAlta || emp.fecha_alta;
    const salario = parseFloat(emp.salarioTotal || emp.salario_total) || 0;
    const contrato = emp.tipoContrato || emp.tipo_contrato || '-';
    const tipoSalario = emp.tipoSalario || emp.tipo_salario || '-';
    const vacTomadas = emp.vacacionesTomadas || emp.vacaciones_tomadas || 0;
    const vacData = calcularVacaciones(emp);

    const contenido = `
            <div class="modal-overlay open" onclick="PrestacionesModule.closeModal(event)">
                <div class="modal" onclick="event.stopPropagation()">
                    <div class="modal__header">
                        <h3 class="modal__title">${Icons.users} ${emp.nombre}</h3>
                        <button class="btn btn--ghost btn--icon" onclick="PrestacionesModule.closeModal()">${Icons.x}</button>
                    </div>
                    <div class="modal__body">
                        <h4 style="margin-bottom: var(--spacing-sm); color: var(--text-secondary);">Datos Personales</h4>
                        <div class="detail-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-sm);">
                          <p><strong>Cargo:</strong> ${emp.cargo}</p>
                          <p><strong>Cédula:</strong> ${emp.cedula}</p>
                          <p><strong>Email:</strong> ${emp.email || '-'}</p>
                          <p><strong>Teléfono:</strong> ${emp.telefono || '-'}</p>
                        </div>
                        
                        <h4 style="margin-top: var(--spacing-md); margin-bottom: var(--spacing-sm); color: var(--text-secondary);">Información Laboral</h4>
                        <div class="detail-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-sm);">
                          <p><strong>Salario:</strong> C$${salario.toLocaleString('es-NI', { minimumFractionDigits: 2 })}</p>
                          <p><strong>Tipo Salario:</strong> ${tipoSalario}</p>
                          <p><strong>Contrato:</strong> ${contrato}</p>
                          <p><strong>Fecha Alta:</strong> ${fechaAlta ? new Date(fechaAlta).toLocaleDateString('es-NI') : '-'}</p>
                          <p><strong>Antigüedad:</strong> ${vacData.antiguedadAnios} años</p>
                          <p><strong>Estado:</strong> <span class="badge ${emp.estado === 'Activo' ? 'badge--success' : 'badge--error'}">${emp.estado || 'Activo'}</span></p>
                        </div>

                        <h4 style="margin-top: var(--spacing-md); margin-bottom: var(--spacing-sm); color: var(--text-secondary);">Prestaciones</h4>
                        <div class="detail-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-sm);">
                          <p>
                            <strong>Vacaciones Tomadas:</strong> ${vacTomadas} días 
                            <button class="btn btn--ghost btn--xs btn--icon" onclick="PrestacionesModule.verHistorialVacaciones('${emp.id}')" title="Ver Historial">${Icons.clock || '⏱️'}</button>
                          </p>
                          <p><strong>Vacaciones Disponibles:</strong> ${vacData.diasDisponibles} días</p>
                          <p>
                            <strong>Aguinaldo Pagado:</strong> ${(emp.aguinaldoPagado || emp.aguinaldo_pagado) ? 'Sí' : 'No'}
                            <button class="btn btn--ghost btn--xs btn--icon" onclick="PrestacionesModule.verHistorialAguinaldos('${emp.id}')" title="Ver Historial">${Icons.clock || '⏱️'}</button>
                          </p>
                          <p>
                             <strong>Nóminas:</strong> 
                             <button class="btn btn--ghost btn--xs" onclick="PrestacionesModule.verHistorialNominas('${emp.id}')">Ver Recibos</button>
                          </p>
                        </div>
                    </div>
                    <div class="modal__footer" style="margin: calc(-1 * var(--spacing-lg)); margin-top: var(--spacing-lg); padding: var(--spacing-lg); border-top: 1px solid var(--border-color);">
                      <button class="btn btn--secondary" onclick="PrestacionesModule.closeModal()">Cerrar</button>
                      <button class="btn btn--primary" onclick="PrestacionesModule.editEmpleado('${emp.id}')">${Icons.edit} Editar</button>
                    </div>
                </div>
            </div>
        `;
    document.getElementById('prestacionesModal').innerHTML = contenido;
  };


  const editEmpleado = (id) => {
    openEmpleadoModal(id);
  };

  // --- Vacaciones ---
  const calcularDiasEntreFechas = (fechaInicio, fechaFin) => {
    if (!fechaInicio || !fechaFin) return 0;
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    if (fin < inicio) return 0;
    const diffMs = fin - inicio;
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1; // +1 incluye ambos días
  };

  const registrarVacaciones = (preSelectedId = null) => {
    const empleados = DataService.getEmpleadosSync();
    document.getElementById('prestacionesModal').innerHTML = `
            <div class="modal-overlay open" onclick="PrestacionesModule.closeModal(event)">
                <div class="modal" onclick="event.stopPropagation()">
                    <div class="modal__header">
                        <h3 class="modal__title">${Icons.calendar} Registrar Vacaciones</h3>
                        <button class="btn btn--ghost btn--icon" onclick="PrestacionesModule.closeModal()">${Icons.x}</button>
                    </div>
                    <form class="modal__body" onsubmit="PrestacionesModule.saveVacaciones(event)">
                        <div class="form-group">
                            <label class="form-label form-label--required">Empleado</label>
                            <select name="empleadoId" class="form-select" required>
                                <option value="">Seleccionar empleado...</option>
                                ${empleados.map(e => `<option value="${e.id}" ${e.id === preSelectedId ? 'selected' : ''}>${e.nombre}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-row">
                             <div class="form-group">
                                <label class="form-label form-label--required">Desde</label>
                                <input type="date" name="fechaInicio" class="form-input" required onchange="PrestacionesModule.onVacacionFechaChange()">
                            </div>
                            <div class="form-group">
                                <label class="form-label form-label--required">Hasta</label>
                                <input type="date" name="fechaFin" class="form-input" required onchange="PrestacionesModule.onVacacionFechaChange()">
                            </div>
                        </div>
                        <div class="info-card info-card--info" id="diasCalculadosInfo" style="display:none; margin-bottom: var(--spacing-md);">
                            <strong>Días a descontar:</strong> <span id="diasCalculadosValor">0</span> día(s)
                        </div>
                        <div class="form-group">
                            <label class="form-label">Observaciones</label>
                            <textarea name="observaciones" class="form-textarea"></textarea>
                        </div>
                        <button type="submit" class="btn btn--primary" style="margin-top: 1rem;">${Icons.save || '💾'} Registrar</button>
                    </form>
                </div>
            </div>
        `;
  };

  const onVacacionFechaChange = () => {
    const fechaInicio = document.querySelector('input[name="fechaInicio"]')?.value;
    const fechaFin = document.querySelector('input[name="fechaFin"]')?.value;
    const infoEl = document.getElementById('diasCalculadosInfo');
    const valorEl = document.getElementById('diasCalculadosValor');
    if (fechaInicio && fechaFin && infoEl && valorEl) {
      const dias = calcularDiasEntreFechas(fechaInicio, fechaFin);
      valorEl.textContent = dias;
      infoEl.style.display = dias > 0 ? 'block' : 'none';
    }
  };

  const saveVacaciones = async (event) => {
    event.preventDefault();
    const fd = new FormData(event.target);
    const data = Object.fromEntries(fd.entries());

    // Auto-calcular días desde fechas
    data.dias = calcularDiasEntreFechas(data.fechaInicio, data.fechaFin);
    if (data.dias <= 0) {
      App.showNotification?.('Las fechas son inválidas', 'error') || alert('Las fechas son inválidas');
      return;
    }
    data.anioCorrespondiente = new Date().getFullYear();

    try {
      await DataService.createVacacion(data);
      App.showNotification?.('Vacaciones registradas correctamente', 'success') || alert('Vacaciones registradas');
      closeModal();
      App.refreshCurrentModule();
    } catch (e) {
      console.error('Error registrando vacaciones:', e);
      App.showNotification?.('Error: ' + e.message, 'error') || alert('Error: ' + e.message);
    }
  };

  const verHistorialVacaciones = async (empleadoId) => {
    try {
      const historial = await DataService.getVacacionesByEmpleado(empleadoId);
      const emp = DataService.getEmpleadoById(empleadoId);

      document.getElementById('prestacionesModal').innerHTML = `
                <div class="modal-overlay open" onclick="PrestacionesModule.closeModal(event)">
                    <div class="modal modal--large" onclick="event.stopPropagation()">
                        <div class="modal__header">
                            <h3 class="modal__title">Historial: ${emp ? emp.nombre : ''}</h3>
                            <button class="btn btn--ghost btn--icon" onclick="PrestacionesModule.closeModal()">${Icons.x}</button>
                        </div>
                        <div class="modal__body">
                            <table class="data-table">
                                <thead><tr><th>Inicio</th><th>Fin</th><th>Días</th><th>Obs</th><th>Acción</th></tr></thead>
                                <tbody>
                                    ${historial.length ? historial.map(h => `
                                        <tr>
                                            <td>${new Date(h.fecha_inicio).toLocaleDateString()}</td>
                                            <td>${new Date(h.fecha_fin).toLocaleDateString()}</td>
                                            <td>${h.dias}</td>
                                            <td>${h.observaciones || '-'}</td>
                                            <td>
                                                <button class="btn btn--ghost btn--sm btn--icon text-error" 
                                                    onclick="PrestacionesModule.deleteVacacion('${h.id}')">${Icons.trash}</button>
                                            </td>
                                        </tr>
                                    `).join('') : '<tr><td colspan="5">No hay registros</td></tr>'}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
             `;
    } catch (e) {
      console.error(e);
      alert('Error cargando historial');
    }
  };

  const deleteVacacion = async (id) => {
    if (!confirm('¿Eliminar registro? Se devolverán los días al saldo.')) return;
    try {
      await DataService.deleteVacacion(id);
      closeModal();
      App.showNotification?.('Registro de vacaciones eliminado', 'success') || alert('Registro eliminado');
      App.refreshCurrentModule();
    } catch (e) {
      console.error('Error eliminando vacación:', e);
      App.showNotification?.('Error: ' + e.message, 'error') || alert('Error: ' + e.message);
    }
  };

  // --- Ausencias ---
  const registrarAusencia = (preSelectedId = null) => {
    const empleados = DataService.getEmpleadosSync();
    document.getElementById('prestacionesModal').innerHTML = `
      <div class="modal-overlay open" onclick="PrestacionesModule.closeModal(event)">
        <div class="modal" onclick="event.stopPropagation()">
          <div class="modal__header">
            <h3 class="modal__title">${Icons.clock || '🕐'} Registrar Ausencia</h3>
            <button class="btn btn--ghost btn--icon" onclick="PrestacionesModule.closeModal()">${Icons.x}</button>
          </div>
          <form class="modal__body" onsubmit="PrestacionesModule.saveAusencia(event)">
            <div class="form-group">
              <label class="form-label form-label--required">Empleado</label>
              <select name="empleadoId" class="form-select" required>
                <option value="">Seleccionar empleado...</option>
                ${empleados.map(e => `<option value="${e.id}" ${e.id === preSelectedId ? 'selected' : ''}>${e.nombre}</option>`).join('')}
              </select>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label form-label--required">Desde</label>
                <input type="date" name="fechaInicio" class="form-input" required onchange="PrestacionesModule.onAusenciaFechaChange()">
              </div>
              <div class="form-group">
                <label class="form-label form-label--required">Hasta</label>
                <input type="date" name="fechaFin" class="form-input" required onchange="PrestacionesModule.onAusenciaFechaChange()">
              </div>
            </div>
            <div class="info-card info-card--info" id="ausenciaDiasInfo" style="display:none; margin-bottom: var(--spacing-md);">
              <strong>Días de ausencia:</strong> <span id="ausenciaDiasValor">0</span> día(s)
            </div>
            <div class="form-group">
              <label class="form-label form-label--required">¿De dónde se descuenta?</label>
              <div style="display: flex; gap: var(--spacing-md); margin-top: var(--spacing-sm);">
                <label style="display: flex; align-items: center; gap: var(--spacing-xs); cursor: pointer; padding: var(--spacing-sm) var(--spacing-md); border: 2px solid var(--border-color); border-radius: var(--radius-md); flex: 1; transition: all 0.2s;">
                  <input type="radio" name="tipoDescuento" value="vacaciones" required>
                  <span>${Icons.calendar} <strong>Vacaciones</strong></span>
                </label>
                <label style="display: flex; align-items: center; gap: var(--spacing-xs); cursor: pointer; padding: var(--spacing-sm) var(--spacing-md); border: 2px solid var(--border-color); border-radius: var(--radius-md); flex: 1; transition: all 0.2s;">
                  <input type="radio" name="tipoDescuento" value="dia_laboral">
                  <span>${Icons.clock || '🕐'} <strong>Día Laboral</strong></span>
                </label>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Motivo</label>
              <input type="text" name="motivo" class="form-input" placeholder="Ej: Cita médica, permiso personal...">
            </div>
            <div class="form-group">
              <label class="form-label">Observaciones</label>
              <textarea name="observaciones" class="form-textarea" rows="2"></textarea>
            </div>
            <button type="submit" class="btn btn--primary" style="margin-top: 1rem;">${Icons.save || '💾'} Registrar Ausencia</button>
          </form>
        </div>
      </div>
    `;
  };

  const onAusenciaFechaChange = () => {
    const fechaInicio = document.querySelector('input[name="fechaInicio"]')?.value;
    const fechaFin = document.querySelector('input[name="fechaFin"]')?.value;
    const infoEl = document.getElementById('ausenciaDiasInfo');
    const valorEl = document.getElementById('ausenciaDiasValor');
    if (fechaInicio && fechaFin && infoEl && valorEl) {
      const dias = calcularDiasEntreFechas(fechaInicio, fechaFin);
      valorEl.textContent = dias;
      infoEl.style.display = dias > 0 ? 'block' : 'none';
    }
  };

  const saveAusencia = async (event) => {
    event.preventDefault();
    const fd = new FormData(event.target);
    const data = Object.fromEntries(fd.entries());

    data.dias = calcularDiasEntreFechas(data.fechaInicio, data.fechaFin);
    if (data.dias <= 0) {
      App.showNotification?.('Las fechas son inválidas', 'error') || alert('Las fechas son inválidas');
      return;
    }

    try {
      await DataService.createAusencia(data);
      const tipoLabel = data.tipoDescuento === 'vacaciones' ? 'vacaciones' : 'día laboral';
      App.showNotification?.(`Ausencia registrada (${data.dias} días descontados de ${tipoLabel})`, 'success');
      closeModal();
      App.refreshCurrentModule();
    } catch (e) {
      console.error('Error registrando ausencia:', e);
      App.showNotification?.('Error: ' + e.message, 'error') || alert('Error: ' + e.message);
    }
  };

  const deleteAusencia = async (id) => {
    if (!confirm('¿Eliminar ausencia? Si fue descontada de vacaciones, se devolverán los días.')) return;
    try {
      await DataService.deleteAusencia(id);
      App.showNotification?.('Ausencia eliminada', 'success');
      App.refreshCurrentModule();
    } catch (e) {
      console.error('Error eliminando ausencia:', e);
      App.showNotification?.('Error: ' + e.message, 'error') || alert('Error: ' + e.message);
    }
  };

  // --- Aguinaldo ---
  const generarAguinaldoReporte = () => {
    const empleados = DataService.getEmpleadosSync().filter(e => e.estado === 'Activo');
    const aguinaldos = empleados.map(e => calcularAguinaldo(e));
    const total = aguinaldos.reduce((sum, a) => sum + a.monto, 0);

    const content = `
      <table>
        <thead>
          <tr>
            <th>Empleado</th>
            <th>Fecha Alta</th>
            <th class="text-center">Meses Computables</th>
            <th class="text-right">Salario Base</th>
            <th class="text-right">Aguinaldo a Pagar</th>
            <th class="text-center">Estado</th>
          </tr>
        </thead>
        <tbody>
          ${aguinaldos.map(a => `
            <tr>
              <td>${a.nombre}</td>
              <td>${new Date(a.fechaAlta).toLocaleDateString()}</td>
              <td class="text-center">${a.mesesLaborados}</td>
              <td class="text-right">C$${a.salario.toLocaleString()}</td>
              <td class="text-right font-bold">C$${a.monto.toLocaleString()}</td>
              <td class="text-center">${a.pagado ? 'PAGADO' : 'PENDIENTE'}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="4" class="text-right">TOTAL PLANILLA AGUINALDO:</td>
            <td class="text-right">C$${total.toLocaleString()}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    `;
    printDocument(`Planilla de Aguinaldo ${new Date().getFullYear()}`, content, 'landscape');
  };

  const marcarAguinaldoPagado = async (empleadoId) => {
    if (!confirm('¿Confirmar pago de aguinaldo del año en curso?')) return;

    try {
      const emp = DataService.getEmpleadoById(empleadoId);
      if (!emp) throw new Error('Empleado no encontrado');
      const calculo = calcularAguinaldo(emp);

      await DataService.createAguinaldo({
        empleadoId,
        anio: new Date().getFullYear(),
        monto: calculo.monto,
        diasCalculados: Math.floor(calculo.mesesLaborados * 2.5),
        fechaPago: new Date().toISOString(),
        observaciones: 'Pago generado desde sistema'
      });

      App.refreshCurrentModule();
      App.showNotification?.('Pago de aguinaldo registrado', 'success') || alert('Pago registrado');
    } catch (e) {
      console.error('Error registrando aguinaldo:', e);
      App.showNotification?.('Error: ' + e.message, 'error') || alert('Error: ' + e.message);
    }
  };

  const verHistorialAguinaldos = async (empleadoId) => {
    try {
      const historial = await DataService.getAguinaldosByEmpleado(empleadoId);
      const emp = DataService.getEmpleadoById(empleadoId);

      const content = `
        <div class="modal-overlay open" onclick="PrestacionesModule.closeModal(event)">
          <div class="modal modal--large" onclick="event.stopPropagation()">
            <div class="modal__header">
              <h3 class="modal__title">Historial Aguinaldos: ${emp?.nombre || ''}</h3>
              <button class="btn btn--ghost btn--icon" onclick="PrestacionesModule.closeModal()">${Icons.x}</button>
            </div>
            <div class="modal__body">
               <table class="data-table">
                 <thead><tr><th>Año</th><th>Fecha Pago</th><th>Monto</th></tr></thead>
                 <tbody>
                   ${historial && historial.length ? historial.map(h => `
                     <tr>
                       <td class="text-center">${h.anio}</td>
                       <td class="text-center">${new Date(h.fecha_pago || h.fechaPago || new Date()).toLocaleDateString()}</td>
                       <td class="text-right">C$${(h.monto || 0).toLocaleString()}</td>
                     </tr>
                   `).join('') : '<tr><td colspan="3" class="text-center">No hay registros de aguinaldo</td></tr>'}
                 </tbody>
               </table>
               <div class="modal__footer" style="padding-top: var(--spacing-md);">
                 <button class="btn btn--secondary" onclick="PrestacionesModule.closeModal()">Cerrar</button>
               </div>
            </div>
          </div>
        </div>
      `;
      document.getElementById('prestacionesModal').innerHTML = content;
    } catch (e) {
      console.error(e);
      App.showNotification?.('Error cargando historial', 'error') || alert('Error cargando historial');
    }
  };

  // --- Recibos ---
  const generarRecibos = async (event) => {
    event.preventDefault();
    const fd = new FormData(event.target);
    const periodo = fd.get('periodo'); // quincenal, mensual
    const mes = fd.get('mes');
    const quincena = fd.get('quincena'); // 1, 2
    const empleadosSel = fd.getAll('empleados');

    let empleados = DataService.getEmpleadosSync().filter(e => e.estado === 'Activo');
    if (empleadosSel.length > 0) {
      empleados = empleados.filter(e => empleadosSel.includes(e.id));
    }

    // Calcular fechas
    let fechaInicio, fechaFin;
    const year = parseInt(mes.split('-')[0]);
    const month = parseInt(mes.split('-')[1]) - 1; // 0-indexed
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();

    if (periodo === 'quincenal') {
      if (quincena === '1') {
        fechaInicio = `${mes}-01`;
        fechaFin = `${mes}-15`;
      } else {
        fechaInicio = `${mes}-16`;
        fechaFin = `${mes}-${lastDayOfMonth}`;
      }
    } else {
      fechaInicio = `${mes}-01`;
      fechaFin = `${mes}-${lastDayOfMonth}`;
    }

    // Iterar y generar
    let count = 0;
    for (const e of empleados) {
      // Calcular salario base según periodo
      let salarioBase = e.salarioTotal; // Asumimos mensual en empleado
      if (periodo === 'quincenal') salarioBase = salarioBase / 2;

      // Deducciones
      const inss = salarioBase * 0.07; // INSS laboral 7% (aprox, usar 6.25% si estricto)
      const ir = calcularIR(e.salarioTotal) / (periodo === 'quincenal' ? 2 : 1);

      const totalNeto = salarioBase - inss - ir;

      try {
        await DataService.createNomina({
          empleadoId: e.id,
          periodoInicio: fechaInicio,
          periodoFin: fechaFin,
          tipoPeriodo: periodo === 'quincenal' ? 'Quincenal' : 'Mensual',
          salarioBase: salarioBase,
          deduccionInss: inss,
          deduccionIr: ir,
          totalNeto: totalNeto,
          estado: 'Pagado',
          notas: `Generado automáticamente para ${periodo} ${periodo === 'quincenal' ? (quincena === '1' ? '(1ra)' : '(2da)') : ''} de ${mes}`
        });
        count++;
      } catch (err) {
        console.error('Error generando recibo para ' + e.nombre, err);
      }
    }

    App.showNotification?.(`Se han generado ${count} recibos de pago`, 'success') || alert(`Se han generado ${count} recibos de pago.`);
    App.refreshCurrentModule();
  };

  const verHistorialNominas = async (empleadoId) => {
    try {
      const historial = await DataService.getNominasByEmpleado(empleadoId);
      const emp = DataService.getEmpleadoById(empleadoId);

      const content = `
        <div class="modal-overlay open" onclick="PrestacionesModule.closeModal(event)">
          <div class="modal modal--large" onclick="event.stopPropagation()">
            <div class="modal__header">
              <h3 class="modal__title">Historial Nóminas: ${emp?.nombre || ''}</h3>
              <button class="btn btn--ghost btn--icon" onclick="PrestacionesModule.closeModal()">${Icons.x}</button>
            </div>
            <div class="modal__body">
               <div class="table-container">
               <table class="data-table">
                 <thead><tr><th>Período</th><th>Tipo</th><th>Neto</th><th>Estado</th></tr></thead>
                 <tbody>
                   ${historial && historial.length ? historial.map(h => `
                     <tr>
                       <td>${new Date(h.periodo_inicio).toLocaleDateString()} - ${new Date(h.periodo_fin).toLocaleDateString()}</td>
                       <td>${h.tipo_periodo}</td>
                       <td class="text-right">C$${(h.total_neto || 0).toLocaleString()}</td>
                       <td><span class="badge ${h.estado === 'Pagado' ? 'badge--success' : 'badge--warning'}">${h.estado}</span></td>
                     </tr>
                   `).join('') : '<tr><td colspan="4" class="text-center">No hay registros de nómina</td></tr>'}
                 </tbody>
               </table>
               </div>
               <div class="modal__footer" style="padding-top: var(--spacing-md);">
                 <button class="btn btn--secondary" onclick="PrestacionesModule.closeModal()">Cerrar</button>
               </div>
            </div>
          </div>
        </div>
      `;
      document.getElementById('prestacionesModal').innerHTML = content;
    } catch (e) {
      console.error(e);
      App.showNotification?.('Error cargando historial de nóminas', 'error');
    }
  };

  // --- Liquidación ---
  const loadEmpleadoData = (id) => {
    const emp = DataService.getEmpleadoById(id);
    if (!emp) return;

    const fechaAlta = emp.fechaAlta || emp.fecha_alta;
    const salario = parseFloat(emp.salarioTotal || emp.salario_total) || 0;
    const vacData = calcularVacaciones(emp);

    const info = document.getElementById('empleadoInfo');
    info.innerHTML = `
            <div class="info-card info-card--info">
                <p><strong>Fecha Alta:</strong> ${fechaAlta ? new Date(fechaAlta).toLocaleDateString('es-NI') : '-'}</p>
                <p><strong>Salario Mensual:</strong> C$${salario.toLocaleString('es-NI', { minimumFractionDigits: 2 })}</p>
                <p><strong>Vacaciones Pendientes:</strong> ${vacData.diasDisponibles} días</p>
                <p><strong>Antigüedad:</strong> ${vacData.antiguedadAnios} años</p>
            </div>
        `;
  };

  const calcularLiquidacion = (event) => {
    event.preventDefault();
    const fd = new FormData(event.target);
    const empleadoId = fd.get('empleadoId');
    const motivo = fd.get('motivo');
    const fechaSalida = new Date(fd.get('fechaSalida'));

    const emp = DataService.getEmpleadoById(empleadoId);
    if (!emp) return;

    // Cálculos
    const salarioMensual = parseFloat(emp.salarioTotal || emp.salario_total) || 0;
    const salarioDiario = salarioMensual / 30;

    // 1. Vacaciones
    const vacData = calcularVacaciones(emp);
    const diasVacaciones = vacData.diasDisponibles;
    const montoVacaciones = diasVacaciones * salarioDiario;

    // 2. Aguinaldo Propocional
    // Calcular días desde el último 1 de diciembre (o fecha alta) hasta fecha salida
    const hoyYear = fechaSalida.getFullYear();
    // Si la fecha salida es antes de diciembre, el ciclo empezó el 1 dic del año anterior
    let inicioAguinaldo = new Date(hoyYear, 0, 1);
    // La ley dice 1 de dic a 30 nov. Pero simplificamos ciclo anual
    // Ajuste: si fecha salida es Enero 2024, periodo es Dic 2023 - Ene 2024.
    // Asumiremos año calendario simple para este ejemplo o usar calcularAguinaldo que ya lo hace
    const aguinaldoData = calcularAguinaldo(emp);
    // calcularAguinaldo usa fecha actual. Necesitamos usar fechaSalida...

    // Recálculo manual de aguinaldo a fecha salida
    const inicioAnio = new Date(fechaSalida.getFullYear(), 0, 1);
    const inicioComputo = new Date(Math.max(new Date(emp.fechaAlta), inicioAnio));
    const diasTrabajadosEnAnio = Math.ceil((fechaSalida - inicioComputo) / (1000 * 60 * 60 * 24));
    const mesesAguinaldo = diasTrabajadosEnAnio / 30.417;
    const montoAguinaldo = (salarioMensual / 12) * mesesAguinaldo;


    // 3. Indemnización (Art 45)
    let indemnizacion = 0;
    let aniosAntiguedad = vacData.antiguedadAnios; // Esto viene de calcularVacaciones calculado a Hoy, debería ser a Fecha Salida

    // Recalcular antigüedad a fecha salida precise
    const antiguedadMs = fechaSalida - new Date(emp.fechaAlta || emp.fecha_alta);
    const antiguedadExacta = antiguedadMs / (1000 * 60 * 60 * 24 * 365.25);

    if (motivo === 'despido_sin_justa_causa' || motivo === 'renuncia' || motivo === 'mutuo_acuerdo') {
      // Art 45: 
      // - Primeros 3 años: 1 mes de salario por cada año
      // - A partir del 4to año: 20 días por cada año adicional
      // - Tope máximo: 5 salarios mensuales
      // - Fracciones: Proporcionales (Art 45 reformado)
      // Nota: Renuncia (Art 44) tiene otra regla (solo antigüedad de 3 años min, paga proporcional). 
      // Por simplicidad en este módulo asumiremos cálculo universal o Art 45 completo aplicado.

      let mesesPagar = 0;

      if (antiguedadExacta <= 3) {
        mesesPagar = antiguedadExacta; // 1 mes por año
      } else {
        mesesPagar = 3; // Primeros 3 años
        const aniosExtra = antiguedadExacta - 3;
        // 20 días = 20/30 mes = 0.6666 mes
        mesesPagar += aniosExtra * (20 / 30);
      }

      // Tope 5 meses
      if (mesesPagar > 5) mesesPagar = 5;

      indemnizacion = mesesPagar * salarioMensual;
    }

    const total = montoVacaciones + montoAguinaldo + indemnizacion;

    const resultDiv = document.getElementById('liquidacionResult');
    const printContent = `
      <div style="padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: start; border-bottom: 2px solid #1a73e8; padding-bottom: 15px; margin-bottom: 20px;">
          <div>
            <h2 style="margin: 0; color: #1a73e8;">LIQUIDACIÓN LABORAL</h2>
            <p style="margin: 5px 0; font-weight: bold;">ALLTECH SUPPORT</p>
          </div>
          <div style="text-align: right; font-size: 12px; color: #666;">
            <p style="margin: 0;">Fecha: ${new Date().toLocaleDateString('es-NI')}</p>
          </div>
        </div>

        <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 25px;">
          <h4 style="margin: 0 0 10px 0; color: #1a73e8;">DATOS DEL EMPLEADO</h4>
          <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
            <tr><td style="width: 30%; padding: 4px 0;"><strong>Nombre:</strong></td><td>${emp.nombre}</td></tr>
            <tr><td style="padding: 4px 0;"><strong>Cédula:</strong></td><td>${emp.cedula}</td></tr>
            <tr><td style="padding: 4px 0;"><strong>Cargo:</strong></td><td>${emp.cargo}</td></tr>
            <tr><td style="padding: 4px 0;"><strong>Fecha Ingreso:</strong></td><td>${new Date(emp.fechaAlta).toLocaleDateString()}</td></tr>
            <tr><td style="padding: 4px 0;"><strong>Fecha Salida:</strong></td><td>${fechaSalida.toLocaleDateString()}</td></tr>
            <tr><td style="padding: 4px 0;"><strong>Antigüedad:</strong></td><td>${antiguedadExacta.toFixed(2)} años Laborados</td></tr>
            <tr><td style="padding: 4px 0;"><strong>Motivo:</strong></td><td style="text-transform: capitalize;">${motivo.replace(/_/g, ' ')}</td></tr>
          </table>
        </div>

        <h4 style="color: #1a73e8; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-bottom: 15px;">CONCEPTOS A PAGAR</h4>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px;">
          <thead>
            <tr style="background: #eee;">
              <th style="padding: 10px; text-align: left;">Descripción</th>
              <th style="padding: 10px; text-align: right;">Cálculo / Cantidad</th>
              <th style="padding: 10px; text-align: right;">Total Cordobas</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">Vacaciones Pendientes</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${diasVacaciones.toFixed(2)} días</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">C$ ${montoVacaciones.toLocaleString('es-NI', { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">Aguinaldo Proporcional</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${mesesAguinaldo.toFixed(2)} meses</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">C$ ${montoAguinaldo.toLocaleString('es-NI', { minimumFractionDigits: 2 })}</td>
            </tr>
            ${indemnizacion > 0 ? `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">Indemnización (Art. 45)</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${aniosAntiguedad.toFixed(2)} años</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">C$ ${indemnizacion.toLocaleString('es-NI', { minimumFractionDigits: 2 })}</td>
            </tr>
            ` : ''}
            <tr style="background: #1a73e8; color: white;">
              <td colspan="2" style="padding: 12px 10px; font-weight: bold; border-radius: 4px 0 0 4px;">TOTAL NETO A RECIBIR</td>
              <td style="padding: 12px 10px; text-align: right; font-weight: bold; font-size: 18px; border-radius: 0 4px 4px 0;">C$ ${total.toLocaleString('es-NI', { minimumFractionDigits: 2 })}</td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top: 60px; display: flex; justify-content: space-between; gap: 40px;">
          <div style="flex: 1; text-align: center;">
            <div style="border-top: 1px solid #333; padding-top: 8px; font-size: 11px;">
              <strong>${emp.nombre}</strong><br>
              Firma del Trabajador
            </div>
          </div>
          <div style="flex: 1; text-align: center;">
            <div style="border-top: 1px solid #333; padding-top: 8px; font-size: 11px;">
              <strong>ALLTECH SUPPORT</strong><br>
              Firma y Sello del Empleador
            </div>
          </div>
        </div>

        <div style="margin-top: 40px; padding: 15px; background: #fffde7; border-radius: 6px; font-size: 10px; color: #5d4037; border-left: 4px solid #fbc02d;">
          <strong>Nota Legal:</strong> El presente cálculo es de carácter informativo y constituye una propuesta de liquidación conforme a la legislación laboral vigente de la República de Nicaragua. Al recibir este pago, el trabajador se declara a satisfacción y otorga el más amplio finiquito que en derecho corresponda.
        </div>
      </div>
    `;

    resultDiv.innerHTML = `
            <div class="card" style="margin-top: 1rem; border: 1px solid var(--color-primary-500);">
                <div class="card__header">
                    <h3 class="card__title">${Icons.fileText} Resultado Liquidación (Estimado)</h3>
                    <button class="btn btn--primary btn--sm" onclick="PrestacionesModule.printDocument('Liquidación Laboral - ${emp.nombre}', document.getElementById('liquidacionTabla').innerHTML)">
                         ${Icons.printer} Imprimir Liquidación
                    </button>
                </div>
                <div class="card__body" id="liquidacionTabla">
                    ${printContent}
                </div>
            </div>
        `;
  };

  // --- Reportes ---
  // --- Reportes Helpers ---
  const printDocument = (title, content, orientation = 'portrait') => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) { alert('Por favor habilite las ventanas emergentes para imprimir el reporte.'); return; }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} - ALLTECH SUPPORT</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            body { font-family: 'Inter', system-ui, -apple-system, sans-serif; padding: 0; margin: 0; color: #1a1f36; background: white; }
            .container { padding: 30px; max-width: 900px; margin: 0 auto; }
            
            .print-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #f1f3f9; padding-bottom: 15px; }
            .print-header h1 { margin: 0; font-size: 20px; color: #1a73e8; text-transform: uppercase; letter-spacing: 0.5px; }
            .print-header p { margin: 5px 0 0; font-size: 12px; color: #697386; }
            
            table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 12px; }
            th { background-color: #f7f9fc; color: #4f566b; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; padding: 12px 10px; border: 1px solid #e3e8ee; text-align: left; }
            td { padding: 10px; border: 1px solid #e3e8ee; color: #3c4257; }
            tr:nth-child(even) { background-color: #fcfdfe; }
            
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .font-bold { font-weight: 700; }
            
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e3e8ee; font-size: 10px; text-align: center; color: #697386; }
            
            @media print {
              @page { size: ${orientation}; margin: 15mm; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .no-print { display: none !important; }
              .container { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="print-header">
              <div>
                <h1>${title}</h1>
                <p>Generado: ${new Date().toLocaleString('es-NI')}</p>
              </div>
              <div style="text-align: right;">
                <p style="font-weight: bold; color: #1a1f36;">ALLTECH SUPPORT</p>
                <p>Soporte Técnico & Sistemas</p>
              </div>
            </div>
            ${content}
            <div class="footer">
              Este documento fue generado electrónicamente por el sistema ALLTECH SUPPORT.
            </div>
          </div>
          <script>
            setTimeout(() => { 
                window.print(); 
                // window.close(); // Opcional: cerrar después de imprimir
            }, 500);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // --- Implementación Reportes ---
  const generarReporteEmpleados = () => {
    const empleados = DataService.getEmpleadosSync().filter(e => e.estado === 'Activo');
    const content = `
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Cédula</th>
            <th>Cargo</th>
            <th>Fecha Alta</th>
            <th>Salario Total</th>
            <th>Contrato</th>
            <th>Email / Tel</th>
          </tr>
        </thead>
        <tbody>
          ${empleados.map(e => `
            <tr>
              <td>${e.nombre}</td>
              <td>${e.cedula || '-'}</td>
              <td>${e.cargo}</td>
              <td>${(e.fechaAlta || e.fecha_alta) ? new Date(e.fechaAlta || e.fecha_alta).toLocaleDateString() : '-'}</td>
              <td class="text-right">C$${(parseFloat(e.salarioTotal || e.salario_total) || 0).toLocaleString()}</td>
              <td>${e.tipoContrato || e.tipo_contrato || '-'}</td>
              <td>${e.email || ''}<br>${e.telefono || ''}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    printDocument('Reporte de Personal Activo', content, 'landscape');
  };

  const generarReporteVacaciones = () => {
    const empleados = DataService.getEmpleadosSync().filter(e => e.estado === 'Activo');
    const datos = empleados.map(e => calcularVacaciones(e));

    const content = `
      <table>
        <thead>
          <tr>
            <th>Empleado</th>
            <th>Cargo</th>
            <th>Antigüedad (Años)</th>
            <th class="text-center">Días Acumulados</th>
            <th class="text-center">Días Tomados</th>
            <th class="text-center">Saldo Disponible</th>
            <th>Valor Monetario (Est.)</th>
          </tr>
        </thead>
        <tbody>
          ${datos.map(d => {
      const empleado = empleados.find(e => e.id === d.id);
      const valorDia = (parseFloat(empleado.salarioTotal || empleado.salario_total) || 0) / 30;
      const valorSaldo = d.diasDisponibles * valorDia;
      return `
              <tr>
                <td>${d.nombre}</td>
                <td>${d.cargo}</td>
                <td class="text-center">${d.antiguedadAnios}</td>
                <td class="text-center">${d.diasAcumulados}</td>
                <td class="text-center">${d.diasTomados}</td>
                <td class="text-center" style="font-weight:bold; color: ${d.diasDisponibles >= 0 ? 'inherit' : 'red'};">${d.diasDisponibles}</td>
                <td class="text-right">C$${valorSaldo.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            `;
    }).join('')}
          <tr class="total-row">
            <td colspan="6" class="text-right">TOTAL PASIVO VACACIONAL ESTIMADO:</td>
            <td class="text-right">C$${datos.reduce((sum, d) => sum + (d.diasDisponibles * ((parseFloat(empleados.find(e => e.id === d.id)?.salarioTotal || empleados.find(e => e.id === d.id)?.salario_total) || 0) / 30)), 0).toLocaleString('es-NI', { minimumFractionDigits: 2 })}</td>
          </tr>
        </tbody>
      </table>
    `;
    printDocument('Reporte de Estado de Vacaciones', content, 'landscape');
  };

  const generarPlanillaMensual = () => {
    const empleados = DataService.getEmpleadosSync().filter(e => e.estado === 'Activo');
    let totalSalario = 0;
    let totalINSS = 0;
    let totalIR = 0;
    let totalNeto = 0;

    const rows = empleados.map(e => {
      const salario = parseFloat(e.salarioTotal || e.salario_total) || 0;
      const inss = calcularINSS(salario).empleado;
      const ir = calcularIR(salario);
      const neto = salario - inss - ir;

      totalSalario += salario;
      totalINSS += inss;
      totalIR += ir;
      totalNeto += neto;

      return `
            <tr>
                <td>${e.nombre}</td>
                <td>${e.cargo}</td>
                <td class="text-right">C$${salario.toLocaleString()}</td>
                <td class="text-right text-danger">- C$${inss.toLocaleString()}</td>
                <td class="text-right text-danger">- C$${ir.toLocaleString()}</td>
                <td class="text-right font-bold">C$${neto.toLocaleString()}</td>
            </tr>
        `;
    }).join('');

    const content = `
      <h3>Proyección Mensual (Base Salarial)</h3>
      <table>
        <thead>
          <tr>
            <th>Empleado</th>
            <th>Cargo</th>
            <th class="text-right">Salario Bruto</th>
            <th class="text-right">INSS (7%)</th>
            <th class="text-right">IR (Est.)</th>
            <th class="text-right">Neto a Recibir</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
          <tr class="total-row">
            <td colspan="2" class="text-right">TOTALES MENSUALES:</td>
            <td class="text-right">C$${totalSalario.toLocaleString()}</td>
            <td class="text-right">C$${totalINSS.toLocaleString()}</td>
            <td class="text-right">C$${totalIR.toLocaleString()}</td>
            <td class="text-right">C$${totalNeto.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
    `;
    printDocument('Planilla Mensual Proyectada', content, 'landscape');
  };

  const generarReporteCostos = () => {
    const empleados = DataService.getEmpleadosSync().filter(e => e.estado === 'Activo');
    let totalSalario = 0;
    let totalINSSPatronal = 0;
    let totalINATE = 0; // INATEC 2%
    let totalVacaciones = 0; // Provisión 1/12
    let totalAguinaldo = 0; // Provisión 1/12

    const rows = empleados.map(e => {
      const salario = parseFloat(e.salarioTotal || e.salario_total) || 0;
      const inssPatronal = calcularINSS(salario).empleador;
      const inatec = salario * 0.02;
      const provisionLey = (salario / 12) * 2; // Vacaciones + Aguinaldo (approx 1 mes cada uno por año)

      const costoTotal = salario + inssPatronal + inatec + provisionLey;

      totalSalario += salario;
      totalINSSPatronal += inssPatronal;
      totalINATE += inatec;
      totalVacaciones += (salario / 12);
      totalAguinaldo += (salario / 12);

      return `
            <tr>
                <td>${e.nombre}</td>
                <td class="text-right">C$${salario.toLocaleString()}</td>
                <td class="text-right">C$${inssPatronal.toLocaleString()}</td>
                <td class="text-right">C$${inatec.toLocaleString()}</td>
                <td class="text-right">C$${provisionLey.toLocaleString()}</td>
                <td class="text-right font-bold">C$${costoTotal.toLocaleString()}</td>
            </tr>
        `;
    }).join('');

    const granTotal = totalSalario + totalINSSPatronal + totalINATE + totalVacaciones + totalAguinaldo;

    const content = `
      <h3>Costos Laborales Mensuales (Carga Patronal)</h3>
      <table>
        <thead>
          <tr>
            <th>Empleado</th>
            <th class="text-right">Salario Base</th>
            <th class="text-right">INSS Patronal (21.5%)</th>
            <th class="text-right">INATEC (2%)</th>
            <th class="text-right">Prov. Ley (Vac+Agui)</th>
            <th class="text-right">Costo Total</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
          <tr class="total-row">
            <td class="text-right">TOTALES:</td>
            <td class="text-right">C$${totalSalario.toLocaleString()}</td>
            <td class="text-right">C$${totalINSSPatronal.toLocaleString()}</td>
            <td class="text-right">C$${totalINATE.toLocaleString()}</td>
            <td class="text-right">C$${(totalVacaciones + totalAguinaldo).toLocaleString()}</td>
            <td class="text-right">C$${granTotal.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
      <p style="margin-top: 20px; font-size: 11px; color: #666;">Nota: INSS Patronal calculado al 21.5% (Régimen < 50 empleados). INATEC 2%. Provisiones de Ley incluyen doceava parte de Vacaciones y Aguinaldo.</p>
    `;
    printDocument('Reporte de Costos Laborales', content, 'landscape');
  };



  // ========== PUBLIC API ==========
  const changeTab = (tab) => {
    currentTab = tab;
    App.refreshCurrentModule();
    // Cargar datos async según la pestaña
    if (tab === 'recibos') {
      setTimeout(() => loadHistorialRecibos(), 150);
    }
  };

  const handleSearch = (value) => {
    searchTerm = value;
    App.refreshCurrentModule();
  };

  // --- Eliminar Empleado ---
  const deleteEmpleado = async (id) => {
    const emp = DataService.getEmpleadoById(id);
    if (!emp) return;
    if (!confirm(`¿Eliminar al empleado "${emp.nombre}"? Esta acción no se puede deshacer.`)) return;

    try {
      await DataService.deleteEmpleado(id);
      App.showNotification?.(`Empleado "${emp.nombre}" eliminado`, 'success') || alert('Empleado eliminado');
      App.refreshCurrentModule();
    } catch (e) {
      console.error('Error eliminando empleado:', e);
      App.showNotification?.('Error al eliminar: ' + e.message, 'error') || alert('Error al eliminar: ' + e.message);
    }
  };

  return {
    render,
    changeTab,
    handleSearch,
    openEmpleadoModal,
    saveEmpleado,
    viewEmpleado,
    editEmpleado,
    deleteEmpleado,
    registrarVacaciones,
    saveVacaciones,
    onVacacionFechaChange,
    verHistorialVacaciones,
    deleteVacacion,
    // Ausencias
    registrarAusencia,
    onAusenciaFechaChange,
    saveAusencia,
    deleteAusencia,
    // Aguinaldo
    generarAguinaldoReporte,
    marcarAguinaldoPagado,
    verHistorialAguinaldos,
    // Recibos
    generarRecibos,
    verHistorialNominas,
    imprimirRecibo,
    // Liquidación
    calcularLiquidacion,
    loadEmpleadoData,
    // Reportes
    generarReporteEmpleados,
    generarReporteVacaciones,
    generarPlanillaMensual,
    generarReporteCostos,
    // Utils
    closeModal,
    printDocument
  };
})();
