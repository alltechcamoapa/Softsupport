/**
 * ALLTECH SUPPORT - Session Sync
 * Sincroniza la sesión de Supabase con el State al cargar la app
 */

const SessionSync = (async () => {
    /**
     * Verifica y sincroniza la sesión al iniciar
     * Llama esto ANTES de App.render()
     */
    const checkAndSync = async () => {
        console.log('🔍 Verificando sesión de Supabase...');

        try {
            // Verificar si hay funciones de Supabase disponibles
            if (typeof isAuthenticated !== 'function' || typeof getCurrentProfile !== 'function') {
                console.warn('⚠️ Funciones de Supabase no disponibles');
                return;
            }

            const hasSupabaseSession = await isAuthenticated();
            const stateIsAuthenticated = State.get('isAuthenticated');

            console.log('📊 Sesión Supabase:', hasSupabaseSession);
            console.log('📊 State isAuthenticated:', stateIsAuthenticated);

            // Caso 1: State dice logueado pero Supabase no tiene sesión
            if (stateIsAuthenticated && !hasSupabaseSession) {
                console.warn('⚠️ State dice logueado pero Supabase no tiene sesión. Limpiando...');
                State.logout();
                return;
            }

            // Caso 2: Supabase tiene sesión pero State no
            if (hasSupabaseSession && !stateIsAuthenticated) {
                console.log('✅ Supabase tiene sesión activa. Restaurando usuario...');
                try {
                    const profile = await getCurrentProfile();
                    if (profile) {
                        const user = {
                            id: profile.id,
                            username: profile.username,
                            name: profile.full_name,
                            email: profile.email,
                            role: profile.role?.name || 'Usuario',
                            role_id: profile.role_id
                        };
                        State.login(user);
                        console.log('✅ Usuario restaurado desde Supabase:', user.name);
                    } else {
                        console.warn('⚠️ Sesión existe pero no hay perfil');
                        await signOut();
                        State.logout();
                    }
                } catch (error) {
                    console.error('❌ Error al restaurar perfil:', error);
                    await signOut();
                    State.logout();
                }
                return;
            }

            // Caso 3: Ambos sincronizados
            if (hasSupabaseSession && stateIsAuthenticated) {
                console.log('✅ Sesión sincronizada correctamente');
                return;
            }

            // Caso 4: Ambos deslogueados (normal)
            if (!hasSupabaseSession && !stateIsAuthenticated) {
                console.log('ℹ️ Sin sesión activa (normal)');
                return;
            }

        } catch (error) {
            console.error('❌ Error verificando sesión:', error);
            // En caso de error, limpiar para mostrar login
            State.logout();
        }
    };

    return {
        checkAndSync
    };
})();

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.SessionSync = SessionSync;
}
