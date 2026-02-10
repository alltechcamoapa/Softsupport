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
          <button class="btn btn--primary" onclick="PrestacionesModule.openCreateEmpleadoModal()">
            ${Icons.plus} Nuevo Empleado
          </button>
        </div>

        <!-- Tabs -->
        <div class="tabs">
          <button class="tab ${currentTab === 'empleados' ? 'tab--active' : ''}" 
                  onclick="PrestacionesModule.changeTab('empleados')">
            ${Icons.users} Empleados
          </button>
          <button class="tab ${currentTab === 'vacaciones' ? 'tab--active' : ''}" 
                  onclick="PrestacionesModule.changeTab('vacaciones')">
            ${Icons.calendar} Vacaciones
          </button>
          <button class="tab ${currentTab === 'aguinaldo' ? 'tab--active' : ''}" 
                  onclick="PrestacionesModule.changeTab('aguinaldo')">
            ${Icons.gift || '🎁'} Aguinaldo
          </button>
          <button class="tab ${currentTab === 'recibos' ? 'tab--active' : ''}" 
                  onclick="PrestacionesModule.changeTab('recibos')">
            ${Icons.fileText} Recibos de Pago
          </button>
          <button class="tab ${currentTab === 'liquidacion' ? 'tab--active' : ''}" 
                  onclick="PrestacionesModule.changeTab('liquidacion')">
            ${Icons.dollarSign || '💰'} Liquidación
          </button>
          <button class="tab ${currentTab === 'reportes' ? 'tab--active' : ''}" 
                  onclick="PrestacionesModule.changeTab('reportes')">
            ${Icons.barChart} Reportes
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
        const filtered = empleados.filter(e =>
            e.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.cedula?.includes(searchTerm) ||
            e.cargo?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return `
      <div class="search-bar">
        <input type="text" class="search-input" placeholder="Buscar empleados..." 
               value="${searchTerm}" 
               oninput="PrestacionesModule.handleSearch(this.value)">
      </div>

      <div class="table-container">
        <table class="table">
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
            ` : filtered.map(emp => `
              <tr>
                <td>
                  <div>
                    <div class="font-medium">${emp.nombre}</div>
                    <div class="text-sm text-muted">${emp.email || '-'}</div>
                  </div>
                </td>
                <td>${emp.cedula || '-'}</td>
                <td>${emp.cargo || '-'}</td>
                <td>${emp.fechaAlta ? new Date(emp.fechaAlta).toLocaleDateString('es-NI') : '-'}</td>
                <td class="font-medium">C$${(emp.salarioTotal || 0).toLocaleString('es-NI', { minimumFractionDigits: 2 })}</td>
                <td>
                  <span class="badge ${emp.tipoContrato === 'Indefinido' ? 'badge--success' : 'badge--warning'}">
                    ${emp.tipoContrato || 'No especificado'}
                  </span>
                </td>
                <td>
                  <span class="badge ${emp.estado === 'Activo' ? 'badge--success' : 'badge--error'}">
                    ${emp.estado || 'Activo'}
                  </span>
                </td>
                <td>
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
                  </div>
                </td>
              </tr>
            `).join('')}
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
            <table class="table">
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
                        <button class="btn btn--ghost btn--sm" 
                                onclick="PrestacionesModule.verHistorialVacaciones('${vac.id}')">
                          Ver Historial
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
            <table class="table">
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
                      <button class="btn btn--ghost btn--sm" 
                              onclick="PrestacionesModule.marcarAguinaldoPagado('${ag.empleadoId}')">
                        ${ag.pagado ? 'Ver Recibo' : 'Marcar Pagado'}
                      </button>
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
            </div>

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
    `;
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
        const fechaAlta = new Date(empleado.fechaAlta);
        const hoy = new Date();
        const antiguedadMs = hoy - fechaAlta;
        const antiguedadAnios = Math.floor(antiguedadMs / (365.25 * 24 * 60 * 60 * 1000));

        // Ley de Nicaragua: 15 días el primer año, +1 día por año adicional (máx 30)
        let diasAcumulados = 15;
        if (antiguedadAnios > 1) {
            diasAcumulados = Math.min(15 + (antiguedadAnios - 1), 30);
        }

        const diasTomados = empleado.vacacionesTomadas || 0;
        const diasDisponibles = diasAcumulados - diasTomados;

        // Próximo período
        const proximaFecha = new Date(fechaAlta);
        proximaFecha.setFullYear(hoy.getFullYear() + 1);

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
        const fechaAlta = new Date(empleado.fechaAlta);
        const hoy = new Date();
        const inicioAnio = new Date(hoy.getFullYear(), 0, 1);
        const fechaInicio = fechaAlta > inicioAnio ? fechaAlta : inicioAnio;

        // Calcular meses trabajados en el año
        const mesesLaborados = Math.min(12, Math.floor((hoy - fechaInicio) / (30.44 * 24 * 60 * 60 * 1000)));

        // Fórmula Nicaragua: (Salario / 12) * meses laborados
        const salario = empleado.salarioTotal || 0;
        const monto = (salario / 12) * mesesLaborados;

        return {
            empleadoId: empleado.id,
            nombre: empleado.nombre,
            cedula: empleado.cedula,
            fechaAlta: empleado.fechaAlta,
            mesesLaborados,
            salario,
            monto,
            pagado: empleado.aguinaldoPagado || false
        };
    };

    const calcularINSS = (salario) => {
        // Nicaragua: INSS empleado 6.25%, empleador 19%
        return {
            empleado: salario * 0.0625,
            empleador: salario * 0.19,
            total: salario * 0.2525
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
    const openCreateEmpleadoModal = () => {
        document.getElementById('prestacionesModal').innerHTML = `
      <div class="modal-overlay open" onclick="PrestacionesModule.closeModal(event)">
        <div class="modal modal--large" onclick="event.stopPropagation()">
          <div class="modal__header">
            <h3 class="modal__title">${Icons.plus} Nuevo Empleado</h3>
            <button class="btn btn--ghost btn--icon" onclick="PrestacionesModule.closeModal()">
              ${Icons.x}
            </button>
          </div>
          <form class="modal__body" onsubmit="PrestacionesModule.saveEmpleado(event)">
            <h4>Datos Personales</h4>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label form-label--required">Nombre Completo</label>
                <input type="text" name="nombre" class="form-input" required>
              </div>
              <div class="form-group">
                <label class="form-label form-label--required">Cédula</label>
                <input type="text" name="cedula" class="form-input" required>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" name="email" class="form-input">
              </div>
              <div class="form-group">
                <label class="form-label">Teléfono</label>
                <input type="tel" name="telefono" class="form-input">
              </div>
            </div>

            <h4 style="margin-top: var(--spacing-lg);">Información Laboral</h4>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label form-label--required">Cargo</label>
                <input type="text" name="cargo" class="form-input" required>
              </div>
              <div class="form-group">
                <label class="form-label form-label--required">Fecha de Alta</label>
                <input type="date" name="fechaAlta" class="form-input" 
                       value="${new Date().toISOString().split('T')[0]}" required>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label form-label--required">Tipo de Salario</label>
                <select name="tipoSalario" class="form-select" required>
                  <option value="">Seleccionar...</option>
                  <option value="Mensual">Mensual</option>
                  <option value="Quincenal">Quincenal</option>
                  <option value="Por Hora">Por Hora</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label form-label--required">Salario Total (C$)</label>
                <input type="number" name="salarioTotal" class="form-input" 
                       step="0.01" min="0" required>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label form-label--required">Tipo de Contrato</label>
                <select name="tipoContrato" class="form-select" required>
                  <option value="">Seleccionar...</option>
                  <option value="Indefinido">Indefinido</option>
                  <option value="Temporal">Temporal</option>
                  <option value="Por Obra">Por Obra</option>
                  <option value="Prueba">Prueba (30 días)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Duración Contrato (meses)</label>
                <input type="number" name="tiempoContrato" class="form-input" 
                       min="1" placeholder="Solo para contratos temporales">
                <span class="form-hint">Dejar vacío si es indefinido</span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Observaciones</label>
              <textarea name="observaciones" class="form-textarea" rows="2"></textarea>
            </div>

            <div class="modal__footer" style="margin: calc(-1 * var(--spacing-lg)); margin-top: var(--spacing-lg); padding: var(--spacing-lg); border-top: 1px solid var(--border-color);">
              <button type="button" class="btn btn--secondary" onclick="PrestacionesModule.closeModal()">Cancelar</button>
              <button type="submit" class="btn btn--primary">${Icons.plus} Crear Empleado</button>
            </div>
          </form>
        </div>
      </div>
    `;
    };

    const saveEmpleado = (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());

        data.estado = 'Activo';
        data.vacacionesTomadas = 0;
        data.aguinaldoPagado = false;

        DataService.createEmpleado?.(data);

        closeModal();
        changeTab('empleados');
        App.refreshCurrentModule();
    };

    const closeModal = (event) => {
        if (event && event.target !== event.currentTarget) return;
        document.getElementById('prestacionesModal').innerHTML = '';
    };

    // ========== PUBLIC API ==========
    const changeTab = (tab) => {
        currentTab = tab;
        App.refreshCurrentModule();
    };

    const handleSearch = (value) => {
        searchTerm = value;
        App.refreshCurrentModule();
    };

    return {
        render,
        changeTab,
        handleSearch,
        openCreateEmpleadoModal,
        saveEmpleado,
        viewEmpleado: () => alert('Función en desarrollo'),
        editEmpleado: () => alert('Función en desarrollo'),
        registrarVacaciones: () => alert('Función en desarrollo'),
        verHistorialVacaciones: () => alert('Función en desarrollo'),
        generarAguinaldoReporte: () => alert('Función en desarrollo'),
        marcarAguinaldoPagado: () => alert('Función en desarrollo'),
        generarRecibos: () => alert('Función en desarrollo'),
        calcularLiquidacion: () => alert('Función en desarrollo'),
        loadEmpleadoData: () => alert('Función en desarrollo'),
        generarReporteEmpleados: () => alert('Función en desarrollo'),
        generarReporteVacaciones: () => alert('Función en desarrollo'),
        generarPlanillaMensual: () => alert('Función en desarrollo'),
        generarReporteCostos: () => alert('Función en desarrollo'),
        closeModal
    };
})();
