import { Component, inject, ChangeDetectorRef, afterNextRender } from '@angular/core';
import { ProductService } from '../../services/producto.service';
import { Product } from '../../models/producto.model';
import { ProductCardComponent } from '../producto/producto.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ProductCardComponent, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {
  products: Product[] = [];
  private productService = inject(ProductService);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    afterNextRender(() => {              // 👈 solo corre en el browser
      this.productService.getAll().subscribe(data => {
        this.products = data.slice(0, 4);
        this.cdr.detectChanges();
      });
    });
  }
}