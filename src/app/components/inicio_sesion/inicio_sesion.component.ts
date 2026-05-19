import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CarritoService } from '../../services/carrito.service';

@Component({
  selector: 'app-inicio-sesion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './inicio_sesion.component.html',
  styleUrls: ['./inicio_sesion.component.css']
})
export class InicioSesionComponent {
  carritoService = inject(CarritoService);

  email = '';
  password = '';

  constructor(private router: Router) {}

  iniciarSesion() {

    if (!this.email || !this.password) {
      alert('Completa todos los campos');
      return;
    }

    console.log('Login:', {
      email: this.email,
      password: this.password
    });

    alert('Inicio de sesión exitoso');

    this.router.navigate(['/catalogo']);
  }

}