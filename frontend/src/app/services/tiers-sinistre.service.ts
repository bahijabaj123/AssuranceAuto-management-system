import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TiersSinistre } from '../models/tiers-sinistre.model';

@Injectable({
  providedIn: 'root'
})
export class TiersSinistreService {
  private apiUrl = 'https://carte-assurance-backend.onrender.com/api/tiers-sinistres';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // ✅ Récupérer tous les tiers d'un sinistre
  getTiersBySin(sin: string): Observable<TiersSinistre[]> {
    return this.http.get<TiersSinistre[]>(`${this.apiUrl}/sin/${sin}`, { headers: this.getHeaders() });
  }

  // ✅ Récupérer un tiers par son ID
  getTiersById(id: number): Observable<TiersSinistre> {
    return this.http.get<TiersSinistre>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // ✅ Créer un tiers
  createTiers(tiers: TiersSinistre): Observable<TiersSinistre> {
    return this.http.post<TiersSinistre>(this.apiUrl, tiers, { headers: this.getHeaders() });
  }

  // ✅ Mettre à jour un tiers
  updateTiers(id: number, tiers: TiersSinistre): Observable<TiersSinistre> {
    return this.http.put<TiersSinistre>(`${this.apiUrl}/${id}`, tiers, { headers: this.getHeaders() });
  }

  // ✅ Supprimer un tiers
  deleteTiers(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // ✅ Supprimer tous les tiers d'un sinistre
  deleteTiersBySin(sin: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/sin/${sin}`, { headers: this.getHeaders() });
  }

  // ✅ Compter les tiers d'un sinistre
  countBySin(sin: string): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/sin/${sin}/count`, { headers: this.getHeaders() });
  }

  // ✅ Récupérer la moyenne IPP d'un sinistre
  getMoyenneIPP(sin: string): Observable<{ moyenneIPP: number }> {
    return this.http.get<{ moyenneIPP: number }>(`${this.apiUrl}/sin/${sin}/moyenne-ipp`, { headers: this.getHeaders() });
  }

  // ✅ Récupérer le total des règlements d'un sinistre
  getTotalReglements(sin: string): Observable<{ totalReglements: number }> {
    return this.http.get<{ totalReglements: number }>(`${this.apiUrl}/sin/${sin}/total-reglements`, { headers: this.getHeaders() });
  }
}
