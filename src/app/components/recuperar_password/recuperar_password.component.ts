import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-recuperar-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './recuperar_password.component.html',
  styleUrls: ['./recuperar_password.component.css']
})
export class RecuperarPasswordComponent {

  private http   = inject(HttpClient);
  private router = inject(Router);
  private cdr    = inject(ChangeDetectorRef); 

  paso = 1;

  email           = '';
  codigo          = '';
  newPassword     = '';
  confirmPassword = '';

  errorMsg = '';
  exitoMsg = '';
  loading  = false;

  get passwordValida(): boolean {
    const regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    return regex.test(this.newPassword);
  }

  solicitarCodigo() {
    if (!this.email) { this.errorMsg = 'Ingresa tu correo'; return; }

    this.loading  = true;
    this.errorMsg = '';

    this.http.post('http://localhost:3000/api/auth/recuperar-password', { email: this.email })
      .subscribe({
        next: () => {
          this.loading = false;
          this.paso    = 2;
          this.cdr.detectChanges(); 
        },
        error: (err) => {
          this.loading  = false;
          this.errorMsg = err.error?.message || 'Error al enviar el código';
          this.cdr.detectChanges(); 
        }
      });
  }

  resetPassword() {
    if (!this.codigo || !this.newPassword || !this.confirmPassword) {
      this.errorMsg = 'Completa todos los campos'; return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.errorMsg = 'Las contraseñas no coinciden'; return;
    }
    if (!this.passwordValida) {
      this.errorMsg = 'La contraseña no cumple los requisitos'; return;
    }

    this.loading  = true;
    this.errorMsg = '';

    this.http.post('http://localhost:3000/api/auth/reset-password', {
      email:       this.email,
      code:        this.codigo,
      newPassword: this.newPassword
    }).subscribe({
      next: () => {
        this.loading  = false;
        this.exitoMsg = '¡Contraseña actualizada correctamente!';
        this.cdr.detectChanges(); 
        setTimeout(() => this.router.navigate(['/inicio_sesion']), 2000);
      },
      error: (err) => {
        this.loading  = false;
        this.errorMsg = err.error?.message || 'Error al actualizar la contraseña';
        this.cdr.detectChanges(); 
      }
    });
  }
}