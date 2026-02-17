export function formatPartsEmail(vehicle, parts, customerName) {
    const subject = `🔧 U-FACTORY RADIATORS — Resultados para ${vehicle.year} ${vehicle.make} ${vehicle.model}`;

    const typeEmoji = { radiador: '🔴', condensador: '❄️', ventilador: '🌀' };
    const typeName = { radiador: 'Radiador', condensador: 'Condensador', ventilador: 'Ventilador' };

    let partsHtml = '';
    let partsText = '';

    if (parts.length === 0) {
        partsHtml = '<p style="color:#f59e0b;font-size:16px;">⚠️ No encontramos piezas disponibles para tu vehículo en este momento.</p>';
        partsText = '⚠️ No encontramos piezas disponibles para tu vehículo en este momento.\n';
    } else {
        const total = parts.reduce((sum, p) => sum + p.price, 0);

        partsHtml = parts.map(part => {
            const emoji = typeEmoji[part.type] || '🔩';
            const name = typeName[part.type] || part.type;
            const stock = part.stock_qty > 0
                ? `<span style="color:#22c55e;">✅ En stock (${part.stock_qty} uds)</span>`
                : `<span style="color:#ef4444;">❌ Agotado</span>`;

            return `
        <tr style="border-bottom:1px solid #333;">
          <td style="padding:12px;color:#f1f5f9;">${emoji} <strong>${name}</strong><br><small style="color:#94a3b8;">${part.description}</small></td>
          <td style="padding:12px;color:#94a3b8;">${part.part_number}</td>
          <td style="padding:12px;color:#f59e0b;font-weight:bold;">$${part.price.toFixed(2)}</td>
          <td style="padding:12px;">${stock}</td>
        </tr>`;
        }).join('');

        partsHtml = `
      <table style="width:100%;border-collapse:collapse;margin:20px 0;">
        <tr style="background:#1e293b;">
          <th style="padding:12px;text-align:left;color:#f59e0b;">Pieza</th>
          <th style="padding:12px;text-align:left;color:#f59e0b;">Ref.</th>
          <th style="padding:12px;text-align:left;color:#f59e0b;">Precio</th>
          <th style="padding:12px;text-align:left;color:#f59e0b;">Estado</th>
        </tr>
        ${partsHtml}
      </table>
      <p style="text-align:right;font-size:18px;color:#f59e0b;font-weight:bold;">💵 Paquete completo: $${total.toFixed(2)}</p>`;

        partsText = parts.map(part => {
            const name = typeName[part.type] || part.type;
            const stock = part.stock_qty > 0 ? `En stock (${part.stock_qty})` : 'Agotado';
            return `• ${name}: ${part.description} | Ref: ${part.part_number} | $${part.price.toFixed(2)} | ${stock}`;
        }).join('\n');
        partsText += `\n\nPaquete completo: $${total.toFixed(2)}`;
    }

    const html = `
    <div style="max-width:600px;margin:0 auto;background:#0f172a;color:#f1f5f9;font-family:Arial,sans-serif;border-radius:12px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:24px;text-align:center;">
        <h1 style="margin:0;color:#fff;font-size:24px;">🔧 U-FACTORY RADIATORS</h1>
      </div>
      <div style="padding:24px;">
        <p style="font-size:16px;">¡Hola${customerName ? ` ${customerName}` : ''}! 👋</p>
        <p>Aquí están los resultados de tu consulta VIN:</p>

        <div style="background:#1e293b;border-radius:8px;padding:16px;margin:16px 0;">
          <h3 style="color:#f59e0b;margin-top:0;">🚗 Vehículo Identificado</h3>
          <table style="width:100%;">
            <tr><td style="padding:4px 8px;color:#94a3b8;">Marca:</td><td style="padding:4px 8px;color:#f1f5f9;font-weight:bold;">${vehicle.make}</td></tr>
            <tr><td style="padding:4px 8px;color:#94a3b8;">Modelo:</td><td style="padding:4px 8px;color:#f1f5f9;font-weight:bold;">${vehicle.model}</td></tr>
            <tr><td style="padding:4px 8px;color:#94a3b8;">Año:</td><td style="padding:4px 8px;color:#f1f5f9;font-weight:bold;">${vehicle.year}</td></tr>
            <tr><td style="padding:4px 8px;color:#94a3b8;">Motor:</td><td style="padding:4px 8px;color:#f1f5f9;font-weight:bold;">${vehicle.engine}</td></tr>
            ${vehicle.trim ? `<tr><td style="padding:4px 8px;color:#94a3b8;">Versión:</td><td style="padding:4px 8px;color:#f1f5f9;font-weight:bold;">${vehicle.trim}</td></tr>` : ''}
          </table>
        </div>

        <h3 style="color:#f59e0b;">📦 Piezas Disponibles (${parts.length})</h3>
        ${partsHtml}
      </div>
      <div style="background:#1e293b;padding:20px;text-align:center;font-size:13px;color:#94a3b8;">
        <p style="margin:4px 0;">📍 4495 NW 37th Ave, Miami, FL 33142</p>
        <p style="margin:4px 0;">📞 (305) 634-9637</p>
        <p style="margin:4px 0;">🕐 Lun-Vie 8AM-6PM | Sáb 8AM-3PM</p>
        <p style="margin:4px 0;">🌐 radiadorsflorida.com</p>
        <p style="margin:8px 0;color:#f59e0b;">¡Gracias por preferirnos! 🙏</p>
      </div>
    </div>`;

    const text = `U-FACTORY RADIATORS
━━━━━━━━━━━━━━━━━━━━━
¡Hola${customerName ? ` ${customerName}` : ''}!

Vehículo: ${vehicle.year} ${vehicle.make} ${vehicle.model} - ${vehicle.engine}

Piezas Disponibles (${parts.length}):
${partsText}

━━━━━━━━━━━━━━━━━━━━━
U-FACTORY RADIATORS
4495 NW 37th Ave, Miami, FL 33142
(305) 634-9637
Lun-Vie 8AM-6PM | Sáb 8AM-3PM
¡Gracias por preferirnos!`;

    return { subject, html, text };
}

export function formatErrorEmail(error, customerName) {
    const subject = '🔧 U-FACTORY RADIATORS — Resultado de tu consulta VIN';

    const html = `
    <div style="max-width:600px;margin:0 auto;background:#0f172a;color:#f1f5f9;font-family:Arial,sans-serif;border-radius:12px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:24px;text-align:center;">
        <h1 style="margin:0;color:#fff;font-size:24px;">🔧 U-FACTORY RADIATORS</h1>
      </div>
      <div style="padding:24px;">
        <p style="font-size:16px;">Hola${customerName ? ` ${customerName}` : ''} 👋</p>
        <div style="background:#7f1d1d;border:1px solid #ef4444;border-radius:8px;padding:16px;margin:16px 0;">
          <p style="color:#fca5a5;margin:0;">⚠️ ${error}</p>
        </div>
        <p>Si necesitas ayuda, contáctanos:</p>
        <p>📞 (305) 634-9637</p>
        <p>📍 4495 NW 37th Ave, Miami, FL 33142</p>
      </div>
    </div>`;

    const text = `U-FACTORY RADIATORS\n━━━━━━━━━━━━━━━━━━━━━\nHola${customerName ? ` ${customerName}` : ''}\n\n⚠️ ${error}\n\nContáctanos: (305) 634-9637\n4495 NW 37th Ave, Miami, FL 33142`;

    return { subject, html, text };
}
