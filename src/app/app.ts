//app.ts
import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />'
})
export class App implements OnInit {
  private authService = inject(AuthService);

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const ahora   = Math.floor(Date.now() / 1000);

      if (payload.exp && payload.exp < ahora) {
        localStorage.removeItem('token');
        localStorage.removeItem('rol');
      }
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('rol');
    }
  }
}