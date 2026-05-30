//auth.interceptors.ts
// Interceptor HTTP que agrega automáticamente el token JWT a todas las
// peticiones que hace HttpClient en la app.

import { HttpInterceptorFn } from "@angular/common/http";
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem("token");
    if (token) {
        const authReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`    // Agrega el token a la copia
            }
        });
        return next(authReq);   // Envía la petición CON el token
    }
    return next(req);
};