/**
 * ALLTECH SUPPORT - Data Service (Supabase Cloud Version)
 * Reemplaza el almacenamiento local con almacenamiento en Cloud (Supabase).
 * Mantiene un caché en memoria para velocidad de UI.
 */

const DataService = (() => {
    // ========== IN-MEMORY CACHE ==========
    let cache = {
        clientes: [],
        contratos: [],
        visitas: [],
        equipos: [],
        reparaciones: [],
        software: [],
        productos: [],
        proformas: [],
        users: [],
        config: {
            monedaPrincipal: 'USD',
            tipoCambio: 36.5,
            alertasContratos: true,
            diasAnticipacion: 30,
            recordatoriosVisitas: true
        },
        permissions: {},
        contractTemplates: []
    };

    let isInitialized = false;

    // ========== UTILS: NORMALIZACIÓN DE DATOS ==========
    // Convierte snake_case de DB a camelCase de App y mapea IDs
    const toCamelCase = (str) => str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());

    const normalizeSupabaseData = (table, data) => {
        if (!data) return null;
        const normalized = {};
        for (const key in data) {
            normalized[toCamelCase(key)] = data[key];
        }

        // Mapeos críticos de compatibilidad
        if (table === 'clientes') normalized.clienteId = data.codigo_cliente || data.id;
        if (table === 'contratos') normalized.contratoId = data.codigo_contrato || data.id;
        if (table === 'equipos') normalized.equipoId = data.codigo_equipo || data.id;

        // Mantener id original de supabase
        normalized.id = data.id;

        return normalized;
    };

    // ========== INITIALIZATION ==========
    const init = async () => {
        if (isInitialized) return true;

        console.log('☁️ DataService: Sincronizando desde Supabase...');

        try {
            // Asegurar que el cliente de Supabase esté inicializado
            if (typeof SupabaseDataService !== 'undefined' && SupabaseDataService.init) {
                SupabaseDataService.init();
            }

            // Cargar datos principales en paralelo
            const [
                clientes,
                contratos,
                equipos,
                visitas
            ] = await Promise.all([
                SupabaseDataService.getClientesSync(),
                SupabaseDataService.getContratosSync(),
                SupabaseDataService.getEquiposSync(),
                SupabaseDataService.getVisitasSync()
            ]);

            // Normalizar y almacenar en caché
            cache.clientes = (clientes || []).map(c => normalizeSupabaseData('clientes', c));
            cache.contratos = (contratos || []).map(c => ({ ...normalizeSupabaseData('contratos', c), cliente: normalizeSupabaseData('clientes', c.cliente) }));
            cache.equipos = (equipos || []).map(e => ({ ...normalizeSupabaseData('equipos', e), cliente: normalizeSupabaseData('clientes', e.cliente) }));

            // Visitas requieren un mapeo más profundo si tienen joins
            cache.visitas = (visitas || []).map(v => normalizeSupabaseData('visitas', v));

            // Cargar permisos por defecto (hardcoded por seguridad)
            cache.permissions = loadDefaultPermissions();

            isInitialized = true;
            console.log(`✅ DataService: Sincronización completa (${cache.clientes.length} Clientes, ${cache.contratos.length} Contratos)`);
            return true;
        } catch (error) {
            console.error('❌ Error fatal iniciando DataService:', error);
            // No fallar completamente, permitir reintentos
            return false;
        }
    };

    const loadDefaultPermissions = () => ({
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
    });

    // ========== REALTIME UPDATE HANDLER ==========
    const handleRealtimeUpdate = (payload) => {
        try {
            const { table, eventType, new: newRecord, old: oldRecord } = payload;

            // Mapear tabla DB a propiedad del caché
            let target = null;
            if (table === 'clientes') target = cache.clientes;
            if (table === 'contratos') target = cache.contratos;
            if (table === 'equipos') target = cache.equipos;
            if (table === 'visitas') target = cache.visitas;

            if (!target) return;

            console.log(`🔄 Realtime: ${eventType} en ${table}`);

            if (eventType === 'INSERT') {
                const item = normalizeSupabaseData(table, newRecord);
                if (!target.find(i => i.id === item.id)) {
                    target.unshift(item);
                }
            } else if (eventType === 'UPDATE') {
                const item = normalizeSupabaseData(table, newRecord);
                const idx = target.findIndex(i => i.id === item.id);
                if (idx !== -1) target[idx] = { ...target[idx], ...item };
            } else if (eventType === 'DELETE') {
                const id = oldRecord.id;
                const idx = target.findIndex(i => i.id === id);
                if (idx !== -1) target.splice(idx, 1);
            }

            // Refrescar UI si es necesario
            if (typeof App !== 'undefined' && App.refreshCurrentModule) {
                const currentModule = State.get('currentModule');
                if (currentModule === table) App.refreshCurrentModule();
            }

        } catch (e) {
            console.error('Realtime Sync Error:', e);
        }
    };

    // ========== CRUD CLIENTES ==========
    const getClientesSync = () => [...cache.clientes];

    const getClientesFiltered = (filter) => {
        return cache.clientes.filter(c => {
            let matches = true;
            if (filter.search) {
                const s = filter.search.toLowerCase();
                matches = (c.nombreCliente || '').toLowerCase().includes(s) ||
                    (c.empresa || '').toLowerCase().includes(s) ||
                    (c.correo || '').toLowerCase().includes(s);
            }
            if (filter.status && filter.status !== 'all') matches = matches && c.estado === filter.status;
            return matches;
        });
    };

    const getClienteById = (id) => cache.clientes.find(c => c.clienteId === id || c.id === id);

    const createCliente = async (data) => {
        const res = await SupabaseDataService.createCliente(data);
        if (res.success) {
            const item = normalizeSupabaseData('clientes', res.data);
            cache.clientes.unshift(item); // Optimistic update fallback
            return item;
        }
        throw new Error(res.error || 'Error al crear cliente');
    };

    const updateCliente = async (id, data) => {
        const current = getClienteById(id);
        const uuid = current ? current.id : id;
        const res = await SupabaseDataService.updateCliente(uuid, data);
        if (res.success) {
            const item = normalizeSupabaseData('clientes', res.data);
            const idx = cache.clientes.findIndex(c => c.id === uuid);
            if (idx !== -1) cache.clientes[idx] = { ...cache.clientes[idx], ...item };
            return true;
        }
        return false;
    };

    const deleteCliente = async (id) => {
        const current = getClienteById(id);
        const uuid = current ? current.id : id;
        const res = await SupabaseDataService.deleteCliente(uuid);
        if (res.success) {
            cache.clientes = cache.clientes.filter(c => c.id !== uuid);
            return true;
        }
        return false;
    };

    // ========== CRUD CONTRATOS ==========
    const getContratosSync = () => [...cache.contratos];

    const getContratosFiltered = (filter) => {
        return cache.contratos.filter(c => {
            let matches = true;
            if (filter.search) {
                const cliente = getClienteById(c.clienteId);
                const s = filter.search.toLowerCase();
                matches = (c.contratoId || '').toLowerCase().includes(s) ||
                    (cliente?.empresa || '').toLowerCase().includes(s);
            }
            if (filter.status && filter.status !== 'all') matches = matches && c.estadoContrato === filter.status;
            if (filter.tipo && filter.tipo !== 'all') matches = matches && c.tipoContrato === filter.tipo;
            return matches;
        });
    };

    const getContratoById = (id) => cache.contratos.find(c => c.contratoId === id || c.id === id);
    const getContratosByCliente = (clienteId) => cache.contratos.filter(c => c.clienteId === clienteId);

    const createContrato = async (data) => {
        const res = await SupabaseDataService.createContrato(data);
        if (res.success) {
            const item = normalizeSupabaseData('contratos', res.data);
            cache.contratos.unshift(item);
            return item;
        }
    };

    const updateContrato = async (id, data) => {
        const current = getContratoById(id);
        const uuid = current ? current.id : id;
        const res = await SupabaseDataService.updateContrato(uuid, data);
        if (res.success) {
            const item = normalizeSupabaseData('contratos', res.data);
            const idx = cache.contratos.findIndex(c => c.id === uuid);
            if (idx !== -1) cache.contratos[idx] = { ...cache.contratos[idx], ...item };
        }
    };

    const deleteContrato = async (id) => {
        const current = getContratoById(id);
        const uuid = current ? current.id : id;
        const res = await SupabaseDataService.deleteContrato(uuid);
        if (res.success) cache.contratos = cache.contratos.filter(c => c.id !== uuid);
    };

    const getContratosStats = () => {
        const activos = cache.contratos.filter(c => c.estadoContrato === 'Activo').length;
        const vencidos = cache.contratos.filter(c => c.estadoContrato === 'Vencido').length;
        const now = new Date();
        const porVencer = cache.contratos.filter(c => {
            const fin = new Date(c.fechaFin);
            const diff = (fin - now) / (1000 * 60 * 60 * 24);
            return c.estadoContrato === 'Activo' && diff <= 30 && diff > 0;
        }).length;
        return { activos, vencidos, porVencer, ingresosMensuales: 0 };
    };

    const getContratosProximosAVencer = () => {
        const now = new Date();
        return cache.contratos.filter(c => {
            const fin = new Date(c.fechaFin);
            const diff = (fin - now) / (1000 * 60 * 60 * 24);
            return c.estadoContrato === 'Activo' && diff <= cache.config.diasAnticipacion && diff > 0;
        });
    };

    // ========== CRUD EQUIPOS ==========
    const getEquiposSync = () => [...cache.equipos];
    const getEquiposFiltered = (filter) => {
        return cache.equipos.filter(e => {
            let matches = true;
            if (filter.search) {
                const s = filter.search.toLowerCase();
                matches = (e.nombreEquipo || '').toLowerCase().includes(s) ||
                    (e.marca || '').toLowerCase().includes(s);
            }
            if (filter.clienteId && filter.clienteId !== 'all') matches = matches && e.clienteId === filter.clienteId;
            return matches;
        });
    };
    const getEquipoById = (id) => cache.equipos.find(e => e.equipoId === id || e.id === id);
    const getEquiposByCliente = (clienteId) => cache.equipos.filter(e => e.clienteId === clienteId);

    const createEquipo = async (data) => {
        const res = await SupabaseDataService.createEquipo(data);
        if (res.success) {
            const item = normalizeSupabaseData('equipos', res.data);
            cache.equipos.unshift(item);
            return item;
        }
    };

    const updateEquipo = async (id, data) => {
        const current = getEquipoById(id);
        const uuid = current ? current.id : id;
        const res = await SupabaseDataService.updateEquipo(uuid, data);
        if (res.success) {
            const item = normalizeSupabaseData('equipos', res.data);
            const idx = cache.equipos.findIndex(e => e.id === uuid);
            if (idx !== -1) cache.equipos[idx] = { ...cache.equipos[idx], ...item };
        }
    };

    const deleteEquipo = async (id) => {
        const current = getEquipoById(id);
        const uuid = current ? current.id : id;
        const res = await SupabaseDataService.deleteEquipo(uuid);
        if (res.success) cache.equipos = cache.equipos.filter(e => e.id !== uuid);
    };

    const getEquiposStats = () => ({
        operativos: cache.equipos.filter(e => e.estado === 'Operativo').length,
        total: cache.equipos.length,
        enReparacion: 0
    });

    const getHistorialEquipo = () => [];

    // ========== VISITAS ==========
    const getVisitasSync = () => [...cache.visitas];
    const getVisitasFiltered = (filter) => {
        return cache.visitas.filter(v => {
            let matches = true;
            if (filter.tipo && filter.tipo !== 'all') matches = matches && v.tipoVisita === filter.tipo;
            return matches;
        });
    };
    const getVisitaById = (id) => cache.visitas.find(v => v.visitaId === id || v.id === id);
    const getVisitasByCliente = (clienteId) => cache.visitas.filter(v => v.clienteId === clienteId);

    // Estos quedan pendientes de impl completa en SupabaseService
    const createVisita = () => console.log('Create visita pending backend');
    const updateVisita = () => { };
    const deleteVisita = () => { };
    const getVisitasStats = () => ({ esteMes: 0, completadas: 0, ingresosEventuales: 0 });

    // ========== HELPERS GENERALES ==========
    const getConfig = () => ({ ...cache.config });
    const updateConfig = (cfg) => { cache.config = { ...cache.config, ...cfg }; };

    // Auth Placeholders
    const authenticateUser = () => null;
    const getUsers = () => cache.users;
    const getUsersSync = () => cache.users;
    const getUserByUsername = () => null;
    const createUser = () => { };
    const updateUser = () => { };
    const deleteUser = () => { };

    // Permissions
    const getPermissions = () => cache.permissions;
    const getRolePermissions = (role) => cache.permissions[role];
    const updateRolePermissions = () => { };
    const canPerformAction = (role, module, action) => cache.permissions[role]?.[module]?.[action] || false;
    const getAvailableRoles = () => Object.keys(cache.permissions);

    // Dashboard & Reports
    const getDashboardStats = () => {
        // Calcular estadísticas localmente desde el caché
        const clientesActivos = cache.clientes.filter(c => c.estado === 'Activo').length;
        const contratosActivos = cache.contratos.filter(c => c.estadoContrato === 'Activo').length;
        const visitasMes = cache.visitas.length;
        const ingresosMes = cache.contratos.reduce((sum, c) => sum + (parseFloat(c.valorContrato) || 0), 0);

        return {
            clientesActivos: { value: clientesActivos || cache.clientes.length, trend: 12, trendDirection: 'up' },
            serviciosMes: { value: visitasMes, trend: 8, trendDirection: 'up' },
            ingresosMes: { value: ingresosMes, trend: 5, trendDirection: 'up' },
            contratosActivos: { value: contratosActivos, trend: 3, trendDirection: 'up' }
        };
    };

    const getRecentActivities = () => {
        // Generar actividades desde las visitas del caché
        return cache.visitas.slice(0, 5).map((v, i) => {
            const cliente = getClienteById(v.clienteId);
            return {
                numero: v.visitaId || `SRV-${String(i + 1).padStart(4, '0')}`,
                cliente: cliente?.nombreCliente || cliente?.empresa || 'Cliente',
                fecha: v.fechaInicio ? new Date(v.fechaInicio).toLocaleDateString('es-NI') : '-',
                estado: v.trabajoRealizado ? 'Completado' : 'Pendiente',
                monto: '$0.00'
            };
        });
    };

    const getChartData = () => ({
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        revenue: [1200, 1800, 1400, 2100, 2800, 1600, 900],
        profit: [800, 1200, 900, 1500, 2000, 1100, 600]
    });

    const getSavingsPlans = () => [
        { id: 1, title: 'Meta Clientes', subtitle: 'Nuevos clientes este mes', target: 50, percent: Math.min(100, (cache.clientes.length / 50) * 100), icon: Icons?.users || '👥' },
        { id: 2, title: 'Meta Contratos', subtitle: 'Contratos activos', target: 20, percent: Math.min(100, (cache.contratos.length / 20) * 100), icon: Icons?.fileText || '📄' }
    ];

    const getBankAccounts = () => [];
    const getReportesStats = () => ({});

    // Placeholders para módulos no migrados completamente
    const getReparacionesByEquipo = () => [];
    const getReparacionById = () => null;
    const createReparacion = () => { };
    const updateReparacion = () => { };
    const deleteReparacion = () => { };
    const getProductosSync = () => [...cache.productos];
    const getProductosFiltered = (filter = {}) => {
        return cache.productos.filter(p => {
            let matches = true;
            if (filter.search) {
                const s = filter.search.toLowerCase();
                matches = (p.nombre || '').toLowerCase().includes(s) ||
                    (p.categoria || '').toLowerCase().includes(s);
            }
            if (filter.tipo && filter.tipo !== 'all') matches = matches && p.tipo === filter.tipo;
            return matches;
        });
    };
    const getProductoById = (id) => cache.productos.find(p => p.productoId === id || p.id === id);
    const createProducto = (data) => {
        const producto = { ...data, productoId: `PROD-${Date.now()}`, id: `PROD-${Date.now()}` };
        cache.productos.unshift(producto);
        return producto;
    };
    const updateProducto = (id, data) => {
        const idx = cache.productos.findIndex(p => p.productoId === id || p.id === id);
        if (idx !== -1) {
            cache.productos[idx] = { ...cache.productos[idx], ...data };
            return true;
        }
        return false;
    };
    const deleteProducto = (id) => {
        const idx = cache.productos.findIndex(p => p.productoId === id || p.id === id);
        if (idx !== -1) {
            cache.productos.splice(idx, 1);
            return true;
        }
        return false;
    };
    const getSoftwareFiltered = () => [];
    const getSoftwareById = () => null;
    const getSoftwareByRegistro = () => [];
    const getSoftwareUniqueRegistros = () => [];
    const createSoftware = () => { };
    const updateSoftware = () => { };
    const deleteSoftware = () => { };
    const getProformasSync = () => [...cache.proformas];
    const getProformasFiltered = (filter = {}) => {
        return cache.proformas.filter(p => {
            let matches = true;
            if (filter.search) {
                const s = filter.search.toLowerCase();
                const cliente = getClienteById(p.clienteId);
                matches = (p.proformaId || '').toLowerCase().includes(s) ||
                    String(p.numero || '').includes(s) ||
                    (cliente?.empresa || '').toLowerCase().includes(s);
            }
            if (filter.clienteId && filter.clienteId !== 'all') matches = matches && p.clienteId === filter.clienteId;
            if (filter.estado && filter.estado !== 'all') matches = matches && p.estado === filter.estado;
            return matches;
        });
    };
    const getProformaById = (id) => cache.proformas.find(p => p.proformaId === id || p.id === id);
    const getProformasByCliente = (clienteId) => cache.proformas.filter(p => p.clienteId === clienteId);
    const getProformasByRango = (inicio, fin) => cache.proformas.filter(p => p.numero >= inicio && p.numero <= fin);
    const getNextProformaNumber = () => {
        if (cache.proformas.length === 0) return 1;
        return Math.max(...cache.proformas.map(p => p.numero || 0)) + 1;
    };
    const createProforma = (data) => {
        const numero = getNextProformaNumber();
        const proforma = {
            ...data,
            proformaId: `PROF-${String(numero).padStart(4, '0')}`,
            numero,
            fecha: data.fecha || new Date().toISOString().split('T')[0],
            estado: 'Activa',
            subtotal: data.items?.reduce((sum, i) => sum + (i.total || 0), 0) || 0,
            total: data.items?.reduce((sum, i) => sum + (i.total || 0), 0) || 0
        };
        cache.proformas.unshift(proforma);
        return proforma;
    };
    const updateProforma = (id, data) => {
        const idx = cache.proformas.findIndex(p => p.proformaId === id || p.id === id);
        if (idx !== -1) {
            cache.proformas[idx] = { ...cache.proformas[idx], ...data };
            return true;
        }
        return false;
    };
    const deleteProforma = (id) => {
        const idx = cache.proformas.findIndex(p => p.proformaId === id || p.id === id);
        if (idx !== -1) {
            cache.proformas.splice(idx, 1);
            return true;
        }
        return false;
    };
    const getProformasStats = () => ({
        total: cache.proformas?.length || 0,
        aprobadas: cache.proformas?.filter(p => p.estado === 'Aprobada').length || 0,
        activas: cache.proformas?.filter(p => p.estado === 'Activa').length || 0,
        vencidas: cache.proformas?.filter(p => p.estado === 'Vencida').length || 0,
        valorAprobado: cache.proformas?.filter(p => p.estado === 'Aprobada').reduce((sum, p) => sum + (p.total || 0), 0) || 0
    });
    const getContractTemplates = () => cache.contractTemplates;
    const getContractTemplateById = () => null;
    const saveContractTemplate = () => { };
    const deleteContractTemplate = () => { };
    const resetData = () => location.reload();


    return {
        init,
        handleRealtimeUpdate,

        // Clientes
        getClientesSync, getClientesFiltered, getClienteById, createCliente, updateCliente, deleteCliente,

        // Contratos
        getContratosSync, getContratosFiltered, getContratoById, getContratosByCliente, createContrato, updateContrato, deleteContrato, getContratosStats, getContratosProximosAVencer,

        // Equipos
        getEquiposSync, getEquiposFiltered, getEquipoById, getEquiposByCliente, createEquipo, updateEquipo, deleteEquipo, getEquiposStats, getHistorialEquipo,

        // Visitas
        getVisitasSync, getVisitasFiltered, getVisitaById, getVisitasByCliente, createVisita, updateVisita, deleteVisita, getVisitasStats,

        // Config & Auth
        getConfig, updateConfig, getUsers, getUsersSync, getUserByUsername, createUser, updateUser, deleteUser, authenticateUser,
        getPermissions, getRolePermissions, updateRolePermissions, canPerformAction, getAvailableRoles,

        // Dashboard & Others
        getDashboardStats, getRecentActivities, getChartData, getSavingsPlans, getBankAccounts,
        getReportesStats, resetData, exportAllData: () => cache,

        // Placeholders
        getReparacionesByEquipo, getReparacionById, createReparacion, updateReparacion, deleteReparacion,
        getProductosSync, getProductosFiltered, getProductoById, createProducto, updateProducto, deleteProducto,
        getSoftwareFiltered, getSoftwareById, getSoftwareByRegistro, getSoftwareUniqueRegistros, createSoftware, updateSoftware, deleteSoftware,
        getProformasSync, getProformasFiltered, getProformaById, getProformasByCliente, getProformasByRango, getNextProformaNumber, createProforma, updateProforma, deleteProforma, getProformasStats,
        getContractTemplates, getContractTemplateById, saveContractTemplate, deleteContractTemplate
    };
})();

if (typeof module !== 'undefined' && module.exports) { module.exports = DataService; }
