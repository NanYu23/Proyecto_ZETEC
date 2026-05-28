import { Component, inject, afterNextRender, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CarritoService } from '../../services/carrito.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-perfil-usuario',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './perfil_usuario.component.html',
  styleUrls: ['./perfil_usuario.component.css'],
})
export class PerfilUsuarioComponent {
  private http = inject(HttpClient);
  authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  carritoService = inject(CarritoService);

  nombreUsuario = '';
  correoUsuario = '';
  cargando = true;
  errorMsg = '';
  esAdmin = false;
  modalEliminarVisible = false;
  modalExitoVisible = false;

  constructor() {
    this.esAdmin = this.authService.isAdmin();
    afterNextRender(() => {
      this.cargarPerfil();
    });
  }

  abrirModalEliminar() {
    this.modalEliminarVisible = true;
  }

  cancelarEliminar() {
    this.modalEliminarVisible = false;
  }

  confirmarEliminarCuenta(): void {
    const timestampCancelacion = new Date().toISOString();

    this.http.delete('http://localhost:3000/api/user/account', {
      body: { fecha_cancelacion: timestampCancelacion }
    }).subscribe({
      next: () => {
        this.modalEliminarVisible = false;
        
        // Activamos el modal de éxito
        this.modalExitoVisible = true;
        this.cdr.detectChanges(); // Forzamos actualización visual de emergencia

        //Esperamos 3 segundos antes de limpiar la sesión y redirigir
        setTimeout(() => {
          this.authService.logout();
          this.carritoService.vaciarCarrito();
          this.router.navigate(['/inicio_sesion']);
        }, 3000);
      },
      error: (err) => alert(err.error?.message || 'Error al eliminar la cuenta'),
    });
  }

  cargarPerfil(): void {
    this.http
      .get<{ user: any }>(`http://localhost:3000/api/user/profile?t=${Date.now()}`)
      .subscribe({
        next: (res) => {
          this.nombreUsuario = res.user.username;
          this.correoUsuario = res.user.email;
          this.cargando = false;
          this.cdr.detectChanges(); //forzar actualización de la vista
        },
        error: (err) => {
          console.error('Error cargando perfil:', err);
          this.cargando = false;
          this.cdr.detectChanges(); //también aquí
          this.errorMsg = 'No se pudo cargar el perfil';
        },
      });
  }

  guardarCambios(): void {
    this.http
      .put('http://localhost:3000/api/user/profile', {
        username: this.nombreUsuario,
        email: this.correoUsuario,
      })
      .subscribe({
        next: () => alert('Perfil actualizado correctamente'),
        error: (err) => alert(err.error?.message || 'Error al actualizar el perfil'),
      });
  }

  cancelar(): void {
    this.cargarPerfil();
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.carritoService.vaciarCarrito();
    this.router.navigate(['/inicio']);
  }
}
