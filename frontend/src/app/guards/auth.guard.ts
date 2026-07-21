// src/app/guards/auth.guard.ts
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // ✅ Utiliser authService.getToken() au lieu de localStorage directement
  const token = authService.getToken();
  console.log('🔒 AuthGuard - Token:', token ? '✅ Présent' : '❌ Absent');
  console.log('🔒 AuthGuard - Token depuis localStorage:', localStorage.getItem('jwt_token') ? '✅ Présent' : '❌ Absent');

  if (token) {
    console.log('✅ AuthGuard - Accès autorisé');
    return true;
  }

  console.log('❌ AuthGuard - Redirection vers login');
  router.navigate(['/login']);
  return false;
};

export const AuthGuard = authGuard;