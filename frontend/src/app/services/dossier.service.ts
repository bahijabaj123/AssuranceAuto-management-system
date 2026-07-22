import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Dossier } from '../models/dossier.model';

@Injectable({
  providedIn: 'root'
})
export class DossierService {
  private baseUrl = 'https://carte-assurance-backend.onrender.com/api';

  constructor(private http: HttpClient) {}

 getAllDossiers(): Observable<Dossier[]> {
    console.log('📡 Appel API :', `${this.baseUrl}/dossiers`);  // ← AJOUTER POUR DEBUG
    return this.http.get<Dossier[]>(`${this.baseUrl}/dossiers`);
  }

  getDossierById(id: string): Observable<Dossier> {
    return this.http.get<Dossier>(`${this.baseUrl}/dossiers/${id}`);
  }
}
