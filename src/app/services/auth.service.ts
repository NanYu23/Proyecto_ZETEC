//auth.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private http   = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/auth';

  login(data: any): Observable<any> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, data).pipe(
      tap((res: { token: string }) => {
        this.saveToken(res.token);
      })
    );
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  saveToken(token: string): void  { localStorage.setItem('token', token); }
  getToken(): string | null       { return localStorage.getItem('token'); }
  isLoggedIn(): boolean           { return !!this.getToken(); }
  logout(): void                  { localStorage.removeItem('token'); }
}