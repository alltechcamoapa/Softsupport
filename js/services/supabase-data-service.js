/**
 * ALLTECH SUPPORT - Supabase Data Service
 * Servicio de datos usando Supabase como backend
 * Mantiene la misma interfaz que data-service.js para compatibilidad
 */

const SupabaseDataService = (() => {
    let client = null;

    // ========== INICIALIZACIÓN ==========
    const init = () => {
        client = getSupabaseClient();
        if (!client) {
            console.error('❌ No se pudo inicializar Supabase');
            return false;
        }
        console.log('✅ SupabaseDataService initialized');
        return true;
    };

    // ========== HELPER PARA GENERAR CÓDIGOS ==========
    const generateCode = async (tableName) => {
        if (!client) return null;

        const { data, error } = await client.rpc('generar_codigo', {
            p_nombre_secuencia: tableName
        });

        if (error) {
            console.error('Error generating code:', error);
            return null;
        }

        return data;
    };

    // ========== CLIENTES ==========
    const getClientesSync = async () => {
        if (!client) return [];

        const { data, error } = await client
            .from('clientes')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching clientes:', error);
            return [];
        }

        return data || [];
    };

    const getClientesFiltered = async (filter) => {
        if (!client) return [];

        let query = client.from('clientes').select('*');

        // Aplicar filtros
        if (filter.search) {
            query = query.or(`nombre_cliente.ilike.%${filter.search}%,empresa.ilike.%${filter.search}%,correo.ilike.%${filter.search}%`);
        }

        if (filter.status && filter.status !== 'all') {
            query = query.eq('estado', filter.status);
        }

        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) {
            console.error('Error filtering clientes:', error);
            return [];
        }

        return data || [];
    };

    const getClienteById = async (id) => {
        if (!client) return null;

        const { data, error } = await client
            .from('clientes')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching cliente:', error);
            return null;
        }

        return data;
    };

    const createCliente = async (clienteData) => {
        if (!client) return { error: 'Not initialized' };

        // Generar código si no existe
        if (!clienteData.codigo_cliente) {
            // Intentar generar código vía RPC
            let codigo = await generateCode('clientes');

            // Fallback: generar código local si RPC falla
            if (!codigo) {
                console.warn('⚠️ RPC generateCode falló, usando fallback local');
                codigo = 'CLI' + Date.now().toString().slice(-6);
            }

            clienteData.codigo_cliente = codigo;
        }

        // Agregar usuario actual
        const user = await getCurrentUser();
        if (user) {
            clienteData.created_by = user.id;
        }

        console.log('📤 Creando cliente con datos:', clienteData);

        const { data, error } = await client
            .from('clientes')
            .insert([clienteData])
            .select()
            .single();

        if (error) {
            console.error('❌ Error en createCliente:', error);
            return { error: handleSupabaseError(error, 'createCliente') };
        }

        console.log('✅ Cliente creado:', data);
        return { data, success: true };
    };

    const updateCliente = async (id, updates) => {
        if (!client) return { error: 'Not initialized' };

        const { data, error } = await client
            .from('clientes')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return { error: handleSupabaseError(error, 'updateCliente') };
        }

        return { data, success: true };
    };

    const deleteCliente = async (id) => {
        if (!client) return { error: 'Not initialized' };

        const { error } = await client
            .from('clientes')
            .delete()
            .eq('id', id);

        if (error) {
            return { error: handleSupabaseError(error, 'deleteCliente') };
        }

        return { success: true };
    };

    // ========== CONTRATOS ==========
    const getContratosSync = async () => {
        if (!client) return [];

        const { data, error } = await client
            .from('contratos')
            .select(`
                *,
                cliente:clientes(*)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching contratos:', error);
            return [];
        }

        return data || [];
    };

    const getContratosFiltered = async (filter) => {
        if (!client) return [];

        let query = client
            .from('contratos')
            .select(`
                *,
                cliente:clientes(*)
            `);

        if (filter.search) {
            query = query.or(`codigo_contrato.ilike.%${filter.search}%`);
        }

        if (filter.status && filter.status !== 'all') {
            query = query.eq('estado_contrato', filter.status);
        }

        if (filter.tipo && filter.tipo !== 'all') {
            query = query.eq('tipo_contrato', filter.tipo);
        }

        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) {
            console.error('Error filtering contratos:', error);
            return [];
        }

        return data || [];
    };

    const getContratoById = async (id) => {
        if (!client) return null;

        const { data, error } = await client
            .from('contratos')
            .select(`
                *,
                cliente:clientes(*)
            `)
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching contrato:', error);
            return null;
        }

        return data;
    };

    const createContrato = async (contratoData) => {
        if (!client) return { error: 'Not initialized' };

        // Generar código si no existe
        if (!contratoData.codigo_contrato) {
            let codigo = await generateCode('contratos');

            // Fallback (RPC falló)
            if (!codigo) {
                console.warn('⚠️ RPC generateCode falló para contratos, usando fallback local');
                codigo = 'CON' + Date.now().toString().slice(-6);
            }
            contratoData.codigo_contrato = codigo;
        }

        // Agregar usuario actual
        const user = await getCurrentUser();
        if (user) {
            contratoData.created_by = user.id;
        }

        console.log('📤 Creando contrato con datos:', contratoData);

        const { data, error } = await client
            .from('contratos')
            .insert([contratoData])
            .select()
            .single();

        if (error) {
            console.error('❌ Error en createContrato:', error);
            return { error: handleSupabaseError(error, 'createContrato') };
        }

        console.log('✅ Contrato creado:', data);
        return { data, success: true };
    };

    const updateContrato = async (id, updates) => {
        if (!client) return { error: 'Not initialized' };

        const { data, error } = await client
            .from('contratos')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return { error: handleSupabaseError(error, 'updateContrato') };
        }

        return { data, success: true };
    };

    const deleteContrato = async (id) => {
        if (!client) return { error: 'Not initialized' };

        const { error } = await client
            .from('contratos')
            .delete()
            .eq('id', id);

        if (error) {
            return { error: handleSupabaseError(error, 'deleteContrato') };
        }

        return { success: true };
    };

    // ========== EQUIPOS ==========
    const getEquiposSync = async () => {
        if (!client) return [];

        const { data, error } = await client
            .from('equipos')
            .select(`
                *,
                cliente:clientes(*)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching equipos:', error);
            return [];
        }

        return data || [];
    };

    const getEquiposFiltered = async (filter) => {
        if (!client) return [];

        let query = client
            .from('equipos')
            .select(`
                *,
                cliente:clientes(*)
            `);

        if (filter.search) {
            query = query.or(`nombre_equipo.ilike.%${filter.search}%,marca.ilike.%${filter.search}%,modelo.ilike.%${filter.search}%`);
        }

        if (filter.clienteId && filter.clienteId !== 'all') {
            query = query.eq('cliente_id', filter.clienteId);
        }

        if (filter.estado && filter.estado !== 'all') {
            query = query.eq('estado', filter.estado);
        }

        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) {
            console.error('Error filtering equipos:', error);
            return [];
        }

        return data || [];
    };

    const getEquipoById = async (id) => {
        if (!client) return null;

        const { data, error } = await client
            .from('equipos')
            .select(`
                *,
                cliente:clientes(*)
            `)
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching equipo:', error);
            return null;
        }

        return data;
    };

    const createEquipo = async (equipoData) => {
        if (!client) return { error: 'Not initialized' };

        // Generar código si no existe
        if (!equipoData.codigo_equipo) {
            let codigo = await generateCode('equipos');

            // Fallback (RPC falló)
            if (!codigo) {
                console.warn('⚠️ RPC generateCode falló para equipos, usando fallback local');
                codigo = 'EQU' + Date.now().toString().slice(-6);
            }
            equipoData.codigo_equipo = codigo;
        }

        // Agregar usuario actual
        const user = await getCurrentUser();
        if (user) {
            equipoData.created_by = user.id;
        }

        console.log('📤 Creando equipo con datos:', equipoData);

        const { data, error } = await client
            .from('equipos')
            .insert([equipoData])
            .select()
            .single();

        if (error) {
            console.error('❌ Error en createEquipo:', error);
            console.error('❌ Detalles del error:', JSON.stringify(error, null, 2));
            return { error: handleSupabaseError(error, 'createEquipo') };
        }

        console.log('✅ Equipo creado exitosamente:', data);
        return { data, success: true };
    };

    const updateEquipo = async (id, updates) => {
        if (!client) return { error: 'Not initialized' };

        const { data, error } = await client
            .from('equipos')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return { error: handleSupabaseError(error, 'updateEquipo') };
        }

        return { data, success: true };
    };

    const deleteEquipo = async (id) => {
        if (!client) return { error: 'Not initialized' };

        const { error } = await client
            .from('equipos')
            .delete()
            .eq('id', id);

        if (error) {
            return { error: handleSupabaseError(error, 'deleteEquipo') };
        }

        return { success: true };
    };

    // ========== VISITAS ==========
    const getVisitasSync = async () => {
        if (!client) return [];

        const { data, error } = await client
            .from('visitas')
            .select(`
                *,
                cliente:clientes(*),
                contrato:contratos(*),
                tecnico:profiles(*)
            `)
            .order('fecha_inicio', { ascending: false });

        if (error) {
            console.error('Error fetching visitas:', error);
            return [];
        }

        return data || [];
    };

    // ========== DASHBOARD STATS ==========
    const getDashboardStats = async () => {
        if (!client) return {};

        const { data, error } = await client.rpc('get_dashboard_stats');

        if (error) {
            console.error('Error fetching dashboard stats:', error);
            return {
                clientes_activos: 0,
                contratos_activos: 0,
                visitas_mes: 0,
                equipos_operativos: 0
            };
        }

        return data || {};
    };

    // ========== AUTHENTICACIÓN ==========
    const authenticateUser = async (username, password) => {
        // En Supabase usamos email, no username
        // Por compatibilidad, asumimos que username puede ser email
        const result = await signIn(username, password);

        if (result.error) {
            return null;
        }

        return await getCurrentProfile();
    };

    // ========== REALTIME SUBSCRIPCIONES ==========

    const subscribeToChanges = (callback) => {
        if (!client) return null;

        console.log('🔌 Iniciando suscripción a Realtime...');

        // Suscribirse a cambios en todas las tablas relevantes
        const subscription = client
            .channel('db-changes')
            .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
                console.log('🔔 Cambio detectado en DB:', payload);
                if (callback) callback(payload);
            })
            .subscribe((status) => {
                console.log('📡 Estado de suscripción:', status);
            });

        return subscription;
    };

    // ========== PRODUCTOS ==========
    const getProductosSync = async () => {
        if (!client) return [];

        const { data, error } = await client
            .from('productos')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching productos:', error);
            return [];
        }

        return data || [];
    };

    const getProductoById = async (id) => {
        if (!client) return null;

        const { data, error } = await client
            .from('productos')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching producto:', error);
            return null;
        }

        return data;
    };

    const createProducto = async (productoData) => {
        if (!client) return { error: 'Not initialized' };

        // Generar código si no existe
        if (!productoData.codigo) {
            productoData.codigo = 'PROD' + Date.now().toString().slice(-6);
        }

        const user = await getCurrentUser();
        if (user) {
            productoData.created_by = user.id;
        }

        console.log('📤 Creando producto con datos:', productoData);

        const { data, error } = await client
            .from('productos')
            .insert([productoData])
            .select()
            .single();

        if (error) {
            console.error('❌ Error en createProducto:', error);
            return { error: handleSupabaseError(error, 'createProducto') };
        }

        console.log('✅ Producto creado:', data);
        return { data, success: true };
    };

    const updateProducto = async (id, updates) => {
        if (!client) return { error: 'Not initialized' };

        const { data, error } = await client
            .from('productos')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return { error: handleSupabaseError(error, 'updateProducto') };
        }

        return { data, success: true };
    };

    const deleteProducto = async (id) => {
        if (!client) return { error: 'Not initialized' };

        const { error } = await client
            .from('productos')
            .delete()
            .eq('id', id);

        if (error) {
            return { error: handleSupabaseError(error, 'deleteProducto') };
        }

        return { success: true };
    };

    // ========== PROFORMAS ==========
    const getProformasSync = async () => {
        if (!client) return [];

        const { data, error } = await client
            .from('proformas')
            .select(`
                *,
                cliente:clientes(*)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching proformas:', error);
            return [];
        }

        return data || [];
    };

    const getProformaById = async (id) => {
        if (!client) return null;

        const { data, error } = await client
            .from('proformas')
            .select(`
                *,
                cliente:clientes(*)
            `)
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching proforma:', error);
            return null;
        }

        return data;
    };

    const createProforma = async (proformaData) => {
        if (!client) return { error: 'Not initialized' };

        // Generar ID si no existe
        if (!proformaData.proforma_id) {
            proformaData.proforma_id = 'PROF' + Date.now().toString().slice(-6);
        }

        const user = await getCurrentUser();
        if (user) {
            proformaData.created_by = user.id;
        }

        console.log('📤 Creando proforma con datos:', proformaData);

        const { data, error } = await client
            .from('proformas')
            .insert([proformaData])
            .select()
            .single();

        if (error) {
            console.error('❌ Error en createProforma:', error);
            return { error: handleSupabaseError(error, 'createProforma') };
        }

        console.log('✅ Proforma creada:', data);
        return { data, success: true };
    };

    const updateProforma = async (id, updates) => {
        if (!client) return { error: 'Not initialized' };

        const { data, error } = await client
            .from('proformas')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return { error: handleSupabaseError(error, 'updateProforma') };
        }

        return { data, success: true };
    };

    const deleteProforma = async (id) => {
        if (!client) return { error: 'Not initialized' };

        const { error } = await client
            .from('proformas')
            .delete()
            .eq('id', id);

        if (error) {
            return { error: handleSupabaseError(error, 'deleteProforma') };
        }

        return { success: true };
    };

    // ========== PEDIDOS ==========
    const getPedidosSync = async () => {
        if (!client) return [];

        const { data, error } = await client
            .from('pedidos')
            .select(`
                *,
                cliente:clientes(*)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching pedidos:', error);
            return [];
        }

        return data || [];
    };

    const getPedidoById = async (id) => {
        if (!client) return null;

        const { data, error } = await client
            .from('pedidos')
            .select(`
                *,
                cliente:clientes(*)
            `)
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching pedido:', error);
            return null;
        }

        return data;
    };

    const createPedido = async (pedidoData) => {
        if (!client) return { error: 'Not initialized' };

        // Generar IDs si no existen
        if (!pedidoData.pedido_id) {
            pedidoData.pedido_id = 'PED' + Date.now().toString().slice(-6);
        }
        if (!pedidoData.numero_pedido) {
            pedidoData.numero_pedido = pedidoData.pedido_id;
        }

        const user = await getCurrentUser();
        if (user) {
            pedidoData.created_by = user.id;
        }

        console.log('📤 Creando pedido con datos:', pedidoData);

        const { data, error } = await client
            .from('pedidos')
            .insert([pedidoData])
            .select()
            .single();

        if (error) {
            console.error('❌ Error en createPedido:', error);
            return { error: handleSupabaseError(error, 'createPedido') };
        }

        console.log('✅ Pedido creado:', data);
        return { data, success: true };
    };

    const updatePedido = async (id, updates) => {
        if (!client) return { error: 'Not initialized' };

        const { data, error } = await client
            .from('pedidos')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return { error: handleSupabaseError(error, 'updatePedido') };
        }

        return { data, success: true };
    };

    const deletePedido = async (id) => {
        if (!client) return { error: 'Not initialized' };

        const { error } = await client
            .from('pedidos')
            .delete()
            .eq('id', id);

        if (error) {
            return { error: handleSupabaseError(error, 'deletePedido') };
        }

        return { success: true };
    };

    // ========== PUBLIC API ==========
    return {
        // Inicialización
        init,
        subscribeToChanges, // Exportar función

        // Auth
        authenticateUser,
        getCurrentUser,
        getCurrentProfile,
        signIn,
        signOut,
        isAuthenticated,

        // Dashboard
        getDashboardStats,

        // Clientes
        getClientesSync,
        getClientesFiltered,
        getClienteById,
        createCliente,
        updateCliente,
        deleteCliente,

        // Contratos
        getContratosSync,
        getContratosFiltered,
        getContratoById,
        createContrato,
        updateContrato,
        deleteContrato,

        // Equipos
        getEquiposSync,
        getEquiposFiltered,
        getEquipoById,
        createEquipo,
        updateEquipo,
        deleteEquipo,

        // Visitas
        getVisitasSync,

        // Productos
        getProductosSync,
        getProductoById,
        createProducto,
        updateProducto,
        deleteProducto,

        // Proformas
        getProformasSync,
        getProformaById,
        createProforma,
        updateProforma,
        deleteProforma,

        // Pedidos
        getPedidosSync,
        getPedidoById,
        createPedido,
        updatePedido,
        deletePedido,

        // Helpers
        generateCode
    };
})();

// Auto-inicializar cuando se carga
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        SupabaseDataService.init();
    });
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SupabaseDataService;
}

