//historial_pedidos.component.ts
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CarritoService } from '../../services/carrito.service';
import { AuthService } from '../../services/auth.service';

interface OrdenItem {
  producto_id:     number;
  nombre:          string;
  cantidad:        number;
  precio_unitario: number;
  subtotal:        number;
}

interface Orden {
  id:              number;
  paypal_order_id: string;
  total:           number;
  moneda:          string;
  estado:          string;
  direccion:       string;
  fecha_creacion:  string;
  items:           OrdenItem[];
}

@Component({
  selector: 'app-historial-pedidos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './historial_pedidos.component.html',
  styleUrls: ['./historial_pedidos.component.css']
})
export class HistorialPedidosComponent implements OnInit {

  carritoService = inject(CarritoService);
  private http   = inject(HttpClient);
  private cdr    = inject(ChangeDetectorRef);
  router = inject(Router);
  authService = inject(AuthService);
  
  ordenes: Orden[] = [];
  cargando = true;

  irAlPerfil() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/perfil_usuario']);
    } else {
      this.router.navigate(['/inicio_sesion']);
    }
  }

  ngOnInit(): void {
    this.http.get<{ orders: Orden[] }>(
      `http://localhost:3000/api/user/orders?t=${Date.now()}`
    ).subscribe({
      next: (res) => {
        this.ordenes = res.orders.map(o => ({
          ...o,
          items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items
        }));
        this.cargando = false;
        this.cdr.detectChanges(); // 
      },
      error: (err) => {
        console.error('Error cargando historial:', err);
        this.cargando = false;
        this.cdr.detectChanges(); //
      }
    });
  }
}