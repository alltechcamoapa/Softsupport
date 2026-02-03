/**
 * ALLTECH SUPPORT - Data Service
 * Data layer with mock data following desarrollo.md schema
 * Implements agnostic interface for future backend integration
 */

const DataService = (() => {
    // ========== STORAGE KEY ==========
    const STORAGE_KEY = 'alltech_support_data';

    // ========== DEFAULT DATA ==========
    const DEFAULT_DATA = {
        clientes: [
            { clienteId: 'CLI001', nombreCliente: 'Carlos Mendoza', empresa: 'Tecnología Nica S.A.', telefono: '+505 8845-7721', correo: 'carlos@tecnica.com.ni', direccion: 'Managua, Carretera Norte km 5', estado: 'Activo', fechaCreacion: '2024-01-15' },
            { clienteId: 'CLI002', nombreCliente: 'María García', empresa: 'Comercial Centroamérica', telefono: '+505 8912-3456', correo: 'maria@comercialca.com', direccion: 'León, Calle Central', estado: 'Activo', fechaCreacion: '2024-02-20' },
            { clienteId: 'CLI003', nombreCliente: 'Roberto Sánchez', empresa: 'Distribuidora El Triunfo', telefono: '+505 8723-9012', correo: 'roberto@eltriunfo.com.ni', direccion: 'Granada, Zona Colonial', estado: 'Activo', fechaCreacion: '2024-03-10' },
            { clienteId: 'CLI004', nombreCliente: 'Ana López', empresa: 'Servicios Express', telefono: '+505 8567-1234', correo: 'ana@serviciosexp.com', direccion: 'Masaya, Centro', estado: 'Inactivo', fechaCreacion: '2023-11-05' }
        ],
        contratos: [
            { contratoId: 'CON001', clienteId: 'CLI001', fechaInicio: '2024-01-15', fechaFin: '2025-01-15', tarifa: 150.00, moneda: 'USD', tipoContrato: 'Mensual', estadoContrato: 'Activo' },
            { contratoId: 'CON002', clienteId: 'CLI002', fechaInicio: '2024-02-01', fechaFin: '2025-02-01', tarifa: 5000.00, moneda: 'NIO', tipoContrato: 'Anual', estadoContrato: 'Activo' },
            { contratoId: 'CON003', clienteId: 'CLI003', fechaInicio: '2023-06-01', fechaFin: '2024-06-01', tarifa: 200.00, moneda: 'USD', tipoContrato: 'Mensual', estadoContrato: 'Vencido' }
        ],
        visitas: [
            { visitaId: 'VIS001', clienteId: 'CLI001', contratoId: 'CON001', tipoVisita: 'Física', fechaInicio: '2025-01-25T09:00:00', fechaFin: '2025-01-25T12:00:00', descripcionTrabajo: 'Mantenimiento preventivo de servidores', trabajoRealizado: true, costoServicio: 0, moneda: 'USD', usuarioSoporte: 'Técnico Juan' },
            { visitaId: 'VIS002', clienteId: 'CLI002', contratoId: 'CON002', tipoVisita: 'Remota', fechaInicio: '2025-01-26T14:00:00', fechaFin: '2025-01-26T15:30:00', descripcionTrabajo: 'Configuración de backup en la nube', trabajoRealizado: false, costoServicio: 0, moneda: 'NIO', usuarioSoporte: 'Técnico María' },
            { visitaId: 'VIS003', clienteId: 'CLI003', contratoId: null, tipoVisita: 'Física', fechaInicio: '2025-01-27T10:00:00', fechaFin: '2025-01-27T13:00:00', descripcionTrabajo: 'Reparación de impresora láser', trabajoRealizado: true, costoServicio: 75.00, moneda: 'USD', usuarioSoporte: 'Técnico Juan' },
            { visitaId: 'VIS004', clienteId: 'CLI001', contratoId: 'CON001', tipoVisita: 'Remota', fechaInicio: '2025-01-28T11:00:00', fechaFin: '2025-01-28T12:00:00', descripcionTrabajo: 'Actualización de software antivirus', trabajoRealizado: false, costoServicio: 0, moneda: 'USD', usuarioSoporte: 'Técnico Carlos' }
        ],
        equipos: [
            { equipoId: 'EQU001', clienteId: 'CLI001', nombreEquipo: 'Servidor Principal', marca: 'Dell', modelo: 'PowerEdge R740', serie: 'SRV-2024-001', ubicacion: 'Data Center', estado: 'Operativo' },
            { equipoId: 'EQU002', clienteId: 'CLI001', nombreEquipo: 'Firewall', marca: 'Fortinet', modelo: 'FortiGate 60F', serie: 'FGT-2024-002', ubicacion: 'Rack Principal', estado: 'Operativo' },
            { equipoId: 'EQU003', clienteId: 'CLI002', nombreEquipo: 'NAS Storage', marca: 'Synology', modelo: 'DS920+', serie: 'NAS-2024-003', ubicacion: 'Oficina Central', estado: 'Operativo' },
            { equipoId: 'EQU004', clienteId: 'CLI003', nombreEquipo: 'Impresora Láser', marca: 'HP', modelo: 'LaserJet Pro M404dn', serie: 'IMP-2024-004', ubicacion: 'Recepción', estado: 'En Reparación' }
        ],
        reparaciones: [
            { reparacionId: 'REP001', equipoId: 'EQU001', fecha: '2024-06-15', problema: 'Disco duro fallando', trabajoRealizado: 'Reemplazo de disco duro RAID', tecnico: 'Técnico Juan', costo: 150.00, repuestos: 'SSD 1TB WD' },
            { reparacionId: 'REP002', equipoId: 'EQU001', fecha: '2024-09-20', problema: 'Fuente de poder inestable', trabajoRealizado: 'Reemplazo de fuente de poder', tecnico: 'Técnico María', costo: 200.00, repuestos: 'Fuente 750W Dell' },
            { reparacionId: 'REP003', equipoId: 'EQU004', fecha: '2025-01-10', problema: 'Atasco de papel frecuente', trabajoRealizado: 'Limpieza de rodillos y calibración', tecnico: 'Técnico Carlos', costo: 0, repuestos: '' },
            { reparacionId: 'REP004', equipoId: 'EQU003', fecha: '2024-11-05', problema: 'Disco 2 en estado crítico', trabajoRealizado: 'Backup de datos y reemplazo de disco', tecnico: 'Técnico Juan', costo: 180.00, repuestos: 'HDD 4TB Seagate' }
        ],
        software: [
            { id: 'SW001', nombreSoftware: 'Windows 10 Pro', fechaInicioPoliza: '2024-01-01', fechaFinPoliza: '2025-01-01', tipoLicencia: 'SERVIDOR', tipoSoftware: 'Sistema Operativo', numeroLicencia: 'W10P-XXXX', numeroSerie: 'SN-0001', modoActivacion: 'ORIGINAL', nombreRegistro: 'Tecnología Nica S.A.' },
            { id: 'SW002', nombreSoftware: 'Office 2021', fechaInicioPoliza: '2024-03-15', fechaFinPoliza: '2025-03-15', tipoLicencia: 'ADICIONAL', tipoSoftware: 'Ofimática', numeroLicencia: 'OFF21-AAAA', numeroSerie: 'SN-0002', modoActivacion: 'HACK', nombreRegistro: 'Comercial Centroamérica' }
        ],
        productos: [
            { id: 'PROD001', codigo: 'SRV-MANT', nombre: 'Mantenimiento de Servidor', tipo: 'Servicio', categoria: 'Mantenimiento', precio: 150.00, descripcion: 'Mantenimiento preventivo físico y lógico', estado: 'Activo' },
            { id: 'PROD002', codigo: 'WIN-11-PRO', nombre: 'Licencia Windows 11 Pro', tipo: 'Producto', categoria: 'Software', precio: 185.00, descripcion: 'Licencia digital vitalicia', estado: 'Activo' },
            { id: 'PROD003', codigo: 'SSD-1TB', nombre: 'SSD Kingston 1TB', tipo: 'Producto', categoria: 'Hardware', precio: 85.00, descripcion: 'Unidad de estado sólido 2.5 pulg', estado: 'Activo' },
            { id: 'PROD004', codigo: 'VIS-TECNICA', nombre: 'Visita Técnica', tipo: 'Servicio', categoria: 'Soporte', precio: 35.00, descripcion: 'Visita de diagnóstico en sitio', estado: 'Activo' }
        ],
        proformas: [
            {
                proformaId: 'PRO001',
                numero: 1,
                clienteId: 'CLI001',
                fecha: '2026-01-15',
                validezDias: 15,
                estado: 'Activa',
                items: [
                    { cantidad: 2, descripcion: 'Servicio de mantenimiento preventivo', precioUnitario: 75.00, total: 150.00 },
                    { cantidad: 1, descripcion: 'Instalación de software antivirus', precioUnitario: 45.00, total: 45.00 }
                ],
                subtotal: 195.00,
                iva: 0,
                total: 195.00,
                moneda: 'USD',
                notas: 'Incluye mano de obra y materiales básicos',
                creadoPor: 'Roberto Wilson'
            },
            {
                proformaId: 'PRO002',
                numero: 2,
                clienteId: 'CLI002',
                fecha: '2026-01-20',
                validezDias: 30,
                estado: 'Aprobada',
                items: [
                    { cantidad: 4, descripcion: 'Cámaras de seguridad IP', precioUnitario: 85.00, total: 340.00 },
                    { cantidad: 1, descripcion: 'DVR 8 Canales', precioUnitario: 120.00, total: 120.00 },
                    { cantidad: 1, descripcion: 'Instalación y configuración', precioUnitario: 150.00, total: 150.00 }
                ],
                subtotal: 610.00,
                iva: 0,
                total: 610.00,
                moneda: 'USD',
                notas: 'Garantía de 1 año en equipos',
                creadoPor: 'Roberto Wilson'
            },
            {
                proformaId: 'PRO003',
                numero: 3,
                clienteId: 'CLI003',
                fecha: '2026-01-25',
                validezDias: 7,
                estado: 'Activa',
                items: [
                    { cantidad: 10, descripcion: 'Licencia Microsoft Office 2021', precioUnitario: 250.00, total: 2500.00 }
                ],
                subtotal: 2500.00,
                iva: 0,
                total: 2500.00,
                moneda: 'USD',
                notas: 'Precio especial por volumen',
                creadoPor: 'Roberto Wilson'
            }
        ],
        users: [
            { id: 'USR001', username: 'Admin', password: 'admin', name: 'Roberto Wilson', email: 'robertowilson@yahoo.com', role: 'Administrador', allowedModules: ['clientes', 'contratos', 'visitas', 'proformas', 'productos', 'equipos', 'software', 'calendario', 'reportes', 'configuracion'] },
            { id: 'USR002', username: 'Ventas', password: '123', name: 'Maria Lopez', email: 'maria@alltech.com', role: 'Ejecutivo de Ventas', allowedModules: ['clientes', 'contratos', 'proformas', 'productos', 'reportes'] },
            { id: 'USR003', username: 'Tecnico', password: '123', name: 'Carlos Ruiz', email: 'carlos@alltech.com', role: 'Tecnico', allowedModules: ['clientes', 'visitas', 'equipos', 'software'] }
        ],
        config: {
            monedaPrincipal: 'USD',
            tipoCambio: 36.5,
            alertasContratos: true,
            diasAnticipacion: 30,
            recordatoriosVisitas: true
        },
        contractTemplates: [
            {
                id: 'TPL_STD',
                name: 'Contrato Mantenimiento Estándar',
                content: `CONTRATO DE SERVICIOS
                
Entre {{empresa_cliente}} y ALLTECH SUPPORT.

1. OBJETO: Mantenimiento de equipos.
2. VIGENCIA: Del {{fecha_inicio}} al {{fecha_fin}}.
3. PAGO: {{moneda}} {{tarifa}} {{tipo_contrato}}.

Firma: ____________________`,
                variables: ['empresa_cliente', 'fecha_inicio', 'fecha_fin', 'tarifa', 'moneda', 'tipo_contrato']
            }
        ],
        proformaSequence: 4,
        permissions: {
            "Administrador": {
                "clientes": { create: true, read: true, update: true, delete: true },
                "contratos": { create: true, read: true, update: true, delete: true },
                "visitas": { create: true, read: true, update: true, delete: true },
                "equipos": { create: true, read: true, update: true, delete: true },
                "software": { create: true, read: true, update: true, delete: true },
                "productos": { create: true, read: true, update: true, delete: true },
                "proformas": { create: true, read: true, update: true, delete: true },
                "usuarios": { create: true, read: true, update: true, delete: true },
                "configuracion": { create: true, read: true, update: true, delete: true },
                "editor-reportes": { create: true, read: true, update: true, delete: true }
            },
            "Ejecutivo de Ventas": {
                "clientes": { create: true, read: true, update: true, delete: false },
                "contratos": { create: true, read: true, update: true, delete: false },
                "visitas": { create: false, read: true, update: false, delete: false },
                "equipos": { create: false, read: true, update: false, delete: false },
                "software": { create: false, read: true, update: false, delete: false },
                "productos": { create: true, read: true, update: true, delete: false },
                "proformas": { create: true, read: true, update: true, delete: false },
                "usuarios": { create: false, read: false, update: false, delete: false },
                "configuracion": { create: false, read: true, update: false, delete: false },
                "editor-reportes": { create: false, read: true, update: false, delete: false }
            },
            "Tecnico": {
                "clientes": { create: false, read: true, update: false, delete: false },
                "contratos": { create: false, read: true, update: false, delete: false },
                "visitas": { create: true, read: true, update: true, delete: false },
                "equipos": { create: true, read: true, update: true, delete: false },
                "software": { create: true, read: true, update: true, delete: false },
                "productos": { create: false, read: true, update: false, delete: false },
                "proformas": { create: false, read: true, update: false, delete: false },
                "usuarios": { create: false, read: false, update: false, delete: false },
                "configuracion": { create: false, read: true, update: false, delete: false },
                "editor-reportes": { create: false, read: true, update: false, delete: false }
            }
        }
    };

    // ========== STORAGE FUNCTIONS ==========
    const saveToStorage = () => {
        try {
            const data = {
                clientes: mockClientes,
                contratos: mockContratos,
                visitas: mockVisitas,
                equipos: mockEquipos,
                reparaciones: mockReparaciones,
                software: mockSoftware,
                productos: mockProductos,
                proformas: mockProformas,
                users: mockUsers,
                config: config,
                proformaSequence: proformaSequence,
                permissions: permissions,
                contractTemplates: mockTemplates
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            console.log('✅ Datos guardados en localStorage');
        } catch (error) {
            console.error('❌ Error guardando datos:', error);
        }
    };

    const loadFromStorage = () => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const data = JSON.parse(stored);
                console.log('✅ Datos cargados desde localStorage');
                return data;
            }
        } catch (error) {
            console.error('❌ Error cargando datos:', error);
        }
        console.log('ℹ️ Usando datos por defecto');
        return DEFAULT_DATA;
    };

    const resetData = () => {
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
    };

    // ========== INITIALIZE DATA FROM STORAGE ==========
    const storedData = loadFromStorage();
    let mockClientes = storedData.clientes;
    let mockContratos = storedData.contratos;
    let mockVisitas = storedData.visitas;
    let mockEquipos = storedData.equipos;
    let mockReparaciones = storedData.reparaciones;
    let mockSoftware = storedData.software;
    let mockProductos = storedData.productos;
    let mockProformas = storedData.proformas;
    const mockUsers = storedData.users;
    let proformaSequence = storedData.proformaSequence;
    let config = storedData.config;
    let permissions = storedData.permissions;
    let mockTemplates = storedData.contractTemplates || JSON.parse(JSON.stringify(DEFAULT_DATA.contractTemplates));

    // ========== CLIENTES ==========
    const getClientesSync = () => [...mockClientes];
    const getClientesFiltered = (filter) => {
        return mockClientes.filter(c => {
            let matches = true;
            if (filter.search) {
                const s = filter.search.toLowerCase();
                matches = c.nombreCliente.toLowerCase().includes(s) || c.empresa.toLowerCase().includes(s) || c.correo.toLowerCase().includes(s);
            }
            if (filter.status && filter.status !== 'all') matches = matches && c.estado === filter.status;
            return matches;
        });
    };
    const getClienteById = (id) => mockClientes.find(c => c.clienteId === id) || null;
    const createCliente = (data) => { mockClientes.push(data); saveToStorage(); };
    const updateCliente = (id, data) => {
        const idx = mockClientes.findIndex(c => c.clienteId === id);
        if (idx !== -1) { mockClientes[idx] = { ...mockClientes[idx], ...data }; saveToStorage(); }
    };
    const deleteCliente = (id) => { mockClientes = mockClientes.filter(c => c.clienteId !== id); saveToStorage(); };

    // ========== CONTRATOS ==========
    const getContratosSync = () => [...mockContratos];
    const getContratosFiltered = (filter) => {
        return mockContratos.filter(c => {
            let matches = true;
            if (filter.search) {
                const cliente = getClienteById(c.clienteId);
                const s = filter.search.toLowerCase();
                matches = c.contratoId.toLowerCase().includes(s) || (cliente?.empresa || '').toLowerCase().includes(s);
            }
            if (filter.status && filter.status !== 'all') matches = matches && c.estadoContrato === filter.status;
            if (filter.tipo && filter.tipo !== 'all') matches = matches && c.tipoContrato === filter.tipo;
            return matches;
        });
    };
    const getContratoById = (id) => mockContratos.find(c => c.contratoId === id) || null;
    const getContratosByCliente = (clienteId) => mockContratos.filter(c => c.clienteId === clienteId);
    const createContrato = (data) => { mockContratos.push(data); saveToStorage(); };
    const updateContrato = (id, data) => {
        const idx = mockContratos.findIndex(c => c.contratoId === id);
        if (idx !== -1) { mockContratos[idx] = { ...mockContratos[idx], ...data }; saveToStorage(); }
    };
    const getContratosStats = () => {
        const activos = mockContratos.filter(c => c.estadoContrato === 'Activo').length;
        const vencidos = mockContratos.filter(c => c.estadoContrato === 'Vencido').length;
        const now = new Date();
        const porVencer = mockContratos.filter(c => {
            const fin = new Date(c.fechaFin);
            const diff = (fin - now) / (1000 * 60 * 60 * 24);
            return c.estadoContrato === 'Activo' && diff <= 30 && diff > 0;
        }).length;
        const ingresosMensuales = mockContratos.filter(c => c.estadoContrato === 'Activo').reduce((sum, c) => {
            const tarifa = c.moneda === 'USD' ? c.tarifa : c.tarifa / config.tipoCambio;
            return sum + (c.tipoContrato === 'Anual' ? tarifa / 12 : tarifa);
        }, 0);
        return { activos, vencidos, porVencer, ingresosMensuales };
    };
    const getContratosProximosAVencer = () => {
        const now = new Date();
        return mockContratos.filter(c => {
            const fin = new Date(c.fechaFin);
            const diff = (fin - now) / (1000 * 60 * 60 * 24);
            return c.estadoContrato === 'Activo' && diff <= config.diasAnticipacion && diff > 0;
        });
    };

    // ========== VISITAS ==========
    const getVisitasSync = () => [...mockVisitas];
    const getVisitasFiltered = (filter) => {
        return mockVisitas.filter(v => {
            let matches = true;
            if (filter.search) {
                const cliente = getClienteById(v.clienteId);
                const s = filter.search.toLowerCase();
                matches = v.descripcionTrabajo.toLowerCase().includes(s) || (cliente?.empresa || '').toLowerCase().includes(s);
            }
            if (filter.tipo && filter.tipo !== 'all') matches = matches && v.tipoVisita === filter.tipo;
            if (filter.hasContrato === 'with') matches = matches && v.contratoId !== null;
            if (filter.hasContrato === 'without') matches = matches && v.contratoId === null;
            return matches;
        });
    };
    const getVisitaById = (id) => mockVisitas.find(v => v.visitaId === id) || null;
    const getVisitasByCliente = (clienteId) => mockVisitas.filter(v => v.clienteId === clienteId);
    const getVisitasByContrato = (contratoId) => mockVisitas.filter(v => v.contratoId === contratoId);
    const getVisitasByMonth = (year, month) => {
        return mockVisitas.filter(v => {
            const d = new Date(v.fechaInicio);
            return d.getFullYear() === year && d.getMonth() === month;
        });
    };
    const createVisita = (data) => { mockVisitas.push(data); saveToStorage(); };
    const updateVisita = (id, data) => {
        const idx = mockVisitas.findIndex(v => v.visitaId === id);
        if (idx !== -1) { mockVisitas[idx] = { ...mockVisitas[idx], ...data }; saveToStorage(); }
    };
    const getVisitasStats = () => {
        const now = new Date();
        const esteMes = mockVisitas.filter(v => {
            const d = new Date(v.fechaInicio);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length;
        const completadas = mockVisitas.filter(v => v.trabajoRealizado).length;
        const ingresosEventuales = mockVisitas.filter(v => v.contratoId === null && v.costoServicio > 0)
            .reduce((sum, v) => sum + (v.moneda === 'USD' ? v.costoServicio : v.costoServicio / config.tipoCambio), 0);
        return { esteMes, completadas, ingresosEventuales };
    };

    // ========== EQUIPOS ==========
    const getEquiposSync = () => [...mockEquipos];
    const getEquiposFiltered = (filter) => {
        return mockEquipos.filter(e => {
            let matches = true;
            if (filter.search) {
                const s = filter.search.toLowerCase();
                matches = e.nombreEquipo.toLowerCase().includes(s) || e.marca.toLowerCase().includes(s) || e.modelo.toLowerCase().includes(s);
            }
            if (filter.clienteId && filter.clienteId !== 'all') matches = matches && e.clienteId === filter.clienteId;
            if (filter.estado && filter.estado !== 'all') matches = matches && e.estado === filter.estado;
            return matches;
        });
    };
    const getEquipoById = (id) => mockEquipos.find(e => e.equipoId === id) || null;
    const getEquiposByCliente = (clienteId) => mockEquipos.filter(e => e.clienteId === clienteId);
    const createEquipo = (data) => { mockEquipos.push(data); saveToStorage(); };
    const updateEquipo = (id, data) => {
        const idx = mockEquipos.findIndex(e => e.equipoId === id);
        if (idx !== -1) { mockEquipos[idx] = { ...mockEquipos[idx], ...data }; saveToStorage(); }
    };
    const getEquiposStats = () => {
        const operativos = mockEquipos.filter(e => e.estado === 'Operativo').length;
        const enReparacion = mockEquipos.filter(e => e.estado === 'En Reparación').length;
        return { operativos, enReparacion, total: mockEquipos.length };
    };
    const getHistorialEquipo = (equipoId) => {
        return mockVisitas.filter(v => {
            const equipo = mockEquipos.find(e => e.equipoId === equipoId);
            return equipo && v.clienteId === equipo.clienteId;
        }).map(v => ({
            fecha: v.fechaInicio,
            trabajoRealizado: v.descripcionTrabajo,
            tecnico: v.usuarioSoporte
        }));
    };

    // ========== REPARACIONES ==========
    const getReparacionesByEquipo = (equipoId) => mockReparaciones.filter(r => r.equipoId === equipoId).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    const getReparacionById = (id) => mockReparaciones.find(r => r.reparacionId === id) || null;
    const createReparacion = (data) => { mockReparaciones.push(data); saveToStorage(); };
    const updateReparacion = (id, data) => {
        const idx = mockReparaciones.findIndex(r => r.reparacionId === id);
        if (idx !== -1) { mockReparaciones[idx] = { ...mockReparaciones[idx], ...data }; saveToStorage(); }
    };
    const deleteReparacion = (id) => { mockReparaciones = mockReparaciones.filter(r => r.reparacionId !== id); saveToStorage(); };

    // ========== CONFIG ==========
    const getConfig = () => ({ ...config });
    const updateConfig = (data) => { config = { ...config, ...data }; saveToStorage(); };
    const exportAllData = () => ({ clientes: mockClientes, contratos: mockContratos, visitas: mockVisitas, equipos: mockEquipos, config });

    // ========== REPORTES ==========
    const getReportesStats = (filter) => {
        const totalClientes = mockClientes.length;
        const totalServicios = mockVisitas.length;
        const contratosActivos = mockContratos.filter(c => c.estadoContrato === 'Activo').length;

        const ingresosTotales = mockContratos.filter(c => c.estadoContrato === 'Activo')
            .reduce((sum, c) => sum + (c.moneda === 'USD' ? c.tarifa : c.tarifa / config.tipoCambio), 0) +
            mockVisitas.filter(v => v.costoServicio > 0)
                .reduce((sum, v) => sum + (v.moneda === 'USD' ? v.costoServicio : v.costoServicio / config.tipoCambio), 0);

        const serviciosPorTecnico = ['Técnico Juan', 'Técnico María', 'Técnico Carlos'].map(t => ({
            tecnico: t,
            count: mockVisitas.filter(v => v.usuarioSoporte === t).length
        }));

        const serviciosPorTipo = {
            fisica: mockVisitas.filter(v => v.tipoVisita === 'Física').length,
            remota: mockVisitas.filter(v => v.tipoVisita === 'Remota').length
        };

        const contratoVsEventual = {
            contrato: mockVisitas.filter(v => v.contratoId !== null).length,
            eventual: mockVisitas.filter(v => v.contratoId === null).length
        };

        const ingresosPorMoneda = {
            usd: mockVisitas.filter(v => v.moneda === 'USD' && v.costoServicio > 0).reduce((s, v) => s + v.costoServicio, 0),
            nio: mockVisitas.filter(v => v.moneda === 'NIO' && v.costoServicio > 0).reduce((s, v) => s + v.costoServicio, 0)
        };

        const historialClientes = mockClientes.map(c => {
            const visitas = getVisitasByCliente(c.clienteId);
            return {
                ...c,
                totalServicios: visitas.length,
                ultimoServicio: visitas.length > 0 ? visitas.sort((a, b) => new Date(b.fechaInicio) - new Date(a.fechaInicio))[0].fechaInicio : null
            };
        });

        const estadoEquipos = [
            { estado: 'Operativo', count: mockEquipos.filter(e => e.estado === 'Operativo').length },
            { estado: 'En Reparación', count: mockEquipos.filter(e => e.estado === 'En Reparación').length },
            { estado: 'Fuera de Servicio', count: mockEquipos.filter(e => e.estado === 'Fuera de Servicio').length }
        ].map(e => ({ ...e, porcentaje: mockEquipos.length > 0 ? (e.count / mockEquipos.length) * 100 : 0 }));

        return { totalClientes, totalServicios, contratosActivos, ingresosTotales, serviciosPorTecnico, serviciosPorTipo, contratoVsEventual, ingresosPorMoneda, historialClientes, estadoEquipos };
    };

    // ========== DASHBOARD ==========
    const getDashboardStats = () => {
        const clientesActivos = mockClientes.filter(c => c.estado === 'Activo').length;
        const contratosActivos = mockContratos.filter(c => c.estadoContrato === 'Activo').length;
        const serviciosMes = mockVisitas.length;
        const ingresosMes = mockVisitas.reduce((sum, v) => v.costoServicio > 0 ? sum + (v.moneda === 'USD' ? v.costoServicio : v.costoServicio / config.tipoCambio) : sum, 0);
        const ingresoContratos = mockContratos.filter(c => c.estadoContrato === 'Activo').reduce((sum, c) => sum + (c.moneda === 'USD' ? c.tarifa : c.tarifa / config.tipoCambio), 0);
        return {
            clientesActivos: { value: clientesActivos, trend: 12, trendDirection: 'up' },
            serviciosMes: { value: serviciosMes, trend: 8, trendDirection: 'up' },
            ingresosMes: { value: ingresosMes + ingresoContratos, trend: 5, trendDirection: 'up' },
            contratosActivos: { value: contratosActivos, trend: -2, trendDirection: 'down' }
        };
    };
    const getRecentActivities = () => mockVisitas.map((v, i) => {
        const cliente = getClienteById(v.clienteId);
        return { id: i + 1, numero: v.visitaId, cliente: cliente?.empresa || 'N/A', descripcion: v.descripcionTrabajo, fecha: new Date(v.fechaInicio).toLocaleDateString('es-NI'), estado: v.trabajoRealizado ? 'Completado' : 'Pendiente', monto: v.costoServicio > 0 ? `$${v.costoServicio.toFixed(2)}` : 'Contrato' };
    });
    const getChartData = () => ({ labels: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'], revenue: [120, 180, 150, 200, 280, 220, 180], profit: [80, 120, 100, 140, 180, 150, 120] });
    const getSavingsPlans = () => [{ id: 1, title: 'Mantenimiento', subtitle: 'Próximo mes', icon: '🔧', target: 35000, current: 22750, percent: 65 }, { id: 2, title: 'Expansión', subtitle: 'Q1 2025', icon: '📈', target: 42000, current: 18900, percent: 45 }];
    const getBankAccounts = () => [{ id: 1, name: 'BAC Credomatic', number: '**** 5654', status: 'Activo' }, { id: 2, name: 'Banpro', number: '**** 4566', status: 'Activo' }, { id: 3, name: 'Lafise Bancentro', number: '**** 4566', status: 'Activo' }];

    // ========== SOFTWARE ==========
    const getSoftwareFiltered = (filter) => {
        return mockSoftware.filter(s => {
            let matches = true;
            if (filter.search) {
                const search = filter.search.toLowerCase();
                matches = s.nombreSoftware.toLowerCase().includes(search) ||
                    s.numeroLicencia.toLowerCase().includes(search) ||
                    (s.numeroSerie || '').toLowerCase().includes(search) ||
                    (s.nombreRegistro || '').toLowerCase().includes(search);
            }
            if (filter.tipo && filter.tipo !== 'all') matches = matches && s.tipoLicencia === filter.tipo;
            if (filter.activacion && filter.activacion !== 'all') matches = matches && s.modoActivacion === filter.activacion;
            return matches;
        });
    };
    const getSoftwareById = (id) => mockSoftware.find(s => s.id === id);
    const getSoftwareByRegistro = (registroName) => mockSoftware.filter(s => (s.nombreRegistro || '').toLowerCase().includes(registroName.toLowerCase()));
    const getSoftwareUniqueRegistros = () => [...new Set(mockSoftware.map(s => s.nombreRegistro).filter(Boolean))];

    const createSoftware = (data) => {
        data.id = 'SW' + String(Date.now()).slice(-6);
        mockSoftware.push(data);
        saveToStorage();
    };
    const updateSoftware = (id, data) => {
        const idx = mockSoftware.findIndex(s => s.id === id);
        if (idx !== -1) { mockSoftware[idx] = { ...mockSoftware[idx], ...data }; saveToStorage(); }
    };
    const deleteSoftware = (id) => { mockSoftware = mockSoftware.filter(s => s.id !== id); saveToStorage(); };

    // ========== PRODUCTOS / SERVICIOS ==========
    const getProductosSync = () => [...mockProductos];
    const getProductosFiltered = (filter) => {
        return mockProductos.filter(p => {
            let matches = true;
            if (filter.search) {
                const s = filter.search.toLowerCase();
                matches = p.nombre.toLowerCase().includes(s) ||
                    p.codigo.toLowerCase().includes(s) ||
                    (p.categoria || '').toLowerCase().includes(s) ||
                    (p.descripcion || '').toLowerCase().includes(s);
            }
            if (filter.tipo && filter.tipo !== 'all') matches = matches && p.tipo === filter.tipo;
            if (filter.estado && filter.estado !== 'all') matches = matches && p.estado === filter.estado;
            return matches;
        }).sort((a, b) => a.nombre.localeCompare(b.nombre));
    };
    const getProductoById = (id) => mockProductos.find(p => p.id === id);
    const createProducto = (data) => {
        data.id = 'PROD' + String(Date.now()).slice(-6);
        data.estado = data.estado || 'Activo';
        data.precio = parseFloat(data.precio) || 0;
        mockProductos.push(data);
        return data;
    };
    const updateProducto = (id, data) => {
        const idx = mockProductos.findIndex(p => p.id === id);
        if (idx !== -1) {
            if (data.precio) data.precio = parseFloat(data.precio);
            mockProductos[idx] = { ...mockProductos[idx], ...data };
        }
    };
    const deleteProducto = (id) => { mockProductos = mockProductos.filter(p => p.id !== id); };

    // ========== PROFORMAS ==========
    const getProformasSync = () => [...mockProformas];
    const getProformasFiltered = (filter) => {
        return mockProformas.filter(p => {
            let matches = true;
            if (filter.search) {
                const cliente = getClienteById(p.clienteId);
                const s = filter.search.toLowerCase();
                matches = p.proformaId.toLowerCase().includes(s) ||
                    (cliente?.empresa || '').toLowerCase().includes(s) ||
                    (cliente?.nombreCliente || '').toLowerCase().includes(s) ||
                    String(p.numero).includes(s);
            }
            if (filter.clienteId && filter.clienteId !== 'all') matches = matches && p.clienteId === filter.clienteId;
            if (filter.estado && filter.estado !== 'all') matches = matches && p.estado === filter.estado;
            if (filter.fechaInicio) matches = matches && new Date(p.fecha) >= new Date(filter.fechaInicio);
            if (filter.fechaFin) matches = matches && new Date(p.fecha) <= new Date(filter.fechaFin);
            return matches;
        }).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    };
    const getProformaById = (id) => mockProformas.find(p => p.proformaId === id) || null;
    const getProformasByCliente = (clienteId) => mockProformas.filter(p => p.clienteId === clienteId).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    const getProformasByRango = (numInicio, numFin) => mockProformas.filter(p => p.numero >= numInicio && p.numero <= numFin).sort((a, b) => a.numero - b.numero);
    const getNextProformaNumber = () => proformaSequence;
    const createProforma = (data) => {
        // Generate PROF001, PROF002, etc.
        data.proformaId = 'PROF' + String(proformaSequence).padStart(3, '0');
        data.numero = proformaSequence++;
        data.estado = data.estado || 'Activa';
        mockProformas.push(data);
        saveToStorage();
        return data;
    };
    const updateProforma = (id, data) => {
        const idx = mockProformas.findIndex(p => p.proformaId === id);
        if (idx !== -1) { mockProformas[idx] = { ...mockProformas[idx], ...data }; saveToStorage(); }
    };
    const deleteProforma = (id) => { mockProformas = mockProformas.filter(p => p.proformaId !== id); saveToStorage(); };
    const getProformasStats = () => {
        const total = mockProformas.length;
        const activas = mockProformas.filter(p => p.estado === 'Activa').length;
        const aprobadas = mockProformas.filter(p => p.estado === 'Aprobada').length;
        const vencidas = mockProformas.filter(p => p.estado === 'Vencida').length;
        const valorTotal = mockProformas.filter(p => p.estado !== 'Anulada').reduce((sum, p) => {
            const valor = p.moneda === 'USD' ? p.total : p.total / config.tipoCambio;
            return sum + valor;
        }, 0);
        const valorAprobado = mockProformas.filter(p => p.estado === 'Aprobada').reduce((sum, p) => {
            const valor = p.moneda === 'USD' ? p.total : p.total / config.tipoCambio;
            return sum + valor;
        }, 0);
        return { total, activas, aprobadas, vencidas, valorTotal, valorAprobado };
    };

    // ========== AUTH ==========
    const authenticateUser = (username, password) => {
        const user = mockUsers.find(u => u.username === username && u.password === password);
        if (user) {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }
        return null;
    };

    const getUsers = () => {
        return mockUsers.map(u => ({ username: u.username, name: u.name, role: u.role }));
    };

    // ========== USER MANAGEMENT ==========
    const getUsersSync = () => {
        return mockUsers.map(u => {
            const { password, ...userWithoutPassword } = u;
            return userWithoutPassword;
        });
    };

    const getUserByUsername = (username) => {
        const user = mockUsers.find(u => u.username === username);
        if (user) {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }
        return null;
    };

    const createUser = (userData) => {
        const newUser = {
            id: 'USR' + String(Date.now()).slice(-6),
            username: userData.username,
            password: userData.password,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            allowedModules: userData.allowedModules || []
        };
        mockUsers.push(newUser);
        saveToStorage();
        return newUser;
    };

    const updateUser = (username, updates) => {
        const idx = mockUsers.findIndex(u => u.username === username);
        if (idx !== -1) {
            // Don't allow username changes, only name, email, role, password, and allowedModules
            mockUsers[idx] = {
                ...mockUsers[idx],
                name: updates.name || mockUsers[idx].name,
                email: updates.email || mockUsers[idx].email,
                role: updates.role || mockUsers[idx].role,
                allowedModules: updates.allowedModules !== undefined ? updates.allowedModules : mockUsers[idx].allowedModules
            };
            // Only update password if provided
            if (updates.password) {
                mockUsers[idx].password = updates.password;
            }
            saveToStorage();
            return true;
        }
        return false;
    };

    const deleteUser = (username) => {
        const initialLength = mockUsers.length;
        const filtered = mockUsers.filter(u => u.username !== username);
        if (filtered.length < initialLength) {
            mockUsers.length = 0;
            mockUsers.push(...filtered);
            saveToStorage();
            return true;
        }
        return false;
    };

    const deleteContrato = (id) => {
        const initialLength = mockContratos.length;
        mockContratos = mockContratos.filter(c => c.contratoId !== id);
        if (mockContratos.length < initialLength) {
            saveToStorage();
            return true;
        }
        return false;
    };

    const deleteVisita = (id) => {
        const initialLength = mockVisitas.length;
        mockVisitas = mockVisitas.filter(v => v.id !== id);
        if (mockVisitas.length < initialLength) {
            saveToStorage();
            return true;
        }
        return false;
    };

    const deleteEquipo = (id) => {
        const initialLength = mockEquipos.length;
        mockEquipos = mockEquipos.filter(e => e.equipoId !== id);
        if (mockEquipos.length < initialLength) {
            saveToStorage();
            return true;
        }
        return false;
    };

    // ========== CONTRACT TEMPLATES ==========
    const getContractTemplates = () => [...mockTemplates];

    const getContractTemplateById = (id) => mockTemplates.find(t => t.id === id) || null;

    const saveContractTemplate = (template) => {
        const idx = mockTemplates.findIndex(t => t.id === template.id);
        if (idx !== -1) {
            // Update existing template
            mockTemplates[idx] = { ...mockTemplates[idx], ...template };
        } else {
            // Create new template
            template.id = template.id || 'TPL_' + String(Date.now()).slice(-6);
            mockTemplates.push(template);
        }
        saveToStorage();
        return template;
    };

    const deleteContractTemplate = (id) => {
        const initialLength = mockTemplates.length;
        mockTemplates = mockTemplates.filter(t => t.id !== id);
        if (mockTemplates.length < initialLength) {
            saveToStorage();
            return true;
        }
        return false;
    };

    // ========== PERMISSIONS ==========
    const getPermissions = () => {
        return JSON.parse(JSON.stringify(permissions)); // Deep copy
    };

    const getRolePermissions = (role) => {
        return permissions[role] ? JSON.parse(JSON.stringify(permissions[role])) : null;
    };

    const updateRolePermissions = (role, newPermissions) => {
        if (!permissions[role]) {
            throw new Error(`Role "${role}" not found`);
        }
        permissions[role] = JSON.parse(JSON.stringify(newPermissions));
        saveToStorage();
        return true;
    };

    const canPerformAction = (role, module, action) => {
        if (!role || !module || !action) return false;
        return permissions[role]?.[module]?.[action] || false;
    };

    const getAvailableRoles = () => {
        return Object.keys(permissions);
    };

    const getAvailableModules = () => {
        const roles = Object.keys(permissions);
        if (roles.length === 0) return [];
        return Object.keys(permissions[roles[0]]);
    };

    // ========== PUBLIC API ==========
    return {
        // Dashboard
        getDashboardStats, getRecentActivities, getChartData, getSavingsPlans, getBankAccounts,
        // Auth
        authenticateUser,
        getUsers,
        // User Management
        getUsersSync, getUserByUsername, createUser, updateUser, deleteUser,
        // Clientes
        getClientesSync, getClientesFiltered, getClienteById, createCliente, updateCliente, deleteCliente,
        // Contratos
        getContratosSync: () => [...mockContratos], getContratosFiltered, getContratoById, getContratosByCliente, createContrato, updateContrato, deleteContrato, getContratosStats, getContratosProximosAVencer,
        // Templates
        getContractTemplates, getContractTemplateById, saveContractTemplate, deleteContractTemplate,
        // Visitas
        getVisitasSync, getVisitasFiltered, getVisitaById, getVisitasByCliente, getVisitasByContrato, getVisitasByMonth, createVisita, updateVisita, deleteVisita, getVisitasStats,
        // Equipos
        getEquiposSync, getEquiposFiltered, getEquipoById, getEquiposByCliente, createEquipo, updateEquipo, deleteEquipo, getEquiposStats, getHistorialEquipo,
        // Reparaciones
        getReparacionesByEquipo, getReparacionById, createReparacion, updateReparacion, deleteReparacion,
        // Productos
        getProductosSync, getProductosFiltered, getProductoById, createProducto, updateProducto, deleteProducto,
        // Software
        getSoftwareFiltered, getSoftwareById, getSoftwareByRegistro, getSoftwareUniqueRegistros, createSoftware, updateSoftware, deleteSoftware,
        // Proformas
        getProformasSync, getProformasFiltered, getProformaById, getProformasByCliente, getProformasByRango, getNextProformaNumber, createProforma, updateProforma, deleteProforma, getProformasStats,
        // Config
        getConfig, updateConfig, exportAllData,
        createUser, updateUser, deleteUser,
        // Permissions
        getPermissions, getRolePermissions, updateRolePermissions, canPerformAction, getAvailableRoles, getAvailableModules,
        // Reportes
        getReportesStats,
        // Storage management
        resetData
    };
})();

if (typeof module !== 'undefined' && module.exports) { module.exports = DataService; }
