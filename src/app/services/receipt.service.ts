import { Injectable } from '@angular/core';

export interface ReceiptData {
  orderId: string;
  transactionId: string;
  status: string;
  createTime: string | Date;
  payerName: string;
  payerEmail: string;
  shippingAddress?: string;
  items: any[];
  amount: string | number;
}

@Injectable({
  providedIn: 'root'
})
export class ReceiptService {

  constructor() {}

  /* =========================
     HELPERS SEGUROS
  ========================= */

  private formatCurrency(value: number): string {
    return value.toLocaleString('es-MX', {
      style: 'currency',
      currency: 'MXN'
    });
  }

  private safeNumber(value: any): number {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  }

  private formatDate(dateValue: string | Date): string {
    if (!dateValue) return 'Fecha no disponible';

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) return 'Fecha inválida';

    return date.toLocaleString('es-MX', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  }

  /**
   * Normaliza item sin importar si viene de PayPal o BD
   */
  private normalizeItem(item: any) {
    const nombre = item.name || item.nombre || 'Producto';

    const cantidad = this.safeNumber(
      item.quantity ?? item.cantidad ?? 1
    );

    const precioUnitario = this.safeNumber(
      item.unit_amount?.value ??
      item.precio_unitario ??
      item.precio ??
      0
    );

    return {
      nombre,
      cantidad,
      precioUnitario,
      subtotal: cantidad * precioUnitario
    };
  }

  /* =========================
     GENERAR RECIBO
  ========================= */

  generateReceiptXML(receiptData: ReceiptData): string {

    const subtotal = this.safeNumber(receiptData.amount);
    const iva = subtotal * 0.16;
    const total = subtotal + iva;

    const fechaISO = new Date(receiptData.createTime || new Date()).toISOString();

    const itemsXML = (receiptData.items || []).map(item => {
      const normalized = this.normalizeItem(item);

      return `
        <concepto>
          <nombre>${normalized.nombre}</nombre>
          <cantidad>${normalized.cantidad}</cantidad>
          <precioUnitario>${normalized.precioUnitario.toFixed(2)}</precioUnitario>
          <subtotal>${normalized.subtotal.toFixed(2)}</subtotal>
        </concepto>
      `;
    }).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
    <recibo>
      <empresa>Papelería Zetec</empresa>
      <ordenId>${receiptData.orderId}</ordenId>
      <transaccionId>${receiptData.transactionId}</transaccionId>
      <fecha>${fechaISO}</fecha>

      <cliente>
        <nombre>${receiptData.payerName}</nombre>
        <email>${receiptData.payerEmail}</email>
        <direccion>${receiptData.shippingAddress || 'ZMG'}</direccion>
      </cliente>

      <conceptos>
        ${itemsXML}
      </conceptos>

      <totales>
        <subtotal>${subtotal.toFixed(2)}</subtotal>
        <iva>${iva.toFixed(2)}</iva>
        <total>${total.toFixed(2)}</total>
      </totales>
    </recibo>`;
  }

  generateCustomReceiptHTML(data: any): string {

  const productosHTML = data.productos.map((item: any) => `
    <tr>
      <td>${item.product.name}</td>
      <td>${item.quantity}</td>
      <td>$${item.product.price}</td>
    </tr>
  `).join('');

  return `
    <html>
      <head>
        <title>Recibo Zetec</title>
        <style>
          body { font-family: Arial; padding: 20px; }
          h1 { color: #1a6dbf; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          td, th { border: 1px solid #ccc; padding: 8px; text-align: left; }
        </style>
      </head>
      <body>

        <h1>Recibo de compra</h1>

        <p><strong>Guía:</strong> ${data.pedido.guia}</p>
        <p><strong>Dirección:</strong> ${data.pedido.direccion}</p>
        <p><strong>Teléfono:</strong> ${data.pedido.telefono}</p>

        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio</th>
            </tr>
          </thead>
          <tbody>
            ${productosHTML}
          </tbody>
        </table>

      </body>
    </html>
  `;
}

  downloadXML(receiptData: ReceiptData) {
    const xml = this.generateReceiptXML(receiptData);

    const blob = new Blob([xml], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `recibo_${receiptData.orderId}.xml`;
    a.click();

    window.URL.revokeObjectURL(url);
  }

  generateReceiptHTML(receiptData: ReceiptData): string {

    const subtotal = this.safeNumber(receiptData.amount);
    const iva = subtotal * 0.16;
    const total = subtotal + iva;

    const fecha = this.formatDate(receiptData.createTime);

    const normalizedItems = (receiptData.items || []).map(item =>
      this.normalizeItem(item)
    );

    const itemsHTML = normalizedItems.map(item => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px 8px;">${item.nombre}</td>
        <td style="padding: 12px 8px; text-align: center;">${item.cantidad}</td>
        <td style="padding: 12px 8px; text-align: right;">${this.formatCurrency(item.precioUnitario)}</td>
        <td style="padding: 12px 8px; text-align: right;">${this.formatCurrency(item.subtotal)}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Recibo Zetec - ${receiptData.orderId}</title>

        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #333;
            margin: 0;
            padding: 20px;
          }

          .container {
            max-width: 800px;
            margin: auto;
            border: 1px solid #e5e7eb;
            padding: 40px;
            border-radius: 8px;
          }

          .header {
            background: #1a6dbf;
            color: white;
            padding: 30px;
            border-radius: 6px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
          }

          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
          }

          .info-box h3 {
            margin: 0 0 10px;
            color: #1a6dbf;
            font-size: 14px;
            text-transform: uppercase;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          th {
            background: #f9fafb;
            padding: 12px;
            text-align: left;
          }

          .totals {
            margin-left: auto;
            width: 250px;
            margin-top: 20px;
          }

          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
          }

          .total-final {
            font-weight: bold;
            font-size: 20px;
            color: #155a9e;
            border-top: 2px solid #1a6dbf;
            margin-top: 10px;
            padding-top: 10px;
          }

          .footer {
            text-align: center;
            margin-top: 40px;
            font-size: 12px;
            color: #888;
          }

          @media print {
            .no-print { display: none; }
          }
        </style>
      </head>

      <body>

        <div class="no-print" style="text-align:right; margin-bottom:20px;">
          <button onclick="window.downloadXML()"
            style="background:#1a6dbf; color:white; padding:10px; border:none;">
            Descargar XML
          </button>
        </div>

        <div class="container">

          <div class="header">
            <div>
              <h1>Papelería Zetec</h1>
              <span>Comprobante de Pago</span>
            </div>
            <div style="text-align:right;">
              Guadalajara, Jalisco
            </div>
          </div>

          <div class="info-grid">

            <div class="info-box">
              <h3>Detalles del Pedido</h3>
              <p><strong>ID Orden:</strong> ${receiptData.orderId}</p>
              <p><strong>Transacción:</strong> ${receiptData.transactionId}</p>
              <p><strong>Fecha:</strong> ${fecha}</p>
              <p><strong>Estado:</strong> ${receiptData.status}</p>
            </div>

            <div class="info-box">
              <h3>Cliente</h3>
              <p><strong>Nombre:</strong> ${receiptData.payerName}</p>
              <p><strong>Email:</strong> ${receiptData.payerEmail}</p>
              <p><strong>Dirección:</strong> ${receiptData.shippingAddress || 'ZMG - Entrega Local'}</p>
            </div>

          </div>

          <table>
            <thead>
              <tr>
                <th>Descripción</th>
                <th style="text-align:center;">Cant.</th>
                <th style="text-align:right;">Unitario</th>
                <th style="text-align:right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>

          <div class="totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>${this.formatCurrency(subtotal)}</span>
            </div>
            <div class="total-row">
              <span>IVA (16%):</span>
              <span>${this.formatCurrency(iva)}</span>
            </div>
            <div class="total-row total-final">
              <span>Total:</span>
              <span>${this.formatCurrency(total)}</span>
            </div>
          </div>

          <div class="footer">
            <p>Este documento es un comprobante de operación.</p>
            <p>&copy; 2026 Zetec Guadalajara</p>
          </div>

        </div>
      </body>
      </html>
    `;
  }
}