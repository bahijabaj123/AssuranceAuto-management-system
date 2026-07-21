import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';  // ← Importer

export interface EstimationHistorique {
  id: string;
  date: string;
  nbJours: number;
  lesions: string[];
  tauxEstime: number;
  dossiersSimilaires: { id: string; tauxIPP: number }[];
  commentaire?: string;
}

@Injectable({
  providedIn: 'root'
})
export class HistoriqueService {
  private storageKey = 'estimations_historique';
  private historiqueSubject = new BehaviorSubject<EstimationHistorique[]>([]);

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const data = localStorage.getItem(this.storageKey);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        this.historiqueSubject.next(parsed);
      } catch (e) {
        this.historiqueSubject.next([]);
      }
    } else {
      this.historiqueSubject.next([]);
    }
  }

  private saveToStorage(historique: EstimationHistorique[]) {
    localStorage.setItem(this.storageKey, JSON.stringify(historique));
    this.historiqueSubject.next(historique);
  }

  getHistorique(): Observable<EstimationHistorique[]> {
    return this.historiqueSubject.asObservable();
  }

  ajouterEstimation(estimation: Omit<EstimationHistorique, 'id' | 'date'>): string {
    const current = this.historiqueSubject.value;
    const newEstimation: EstimationHistorique = {
      ...estimation,
      id: 'EST-' + Date.now().toString(36).toUpperCase(),
      date: new Date().toISOString()
    };
    this.saveToStorage([newEstimation, ...current]);
    return newEstimation.id;
  }

  supprimerEstimation(id: string) {
    const current = this.historiqueSubject.value;
    const filtered = current.filter(e => e.id !== id);
    this.saveToStorage(filtered);
  }

  supprimerTout() {
    this.saveToStorage([]);
  }

  getEstimationById(id: string): EstimationHistorique | undefined {
    return this.historiqueSubject.value.find(e => e.id === id);
  }

  getNombreEstimations(): number {
    return this.historiqueSubject.value.length;
  }
}