import { Routes } from '@angular/router';
import { CatalogoComponent } from './components/catalogo/catalogo.component';

export const routes: Routes = [
  { path: '', component: CatalogoComponent }, //separar las rutas y saber a donde nos va a mandar al abrir la ruta principal
  { path: '**', redirectTo: '' },
];