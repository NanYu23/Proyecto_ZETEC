//producto.model.ts
export interface Product {
    id: number; //declarar variables
    name: string;
    price: number;
    imageUrl: string;
    category: string;
    description: string;
    inStock: number; 
}