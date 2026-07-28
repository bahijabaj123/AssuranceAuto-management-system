// src/app/services/utilisateur.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Utilisateur } from '../models/utilisateur.model';

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  private apiUrl = 'https://carte-assurance-backend.onrender.com/api/utilisateurs';

  constructor(private http: HttpClient) {}

  // ✅ Récupérer tous les utilisateurs (ADMIN only)
  getAll(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(this.apiUrl);
  }

  // ✅ Récupérer un utilisateur par ID
  getById(id: number): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(`${this.apiUrl}/${id}`);
  }

  // ✅ Supprimer un utilisateur (ADMIN only)
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // ✅ Modifier le rôle d'un utilisateur (ADMIN only)
  updateRole(id: number, role: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/role`, { role });
  }

  // ✅ Désactiver/Activer un utilisateur (ADMIN only)
  toggleActif(id: number, actif: boolean): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/actif`, { actif });
  }
}
