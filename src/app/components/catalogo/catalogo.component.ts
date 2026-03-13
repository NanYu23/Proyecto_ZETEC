import { Component } from "@angular/core";
//import { ProductCardComponent } from "../producto-card/producto-card.component";
import { ProductCardComponent } from "../producto/producto.component";
import { ProductService } from "../../services/producto.service";
import { Product } from "../../models/producto.model";

@Component({
    selector: 'app-catalogo',
    standalone: true,
    imports: [ProductCardComponent],
    templateUrl: './catalogo.component.html',
    styleUrls: ['./catalogo.component.css'],
})
export class CatalogoComponent{
    products: Product[] = []; //arreglo de productos
    constructor(private productService: ProductService) {
    this.productService.getAll().subscribe(data => {
      this.products = data;
    });
  }
}
