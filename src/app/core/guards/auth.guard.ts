// auth.guard.ts
// Guard de ruta para proteger páginas que requieren estar autenticado.

import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
    const router = inject(Router);
    const token  = localStorage.getItem('token');

    if (token) {
        return true;
    }

    router.navigate(['/inicio_sesion']);
    return false;
};