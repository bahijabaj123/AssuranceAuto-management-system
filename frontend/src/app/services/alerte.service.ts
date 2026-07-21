// src/app/services/alerte.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Alerte } from '../models/alerte.model';

@Injectable({
  providedIn: 'root'
})
export class AlerteService {
  private apiUrl = 'http://localhost:8081/api/alertes';

  constructor(private http: HttpClient) {}

  // ✅ Récupérer les alertes d'un utilisateur
  getAlertesByUser(userId: number): Observable<Alerte[]> {
    return this.http.get<Alerte[]>(`${this.apiUrl}/user/${userId}`);
  }

  // ✅ Récupérer les alertes non lues
  getAlertesNonLues(userId: number): Observable<Alerte[]> {
    return this.http.get<Alerte[]>(`${this.apiUrl}/user/${userId}/non-lues`);
  }

  // ✅ Compter les alertes non lues
  countNonVues(userId: number): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/user/${userId}/count`);
  }

  // ✅ Marquer une alerte comme lue
  marquerCommeLue(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/lue`, {});
  }

  // ✅ Marquer toutes les alertes comme lues
  marquerToutCommeLu(userId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/user/${userId}/tout-lu`, {});
  }
}