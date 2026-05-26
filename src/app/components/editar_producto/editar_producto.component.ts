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
    console.log('Producto ID:', this.productoId); // 👈

    this.productService.getAll().subscribe((productos: Product[]) => {
      this.categorias.set([...new Set(productos.map((p) => p.category))].sort());
    });

    this.http
      .get<{ producto: any }>(`http://localhost:3000/api/panel/productos/${this.productoId}`)
      .subscribe({
        next: (res) => {
          console.log('Producto cargado:', res); // 👈
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
        error: (err) => console.error('❌ Error cargando producto:', err), // 👈
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

  seleccionarImagen(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenPreview = reader.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  editarProducto(): void {
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
          alert('Producto actualizado correctamente');
          this.router.navigate(['/panel_administracion']);
        },
        error: (err) => alert(err.error?.message || 'Error al actualizar el producto'),
      });
  }
}
