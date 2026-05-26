import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CarritoService } from '../../services/carrito.service';
import { ProductService } from '../../services/producto.service';
import { AuthService }    from '../../services/auth.service';
import { Product }        from '../../models/producto.model';

@Component({
  selector: 'app-panel-administracion',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './panel_administracion.component.html',
  styleUrls: ['./panel_administracion.component.css'],
})
export class PanelAdministracionComponent implements OnInit {

  carritoService = inject(CarritoService);
  productService = inject(ProductService);
  authService    = inject(AuthService);
  router         = inject(Router);
  http           = inject(HttpClient);

  productos = signal<Product[]>([]);

  // Modal eliminar
  modalEliminarVisible  = false;
  productoAEliminar: Product | null = null;

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.productService.getAll().subscribe((data) => {
      this.productos.set(data);
    });
  }

  irAlPerfil() {
    this.authService.isLoggedIn()
      ? this.router.navigate(['/perfil_usuario'])
      : this.router.navigate(['/inicio_sesion']);
  }

  editarProducto(producto: Product) {
    this.router.navigate(['/editar_producto', producto.id]);
  }

  abrirModalEliminar(producto: Product) {
     console.log('Abriendo modal para:', producto.name);
    this.productoAEliminar  = producto;
    this.modalEliminarVisible = true;
  }

  cancelarEliminar() {
    this.productoAEliminar    = null;
    this.modalEliminarVisible = false;
  }

  confirmarEliminar() {
    if (!this.productoAEliminar) return;

    this.http.delete(
      `http://localhost:3000/api/panel/productos/${this.productoAEliminar.id}`
    ).subscribe({
      next: () => {
        this.modalEliminarVisible = false;
        this.productoAEliminar    = null;
        this.cargarProductos();
      },
      error: (err) => alert(err.error?.message || 'Error al eliminar el producto')
    });
  }
}