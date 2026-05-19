import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { CarritoService } from '../../services/carrito.service';

@Component({
  selector: 'app-panel-administracion',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './panel_administracion.component.html',
  styleUrls: ['./panel_administracion.component.css']
})
export class PanelAdministracionComponent {

  carritoService = inject(CarritoService);

  productos = [
    {
      nombre: 'Descripción del producto',
      precio: 0,
      stock: 0,
      imagen: 'https://via.placeholder.com/150'
    },
    {
      nombre: 'Descripción del producto',
      precio: 0,
      stock: 0,
      imagen: 'https://via.placeholder.com/150'
    },
    {
      nombre: 'Descripción del producto',
      precio: 0,
      stock: 0,
      imagen: 'https://via.placeholder.com/150'
    },
    {
      nombre: 'Descripción del producto',
      precio: 0,
      stock: 0,
      imagen: 'https://via.placeholder.com/150'
    }
  ];

  agregarProducto() {
    alert('Agregar producto');
  }

  administrarCategorias() {
    alert('Administrar categorías');
  }

  editarProducto(producto: any) {
    alert('Editar: ' + producto.nombre);
  }

}