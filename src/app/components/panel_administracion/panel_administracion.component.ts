// panel_administracion.component.ts

import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CarritoService } from '../../services/carrito.service';
import { ProductService } from '../../services/producto.service';
import { AuthService }    from '../../services/auth.service';
import { Product } from '../../models/producto.model';

@Component({
  selector: 'app-panel-administracion',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './panel_administracion.component.html',
  styleUrls: ['./panel_administracion.component.css']
})
export class PanelAdministracionComponent implements OnInit {

  carritoService = inject(CarritoService);
  productService = inject(ProductService);
  authService    = inject(AuthService);
  router         = inject(Router);

  productos = signal<Product[]>([]);

  ngOnInit() {
    this.productService.getAll().subscribe((data) => {
      this.productos.set(data);
    });
  }

  irAlPerfil() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/perfil_usuario']);
    } else {
      this.router.navigate(['/inicio_sesion']);
    }
  }

  agregarProducto() { alert('Agregar producto'); }
  administrarCategorias() { alert('Administrar categorías'); }
}