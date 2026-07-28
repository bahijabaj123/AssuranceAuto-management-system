// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { LoginRequest, RegisterRequest, AuthResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  
  private apiUrl = 'http://localhost:8081/api/auth';
  
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private currentUser: any = null;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  login(email: string, password: string): Observable<AuthResponse> {
    console.log('🔐 AuthService.login - Email:', email);
    console.log('🔐 AuthService.login - Password:', password);
    const request: LoginRequest = { 
      email: email, 
      password: password
    };
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request);
  }

  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  resetPassword(email: string, nouveauMotDePasse: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { 
      email, 
      nouveauMotDePasse 
    });
  }

  setCurrentUser(user: any): void {
    console.log('💾 setCurrentUser - Sauvegarde:', user);
    console.log('🆔 ID reçu:', user.id);
    
    this.currentUser = user;
    
    if (user && user.token) {
      localStorage.setItem('jwt_token', user.token);
      localStorage.setItem('user_info', JSON.stringify(user));
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUserSubject.next(user);
      
      console.log('✅ Token stocké dans localStorage');
      console.log('📦 user_info:', localStorage.getItem('user_info'));
    } else {
      console.error('❌ Pas de token dans la réponse');
    }
  }

  getCurrentUserId(): number {
    console.log('🔍 getCurrentUserId - Début');
    
    // ✅ 1. Essayer depuis localStorage 'user_info'
    const userJson = localStorage.getItem('user_info');
    console.log('📦 user_info:', userJson);
    
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        console.log('👤 Utilisateur parsé:', user);
        console.log('🆔 ID trouvé:', user.id);
        
        if (user.id) {
          return user.id;
        }
      } catch (e) {
        console.error('❌ Erreur de parsing:', e);
      }
    }
    
    // ✅ 2. Essayer depuis currentUser
    if (this.currentUser && this.currentUser.id) {
      console.log('👤 ID depuis currentUser:', this.currentUser.id);
      return this.currentUser.id;
    }
    
    console.log('⚠️ Aucun ID trouvé, fallback à 1');
    return 1;
  }

  getCurrentUser(): any {
    return this.currentUser || this.getUser();
  }

  isLoggedIn(): boolean {
    return this.estConnecte();
  }

  logout(): void {
    this.deconnecter();
  }

  private handleAuthentication(response: AuthResponse): void {
    localStorage.setItem('jwt_token', response.token);
    localStorage.setItem('user_info', JSON.stringify(response));
    localStorage.setItem('currentUser', JSON.stringify(response));
    this.currentUser = response;
    this.currentUserSubject.next(response);
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem('jwt_token');
    const userJson = localStorage.getItem('user_info');
    
    console.log('📂 loadUserFromStorage - Token trouvé:', token ? '✅ Oui' : '❌ Non');
    
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        this.currentUser = user;
        this.currentUserSubject.next(user);
        console.log('✅ Utilisateur chargé depuis localStorage:', user);
      } catch (e) {
        console.error('❌ Erreur de chargement:', e);
      }
    }
  }

  deconnecter(): void {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_info');
    localStorage.removeItem('currentUser');
    this.currentUser = null;
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    const token = localStorage.getItem('jwt_token');
    console.log('🔑 getToken - Token:', token ? '✅ Présent' : '❌ Absent');
    return token;
  }

  getUser(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  estConnecte(): boolean {
    const token = this.getToken();
    const isConnected = !!token;
    console.log('🔐 estConnecte - Résultat:', isConnected);
    return isConnected;
  }

  // src/app/services/auth.service.ts

// ✅ Ajouter cette méthode
isAdmin(): boolean {
  const user = this.getUser();
  if (!user) return false;
  const role = user.role || '';
  return role === 'ADMIN' || role === 'ROLE_ADMIN';
}

}