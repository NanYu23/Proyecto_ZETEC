// app.config.ts
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http'; // ✅ sin withFetch()
import { routes } from './app.routes';

// ✅ withFetch() eliminado: usaba la Fetch API nativa que corre FUERA de NgZone,
//    por eso Angular no detectaba los cambios al recargar la página.
//    Sin withFetch(), HttpClient usa XHR que corre DENTRO de NgZone
//    y dispara change detection automáticamente en cada navegación y recarga.

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),   // ✅ XHR clásico, siempre dentro de NgZone
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
  ]
};