// receipt.service.ts

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
  amount: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReceiptService {

  constructor() {}

  /**
   * Genera el contenido HTML completo para el recibo
   */
  generateReceiptHTML(receiptData: ReceiptData): string {
    const total = Number(receiptData.amount || 0);
    const subtotal = total / 1.16;
    const iva = total - subtotal;
    const fecha = new Date(receiptData.createTime).toLocaleString('es-MX');

    const itemsHTML = (receiptData.items || []).map((item: any) => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px 8px;">${item.name || item.nombre || 'Producto'}</td>
        <td style="padding: 12px 8px; text-align: center;">${item.quantity || item.cantidad || 1}</td>
        <td style="padding: 12px 8px; text-align: right;">$${Number(item.unit_amount?.value || item.precio || 0).toFixed(2)}</td>
        <td style="padding: 12px 8px; text-align: right;">$${(Number(item.unit_amount?.value || item.precio || 0) * Number(item.quantity || item.cantidad || 1)).toFixed(2)}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Recibo Zetec - ${receiptData.orderId}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 20px; }
          .container { max-width: 800px; margin: auto; border: 1px solid #e5e7eb; padding: 40px; border-radius: 8px; }
          .header { background: #1a6dbf; color: white; padding: 30px; border-radius: 6px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
          .info-box h3 { margin-top: 0; color: #1a6dbf; border-bottom: 2px solid #f3f4f6; padding-bottom: 5px; font-size: 14px; text-transform: uppercase; }
          .info-box p { margin: 4px 0; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { background: #f9fafb; text-align: left; padding: 12px 8px; font-size: 13px; color: #6b7280; text-transform: uppercase; }
          .totals { margin-left: auto; width: 250px; }
          .total-row { display: flex; justify-content: space-between; padding: 5px 0; }
          .total-final { font-size: 20px; font-weight: bold; color: #155a9e; border-top: 2px solid #1a6dbf; margin-top: 10px; padding-top: 10px; }
          .footer { text-align: center; margin-top: 50px; color: #9ca3af; font-size: 12px; }
          @media print {
            .no-print { display: none; }
            body { padding: 0; }
            .container { border: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="text-align: right; margin-bottom: 20px;">
          <button onclick="window.print()" style="background: #1a6dbf; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">Imprimir o Guardar PDF</button>
        </div>
        <div class="container">
          <div class="header">
            <div>
              <h1>Papelería Zetec</h1>
              <span>Comprobante de Pago Electrónico</span>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 0.8em; opacity: 0.9;">Guadalajara, Jalisco</div>
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
                <th style="text-align: center;">Cant.</th>
                <th style="text-align: right;">Unitario</th>
                <th style="text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>${itemsHTML}</tbody>
          </table>

          <div class="totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>$${subtotal.toFixed(2)}</span>
            </div>
            <div class="total-row">
              <span>IVA (16%):</span>
              <span>$${iva.toFixed(2)}</span>
            </div>
            <div class="total-row total-final">
              <span>Total:</span>
              <span>$${total.toFixed(2)} MXN</span>
            </div>
          </div>

          <div class="footer">
            <p>Este documento es un comprobante de operación. Para facturación fiscal, por favor contáctenos con su ID de orden.</p>
            <p>&copy; 2026 Zetec Guadalajara - Estudiante de Ingeniería de Sistemas</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}