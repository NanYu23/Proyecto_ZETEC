// receipt.service.ts
import { Injectable } from '@angular/core';

export interface ReceiptData {
  // Datos Factura
  orderId: string; // Número de factura
  folioFiscal: string; // UUID
  createTime: string | Date;
  lugarExpedicion: string; // CP
  receiptType: string; // I, E, P...

  // Datos Cliente
  payerName: string;
  payerEmail: string;
  payerRFC: string;
  payerAddress: string;
  usoCFDI: string;

  // Pie de Factura
  formaPago: string; // 01, 03, 04...
  metodoPago: string; // PUE o PPD
  regimenFiscal: string;
  moneda: string;
  ctaBancaria?: string;

  items: any[];
  amount: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReceiptService {
  constructor() {}
}