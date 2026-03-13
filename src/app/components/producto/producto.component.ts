import { Component, Input } from "@angular/core";
import { Product } from "../../models/producto.model";

@Component({
    selector: 'app-product-card',
    standalone: true,
    templateUrl: './producto.component.html',
    styleUrls: ['./producto.component.css'],
})

export class ProductCardComponent{

    @Input({required:true}) product!: Product;

    quantity: number = 1;

    increase(){
        this.quantity++;
    }

    decrease(){
        if(this.quantity > 1){
            this.quantity--;
        }
    }

    addToCart(){
        console.log("Producto:", this.product.name);
        console.log("Cantidad:", this.quantity);
    }
}