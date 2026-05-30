// paypal.service.js
// Servicio de comunicación con la API de PayPal.

import { paypalConfig } from '../config/paypal.config.js';

//genera el header de autenticación
function getBasicAuth() {
  return Buffer
    .from(`${paypalConfig.clientId}:${paypalConfig.clientSecret}`)
    .toString('base64');
}

export async function getAccessToken() {
  try {
    const response = await fetch(`${paypalConfig.baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${getBasicAuth()}`,  // Credenciales en Base64
        'Content-Type': 'application/x-www-form-urlencoded' // Formato requerido por PayPal
      },
      body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    if (!response.ok) throw new Error(`Error obteniendo access token: ${JSON.stringify(data)}`);

    return data.access_token;
  } catch (error) {
    console.error('Error en getAccessToken:', error);
    throw error;
  }
}

// Registra la intención de cobro en PayPal y obtiene los links de pago
export async function createPaypalOrder(orderData) {
  try {
    const accessToken = await getAccessToken();


     // Asegura que precio y cantidad sean números con exactamente 2 decimales.
    const itemsNormalizados = orderData.items.map(item => {
      const precio   = Number(item.precio);
      const cantidad = Number(item.cantidad);
      return { ...item, precio: Number(precio.toFixed(2)), cantidad, totalItem: Number((precio * cantidad).toFixed(2)) };
    });

    //Calcular totales
    const subtotalCalculado = Number(itemsNormalizados.reduce((acc, item) => acc + item.totalItem, 0).toFixed(2));
    const ivaCalculado      = Number((subtotalCalculado * 0.16).toFixed(2));
    const totalFinal        = Number((subtotalCalculado + ivaCalculado).toFixed(2));

     // Estructura exacta que requiere la API de PayPal
    const body = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'MXN',
          value: totalFinal.toFixed(2),
          breakdown: {  // Desglose requerido cuando se envían items individuales
            item_total: { currency_code: 'MXN', value: subtotalCalculado.toFixed(2) },
            tax_total:  { currency_code: 'MXN', value: ivaCalculado.toFixed(2) }
          }
        },
        items: itemsNormalizados.map(item => ({
          sku:         String(item.id),
          name:        item.nombre,
          quantity:    String(item.cantidad),
          unit_amount: { currency_code: 'MXN', value: item.precio.toFixed(2) }
        }))
      }]
    };

    console.log('BODY QUE SE ENVÍA A PAYPAL:', JSON.stringify(body, null, 2));

    const response = await fetch(`${paypalConfig.baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    if (!response.ok) throw new Error(`Error creando orden PayPal: ${JSON.stringify(data)}`);

     // Devuelve la respuesta completa de PayPal,
    return data;
  } catch (error) {
    console.error('Error en createPaypalOrder:', error);
    throw error;
  }
}

// Se llama después de que el usuario aprobó el pago en PayPal.
export async function capturePaypalOrder(orderId) {
  try {
    const accessToken = await getAccessToken();

    // La URL incluye el orderId y el endpoint /capture
    const response = await fetch(`${paypalConfig.baseUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` }
    });

    const data = await response.json();
    if (!response.ok) throw new Error(`Error capturando orden PayPal: ${JSON.stringify(data)}`);

    // Devuelve los detalles del pago capturado
    return data;
  } catch (error) {
    console.error('Error en capturePaypalOrder:', error);
    throw error;
  }
}

// Consulta el estado actual de una orden en PayPal
export async function getPaypalOrderDetails(orderId) {
  try {
    const accessToken = await getAccessToken();

    const response = await fetch(`${paypalConfig.baseUrl}/v2/checkout/orders/${orderId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` }
    });

    const data = await response.json();
    if (!response.ok) throw new Error(`Error obteniendo detalles de orden: ${JSON.stringify(data)}`);

    return data;
  } catch (error) {
    console.error('Error en getPaypalOrderDetails:', error);
    throw error;
  }
}