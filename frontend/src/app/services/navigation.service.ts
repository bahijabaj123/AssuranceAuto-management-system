// src/app/services/navigation.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export interface NavigationFiltres {
  numDos?: string;
  region?: string;
  nature?: string;
  idUtilisateur?: number;
  ippMin?: number;
  ippMax?: number;
  annee?: number;
  sin?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  constructor(private router: Router) {}

  // ✅ Naviguer vers la recherche avec des filtres
  naviguerVersRecherche(filtres: NavigationFiltres): void {
    const queryParams: any = {};

    // Construire les paramètres de requête
    if (filtres.numDos) {
      queryParams.search = filtres.numDos;
    }
    if (filtres.annee) {
    queryParams.annee = filtres.annee;
  }
    if (filtres.region) {
      queryParams.region = filtres.region;
    }
    if (filtres.nature) {
      queryParams.nature = filtres.nature;
    }
    if (filtres.idUtilisateur) {
      queryParams.proprietaire = filtres.idUtilisateur;
    }
    if (filtres.ippMin !== undefined && filtres.ippMin !== null) {
      queryParams.ippMin = filtres.ippMin;
    }
    if (filtres.ippMax !== undefined && filtres.ippMax !== null) {
      queryParams.ippMax = filtres.ippMax;
    }
    if (filtres.annee) {
      queryParams.annee = filtres.annee;
    }

    // ✅ Si on a des filtres, naviguer vers état-suivi avec les paramètres
    if (Object.keys(queryParams).length > 0) {
      this.router.navigate(['/gestion/etat-suivi'], { queryParams });
    } else {
      this.router.navigate(['/gestion/etat-suivi']);
    }
  }

  // ✅ Naviguer vers les sinistres avec filtres
  naviguerVersSinistres(filtres: NavigationFiltres): void {
    const queryParams: any = {};

    if (filtres.annee) {
      queryParams.annee = filtres.annee;
    }
    if (filtres.ippMin !== undefined && filtres.ippMin !== null) {
      queryParams.ippMin = filtres.ippMin;
    }
    if (filtres.ippMax !== undefined && filtres.ippMax !== null) {
      queryParams.ippMax = filtres.ippMax;
    }
    if (filtres.nature) {
      queryParams.nature = filtres.nature;
    }
    if (filtres.sin) {
      queryParams.sin = filtres.sin;
    }

    if (Object.keys(queryParams).length > 0) {
      this.router.navigate(['/sinistres'], { queryParams });
    } else {
      this.router.navigate(['/sinistres']);
    }
  }
}