#!/usr/bin/env node
/**
 * U-FACTORY RADIATORS — VAPI Voice Agent Update (English)
 * 
 * Updates an existig VAPI voice assistant to ENGLISH.
 * 
 * Usage:
 *   node scripts/update-vapi-agent-en.mjs <VAPI_API_KEY> <ASSISTANT_ID>
 */

const VAPI_API_KEY = process.argv[2];
const ASSISTANT_ID = process.argv[3];

if (!VAPI_API_KEY || !ASSISTANT_ID) {
    console.error('Usage: node scripts/update-vapi-agent-en.mjs <API_KEY> <ASSISTANT_ID>');
    process.exit(1);
}

const assistantPayload = {
    name: "U-FACTORY — VIN Lookup EN",

    // --- ENGLISH SYSTEM PROMPT ---
    model: {
        provider: "openai",
        model: "gpt-4o-mini",
        temperature: 0.3,
        maxTokens: 500,
        messages: [
            {
                role: "system",
                content: `You are a voice assistant for U-FACTORY RADIATORS, an auto parts distributor in Miami, Florida, specializing in radiators, condensers, and fans.

Your job is to collect customer information to check for part availability based on their vehicle's VIN.

INSTRUCTIONS:
1. Greet the customer politely and ask how you can help them.
2. Ask for the vehicle's VIN number (17 alphanumeric characters). Explain where to find it if the customer doesn't know (lower corner of the windshield, vehicle registration, or insurance).
3. Ask for their full name.
4. Ask for their email address to send the results.
5. Confirm the information with the customer.
6. Say goodbye politely and indicate that they will receive the results via email.

RULES:
- Speak ALWAYS in English.
- Be brief and direct, without being rude.
- If the customer provides an incorrect VIN (less or more than 17 characters), ask them to repeat it.
- If the customer says letters similar to numbers, confirm each character.
- DO NOT provide prices or part info during the call — only collect data.
- Once you have the VIN, name, and email, confirm the three pieces of data and say goodbye.
- U-FACTORY hours are: Mon-Fri 8AM-6PM, Sat 8AM-3PM.
- Address: 4495 NW 37th Ave, Miami, FL 33142.
- Phone: (305) 634-9637.
- If they ask for something other than radiators, condensers, or fans, politely indicate that those are not our products.`
            }
        ]
    },

    // --- ENGLISH VOICE ---
    voice: {
        provider: "vapi",
        voiceId: "Leo",
        speed: 1.0,
        cachingEnabled: true
    },

    // --- ENGLISH TRANSCRIBER ---
    transcriber: {
        provider: "deepgram",
        language: "en",
        model: "nova-2"
    },

    // --- FIRST MESSAGE ---
    firstMessage: "Hello! Welcome to U-FACTORY RADIATORS, your trusted auto parts distributor in Miami. How can I help you today?",

    // --- END CALL SETTINGS ---
    endCallMessage: "Thank you for calling U-FACTORY RADIATORS! You will receive the information about available parts in your email shortly. Have a great day!",
    endCallPhrases: ["goodbye", "bye", "thanks that is all", "i am done"],

    // --- ANALYSIS PLAN (English) ---
    analysisPlan: {
        structuredDataPlan: {
            enabled: true,
            schema: {
                type: "object",
                properties: {
                    vin: {
                        type: "string",
                        description: "The vehicle's VIN number provided by the customer (17 characters)"
                    },
                    customerName: {
                        type: "string",
                        description: "The customer's full name"
                    },
                    customerEmail: {
                        type: "string",
                        description: "The customer's email address"
                    }
                },
                required: ["vin", "customerName", "customerEmail"]
            }
        },
        summaryPlan: {
            enabled: true,
            messages: [
                {
                    role: "system",
                    content: "Summarize the call in English. Include data collected (VIN, name, email) and the general resolution."
                }
            ]
        },
        successEvaluationPlan: {
            enabled: true,
            messages: [
                {
                    role: "system",
                    content: "The call is successful if: 1) A valid 17-character VIN was collected, 2) customer name was collected, 3) customer email was collected."
                }
            ]
        }
    }
};

async function updateAssistant() {
    console.log(`🔧 Updating VAPI Assistant ${ASSISTANT_ID} to ENGLISH...`);

    try {
        const response = await fetch(`https://api.vapi.ai/assistant/${ASSISTANT_ID}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${VAPI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(assistantPayload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('❌ Error updating assistant:');
            console.error(JSON.stringify(data, null, 2));
            process.exit(1);
        }

        console.log('✅ Assistant updated to English successfully!');
        console.log(`   ID: ${data.id}`);
        console.log(`   Name: ${data.name}`);
        console.log(`   Language: English (en)`);
        console.log(`   Voice: ElevenLabs (Josh)`);
    } catch (error) {
        console.error('❌ Connection error:', error.message);
        process.exit(1);
    }
}

updateAssistant();
