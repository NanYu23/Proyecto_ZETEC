import { Component, inject } from '@angular/core';
import { CarritoService } from '../../services/carrito.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  templateUrl: './carrito.component.html'
})
export class CarritoComponent {

  carritoService = inject(CarritoService);

  eliminarProducto(index: number) {
    this.carritoService.eliminarProducto(index);
  }
}