// editar_producto.component.ts

import { Component, ChangeDetectorRef, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/producto.service';
import { Product } from '../../models/producto.model';

@Component({
  selector: 'app-editar-producto',
  standalone: true,
  imports: [FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './editar_producto.component.html',
  styleUrls: ['./editar_producto.component.css']
})
export class EditarProductoComponent implements OnInit {

  descripcion: string = 'Cuaderno profesional raya';
  precio: number = 85;
  stock: number = 14;
  categoria: string = 'Cuadernos';

  // 👇 categorías dinámicas
  categorias = signal<string[]>([]);

  imagenPreview: string = 'fondo_imagen_vacia.png';

  private productService = inject(ProductService);

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this.productService.getAll().subscribe((productos: Product[]) => {

      // obtiene categorías únicas
      const categoriasUnicas = [
        ...new Set(productos.map(p => p.category))
      ].sort();

      this.categorias.set(categoriasUnicas);
    });
  }

  irAlPerfil(): void {
    this.router.navigate(['/perfil']);
  }

  aumentarStock(): void {
    this.stock++;
  }

  disminuirStock(): void {
    if (this.stock > 0) {
      this.stock--;
    }
  }

  seleccionarImagen(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {

      const archivo = input.files[0];

      const reader = new FileReader();

      reader.onload = () => {

        this.imagenPreview = reader.result as string;

        this.cdr.detectChanges();
      };

      reader.readAsDataURL(archivo);
    }
  }

  editarProducto(): void {

    const productoEditado = {
      descripcion: this.descripcion,
      precio: this.precio,
      stock: this.stock,
      categoria: this.categoria,
      imagen: this.imagenPreview
    };

    console.log('Producto editado:', productoEditado);

    alert('Producto actualizado correctamente');
  }
}