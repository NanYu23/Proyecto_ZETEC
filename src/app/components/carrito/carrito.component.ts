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

  generarXML() {

  const productos = this.carritoService.carrito();

  let total = 0;

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<recibo>
  <tienda>Papelería Zetec</tienda>
  <fecha>${new Date().toISOString()}</fecha>
  <productos>
`;

  productos.forEach(item => {

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
      </producto>
  `;

    });

    xml += `
    </productos>
    <subtotal>${total}</subtotal>
    <iva>${this.carritoService.iva()}</iva>
    <total>${this.carritoService.totalConIVA()}</total>
  </recibo>
  `;

    this.descargarXML(xml);
  }

  descargarXML(xml: string) {

    const blob = new Blob([xml], { type: 'application/xml' });

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = "recibo_carrito.xml";
    a.click();

    window.URL.revokeObjectURL(url);
  }
}