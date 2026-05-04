// paypal.service.js
const { paypalConfig } = require('../config/paypal.config.js');

// Autorización
function getBasicAuth() {
  return Buffer
    .from(`${paypalConfig.clientId}:${paypalConfig.clientSecret}`)
    .toString('base64');
}

// Obtener Token de Acceso
async function getAccessToken() {
  try {
    const response = await fetch(`${paypalConfig.baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${getBasicAuth()}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Error obteniendo access token: ${JSON.stringify(data)}`);
    }

    return data.access_token;
  } catch (error) {
    console.error('Error en getAccessToken:', error);
    throw error;
  }
}

// Crear orden de pago
async function createPaypalOrder(orderData) {

  try {
    const accessToken = await getAccessToken();

    const itemsNormalizados = orderData.items.map(item => {
      const precio = Number(item.precio);
      const cantidad = Number(item.cantidad);

      const totalItem = Number((precio * cantidad).toFixed(2));

      return {
        ...item,
        precio: Number(precio.toFixed(2)),
        cantidad,
        totalItem
      };
    });

    const subtotalCalculado = Number(
      itemsNormalizados
        .reduce((acc, item) => acc + item.totalItem, 0)
        .toFixed(2)
    );

    const ivaCalculado = Number((subtotalCalculado * 0.16).toFixed(2));
    const totalFinal = Number((subtotalCalculado + ivaCalculado).toFixed(2));

    const body = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'MXN',
          value: totalFinal.toFixed(2),
          breakdown: {
            item_total: {
              currency_code: 'MXN',
              value: subtotalCalculado.toFixed(2)
            },
            tax_total: {
              currency_code: 'MXN',
              value: ivaCalculado.toFixed(2)
            }
          }
        },
        items: itemsNormalizados.map(item => ({
          name: item.nombre,
          quantity: String(item.cantidad),
          unit_amount: {
            currency_code: 'MXN',
            value: item.precio.toFixed(2)
          }
        }))
      }]
    };

    console.log('BODY QUE SE ENVÍA A PAYPAL:');
    console.log(JSON.stringify(body, null, 2));

    const response = await fetch(`${paypalConfig.baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('PayPal API Error:', data);
      throw new Error(`Error creando orden PayPal: ${JSON.stringify(data)}`);
    }

    return data;
  } catch (error) {
    console.error('Error en createPaypalOrder:', error);
    throw error;
  }
}

// Capturar orden de pago
async function capturePaypalOrder(orderId) {
  try {
    const accessToken = await getAccessToken();

    const response = await fetch(
      `${paypalConfig.baseUrl}/v2/checkout/orders/${orderId}/capture`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('PayPal Capture Error:', data);
      throw new Error(`Error capturando orden PayPal: ${JSON.stringify(data)}`);
    }

    return data;
  } catch (error) {
    console.error('Error en capturePaypalOrder:', error);
    throw error;
  }
}

// Obtener detalles de la orden
async function getPaypalOrderDetails(orderId) {
  try {
    const accessToken = await getAccessToken();

    const response = await fetch(
      `${paypalConfig.baseUrl}/v2/checkout/orders/${orderId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Error obteniendo detalles de orden: ${JSON.stringify(data)}`);
    }

    return data;
  } catch (error) {
    console.error('Error en getPaypalOrderDetails:', error);
    throw error;
  }
}

module.exports = {
  getAccessToken,
  createPaypalOrder,
  capturePaypalOrder,
  getPaypalOrderDetails
};