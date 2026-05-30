import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
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
  cliente_nombre:  string;
  cliente_email:   string;
  username:        string;
  total:           number;
  moneda:          string;
  estado:          string;
  cancelado:       number;
  direccion:       string;
  fecha_creacion:  string;
  items:           OrdenItem[];
}

@Component({
  selector: 'app-admin-pedidos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin_pedidos.component.html',
  styleUrls: ['./admin_pedidos.component.css']
})
export class AdminPedidosComponent implements OnInit {

  private http    = inject(HttpClient);
  private cdr     = inject(ChangeDetectorRef);
  private router  = inject(Router);
  authService     = inject(AuthService);

  ordenes:  Orden[] = [];
  cargando = true;

  ngOnInit(): void {
    this.cargarOrdenes();
  }

  cargarOrdenes(): void {
    this.http.get<{ orders: Orden[] }>(
      `http://localhost:3000/api/panel/ordenes?t=${Date.now()}`
    ).subscribe({
      next: (res) => {
        this.ordenes = res.orders.map(o => ({
          ...o,
          items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items
        }));
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando pedidos:', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  irAlPerfil() {
    this.router.navigate(['/perfil_usuario']);
  }

  getEstadoLabel(orden: Orden): string {
    if (orden.cancelado === 1) return 'Cancelado';
    if (orden.estado === 'COMPLETED') return 'Completado';
    return 'Pendiente';
  }

  getEstadoClass(orden: Orden): string {
    if (orden.cancelado === 1) return 'estado-cancelado';
    if (orden.estado === 'COMPLETED') return 'estado-completado';
    return 'estado-creado';
  }
}