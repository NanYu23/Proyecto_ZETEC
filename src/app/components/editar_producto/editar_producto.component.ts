import { Component, ChangeDetectorRef, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ProductService } from '../../services/producto.service';
import { Product } from '../../models/producto.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-editar-producto',
  standalone: true,
  imports: [FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './editar_producto.component.html',
  styleUrls: ['./editar_producto.component.css'],
})
export class EditarProductoComponent implements OnInit {
  nombre: string = '';
  descripcion: string = '';
  precio: number = 0;
  stock: number = 0;
  categoria: string = '';
  imageUrl: string = '';
  imagenPreview: string = 'fondo_imagen_vacia.png';

  modalVisible = false;
  modalTitulo = '';
  modalMensaje = '';
  modalTipo: 'success' | 'error' = 'success';
  cargando = false;

  categorias = signal<string[]>([]);
  productoId: number = 0;

  private productService = inject(ProductService);
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.productoId = Number(this.route.snapshot.paramMap.get('id'));
    console.log('Producto ID:', this.productoId);

    //obtener categorias de la base de datos
    this.http.get<{ categorias: any[] }>('http://localhost:3000/api/panel/categorias').subscribe({
      next: (res) => this.categorias.set(res.categorias.map((c) => c.nombre)),
      error: (err) => console.error('Error cargando categorías:', err),
    });

    this.http
      .get<{ producto: any }>(`http://localhost:3000/api/panel/productos/${this.productoId}`)
      .subscribe({
        next: (res) => {
          console.log('Producto cargado:', res);
          const p = res.producto;
          this.nombre = p.name;
          this.descripcion = p.description;
          this.precio = p.price;
          this.stock = p.inStock;
          this.categoria = p.category;
          this.imageUrl = p.imageUrl;
          this.imagenPreview = p.imageUrl;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error cargando producto:', err),
      });
  }

  irAlPerfil(): void {
    this.authService.isLoggedIn()
      ? this.router.navigate(['/perfil_usuario'])
      : this.router.navigate(['/inicio_sesion']);
  }

  aumentarStock(): void {
    this.stock++;
  }
  disminuirStock(): void {
    if (this.stock > 0) this.stock--;
  }

  abrirModal(titulo: string, mensaje: string, tipo: 'success' | 'error'): void {
    this.modalTitulo = titulo;
    this.modalMensaje = mensaje;
    this.modalTipo = tipo;
    this.modalVisible = true;

    this.cdr.detectChanges();
  }

  cerrarModal(): void {
    this.modalVisible = false;
  }

  seleccionarImagen(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      const formatosPermitidos = [
        'image/png',
        'image/jpeg',
        'image/jpg',
        'image/webp',
        'image/svg+xml',
      ];

      if (!formatosPermitidos.includes(file.type)) {
        alert('Formato no permitido');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no puede superar los 5MB');
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        this.imagenPreview = reader.result as string;

        // 🔥 ESTO TE FALTABA
        this.imageUrl = reader.result as string;

        this.cdr.detectChanges();
      };

      reader.readAsDataURL(file);
    }
  }

  editarProducto(): void {
    if (this.cargando) return;

    if (!this.nombre || !this.precio || !this.categoria) {
      this.abrirModal(
        'Campos incompletos',
        'Nombre, precio y categoría son obligatorios.',
        'error',
      );

      return;
    }

    this.cargando = true;

    this.http
      .put(`http://localhost:3000/api/panel/productos/${this.productoId}`, {
        name: this.nombre,
        price: this.precio,
        inStock: this.stock,
        category: this.categoria,
        description: this.descripcion,
        imageUrl: this.imageUrl,
      })
      .subscribe({
        next: () => {
          this.cargando = false;

          this.abrirModal(
            'Producto actualizado',
            'El producto se actualizó correctamente.',
            'success',
          );

          this.cdr.detectChanges();

          setTimeout(() => {
            this.cerrarModal();

            this.router.navigate(['/panel_administracion']);
          }, 2200);
        },

        error: (err) => {
          this.cargando = false;

          console.error(err);

          let mensaje = 'Ocurrió un error inesperado.';

          if (err.status === 413) {
            mensaje = 'La imagen es demasiado pesada.';
          } else if (err.error?.message) {
            mensaje = err.error.message;
          }

          this.abrirModal('Error al actualizar', mensaje, 'error');

          this.cdr.detectChanges();
        },
      });
  }
}