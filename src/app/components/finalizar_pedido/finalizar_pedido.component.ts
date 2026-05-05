//finalizar_pedido.component.ts
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
    guia: '12345ABC',
    direccion: 'Av. Siempre Viva 742',
    telefono: '3312345678'
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
  const data = {
    pedido: this.pedido,
    productos: this.productos
  };

const html = this.receiptService.generateCustomReceiptHTML(data);
  const win = window.open('', '_blank');

  if (win) {
    win.document.open();
    win.document.write(html);
    win.document.close();
  }
}

}