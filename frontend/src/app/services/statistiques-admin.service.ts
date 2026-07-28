// src/app/services/statistiques-admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

export interface StatsGestionnaire {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  totalDossiers: number;
  ippMoyen: number;
  nbrJrsMoyen: number;
  reglementsTotal: number;
  natureCount: { [key: string]: number };
}

export interface StatsParAnnee {
  annee: number;
  total: number;
  natureCiv: number;
  natureCorr: number;
  naturePenal: number;
  natureAdmin: number;
  natureCivRef: number;
  reglementsTotal: number;
}

export interface StatsGlobales {
  totalDossiers: number;
  totalGestionnaires: number;
  totalReglements: number;
  ippMoyenGlobal: number;
  nbrJrsMoyenGlobal: number;
  dossiersParNature: { [key: string]: number };
}

@Injectable({
  providedIn: 'root'
})
export class StatistiquesAdminService {
  private apiUrl = 'http://localhost:8081/api';

  constructor(private http: HttpClient) {}

  // ✅ Fonction de normalisation
  private normaliserNature(value: string): string {
    if (!value) return 'AUTRE';
    
    const normalized = value.toUpperCase().trim();
    
    // 🔵 CIV - tout ce qui contient CIV (sauf CORR)
    if (normalized.includes('CIV') && !normalized.includes('CORR')) {
      if (normalized.includes('REF') || normalized.includes('REFERE')) {
        return 'CIV-REF';
      }
      return 'CIV';
    }
    
    // 🔴 CORR - tout ce qui contient CORR ou COR
    if (normalized.includes('CORR') || normalized.includes('COR')) {
      return 'CORR';
    }
    
    // 🟡 PENAL
    if (normalized.includes('PENAL')) {
      return 'PENAL';
    }
    
    // 🟢 ADMIN
    if (normalized.includes('ADMIN')) {
      return 'ADMIN';
    }
    
    return 'AUTRE';
  }

  // ✅ Récupérer les stats par gestionnaire
  getStatsGestionnaires(): Observable<StatsGestionnaire[]> {
    return this.http.get<any[]>(`${this.apiUrl}/suivi-dossiers`).pipe(
      switchMap((dossiers) => {
        return this.http.get<any[]>(`${this.apiUrl}/utilisateurs`).pipe(
          map((utilisateurs) => {
            const stats: StatsGestionnaire[] = [];

            utilisateurs.forEach((user) => {
              const dossiersUser = dossiers.filter((d: any) => d.idUtilisateur === user.id);
              
              if (dossiersUser.length > 0 || user.role === 'ADMIN') {
                let ippSum = 0;
                let ippCount = 0;
                let nbrJrsSum = 0;
                let nbrJrsCount = 0;
                let reglementsSum = 0;
                const natureCount: { [key: string]: number } = {};

                dossiersUser.forEach((d: any) => {
                  const ipp = parseFloat(d.ipp);
                  if (!isNaN(ipp) && ipp > 0) {
                    ippSum += ipp;
                    ippCount++;
                  }

                  const nbrJrs = parseInt(d.nbJours || d.nb_jours);
                  if (!isNaN(nbrJrs) && nbrJrs > 0) {
                    nbrJrsSum += nbrJrs;
                    nbrJrsCount++;
                  }

                  const reglements = parseFloat(d.reglements);
                  if (!isNaN(reglements) && reglements > 0) {
                    reglementsSum += reglements;
                  }

                  const nature = this.normaliserNature(d.natureAff || d.nature_aff);
                  natureCount[nature] = (natureCount[nature] || 0) + 1;
                });

                stats.push({
                  id: user.id,
                  nom: user.nom || '',
                  prenom: user.prenom || '',
                  email: user.email || '',
                  totalDossiers: dossiersUser.length,
                  ippMoyen: ippCount > 0 ? Math.round(ippSum / ippCount * 10) / 10 : 0,
                  nbrJrsMoyen: nbrJrsCount > 0 ? Math.round(nbrJrsSum / nbrJrsCount) : 0,
                  reglementsTotal: Math.round(reglementsSum),
                  natureCount: natureCount
                });
              }
            });

            return stats.sort((a, b) => b.totalDossiers - a.totalDossiers);
          })
        );
      })
    );
  }

// src/app/services/statistiques-admin.service.ts

// ✅ Remplacer getStatsParAnnee() par une version qui calcule depuis les données
getStatsParAnnee(): Observable<StatsParAnnee[]> {
  return this.http.get<any[]>(`${this.apiUrl}/suivi-dossiers`).pipe(
    map((dossiers) => {
      const statsMap = new Map<number, StatsParAnnee>();

      dossiers.forEach((d: any) => {
        // ✅ Extraire l'année des 4 premiers chiffres du numéro de dossier
        const numDos = d.numDos || d.num_dos;
        if (!numDos) return;
        
        const anneeStr = numDos.toString().substring(0, 4);
        const annee = parseInt(anneeStr);
        if (isNaN(annee)) return;

        if (!statsMap.has(annee)) {
          statsMap.set(annee, {
            annee: annee,
            total: 0,
            natureCiv: 0,
            natureCorr: 0,
            naturePenal: 0,
            natureAdmin: 0,
            natureCivRef: 0,
            reglementsTotal: 0
          });
        }

        const stat = statsMap.get(annee)!;
        stat.total++;

        const nature = this.normaliserNature(d.natureAff || d.nature_aff);
        if (nature === 'CIV') stat.natureCiv++;
        else if (nature === 'CIV-REF') stat.natureCivRef++;
        else if (nature === 'CORR') stat.natureCorr++;
        else if (nature === 'PENAL') stat.naturePenal++;
        else if (nature === 'ADMIN') stat.natureAdmin++;

        const reglements = parseFloat(d.reglements);
        if (!isNaN(reglements) && reglements > 0) {
          stat.reglementsTotal += reglements;
        }
      });

      // ✅ Filtrer les années pour garder 2018-2030
      return Array.from(statsMap.values())
        .filter(s => s.annee >= 2018 && s.annee <= 2030)
        .sort((a, b) => a.annee - b.annee);
    })
  );
}

  // ✅ Statistiques globales
  getStatsGlobales(): Observable<StatsGlobales> {
    return this.http.get<any[]>(`${this.apiUrl}/suivi-dossiers`).pipe(
      map((dossiers) => {
        let totalDossiers = dossiers.length;
        let ippSum = 0;
        let ippCount = 0;
        let nbrJrsSum = 0;
        let nbrJrsCount = 0;
        let reglementsSum = 0;
        const dossiersParNature: { [key: string]: number } = {};

        dossiers.forEach((d: any) => {
          const ipp = parseFloat(d.ipp);
          if (!isNaN(ipp) && ipp > 0) {
            ippSum += ipp;
            ippCount++;
          }

          const nbrJrs = parseInt(d.nbJours || d.nb_jours);
          if (!isNaN(nbrJrs) && nbrJrs > 0) {
            nbrJrsSum += nbrJrs;
            nbrJrsCount++;
          }

          const reglements = parseFloat(d.reglements);
          if (!isNaN(reglements) && reglements > 0) {
            reglementsSum += reglements;
          }

          const nature = this.normaliserNature(d.natureAff || d.nature_aff);
          dossiersParNature[nature] = (dossiersParNature[nature] || 0) + 1;
        });

        return {
          totalDossiers: totalDossiers,
          totalGestionnaires: 0,
          totalReglements: Math.round(reglementsSum),
          ippMoyenGlobal: ippCount > 0 ? Math.round(ippSum / ippCount * 10) / 10 : 0,
          nbrJrsMoyenGlobal: nbrJrsCount > 0 ? Math.round(nbrJrsSum / nbrJrsCount) : 0,
          dossiersParNature: dossiersParNature
        };
      })
    );
  }

  // ✅ Récupérer les utilisateurs
  getUtilisateurs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/utilisateurs`);
  }
}