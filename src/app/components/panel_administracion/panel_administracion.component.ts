import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CarritoService } from '../../services/carrito.service';
import { ProductService } from '../../services/producto.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models/producto.model';

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
  authService = inject(AuthService);
  router = inject(Router);
  http = inject(HttpClient);

  productos = signal<Product[]>([]);

  // Modal eliminar
  modalEliminarVisible = false;
  productoAEliminar: Product | null = null;

  productosInactivos = signal<Product[]>([]);
  modalReactivarVisible = false;
  productoAReactivar: Product | null = null;
  modalExitoVisible = false;


  ngOnInit() {
    this.cargarProductos();
    this.cargarProductosInactivos();
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
    this.productoAEliminar = producto;
    this.modalEliminarVisible = true;
  }

  cancelarEliminar() {
    this.productoAEliminar = null;
    this.modalEliminarVisible = false;
  }

  confirmarEliminar() {
    if (!this.productoAEliminar) return;

    this.http
      .delete(`http://localhost:3000/api/panel/productos/${this.productoAEliminar.id}`)
      .subscribe({
        next: () => {
          this.modalEliminarVisible = false;
          this.productoAEliminar = null;
          this.cargarProductos();
          this.cargarProductosInactivos(); 
        },
        error: (err) => alert(err.error?.message || 'Error al eliminar el producto'),
      });
  }

  cargarProductosInactivos() {
    this.http
      .get<{ productos: Product[] }>('http://localhost:3000/api/panel/productos-inactivos')
      .subscribe({
        next: (res) => this.productosInactivos.set(res.productos),
        error: (err) => console.error('Error cargando inactivos:', err),
      });
  }

  abrirModalReactivar(producto: Product) {
    this.productoAReactivar = producto;
    this.modalReactivarVisible = true;
  }

  cancelarReactivar() {
    this.productoAReactivar = null;
    this.modalReactivarVisible = false;
  }

  confirmarReactivar() {
    if (!this.productoAReactivar) return;

    this.http
      .put(`http://localhost:3000/api/panel/productos/${this.productoAReactivar.id}/reactivar`, {})
      .subscribe({
        next: () => {
          this.modalReactivarVisible = false;
          this.productoAReactivar = null;
          this.cargarProductos();
          this.cargarProductosInactivos();
          this.modalExitoVisible = true; 
        },
        error: (err) => alert(err.error?.message || 'Error al reactivar el producto'),
      });
  }
}
