// src/app/components/pages/sinistres/dashboard-sinistres/dashboard-sinistres.component.ts

import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Chart, registerables, ChartEvent, ActiveElement } from 'chart.js';
import {
  StatistiquesService,
  StatsParAnnee,
  RepartitionIPP,
  EvolutionAnnuelle,
  CoutMoyenDossier,
  MoyenneMultiAnnees
} from '../../../../services/statistiques.service';
import { DonneesSinistreService } from '../../../../services/donnees-sinistre.service';
import { ToastService } from '../../../../services/toast.service';
import * as XLSX from 'xlsx';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-sinistres',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dashboard-sinistres.component.html',
  styleUrls: ['./dashboard-sinistres.component.css']
})
export class DashboardSinistresComponent implements OnInit, AfterViewInit {

  @ViewChild('chartEvolution') chartEvolutionRef!: ElementRef;
  @ViewChild('chartRepartition') chartRepartitionRef!: ElementRef;
  @ViewChild('chartIppMoyen') chartIppMoyenRef!: ElementRef;
  @ViewChild('chartMontants') chartMontantsRef!: ElementRef;
  @ViewChild('chartReglements') chartReglementsRef!: ElementRef;

  isLoading = true;
  statsParAnnee: StatsParAnnee[] = [];
  statsParAnneeFiltrees: StatsParAnnee[] = [];
  repartitionIPP: RepartitionIPP[] = [];
  evolutionAnnuelle: EvolutionAnnuelle[] = [];
  evolutionAnnuelleFiltree: EvolutionAnnuelle[] = [];
  globalStats: any = {};
  globalStatsFiltrees: any = {};
  topSinistres: any[] = [];
  topSinistresFiltres: any[] = [];
  derniersSinistres: any[] = [];
  anneesDisponibles: number[] = [];
  anneeFiltre: number | null = null;
  searchTerm: string = '';
  allSinistres: any[] = [];

  // ✅ Coût moyen par dossier
  coutMoyenDossier: CoutMoyenDossier | null = null;
  moyenneMultiAnnees: MoyenneMultiAnnees | null = null;

  // ✅ Couleurs personnalisées par année
  couleursParAnnee: { [key: number]: string } = {
    2022: '#3498db',
    2023: '#2ecc71',
    2024: '#f39c12',
    2025: '#e74c3c',
    2026: '#9b59b6',
    2027: '#1abc9c',
    2028: '#e67e22',
    2029: '#34495e',
    2030: '#2c3e50'
  };

  // ✅ Charts
  private chartEvolution: Chart | null = null;
  private chartRepartition: Chart | null = null;
  private chartIppMoyen: Chart | null = null;
  private chartMontants: Chart | null = null;
  private chartReglements: Chart | null = null;

  constructor(
    private statistiquesService: StatistiquesService,
    private sinistreService: DonneesSinistreService,
    private toastService: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.chargerDonnees();
  }

  ngAfterViewInit() {
    // Les graphiques sont créés après le chargement des données
  }

  // ============================================================
  // CHARGEMENT DES DONNÉES
  // ============================================================

  chargerDonnees() {
    this.isLoading = true;

    Promise.all([
      this.statistiquesService.getStatsParAnnee().toPromise(),
      this.statistiquesService.getRepartitionIPP().toPromise(),
      this.statistiquesService.getEvolutionAnnuelle().toPromise(),
      this.statistiquesService.getGlobalStats().toPromise(),
      this.sinistreService.getAll().toPromise(),
      this.statistiquesService.getMoyenneMultiAnnees().toPromise()
    ]).then(([statsParAnnee, repartitionIPP, evolutionAnnuelle, globalStats, sinistres, moyenneMultiAnnees]) => {
      this.statsParAnnee = statsParAnnee || [];
      this.repartitionIPP = repartitionIPP || [];
      this.evolutionAnnuelle = evolutionAnnuelle || [];
      this.globalStats = globalStats || {};
      this.allSinistres = sinistres || [];
      this.moyenneMultiAnnees = moyenneMultiAnnees || null;

      // ✅ Extraire les années disponibles
      this.anneesDisponibles = this.statsParAnnee.map(s => s.annee).sort((a, b) => a - b);

      // ✅ Appliquer les filtres initiaux
      this.appliquerFiltresEtMettreAJour();

      this.isLoading = false;
      this.cdr.detectChanges();

    }).catch((err) => {
      console.error('❌ Erreur:', err);
      this.toastService.error('❌ Erreur lors du chargement des statistiques', 4000);
      this.isLoading = false;
    });
  }

  // ============================================================
  // FILTRES DYNAMIQUES
  // ============================================================

  appliquerFiltresEtMettreAJour() {
    // ✅ Filtrer les stats par année
    if (this.anneeFiltre) {
      this.statsParAnneeFiltrees = this.statsParAnnee.filter(s => s.annee === this.anneeFiltre);
      this.evolutionAnnuelleFiltree = this.evolutionAnnuelle.filter(e => e.annee === this.anneeFiltre);

      // ✅ Filtrer les sinistres pour le top et les récents
      this.topSinistresFiltres = this.allSinistres
        .filter(s => s.annee === this.anneeFiltre && s.rcc && s.rcc > 0)
        .sort((a, b) => (b.rcc || 0) - (a.rcc || 0))
        .slice(0, 5);

      // ✅ Recalculer les stats globales pour l'année filtrée
      const sinistresFiltres = this.allSinistres.filter(s => s.annee === this.anneeFiltre);
      this.globalStatsFiltrees = this.calculerStatsGlobales(sinistresFiltres);

    } else {
      this.statsParAnneeFiltrees = this.statsParAnnee;
      this.evolutionAnnuelleFiltree = this.evolutionAnnuelle;
      this.topSinistresFiltres = this.allSinistres
        .filter(s => s.rcc && s.rcc > 0)
        .sort((a, b) => (b.rcc || 0) - (a.rcc || 0))
        .slice(0, 5);
      this.globalStatsFiltrees = this.globalStats;
    }

    // ✅ Mettre à jour les derniers sinistres
    this.derniersSinistres = this.allSinistres
      .sort((a, b) => (b.id || 0) - (a.id || 0))
      .slice(0, 5);

    // ✅ Recalculer le coût moyen par dossier
    this.statistiquesService.getCoutMoyenDossier(this.anneeFiltre).subscribe({
      next: (res) => {
        this.coutMoyenDossier = res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Erreur coût moyen dossier:', err);
      }
    });

    // ✅ Recréer les graphiques
    setTimeout(() => {
      this.creerGraphiques();
    }, 300);
  }

  calculerStatsGlobales(sinistres: any[]): any {
    let sommeIpp = 0, nombreIpp = 0;
    let sommeJours = 0, nombreJours = 0;
    let totalRcc = 0, totalRcm = 0, totalReglements = 0;

    sinistres.forEach(s => {
      const ipp = parseFloat(s.ipp) || 0;
      if (ipp > 0 && ipp <= 100) {
        sommeIpp += ipp;
        nombreIpp++;
      }

      const jours = parseInt(s.nbrJrs) || 0;
      if (jours > 0) {
        sommeJours += jours;
        nombreJours++;
      }

      totalRcc += parseFloat(s.rcc) || 0;
      totalRcm += parseFloat(s.rcm) || 0;
      totalReglements += (parseFloat(s.rcc) || 0) + (parseFloat(s.rcm) || 0);
    });

    return {
      total: sinistres.length,
      ippMoyen: nombreIpp > 0 ? Math.round((sommeIpp / nombreIpp) * 10) / 10 : 0,
      nbrJrsMoyen: nombreJours > 0 ? Math.round((sommeJours / nombreJours) * 10) / 10 : 0,
      rccTotal: Math.round(totalRcc),
      rcmTotal: Math.round(totalRcm),
      totalReglements: Math.round(totalReglements),
      avecIpp: nombreIpp,
      avecNbrJrs: nombreJours
    };
  }

  appliquerFiltre() {
    this.appliquerFiltresEtMettreAJour();
  }

  // ============================================================
  // RECHERCHE
  // ============================================================

  rechercherSinistre(term: string) {
    if (!term || term.trim() === '') {
      this.toastService.info('Veuillez entrer un numéro de sinistre');
      return;
    }
    this.router.navigate(['/sinistres'], { queryParams: { sin: term.trim() } });
  }

  // ============================================================
  // NAVIGATION
  // ============================================================

  naviguerVersListe(queryParams: any = {}) {
    if (this.anneeFiltre) {
      queryParams.annee = this.anneeFiltre;
    }
    this.router.navigate(['/sinistres'], { queryParams });
  }

  naviguerParAnnee(annee: number) {
    this.router.navigate(['/sinistres'], { queryParams: { annee: annee } });
  }

  naviguerParTrancheIPP(tranche: string) {
    this.router.navigate(['/sinistres'], { queryParams: { trancheIpp: tranche } });
  }

  naviguerParTrancheNbrJr(tranche: string) {
    this.router.navigate(['/sinistres'], { 
      queryParams: { 
        trancheNbrJr: tranche,
        annee: this.anneeFiltre || undefined 
      } 
    });
  }

  naviguerParNature(nature: string) {
    this.router.navigate(['/sinistres'], { queryParams: { nature: nature } });
  }

  naviguerVersSinistre(id: number | undefined) {
    if (!id) {
      this.toastService.warning('Sinistre non trouvé');
      return;
    }
    this.router.navigate(['/sinistres/formulaire', id]);
  }

  // ============================================================
  // TENDANCES
  // ============================================================

  getTendance(champ: string): 'up' | 'down' | 'stable' {
    const valeurs = this.statsParAnneeFiltrees.map(s => {
      const val = s[champ as keyof StatsParAnnee];
      return typeof val === 'number' ? val : 0;
    }).filter(v => v > 0);

    if (valeurs.length < 2) return 'stable';

    const derniere = valeurs[valeurs.length - 1];
    const avantDerniere = valeurs[valeurs.length - 2];

    if (derniere > avantDerniere * 1.02) return 'up';
    if (derniere < avantDerniere * 0.98) return 'down';
    return 'stable';
  }

  getTendanceIcon(champ: string): string {
    const tendance = this.getTendance(champ);
    if (tendance === 'up') return 'fa-arrow-up text-green';
    if (tendance === 'down') return 'fa-arrow-down text-red';
    return 'fa-minus text-gray';
  }

  getTendanceLabel(champ: string): string {
    const tendance = this.getTendance(champ);
    if (tendance === 'up') return 'En hausse';
    if (tendance === 'down') return 'En baisse';
    return 'Stable';
  }

  // ============================================================
  // COULEURS
  // ============================================================

  getCouleurParAnnee(annee: number): string {
    return this.couleursParAnnee[annee] || '#95a5a6';
  }

  // ============================================================
  // EXPORTATION EXCEL
  // ============================================================

  exporterDashboardComplet() {
    try {
      const dataExport: any = {
        'Statistiques par année': this.statsParAnneeDisplay.map(s => ({
          'Année': s.annee,
          'Total sinistres': s.total,
          'IPP Moyen (%)': s.ippMoyen,
          'NBR JRS Moyen': s.nbrJrsMoyen,
          'RCC Total (DT)': s.rccTotal,
          'RCM Total (DT)': s.rcmTotal
        })),
        'Répartition IPP': this.repartitionIPP.map(r => ({
          'Tranche': r.tranche,
          'Nombre': r.count,
          'Pourcentage (%)': r.pourcentage
        })),
        'Top 5 Sinistres': this.topSinistresDisplay.map((s, i) => ({
          'Rang': i + 1,
          'SIN': s.sin,
          'Tiers': s.nomTiers || '—',
          'RCC (DT)': s.rcc || 0,
          'RCM (DT)': s.rcm || 0,
          'IPP (%)': s.ipp || '—',
          'NBR JRS': s.nbrJrs || '—'
        })),
        'Résumé Global': [{
          'Total sinistres': this.globalStatsDisplay.total || 0,
          'IPP Moyen (%)': this.globalStatsDisplay.ippMoyen || 0,
          'NBR JRS Moyen': this.globalStatsDisplay.nbrJrsMoyen || 0,
          'Total RCC (DT)': this.globalStatsDisplay.rccTotal || 0,
          'Total RCM (DT)': this.globalStatsDisplay.rcmTotal || 0,
          'Total Règlements (DT)': this.globalStatsDisplay.totalReglements || 0,
          'Avec IPP': this.globalStatsDisplay.avecIpp || 0
        }]
      };

      if (this.coutMoyenDossier) {
        dataExport['Coût moyen - Tranche IPP'] = this.coutMoyenDossier.parIpp.map(t => ({
          'Tranche IPP': t.tranche,
          'Nbr blessés': t.nbrBless,
          'Nbr dossiers': t.nbrDos,
          'Coût total (DT)': t.coutTotal,
          'Coût moyen / blessé (DT)': t.coutMoyen
        }));

        dataExport['Coût moyen - Tranche NBR-JR'] = this.coutMoyenDossier.parNbrJr.map(t => ({
          'Tranche NBR-JR': t.tranche,
          'Nbr blessés': t.nbrBless,
          'Coût total (DT)': t.coutTotal,
          'Coût moyen (DT)': t.coutMoyen
        }));
      }

      if (this.moyenneMultiAnnees) {
        dataExport['Moyenne multi-années'] = this.moyenneMultiAnnees.parIpp.map((t, i) => ({
          'Tranche IPP': t.tranche,
          'Moyenne IPP (DT)': t.moyenne,
          'Tranche NBR-JR': this.moyenneMultiAnnees!.parNbrJr[i]?.tranche || '',
          'Moyenne NBR-JR (DT)': this.moyenneMultiAnnees!.parNbrJr[i]?.moyenne || 0
        }));
      }

      const wb = XLSX.utils.book_new();

      Object.entries(dataExport).forEach(([nomFeuille, donnees]) => {
        const lignes = donnees as any[];
        if (lignes && lignes.length > 0) {
          const ws = XLSX.utils.json_to_sheet(lignes);
          XLSX.utils.book_append_sheet(wb, ws, nomFeuille);

          const colWidths = Object.keys(lignes[0]).map(key => ({
            wch: Math.max(key.length, 15)
          }));
          ws['!cols'] = colWidths;
        }
      });

      const nomFichier = `dashboard-carte-${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, nomFichier);

      this.toastService.success('✅ Dashboard exporté avec succès en Excel');
    } catch (error) {
      console.error('❌ Erreur export:', error);
      this.toastService.error('❌ Erreur lors de l\'export du dashboard', 4000);
    }
  }

  // ============================================================
  // GRAPHIQUES AVEC CLICK
  // ============================================================

  creerGraphiques() {
    this.detruireGraphiques();
    this.creerGraphiqueEvolution();
    this.creerGraphiqueRepartition();
    this.creerGraphiqueIppMoyen();
    this.creerGraphiqueMontants();
    this.creerGraphiqueReglements();
  }

  creerGraphiqueEvolution() {
    if (!this.chartEvolutionRef) return;

    const ctx = this.chartEvolutionRef.nativeElement.getContext('2d');
    const donneesTriees = [...this.evolutionAnnuelleFiltree].sort((a, b) => a.annee - b.annee);
    const annees = donneesTriees.map(e => e.annee);
    const totals = donneesTriees.map(e => e.total);

    this.chartEvolution = new Chart(ctx, {
      type: 'line',
      data: {
        labels: annees,
        datasets: [{
          label: 'Nombre de sinistres',
          data: totals,
          borderColor: '#3498db',
          backgroundColor: 'rgba(52, 152, 219, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: annees.map(a => this.getCouleurParAnnee(a)),
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true, position: 'top' },
          tooltip: {
            callbacks: {
              label: function(context) {
                const index = context.dataIndex;
                return `${annees[index]} : ${context.parsed.y} sinistres`;
              }
            }
          }
        },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
        onClick: (event: ChartEvent, elements: ActiveElement[]) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            this.naviguerParAnnee(annees[index]);
          }
        }
      }
    });
  }

  creerGraphiqueRepartition() {
    if (!this.chartRepartitionRef) return;

    const ctx = this.chartRepartitionRef.nativeElement.getContext('2d');
    const labels = this.repartitionIPP.map(r => r.tranche);
    const counts = this.repartitionIPP.map(r => r.count);
    const colors = ['#2ecc71', '#f39c12', '#e74c3c'];

    this.chartRepartition = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: counts,
          backgroundColor: colors,
          borderColor: '#fff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: function(context) {
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const value = context.parsed;
                const percentage = total > 0 ? Math.round(value / total * 100) : 0;
                return `${context.label}: ${value} (${percentage}%)`;
              }
            }
          }
        },
        onClick: (event: ChartEvent, elements: ActiveElement[]) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            this.naviguerParTrancheIPP(labels[index]);
          }
        }
      }
    });
  }

  creerGraphiqueIppMoyen() {
    if (!this.chartIppMoyenRef) return;

    const ctx = this.chartIppMoyenRef.nativeElement.getContext('2d');
    const donneesTriees = [...this.statsParAnneeFiltrees].sort((a, b) => a.annee - b.annee);
    const annees = donneesTriees.map(s => s.annee);
    const ippMoyen = donneesTriees.map(s => s.ippMoyen);
    const couleurs = donneesTriees.map(s => this.getCouleurParAnnee(s.annee));

    this.chartIppMoyen = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: annees,
        datasets: [{
          label: 'IPP Moyen (%)',
          data: ippMoyen,
          backgroundColor: couleurs.map(c => c + 'CC'),
          borderColor: couleurs,
          borderWidth: 2,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                const index = context.dataIndex;
                return `${annees[index]} : ${context.parsed.y}%`;
              }
            }
          }
        },
        scales: {
          y: { beginAtZero: true, ticks: { callback: function(value) { return value + '%'; } } }
        },
        onClick: (event: ChartEvent, elements: ActiveElement[]) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            this.naviguerParAnnee(annees[index]);
          }
        }
      }
    });
  }

  creerGraphiqueMontants() {
    if (!this.chartMontantsRef) return;

    const ctx = this.chartMontantsRef.nativeElement.getContext('2d');
    const donneesTriees = [...this.statsParAnneeFiltrees].sort((a, b) => a.annee - b.annee);
    const annees = donneesTriees.map(s => s.annee);
    const rcc = donneesTriees.map(s => Math.round(s.rccTotal / 1000));
    const rcm = donneesTriees.map(s => Math.round(s.rcmTotal / 1000));

    this.chartMontants = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: annees,
        datasets: [
          {
            label: 'RCC (en milliers)',
            data: rcc,
            backgroundColor: 'rgba(52, 152, 219, 0.7)',
            borderColor: '#3498db',
            borderWidth: 2,
            borderRadius: 4
          },
          {
            label: 'RCM (en milliers)',
            data: rcm,
            backgroundColor: 'rgba(46, 204, 113, 0.7)',
            borderColor: '#2ecc71',
            borderWidth: 2,
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: function(context) {
                const index = context.dataIndex;
                return `${annees[index]} - ${context.dataset.label}: ${context.parsed.y} k DT`;
              }
            }
          }
        },
        scales: {
          y: { beginAtZero: true, ticks: { callback: function(value) { return value + ' k DT'; } } }
        },
        onClick: (event: ChartEvent, elements: ActiveElement[]) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            this.naviguerParAnnee(annees[index]);
          }
        }
      }
    });
  }

  creerGraphiqueReglements() {
    if (!this.chartReglementsRef) return;

    const ctx = this.chartReglementsRef.nativeElement.getContext('2d');
    const donneesTriees = [...this.statsParAnneeFiltrees].sort((a, b) => a.annee - b.annee);
    const annees = donneesTriees.map(s => s.annee);
    const totalReglements = donneesTriees.map(s => Math.round((s.rccTotal + s.rcmTotal) / 1000));

    this.chartReglements = new Chart(ctx, {
      type: 'line',
      data: {
        labels: annees,
        datasets: [{
          label: 'Total règlements (en milliers)',
          data: totalReglements,
          borderColor: '#e67e22',
          backgroundColor: 'rgba(230, 126, 34, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#e67e22',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true, position: 'top' },
          tooltip: {
            callbacks: {
              label: function(context) {
                const index = context.dataIndex;
                return `${annees[index]} : ${context.parsed.y} k DT`;
              }
            }
          }
        },
        scales: {
          y: { beginAtZero: true, ticks: { callback: function(value) { return value + ' k DT'; } } }
        },
        onClick: (event: ChartEvent, elements: ActiveElement[]) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            this.naviguerParAnnee(annees[index]);
          }
        }
      }
    });
  }

  detruireGraphiques() {
    if (this.chartEvolution) { this.chartEvolution.destroy(); this.chartEvolution = null; }
    if (this.chartRepartition) { this.chartRepartition.destroy(); this.chartRepartition = null; }
    if (this.chartIppMoyen) { this.chartIppMoyen.destroy(); this.chartIppMoyen = null; }
    if (this.chartMontants) { this.chartMontants.destroy(); this.chartMontants = null; }
    if (this.chartReglements) { this.chartReglements.destroy(); this.chartReglements = null; }
  }

  // ============================================================
  // MÉTHODES POUR LE TABLEAU
  // ============================================================

  getTotalGeneral(champ: string): number {
    if (!this.statsParAnneeFiltrees || this.statsParAnneeFiltrees.length === 0) return 0;
    return this.statsParAnneeFiltrees.reduce((sum, stat) => {
      const val = stat[champ as keyof StatsParAnnee];
      return sum + (typeof val === 'number' ? val : 0);
    }, 0);
  }

  getMoyenneGenerale(champ: string): number {
    if (!this.statsParAnneeFiltrees || this.statsParAnneeFiltrees.length === 0) return 0;
    const total = this.statsParAnneeFiltrees.reduce((sum, stat) => {
      const val = stat[champ as keyof StatsParAnnee];
      return sum + (typeof val === 'number' ? val : 0);
    }, 0);
    return Math.round((total / this.statsParAnneeFiltrees.length) * 10) / 10;
  }

  // ✅ GETTERS POUR LE TEMPLATE
  get globalStatsDisplay() {
    return this.globalStatsFiltrees;
  }

  get topSinistresDisplay() {
    return this.topSinistresFiltres;
  }

  get statsParAnneeDisplay() {
    return this.statsParAnneeFiltrees;
  }
}
