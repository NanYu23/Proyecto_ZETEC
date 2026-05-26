import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',  // Mailtrap
    port: 2525,
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS
    }
});

export const enviarConfirmacionPedido = async ({ email, nombre, orderId, items, total, direccion }) => {
    const itemsHTML = items.map(item => `
        <tr>
            <td style="padding:8px; border-bottom:1px solid #eee;">${item.nombre}</td>
            <td style="padding:8px; border-bottom:1px solid #eee; text-align:center;">${item.cantidad}</td>
            <td style="padding:8px; border-bottom:1px solid #eee; text-align:right;">$${Number(item.precio_unitario).toFixed(2)}</td>
            <td style="padding:8px; border-bottom:1px solid #eee; text-align:right;">$${Number(item.subtotal).toFixed(2)}</td>
        </tr>
    `).join('');

    const subtotal = total / 1.16;
    const iva      = total - subtotal;

    const html = `
        <div style="font-family:Arial,sans-serif; max-width:600px; margin:0 auto;">
            <div style="background:#1a6dbf; padding:24px; text-align:center;">
                <h1 style="color:white; margin:0;">Papelería Zetec</h1>
                <p style="color:rgba(255,255,255,0.85); margin:4px 0 0;">Confirmación de pedido</p>
            </div>

            <div style="padding:24px;">
                <p>Hola <strong>${nombre}</strong>,</p>
                <p>Tu pedido ha sido confirmado. Aquí está el resumen:</p>

                <div style="background:#f0f7ff; border-radius:8px; padding:16px; margin:16px 0;">
                    <p style="margin:0;"><strong>Pedido:</strong> ${orderId}</p>
                    <p style="margin:4px 0 0;"><strong>Dirección:</strong> ${direccion || 'Recolección física en tienda'}</p>
                </div>

                <table style="width:100%; border-collapse:collapse; margin:16px 0;">
                    <thead>
                        <tr style="background:#f9fafb;">
                            <th style="padding:10px 8px; text-align:left; font-size:13px; color:#6b7280;">PRODUCTO</th>
                            <th style="padding:10px 8px; text-align:center; font-size:13px; color:#6b7280;">CANT.</th>
                            <th style="padding:10px 8px; text-align:right; font-size:13px; color:#6b7280;">PRECIO</th>
                            <th style="padding:10px 8px; text-align:right; font-size:13px; color:#6b7280;">SUBTOTAL</th>
                        </tr>
                    </thead>
                    <tbody>${itemsHTML}</tbody>
                </table>

                <div style="text-align:right; padding:8px 0;">
                    <p style="margin:4px 0; color:#6b7280;">Subtotal: $${subtotal.toFixed(2)} MXN</p>
                    <p style="margin:4px 0; color:#6b7280;">IVA (16%): $${iva.toFixed(2)} MXN</p>
                    <p style="margin:4px 0; font-size:18px; font-weight:700; color:#1a6dbf;">
                        Total: $${Number(total).toFixed(2)} MXN
                    </p>
                </div>

                <p style="color:#6b7280; font-size:13px; margin-top:24px;">
                    Gracias por tu compra. Si tienes alguna duda, contáctanos en contacto@zetec.com.mx
                </p>
            </div>

            <div style="background:#f9fafb; padding:16px; text-align:center; font-size:12px; color:#9ca3af;">
                ZETEC S.A. DE C.V. | Guadalajara, Jalisco, México
            </div>
        </div>
    `;

    await transporter.sendMail({
        from:    `"Papelería Zetec" <${process.env.MAILTRAP_USER}>`,
        to:      email,
        subject: `✅ Confirmación de pedido #${orderId}`,
        html
    });
};