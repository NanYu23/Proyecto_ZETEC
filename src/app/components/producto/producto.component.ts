//producto.component.ts
import { Component, Input, inject } from '@angular/core';
import { Product } from '../../models/producto.model';
import { CarritoService } from '../../services/carrito.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  templateUrl: './producto.component.html',
  styleUrl: './producto.component.css'
})
export class ProductCardComponent {

  @Input() product!: Product;

  private carritoService = inject(CarritoService);

  quantity: number = 1;

  increase() {
    if (this.quantity < this.product.inStock) {
      this.quantity++;
    }
  }

  decrease() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart() {

    if (this.quantity > this.product.inStock) {
      alert("No hay suficiente stock");
      return;
    }

    for (let i = 0; i < this.quantity; i++) {
      this.carritoService.agregarProducto(this.product);
    }
  }

}