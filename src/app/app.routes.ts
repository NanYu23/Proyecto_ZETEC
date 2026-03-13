// app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  {
    path: 'inicio',
    // ✅ lazy igual que catalogo: se carga solo en el browser,
    //    no durante el bootstrap SSR del servidor
    loadComponent: () => import('./components/home/home')
                          .then(m => m.HomeComponent)
  },
  {
    path: 'catalogo',
    loadComponent: () => import('./components/catalogo/catalogo.component')
                          .then(m => m.CatalogoComponent)
  },
  { path: '**', redirectTo: 'inicio' }
];