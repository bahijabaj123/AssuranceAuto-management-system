import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RechercheDossierService {
  private apiUrl = 'http://localhost:8081/api/recherche-dossier';

  constructor(private http: HttpClient) {}

  rechercher(numero: string): Observable<any> {
    const params = new HttpParams().set('numero', numero);
    return this.http.get<any>(this.apiUrl, { params });
  }
}