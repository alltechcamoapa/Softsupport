/**
 * WhatsApp Integration Service
 * Maneja el envío de mensajes a través de WhatsApp Business API o Twilio
 */
const WhatsAppService = (() => {
    // Configuración por defecto (idealmente vendría de DataService.getConfig())
    const DEFAULT_CONFIG = {
        provider: 'twilio', // 'twilio' or 'meta'
        enabled: true
    };

    /**
     * Envía un mensaje de texto por WhatsApp
     * @param {string} phone - Número de teléfono (formato E.164 o local)
     * @param {string} message - Contenido del mensaje
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    const sendMessage = async (phone, message) => {
        try {
            if (!DEFAULT_CONFIG.enabled) {
                console.warn('WhatsApp service is disabled');
                return { success: false, error: 'Servicio deshabilitado' };
            }

            // Validar teléfono
            const cleanPhone = phone.replace(/\D/g, '');
            if (cleanPhone.length < 8) {
                throw new Error('Número de teléfono inválido');
            }

            // Simulación de envío (En producción aquí iría la llamada a fetch)
            console.log(`[WhatsApp] Sending to ${cleanPhone}: ${message}`);

            // Registrar en bitácora
            LogService.log('comunicaciones', 'create', cleanPhone, 'Mensaje de WhatsApp enviado', { length: message.length });

            // Simular delay de red
            await new Promise(resolve => setTimeout(resolve, 800));

            return { success: true };
        } catch (error) {
            console.error('[WhatsApp] Error:', error);
            LogService.log('comunicaciones', 'error', phone, 'Fallo envío WhatsApp', { error: error.message });
            return { success: false, error: error.message };
        }
    };

    /**
     * Genera un enlace de WhatsApp Click-to-Chat
     * Útil para abrir la app de escritorio/web si no se tiene API configurada
     * @param {string} phone 
     * @param {string} text 
     */
    const generateLink = (phone, text) => {
        const cleanPhone = phone.replace(/\D/g, '');
        const encodedText = encodeURIComponent(text);
        return `https://wa.me/${cleanPhone}?text=${encodedText}`;
    };

    return {
        sendMessage,
        generateLink
    };
})();
