//producto.component.ts
import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { Product } from '../../models/producto.model';
import { CarritoService } from '../../services/carrito.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [],
  templateUrl: './producto.component.html',
  styleUrl: './producto.component.css',
})
export class ProductCardComponent {
  showToast = false;

  @Input() product!: Product;
  @Output() stockSuperado = new EventEmitter<Product>();

  private carritoService = inject(CarritoService);
  quantity: number = 1;

  get cantidadEnCarrito(): number {
    return this.carritoService.obtenerCantidadEnCarrito(this.product.id);
  }

  get stockDisponible(): number {
    return this.product.inStock - this.cantidadEnCarrito;
  }

  increase() {
    if (this.quantity < this.stockDisponible) this.quantity++;
  }

  decrease() {
    if (this.quantity > 1) this.quantity--;
  }

  addToCart() {
    if (
      this.cantidadEnCarrito >= this.product.inStock ||
      this.cantidadEnCarrito + this.quantity > this.product.inStock
    ) {
      this.stockSuperado.emit(this.product);
      return;
    }
    this.carritoService.agregarProducto(this.product, this.quantity);
    this.quantity = 1;

    this.showToast = true;
    setTimeout(() => (this.showToast = false), 2500);
  }
}