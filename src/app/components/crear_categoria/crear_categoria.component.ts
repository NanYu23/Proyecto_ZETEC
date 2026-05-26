import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

interface Categoria { id: number; nombre: string; }

@Component({
  selector: 'app-crear-categoria',
  standalone: true,
  imports: [FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './crear_categoria.component.html',
  styleUrls: ['./crear_categoria.component.css'],
})
export class CrearCategoriaComponent implements OnInit {

  nuevaCategoria:    string = '';
  categoriaEditando: string = '';
  indiceEditando:    number = -1;
  idEditando:        number = -1;

  mostrarModalEditar = false;
  mostrarModalExito  = false;

  categorias = signal<Categoria[]>([]);

  private http        = inject(HttpClient);
  private authService = inject(AuthService);

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.http.get<{ categorias: Categoria[] }>('http://localhost:3000/api/panel/categorias')
      .subscribe({
        next: (res) => this.categorias.set(res.categorias),
        error: (err) => console.error('Error cargando categorías:', err)
      });
  }

  irAlPerfil(): void {
    this.authService.isLoggedIn()
      ? this.router.navigate(['/perfil_usuario'])
      : this.router.navigate(['/inicio_sesion']);
  }

  agregarCategoria(): void {
    if (!this.nuevaCategoria.trim()) {
      alert('Escribe una categoría');
      return;
    }

    this.http.post('http://localhost:3000/api/panel/categorias', {
      nombre: this.nuevaCategoria.trim()
    }).subscribe({
      next: () => {
        this.nuevaCategoria = '';
        this.mostrarModalExito = true;
        this.cargarCategorias();
      },
      error: (err) => alert(err.error?.message || 'Error al agregar categoría')
    });
  }

  cerrarModalExito(): void { this.mostrarModalExito = false; }

  abrirModalEditar(index: number): void {
    const cat = this.categorias()[index];
    this.indiceEditando    = index;
    this.idEditando        = cat.id;
    this.categoriaEditando = cat.nombre;
    this.mostrarModalEditar = true;
  }

  cerrarModal(): void {
    this.mostrarModalEditar = false;
    this.categoriaEditando  = '';
    this.indiceEditando     = -1;
    this.idEditando         = -1;
  }

  guardarCategoria(): void {
    if (!this.categoriaEditando.trim()) return;

    this.http.put(`http://localhost:3000/api/panel/categorias/${this.idEditando}`, {
      nombre: this.categoriaEditando.trim()
    }).subscribe({
      next: () => {
        this.cerrarModal();
        this.cargarCategorias();
      },
      error: (err) => alert(err.error?.message || 'Error al actualizar categoría')
    });
  }
}