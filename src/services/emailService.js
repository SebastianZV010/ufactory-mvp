import nodemailer from 'nodemailer';

let transporter;
let etherealAccount = null;

async function getTransporter() {
    if (!transporter) {
        const host = process.env.SMTP_HOST;
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;

        if (!host || host === 'your_smtp_host') {
            // Create a real Ethereal test account (free, no signup required)
            try {
                etherealAccount = await nodemailer.createTestAccount();
                transporter = nodemailer.createTransport({
                    host: 'smtp.ethereal.email',
                    port: 587,
                    secure: false,
                    auth: {
                        user: etherealAccount.user,
                        pass: etherealAccount.pass
                    }
                });
                console.log('');
                console.log('📧 [MODO TEST] Usando Ethereal Email (correos de prueba)');
                console.log(`   📬 Cuenta: ${etherealAccount.user}`);
                console.log(`   🔗 Ver emails en: https://ethereal.email/login`);
                console.log(`      User: ${etherealAccount.user}`);
                console.log(`      Pass: ${etherealAccount.pass}`);
                console.log('');
            } catch (err) {
                // Fallback: console-only mode
                console.log('📧 [DEV MODE] Ethereal no disponible, modo consola');
                transporter = {
                    sendMail: async (options) => {
                        console.log('');
                        console.log('📧 [DEV MODE] Email que se enviaría:');
                        console.log('━━━━━━━━━━━━━━━━━━━━━');
                        console.log(`Para: ${options.to}`);
                        console.log(`Asunto: ${options.subject}`);
                        console.log('━━━━━━━━━━━━━━━━━━━━━');
                        console.log(options.text || '(HTML email)');
                        console.log('━━━━━━━━━━━━━━━━━━━━━');
                        console.log('');
                        return { messageId: 'dev-mode-' + Date.now() };
                    }
                };
            }
        } else {
            // Production: use real SMTP (Gmail, etc.)
            transporter = nodemailer.createTransport({
                host,
                port: parseInt(process.env.SMTP_PORT) || 587,
                secure: parseInt(process.env.SMTP_PORT) === 465,
                auth: { user, pass },
            });
        }
    }
    return transporter;
}

export async function sendEmail(to, subject, htmlBody, textBody) {
    const transport = await getTransporter();
    const fromEmail = process.env.SMTP_FROM || 'U-FACTORY RADIATORS <no-reply@ufactory.com>';

    try {
        const result = await transport.sendMail({
            from: fromEmail,
            to,
            subject,
            html: htmlBody,
            text: textBody,
        });

        // If using Ethereal, show the preview URL
        const previewUrl = nodemailer.getTestMessageUrl(result);
        if (previewUrl) {
            console.log('');
            console.log('✅ Email de prueba enviado!');
            console.log(`   📬 Para: ${to}`);
            console.log(`   🔗 VER EMAIL AQUÍ → ${previewUrl}`);
            console.log('');
        } else {
            console.log('✅ Email sent to:', to, '| ID:', result.messageId);
        }

        return { success: true, messageId: result.messageId, previewUrl };
    } catch (error) {
        console.error('❌ Email send error:', error.message);
        return { success: false, error: error.message };
    }
}
