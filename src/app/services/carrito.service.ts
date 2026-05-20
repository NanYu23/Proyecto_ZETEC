//carrito.service.ts

import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

export interface CartItem {
  product:  any;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CarritoService {

  private http        = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl      = 'http://localhost:3000/api/cart';

  // ─── Signal principal ───
  carrito = signal<CartItem[]>([]);

  // ─── Computed signals ───
  subtotal   = computed(() => this.carrito().reduce((acc, i) => acc + i.product.price * i.quantity, 0));
  iva        = computed(() => this.subtotal() * 0.16);
  totalConIVA = computed(() => this.subtotal() + this.iva());

  constructor() {
    if (this.authService.isLoggedIn()) {
      this.cargarDesdeBackend();
    }
  }

  // ─── Cargar desde backend y mapear a la estructura { product, quantity } ───
  cargarDesdeBackend() {
    this.http.get<{ items: any[], total: number }>(this.apiUrl).subscribe({
      next: (res) => {
        const mapped: CartItem[] = res.items.map(item => ({
          product: {
            id:       item.producto_id,
            name:     item.nombre,
            price:    item.precio,
            imageUrl: item.imageUrl,
            inStock:  item.inStock
          },
          quantity: item.cantidad
        }));
        this.carrito.set(mapped);
      },
      error: (err) => console.error('Error cargando carrito:', err)
    });
  }

  // ─── Agregar producto ───
  agregarProducto(producto: any, cantidad: number = 1) {
    const actual = this.carrito();
    const index  = actual.findIndex(i => i.product.id === producto.id);

    if (index >= 0) {
      const actualizado = [...actual];
      actualizado[index] = { ...actualizado[index], quantity: actualizado[index].quantity + cantidad };
      this.carrito.set(actualizado);
    } else {
      this.carrito.set([...actual, { product: producto, quantity: cantidad }]);
    }

    if (this.authService.isLoggedIn()) {
      this.http.post(this.apiUrl, { producto_id: producto.id, cantidad }).subscribe({
        error: (err) => console.error('Error sincronizando carrito:', err)
      });
    }
  }

  // ─── Eliminar por índice ───
  eliminarProducto(index: number) {
    const actual     = this.carrito();
    const productoId = actual[index].product.id;
    this.carrito.set(actual.filter((_, i) => i !== index));

    if (this.authService.isLoggedIn()) {
      this.http.delete(`${this.apiUrl}/${productoId}`).subscribe({
        error: (err) => console.error('Error eliminando del carrito:', err)
      });
    }
  }

  // ─── Eliminar todos los de un tipo ───
  eliminarProductosPorTipo(productoId: number) {
    this.carrito.set(this.carrito().filter(i => i.product.id !== productoId));

    if (this.authService.isLoggedIn()) {
      this.http.delete(`${this.apiUrl}/${productoId}`).subscribe({
        error: (err) => console.error('Error eliminando del carrito:', err)
      });
    }
  }

  // ─── Incrementar cantidad ───
  incrementarCantidad(index: number) {
    const actual     = [...this.carrito()];
    const item       = actual[index];
    const nuevaCantidad = item.quantity + 1;
    actual[index]    = { ...item, quantity: nuevaCantidad };
    this.carrito.set(actual);

    if (this.authService.isLoggedIn()) {
      this.http.put(`${this.apiUrl}/${item.product.id}`, { cantidad: nuevaCantidad }).subscribe({
        error: (err) => console.error('Error actualizando cantidad:', err)
      });
    }
  }

  // ─── Decrementar cantidad ───
  decrementarCantidad(index: number) {
    const actual     = [...this.carrito()];
    const item       = actual[index];
    const nuevaCantidad = item.quantity - 1;

    if (nuevaCantidad <= 0) {
      this.eliminarProducto(index);
      return;
    }

    actual[index] = { ...item, quantity: nuevaCantidad };
    this.carrito.set(actual);

    if (this.authService.isLoggedIn()) {
      this.http.put(`${this.apiUrl}/${item.product.id}`, { cantidad: nuevaCantidad }).subscribe({
        error: (err) => console.error('Error actualizando cantidad:', err)
      });
    }
  }

  // ─── Vaciar carrito ───
  vaciarCarrito() {
    this.carrito.set([]);

    if (this.authService.isLoggedIn()) {
      this.http.delete(this.apiUrl).subscribe({
        error: (err) => console.error('Error vaciando carrito:', err)
      });
    }
  }

  // ─── Métodos auxiliares ───
  obtenerCantidad(): number { return this.carrito().reduce((acc, i) => acc + i.quantity, 0); }

  obtenerCantidadEnCarrito(productoId: number): number {
    const item = this.carrito().find(i => i.product.id === productoId);
    return item ? item.quantity : 0;
  }
}