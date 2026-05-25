import { Injectable, signal, inject } from '@angular/core';
import { AuthService } from './auth.service';

export interface Direccion {
  id: number;
  direccion: string;
  telefono: string;
}

@Injectable({ providedIn: 'root' })
export class DireccionService {

  private readonly API  = 'http://localhost:3000/api/direcciones';
  private authService   = inject(AuthService);
  direccionSeleccionada = signal<Direccion | null>(null);

  // Obtener el token para enviarlo en los headers
  private getHeaders(): HeadersInit {
    const token = this.authService.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  // Obtener ID del usuario desde el token
  private getUserId(): number | null {
    const token = this.authService.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch {
      return null;
    }
  }

  async obtenerDirecciones(): Promise<Direccion[]> {
    const userId = this.getUserId();
    if (!userId) return [];

    const res  = await fetch(`${this.API}/${userId}`, {
      headers: this.getHeaders()
    });
    const json = await res.json();
    return json.success ? json.data : [];
  }

  async agregarDireccion(direccion: string, telefono: string): Promise<Direccion | null> {
    const userId = this.getUserId();
    if (!userId) return null;

    const res  = await fetch(this.API, {
      method:  'POST',
      headers: this.getHeaders(),
      body:    JSON.stringify({ usuario_id: userId, direccion, telefono })
    });
    const json = await res.json();
    return json.success ? json.data : null;
  }

  seleccionar(dir: Direccion | null): void {
    this.direccionSeleccionada.set(dir);
  }
}