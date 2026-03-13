// producto.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Product } from '../models/producto.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {

  constructor(private http: HttpClient) {}

  // ✅ isPlatformBrowser eliminado definitivamente.
  //    Con RenderMode.Client en app.routes.server.ts, el servidor Node.js
  //    NUNCA ejecuta código de componentes ni del servicio —
  //    solo manda el HTML shell vacío al browser.
  //    Por lo tanto DOMParser nunca se llama en servidor,
  //    y el guard isPlatformBrowser solo causaba que el servicio
  //    devolviera of([]) en momentos del ciclo de hidratación.
  getAll(): Observable<Product[]> {
    return this.http
      .get('/productos.xml', { responseType: 'text' })
      .pipe(map(xml => this.parseXml(xml)));
  }

  private parseXml(xmlText: string): Product[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'application/xml');
    const products = Array.from(doc.getElementsByTagName('product'));

    return products.map(node => ({
      id:          Number(this.getText(node, 'id')),
      name:        this.getText(node, 'name'),
      price:       Number(this.getText(node, 'price')),
      imageUrl:    this.getText(node, 'imageUrl'),
      category:    this.getText(node, 'category'),
      description: this.getText(node, 'description'),
      inStock:     Number(this.getText(node, 'inStock')),
    }));
  }

  private getText(parent: Element, tag: string): string {
    return parent.getElementsByTagName(tag)[0]?.textContent ?? '';
  }
}