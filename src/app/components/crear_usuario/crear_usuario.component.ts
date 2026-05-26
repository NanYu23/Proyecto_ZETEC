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

  nombre    = '';
  email     = '';
  password  = '';
  direccion = '';

  errorMsg = '';
  loading  = false;

  // ─── Validaciones en tiempo real ───
  get emailValido(): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(this.email);
  }

  get passwordValida(): boolean {
    // Mínimo 8 caracteres, al menos una letra, un número y un símbolo
    const regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    return regex.test(this.password);
  }

  get passwordErrorMsg(): string {
    if (!this.password) return '';
    if (this.password.length < 8) return 'Mínimo 8 caracteres';
    if (!/[a-zA-Z]/.test(this.password)) return 'Debe contener letras';
    if (!/\d/.test(this.password)) return 'Debe contener números';
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(this.password)) return 'Debe contener un símbolo (!@#$%...)';
    return '';
  }

  get formularioValido(): boolean {
    return !!this.nombre && this.emailValido && this.passwordValida;
  }

  registrarse() {
    if (!this.nombre || !this.email || !this.password) {
      this.errorMsg = 'Todos los campos son obligatorios';
      return;
    }

    if (!this.emailValido) {
      this.errorMsg = 'El formato del correo no es válido';
      return;
    }

    if (!this.passwordValida) {
      this.errorMsg = 'La contraseña no cumple los requisitos de seguridad';
      return;
    }

    this.loading  = true;
    this.errorMsg = '';

    this.authService.register({
      username:  this.nombre,
      email:     this.email,
      password:  this.password,
      direccion: this.direccion
    }).subscribe({
      next: () => {
        this.authService.login({ email: this.email, password: this.password }).subscribe({
          next: (res) => {
            this.authService.saveToken(res.token);
            this.carritoService.cargarDesdeBackend();
            this.loading = false;
            this.router.navigate(['/inicio']);
          },
          error: () => {
            this.loading = false;
            this.router.navigate(['/login']);
          }
        });
      },
      error: (err) => {
        this.loading  = false;
        this.errorMsg = err.error?.message || 'Error al crear la cuenta';
      }
    });
  }
}