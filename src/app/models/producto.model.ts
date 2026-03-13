//producto.model.ts
import { Component } from '@angular/core';

export interface Product {
    id: number;
    name: string;
    price: number;
    imageUrl: string;
    category: string;
    description: string;
    inStock: number; 
}