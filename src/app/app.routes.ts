// app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  {
    path: 'inicio',
    canActivate: [authGuard],
    loadComponent: () => import('./components/home/home').then((m) => m.HomeComponent),
  },
  {
    path: 'catalogo',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/catalogo/catalogo.component').then((m) => m.CatalogoComponent),
  },
  {
    path: 'carrito',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/carrito/carrito.component').then((m) => m.CarritoComponent),
  },
  {
    path: 'checkout',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/checkout/checkout.component').then((m) => m.CheckoutComponent),
  },
  {
    path: 'direccion-entrega',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/direccion-entrega/direccion-entrega.component').then(
        (m) => m.DireccionEntregaComponent,
      ),
  },
  {
    path: 'finalizar-pedido',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/finalizar_pedido/finalizar_pedido.component').then(
        (m) => m.FinalizarPedidoComponent,
      ),
  },
  {
    path: 'historial-pedidos',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/historial_pedidos/historial_pedidos.component').then(
        (m) => m.HistorialPedidosComponent,
      ),
  },
  {
    path: 'crear_usuario',
    loadComponent: () =>
      import('./components/crear_usuario/crear_usuario.component').then(
        (m) => m.CrearUsuarioComponent,
      ),
  },
  {
    path: 'inicio_sesion',
    loadComponent: () =>
      import('./components/inicio_sesion/inicio_sesion.component').then(
        (m) => m.InicioSesionComponent,
      ),
  },
  {
    path: 'panel_administracion',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./components/panel_administracion/panel_administracion.component').then(
        (m) => m.PanelAdministracionComponent,
      ),
  },
  {
    path: 'perfil_usuario',
    loadComponent: () =>
      import('./components/perfil_usuario/perfil_usuario.component').then(
        (m) => m.PerfilUsuarioComponent,
      ),
  },

  {
    path: 'agregar_producto',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./components/agregar_producto/agregar_producto.component').then(
        (m) => m.AgregarProductoComponent,
      ),
  },
  {
    path: 'editar_producto/:id',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./components/editar_producto/editar_producto.component').then(
        (m) => m.EditarProductoComponent,
      ),
  },
  {
    path: 'crear_categoria',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./components/crear_categoria/crear_categoria.component').then(
        (m) => m.CrearCategoriaComponent,
      ),
  },
  {
    path: 'recuperar-password',
    loadComponent: () =>
      import('./components/recuperar_password/recuperar_password.component').then(
        (m) => m.RecuperarPasswordComponent,
      ),
  },

  //AGREGAR CAN ACTIVATE EN PERFIL (COMO EN HISTORIAL DE PEDIDOS)

  { path: '**', redirectTo: 'inicio' },
];
