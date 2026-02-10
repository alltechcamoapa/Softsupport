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
    // ========== AUTHENTICACIÓN ==========
    const authenticateUser = async (username, password) => {
        if (!client) return { error: 'Not initialized' };

        console.log('🔄 Buscando email para usuario:', username);

        // 1. Buscar email por username usando RPC
        const { data: userData, error: lookError } = await client
            .rpc('get_email_by_username', { p_username: username });

        if (lookError) {
            console.error('❌ Error buscando usuario:', lookError);

            // INTENTO DE RECUPERACIÓN (FALLBACK)
            if (!username.includes('@')) {
                const tryEmail = `${username}@alltech.local`;
                const res = await signIn(tryEmail, password);
                if (!res.error) return res;
            }

            // Fallback: intentar login directo asumiendo que username es email (si tiene @)
            if (username.includes('@')) {
                return await signIn(username, password);
            }
            return { error: 'Error al buscar usuario' };
        }

        // Si no encuentra datos o array vacío
        if (!userData || userData.length === 0) {
            console.warn('⚠️ Usuario no encontrado:', username);

            // INTENTO DE RECUPERACIÓN INTELIGENTE
            // Si el nombre de usuario no tiene @, probamos con el dominio local
            if (!username.includes('@')) {
                const tryEmail = `${username}@alltech.local`;
                console.log('🔄 Intentando login con email autogenerado:', tryEmail);
                const res = await signIn(tryEmail, password);
                if (!res.error) return res;
            }

            // Último intento: probar directo (quizás es email aunque no se encontró por username)
            if (username.includes('@')) {
                return await signIn(username, password);
            }
            return { error: 'Usuario no encontrado' };
        }

        const emailToLogin = userData[0].email;
        console.log('✅ Email encontrado:', emailToLogin);

        // 2. Hacer login con el email encontrado
        return await signIn(emailToLogin, password);
    };

    const createUser = async (userData) => {
        if (!client) return { error: 'Not initialized' };

        console.log('🆕 Creando usuario en Supabase:', userData.username);

        // 1. SignUp en Supabase Auth
        // Nota: Esto iniciará sesión automáticamente con el nuevo usuario si el email no requiere confirmación
        const { data, error } = await client.auth.signUp({
            email: userData.email,
            password: userData.password,
            options: {
                data: {
                    username: userData.username,
                    full_name: userData.name
                }
            }
        });

        if (error) {
            console.error('❌ Error en signUp:', error);
            return { error: error.message };
        }

        if (data.user) {
            // Actualizar rol y campos laborales si se proveyeron
            const roleName = userData.role || 'Usuario';

            // Buscar ID del rol
            const { data: roleData } = await client
                .from('roles')
                .select('id')
                .eq('name', roleName)
                .single();

            if (roleData) {
                // Actualizar profiles con rol y campos laborales
                await client
                    .from('profiles')
                    .update({
                        role_id: roleData.id,
                        email: userData.email
                    })
                    .eq('id', data.user.id);
            }

            return { success: true, user: data.user, session: data.session };
        }

        return { error: 'No se pudo crear el usuario' };
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

    // ========== EMPLEADOS ==========
    const getEmpleadosSync = async () => {
        if (!client) return [];

        const { data, error } = await client
            .from('empleados')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching empleados:', error);
            return [];
        }

        return data || [];
    };

    const getEmpleadoById = async (id) => {
        if (!client) return null;

        const { data, error } = await client
            .from('empleados')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching empleado:', error);
            return null;
        }

        return data;
    };

    const createEmpleado = async (empleadoData) => {
        if (!client) return { error: 'Not initialized' };

        // Preparar datos para Supabase
        const dataToInsert = {
            nombre: empleadoData.nombre,
            cedula: empleadoData.cedula,
            email: empleadoData.email || null,
            telefono: empleadoData.telefono || null,
            cargo: empleadoData.cargo,
            fecha_alta: empleadoData.fechaAlta,
            tipo_salario: empleadoData.tipoSalario,
            salario_total: empleadoData.salarioTotal,
            tipo_contrato: empleadoData.tipoContrato,
            tiempo_contrato: empleadoData.tiempoContrato || null,
            estado: empleadoData.estado || 'Activo',
            vacaciones_tomadas: empleadoData.vacacionesTomadas || 0,
            aguinaldo_pagado: empleadoData.aguinaldoPagado || false,
            observaciones: empleadoData.observaciones || null
        };

        const { data, error } = await client
            .from('empleados')
            .insert([dataToInsert])
            .select()
            .single();

        if (error) {
            return { error: handleSupabaseError(error, 'createEmpleado') };
        }

        return { success: true, data };
    };

    const updateEmpleado = async (id, empleadoData) => {
        if (!client) return { error: 'Not initialized' };

        // Preparar datos para actualizar
        const dataToUpdate = {};
        if (empleadoData.nombre) dataToUpdate.nombre = empleadoData.nombre;
        if (empleadoData.cedula) dataToUpdate.cedula = empleadoData.cedula;
        if (empleadoData.email !== undefined) dataToUpdate.email = empleadoData.email;
        if (empleadoData.telefono !== undefined) dataToUpdate.telefono = empleadoData.telefono;
        if (empleadoData.cargo) dataToUpdate.cargo = empleadoData.cargo;
        if (empleadoData.fechaAlta) dataToUpdate.fecha_alta = empleadoData.fechaAlta;
        if (empleadoData.tipoSalario) dataToUpdate.tipo_salario = empleadoData.tipoSalario;
        if (empleadoData.salarioTotal !== undefined) dataToUpdate.salario_total = empleadoData.salarioTotal;
        if (empleadoData.tipoContrato) dataToUpdate.tipo_contrato = empleadoData.tipoContrato;
        if (empleadoData.tiempoContrato !== undefined) dataToUpdate.tiempo_contrato = empleadoData.tiempoContrato;
        if (empleadoData.estado) dataToUpdate.estado = empleadoData.estado;
        if (empleadoData.vacacionesTomadas !== undefined) dataToUpdate.vacaciones_tomadas = empleadoData.vacacionesTomadas;
        if (empleadoData.aguinaldoPagado !== undefined) dataToUpdate.aguinaldo_pagado = empleadoData.aguinaldoPagado;
        if (empleadoData.observaciones !== undefined) dataToUpdate.observaciones = empleadoData.observaciones;

        dataToUpdate.updated_at = new Date().toISOString();

        const { error } = await client
            .from('empleados')
            .update(dataToUpdate)
            .eq('id', id);

        if (error) {
            return { error: handleSupabaseError(error, 'updateEmpleado') };
        }

        return { success: true };
    };

    const deleteEmpleado = async (id) => {
        if (!client) return { error: 'Not initialized' };

        const { error } = await client
            .from('empleados')
            .delete()
            .eq('id', id);

        if (error) {
            return { error: handleSupabaseError(error, 'deleteEmpleado') };
        }

        return { success: true };
    };


    // ========== PRESTACIONES: VACACIONES ==========
    const getVacacionesByEmpleado = async (empleadoId) => {
        if (!client) return [];

        const { data, error } = await client
            .from('vacaciones_historial')
            .select('*')
            .eq('empleado_id', empleadoId)
            .order('fecha_inicio', { ascending: false });

        if (error) {
            console.error('Error fetching vacaciones:', error);
            return [];
        }
        return data || [];
    };

    const createVacacion = async (vacacionData) => {
        if (!client) return { error: 'Not initialized' };

        // Insertar en historial
        const { data, error } = await client
            .from('vacaciones_historial')
            .insert([{
                empleado_id: vacacionData.empleadoId,
                fecha_inicio: vacacionData.fechaInicio,
                fecha_fin: vacacionData.fechaFin,
                dias: vacacionData.dias,
                anio_correspondiente: vacacionData.anioCorrespondiente,
                observaciones: vacacionData.observaciones
            }])
            .select()
            .single();

        if (error) {
            return { error: handleSupabaseError(error, 'createVacacion') };
        }

        // Actualizar contador en empleados
        // Nota: esto debería ser una transacción o trigger, pero por simplicidad lo hacemos aquí
        const { error: updateError } = await client.rpc('increment_vacaciones_tomadas', {
            p_empleado_id: vacacionData.empleadoId,
            p_dias: vacacionData.dias
        });

        // Fallback si RPC no existe: lectura y actualización manual
        if (updateError) {
            console.warn('⚠️ RPC increment_vacaciones_tomadas falló, usando actualización manual');
            const emp = await getEmpleadoById(vacacionData.empleadoId);
            if (emp) {
                await updateEmpleado(emp.id, {
                    vacacionesTomadas: (emp.vacaciones_tomadas || 0) + vacacionData.dias
                });
            }
        }

        return { success: true, data };
    };

    const updateVacacion = async (id, updates) => {
        // Pendiente: manejar recalculo de días tomados si se cambian los días
        if (!client) return { error: 'Not initialized' };

        const { data, error } = await client
            .from('vacaciones_historial')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) return { error: handleSupabaseError(error, 'updateVacacion') };
        return { success: true, data };
    };

    const deleteVacacion = async (id) => {
        if (!client) return { error: 'Not initialized' };

        // Primero obtener para descontar días
        const { data: vacacion } = await client
            .from('vacaciones_historial')
            .select('*')
            .eq('id', id)
            .single();

        const { error } = await client
            .from('vacaciones_historial')
            .delete()
            .eq('id', id);

        if (error) return { error: handleSupabaseError(error, 'deleteVacacion') };

        // Revertir días tomados
        if (vacacion) {
            const emp = await getEmpleadoById(vacacion.empleado_id);
            if (emp) {
                await updateEmpleado(emp.id, {
                    vacacionesTomadas: Math.max(0, (emp.vacaciones_tomadas || 0) - vacacion.dias)
                });
            }
        }

        return { success: true };
    };

    // ========== PRESTACIONES: AGUINALDOS ==========
    const getAguinaldosByEmpleado = async (empleadoId) => {
        if (!client) return [];
        const { data, error } = await client
            .from('aguinaldos_historial')
            .select('*')
            .eq('empleado_id', empleadoId)
            .order('anio', { ascending: false });

        if (error) {
            console.error('Error fetching aguinaldos:', error);
            return [];
        }
        return data || [];
    };

    const createAguinaldo = async (aguinaldoData) => {
        if (!client) return { error: 'Not initialized' };

        const { data, error } = await client
            .from('aguinaldos_historial')
            .insert([{
                empleado_id: aguinaldoData.empleadoId,
                anio: aguinaldoData.anio,
                monto: aguinaldoData.monto,
                dias_calculados: aguinaldoData.diasCalculados,
                fecha_pago: aguinaldoData.fechaPago || new Date(),
                observaciones: aguinaldoData.observaciones
            }])
            .select()
            .single();

        if (error) return { error: handleSupabaseError(error, 'createAguinaldo') };

        // Marcar como pagado en perfil empleado si es del año actual
        if (aguinaldoData.anio === new Date().getFullYear()) {
            await updateEmpleado(aguinaldoData.empleadoId, { aguinaldoPagado: true });
        }

        return { success: true, data };
    };

    // ========== PRESTACIONES: NÓMINAS ==========
    const getNominasByEmpleado = async (empleadoId) => {
        if (!client) return [];
        const { data, error } = await client
            .from('nominas')
            .select('*')
            .eq('empleado_id', empleadoId)
            .order('periodo_fin', { ascending: false });

        if (error) {
            console.error('Error fetching nominas:', error);
            return [];
        }
        return data || [];
    };

    const createNomina = async (nominaData) => {
        if (!client) return { error: 'Not initialized' };

        const { data, error } = await client
            .from('nominas')
            .insert([{
                empleado_id: nominaData.empleadoId,
                periodo_inicio: nominaData.periodoInicio,
                periodo_fin: nominaData.periodoFin,
                tipo_periodo: nominaData.tipoPeriodo,
                salario_base: nominaData.salarioBase,
                ingresos_extras: nominaData.ingresosExtras || 0,
                deduccion_inss: nominaData.deduccionInss || 0,
                deduccion_ir: nominaData.deduccionIr || 0,
                otras_deducciones: nominaData.otrasDeducciones || 0,
                total_neto: nominaData.totalNeto,
                estado: nominaData.estado || 'Pagado',
                fecha_pago: nominaData.fechaPago || new Date(),
                notas: nominaData.notas
            }])
            .select()
            .single();

        if (error) return { error: handleSupabaseError(error, 'createNomina') };
        return { success: true, data };
    };

    // ========== PUBLIC API ==========
    return {
        // Inicialización
        init,
        subscribeToChanges, // Exportar función

        // Auth
        authenticateUser,
        createUser, // Exportar createUser
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

        // Empleados
        getEmpleadosSync,
        getEmpleadoById,
        createEmpleado,
        updateEmpleado,
        deleteEmpleado,

        // Prestaciones
        getVacacionesByEmpleado,
        createVacacion,
        updateVacacion,
        deleteVacacion,

        getAguinaldosByEmpleado,
        createAguinaldo,

        getNominasByEmpleado,
        createNomina,

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

