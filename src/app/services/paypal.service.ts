// paypal.service.ts
// Servicio que comunica el frontend con el paypal.controller.js del backend

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { enviroment } from '../../enviroments/enviroment';   // URL base del backend 

// Respuesta de createOrder: contiene el ID de PayPal y los links de pago
export interface PaymentResponse {
  success: boolean;
  data?: {
    id: string;
    status: string;
    links: Array<{ rel: string; href: string }>;
  };
  error?: string;
}

// Respuesta de captureOrder: contiene el recibo completo de la transacción
export interface CaptureResponse {
  success: boolean;
  message?: string;
  data?: {
    orderId: string;
    transactionId: string;
    status: string;
    amount: number;
    currency: string;
    payerEmail: string;
    payerName: string;
    createTime: string;
    updateTime: string;
    items: any[];
  };
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaypalService {

  private apiUrl = `${enviroment.apiUrl}/api/paypal`;
  private paymentStatus$ = new BehaviorSubject<CaptureResponse | null>(null);
  private isProcessing$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {}


  //crear la orden
  createOrder(
    items: any[],
    total: number,
    payerEmail?: string,
    customerName?: string
  ): Observable<PaymentResponse> {
    const payload = {
      items,
      total: Number(total).toFixed(2),  // Asegura 2 decimales antes de enviar
      payerEmail: payerEmail || undefined,
      customerName: customerName || undefined
    };

    return this.http.post<PaymentResponse>(`${this.apiUrl}/create-order`, payload);
  }

  /**
   * Capturar una orden después de que el usuario la apruebe en PayPal
   */
  captureOrder(orderId: string): Observable<CaptureResponse> {
    this.isProcessing$.next(true);
    return this.http.post<CaptureResponse>(`${this.apiUrl}/capture-order`, { orderId });
  }

  /**
   * Obtener detalles de una orden
   */
  getOrderDetails(orderId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/order-details/${orderId}`);
  }

  /**
   * Observable para monitorear el estado del pago
   */
  getPaymentStatus(): Observable<CaptureResponse | null> {
    return this.paymentStatus$.asObservable();
  }

  /**
   * Observable para saber si se está procesando un pago
   */
  getIsProcessing(): Observable<boolean> {
    return this.isProcessing$.asObservable();
  }

  /**
   * Actualizar el estado del pago
   */
  setPaymentStatus(status: CaptureResponse | null): void {
    this.paymentStatus$.next(status);
  }

  /**
   * Finalizar el estado de procesamiento
   */
  finishProcessing(): void {
    this.isProcessing$.next(false);
  }

}