import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DossierService } from '../../../services/dossier.service';
import { Dossier } from '../../../models/dossier.model';
import { ToastService } from '../../../services/toast.service';
import { LesionService } from '../../../services/lesion';
import { Lesion } from '../../../models/lesion';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  today: Date = new Date();

  // Statistiques globales
  totalDossiers: number = 0;
  totalLesions: number = 0;
  tauxMoyen: number = 0;
  joursMoyen: number = 0;

  // Données pour les graphiques
  topLesions: { code: string; libelle: string; count: number }[] = [];
  distributionIPP: { range: string; count: number; min: number; max: number }[] = [];
  evolutionParMois: { mois: string; count: number; moisNum: string }[] = [];
  statutDistribution: { statut: string; count: number }[] = [];

  // État de chargement
  isLoading = true;
  allDossiers: Dossier[] = [];

  // Map des libellés
  private lesionMap: { [key: string]: string } = {};

  constructor(
    private router: Router,
    private dossierService: DossierService,
    private toastService: ToastService,
    private lesionService: LesionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.chargerLesionsEtDossiers();
  }

  chargerLesionsEtDossiers() {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.lesionService.getLesions().subscribe({
      next: (lesions: Lesion[]) => {
        this.lesionMap = {};
        lesions.forEach(l => {
          this.lesionMap[l.code] = l.libelle;
        });
        this.chargerDossiers();
      },
      error: (err: any) => {
        console.error('Erreur chargement lésions:', err);
        this.toastService.error('Erreur lors du chargement des lésions');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  chargerDossiers() {
    this.dossierService.getAllDossiers().subscribe({
      next: (dossiers: Dossier[]) => {
        this.allDossiers = dossiers;
        this.calculerStatistiques(dossiers);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Erreur chargement dossiers:', err);
        this.toastService.error('Erreur lors du chargement des données');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private getLesionLabel(code: string): string {
    return this.lesionMap[code] || code;
  }

  calculerStatistiques(dossiers: Dossier[]) {
    // 1. Total dossiers
    this.totalDossiers = dossiers.length;

    // 2. Taux IPP moyen
    const tauxValues = dossiers.filter(d => d.tauxIpp > 0).map(d => d.tauxIpp);
    this.tauxMoyen = tauxValues.length > 0 
      ? Math.round((tauxValues.reduce((a, b) => a + b, 0) / tauxValues.length) * 10) / 10 
      : 0;

    // 3. Jours ITT moyens
    this.joursMoyen = dossiers.length > 0 
      ? Math.round(dossiers.reduce((a, b) => a + b.nbJours, 0) / dossiers.length) 
      : 0;

    // 4. Top lésions
    const lesionCount: { [key: string]: number } = {};
    dossiers.forEach(d => {
      d.codeLesions.forEach(code => {
        lesionCount[code] = (lesionCount[code] || 0) + 1;
      });
    });
    this.topLesions = Object.entries(lesionCount)
      .map(([code, count]) => ({ 
        code, 
        libelle: this.getLesionLabel(code), 
        count 
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    this.totalLesions = Object.keys(lesionCount).length;

    // 5. Distribution des taux IPP (avec min/max pour le filtrage)
    const ranges = [
      { range: '0-5%', min: 0, max: 5 },
      { range: '5-10%', min: 5, max: 10 },
      { range: '10-15%', min: 10, max: 15 },
      { range: '15-20%', min: 15, max: 20 },
      { range: '20-25%', min: 20, max: 25 },
      { range: '25-30%', min: 25, max: 30 },
      { range: '30%+', min: 30, max: 100 }
    ];
    this.distributionIPP = ranges.map(r => ({
      range: r.range,
      count: dossiers.filter(d => d.tauxIpp >= r.min && d.tauxIpp < r.max).length,
      min: r.min,
      max: r.max
    }));

    // 6. Évolution mensuelle (avec moisNum pour le filtrage)
    const moisMap: { [key: string]: number } = {};
    dossiers.forEach(d => {
      if (d.dateCreation) {
        const mois = d.dateCreation.substring(0, 7);
        moisMap[mois] = (moisMap[mois] || 0) + 1;
      }
    });
    const moisNoms = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    this.evolutionParMois = Object.entries(moisMap)
      .map(([mois, count]) => ({
        mois: moisNoms[parseInt(mois.substring(5)) - 1] || mois,
        count,
        moisNum: mois.substring(5) // "03" pour Mars
      }))
      .sort((a, b) => moisNoms.indexOf(a.mois) - moisNoms.indexOf(b.mois));

    // 7. Distribution par statut
    const statutCount: { [key: string]: number } = {};
    dossiers.forEach(d => {
      statutCount[d.statut] = (statutCount[d.statut] || 0) + 1;
    });
    this.statutDistribution = Object.entries(statutCount).map(([statut, count]) => ({ statut, count }));
  }

  // ============================================================
  // ✅ MÉTHODES DE NAVIGATION AVEC FILTRES
  // ============================================================

  // Navigation vers tous les dossiers
  navigateToDossiers() {
    this.router.navigate(['/dossiers']);
  }

  // Navigation vers les dossiers par statut
  navigateToDossiersParStatut(statut: string) {
    this.router.navigate(['/dossiers'], { queryParams: { statut } });
  }

  // Navigation vers les dossiers par lésion
  navigateToDossiersParLesion(code: string) {
    this.router.navigate(['/dossiers'], { queryParams: { lesion: code } });
  }

  // Navigation vers les dossiers par mois (avec numéro du mois pour le filtrage)
  navigateToDossiersParMois(mois: string, moisNum: string) {
    this.router.navigate(['/dossiers'], { 
      queryParams: { mois: mois, moisNum: moisNum } 
    });
  }

  // Navigation vers les dossiers par tranche de taux IPP
  navigateToDossiersParTaux(range: string, min: number, max: number) {
    this.router.navigate(['/dossiers'], { 
      queryParams: { tauxMin: min, tauxMax: max } 
    });
  }

  // ============================================================
  // ✅ MÉTHODES UTILITAIRES
  // ============================================================

  getMaxCount(): number {
    return Math.max(...this.evolutionParMois.map(m => m.count), 1);
  }

  getMaxLesionCount(): number {
    return Math.max(...this.topLesions.map(l => l.count), 1);
  }
}
