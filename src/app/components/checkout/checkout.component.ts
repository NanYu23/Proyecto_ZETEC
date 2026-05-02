// checkout.component.ts

import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CarritoService } from '../../services/carrito.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent {

  carritoService = inject(CarritoService);

  nombreUsuario = 'Usuario';
  direccion = 'Av. Principal #123, Guadalajara, Jalisco';

  realizarPedido() {

    alert('Pedido realizado correctamente ✅');

    this.carritoService.vaciarCarrito();

  }

}