// src/app/services/sort-jug.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SortJug } from '../models/sort-jug.model';

@Injectable({ providedIn: 'root' })
export class SortJugService {
  private apiUrl = 'https://carte-assurance-backend.onrender.com/api/sort-jug';

  constructor(private http: HttpClient) {}

  // ✅ PAS de userId - Tous les gestionnaires voient les mêmes données
  getAll(): Observable<SortJug[]> {
    console.log('📡 Appel API sort-jug (commun)');
    return this.http.get<SortJug[]>(this.apiUrl);
  }

  getById(id: number): Observable<SortJug> {
    return this.http.get<SortJug>(`${this.apiUrl}/${id}`);
  }

  create(dossier: SortJug): Observable<SortJug> {
    return this.http.post<SortJug>(this.apiUrl, dossier);
  }

  update(id: number, dossier: SortJug): Observable<SortJug> {
    return this.http.put<SortJug>(`${this.apiUrl}/${id}`, dossier);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
