import { Resend } from 'resend';

let resend = null;

function getResend() {
    if (!resend) {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey || apiKey === 'your_resend_api_key') {
            return null; // dev mode
        }
        resend = new Resend(apiKey);
    }
    return resend;
}

export async function sendEmail(to, subject, htmlBody, textBody) {
    const client = getResend();

    // DEV MODE: log to console if no API key
    if (!client) {
        console.log('');
        console.log('📧 [DEV MODE] Email que se enviaría:');
        console.log('━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Para: ${to}`);
        console.log(`Asunto: ${subject}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━');
        console.log(textBody || '(HTML email)');
        console.log('━━━━━━━━━━━━━━━━━━━━━');
        console.log('');
        return { success: true, messageId: 'dev-mode-' + Date.now() };
    }

    try {
        const fromEmail = 'U-FACTORY RADIATORS <onboarding@resend.dev>';

        const { data, error } = await client.emails.send({
            from: fromEmail,
            to,
            subject,
            html: htmlBody,
            text: textBody,
        });

        if (error) {
            console.error('❌ Resend error:', error.message);
            return { success: false, error: error.message };
        }

        console.log('✅ Email sent via Resend to:', to, '| ID:', data.id);
        return { success: true, messageId: data.id };
    } catch (err) {
        console.error('❌ Email send error:', err.message);
        return { success: false, error: err.message };
    }
}
