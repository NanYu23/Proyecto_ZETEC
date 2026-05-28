import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CarritoService } from '../../services/carrito.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-inicio-sesion',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './inicio_sesion.component.html',
  styleUrls: ['./inicio_sesion.component.css'],
})
export class InicioSesionComponent {
  cdr = inject(ChangeDetectorRef);
  carritoService = inject(CarritoService);
  authService = inject(AuthService);
  router = inject(Router);

  email = '';
  password = '';
  errorMsg = '';
  loading = false;

  mostrarTerminos = false;
  mostrarPrivacidad = false;
  mostrarCuentaInactiva = false;

  abrirTerminos() {
    this.mostrarTerminos = true;
  }
  abrirPrivacidad() {
    this.mostrarPrivacidad = true;
  }

  iniciarSesion() {
    if (!this.email || !this.password) {
      this.errorMsg = 'Completa todos los campos';
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.carritoService.cargarDesdeBackend();
        this.loading = false;

        if (this.authService.isAdmin()) {
          this.router.navigate(['/panel_administracion']);
        } else {
          this.router.navigate(['/catalogo']);
        }
      },
      error: (err) => {
        this.loading = false;
        
        // Caso 1: Cuenta desactivada (403)
        if (err.status === 403) {
          this.mostrarCuentaInactiva = true;
          this.errorMsg = ''; 
          this.cdr.detectChanges();
        } 
        // Caso 2: Contraseña incorrecta (401) o Usuario no existe (404)
        else if (err.status === 401 || err.status === 404) {
          this.errorMsg = err.error?.message || 'Usuario o contraseña incorrectos';
          this.cdr.detectChanges();
        } 
        // Caso 3: Error de conexión / Servidor caído
        else {
          this.errorMsg = 'Hubo un problema en el servidor. Inténtalo más tarde.';
          this.cdr.detectChanges();
        }
      },
    });
  }
}