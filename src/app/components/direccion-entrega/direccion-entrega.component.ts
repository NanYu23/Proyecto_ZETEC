//direccion-entrega.component.ts
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CarritoService } from '../../services/carrito.service';
import { DireccionService, Direccion } from '../../services/direccion.service';

@Component({
  selector: 'app-direccion-entrega',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './direccion-entrega.component.html',
  styleUrls: ['./direccion-entrega.component.css'],
})
export class DireccionEntregaComponent implements OnInit {
  carritoService = inject(CarritoService);
  private direccionService = inject(DireccionService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef); //

  seleccion = 'recoleccion';
  direcciones: Direccion[] = [];
  cargando = false;
  nuevaDireccion = '';

  modalExitoVisible = false;
  mensajeExito = '';

  modalEliminarVisible = false;
  direccionAEliminar: Direccion | null = null;

  async ngOnInit() {
    this.cargando = true;
    this.direcciones = await this.direccionService.obtenerDirecciones();
    const actual = this.direccionService.direccionSeleccionada();
    if (actual) this.seleccion = String(actual.id);
    this.cargando = false;
    this.cdr.detectChanges(); // 👈
  }

  usarDireccion() {
    if (this.seleccion === 'recoleccion') {
      this.direccionService.seleccionar(null);
    } else {
      const dir = this.direcciones.find((d) => String(d.id) === this.seleccion);
      if (dir) this.direccionService.seleccionar(dir);
    }
    this.router.navigate(['/checkout']);
  }

  async agregarDireccion() {
    if (!this.nuevaDireccion.trim()) {
      this.mostrarModalExito('Escribe una dirección válida');
      return;
    }

    const nueva = await this.direccionService.agregarDireccion(this.nuevaDireccion);

    if (nueva) {
      this.direcciones.push(nueva);

      this.nuevaDireccion = '';

      this.cdr.detectChanges();

      this.mostrarModalExito('Nueva dirección agregada correctamente');
    } else {
      this.mostrarModalExito('Error al guardar la dirección');
    }
  }

  abrirModalEliminar(dir: Direccion) {
    this.direccionAEliminar = dir;
    this.modalEliminarVisible = true;
  }

  cancelarEliminar() {
    this.direccionAEliminar = null;
    this.modalEliminarVisible = false;
  }

  async confirmarEliminar() {
    if (!this.direccionAEliminar) return;

    const ok = await this.direccionService.eliminarDireccion(this.direccionAEliminar.id);
    if (ok) {
      this.direcciones = this.direcciones.filter((d) => d.id !== this.direccionAEliminar!.id);
      this.cancelarEliminar();
      this.cdr.detectChanges(); //
    } else {
      alert('Error al eliminar la dirección');
    }
  }

  mostrarModalExito(mensaje: string) {
    this.mensajeExito = mensaje;

    this.modalExitoVisible = true;

    this.cdr.detectChanges();
  }

  cerrarModalExito() {
    this.modalExitoVisible = false;

    this.cdr.detectChanges();
  }
}
