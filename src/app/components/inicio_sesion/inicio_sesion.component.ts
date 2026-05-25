import { Component, inject } from '@angular/core';
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
  carritoService = inject(CarritoService);
  authService = inject(AuthService);
  router = inject(Router);

  email = '';
  password = '';
  errorMsg = '';
  loading = false;

  iniciarSesion() {
    if (!this.email || !this.password) {
      this.errorMsg = 'Completa todos los campos';
      return;
    }

    this.loading  = true;
    this.errorMsg = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        // token y rol ya se guardan automáticamente en el tap del AuthService
        this.carritoService.cargarDesdeBackend();
        this.loading = false;

        // El guard admin leerá el rol de localStorage automáticamente
        if (this.authService.isAdmin()) {
          this.router.navigate(['/panel_administracion']);
        } else {
          this.router.navigate(['/catalogo']);
        }
      },
      error: (err) => {
        this.loading  = false;
        this.errorMsg = err.error?.message || 'Credenciales incorrectas';
      },
    });
  }
}
