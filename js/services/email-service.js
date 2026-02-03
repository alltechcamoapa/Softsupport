/**
 * Email Service
 * Maneja el envío de correos electrónicos (integración sugerida: EmailJS)
 */
const EmailService = (() => {

    /**
     * Envía un correo electrónico
     * @param {string} toEmail - Destinatario
     * @param {string} subject - Asunto
     * @param {string} body - Cuerpo del mensaje
     * @param {object} attachments - Adjuntos (opcional)
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    const sendEmail = async (toEmail, subject, body, attachments = null) => {
        try {
            console.log(`[Email] Sending to ${toEmail} | Subject: ${subject}`);

            // Validación básica
            if (!toEmail || !toEmail.includes('@')) {
                throw new Error('Email inválido');
            }

            // Registrar en bitácora
            LogService.log('comunicaciones', 'create', toEmail, 'Email enviado', { subject });

            // Simular delay de red
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Aquí iría la integración real (ej. EmailJS.send(...))

            return { success: true };
        } catch (error) {
            console.error('[Email] Error:', error);
            LogService.log('comunicaciones', 'error', toEmail, 'Fallo envío Email', { error: error.message });
            return { success: false, error: error.message };
        }
    };

    /**
     * Abre el cliente de correo por defecto del usuario
     * @param {string} to 
     * @param {string} subject 
     * @param {string} body 
     */
    const openMailTo = (to, subject, body) => {
        const href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(href, '_blank');
    };

    return {
        sendEmail,
        openMailTo
    };
})();
