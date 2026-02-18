import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { ensureDb } from '@/lib/initDb';
import { processQuery } from '@/services/queryProcessor';

export async function POST(request) {
    ensureDb();

    try {
        const body = await request.json();
        let vin, customerName, customerEmail, callerPhone;

        // Handle VAPI end-of-call-report format
        if (body.message && body.message.type === 'end-of-call-report') {
            const msg = body.message;
            const structuredData = msg.analysis?.structuredData || {};
            const call = msg.call || {};

            // VAPI extracts these via the structuredDataPlan
            vin = structuredData.vin;
            customerName = structuredData.customerName;
            customerEmail = structuredData.customerEmail;
            callerPhone = call.customer?.number || null;

            console.log('📞 VAPI end-of-call-report received:');
            console.log(`   VIN: ${vin || '(no recopilado)'}`);
            console.log(`   Nombre: ${customerName || '(no recopilado)'}`);
            console.log(`   Email: ${customerEmail || '(no recopilado)'}`);
            console.log(`   Tel: ${callerPhone || '(no disponible)'}`);
            console.log(`   Summary: ${msg.analysis?.summary || '(sin resumen)'}`);

            if (!vin || !customerEmail) {
                console.log('⚠️  Datos incompletos — no se procesa la consulta');
                return NextResponse.json({
                    success: false,
                    message: 'Datos incompletos. Se requiere VIN y email del cliente.'
                });
            }
        } else {
            // Direct/manual format (for testing)
            vin = body.vin;
            customerName = body.name || body.customer_name || 'Cliente';
            customerEmail = body.email || body.customer_email;
            callerPhone = body.caller_phone || body.phone || null;
        }

        if (!vin) return NextResponse.json({ error: 'VIN no proporcionado' }, { status: 400 });
        if (!customerEmail) return NextResponse.json({ error: 'Email no proporcionado' }, { status: 400 });

        const result = await processQuery({
            vin: vin.trim().toUpperCase(),
            customerName: customerName || 'Cliente',
            customerPhone: callerPhone,
            customerEmail: customerEmail,
            channel: 'call',
            userId: null
        });

        return NextResponse.json({
            success: result.success,
            queryId: result.queryId,
            message: result.success ? 'Consulta procesada. Resultados enviados por correo.' : result.error
        });
    } catch (error) {
        console.error('VAPI webhook error:', error);
        return NextResponse.json({ error: 'Error procesando webhook' }, { status: 500 });
    }
}
