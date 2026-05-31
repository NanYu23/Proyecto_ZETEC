// auth.guard.ts
// Guard de ruta para proteger páginas que requieren estar autenticado.

import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authGuard = () => {
  const router = inject(Router);
  const token  = localStorage.getItem('token');

  if (!token) {
    router.navigate(['/inicio_sesion']);
    return false;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const ahora   = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < ahora) {
      // Token expirado: limpiar localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('rol');
      router.navigate(['/inicio_sesion']);
      return false;
    }
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    router.navigate(['/inicio_sesion']);
    return false;
  }

  return true;
};