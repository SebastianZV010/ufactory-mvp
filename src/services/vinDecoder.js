import { getDb } from '@/db/schema';

export function validateVin(vin) {
    if (!vin || typeof vin !== 'string') return { valid: false, error: 'VIN es requerido' };
    const cleaned = vin.trim().toUpperCase();
    if (cleaned.length !== 17) return { valid: false, error: 'VIN debe tener exactamente 17 caracteres' };
    if (/[IOQ]/.test(cleaned)) return { valid: false, error: 'VIN no puede contener las letras I, O, Q' };
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(cleaned)) return { valid: false, error: 'VIN contiene caracteres inválidos' };
    return { valid: true, vin: cleaned };
}

export function decodeVin(vin) {
    const validation = validateVin(vin);
    if (!validation.valid) return { success: false, error: validation.error };

    const db = getDb();
    const vehicle = db.prepare('SELECT * FROM vehicles WHERE vin = ?').get(validation.vin);

    if (!vehicle) {
        return {
            success: false,
            error: 'Vehículo no encontrado en nuestra base de datos. Contacte a U-FACTORY directamente para asistencia.'
        };
    }

    return {
        success: true,
        vehicle: {
            vin: vehicle.vin,
            year: vehicle.year,
            make: vehicle.make,
            model: vehicle.model,
            engine: vehicle.engine,
            trim: vehicle.trim
        }
    };
}
