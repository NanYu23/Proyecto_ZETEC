const db = require('../config/db');

const { 
  createPaypalOrder, 
  capturePaypalOrder, 
  getPaypalOrderDetails 
} = require('../services/paypal.service.js');

/* =========================
   CREAR ORDEN
========================= */
async function createOrder(req, res) {
  try {
    const { items, payerEmail, customerName } = req.body;

    console.log('ITEMS QUE LLEGAN DEL FRONT:', items);

    // Validación
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'El carrito está vacío' 
      });
    }

    // Calcular total
    const subtotal = items.reduce((acc, item) => {
      return acc + (item.precio * item.cantidad);
    }, 0);

    const iva = subtotal * 0.16;
    const total = subtotal + iva;

    // Crear orden en PayPal
    const paypalOrder = await createPaypalOrder({ 
      items,
      payerEmail: payerEmail || 'customer@papeleria-zetec.com'
    });

    console.log('Orden PayPal creada:', paypalOrder.id);

    // Guardar orden en BD
    const [ordenResult] = await db.execute(`
      INSERT INTO ordenes 
      (paypal_order_id, cliente_nombre, cliente_email, total, estado)
      VALUES (?, ?, ?, ?, 'CREATED')
    `, [
      paypalOrder.id,
      customerName || 'Cliente',
      payerEmail || 'cliente@correo.com',
      total.toFixed(2)
    ]);

    const ordenId = ordenResult.insertId;

    // Guardar items
    for (const item of items) {
      await db.execute(`
        INSERT INTO orden_items 
        (orden_id, producto_id, nombre, cantidad, precio_unitario, subtotal)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        ordenId,
        item.id,
        item.nombre,
        item.cantidad,
        item.precio,
        (item.precio * item.cantidad).toFixed(2)
      ]);
    }

    res.status(200).json({
      success: true,
      data: {
        id: paypalOrder.id,
        status: paypalOrder.status,
        links: paypalOrder.links
      }
    });

  } catch (error) {
    console.error('Error en createOrder:', error.message);

    res.status(500).json({
      success: false,
      error: 'No se pudo crear la orden',
      detalle: error.message
    });
  }
}

/* =========================
   CAPTURAR ORDEN
========================= */
async function captureOrder(req, res) {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'orderId es obligatorio'
      });
    }

    // Capturar en PayPal
    const captureData = await capturePaypalOrder(orderId);

    if (captureData.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        error: 'El pago no fue completado',
        status: captureData.status
      });
    }

    console.log('CAPTURE DATA:', JSON.stringify(captureData, null, 2));

    // Buscar orden en BD
    const [ordenRows] = await db.execute(`
      SELECT id FROM ordenes WHERE paypal_order_id = ?
    `, [orderId]);

    if (ordenRows.length === 0) {
      throw new Error('Orden no encontrada en BD');
    }

    const ordenId = ordenRows[0].id;

    // Obtener items reales desde BD
    const [itemsDB] = await db.execute(`
      SELECT producto_id, cantidad, nombre, precio_unitario
      FROM orden_items
      WHERE orden_id = ?
    `, [ordenId]);

    // Descontar stock
    await descontarStock(itemsDB.map(item => ({
      sku: item.producto_id,
      quantity: item.cantidad
    })));

    // Actualizar estado
    await db.execute(`
      UPDATE ordenes 
      SET estado = 'COMPLETED'
      WHERE id = ?
    `, [ordenId]);

    // Datos de pago
    const purchaseUnit = captureData.purchase_units[0];
    const payment = purchaseUnit.payments.captures[0];

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
      items: itemsDB
    };

    res.status(200).json({
      success: true,
      message: 'Pago capturado exitosamente',
      data: receiptData
    });

  } catch (error) {
    console.error('Error en captureOrder:', error.message);

    res.status(500).json({
      success: false,
      error: 'No se pudo capturar la orden',
      detalle: error.message
    });
  }
}

/* =========================
   DETALLES ORDEN (PayPal)
========================= */
async function getOrderDetails(req, res) {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'orderId es requerido'
      });
    }

    const orderDetails = await getPaypalOrderDetails(orderId);

    res.status(200).json({
      success: true,
      data: orderDetails
    });

  } catch (error) {
    console.error('Error en getOrderDetails:', error.message);

    res.status(500).json({
      success: false,
      error: 'No se pudieron obtener los detalles de la orden',
      detalle: error.message
    });
  }
}

/* =========================
   DESCONTAR STOCK
========================= */
async function descontarStock(items) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    for (const item of items) {
      const productId = Number(item.sku);
      const cantidad = Number(item.quantity);

      const [result] = await connection.execute(`
        UPDATE productos
        SET inStock = inStock - ?
        WHERE id = ? AND inStock >= ?
      `, [cantidad, productId, cantidad]);

      if (result.affectedRows === 0) {
        throw new Error(`Stock insuficiente para producto ${productId}`);
      }
    }

    await connection.commit();

  } catch (error) {
    await connection.rollback();
    throw error;

  } finally {
    connection.release();
  }
}

module.exports = {
  createOrder,
  captureOrder,
  getOrderDetails
};