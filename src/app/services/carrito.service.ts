import { Injectable, signal } from '@angular/core';
import { Product } from '../models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {

  carrito = signal<Product[]>([]);

  agregarProducto(producto: Product) {
    this.carrito.update(items => [...items, producto]);
  }

  eliminarProducto(index: number) {
    this.carrito.update(items => {
      const nuevo = [...items];
      nuevo.splice(index, 1);
      return nuevo;
    });
  }

  obtenerCantidad() {
    return this.carrito().length;
  }

}