import { Component, inject, ChangeDetectorRef, afterNextRender } from "@angular/core";
import { ProductCardComponent } from "../producto/producto.component";
import { ProductService } from "../../services/producto.service";
import { Product } from "../../models/producto.model";
import { CommonModule } from "@angular/common"; 
import { RouterModule } from "@angular/router";

@Component({
    selector: 'app-catalogo',
    standalone: true,
    imports: [CommonModule, ProductCardComponent, RouterModule],
    templateUrl: './catalogo.component.html',
    styleUrls: ['./catalogo.component.css'],
})
export class CatalogoComponent {
    products: Product[] = [];
    private productService = inject(ProductService);
    private cdr = inject(ChangeDetectorRef);

    constructor() {
        afterNextRender(() => {           // 👈 solo corre en el browser
            this.productService.getAll().subscribe(data => {
                this.products = data;
                this.cdr.detectChanges();
            });
        });
    }
}