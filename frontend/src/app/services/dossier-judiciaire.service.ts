import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DossierJudiciaire } from '../models/dossier-judiciaire.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class DossierJudiciaireService {
  private apiUrl = 'https://carte-assurance-backend.onrender.com/api/suivi-dossiers';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // ✅ Récupérer tous les dossiers (pour recherche)
  getAll(): Observable<DossierJudiciaire[]> {
    return this.http.get<DossierJudiciaire[]>(this.apiUrl);
  }

  // ✅ Récupérer les dossiers de l'utilisateur connecté
  getMyDossiers(): Observable<DossierJudiciaire[]> {
    const userId = this.authService.getCurrentUserId();
    if (userId) {
      const params = new HttpParams().set('userId', userId.toString());
      return this.http.get<DossierJudiciaire[]>(this.apiUrl, { params });
    }
    // ✅ Si pas d'utilisateur, retourner un Observable vide
    return this.http.get<DossierJudiciaire[]>(this.apiUrl);
  }

  // ✅ Rechercher un dossier par son numéro (tous les utilisateurs)
  findByNumDos(numDos: string): Observable<DossierJudiciaire[]> {
    const params = new HttpParams().set('numDos', numDos);
    return this.http.get<DossierJudiciaire[]>(`${this.apiUrl}/search`, { params });
  }

  getById(id: number): Observable<DossierJudiciaire> {
    return this.http.get<DossierJudiciaire>(`${this.apiUrl}/${id}`);
  }

  create(dossier: DossierJudiciaire): Observable<DossierJudiciaire> {
    const userId = this.authService.getCurrentUserId();
    const data = { ...dossier, idUtilisateur: userId };
    return this.http.post<DossierJudiciaire>(this.apiUrl, data);
  }

  update(id: number, dossier: DossierJudiciaire): Observable<DossierJudiciaire> {
    return this.http.put<DossierJudiciaire>(`${this.apiUrl}/${id}`, dossier);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ✅ Récupérer tous les utilisateurs pour le filtre propriétaire
  getUtilisateurs(): Observable<any[]> {
    return this.http.get<any[]>('https://carte-assurance-backend.onrender.com/api/utilisateurs');
  }

  extraireAnnee(numDos: string): number | null {
    if (!numDos) return null;
    const anneeStr = numDos.toString().substring(0, 4);
    const annee = parseInt(anneeStr);
    return isNaN(annee) ? null : annee;
  }

  // ✅ Récupérer un dossier par son numDos (numéro de sinistre)
  getDossierByNumDos(numDos: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/numDos/${numDos}`);
  }

  // ✅ Récupérer un dossier par son ID
  getDossierById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // ✅ Mettre à jour un dossier
  updateDossier(id: number, dossier: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, dossier);
  }
}
