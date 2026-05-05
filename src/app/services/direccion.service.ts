import { Injectable, signal } from '@angular/core';

export interface Direccion {
  id: number;
  direccion: string;
  telefono: string;
}

@Injectable({ providedIn: 'root' })
export class DireccionService {

  private readonly API = 'http://localhost:3000/api/direcciones';
  private readonly USUARIO_ID = 1;

  direccionSeleccionada = signal<Direccion | null>(null);

  async obtenerDirecciones(): Promise<Direccion[]> {
    const res = await fetch(`${this.API}/${this.USUARIO_ID}`);
    const json = await res.json();
    return json.success ? json.data : [];
  }

  async agregarDireccion(direccion: string, telefono: string): Promise<Direccion | null> {
    const res = await fetch(this.API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario_id: this.USUARIO_ID, direccion, telefono })
    });
    const json = await res.json();
    return json.success ? json.data : null;
  }

  seleccionar(dir: Direccion | null): void {
    this.direccionSeleccionada.set(dir);
  }
}