//auth.service.ts
// Servicio de autenticación: centraliza el login, registro y gestión de sesión.

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private http   = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/auth';

  // Envía credenciales al backend y guarda el token y rol si son correctos
  login(data: any): Observable<any> {
    return this.http.post<{ token: string; rol: number; message: string }>(
      `${this.apiUrl}/login`, data
    ).pipe(
      tap((res) => {
        this.saveToken(res.token);
        this.saveRol(res.rol); //guardar rol
      })
    );
  }

  // Solo envía los datos
  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  // Guarda el JWT en localStorage (persiste entre recargas de página)
  saveToken(token: string): void  { localStorage.setItem('token', token); }

  // Recupera el token; devuelve null si no existe (usuario no logueado)
  getToken(): string | null       { return localStorage.getItem('token'); }

  // Es la forma concisa de verificar si el usuario tiene sesión activa
  isLoggedIn(): boolean           { return !!this.getToken(); }

  // El rol se guarda por separado del token para poder consultarlo
  saveRol(rol: number): void      { localStorage.setItem('rol', String(rol)); } 
  getRol(): number                { return Number(localStorage.getItem('rol')); } 
  isAdmin(): boolean              { return this.getRol() === 2; } 

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('rol'); //limpiar rol al cerrar sesión
  }
}