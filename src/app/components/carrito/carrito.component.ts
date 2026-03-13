// carrito.component.ts
import { Component, inject } from '@angular/core';
import { CarritoService } from '../../services/carrito.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css'
})
export class CarritoComponent {
  carritoService = inject(CarritoService);

  eliminarProducto(index: number) {
    this.carritoService.eliminarProducto(index);
  }

  incrementar(index: number) {
    this.carritoService.incrementarCantidad(index);
  }

  decrementar(index: number) {
    this.carritoService.decrementarCantidad(index);
  }
}