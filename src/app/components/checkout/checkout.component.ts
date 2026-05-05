// checkout.component.ts

import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CarritoService } from '../../services/carrito.service';
import { PaypalService } from '../../services/paypal.service';
import { enviroment } from '../../../enviroments/enviroment';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  providers: [PaypalService],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent implements OnInit, OnDestroy {
  public carritoService = inject(CarritoService);
  private paypalService = inject(PaypalService);
  private router = inject(Router);

  nombreUsuario = 'Usuario';
  direccion = 'Av. Principal #123, Guadalajara, Jalisco';

  isProcessing = false;
  paymentError = '';

  private destroy$ = new Subject<void>();
  private readonly API_URL = 'http://localhost:3000/api/paypal';

  ngOnInit(): void {
    this.loadPayPalScript();

    this.paypalService
      .getIsProcessing()
      .pipe(takeUntil(this.destroy$))
      .subscribe((processing) => (this.isProcessing = processing));
  }

  private loadPayPalScript(): void {
    if (document.getElementById('paypal-sdk-script')) {
      this.initPayPalButton();
      return;
    }

    const script = document.createElement('script');
    script.id = 'paypal-sdk-script';
    script.src = `https://www.paypal.com/sdk/js?client-id=${enviroment.paypalClientId}&currency=MXN&components=buttons,funding-eligibility`;
    script.async = true;
    script.onload = () => this.initPayPalButton();

    document.body.appendChild(script);
  }

  private initPayPalButton(): void {
    const paypal = (window as any).paypal;
    const container = document.getElementById('paypal-button-container');

    if (!paypal || !container) return;

    container.innerHTML = '';

    const createOrder = async () => {
      this.paymentError = '';

      const items = this.carritoService.carrito().map((item) => ({
        id: item.product.id,
        nombre: item.product.name,
        cantidad: item.quantity,
        precio: item.product.price,
      }));

      const response = await fetch(`${this.API_URL}/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });

      const res = await response.json();

      if (res.success) return res.data.id;

      throw new Error(res.error || 'Error en servidor');
    };

    const onApprove = async (data: any) => {
      try {
        this.isProcessing = true;

        const productosComprados = this.carritoService.carrito();

        const response = await fetch(`${this.API_URL}/capture-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: data.orderID }),
        });

        const capture = await response.json();

        if (capture.success) {

          // 🧠 GUARDAR PEDIDO EN BACKEND
          await fetch('http://localhost:3000/api/pedidos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              guia: data.orderID,
              direccion: this.direccion,
              telefono: '3312345678',
              productos: productosComprados,
              total: productosComprados.reduce(
                (acc, item) => acc + item.product.price * item.quantity,
                0
              ),
            }),
          });

          // 🧹 LIMPIAR CARRITO
          this.carritoService.vaciarCarrito();

          // 🚀 REDIRECCIÓN FINAL
          this.router.navigate(['/finalizar-pedido'], {
            state: {
              pedido: {
                guia: data.orderID,
                direccion: this.direccion,
                telefono: '3312345678',
              },
              productos: productosComprados,
            },
          });

        } else {
          throw new Error(capture.error);
        }

      } catch (error) {
        console.error(error);
        this.paymentError = 'Error al procesar el pago.';
      } finally {
        this.isProcessing = false;
      }
    };

    // BOTÓN PAYPAL
    paypal.Buttons({
      fundingSource: paypal.FUNDING.PAYPAL,
      style: {
        layout: 'vertical',
        color: 'gold',
        shape: 'pill',
        label: 'paypal',
        height: 50,
      },
      createOrder,
      onApprove,
      onError: () => (this.paymentError = 'Error con PayPal'),
    }).render('#paypal-button-container');

    // BOTÓN TARJETA
    paypal.Buttons({
      fundingSource: paypal.FUNDING.CARD,
      style: {
        layout: 'vertical',
        shape: 'pill',
        height: 50,
      },
      createOrder,
      onApprove,
      onError: () => (this.paymentError = 'Error con tarjeta'),
    }).render('#card-button-container');
  }

  goToCatalog() {
    window.location.href = '/catalogo';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}