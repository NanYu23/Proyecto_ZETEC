// catalogo.component.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { ProductCardComponent } from '../producto/producto.component';
import { ProductService } from '../../services/producto.service';
import { Product } from '../../models/producto.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CarritoService } from '../../services/carrito.service';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent, RouterModule],
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.css',
})
export class CatalogoComponent implements OnInit {
  private allProducts = signal<Product[]>([]);
  filteredProducts = signal<Product[]>([]);
  categories = signal<string[]>([]);
  selectedCategory = '';

  // Modal
  mostrarModalStock = signal(false);
  productoModalStock = signal<Product | null>(null);

  mostrarTerminos = false;
  mostrarPrivacidad = false;

  abrirTerminos() {
    this.mostrarTerminos = true;
  }
  abrirPrivacidad() {
    this.mostrarPrivacidad = true;
  }

  private productService = inject(ProductService);
  carritoService = inject(CarritoService);

  ngOnInit() {
    this.productService.getAll().subscribe((data) => {
      this.allProducts.set(data);
      this.filteredProducts.set([...data]);
      this.categories.set([...new Set(data.map((p) => p.category))].sort());
    });
  }

  onCategoryChange() {
    const filtered = this.selectedCategory
      ? this.allProducts().filter((p) => p.category === this.selectedCategory)
      : [...this.allProducts()];
    this.filteredProducts.set(filtered);
  }

  // Recibe el evento de la card
  onStockSuperado(producto: Product) {
    this.productoModalStock.set(producto);
    this.mostrarModalStock.set(true);
  }

  cerrarModal() {
    this.mostrarModalStock.set(false);
  }
}
