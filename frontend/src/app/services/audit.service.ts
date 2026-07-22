// src/app/services/audit.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Audit } from '../models/audit.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private apiUrl = 'https://carte-assurance-backend.onrender.com/api/audit';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getMyAudits(): Observable<Audit[]> {
    const userId = this.authService.getCurrentUserId();
    return this.http.get<Audit[]>(`${this.apiUrl}/me?userId=${userId}`);
  }

  getAuditsByUser(userId: number): Observable<Audit[]> {
    return this.http.get<Audit[]>(`${this.apiUrl}/user/${userId}`);
  }

  getAllAudits(): Observable<Audit[]> {
    return this.http.get<Audit[]>(`${this.apiUrl}/all`);
  }
}
