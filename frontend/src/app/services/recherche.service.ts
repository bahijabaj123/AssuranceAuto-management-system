// src/app/services/recherche.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class RechercheService {
  private apiUrl = 'https://carte-assurance-backend.onrender.com/api';

  constructor(private http: HttpClient) {}

  rechercherSuivi(numDos: string): Observable<any[]> {
    const params = new HttpParams().set('numDos', numDos);
    return this.http.get<any[]>(`${this.apiUrl}/suivi-dossiers/search`, { params });
  }

  rechercherSortJug(numDos: string): Observable<any[]> {
    const params = new HttpParams().set('numDos', numDos);
    return this.http.get<any[]>(`${this.apiUrl}/sort-jug/search`, { params });
  }

  // ✅ Dossiers Provisoires : recherche par num_sinistre
  rechercherProvisoire(numDos: string): Observable<any[]> {
    const params = new HttpParams().set('numSinistre', numDos);
    return this.http.get<any[]>(`${this.apiUrl}/dossiers-provisoires/search`, { params });
  }

  // ✅ Art. 18 : recherche par reference (ou numDos)
  rechercherArt18(numDos: string): Observable<any[]> {
    const params = new HttpParams().set('numDos', numDos);
    return this.http.get<any[]>(`${this.apiUrl}/doss-art18/search`, { params });
  }

  getProprietaire(numDos: string): Observable<any> {
    const params = new HttpParams().set('numDos', numDos);
    return this.http.get<any>(`${this.apiUrl}/utilisateurs/by-dossier`, { params });
  }

  getUserById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/utilisateurs/${id}`);
  }

  rechercherDossier(numDos: string): Observable<any> {
    return forkJoin({
      suivi: this.rechercherSuivi(numDos),
      sortJug: this.rechercherSortJug(numDos),
      provisoire: this.rechercherProvisoire(numDos),
      art18: this.rechercherArt18(numDos)
    }).pipe(
      map((results: any) => {
        console.log('📊 Résultats:', {
          suivi: results.suivi?.length || 0,
          sortJug: results.sortJug?.length || 0,
          provisoire: results.provisoire?.length || 0,
          art18: results.art18?.length || 0
        });
        
        return {
          suivi: results.suivi && results.suivi.length > 0 ? results.suivi[0] : null,
          sortJug: results.sortJug && results.sortJug.length > 0 ? results.sortJug[0] : null,
          provisoire: results.provisoire && results.provisoire.length > 0 ? results.provisoire[0] : null,
          art18: results.art18 && results.art18.length > 0 ? results.art18[0] : null
        };
      })
    );
  }
}
