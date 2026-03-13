// carrito.service.ts
import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../models/producto.model';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarritoService {

  carrito = signal<CartItem[]>([]);

  // ✅ Total calculado automáticamente cuando cambia el carrito
  total = computed(() =>
    this.carrito().reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  );

  // ✅ Agrega producto con cantidad; si ya existe, suma la cantidad
  agregarProducto(producto: Product, cantidad: number = 1) {
    this.carrito.update(items => {
      const existente = items.findIndex(i => i.product.id === producto.id);
      if (existente >= 0) {
        const nuevo = [...items];
        nuevo[existente] = {
          ...nuevo[existente],
          quantity: nuevo[existente].quantity + cantidad
        };
        return nuevo;
      }
      return [...items, { product: producto, quantity: cantidad }];
    });
  }

  eliminarProducto(index: number) {
    this.carrito.update(items => {
      const nuevo = [...items];
      nuevo.splice(index, 1);
      return nuevo;
    });
  }

  incrementarCantidad(index: number) {
    this.carrito.update(items => {
      const nuevo = [...items];
      nuevo[index] = { ...nuevo[index], quantity: nuevo[index].quantity + 1 };
      return nuevo;
    });
  }

  decrementarCantidad(index: number) {
    this.carrito.update(items => {
      const nuevo = [...items];
      if (nuevo[index].quantity > 1) {
        nuevo[index] = { ...nuevo[index], quantity: nuevo[index].quantity - 1 };
      }
      return nuevo;
    });
  }

  obtenerCantidad() {
    return this.carrito().reduce((sum, item) => sum + item.quantity, 0);
  }
}