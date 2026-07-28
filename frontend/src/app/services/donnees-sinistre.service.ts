// src/app/services/donnees-sinistre.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DonneesSinistre } from '../models/donnees-sinistre.model';

@Injectable({
  providedIn: 'root'
})
export class DonneesSinistreService {
  private apiUrl = 'https://carte-assurance-backend.onrender.com/api/donnees-sinistres';

  constructor(private http: HttpClient) {}

  // ✅ Récupérer tous les sinistres
  getAll(): Observable<DonneesSinistre[]> {
    return this.http.get<DonneesSinistre[]>(this.apiUrl);
  }

  // ✅ Recherche avec filtres
  search(sin?: string, annee?: number, ipp?: string): Observable<DonneesSinistre[]> {
    let params = new HttpParams();
    if (sin) params = params.set('sin', sin);
    if (annee) params = params.set('annee', annee.toString());
    if (ipp) params = params.set('ipp', ipp);
    return this.http.get<DonneesSinistre[]>(`${this.apiUrl}/search`, { params });
  }

  // ✅ Récupérer par année
  getByAnnee(annee: number): Observable<DonneesSinistre[]> {
    return this.http.get<DonneesSinistre[]>(`${this.apiUrl}/annee/${annee}`);
  }

  // ✅ Récupérer les statistiques par année
  getStatsByAnnee(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/stats/annees`);
  }

  // ✅ Récupérer par ID
  getById(id: number): Observable<DonneesSinistre> {
    return this.http.get<DonneesSinistre>(`${this.apiUrl}/${id}`);
  }

  // ✅ Créer un sinistre
  create(data: DonneesSinistre): Observable<DonneesSinistre> {
    return this.http.post<DonneesSinistre>(this.apiUrl, data);
  }

  // ✅ Mettre à jour un sinistre
  update(id: number, data: DonneesSinistre): Observable<DonneesSinistre> {
    return this.http.put<DonneesSinistre>(`${this.apiUrl}/${id}`, data);
  }

  // ✅ Supprimer un sinistre
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
