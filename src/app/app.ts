import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,            // 👈 faltaba
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.css']     // 👈 era styleUrl
})
export class App {
  protected readonly title = signal('Proyecto_ZETEC');
}