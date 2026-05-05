//historial-pedidos.component.ts

import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CarritoService } from '../../services/carrito.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-historial-pedidos',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './historial_pedidos.component.html',
  styleUrls: ['./historial_pedidos.component.css']
})
export class HistorialPedidosComponent {

  constructor(public carritoService: CarritoService) {}

  pedidos = [
    { precio: 120 },
    { precio: 80 },
    { precio: 45 }
  ];
}