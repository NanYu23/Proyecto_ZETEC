//crear_usuario.component.ts

import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { CarritoService } from '../../services/carrito.service';
import { AuthService }    from '../../services/auth.service';

@Component({
  selector: 'app-crear-usuario',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './crear_usuario.component.html',
  styleUrls: ['./crear_usuario.component.css']
})
export class CrearUsuarioComponent {

  carritoService = inject(CarritoService);
  authService    = inject(AuthService);
  router         = inject(Router);

  nombre   = '';
  email    = '';
  password = '';

  errorMsg = '';
  loading  = false;

  registrarse() {
    if (!this.nombre || !this.email || !this.password) {
      this.errorMsg = 'Todos los campos son obligatorios';
      return;
    }

    this.loading  = true;
    this.errorMsg = '';

    console.log('📤 Enviando registro:', { username: this.nombre, email: this.email });

    this.authService.register({
      username: this.nombre,
      email:    this.email,
      password: this.password
    }).subscribe({
      next: (res) => {
        console.log('✅ Registro exitoso:', res);
        this.authService.login({
          email:    this.email,
          password: this.password
        }).subscribe({
          next: (res) => {
            console.log('✅ Login exitoso:', res);
            this.authService.saveToken(res.token);
            this.carritoService.cargarDesdeBackend();
            this.loading = false;
            this.router.navigate(['/inicio']);
          },
          error: (err) => {
            console.error('❌ Error en login:', err);
            this.loading = false;
            this.router.navigate(['/login']);
          }
        });
      },
      error: (err) => {
        console.error('❌ Error en registro:', err);
        this.loading  = false;
        this.errorMsg = err.error?.message || 'Error al crear la cuenta';
      }
    });
  }
}