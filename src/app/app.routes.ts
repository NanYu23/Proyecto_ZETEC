import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { 
    path: 'catalogo', 
    loadComponent: () => import('./components/catalogo/catalogo.component')
                          .then(m => m.CatalogoComponent) 
  }
];