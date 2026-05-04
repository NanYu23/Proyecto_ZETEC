// paypal.controller.js

const { createPaypalOrder, capturePaypalOrder, getPaypalOrderDetails } = require('../services/paypal.service.js');

async function createOrder(req, res) {

  try {

    const { items, payerEmail, shippingAddress, customerName } = req.body;

    // Validar items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'El carrito está vacío' });
    }
    
    // Crear orden en PayPal
    const paypalOrder = await createPaypalOrder({ 
      items, 
      payerEmail: payerEmail || 'customer@papeleria-zetec.com'
    });

    console.log('Orden PayPal creada:', paypalOrder.id);

    res.status(200).json({
      success: true,
      data: {
        id: paypalOrder.id,
        status: paypalOrder.status,
        links: paypalOrder.links // Contiene el link de aprobación
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

async function captureOrder(req, res) {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'orderId es obligatorio'
      });
    }

    // Capturar la orden en PayPal
    const captureData = await capturePaypalOrder(orderId);

    // Verificar que la captura fue exitosa
    if (captureData.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        error: 'El pago no fue completado',
        status: captureData.status
      });
    }

    // Extraer datos útiles de la captura
    const purchaseUnit = captureData.purchase_units[0];
    const payment = purchaseUnit.payments.captures[0];

    const receiptData = {
      orderId: captureData.id,
      transactionId: payment.id,
      status: payment.status,
      amount: payment.amount.value,
      currency: payment.amount.currency_code,
      payerEmail: captureData.payer?.email_address,
      payerName: captureData.payer?.name?.given_name + ' ' + captureData.payer?.name?.surname,
      createTime: captureData.create_time,
      updateTime: captureData.update_time,
      items: purchaseUnit.items
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

module.exports = {
  createOrder,
  captureOrder,
  getOrderDetails
};