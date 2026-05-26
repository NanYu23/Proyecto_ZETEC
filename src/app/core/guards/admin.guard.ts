// admin.guard.ts

import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const adminGuard: CanActivateFn = () => {
    const router = inject(Router);
    const rol    = localStorage.getItem('rol');

    console.log('adminGuard ejecutado - rol:', rol); 

    if (rol === '2') {
        return true;
    }

    router.navigate(['/inicio']);
    return false;
};