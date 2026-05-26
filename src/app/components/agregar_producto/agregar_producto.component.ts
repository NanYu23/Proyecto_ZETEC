// agregar_producto.component.ts
import {
  Component,
  ChangeDetectorRef,
  inject,
  OnInit,
  signal
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService }    from '../../services/auth.service';
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

  nombre:      string       = '';
  descripcion: string       = '';
  precio:      number | null = null;
  stock:       number       = 1;
  categoria:   string       = '';
  imageUrl:    string       = '';

  categorias    = signal<string[]>([]);
  imagenPreview = 'fondo_imagen_vacia.png';

  private productService = inject(ProductService);
  private authService    = inject(AuthService);
  private http           = inject(HttpClient);

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.productService.getAll().subscribe((productos: Product[]) => {
      const categoriasUnicas = [...new Set(productos.map(p => p.category))].sort();
      this.categorias.set(categoriasUnicas);
    });
  }

  irAlPerfil(): void {
    this.authService.isLoggedIn()
      ? this.router.navigate(['/perfil_usuario'])
      : this.router.navigate(['/inicio_sesion']);
  }

  aumentarStock(): void { this.stock++; }
  disminuirStock(): void { if (this.stock > 1) this.stock--; }

  seleccionarImagen(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenPreview = reader.result as string;
        this.imageUrl      = reader.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  agregarProducto(): void {
    if (!this.nombre || !this.precio || !this.categoria) {
      alert('Nombre, precio y categoría son obligatorios');
      return;
    }

    this.http.post('http://localhost:3000/api/panel/productos', {
      name:        this.nombre,
      price:       this.precio,
      inStock:     this.stock,
      category:    this.categoria,
      description: this.descripcion,
      imageUrl:    this.imageUrl
    }).subscribe({
      next: () => {
        alert('Producto agregado correctamente');
        this.router.navigate(['/panel_administracion']);
      },
      error: (err) => alert(err.error?.message || 'Error al agregar el producto')
    });
  }
}