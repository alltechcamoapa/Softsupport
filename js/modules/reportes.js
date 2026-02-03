/**
 * ALLTECH SUPPORT - Reportes Module
 * Reports and analytics
 */

const ReportesModule = (() => {
  let filterState = { periodo: 'month', fechaInicio: '', fechaFin: '' };

  const render = () => {
    const user = State.get('user');
    if (!DataService.canPerformAction(user.role, 'reportes', 'read')) {
      return `
        <div class="module-container">
          <div class="empty-state">
            <div class="empty-state__icon">${Icons.lock}</div>
            <h3 class="empty-state__title">Acceso Denegado</h3>
            <p class="empty-state__description">No tienes permisos para ver los reportes.</p>
          </div>
        </div>
      `;
    }

    const stats = DataService.getReportesStats(filterState);

    return `
      <div class="module-container">
        <div class="module-header">
          <div class="module-header__left">
            <h2 class="module-title">Reportes e Historial</h2>
            <p class="module-subtitle">Análisis y estadísticas del sistema</p>
          </div>
          <div class="module-header__right">
            <button class="btn btn--primary" onclick="ReportesModule.generateGeneralReport()">
              ${Icons.fileText} Reporte General de Trabajos
            </button>
            <button class="btn btn--secondary" onclick="ReportesModule.exportReport()">
              ${Icons.download} Exportar Dashboard
            </button>
          </div>
        </div>

        <!-- Period Filter -->
        <div class="card">
          <div class="card__body">
            <div class="filters-row">
              <select class="form-select" style="width: 150px;" 
                      onchange="ReportesModule.handlePeriodoFilter(this.value)">
                <option value="week" ${filterState.periodo === 'week' ? 'selected' : ''}>Esta Semana</option>
                <option value="month" ${filterState.periodo === 'month' ? 'selected' : ''}>Este Mes</option>
                <option value="quarter" ${filterState.periodo === 'quarter' ? 'selected' : ''}>Este Trimestre</option>
                <option value="year" ${filterState.periodo === 'year' ? 'selected' : ''}>Este Año</option>
                <option value="custom" ${filterState.periodo === 'custom' ? 'selected' : ''}>Personalizado</option>
              </select>
              ${filterState.periodo === 'custom' ? `
                <input type="date" class="form-input" style="width: 150px;"
                       value="${filterState.fechaInicio}"
                       onchange="ReportesModule.handleFechaInicio(this.value)">
                <span class="text-muted">a</span>
                <input type="date" class="form-input" style="width: 150px;"
                       value="${filterState.fechaFin}"
                       onchange="ReportesModule.handleFechaFin(this.value)">
              ` : ''}
              <button class="btn btn--ghost" onclick="App.refreshCurrentModule()">
                ${Icons.search} Actualizar
              </button>
            </div>
          </div>
        </div>

        <!-- Summary Stats -->
        <div class="module-stats module-stats--4">
          <div class="stat-card stat-card--primary">
            <div class="stat-card__icon">${Icons.users}</div>
            <span class="stat-card__label">Total Clientes</span>
            <span class="stat-card__value">${stats.totalClientes}</span>
          </div>
          <div class="stat-card stat-card--success">
            <div class="stat-card__icon">${Icons.wrench}</div>
            <span class="stat-card__label">Servicios Realizados</span>
            <span class="stat-card__value">${stats.totalServicios}</span>
          </div>
          <div class="stat-card stat-card--warning">
            <div class="stat-card__icon">${Icons.wallet}</div>
            <span class="stat-card__label">Ingresos Totales</span>
            <span class="stat-card__value">$${stats.ingresosTotales.toFixed(2)}</span>
          </div>
          <div class="stat-card stat-card--info">
            <div class="stat-card__icon">${Icons.fileText}</div>
            <span class="stat-card__label">Contratos Activos</span>
            <span class="stat-card__value">${stats.contratosActivos}</span>
          </div>
        </div>

        <!-- Report Cards Grid -->
        <div class="reports-grid">
          <!-- Services by Technician -->
          <div class="card">
            <div class="card__header">
              <h4 class="card__title">Servicios por Técnico</h4>
            </div>
            <div class="card__body">
              ${renderTecnicoStats(stats.serviciosPorTecnico)}
            </div>
          </div>

          <!-- Services by Type -->
          <div class="card">
            <div class="card__header">
              <h4 class="card__title">Servicios por Tipo</h4>
            </div>
            <div class="card__body">
              ${renderServiceTypeStats(stats.serviciosPorTipo)}
            </div>
          </div>

          <!-- Contract vs Eventual -->
          <div class="card">
            <div class="card__header">
              <h4 class="card__title">Contrato vs Eventual</h4>
            </div>
            <div class="card__body">
              ${renderContratoVsEventual(stats.contratoVsEventual)}
            </div>
          </div>

          <!-- Revenue by Currency -->
          <div class="card">
            <div class="card__header">
              <h4 class="card__title">Ingresos por Moneda</h4>
            </div>
            <div class="card__body">
              ${renderIngresosPorMoneda(stats.ingresosPorMoneda)}
            </div>
          </div>
        </div>

        <!-- Detailed Tables -->
        <div class="reports-tables">
          <!-- Client History -->
          <div class="card">
            <div class="card__header">
              <h4 class="card__title">Historial por Cliente</h4>
              <button class="btn btn--ghost btn--sm">Ver todo</button>
            </div>
            <div class="card__body" style="padding: 0;">
              ${renderClienteHistory(stats.historialClientes)}
            </div>
          </div>

          <!-- Equipment Status -->
          <div class="card">
            <div class="card__header">
              <h4 class="card__title">Estado de Equipos</h4>
            </div>
            <div class="card__body" style="padding: 0;">
              ${renderEquipoStatus(stats.estadoEquipos)}
            </div>
          </div>
        </div>
      </div>
    `;
  };

  const renderTecnicoStats = (data) => {
    if (!data || data.length === 0) {
      return '<p class="text-muted">No hay datos disponibles</p>';
    }

    const maxValue = Math.max(...data.map(d => d.count));

    return data.map(item => `
      <div class="report-bar">
        <div class="report-bar__info">
          <span class="report-bar__label">${item.tecnico}</span>
          <span class="report-bar__value">${item.count} servicios</span>
        </div>
        <div class="report-bar__track">
          <div class="report-bar__fill" style="width: ${(item.count / maxValue) * 100}%"></div>
        </div>
      </div>
    `).join('');
  };

  const renderServiceTypeStats = (data) => {
    if (!data) return '<p class="text-muted">No hay datos disponibles</p>';

    const total = data.fisica + data.remota;
    const fisicaPercent = total > 0 ? (data.fisica / total) * 100 : 0;
    const remotaPercent = total > 0 ? (data.remota / total) * 100 : 0;

    return `
      <div class="pie-chart-container">
        <div class="pie-chart-legend">
          <div class="pie-chart-item">
            <span class="pie-chart-color" style="background: var(--color-primary-500);"></span>
            <span>Física: ${data.fisica} (${fisicaPercent.toFixed(0)}%)</span>
          </div>
          <div class="pie-chart-item">
            <span class="pie-chart-color" style="background: var(--color-info);"></span>
            <span>Remota: ${data.remota} (${remotaPercent.toFixed(0)}%)</span>
          </div>
        </div>
        <div class="progress-stacked">
          <div class="progress-stacked__bar" style="width: ${fisicaPercent}%; background: var(--color-primary-500);"></div>
          <div class="progress-stacked__bar" style="width: ${remotaPercent}%; background: var(--color-info);"></div>
        </div>
      </div>
    `;
  };

  const renderContratoVsEventual = (data) => {
    if (!data) return '<p class="text-muted">No hay datos disponibles</p>';

    const total = data.contrato + data.eventual;
    const contratoPercent = total > 0 ? (data.contrato / total) * 100 : 0;
    const eventualPercent = total > 0 ? (data.eventual / total) * 100 : 0;

    return `
      <div class="pie-chart-container">
        <div class="pie-chart-legend">
          <div class="pie-chart-item">
            <span class="pie-chart-color" style="background: var(--color-success);"></span>
            <span>Con Contrato: ${data.contrato} (${contratoPercent.toFixed(0)}%)</span>
          </div>
          <div class="pie-chart-item">
            <span class="pie-chart-color" style="background: var(--color-warning);"></span>
            <span>Eventual: ${data.eventual} (${eventualPercent.toFixed(0)}%)</span>
          </div>
        </div>
        <div class="progress-stacked">
          <div class="progress-stacked__bar" style="width: ${contratoPercent}%; background: var(--color-success);"></div>
          <div class="progress-stacked__bar" style="width: ${eventualPercent}%; background: var(--color-warning);"></div>
        </div>
      </div>
    `;
  };

  const renderIngresosPorMoneda = (data) => {
    if (!data) return '<p class="text-muted">No hay datos disponibles</p>';

    return `
      <div class="currency-stats">
        <div class="currency-stat">
          <span class="currency-stat__symbol">$</span>
          <div class="currency-stat__info">
            <span class="currency-stat__label">USD</span>
            <span class="currency-stat__value">$${data.usd.toFixed(2)}</span>
          </div>
        </div>
        <div class="currency-stat">
          <span class="currency-stat__symbol">C$</span>
          <div class="currency-stat__info">
            <span class="currency-stat__label">NIO</span>
            <span class="currency-stat__value">C$${data.nio.toFixed(2)}</span>
          </div>
        </div>
      </div>
    `;
  };

  const renderClienteHistory = (data) => {
    if (!data || data.length === 0) {
      return '<p class="text-muted text-center p-lg">No hay datos disponibles</p>';
    }

    return `
      <table class="data-table">
        <thead class="data-table__head">
          <tr>
            <th>Cliente</th>
            <th>Servicios</th>
            <th>Último Servicio</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody class="data-table__body">
          ${data.slice(0, 5).map(item => `
            <tr>
              <td>
                <div class="font-medium">${item.empresa}</div>
                <div class="text-xs text-muted">${item.nombreCliente}</div>
              </td>
              <td>${item.totalServicios}</td>
              <td>${item.ultimoServicio ? new Date(item.ultimoServicio).toLocaleDateString('es-NI') : 'N/A'}</td>
              <td><span class="badge ${item.estado === 'Activo' ? 'badge--success' : 'badge--neutral'}">${item.estado}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  };

  const renderEquipoStatus = (data) => {
    if (!data || data.length === 0) {
      return '<p class="text-muted text-center p-lg">No hay datos disponibles</p>';
    }

    return `
      <table class="data-table">
        <thead class="data-table__head">
          <tr>
            <th>Estado</th>
            <th>Cantidad</th>
            <th>Porcentaje</th>
          </tr>
        </thead>
        <tbody class="data-table__body">
          ${data.map(item => `
            <tr>
              <td>
                <span class="badge ${item.estado === 'Operativo' ? 'badge--success' : item.estado === 'En Reparación' ? 'badge--warning' : 'badge--danger'}">
                  ${item.estado}
                </span>
              </td>
              <td>${item.count}</td>
              <td>${item.porcentaje.toFixed(1)}%</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  };

  // Event Handlers
  const handlePeriodoFilter = (value) => { filterState.periodo = value; App.refreshCurrentModule(); };
  const handleFechaInicio = (value) => { filterState.fechaInicio = value; App.refreshCurrentModule(); };
  const handleFechaFin = (value) => { filterState.fechaFin = value; App.refreshCurrentModule(); };

  const exportReport = () => {
    alert('Exportando analíticas del dashboard (simulado)...');
  };

  // ========== GENERAL REPORT GENERATION ==========
  const generateGeneralReport = () => {
    const visitas = DataService.getVisitasSync();

    // We can respect the timeframe filters if set to 'custom', otherwise default to all or prompt?
    // User request: "filtro de reportes general de todos los trabajos y visitas realizadas"
    // I will include ALL visited, sorted by date.

    // Using DataService.getReportesStats logic partly or just fetching raw data
    // Assuming filters are relevant if set, but for "General Report" let's just dump everything or respect current filtered state?
    // Let's use getVisitasSync (which returns all) and filter if period is set? 
    // For now, listing ALL as per "General Report" naming.
    const sortedVisitas = [...visitas].sort((a, b) => new Date(b.fechaInicio) - new Date(a.fechaInicio));

    const content = `
      <div class="header">
        <h1>Reporte General de Trabajos y Visitas</h1>
        <p>Fecha de emisión: ${new Date().toLocaleDateString('es-NI')}</p>
        <p>Total de Registros: ${sortedVisitas.length}</p>
      </div>
      
      <div class="section">
        <div class="section-title">Detalle de Actividades</div>
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Tipo</th>
              <th>Técnico</th>
              <th>Trabajo Realizado</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${sortedVisitas.map(v => {
      const cliente = DataService.getClienteById(v.clienteId);
      return `
                <tr>
                  <td>${new Date(v.fechaInicio).toLocaleDateString('es-NI')}</td>
                  <td>
                    <div>${cliente?.empresa || 'N/A'}</div>
                    <div style="font-size: 9px; color: #666;">${cliente?.nombreCliente || ''}</div>
                  </td>
                  <td>${v.tipoVisita}</td>
                  <td>${v.usuarioSoporte}</td>
                  <td>${v.descripcionTrabajo}</td>
                  <td>
                    <span class="badge badge-${v.trabajoRealizado ? 'success' : 'warning'}">
                      ${v.trabajoRealizado ? 'Completado' : 'Pendiente'}
                    </span>
                  </td>
                </tr>
              `;
    }).join('')}
          </tbody>
        </table>
      </div>
    `;

    // Re-use the print logic (maybe refactor to a shared utility later, but for now inline)
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Reporte General</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1a73e8; padding-bottom: 20px; }
          .header h1 { color: #1a73e8; font-size: 24px; }
          .header p { color: #666; margin-top: 5px; }
          .section { margin-bottom: 25px; }
          .section-title { font-size: 16px; font-weight: bold; color: #1a73e8; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; font-size: 11px; }
          th { background: #1a73e8; color: white; font-weight: 600; }
          tr:nth-child(even) { background: #f8f9fa; }
          .badge { display: inline-block; padding: 2px 6px; border-radius: 3px; font-size: 10px; font-weight: 500; }
          .badge-success { background: #d4edda; color: #155724; }
          .badge-warning { background: #fff3cd; color: #856404; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        ${content}
        <div style="margin-top: 40px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #ddd; padding-top: 10px;">
          <p>Generado automáticamente por ALLTECH</p>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return {
    render, handlePeriodoFilter, handleFechaInicio, handleFechaFin, exportReport, generateGeneralReport
  };
})();
