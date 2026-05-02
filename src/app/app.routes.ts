// app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  {
    path: 'inicio',
    loadComponent: () => import('./components/home/home')
                          .then(m => m.HomeComponent)
  },
  {
    path: 'catalogo',
    loadComponent: () => import('./components/catalogo/catalogo.component')
                          .then(m => m.CatalogoComponent)
  },
  { 
    path: 'carrito',
    loadComponent: () => import('./components/carrito/carrito.component')
                          .then(m => m.CarritoComponent) 
  },
  {  
    path: 'checkout',
    loadComponent: () => import('./components/checkout/checkout.component')
                          .then(m => m.CheckoutComponent)

  },
  {
    path: 'direccion-entrega',
    loadComponent: () => import('./components/direccion-entrega/direccion-entrega.component')
                          .then(m => m.DireccionEntregaComponent)

  },

  { path: '**', redirectTo: 'inicio' }
];