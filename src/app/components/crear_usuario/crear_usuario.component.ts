import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { CarritoService } from '../../services/carrito.service';

@Component({
  selector: 'app-crear-usuario',
  standalone: true,
  imports: [
    FormsModule,
    RouterModule
  ],
  templateUrl: './crear_usuario.component.html',
  styleUrls: ['./crear_usuario.component.css']
})
export class CrearUsuarioComponent {

  carritoService = inject(CarritoService);

  nombre = '';
  email = '';
  password = '';
  direccion = '';

  registrarse() {

    const usuario = {
      nombre: this.nombre,
      email: this.email,
      password: this.password,
      direccion: this.direccion
    };

    console.log('Usuario registrado:', usuario);

    alert('Cuenta creada correctamente');
  }

}