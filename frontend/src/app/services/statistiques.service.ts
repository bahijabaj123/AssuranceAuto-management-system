// src/app/services/statistiques.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';

/* ============================================================= */
/* INTERFACES DU DASHBOARD                                       */
/* ============================================================= */

export interface DashboardFiltres {
  recherche: string;
  annee: number | null;
  utilisateurId: number | null;
  region: string;
  nature: string;
  statut: string;
  niveauAlerte: string;
  ippMin: number | null;
  ippMax: number | null;
}

export interface DashboardGlobalStats {
  totalDossiers: number;
  dossiersActifs: number;
  dossiersClotures: number;
  dossiersAvecIpp: number;
  dossiersSansTiers: number;
  dossiersAvecPlusieursTiers: number;
  dossiersIncomplets: number;
  alertesCritiques: number;
  alertesUrgentes: number;
  ippMoyen: number;
  nbrJrsMoyen: number;
  totalReglements: number;
  rccTotal: number;
  rcmTotal: number;
  tauxCompletude: number;
}

export interface EvolutionDashboard {
  periode: string;
  nouveaux: number;
  clotures: number;
}

export interface RepartitionDashboard {
  code?: string;
  libelle: string;
  total: number;
}

export interface StatistiqueGestionnaire {
  utilisateurId: number;
  nom: string;
  total: number;
  actifs?: number;
  alertes?: number;
}

export interface StatistiqueRegion {
  region: string;
  total: number;
}

export interface DashboardPriorite {
  id?: number;
  numSinistre?: string;
  nomTiers?: string;
  gestionnaire?: string;
  niveauAlerte?: string;
  joursRestants: number | null;
  typeProbleme?: string;
  message: string;
}

export interface DashboardData {
  globalStats: DashboardGlobalStats;
  evolution: EvolutionDashboard[];
  repartitionNature: RepartitionDashboard[];
  repartitionIpp: RepartitionDashboard[];
  gestionnaires: StatistiqueGestionnaire[];
  regions: StatistiqueRegion[];
  alertes: RepartitionDashboard[];
  priorites: DashboardPriorite[];
}

export interface GestionnaireDashboard {
  id: number;
  nom: string;
}

/* ============================================================= */
/* ANCIENNES INTERFACES (conservées pour compatibilité)          */
/* ============================================================= */

export interface StatsParAnnee {
  annee: number;
  total: number;
  ippMoyen: number;
  nbrJrsMoyen: number;
  rccTotal: number;
  rcmTotal: number;
}

export interface RepartitionIPP {
  tranche: string;
  count: number;
  pourcentage: number;
}

export interface EvolutionAnnuelle {
  annee: number;
  total: number;
  ippMoyen: number;
}

/* ============================================================= */
/* STRUCTURE DES DONNÉES                                         */
/* ============================================================= */

interface DonneeSinistre {
  id?: number;
  sin?: string | null;
  annee?: number | string | null;
  ipp?: number | string | null;
  nbrJrs?: number | string | null;
  rcc?: number | string | null;
  rcm?: number | string | null;
  dommage?: number | string | null;
  regRcc?: number | string | null;
  regRcm?: number | string | null;
  regDommagesVehicules?: number | string | null;
  regBrisGlaces?: number | string | null;
  regDomCollision?: number | string | null;
  regDommage?: number | string | null;
  regVol?: number | string | null;
  regInc?: number | string | null;
  regAfp?: number | string | null;
  regAux?: number | string | null;
  nomTiers?: string | null;
  tiers?: string | null;
  region?: string | null;
  nature?: string | null;
  natureAff?: string | null;
  statut?: string | null;
  utilisateurId?: number | null;
  proprietaireId?: number | null;
  gestionnaireId?: number | null;
  gestionnaire?: string | null;
  niveauAlerte?: string | null;
  joursRestants?: number | null;
  dateCreation?: string | null;
  dateModification?: string | null;
}

/* ============================================================= */
/* SERVICE                                                       */
/* ============================================================= */

@Injectable({
  providedIn: 'root'
})
export class StatistiquesService {

  private readonly apiUrl = 'http://localhost:8081/api/donnees-sinistres';

  constructor(private http: HttpClient) {}

  /* =========================================================== */
  /* RÉCUPÉRATION DES DONNÉES                                    */
  /* =========================================================== */

  getAll(): Observable<DonneeSinistre[]> {
    return this.http.get<DonneeSinistre[]>(this.apiUrl);
  }

  /* =========================================================== */
  /* NOUVEAU DASHBOARD                                           */
  /* =========================================================== */

  getDashboard(filtres: DashboardFiltres): Observable<DashboardData> {
    return this.getAll().pipe(
      map((donnees: DonneeSinistre[]) => {
        const donneesFiltrees = this.appliquerFiltres(donnees, filtres);

        return {
          globalStats: this.calculerStatistiquesGlobales(donneesFiltrees),
          evolution: this.calculerEvolution(donneesFiltrees),
          repartitionNature: this.calculerRepartitionNature(donneesFiltrees),
          repartitionIpp: this.calculerRepartitionIppDashboard(donneesFiltrees),
          gestionnaires: this.calculerRepartitionGestionnaires(donneesFiltrees),
          regions: this.calculerRepartitionRegions(donneesFiltrees),
          alertes: this.calculerRepartitionAlertes(donneesFiltrees),
          priorites: this.calculerPriorites(donneesFiltrees)
        };
      })
    );
  }

  getGestionnaires(): Observable<GestionnaireDashboard[]> {
    return of([
      { id: 1, nom: 'Anis' },
      { id: 2, nom: 'Zayneb' },
      { id: 3, nom: 'Nizar' },
      { id: 4, nom: 'Seif' },
      { id: 5, nom: 'Roukaya' }
    ]);
  }

  exporterDashboard(filtres: DashboardFiltres): Observable<Blob> {
    return this.getDashboard(filtres).pipe(
      map((dashboard: DashboardData) => {
        const lignes: string[] = [];

        lignes.push('Indicateur;Valeur');
        lignes.push(`Total dossiers;${dashboard.globalStats.totalDossiers}`);
        lignes.push(`Dossiers actifs;${dashboard.globalStats.dossiersActifs}`);
        lignes.push(`Dossiers clôturés;${dashboard.globalStats.dossiersClotures}`);
        lignes.push(`Dossiers avec IPP;${dashboard.globalStats.dossiersAvecIpp}`);
        lignes.push(`Dossiers sans tiers;${dashboard.globalStats.dossiersSansTiers}`);
        lignes.push(`Dossiers avec plusieurs tiers;${dashboard.globalStats.dossiersAvecPlusieursTiers}`);
        lignes.push(`Dossiers incomplets;${dashboard.globalStats.dossiersIncomplets}`);
        lignes.push(`Alertes critiques;${dashboard.globalStats.alertesCritiques}`);
        lignes.push(`Alertes urgentes;${dashboard.globalStats.alertesUrgentes}`);
        lignes.push(`IPP moyen;${dashboard.globalStats.ippMoyen}`);
        lignes.push(`Nombre de jours moyen;${dashboard.globalStats.nbrJrsMoyen}`);
        lignes.push(`Total règlements;${dashboard.globalStats.totalReglements}`);
        lignes.push(`Total RCC;${dashboard.globalStats.rccTotal}`);
        lignes.push(`Total RCM;${dashboard.globalStats.rcmTotal}`);
        lignes.push(`Taux de complétude;${dashboard.globalStats.tauxCompletude}%`);

        const contenu = '\uFEFF' + lignes.join('\n');
        return new Blob([contenu], { type: 'text/csv;charset=utf-8;' });
      })
    );
  }

  /* =========================================================== */
  /* ANCIENNES MÉTHODES (conservées pour compatibilité)          */
  /* =========================================================== */

  getStatsParAnnee(): Observable<StatsParAnnee[]> {
    return this.getAll().pipe(
      map((donnees: DonneeSinistre[]) => {
        const statistiques = new Map<number, {
          total: number;
          sommeIpp: number;
          nombreIpp: number;
          sommeJours: number;
          nombreJours: number;
          totalRcc: number;
          totalRcm: number;
        }>();

        donnees.forEach((donnee: DonneeSinistre) => {
          const annee = this.versNombre(donnee.annee);
          if (annee < 2020) return;

          if (!statistiques.has(annee)) {
            statistiques.set(annee, {
              total: 0,
              sommeIpp: 0,
              nombreIpp: 0,
              sommeJours: 0,
              nombreJours: 0,
              totalRcc: 0,
              totalRcm: 0
            });
          }

          const stat = statistiques.get(annee)!;
          stat.total++;

          const ipp = this.versNombre(donnee.ipp);
          if (ipp > 0 && ipp <= 100) {
            stat.sommeIpp += ipp;
            stat.nombreIpp++;
          }

          const jours = this.versNombre(donnee.nbrJrs);
          if (jours > 0) {
            stat.sommeJours += jours;
            stat.nombreJours++;
          }

          stat.totalRcc += this.versNombre(donnee.rcc);
          stat.totalRcm += this.versNombre(donnee.rcm);
        });

        return Array.from(statistiques.entries())
          .map(([annee, stat]) => ({
            annee,
            total: stat.total,
            ippMoyen: stat.nombreIpp > 0 ? this.arrondir(stat.sommeIpp / stat.nombreIpp, 1) : 0,
            nbrJrsMoyen: stat.nombreJours > 0 ? this.arrondir(stat.sommeJours / stat.nombreJours, 0) : 0,
            rccTotal: Math.round(stat.totalRcc),
            rcmTotal: Math.round(stat.totalRcm)
          }))
          .sort((a, b) => a.annee - b.annee);
      })
    );
  }

  getRepartitionIPP(): Observable<RepartitionIPP[]> {
    return this.getAll().pipe(
      map((donnees: DonneeSinistre[]) => {
        const tranches = [
          { tranche: '1%-19%', min: 1, max: 19, count: 0 },
          { tranche: '20%-79%', min: 20, max: 79, count: 0 },
          { tranche: '80%-100%', min: 80, max: 100, count: 0 }
        ];

        let totalValide = 0;

        donnees.forEach((donnee: DonneeSinistre) => {
          const ipp = this.versNombre(donnee.ipp);
          if (ipp <= 0 || ipp > 100) return;
          totalValide++;

          const tranche = tranches.find(t => ipp >= t.min && ipp <= t.max);
          if (tranche) tranche.count++;
        });

        return tranches.map(t => ({
          tranche: t.tranche,
          count: t.count,
          pourcentage: totalValide > 0 ? Math.round((t.count / totalValide) * 100) : 0
        }));
      })
    );
  }

  getEvolutionAnnuelle(): Observable<EvolutionAnnuelle[]> {
    return this.getStatsParAnnee().pipe(
      map((stats: StatsParAnnee[]) =>
        stats.map((stat: StatsParAnnee) => ({
          annee: stat.annee,
          total: stat.total,
          ippMoyen: stat.ippMoyen
        }))
      )
    );
  }

  getGlobalStats(): Observable<{
    total: number;
    ippMoyen: number;
    nbrJrsMoyen: number;
    rccTotal: number;
    rcmTotal: number;
    dommageTotal: number;
    avecIpp: number;
    avecNbrJrs: number;
  }> {
    return this.getAll().pipe(
      map((donnees: DonneeSinistre[]) => {
        let sommeIpp = 0, nombreIpp = 0;
        let sommeJours = 0, nombreJours = 0;
        let totalRcc = 0, totalRcm = 0, totalDommage = 0;

        donnees.forEach((donnee: DonneeSinistre) => {
          const ipp = this.versNombre(donnee.ipp);
          if (ipp > 0 && ipp <= 100) {
            sommeIpp += ipp;
            nombreIpp++;
          }

          const jours = this.versNombre(donnee.nbrJrs);
          if (jours > 0) {
            sommeJours += jours;
            nombreJours++;
          }

          totalRcc += this.versNombre(donnee.rcc);
          totalRcm += this.versNombre(donnee.rcm);
          totalDommage += this.versNombre(donnee.dommage);
        });

        return {
          total: donnees.length,
          ippMoyen: nombreIpp > 0 ? this.arrondir(sommeIpp / nombreIpp, 1) : 0,
          nbrJrsMoyen: nombreJours > 0 ? this.arrondir(sommeJours / nombreJours, 0) : 0,
          rccTotal: Math.round(totalRcc),
          rcmTotal: Math.round(totalRcm),
          dommageTotal: Math.round(totalDommage),
          avecIpp: nombreIpp,
          avecNbrJrs: nombreJours
        };
      })
    );
  }

  /* =========================================================== */
  /* MÉTHODES PRIVÉES                                            */
  /* =========================================================== */

  private appliquerFiltres(donnees: DonneeSinistre[], filtres: DashboardFiltres): DonneeSinistre[] {
    return donnees.filter((donnee: DonneeSinistre) => {
      // Recherche
      if (filtres.recherche.trim()) {
        const recherche = this.normaliserTexte(filtres.recherche);
        const sin = this.normaliserTexte(donnee.sin);
        const tiers = this.normaliserTexte(donnee.nomTiers || donnee.tiers);
        if (!sin.includes(recherche) && !tiers.includes(recherche)) {
          return false;
        }
      }

      // Année
      if (filtres.annee !== null && this.versNombre(donnee.annee) !== filtres.annee) {
        return false;
      }

      // Utilisateur
      if (filtres.utilisateurId !== null) {
        const userId = donnee.utilisateurId ?? donnee.proprietaireId ?? donnee.gestionnaireId;
        if (userId !== null && userId !== undefined && userId !== filtres.utilisateurId) {
          return false;
        }
      }

      // Région
      if (filtres.region && this.normaliserTexte(donnee.region) !== this.normaliserTexte(filtres.region)) {
        return false;
      }

      // Nature
      if (filtres.nature && this.normaliserNature(donnee.natureAff || donnee.nature) !== this.normaliserNature(filtres.nature)) {
        return false;
      }

      // Statut
      if (filtres.statut && this.normaliserTexte(donnee.statut) !== this.normaliserTexte(filtres.statut)) {
        return false;
      }

      // Niveau d'alerte
      if (filtres.niveauAlerte) {
        const niveau = this.normaliserTexte(donnee.niveauAlerte);
        if (filtres.niveauAlerte === 'AUCUNE') {
          if (niveau) return false;
        } else if (niveau !== this.normaliserTexte(filtres.niveauAlerte)) {
          return false;
        }
      }

      // IPP min/max
      const ipp = this.versNombre(donnee.ipp);
      if (filtres.ippMin !== null && ipp < filtres.ippMin) return false;
      if (filtres.ippMax !== null && ipp > filtres.ippMax) return false;

      return true;
    });
  }

  private calculerStatistiquesGlobales(donnees: DonneeSinistre[]): DashboardGlobalStats {
    let dossiersActifs = 0, dossiersClotures = 0;
    let sommeIpp = 0, nombreIpp = 0;
    let sommeJours = 0, nombreJours = 0;
    let totalRcc = 0, totalRcm = 0, totalReglements = 0;
    let dossiersSansTiers = 0, dossiersIncomplets = 0;
    let alertesCritiques = 0, alertesUrgentes = 0;
    let nombreChampsComplets = 0;
    const occurrencesSinistre = new Map<string, number>();

    donnees.forEach((donnee: DonneeSinistre) => {
      const sin = String(donnee.sin || '').trim();
      const tiers = String(donnee.nomTiers || donnee.tiers || '').trim();
      const ipp = this.versNombre(donnee.ipp);
      const jours = this.versNombre(donnee.nbrJrs);
      const statut = this.normaliserTexte(donnee.statut);
      const niveauAlerte = this.normaliserTexte(donnee.niveauAlerte);

      // Statut
      if (statut === 'CLOTURE' || statut === 'CLOTUREE') {
        dossiersClotures++;
      } else {
        dossiersActifs++;
      }

      // IPP
      if (ipp > 0 && ipp <= 100) {
        sommeIpp += ipp;
        nombreIpp++;
      }

      // Jours
      if (jours > 0) {
        sommeJours += jours;
        nombreJours++;
      }

      // Règlements
      totalRcc += this.versNombre(donnee.rcc);
      totalRcm += this.versNombre(donnee.rcm);
      totalReglements += this.calculerReglements(donnee);

      // Tiers
      if (!tiers) dossiersSansTiers++;

      // Incomplets
      if (!sin || !tiers || ipp <= 0 || jours <= 0) {
        dossiersIncomplets++;
      }

      // Alertes
      if (niveauAlerte === 'CRITIQUE') alertesCritiques++;
      if (niveauAlerte === 'URGENTE') alertesUrgentes++;

      // Occurrences
      if (sin) {
        occurrencesSinistre.set(sin, (occurrencesSinistre.get(sin) || 0) + 1);
        nombreChampsComplets++;
      }
      if (tiers) nombreChampsComplets++;
      if (ipp > 0) nombreChampsComplets++;
      if (jours > 0) nombreChampsComplets++;
    });

    const dossiersAvecPlusieursTiers = Array.from(occurrencesSinistre.values()).filter(v => v > 1).length;
    const nbChampsAttendus = donnees.length * 4;
    const tauxCompletude = nbChampsAttendus > 0 ? this.arrondir((nombreChampsComplets / nbChampsAttendus) * 100, 1) : 0;

    return {
      totalDossiers: donnees.length,
      dossiersActifs,
      dossiersClotures,
      dossiersAvecIpp: nombreIpp,
      dossiersSansTiers,
      dossiersAvecPlusieursTiers,
      dossiersIncomplets,
      alertesCritiques,
      alertesUrgentes,
      ippMoyen: nombreIpp > 0 ? this.arrondir(sommeIpp / nombreIpp, 1) : 0,
      nbrJrsMoyen: nombreJours > 0 ? this.arrondir(sommeJours / nombreJours, 1) : 0,
      totalReglements: Math.round(totalReglements),
      rccTotal: Math.round(totalRcc),
      rcmTotal: Math.round(totalRcm),
      tauxCompletude
    };
  }

  private calculerEvolution(donnees: DonneeSinistre[]): EvolutionDashboard[] {
    const evolution = new Map<number, { nouveaux: number; clotures: number }>();

    donnees.forEach((donnee: DonneeSinistre) => {
      const annee = this.versNombre(donnee.annee);
      if (annee <= 0) return;

      if (!evolution.has(annee)) {
        evolution.set(annee, { nouveaux: 0, clotures: 0 });
      }

      const val = evolution.get(annee)!;
      val.nouveaux++;

      const statut = this.normaliserTexte(donnee.statut);
      if (statut === 'CLOTURE' || statut === 'CLOTUREE') {
        val.clotures++;
      }
    });

    return Array.from(evolution.entries())
      .map(([annee, val]) => ({
        periode: String(annee),
        nouveaux: val.nouveaux,
        clotures: val.clotures
      }))
      .sort((a, b) => Number(a.periode) - Number(b.periode));
  }

  private calculerRepartitionNature(donnees: DonneeSinistre[]): RepartitionDashboard[] {
    const compteurs = new Map<string, number>();

    donnees.forEach((donnee: DonneeSinistre) => {
      const nature = this.normaliserNature(donnee.natureAff || donnee.nature);
      compteurs.set(nature, (compteurs.get(nature) || 0) + 1);
    });

    return Array.from(compteurs.entries())
      .map(([nature, total]) => ({ code: nature, libelle: nature, total }))
      .sort((a, b) => b.total - a.total);
  }

  private calculerRepartitionIppDashboard(donnees: DonneeSinistre[]): RepartitionDashboard[] {
    const repartition: RepartitionDashboard[] = [
      { code: 'IPP_0', libelle: '0 %', total: 0 },
      { code: 'IPP_1_10', libelle: '1 à 10 %', total: 0 },
      { code: 'IPP_11_20', libelle: '11 à 20 %', total: 0 },
      { code: 'IPP_21_40', libelle: '21 à 40 %', total: 0 },
      { code: 'IPP_PLUS_40', libelle: 'Plus de 40 %', total: 0 },
      { code: 'IPP_VIDE', libelle: 'Non renseigné', total: 0 }
    ];

    donnees.forEach((donnee: DonneeSinistre) => {
      const valeurBrute = donnee.ipp;
      const ipp = this.versNombre(valeurBrute);

      if (valeurBrute === null || valeurBrute === undefined || String(valeurBrute).trim() === '') {
        repartition[5].total++;
      } else if (ipp === 0) {
        repartition[0].total++;
      } else if (ipp <= 10) {
        repartition[1].total++;
      } else if (ipp <= 20) {
        repartition[2].total++;
      } else if (ipp <= 40) {
        repartition[3].total++;
      } else {
        repartition[4].total++;
      }
    });

    return repartition;
  }

  private calculerRepartitionGestionnaires(donnees: DonneeSinistre[]): StatistiqueGestionnaire[] {
    const noms: Record<number, string> = { 0: 'Roukaya', 1: 'Anis', 2: 'Zayneb', 3: 'Nizar', 4: 'Seif' };
    const compteurs = new Map<number, { nom: string; total: number; actifs: number; alertes: number }>();

    donnees.forEach((donnee: DonneeSinistre) => {
      const userId = donnee.utilisateurId ?? donnee.proprietaireId ?? donnee.gestionnaireId ?? 0;
      const nom = donnee.gestionnaire || noms[userId] || `Utilisateur ${userId}`;

      if (!compteurs.has(userId)) {
        compteurs.set(userId, { nom, total: 0, actifs: 0, alertes: 0 });
      }

      const compteur = compteurs.get(userId)!;
      compteur.total++;

      const statut = this.normaliserTexte(donnee.statut);
      if (statut !== 'CLOTURE' && statut !== 'CLOTUREE') {
        compteur.actifs++;
      }

      if (this.normaliserTexte(donnee.niveauAlerte)) {
        compteur.alertes++;
      }
    });

    return Array.from(compteurs.entries())
      .map(([userId, compteur]) => ({
        utilisateurId: userId,
        nom: compteur.nom,
        total: compteur.total,
        actifs: compteur.actifs,
        alertes: compteur.alertes
      }))
      .sort((a, b) => b.total - a.total);
  }

  private calculerRepartitionRegions(donnees: DonneeSinistre[]): StatistiqueRegion[] {
    const compteurs = new Map<string, number>();

    donnees.forEach((donnee: DonneeSinistre) => {
      const region = String(donnee.region || 'Non renseignée').trim();
      compteurs.set(region, (compteurs.get(region) || 0) + 1);
    });

    return Array.from(compteurs.entries())
      .map(([region, total]) => ({ region, total }))
      .sort((a, b) => b.total - a.total);
  }

  private calculerRepartitionAlertes(donnees: DonneeSinistre[]): RepartitionDashboard[] {
    const alertes: RepartitionDashboard[] = [
      { code: 'CRITIQUE', libelle: 'Critiques', total: 0 },
      { code: 'URGENTE', libelle: 'Urgentes', total: 0 },
      { code: 'SURVEILLANCE', libelle: 'À surveiller', total: 0 },
      { code: 'AUCUNE', libelle: 'Sans alerte', total: 0 }
    ];

    donnees.forEach((donnee: DonneeSinistre) => {
      const niveau = this.normaliserTexte(donnee.niveauAlerte);
      if (niveau === 'CRITIQUE') alertes[0].total++;
      else if (niveau === 'URGENTE') alertes[1].total++;
      else if (niveau === 'SURVEILLANCE') alertes[2].total++;
      else alertes[3].total++;
    });

    return alertes;
  }

  private calculerPriorites(donnees: DonneeSinistre[]): DashboardPriorite[] {
    const priorites: DashboardPriorite[] = [];

    donnees.forEach((donnee: DonneeSinistre) => {
      const niveau = this.normaliserTexte(donnee.niveauAlerte);
      const tiers = String(donnee.nomTiers || donnee.tiers || '').trim();
      const ipp = this.versNombre(donnee.ipp);
      const jours = this.versNombre(donnee.nbrJrs);

      // Alertes de niveau
      if (niveau === 'CRITIQUE' || niveau === 'URGENTE' || niveau === 'SURVEILLANCE') {
        priorites.push({
          id: donnee.id,
          numSinistre: donnee.sin || undefined,
          nomTiers: tiers || undefined,
          gestionnaire: donnee.gestionnaire || undefined,
          niveauAlerte: niveau,
          joursRestants: donnee.joursRestants ?? null,
          typeProbleme: 'ECHEANCE',
          message: niveau === 'CRITIQUE'
            ? 'Échéance critique nécessitant une intervention immédiate'
            : niveau === 'URGENTE'
            ? 'Échéance proche à traiter rapidement'
            : 'Dossier à surveiller'
        });
      }

      // Tiers manquant
      if (!tiers) {
        priorites.push({
          id: donnee.id,
          numSinistre: donnee.sin || undefined,
          gestionnaire: donnee.gestionnaire || undefined,
          niveauAlerte: 'SURVEILLANCE',
          joursRestants: null,
          typeProbleme: 'TIERS_MANQUANT',
          message: 'Le nom du tiers n’est pas renseigné'
        });
      }

      // IPP manquant
      if (ipp <= 0) {
        priorites.push({
          id: donnee.id,
          numSinistre: donnee.sin || undefined,
          nomTiers: tiers || undefined,
          gestionnaire: donnee.gestionnaire || undefined,
          niveauAlerte: 'SURVEILLANCE',
          joursRestants: null,
          typeProbleme: 'IPP_MANQUANT',
          message: 'Le taux IPP n’est pas renseigné'
        });
      }

      // Jours manquants
      if (jours <= 0) {
        priorites.push({
          id: donnee.id,
          numSinistre: donnee.sin || undefined,
          nomTiers: tiers || undefined,
          gestionnaire: donnee.gestionnaire || undefined,
          niveauAlerte: 'SURVEILLANCE',
          joursRestants: null,
          typeProbleme: 'NBR_JRS_MANQUANT',
          message: 'Le nombre de jours n’est pas renseigné'
        });
      }
    });

    const ordre: Record<string, number> = { CRITIQUE: 1, URGENTE: 2, SURVEILLANCE: 3 };
    return priorites
      .sort((a, b) => (ordre[a.niveauAlerte || ''] || 9) - (ordre[b.niveauAlerte || ''] || 9))
      .slice(0, 30);
  }

  // ============================================================
  // MÉTHODES UTILITAIRES
  // ============================================================

  private calculerReglements(donnee: DonneeSinistre): number {
  const valeurs: number[] = [
    this.versNombre(donnee.regRcc),
    this.versNombre(donnee.regRcm),
    this.versNombre(donnee.regDommagesVehicules),
    this.versNombre(donnee.regBrisGlaces),
    this.versNombre(donnee.regDomCollision),
    this.versNombre(donnee.regDommage),
    this.versNombre(donnee.regVol),
    this.versNombre(donnee.regInc),
    this.versNombre(donnee.regAfp),
    this.versNombre(donnee.regAux)
  ];
  
  return valeurs.reduce((somme: number, val: number) => somme + val, 0);
}

  private versNombre(valeur: number | string | null | undefined): number {
    if (valeur === null || valeur === undefined || valeur === '') return 0;
    if (typeof valeur === 'number') return Number.isFinite(valeur) ? valeur : 0;
    const texte = valeur.replace('%', '').replace(/\s/g, '').replace(',', '.');
    const nombre = Number.parseFloat(texte);
    return Number.isFinite(nombre) ? nombre : 0;
  }

  private normaliserTexte(valeur: string | null | undefined): string {
    return String(valeur || '').trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  private normaliserNature(valeur: string | null | undefined): string {
    const nature = this.normaliserTexte(valeur);
    if (nature.includes('CIV')) return 'CIV';
    if (nature.includes('CORR') || nature.includes('CORPOREL')) return 'CORR';
    if (nature.includes('PENAL')) return 'PENAL';
    if (nature.includes('ADMIN')) return 'ADMIN';
    return nature || 'NON RENSEIGNE';
  }

  private arrondir(valeur: number, decimales: number): number {
    const facteur = Math.pow(10, decimales);
    return Math.round(valeur * facteur) / facteur;
  }
}