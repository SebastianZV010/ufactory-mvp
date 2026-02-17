# 🔧 U-FACTORY RADIATORS — Sistema de Consulta VIN

Sistema automatizado para consulta de piezas de autopartes (radiadores, condensadores, ventiladores) basado en el VIN del vehículo, con notificación por WhatsApp.

## 🚀 Inicio Rápido

```bash
# 1. Instalar dependencias
cd ufactory-app
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Abrir en navegador
open http://localhost:3000
```

La base de datos se crea y llena automáticamente al primer request.

## 📱 Funcionalidades

### Canal Web
1. Cliente ingresa VIN + datos en formulario web
2. Sistema decodifica VIN y busca piezas
3. Envía resultado por WhatsApp (modo dev: muestra en consola)

### Canal Telefónico (VAPI)
1. Cliente llama → agente VAPI recolecta VIN, nombre, email
2. Webhook POST a `/api/vapi/webhook`
3. Mismo procesamiento → WhatsApp al caller ID

### Panel Cliente (`/dashboard`)
- Login con email + teléfono
- Ver historial de sus consultas
- Ver piezas encontradas por consulta

### Panel Admin (`/admin`)
- Ver TODAS las consultas con filtros
- Gestión de inventario (editar precios/stock)
- Estadísticas: por canal, por marca, distribución
- Exportar CSV

## 🧪 VINs de Prueba

| VIN | Vehículo |
|-----|----------|
| `1FTFW1ET5DFC10001` | 2013 Ford F-150 5.0L V8 |
| `1FMSK7DH8LGA20002` | 2020 Ford Explorer 2.3L Turbo |
| `3GCUKREC7JG140004` | 2018 Chevrolet Silverado 5.3L V8 |
| `4T1B11HK2JU470007` | 2018 Toyota Camry 2.5L I4 |
| `19XFC2F59KE700010` | 2019 Honda Civic 2.0L I4 |
| `1N4BL4BV7KC730013` | 2019 Nissan Altima 2.5L I4 |
| `1C6SRFFT8MN760016` | 2021 RAM 1500 5.7L HEMI |
| `5NMS3CAD8KH780018` | 2019 Hyundai Tucson 2.4L |
| `KNDPNCAC0L7800020` | 2020 Kia Sportage 2.4L |

## 👤 Cuentas de Prueba

| Rol | Email | Teléfono |
|-----|-------|----------|
| Admin | `admin@ufactory.com` | `3056349637` |
| Cliente | `cliente@test.com` | `3051234567` |

## 🔌 API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/lookup` | Consulta VIN (web form) |
| POST | `/api/vapi/webhook` | Webhook VAPI |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Usuario actual |
| GET | `/api/queries` | Consultas (filtrable) |
| GET | `/api/admin/stats` | Estadísticas (admin) |
| GET/PUT | `/api/admin/inventory` | Inventario (admin) |
| GET | `/api/admin/export` | Exportar CSV (admin) |

## 🔧 Configuración WhatsApp (Producción)

1. Crear cuenta Twilio: https://twilio.com
2. Activar WhatsApp Sandbox
3. Copiar `.env.example` → `.env.local`
4. Completar `TWILIO_ACCOUNT_SID` y `TWILIO_AUTH_TOKEN`
5. Para webhooks externos, usar ngrok: `npx ngrok http 3000`

## 📞 Configuración VAPI

1. Crear asistente en https://vapi.ai
2. Configurar webhook URL: `https://tu-dominio/api/vapi/webhook`
3. El asistente debe recolectar: VIN, nombre, email
4. VAPI envía el caller ID automáticamente

## 🏗️ Estructura del Proyecto

```
src/
├── app/
│   ├── api/
│   │   ├── health/route.js
│   │   ├── lookup/route.js
│   │   ├── vapi/webhook/route.js
│   │   ├── auth/{login,logout,me}/route.js
│   │   ├── queries/route.js
│   │   └── admin/{stats,inventory,export}/route.js
│   ├── admin/page.js          # Panel admin
│   ├── dashboard/page.js      # Panel cliente
│   ├── login/page.js          # Login
│   ├── page.js                # Landing + formulario VIN
│   ├── layout.js
│   └── globals.css
├── db/
│   ├── schema.js              # SQLite schema
│   └── seed.js                # Datos mock
├── lib/
│   ├── auth.js                # Sesiones
│   └── initDb.js              # Inicialización DB
└── services/
    ├── vinDecoder.js           # Decodificador VIN
    ├── partsLookup.js          # Búsqueda de piezas
    ├── messageFormatter.js     # Formato WhatsApp
    ├── whatsappService.js      # Envío Twilio
    └── queryProcessor.js       # Flujo unificado
```
