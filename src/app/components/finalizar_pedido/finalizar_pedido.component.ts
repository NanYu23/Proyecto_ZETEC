// finalizar_pedido.component.ts

import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CarritoService } from '../../services/carrito.service';
import { ReceiptService } from '../../services/receipt.service';

@Component({
  selector: 'app-finalizar-pedido',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './finalizar_pedido.component.html',
  styleUrls: ['./finalizar_pedido.component.css']
})
export class FinalizarPedidoComponent {

  productos: any[] = [];

  private receiptService = inject(ReceiptService);
  carritoService = inject(CarritoService);

  pedido = {
    guia: '',
    direccion: '',
    telefono: ''
  };

  constructor() {
    const nav = history.state;

    if (nav?.pedido) {
      this.pedido = nav.pedido;
    }

    if (nav?.productos) {
      this.productos = nav.productos;
    }
  }

  descargarRecibo() {

    const items = this.productos.map((item: any) => ({
      name: item.product.name,
      quantity: item.quantity,
      unit_amount: {
        value: item.product.price
      }
    }));

    const total = items.reduce(
      (acc: number, item: any) =>
        acc + item.unit_amount.value * item.quantity,
      0
    );

    const receiptData = {
      orderId: this.pedido.guia,
      transactionId: this.pedido.guia,
      status: 'COMPLETADO',
      createTime: new Date(),
      payerName: 'Cliente',
      payerEmail: 'cliente@correo.com',
      shippingAddress: this.pedido.direccion,
      items: items,
      amount: total
    };

    const html = this.receiptService.generateReceiptHTML(receiptData);
    const win = window.open('', '_blank');

    if (win) {
      win.document.open();
      win.document.write(html);

      (win as any).downloadXML = () => {
        this.receiptService.downloadXML(receiptData);
      };

      win.document.close();
    }
  }

}