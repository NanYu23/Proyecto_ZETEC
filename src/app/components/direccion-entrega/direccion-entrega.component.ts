import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CarritoService } from '../../services/carrito.service';
import { DireccionService, Direccion } from '../../services/direccion.service';

@Component({
  selector: 'app-direccion-entrega',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './direccion-entrega.component.html',
  styleUrls: ['./direccion-entrega.component.css']
})
export class DireccionEntregaComponent implements OnInit {

  carritoService = inject(CarritoService);
  private direccionService = inject(DireccionService);
  private router = inject(Router);

  seleccion: string = 'recoleccion';
  direcciones: Direccion[] = [];
  cargando = false;

  nuevaDireccion: string = '';
  nuevoTelefono: string = '';

  async ngOnInit() {
    this.cargando = true;
    this.direcciones = await this.direccionService.obtenerDirecciones();
    const actual = this.direccionService.direccionSeleccionada();
    if (actual) this.seleccion = String(actual.id);
    this.cargando = false;
  }

  usarDireccion() {
    if (this.seleccion === 'recoleccion') {
      this.direccionService.seleccionar(null);
    } else {
      const dir = this.direcciones.find(d => String(d.id) === this.seleccion);
      if (dir) this.direccionService.seleccionar(dir);
    }
    this.router.navigate(['/checkout']);
  }

  async agregarDireccion() {
    if (!this.nuevaDireccion || !this.nuevoTelefono) {
      alert('Completa los campos');
      return;
    }

    const nueva = await this.direccionService.agregarDireccion(
      this.nuevaDireccion,
      this.nuevoTelefono
    );

    if (nueva) {
      this.direcciones.push(nueva);
      this.nuevaDireccion = '';
      this.nuevoTelefono = '';
      alert('Nueva dirección agregada');
    } else {
      alert('Error al guardar la dirección');
    }
  }
}