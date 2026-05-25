//carrito.component.ts
import { Component, inject, signal } from '@angular/core';
import { CarritoService } from '../../services/carrito.service';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css',
})
export class CarritoComponent {
  carritoService = inject(CarritoService);
  router = inject(Router);
  authService = inject(AuthService);

  toastVisible = signal(false);
  toastProducto = signal('');
  private toastTimer: any;

  irAlPerfil() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/perfil_usuario']);
    } else {
      this.router.navigate(['/inicio_sesion']);
    }
  }

  eliminarProducto(index: number) {
    this.carritoService.eliminarProducto(index);
  }

  eliminarTipoCompleto(productoId: number) {
    this.carritoService.eliminarProductosPorTipo(productoId);
  }

  incrementar(index: number) {
    const item = this.carritoService.carrito()[index];
    if (item.quantity >= item.product.inStock) {
      this.mostrarToast(item.product.name, item.product.inStock);
      return;
    }
    this.carritoService.incrementarCantidad(index);
  }

  decrementar(index: number) {
    this.carritoService.decrementarCantidad(index);
  }

  mostrarToast(nombreProducto: string, stock: number) {
    this.toastProducto.set(
      `Máximo alcanzado: solo hay ${stock} ${stock === 1 ? 'unidad' : 'unidades'} de "${nombreProducto}"`,
    );
    this.toastVisible.set(true);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toastVisible.set(false), 3000);
  }

  irCheckout() {
    if (this.carritoService.carrito().length === 0) {
      alert('Tu carrito está vacío');
      return;
    }
    this.router.navigate(['/checkout']);
  }

  generarXML() {
    const productos = this.carritoService.carrito();
    let total = 0;
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<recibo>
  <tienda>Papelería Zetec</tienda>
  <fecha>${new Date().toISOString()}</fecha>
  <productos>`;

    productos.forEach((item) => {
      const precio = item.product.price;
      const subtotal = precio * item.quantity;
      total += subtotal;
      xml += `
    <producto>
      <nombre>${item.product.name}</nombre>
      <categoria>${item.product.category}</categoria>
      <precio>${precio}</precio>
      <cantidad>${item.quantity}</cantidad>
      <subtotal>${subtotal}</subtotal>
    </producto>`;
    });

    xml += `
  </productos>
  <subtotal>${total}</subtotal>
  <iva>${this.carritoService.iva()}</iva>
  <total>${this.carritoService.totalConIVA()}</total>
</recibo>`;

    this.descargarXML(xml);
  }

  descargarXML(xml: string) {
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recibo_carrito.xml';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  modalVaciarVisible = false;

  abrirModalVaciar() {
    this.modalVaciarVisible = true;
  }

  confirmarVaciar() {
    this.carritoService.vaciarCarrito();
    this.modalVaciarVisible = false;
  }

  cancelarVaciar() {
    this.modalVaciarVisible = false;
  }
}
