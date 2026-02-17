#!/usr/bin/env node
/**
 * U-FACTORY RADIATORS — VAPI Voice Agent Setup
 * 
 * Creates a VAPI voice assistant that:
 * 1. Greets callers in Spanish
 * 2. Asks for their VIN, name, and email
 * 3. Sends data to your webhook when the call ends
 * 
 * Usage:
 *   node scripts/create-vapi-agent.mjs <VAPI_API_KEY> <WEBHOOK_URL>
 * 
 * Example:
 *   node scripts/create-vapi-agent.mjs pk_abc123 https://yourdomain.com/api/vapi/webhook
 *   node scripts/create-vapi-agent.mjs pk_abc123 https://abc123.ngrok.io/api/vapi/webhook
 */

const VAPI_API_KEY = process.argv[2];
const WEBHOOK_URL = process.argv[3];

if (!VAPI_API_KEY || !WEBHOOK_URL) {
    console.error(`
╔══════════════════════════════════════════════════════╗
║  U-FACTORY RADIATORS — VAPI Agent Setup              ║
╠══════════════════════════════════════════════════════╣
║                                                       ║
║  Uso:                                                 ║
║    node scripts/create-vapi-agent.mjs <API_KEY> <URL> ║
║                                                       ║
║  API_KEY: Tu Private Key de VAPI                      ║
║           (dashboard.vapi.ai > Organization > API Keys)║
║                                                       ║
║  URL: Tu webhook URL:                                 ║
║    • Producción: https://tudominio.com/api/vapi/webhook║
║    • Local:      https://xxx.ngrok.io/api/vapi/webhook ║
║                                                       ║
╚══════════════════════════════════════════════════════╝
`);
    process.exit(1);
}

const assistantPayload = {
    name: "U-FACTORY RADIATORS — Consulta VIN",

    // --- SYSTEM PROMPT ---
    model: {
        provider: "openai",
        model: "gpt-4o-mini",
        temperature: 0.3,
        maxTokens: 500,
        messages: [
            {
                role: "system",
                content: `Eres un asistente de voz de U-FACTORY RADIATORS, una distribuidora de autopartes en Miami, Florida, especializada en radiadores, condensadores y ventiladores.

Tu trabajo es recopilar la información del cliente para buscar piezas disponibles según el VIN de su vehículo.

INSTRUCCIONES:
1. Saluda al cliente amablemente y pregúntale cómo puedes ayudarlo
2. Pide el número VIN del vehículo (17 caracteres alfanuméricos). Explica dónde encontrarlo si el cliente no sabe (esquina inferior del parabrisas, registro del vehículo, o seguro)
3. Pide su nombre completo
4. Pide su correo electrónico para enviarle los resultados
5. Confirma la información con el cliente
6. Despídete amablemente e indica que recibirá los resultados por correo electrónico

REGLAS:
- Habla SIEMPRE en español
- Sé breve y directo, sin ser brusco
- Si el cliente da un VIN incorrecto (menos o más de 17 caracteres), pídele que lo repita
- Si el cliente dice letras similares a números, confirma cada carácter
- NO des precios ni información de piezas durante la llamada — solo recopila datos
- Cuando tengas VIN, nombre y email, confirma los tres datos y despídete
- El horario de U-FACTORY es: Lunes-Viernes 8AM-6PM, Sábado 8AM-3PM
- La dirección es: 4495 NW 37th Ave, Miami, FL 33142
- El teléfono es: (305) 634-9637
- Si preguntan por algo fuera de radiadores, condensadores o ventiladores, indica amablemente que esos no son nuestros productos`
            }
        ]
    },

    // --- VOICE ---
    voice: {
        provider: "11labs",
        voiceId: "pMsXgVXv3BLzUgSXRplE",  // "Fernando" — Spanish male voice
        speed: 1.0,
        cachingEnabled: true,
        chunkPlan: {
            enabled: true,
            minCharacters: 30,
            formatPlan: {
                enabled: true,
                numberToDigitsCutoff: 2025
            }
        }
    },

    // --- TRANSCRIBER ---
    transcriber: {
        provider: "deepgram",
        language: "es",
        model: "nova-2"
    },

    // --- FIRST MESSAGE ---
    firstMessage: "¡Hola! Bienvenido a U-FACTORY RADIATORS, su distribuidora de autopartes de confianza en Miami. ¿En qué puedo ayudarle hoy?",
    firstMessageMode: "assistant-speaks-first",

    // --- SERVER WEBHOOK (end-of-call-report) ---
    server: {
        url: WEBHOOK_URL,
        timeoutSeconds: 30
    },
    serverMessages: ["end-of-call-report"],

    // --- ANALYSIS PLAN (extract VIN, name, email from conversation) ---
    analysisPlan: {
        structuredDataPlan: {
            enabled: true,
            schema: {
                type: "object",
                properties: {
                    vin: {
                        type: "string",
                        description: "El número VIN del vehículo proporcionado por el cliente (17 caracteres)"
                    },
                    customerName: {
                        type: "string",
                        description: "El nombre completo del cliente"
                    },
                    customerEmail: {
                        type: "string",
                        description: "El correo electrónico del cliente"
                    }
                },
                required: ["vin", "customerName", "customerEmail"]
            },
            timeoutSeconds: 10
        },
        summaryPlan: {
            enabled: true,
            messages: [
                {
                    role: "system",
                    content: "Resume la llamada en español. Incluye: datos recopilados (VIN, nombre, email), si el cliente tenía preguntas adicionales, y la resolución general."
                }
            ],
            timeoutSeconds: 10
        },
        successEvaluationPlan: {
            enabled: true,
            rubric: "AutomaticRubric",
            messages: [
                {
                    role: "system",
                    content: "La llamada es exitosa si se logró recopilar: 1) VIN válido de 17 caracteres, 2) nombre del cliente, 3) correo electrónico del cliente."
                }
            ],
            timeoutSeconds: 10
        }
    },

    // --- CALL SETTINGS ---
    maxDurationSeconds: 300,  // 5 min max
    endCallMessage: "¡Gracias por llamar a U-FACTORY RADIATORS! En breve recibirás la información de las piezas disponibles en tu correo electrónico. ¡Que tengas un excelente día!",
    endCallPhrases: ["adiós", "hasta luego", "gracias eso es todo", "no necesito nada más"],
    backgroundSound: "off",

    // --- KEYPAD INPUT (for VIN entry via digits) ---
    keypadInputPlan: {
        enabled: false
    }
};

async function createAssistant() {
    console.log('');
    console.log('🔧 U-FACTORY RADIATORS — Creando agente VAPI...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📡 Webhook URL: ${WEBHOOK_URL}`);
    console.log('');

    try {
        const response = await fetch('https://api.vapi.ai/assistant', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${VAPI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(assistantPayload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('❌ Error creando el asistente:');
            console.error(JSON.stringify(data, null, 2));
            process.exit(1);
        }

        console.log('✅ ¡Agente VAPI creado exitosamente!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('');
        console.log(`  📋 ID del Asistente: ${data.id}`);
        console.log(`  📛 Nombre:           ${data.name}`);
        console.log(`  🗣️  Voz:              ElevenLabs (Fernando - Español)`);
        console.log(`  🧠 Modelo:           GPT-4o-mini`);
        console.log(`  📡 Webhook:          ${WEBHOOK_URL}`);
        console.log(`  ⏱️  Duración máx:     5 minutos`);
        console.log('');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📌 Próximos pasos:');
        console.log('');
        console.log('  1. Ve a dashboard.vapi.ai > Phone Numbers');
        console.log('  2. Compra o conecta un número de teléfono');
        console.log('  3. Asigna este asistente al número');
        console.log('  4. ¡Llama al número para probar!');
        console.log('');
        console.log('  Para probar por web:');
        console.log(`  dashboard.vapi.ai > Assistants > "${data.name}" > Test`);
        console.log('');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        return data;
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
        process.exit(1);
    }
}

createAssistant();
