// home.ts
import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { ProductService } from '../../services/producto.service';
import { Product } from '../../models/producto.model';
import { ProductCardComponent } from '../producto/producto.component';
import { RouterModule } from '@angular/router';
import { CarritoService } from '../../services/carrito.service';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ProductCardComponent, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit, OnDestroy {

  products = signal<Product[]>([]);
  private productService = inject(ProductService);
  carritoService = inject(CarritoService);

  slides = [
    { id: 1, image: 'foto1_carrusel.jpeg', alt: 'Banner 1' },
    { id: 2, image: 'foto2_carrusel.jpeg', alt: 'Banner 2' },
    { id: 3, image: 'foto3_carrusel.jpeg', alt: 'Banner 3' },
    { id: 4, image: 'foto4_carrusel.jpeg', alt: 'Banner 4' },
  ];

  currentSlide = 0;
  private autoplayTimer: any;

  ngOnInit() {
    this.productService.getAll().subscribe(data => {
      this.products.set(data.slice(0, 4));
    });
    this.startAutoplay();
  }

  ngOnDestroy() {
    clearInterval(this.autoplayTimer);
  }

  startAutoplay() {
    this.autoplayTimer = setInterval(() => this.nextSlide(), 4000);
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
  }

  goToSlide(index: number) {
    this.currentSlide = index;
  }
}