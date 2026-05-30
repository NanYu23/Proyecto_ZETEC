// Componente Angular del panel de administración para ver todos los pedidos

import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // Navegación entre páginas
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

// Le dice a Angular cómo identificar y configurar este componente
@Component({
  selector: 'app-admin-pedidos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin_pedidos.component.html',
  styleUrls: ['./admin_pedidos.component.css']
})
export class AdminPedidosComponent implements OnInit {

  private http    = inject(HttpClient);
  private cdr     = inject(ChangeDetectorRef);  // Para forzar actualización de la vista manualmente
  private router  = inject(Router);
  authService     = inject(AuthService);

  ordenes:  Orden[] = []; // Lista de órdenes 
  cargando = true;

  ngOnInit(): void {
    this.cargarOrdenes();
  }

  cargarOrdenes(): void {
    // ?t=${Date.now()} agrega un timestamp único a la URL en cada llamada.
    this.http.get<{ orders: Orden[] }>(
      `http://localhost:3000/api/panel/ordenes?t=${Date.now()}`
    ).subscribe({
      next: (res) => {
        this.ordenes = res.orders.map(o => ({
          ...o,
          items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items
        }));
        this.cargando = false;
        this.cdr.detectChanges(); // Fuerza que Angular actualice la vista con los nuevos datos
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

  // Devuelve el texto legible del estado para mostrar en la tabla
  getEstadoLabel(orden: Orden): string {
    if (orden.cancelado === 1) return 'Cancelado';
    if (orden.estado === 'COMPLETED') return 'Completado';
    return 'Pendiente';
  }

   // Devuelve la clase CSS correspondiente al estado para colorear la etiqueta.
  getEstadoClass(orden: Orden): string {
    if (orden.cancelado === 1) return 'estado-cancelado';
    if (orden.estado === 'COMPLETED') return 'estado-completado';
    return 'estado-creado';
  }
}