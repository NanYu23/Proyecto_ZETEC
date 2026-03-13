// app.routes.server.ts
import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Client  // ✅ el servidor solo manda el shell HTML,
                                   //    el browser hace todo el fetch y render.
                                   //    Elimina el problema de hidratación/caché.
  }
];