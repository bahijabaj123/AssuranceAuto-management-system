import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EstimationResult, DossierSimilaire } from '../models/estimation';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EstimationService {
  private baseUrl = 'http://localhost:8081/api';

  constructor(private http: HttpClient) {}

  estimerIPP(nbJours: number, codesLesions: string[]): Observable<EstimationResult> {
    const params = {
      nbJours: nbJours.toString(),
      codes: codesLesions
    };
    return this.http.post<EstimationResult>(`${this.baseUrl}/estimation`, null, { params });
  }

  // Cette méthode n'est plus nécessaire car les dossiers similaires sont dans le résultat
  // Mais on la garde pour compatibilité
  getDossiersSimilaires(nbJours: number, codesLesions: string[]): Observable<DossierSimilaire[]> {
    return this.estimerIPP(nbJours, codesLesions).pipe(
      map(result => result.dossiersSimilaires)
    );
  }
}