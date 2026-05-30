// paypal.controller.js
// Controlador de pagos con PayPal (flujo de compra)

import { verifyToken } from '../middleware/auth.middleware.js';
import db from '../config/db.js';
import {
  createPaypalOrder,
  capturePaypalOrder,
  getPaypalOrderDetails,
} from '../services/paypal.service.js';
import { enviarConfirmacionPedido } from '../services/email.service.js';

//Crea la orden tanto en PayPal como en la base de datos local
export async function createOrder(req, res) {
  try {
    const { items, customerName, direccion } = req.body;

    // Intenta obtener el email real del usuario autenticado.
    let payerEmail = 'cliente@correo.com';
    if (req.user?.id) {
      const [userRows] = await db.query('SELECT email FROM users WHERE id = ?', [req.user.id]);
      if (userRows.length > 0) payerEmail = userRows[0].email;
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'El carrito está vacío' });
    }

    // Calcula subtotal, IVA (16%) y total a pagar
    const subtotal = items.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
    const iva      = subtotal * 0.16;
    const total    = subtotal + iva;

    // Buscar orden CREATED existente
    // Esto evita crear órdenes duplicadas si el usuario va y vuelve al checkout.
    const [existingOrders] = await db.execute(
      `SELECT id, paypal_order_id FROM ordenes 
       WHERE cliente_email = ? AND estado = 'CREATED' AND cancelado = 0
       ORDER BY fecha_creacion DESC LIMIT 1`,
      [payerEmail]
    );

    if (existingOrders.length > 0) {
      const ordenExistenteId = existingOrders[0].id;

       // Recupera los items guardados en esa orden anterior
      const [itemsExistentes] = await db.execute(
        'SELECT producto_id, cantidad FROM orden_items WHERE orden_id = ?',
        [ordenExistenteId]
      );

      // Compara si el carrito actual es idéntico al de la orden existente.
      const mismoCarrito =
        itemsExistentes.length === items.length &&
        items.every(item =>
          itemsExistentes.some(
            ei => ei.producto_id === item.id && ei.cantidad === item.cantidad
          )
        );

      if (mismoCarrito) {
        // Solo actualizar dirección
        await db.execute(
          'UPDATE ordenes SET direccion = ?, total = ? WHERE id = ?',
          [direccion || 'Recolección física en tienda', total.toFixed(2), ordenExistenteId]
        );

        return res.status(200).json({
          success: true,
          data: { id: existingOrders[0].paypal_order_id } // Devuelve el ID de PayPal existente
        });
      } else {
        // Carrito cambió — cancelar la anterior y crear nueva
        await db.execute(
          'UPDATE ordenes SET cancelado = 1 WHERE id = ?',
          [ordenExistenteId]
        );
      }
    }

    // Crear nueva orden en PayPal y BD
    const paypalOrder = await createPaypalOrder({
      items,
      payerEmail: payerEmail || 'customer@papeleria-zetec.com',
    });

    // Guarda la orden en la base de datos local con estado 'CREATED'
    const [ordenResult] = await db.execute(
      `INSERT INTO ordenes (paypal_order_id, cliente_nombre, cliente_email, total, estado, direccion)
       VALUES (?, ?, ?, ?, 'CREATED', ?)`,
      [paypalOrder.id, customerName || 'Cliente', payerEmail, total.toFixed(2), direccion || 'Recolección física en tienda']
    );

    const ordenId = ordenResult.insertId;

    //Guarda cada producto de la orden en orden_items (detalle de la compra)
    for (const item of items) {
      await db.execute(
        `INSERT INTO orden_items (orden_id, producto_id, nombre, cantidad, precio_unitario, subtotal)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [ordenId, item.id, item.nombre, item.cantidad, item.precio, (item.precio * item.cantidad).toFixed(2)]
      );
    }

     // Devuelve el ID de PayPal y los links; el frontend usará uno de esos links
    res.status(200).json({
      success: true,
      data: { id: paypalOrder.id, status: paypalOrder.status, links: paypalOrder.links },
    });

  } catch (error) {
    console.error('Error en createOrder:', error.message);
    res.status(500).json({ success: false, error: 'No se pudo crear la orden', detalle: error.message });
  }
}

//Confirma el cobro, descuenta stock y envía correo de confirmación.
export async function captureOrder(req, res) {
  try {
    const { orderId } = req.body; // ID de la orden en PayPal (no el ID local)

    if (!orderId) {
      return res.status(400).json({ success: false, error: 'orderId es obligatorio' });
    }

    // Confirma el pago con PayPal; si el usuario no aprobó, esto fallará
    const captureData = await capturePaypalOrder(orderId);

    // Si el estado no es COMPLETED, el pago no se procesó correctamente
    if (captureData.status !== 'COMPLETED') {
      return res
        .status(400)
        .json({ success: false, error: 'El pago no fue completado', status: captureData.status });
    }

    console.log('CAPTURE DATA:', JSON.stringify(captureData, null, 2));

    // Busca la orden local usando el ID de PayPal como referencia
    const [ordenRows] = await db.execute(
      'SELECT id, direccion FROM ordenes WHERE paypal_order_id = ?',
      [orderId],
    );

    if (ordenRows.length === 0) throw new Error('Orden no encontrada en BD');

    const ordenId = ordenRows[0].id;
    const direccion = ordenRows[0].direccion;

    // Obtiene los items de la orden para descontar stock y enviar el correo
    const [itemsDB] = await db.execute(
      'SELECT producto_id, cantidad, nombre, precio_unitario, subtotal FROM orden_items WHERE orden_id = ?',
      [ordenId],
    );

    // Descuenta el stock de cada producto comprado 
    await descontarStock(
      itemsDB.map((item) => ({ sku: item.producto_id, quantity: item.cantidad })),
    );

    // Marca la orden como completada en la base de datos
    await db.execute("UPDATE ordenes SET estado = 'COMPLETED' WHERE id = ?", [ordenId]);

    // Extrae datos del pago desde la respuesta de PayPal
    const purchaseUnit = captureData.purchase_units[0];
    const payment = purchaseUnit.payments.captures[0];

    const [ordenCompleta] = await db.execute('SELECT cliente_nombre FROM ordenes WHERE id = ?', [
      ordenId,
    ]);

    console.log('ordenCompleta:', ordenCompleta);

    if (ordenCompleta.length > 0) {
      const userId = ordenCompleta[0].cliente_nombre;
      console.log('userId para buscar:', userId);

      const [userRows] = await db.execute('SELECT email, username FROM users WHERE id = ?', [
        userId,
      ]);

      console.log('userRows encontrados:', userRows);

      if (userRows.length > 0) {
        try {
          // Envía el correo de confirmación con el resumen del pedido.
          await enviarConfirmacionPedido({
            email: userRows[0].email,
            nombre: userRows[0].username,
            orderId: captureData.id,
            items: itemsDB,
            total: payment.amount.value,
            direccion: ordenRows[0]?.direccion,
          });
          console.log('Correo enviado exitosamente'); 
        } catch (emailErr) {
          console.error('Error enviando correo:', emailErr);
        }
      }
    }

    // Arma el objeto recibo con todos los datos relevantes de la transacción
    const receiptData = {
      orderId: captureData.id,
      transactionId: payment.id,
      status: payment.status,
      amount: payment.amount.value,
      currency: payment.amount.currency_code,
      payerEmail: captureData.payer?.email_address,
      payerName: `${captureData.payer?.name?.given_name || ''} ${captureData.payer?.name?.surname || ''}`,
      createTime: captureData.create_time || captureData.update_time || new Date().toISOString(),
      updateTime: captureData.update_time,
      items: itemsDB,
    };

    res
      .status(200)
      .json({ success: true, message: 'Pago capturado exitosamente', data: receiptData });
  } catch (error) {
    console.error('Error en captureOrder:', error.message);
    res
      .status(500)
      .json({ success: false, error: 'No se pudo capturar la orden', detalle: error.message });
  }
}

// Consulta el estado actual de una orden directamente en PayPal
export async function getOrderDetails(req, res) {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ success: false, error: 'orderId es requerido' });
    }

    // Delega completamente a paypal.service.js; este controlador solo es un puente
    const orderDetails = await getPaypalOrderDetails(orderId);
    res.status(200).json({ success: true, data: orderDetails });
  } catch (error) {
    console.error('Error en getOrderDetails:', error.message);
    res.status(500).json({
      success: false,
      error: 'No se pudieron obtener los detalles de la orden',
      detalle: error.message,
    });
  }
}

//Reduce el inventario de cada producto comprado 
async function descontarStock(items) {
  // Obtiene una conexión dedicada del pool para manejar la transacción
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    for (const item of items) {
      const productId = Number(item.sku);
      const cantidad = Number(item.quantity);

      // Descuenta el stock solo si hay suficiente (inStock >= cantidad).
      const [result] = await connection.execute(
        'UPDATE productos SET inStock = inStock - ? WHERE id = ? AND inStock >= ?',
        [cantidad, productId, cantidad],
      );

       // affectedRows = 0 significa que no había suficiente stock 
      if (result.affectedRows === 0) {
        throw new Error(`Stock insuficiente para producto ${productId}`);
      }
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();  // Algo falló: revierte TODOS los cambios del bucle
    throw error;
  } finally {
    connection.release();
  }
}
