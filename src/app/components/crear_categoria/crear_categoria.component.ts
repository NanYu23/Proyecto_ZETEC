import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/producto.service';
import { Product } from '../../models/producto.model';

@Component({
  selector: 'app-crear-categoria',
  standalone: true,
  imports: [FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './crear_categoria.component.html',
  styleUrls: ['./crear_categoria.component.css'],
})
export class CrearCategoriaComponent implements OnInit {
  nuevaCategoria: string = '';
  mostrarModalEditar: boolean = false;
  mostrarModalExito: boolean = false;

  categoriaEditando: string = '';

  indiceEditando: number = -1;

  // 👇 mismas categorías dinámicas
  categorias = signal<string[]>([]);

  private productService = inject(ProductService);

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.productService.getAll().subscribe((productos: Product[]) => {
      const categoriasUnicas = [...new Set(productos.map((p) => p.category))].sort();

      this.categorias.set(categoriasUnicas);
    });
  }

  irAlPerfil(): void {
    this.router.navigate(['/perfil']);
  }

 agregarCategoria(): void {

  if (!this.nuevaCategoria.trim()) {
    alert('Escribe una categoría');
    return;
  }

  const categoriasActuales = this.categorias();

  if (categoriasActuales.includes(this.nuevaCategoria.trim())) {
    alert('La categoría ya existe');
    return;
  }

  this.categorias.set([
    ...categoriasActuales,
    this.nuevaCategoria.trim()
  ]);

  this.nuevaCategoria = '';

  this.mostrarModalExito = true;
}
cerrarModalExito(): void {

  this.mostrarModalExito = false;
}


  abrirModalEditar(index: number): void {

  this.indiceEditando = index;

  this.categoriaEditando = this.categorias()[index];

  this.mostrarModalEditar = true;
}

cerrarModal(): void {

  this.mostrarModalEditar = false;

  this.categoriaEditando = '';

  this.indiceEditando = -1;
}

guardarCategoria(): void {

  if (!this.categoriaEditando.trim()) return;

  const copia = [...this.categorias()];

  copia[this.indiceEditando] = this.categoriaEditando.trim();

  this.categorias.set(copia);

  this.cerrarModal();
}

}
