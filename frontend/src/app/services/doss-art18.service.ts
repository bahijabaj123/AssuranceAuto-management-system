// src/app/services/doss-art18.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DossierArt18 } from '../models/dossier-art18.model';

@Injectable({ providedIn: 'root' })
export class DossArt18Service {
  private apiUrl = 'https://carte-assurance-backend.onrender.com/api/doss-art18';

  constructor(private http: HttpClient) {}

  // ✅ PAS de userId - Tous les gestionnaires voient les mêmes données
  getAll(): Observable<DossierArt18[]> {
    console.log('📡 Appel API doss-art18 (commun)');
    return this.http.get<DossierArt18[]>(this.apiUrl);
  }

  getById(id: number): Observable<DossierArt18> {
    return this.http.get<DossierArt18>(`${this.apiUrl}/${id}`);
  }

  create(dossier: DossierArt18): Observable<DossierArt18> {
    return this.http.post<DossierArt18>(this.apiUrl, dossier);
  }

  update(id: number, dossier: DossierArt18): Observable<DossierArt18> {
    return this.http.put<DossierArt18>(`${this.apiUrl}/${id}`, dossier);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
