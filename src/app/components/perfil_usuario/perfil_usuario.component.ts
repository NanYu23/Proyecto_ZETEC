// perfil_usuario.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CarritoService } from '../../services/carrito.service';

@Component({
  selector: 'app-perfil-usuario',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    FormsModule
  ],
  templateUrl: './perfil_usuario.component.html',
  styleUrls: ['./perfil_usuario.component.css']
})
export class PerfilUsuarioComponent {

  nombreUsuario: string = 'Nombre de usuario';
  correoUsuario: string = 'Correo electrónico';

  constructor(
    public carritoService: CarritoService
  ) {}

  guardarCambios(): void {
    alert('Cambios guardados correctamente');
  }

  cancelar(): void {
    this.nombreUsuario = 'Nombre de usuario';
    this.correoUsuario = 'Correo electrónico';
  }

  cerrarSesion(): void {
    alert('Sesión cerrada');
  }
}