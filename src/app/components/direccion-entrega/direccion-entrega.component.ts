// direccion-entrega.component.ts

import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CarritoService } from '../../services/carrito.service';

@Component({
  selector: 'app-direccion-entrega',
  standalone: true,
  imports: [
    FormsModule,
    RouterModule
  ],
  templateUrl: './direccion-entrega.component.html',
  styleUrls: ['./direccion-entrega.component.css']
})
export class DireccionEntregaComponent {

  carritoService = inject(CarritoService);

  seleccion: string = 'recoleccion';

  nuevaDireccion: string = '';
  nuevoTelefono: string = '';

  usarDireccion() {
    alert('Dirección seleccionada: ' + this.seleccion);
  }

  agregarDireccion() {

    if (!this.nuevaDireccion || !this.nuevoTelefono) {
      alert('Completa los campos');
      return;
    }

    alert('Nueva dirección agregada');

    this.nuevaDireccion = '';
    this.nuevoTelefono = '';
  }

}