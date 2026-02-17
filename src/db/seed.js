import { getDb } from './schema';
import bcryptjs from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const vehicles = [
    { vin: '1FTFW1ET5DFC10001', year: 2013, make: 'Ford', model: 'F-150', engine: '5.0L V8', trim: 'XLT' },
    { vin: '1FMSK7DH8LGA20002', year: 2020, make: 'Ford', model: 'Explorer', engine: '2.3L Turbo I4', trim: 'XLT' },
    { vin: '1FMCU0G61HUB30003', year: 2017, make: 'Ford', model: 'Escape', engine: '1.5L Turbo I4', trim: 'SE' },
    { vin: '3GCUKREC7JG140004', year: 2018, make: 'Chevrolet', model: 'Silverado 1500', engine: '5.3L V8', trim: 'LT' },
    { vin: '2GNAXSEV1K6250005', year: 2019, make: 'Chevrolet', model: 'Equinox', engine: '1.5L Turbo I4', trim: 'LT' },
    { vin: '1G1ZD5ST8LF360006', year: 2020, make: 'Chevrolet', model: 'Malibu', engine: '1.5L Turbo I4', trim: 'LT' },
    { vin: '4T1B11HK2JU470007', year: 2018, make: 'Toyota', model: 'Camry', engine: '2.5L I4', trim: 'SE' },
    { vin: '2T3RFREV1JW580008', year: 2018, make: 'Toyota', model: 'RAV4', engine: '2.5L I4', trim: 'XLE' },
    { vin: 'JTDEPRAE6LJ690009', year: 2020, make: 'Toyota', model: 'Corolla', engine: '2.0L I4', trim: 'LE' },
    { vin: '19XFC2F59KE700010', year: 2019, make: 'Honda', model: 'Civic', engine: '2.0L I4', trim: 'LX' },
    { vin: '2HKRW2H53LH710011', year: 2020, make: 'Honda', model: 'CR-V', engine: '1.5L Turbo I4', trim: 'EX' },
    { vin: '1HGCV1F34LA720012', year: 2020, make: 'Honda', model: 'Accord', engine: '1.5L Turbo I4', trim: 'Sport' },
    { vin: '1N4BL4BV7KC730013', year: 2019, make: 'Nissan', model: 'Altima', engine: '2.5L I4', trim: 'S' },
    { vin: '5N1AT2MT1KC740014', year: 2019, make: 'Nissan', model: 'Rogue', engine: '2.5L I4', trim: 'SV' },
    { vin: '3N1AB7AP8KY750015', year: 2019, make: 'Nissan', model: 'Sentra', engine: '1.8L I4', trim: 'SV' },
    { vin: '1C6SRFFT8MN760016', year: 2021, make: 'RAM', model: '1500', engine: '5.7L HEMI V8', trim: 'Big Horn' },
    { vin: '3C6UR5DL7JG770017', year: 2018, make: 'RAM', model: '2500', engine: '6.7L Turbo Diesel I6', trim: 'Tradesman' },
    { vin: '5NMS3CAD8KH780018', year: 2019, make: 'Hyundai', model: 'Tucson', engine: '2.4L I4', trim: 'Value' },
    { vin: '5NPD84LF2LH790019', year: 2020, make: 'Hyundai', model: 'Elantra', engine: '2.0L I4', trim: 'SE' },
    { vin: 'KNDPNCAC0L7800020', year: 2020, make: 'Kia', model: 'Sportage', engine: '2.4L I4', trim: 'LX' },
];

const partsData = [
    { part_number: 'RAD-FD-F150-01', type: 'radiador', description: 'Radiador Ford F-150 2009-2014 V8 5.0L', make: 'Ford', model: 'F-150', year_from: 2009, year_to: 2014, price: 189.99, stock_qty: 12 },
    { part_number: 'CND-FD-F150-01', type: 'condensador', description: 'Condensador A/C Ford F-150 2009-2014', make: 'Ford', model: 'F-150', year_from: 2009, year_to: 2014, price: 129.99, stock_qty: 8 },
    { part_number: 'VNT-FD-F150-01', type: 'ventilador', description: 'Ventilador Radiador Ford F-150 2009-2014', make: 'Ford', model: 'F-150', year_from: 2009, year_to: 2014, price: 165.50, stock_qty: 5 },
    { part_number: 'RAD-FD-EXPL-01', type: 'radiador', description: 'Radiador Ford Explorer 2016-2021 2.3L Turbo', make: 'Ford', model: 'Explorer', year_from: 2016, year_to: 2021, price: 215.00, stock_qty: 6 },
    { part_number: 'CND-FD-EXPL-01', type: 'condensador', description: 'Condensador A/C Ford Explorer 2016-2021', make: 'Ford', model: 'Explorer', year_from: 2016, year_to: 2021, price: 145.00, stock_qty: 4 },
    { part_number: 'VNT-FD-EXPL-01', type: 'ventilador', description: 'Ventilador Radiador Ford Explorer 2016-2021', make: 'Ford', model: 'Explorer', year_from: 2016, year_to: 2021, price: 178.50, stock_qty: 3 },
    { part_number: 'RAD-FD-ESCP-01', type: 'radiador', description: 'Radiador Ford Escape 2013-2019 1.5L Turbo', make: 'Ford', model: 'Escape', year_from: 2013, year_to: 2019, price: 155.00, stock_qty: 10 },
    { part_number: 'CND-FD-ESCP-01', type: 'condensador', description: 'Condensador A/C Ford Escape 2013-2019', make: 'Ford', model: 'Escape', year_from: 2013, year_to: 2019, price: 110.00, stock_qty: 7 },
    { part_number: 'RAD-CH-SLV-01', type: 'radiador', description: 'Radiador Chevrolet Silverado 1500 2014-2019 V8', make: 'Chevrolet', model: 'Silverado 1500', year_from: 2014, year_to: 2019, price: 199.99, stock_qty: 15 },
    { part_number: 'CND-CH-SLV-01', type: 'condensador', description: 'Condensador A/C Chevrolet Silverado 2014-2019', make: 'Chevrolet', model: 'Silverado 1500', year_from: 2014, year_to: 2019, price: 139.99, stock_qty: 9 },
    { part_number: 'VNT-CH-SLV-01', type: 'ventilador', description: 'Ventilador Radiador Chevrolet Silverado 2014-2019', make: 'Chevrolet', model: 'Silverado 1500', year_from: 2014, year_to: 2019, price: 185.00, stock_qty: 6 },
    { part_number: 'RAD-CH-EQX-01', type: 'radiador', description: 'Radiador Chevrolet Equinox 2018-2021 1.5L Turbo', make: 'Chevrolet', model: 'Equinox', year_from: 2018, year_to: 2021, price: 149.99, stock_qty: 8 },
    { part_number: 'CND-CH-EQX-01', type: 'condensador', description: 'Condensador A/C Chevrolet Equinox 2018-2021', make: 'Chevrolet', model: 'Equinox', year_from: 2018, year_to: 2021, price: 115.00, stock_qty: 5 },
    { part_number: 'VNT-CH-EQX-01', type: 'ventilador', description: 'Ventilador Radiador Chevrolet Equinox 2018-2021', make: 'Chevrolet', model: 'Equinox', year_from: 2018, year_to: 2021, price: 135.00, stock_qty: 4 },
    { part_number: 'RAD-CH-MLB-01', type: 'radiador', description: 'Radiador Chevrolet Malibu 2016-2021 1.5L Turbo', make: 'Chevrolet', model: 'Malibu', year_from: 2016, year_to: 2021, price: 139.99, stock_qty: 11 },
    { part_number: 'CND-CH-MLB-01', type: 'condensador', description: 'Condensador A/C Chevrolet Malibu 2016-2021', make: 'Chevrolet', model: 'Malibu', year_from: 2016, year_to: 2021, price: 105.00, stock_qty: 7 },
    { part_number: 'RAD-TY-CMR-01', type: 'radiador', description: 'Radiador Toyota Camry 2018-2022 2.5L', make: 'Toyota', model: 'Camry', year_from: 2018, year_to: 2022, price: 169.99, stock_qty: 14 },
    { part_number: 'CND-TY-CMR-01', type: 'condensador', description: 'Condensador A/C Toyota Camry 2018-2022', make: 'Toyota', model: 'Camry', year_from: 2018, year_to: 2022, price: 125.00, stock_qty: 9 },
    { part_number: 'VNT-TY-CMR-01', type: 'ventilador', description: 'Ventilador Radiador Toyota Camry 2018-2022', make: 'Toyota', model: 'Camry', year_from: 2018, year_to: 2022, price: 145.00, stock_qty: 6 },
    { part_number: 'RAD-TY-RV4-01', type: 'radiador', description: 'Radiador Toyota RAV4 2013-2018 2.5L', make: 'Toyota', model: 'RAV4', year_from: 2013, year_to: 2018, price: 175.00, stock_qty: 10 },
    { part_number: 'CND-TY-RV4-01', type: 'condensador', description: 'Condensador A/C Toyota RAV4 2013-2018', make: 'Toyota', model: 'RAV4', year_from: 2013, year_to: 2018, price: 119.99, stock_qty: 6 },
    { part_number: 'VNT-TY-RV4-01', type: 'ventilador', description: 'Ventilador Radiador Toyota RAV4 2013-2018', make: 'Toyota', model: 'RAV4', year_from: 2013, year_to: 2018, price: 155.00, stock_qty: 4 },
    { part_number: 'RAD-TY-CRL-01', type: 'radiador', description: 'Radiador Toyota Corolla 2019-2022 2.0L', make: 'Toyota', model: 'Corolla', year_from: 2019, year_to: 2022, price: 139.99, stock_qty: 13 },
    { part_number: 'CND-TY-CRL-01', type: 'condensador', description: 'Condensador A/C Toyota Corolla 2019-2022', make: 'Toyota', model: 'Corolla', year_from: 2019, year_to: 2022, price: 99.99, stock_qty: 8 },
    { part_number: 'RAD-HN-CVC-01', type: 'radiador', description: 'Radiador Honda Civic 2016-2021 2.0L', make: 'Honda', model: 'Civic', year_from: 2016, year_to: 2021, price: 149.99, stock_qty: 12 },
    { part_number: 'CND-HN-CVC-01', type: 'condensador', description: 'Condensador A/C Honda Civic 2016-2021', make: 'Honda', model: 'Civic', year_from: 2016, year_to: 2021, price: 109.99, stock_qty: 7 },
    { part_number: 'VNT-HN-CVC-01', type: 'ventilador', description: 'Ventilador Radiador Honda Civic 2016-2021', make: 'Honda', model: 'Civic', year_from: 2016, year_to: 2021, price: 125.00, stock_qty: 5 },
    { part_number: 'RAD-HN-CRV-01', type: 'radiador', description: 'Radiador Honda CR-V 2017-2021 1.5L Turbo', make: 'Honda', model: 'CR-V', year_from: 2017, year_to: 2021, price: 165.00, stock_qty: 9 },
    { part_number: 'CND-HN-CRV-01', type: 'condensador', description: 'Condensador A/C Honda CR-V 2017-2021', make: 'Honda', model: 'CR-V', year_from: 2017, year_to: 2021, price: 119.99, stock_qty: 6 },
    { part_number: 'RAD-HN-ACD-01', type: 'radiador', description: 'Radiador Honda Accord 2018-2022 1.5L Turbo', make: 'Honda', model: 'Accord', year_from: 2018, year_to: 2022, price: 175.00, stock_qty: 8 },
    { part_number: 'CND-HN-ACD-01', type: 'condensador', description: 'Condensador A/C Honda Accord 2018-2022', make: 'Honda', model: 'Accord', year_from: 2018, year_to: 2022, price: 129.99, stock_qty: 5 },
    { part_number: 'VNT-HN-ACD-01', type: 'ventilador', description: 'Ventilador Radiador Honda Accord 2018-2022', make: 'Honda', model: 'Accord', year_from: 2018, year_to: 2022, price: 139.99, stock_qty: 4 },
    { part_number: 'RAD-NS-ALT-01', type: 'radiador', description: 'Radiador Nissan Altima 2019-2022 2.5L', make: 'Nissan', model: 'Altima', year_from: 2019, year_to: 2022, price: 159.99, stock_qty: 10 },
    { part_number: 'CND-NS-ALT-01', type: 'condensador', description: 'Condensador A/C Nissan Altima 2019-2022', make: 'Nissan', model: 'Altima', year_from: 2019, year_to: 2022, price: 115.00, stock_qty: 7 },
    { part_number: 'RAD-NS-RGE-01', type: 'radiador', description: 'Radiador Nissan Rogue 2014-2020 2.5L', make: 'Nissan', model: 'Rogue', year_from: 2014, year_to: 2020, price: 155.00, stock_qty: 11 },
    { part_number: 'CND-NS-RGE-01', type: 'condensador', description: 'Condensador A/C Nissan Rogue 2014-2020', make: 'Nissan', model: 'Rogue', year_from: 2014, year_to: 2020, price: 109.99, stock_qty: 6 },
    { part_number: 'VNT-NS-RGE-01', type: 'ventilador', description: 'Ventilador Radiador Nissan Rogue 2014-2020', make: 'Nissan', model: 'Rogue', year_from: 2014, year_to: 2020, price: 135.00, stock_qty: 4 },
    { part_number: 'RAD-NS-SNT-01', type: 'radiador', description: 'Radiador Nissan Sentra 2013-2019 1.8L', make: 'Nissan', model: 'Sentra', year_from: 2013, year_to: 2019, price: 119.99, stock_qty: 14 },
    { part_number: 'CND-NS-SNT-01', type: 'condensador', description: 'Condensador A/C Nissan Sentra 2013-2019', make: 'Nissan', model: 'Sentra', year_from: 2013, year_to: 2019, price: 89.99, stock_qty: 9 },
    { part_number: 'RAD-RM-1500-01', type: 'radiador', description: 'Radiador RAM 1500 2019-2023 5.7L HEMI', make: 'RAM', model: '1500', year_from: 2019, year_to: 2023, price: 225.00, stock_qty: 7 },
    { part_number: 'CND-RM-1500-01', type: 'condensador', description: 'Condensador A/C RAM 1500 2019-2023', make: 'RAM', model: '1500', year_from: 2019, year_to: 2023, price: 155.00, stock_qty: 5 },
    { part_number: 'VNT-RM-1500-01', type: 'ventilador', description: 'Ventilador Radiador RAM 1500 2019-2023', make: 'RAM', model: '1500', year_from: 2019, year_to: 2023, price: 195.00, stock_qty: 3 },
    { part_number: 'RAD-RM-2500-01', type: 'radiador', description: 'Radiador RAM 2500 2013-2018 6.7L Diesel', make: 'RAM', model: '2500', year_from: 2013, year_to: 2018, price: 349.99, stock_qty: 4 },
    { part_number: 'CND-RM-2500-01', type: 'condensador', description: 'Condensador A/C RAM 2500 2013-2018', make: 'RAM', model: '2500', year_from: 2013, year_to: 2018, price: 185.00, stock_qty: 3 },
    { part_number: 'VNT-RM-2500-01', type: 'ventilador', description: 'Ventilador Radiador RAM 2500 2013-2018', make: 'RAM', model: '2500', year_from: 2013, year_to: 2018, price: 215.00, stock_qty: 2 },
    { part_number: 'RAD-HY-TCS-01', type: 'radiador', description: 'Radiador Hyundai Tucson 2016-2021 2.4L', make: 'Hyundai', model: 'Tucson', year_from: 2016, year_to: 2021, price: 145.00, stock_qty: 9 },
    { part_number: 'CND-HY-TCS-01', type: 'condensador', description: 'Condensador A/C Hyundai Tucson 2016-2021', make: 'Hyundai', model: 'Tucson', year_from: 2016, year_to: 2021, price: 105.00, stock_qty: 6 },
    { part_number: 'VNT-HY-TCS-01', type: 'ventilador', description: 'Ventilador Radiador Hyundai Tucson 2016-2021', make: 'Hyundai', model: 'Tucson', year_from: 2016, year_to: 2021, price: 125.00, stock_qty: 4 },
    { part_number: 'RAD-HY-ELT-01', type: 'radiador', description: 'Radiador Hyundai Elantra 2017-2020 2.0L', make: 'Hyundai', model: 'Elantra', year_from: 2017, year_to: 2020, price: 129.99, stock_qty: 11 },
    { part_number: 'CND-HY-ELT-01', type: 'condensador', description: 'Condensador A/C Hyundai Elantra 2017-2020', make: 'Hyundai', model: 'Elantra', year_from: 2017, year_to: 2020, price: 95.00, stock_qty: 8 },
    { part_number: 'RAD-KA-SPT-01', type: 'radiador', description: 'Radiador Kia Sportage 2017-2021 2.4L', make: 'Kia', model: 'Sportage', year_from: 2017, year_to: 2021, price: 145.00, stock_qty: 7 },
    { part_number: 'CND-KA-SPT-01', type: 'condensador', description: 'Condensador A/C Kia Sportage 2017-2021', make: 'Kia', model: 'Sportage', year_from: 2017, year_to: 2021, price: 109.99, stock_qty: 5 },
    { part_number: 'VNT-KA-SPT-01', type: 'ventilador', description: 'Ventilador Radiador Kia Sportage 2017-2021', make: 'Kia', model: 'Sportage', year_from: 2017, year_to: 2021, price: 129.99, stock_qty: 3 },
];

export function seed() {
    const db = getDb();
    const existing = db.prepare('SELECT COUNT(*) as count FROM vehicles').get();
    if (existing.count > 0) {
        console.log('Database already seeded. Skipping.');
        return;
    }

    console.log('🌱 Seeding database...');

    const insertVehicle = db.prepare('INSERT INTO vehicles (vin, year, make, model, engine, trim) VALUES (?, ?, ?, ?, ?, ?)');
    for (const v of vehicles) {
        insertVehicle.run(v.vin, v.year, v.make, v.model, v.engine, v.trim);
    }
    console.log(`  ✅ ${vehicles.length} vehicles inserted`);

    const insertPart = db.prepare('INSERT INTO parts (part_number, type, description, make, model, year_from, year_to, price, stock_qty) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    for (const p of partsData) {
        insertPart.run(p.part_number, p.type, p.description, p.make, p.model, p.year_from, p.year_to, p.price, p.stock_qty);
    }
    console.log(`  ✅ ${partsData.length} parts inserted`);

    const adminId = uuidv4();
    const clientId = uuidv4();
    const adminHash = bcryptjs.hashSync('admin123', 10);
    const clientHash = bcryptjs.hashSync('cliente123', 10);

    const insertUser = db.prepare('INSERT INTO users (id, name, email, phone, role, password_hash) VALUES (?, ?, ?, ?, ?, ?)');
    insertUser.run(adminId, 'Admin U-Factory', 'admin@ufactory.com', '3056349637', 'admin', adminHash);
    insertUser.run(clientId, 'Carlos Rodríguez', 'cliente@test.com', '3051234567', 'client', clientHash);
    console.log('  ✅ 2 users created (admin + client)');

    const sampleQueryId1 = uuidv4();
    const sampleQueryId2 = uuidv4();
    const insertQuery = db.prepare(`INSERT INTO queries (id, user_id, vin, customer_name, customer_phone, customer_email, channel, status, vehicle_year, vehicle_make, vehicle_model, vehicle_engine, parts_found, email_sent, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    insertQuery.run(sampleQueryId1, clientId, '4T1B11HK2JU470007', 'Carlos Rodríguez', '3051234567', 'cliente@test.com', 'web', 'sent', 2018, 'Toyota', 'Camry', '2.5L I4', 3, 1, '2026-02-10T14:30:00');
    insertQuery.run(sampleQueryId2, clientId, '19XFC2F59KE700010', 'Carlos Rodríguez', '3051234567', 'cliente@test.com', 'call', 'sent', 2019, 'Honda', 'Civic', '2.0L I4', 3, 1, '2026-02-11T09:15:00');

    const insertQueryPart = db.prepare('INSERT INTO query_parts (query_id, part_id, part_number, type, description, price, stock_qty) VALUES (?, ?, ?, ?, ?, ?, ?)');
    insertQueryPart.run(sampleQueryId1, 17, 'RAD-TY-CMR-01', 'radiador', 'Radiador Toyota Camry 2018-2022 2.5L', 169.99, 14);
    insertQueryPart.run(sampleQueryId1, 18, 'CND-TY-CMR-01', 'condensador', 'Condensador A/C Toyota Camry 2018-2022', 125.00, 9);
    insertQueryPart.run(sampleQueryId1, 19, 'VNT-TY-CMR-01', 'ventilador', 'Ventilador Radiador Toyota Camry 2018-2022', 145.00, 6);
    insertQueryPart.run(sampleQueryId2, 25, 'RAD-HN-CVC-01', 'radiador', 'Radiador Honda Civic 2016-2021 2.0L', 149.99, 12);
    insertQueryPart.run(sampleQueryId2, 26, 'CND-HN-CVC-01', 'condensador', 'Condensador A/C Honda Civic 2016-2021', 109.99, 7);
    insertQueryPart.run(sampleQueryId2, 27, 'VNT-HN-CVC-01', 'ventilador', 'Ventilador Radiador Honda Civic 2016-2021', 125.00, 5);

    console.log('  ✅ 2 sample queries with parts inserted');
    console.log('🎉 Seed complete!');
}

export { vehicles };
