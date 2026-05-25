import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private http   = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/auth';

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

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  saveToken(token: string): void  { localStorage.setItem('token', token); }
  getToken(): string | null       { return localStorage.getItem('token'); }
  isLoggedIn(): boolean           { return !!this.getToken(); }

  saveRol(rol: number): void      { localStorage.setItem('rol', String(rol)); } 
  getRol(): number                { return Number(localStorage.getItem('rol')); } 
  isAdmin(): boolean              { return this.getRol() === 2; } 

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('rol'); //limpiar rol al cerrar sesión
  }
}