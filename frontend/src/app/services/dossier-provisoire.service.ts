// src/app/services/dossier-provisoire.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DossierProvisoire } from '../models/dossier-provisoire.model';

@Injectable({ providedIn: 'root' })
export class DossierProvisoireService {
  private apiUrl = 'http://localhost:8081/api/dossiers-provisoires';

  constructor(private http: HttpClient) {}

  // ✅ PAS de userId - Tous les gestionnaires voient les mêmes données
  getAll(): Observable<DossierProvisoire[]> {
    console.log('📡 Appel API dossiers-provisoires (commun)');
    return this.http.get<DossierProvisoire[]>(this.apiUrl);
  }

  getById(id: number): Observable<DossierProvisoire> {
    return this.http.get<DossierProvisoire>(`${this.apiUrl}/${id}`);
  }

  create(dossier: DossierProvisoire): Observable<DossierProvisoire> {
    return this.http.post<DossierProvisoire>(this.apiUrl, dossier);
  }

  update(id: number, dossier: DossierProvisoire): Observable<DossierProvisoire> {
    return this.http.put<DossierProvisoire>(`${this.apiUrl}/${id}`, dossier);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}