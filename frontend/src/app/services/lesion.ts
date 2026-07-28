import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Lesion } from '../models/lesion';

@Injectable({
  providedIn: 'root'
})
export class LesionService {
  private baseUrl = 'http://localhost:8081/api';

  constructor(private http: HttpClient) {}

  getLesions(): Observable<Lesion[]> {
  return this.http.get<Lesion[]>(`${this.baseUrl}/lesions`);
}
  getLesionByCode(code: string): Observable<Lesion> {
    return this.http.get<Lesion>(`${this.baseUrl}/lesions/${code}`);
  }

  ajouterLesion(lesion: Lesion): Observable<Lesion> {
    return this.http.post<Lesion>(`${this.baseUrl}/lesions`, lesion);
  }

  modifierLesion(code: string, lesion: Lesion): Observable<Lesion> {
    return this.http.put<Lesion>(`${this.baseUrl}/lesions/${code}`, lesion);
  }

  supprimerLesion(code: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/lesions/${code}`);
  }
}