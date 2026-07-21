// src/app/interceptors/jwt.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { catchError, throwError } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const toastService = inject(ToastService);
  const token = authService.getToken();

  // ✅ Exclure les endpoints d'authentification
  const isAuthRequest = req.url.includes('/api/auth/login') ||
                        req.url.includes('/api/auth/register') ||
                        req.url.includes('/api/auth/reset-password') ||
                        req.url.includes('/api/auth/verify');

  //Si c'est une requête d'authentification, ne pas ajouter le token
  if (isAuthRequest) {
    return next(req);
  }

  // ✅ Ajouter le token pour les autres requêtes
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 401) {
        toastService.error('Session expirée. Veuillez vous reconnecter.');
        authService.deconnecter();
      }
      return throwError(() => error);
    })
  );
};