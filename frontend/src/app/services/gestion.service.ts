import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GestionService {
  private baseUrl = 'http://localhost:8081/api';

  constructor(private http: HttpClient) {}

  // ============================================================
  // SUIVI DOSSIERS (TABLE 1)
  // ============================================================
  getSuiviDossiers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/suivi-dossiers`);
  }

  getSuiviDossierById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/suivi-dossiers/${id}`);
  }

  createSuiviDossier(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/suivi-dossiers`, data);
  }

  updateSuiviDossier(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/suivi-dossiers/${id}`, data);
  }

  deleteSuiviDossier(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/suivi-dossiers/${id}`);
  }

  // ============================================================
  // SORT JUG (TABLE 2)
  // ============================================================
  getSortJug(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/sort-jug`);
  }

  getSortJugById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/sort-jug/${id}`);
  }

  createSortJug(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/sort-jug`, data);
  }

  updateSortJug(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/sort-jug/${id}`, data);
  }

  deleteSortJug(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/sort-jug/${id}`);
  }

  // ============================================================
  // DOSS PROVISOIRES (TABLE 3)
  // ============================================================
  getDossProvisoires(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/doss-provisoires`);
  }

  getDossProvisoireById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/doss-provisoires/${id}`);
  }

  createDossProvisoire(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/doss-provisoires`, data);
  }

  updateDossProvisoire(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/doss-provisoires/${id}`, data);
  }

  deleteDossProvisoire(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/doss-provisoires/${id}`);
  }

  // ============================================================
  // DOSS ART18 (TABLE 4)
  // ============================================================
  getDossArt18(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/doss-art18`);
  }

  getDossArt18ById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/doss-art18/${id}`);
  }

  createDossArt18(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/doss-art18`, data);
  }

  updateDossArt18(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/doss-art18/${id}`, data);
  }

  deleteDossArt18(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/doss-art18/${id}`);
  }

  // ============================================================
  // MÉTHODE GÉNÉRIQUE POUR LE FORMULAIRE
  // ============================================================
  getDossierById(table: string, id: string): Observable<any> {
    const endpoints: { [key: string]: string } = {
      'suivi-dossiers': 'suivi-dossiers',
      'sort-jug': 'sort-jug',
      'doss-provisoires': 'doss-provisoires',
      'doss-art18': 'doss-art18'
    };
    const endpoint = endpoints[table] || table;
    return this.http.get<any>(`${this.baseUrl}/${endpoint}/${id}`);
  }

  createDossier(table: string, data: any): Observable<any> {
    const endpoints: { [key: string]: string } = {
      'suivi-dossiers': 'suivi-dossiers',
      'sort-jug': 'sort-jug',
      'doss-provisoires': 'doss-provisoires',
      'doss-art18': 'doss-art18'
    };
    const endpoint = endpoints[table] || table;
    return this.http.post(`${this.baseUrl}/${endpoint}`, data);
  }

  updateDossier(table: string, id: string, data: any): Observable<any> {
    const endpoints: { [key: string]: string } = {
      'suivi-dossiers': 'suivi-dossiers',
      'sort-jug': 'sort-jug',
      'doss-provisoires': 'doss-provisoires',
      'doss-art18': 'doss-art18'
    };
    const endpoint = endpoints[table] || table;
    return this.http.put(`${this.baseUrl}/${endpoint}/${id}`, data);
  }
}