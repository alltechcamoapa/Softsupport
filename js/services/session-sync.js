/**
 * ALLTECH SUPPORT - Session Sync v2
 * Versión más compatible para navegadores móviles
 */

const SessionSync = (() => {
    /**
     * Verifica y sincroniza la sesión al iniciar
     */
    const checkAndSync = () => {
        return new Promise((resolve, reject) => {
            console.log('🔍 Verificando sesión de Supabase...');

            try {
                // Verificar si hay funciones de Supabase disponibles
                if (typeof isAuthenticated !== 'function' || typeof getCurrentProfile !== 'function') {
                    console.warn('⚠️ Funciones de Supabase no disponibles');
                    resolve();
                    return;
                }

                // Verificar sesión de Supabase
                isAuthenticated()
                    .then(hasSupabaseSession => {
                        const stateIsAuthenticated = State.get('isAuthenticated');

                        console.log('📊 Sesión Supabase:', hasSupabaseSession);
                        console.log('📊 State isAuthenticated:', stateIsAuthenticated);

                        // Caso 1: State dice logueado pero Supabase no tiene sesión
                        if (stateIsAuthenticated && !hasSupabaseSession) {
                            console.warn('⚠️ State dice logueado pero Supabase no tiene sesión. Limpiando...');
                            State.logout();
                            resolve();
                            return;
                        }

                        // Caso 2: Supabase tiene sesión pero State no
                        if (hasSupabaseSession && !stateIsAuthenticated) {
                            console.log('✅ Supabase tiene sesión activa. Restaurando usuario...');

                            getCurrentProfile()
                                .then(profile => {
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
                                        resolve();
                                    } else {
                                        console.warn('⚠️ Sesión existe pero no hay perfil');
                                        if (typeof signOut === 'function') {
                                            signOut().then(() => {
                                                State.logout();
                                                resolve();
                                            }).catch(() => {
                                                State.logout();
                                                resolve();
                                            });
                                        } else {
                                            State.logout();
                                            resolve();
                                        }
                                    }
                                })
                                .catch(error => {
                                    console.error('❌ Error al restaurar perfil:', error);
                                    if (typeof signOut === 'function') {
                                        signOut().catch(() => { });
                                    }
                                    State.logout();
                                    resolve();
                                });
                            return;
                        }

                        // Caso 3: Ambos sincronizados
                        if (hasSupabaseSession && stateIsAuthenticated) {
                            console.log('✅ Sesión sincronizada correctamente');
                            resolve();
                            return;
                        }

                        // Caso 4: Ambos deslogueados (normal)
                        if (!hasSupabaseSession && !stateIsAuthenticated) {
                            console.log('ℹ️ Sin sesión activa (normal)');
                            resolve();
                            return;
                        }

                        resolve();
                    })
                    .catch(error => {
                        console.error('❌ Error verificando sesión:', error);
                        State.logout();
                        resolve();
                    });

            } catch (error) {
                console.error('❌ Error en checkAndSync:', error);
                State.logout();
                resolve();
            }
        });
    };

    return {
        checkAndSync
    };
})();

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.SessionSync = SessionSync;
}
