// finalizar_pedido.component.ts
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CarritoService } from '../../services/carrito.service';
import { ReceiptService, ReceiptData } from '../../services/receipt.service';
import { ReceiptViewComponent } from '../receipt/receipt.component';

@Component({
  selector: 'app-finalizar-pedido',
  standalone: true,
  imports: [RouterModule, ReceiptViewComponent],
  templateUrl: './finalizar_pedido.component.html',
  styleUrls: ['./finalizar_pedido.component.css']
})
export class FinalizarPedidoComponent {

  productos: any[] = [];
  pedido = { guia: '', direccion: '' };

  mostrarRecibo = false;
  datosRecibo?: ReceiptData;

  private receiptService = inject(ReceiptService);
  private http           = inject(HttpClient);
  carritoService         = inject(CarritoService);

  constructor() {
    const nav = history.state;
    if (nav?.pedido)    this.pedido    = nav.pedido;
    if (nav?.productos) this.productos = nav.productos;
  }

  generarDatosRecibo() {
    // Primero obtener datos del usuario desde el backend
    this.http.get<{ user: any }>('http://localhost:3000/api/user/profile').subscribe({
      next: (res) => {
        const user = res.user;

        const items = this.productos.map((item: any) => ({
          name:        item.product.name,
          quantity:    item.quantity,
          unit_amount: { value: item.product.price }
        }));

        const total = items.reduce(
          (acc, item) => acc + (item.unit_amount.value * item.quantity), 0
        );

        this.datosRecibo = {
          orderId:         this.pedido.guia,
          folioFiscal:     '550e8400-e29b-41d4-a716-446655440000',
          createTime:      new Date(),
          lugarExpedicion: '44100',
          receiptType:     'I - Ingreso',
          payerName:       user.username,   
          payerRFC:        'XAXX010101000',
          payerEmail:      user.email,         
          payerAddress:    this.pedido.direccion,
          usoCFDI:         'G03 - Gastos en general',
          formaPago:       '03 - Transferencia electrónica',
          metodoPago:      'PUE - Pago en una sola exhibición',
          regimenFiscal:   '605 - Sueldos y Salarios',
          moneda:          'MXN',
          items,
          amount:          total
        };

        this.mostrarRecibo = true;
        window.scrollTo(0, 0);
      },
      error: () => {
        // Si no hay sesión, usar datos genéricos
        const items = this.productos.map((item: any) => ({
          name:        item.product.name,
          quantity:    item.quantity,
          unit_amount: { value: item.product.price }
        }));

        const total = items.reduce(
          (acc, item) => acc + (item.unit_amount.value * item.quantity), 0
        );

        this.datosRecibo = {
          orderId:         this.pedido.guia,
          folioFiscal:     '550e8400-e29b-41d4-a716-446655440000',
          createTime:      new Date(),
          lugarExpedicion: '44100',
          receiptType:     'I - Ingreso',
          payerName:       'CLIENTE GENERAL',
          payerRFC:        'XAXX010101000',
          payerEmail:      'cliente@correo.com',
          payerAddress:    this.pedido.direccion,
          usoCFDI:         'G03 - Gastos en general',
          formaPago:       '03 - Transferencia electrónica',
          metodoPago:      'PUE - Pago en una sola exhibición',
          regimenFiscal:   '605 - Sueldos y Salarios',
          moneda:          'MXN',
          items,
          amount:          total
        };

        this.mostrarRecibo = true;
        window.scrollTo(0, 0);
      }
    });
  }
}