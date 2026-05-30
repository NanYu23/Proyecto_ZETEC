// agregar_producto.component.ts
import { Component, ChangeDetectorRef, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { ProductService } from '../../services/producto.service';
import { Product } from '../../models/producto.model';

@Component({
  selector: 'app-agregar-producto',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './agregar_producto.component.html',
  styleUrls: ['./agregar_producto.component.css'],
})
export class AgregarProductoComponent implements OnInit {
  nombre: string = '';
  descripcion: string = '';
  precio: number | null = null;
  stock: number = 1;
  categoria: string = '';
  imageUrl: string = '';

  categorias = signal<string[]>([]);
  imagenPreview = 'fondo_imagen_vacia.png';
  modalVisible = false;
  modalTitulo = '';
  modalMensaje = '';
  modalTipo: 'success' | 'error' = 'success';
  cargando = false;

  private productService = inject(ProductService);
  private authService = inject(AuthService);
  private http = inject(HttpClient);

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  //Obtener las categorías de la base de datos
  ngOnInit(): void {
    this.http.get<{ categorias: any[] }>('http://localhost:3000/api/panel/categorias').subscribe({
      next: (res) => this.categorias.set(res.categorias.map((c) => c.nombre)),
      error: (err) => console.error('Error cargando categorías:', err),
    });
  }

  // Redirige al perfil si está autenticado, o al login si no lo está
  irAlPerfil(): void {
    this.authService.isLoggedIn()
      ? this.router.navigate(['/perfil_usuario'])
      : this.router.navigate(['/inicio_sesion']);
  }

  aumentarStock(): void {
    this.stock++;
  }

  disminuirStock(): void {
    if (this.stock > 1) this.stock--;
  }

   // Abre el modal con el título, mensaje y tipo indicados
  abrirModal(titulo: string, mensaje: string, tipo: 'success' | 'error'): void {
    this.modalTitulo = titulo;
    this.modalMensaje = mensaje;
    this.modalTipo = tipo;
    this.modalVisible = true;

    this.cdr.detectChanges();
  }

  cerrarModal(): void {
    this.modalVisible = false;

    if (this.modalTipo === 'success') {
      this.router.navigate(['/panel_administracion']);
    }
  }

  // Convierte el archivo seleccionado a Base64 para previsualizarlo
  // y enviarlo al backend como string (sin necesidad de un servidor de archivos)
  seleccionarImagen(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Valida que el formato sea una imagen permitida
      const formatosPermitidos = [
        'image/png',
        'image/jpeg',
        'image/jpg',
        'image/webp',
        'image/svg+xml',
      ];

      if (!formatosPermitidos.includes(file.type)) {
        this.abrirModal(
          'Formato no permitido',
          'Solo se permiten imágenes PNG, JPG, JPEG, WEBP y SVG.',
          'error',
        );

        return;
      }

      // LIMITE 5MB
      if (file.size > 5 * 1024 * 1024) {
        this.abrirModal('Imagen demasiado grande', 'La imagen no puede superar los 5MB.', 'error');

        return;
      }

      // FileReader lee el archivo del sistema de forma asíncrona
      // y lo convierte a una URL en formato Base64 (data:image/png;base64,...)
      const reader = new FileReader();

      reader.onload = () => {
        this.imagenPreview = reader.result as string; // Muestra la imagen en el <img> del formulario
        this.imageUrl = reader.result as string;  // Guarda el Base64 para enviarlo al backend
        this.cdr.detectChanges();
      };

      reader.onerror = () => {
        this.abrirModal(
          'Error al leer imagen',
          'No se pudo procesar la imagen seleccionada.',
          'error',
        );
      };

      reader.readAsDataURL(file);
    }
  }

  agregarProducto(): void {
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
      .post('http://localhost:3000/api/panel/productos', {
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

          this.abrirModal('Producto agregado', 'El producto se agregó correctamente.', 'success');

          this.cdr.detectChanges();
          // Al cerrar el modal de éxito, cerrarModal() redirigirá al panel
        },

        error: (err) => {
          this.cargando = false;

          console.error(err);

          let mensaje = 'Ocurrió un error inesperado.';

          if (err.status === 413) {
            mensaje = 'La imagen es demasiado pesada para el servidor.';
          } else if (err.error?.message) {
            mensaje = err.error.message;
          } else if (err.message) {
            mensaje = err.message;
          }

          this.abrirModal('Error al agregar', mensaje, 'error');

          this.cdr.detectChanges();
        },
      });
  }
}
