// src/app/components/pages/sinistres/dashboard-sinistres/dashboard-sinistres.component.ts

import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { StatistiquesService, StatsParAnnee, RepartitionIPP, EvolutionAnnuelle } from '../../../../services/statistiques.service';
import { DonneesSinistreService } from '../../../../services/donnees-sinistre.service';
import { ToastService } from '../../../../services/toast.service';

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
  repartitionIPP: RepartitionIPP[] = [];
  evolutionAnnuelle: EvolutionAnnuelle[] = [];
  globalStats: any = {};
  topSinistres: any[] = [];
  derniersSinistres: any[] = [];
  anneesDisponibles: number[] = [];
  anneeFiltre: number | null = null;
  searchTerm: string = '';

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

  // ✅ Couleurs des graphiques
  colors = ['#3498db', '#2ecc71', '#f39c12', '#e74c3c', '#9b59b6', '#1abc9c', '#e67e22', '#34495e'];

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
    this.chargerTopSinistres();
    this.chargerDerniersSinistres();
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
      this.statistiquesService.getGlobalStats().toPromise()
    ]).then(([statsParAnnee, repartitionIPP, evolutionAnnuelle, globalStats]) => {
      this.statsParAnnee = statsParAnnee || [];
      this.repartitionIPP = repartitionIPP || [];
      this.evolutionAnnuelle = evolutionAnnuelle || [];
      this.globalStats = globalStats || {};

      // ✅ Extraire les années disponibles
      this.anneesDisponibles = this.statsParAnnee.map(s => s.annee).sort((a, b) => a - b);

      this.isLoading = false;
      this.cdr.detectChanges();

      // ✅ Créer les graphiques après le chargement
      setTimeout(() => {
        this.creerGraphiques();
      }, 300);

    }).catch((err) => {
      console.error('❌ Erreur:', err);
      this.toastService.error('❌ Erreur lors du chargement des statistiques', 4000);
      this.isLoading = false;
    });
  }

  chargerTopSinistres() {
    this.sinistreService.getAll().subscribe({
      next: (data) => {
        // ✅ Top 5 par RCC
        this.topSinistres = data
          .filter(s => s.rcc && s.rcc > 0)
          .sort((a, b) => (b.rcc || 0) - (a.rcc || 0))
          .slice(0, 5);
        console.log('🏆 Top 5 sinistres:', this.topSinistres);
      },
      error: (err) => {
        console.error('❌ Erreur top sinistres:', err);
      }
    });
  }

  chargerDerniersSinistres() {
    this.sinistreService.getAll().subscribe({
      next: (data) => {
        // ✅ Derniers sinistres (par date de création ou ID)
        this.derniersSinistres = data
          .sort((a, b) => (b.id || 0) - (a.id || 0))
          .slice(0, 5);
        console.log('⏰ Derniers sinistres:', this.derniersSinistres);
      },
      error: (err) => {
        console.error('❌ Erreur derniers sinistres:', err);
      }
    });
  }

  // ============================================================
  // FILTRES ET RECHERCHE
  // ============================================================

  appliquerFiltre() {
    // ✅ Filtrer les données par année
    if (this.anneeFiltre) {
      // Recharger avec le filtre
      this.isLoading = true;
      this.statistiquesService.getStatsParAnnee().toPromise().then((data) => {
        this.statsParAnnee = (data || []).filter(s => s.annee === this.anneeFiltre);
        this.isLoading = false;
        this.cdr.detectChanges();
        setTimeout(() => this.creerGraphiques(), 300);
      });
    } else {
      this.chargerDonnees();
    }
  }

  rechercherSinistre(term: string) {
    if (!term || term.trim() === '') {
      this.toastService.info('Veuillez entrer un numéro de sinistre');
      return;
    }
    this.router.navigate(['/sinistres'], { queryParams: { sin: term.trim() } });
  }

  // ============================================================
  // TENDANCES
  // ============================================================

  getTendance(champ: string): 'up' | 'down' | 'stable' {
    const valeurs = this.statsParAnnee.map(s => {
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
  // COULEURS PAR ANNÉE
  // ============================================================

  getCouleurParAnnee(annee: number): string {
    return this.couleursParAnnee[annee] || '#95a5a6';
  }

  // ============================================================
  // EXPORTATION
  // ============================================================

  exporterDashboardComplet() {
    const data = {
      dateExport: new Date().toISOString(),
      statistiques: this.statsParAnnee,
      repartitionIPP: this.repartitionIPP,
      evolution: this.evolutionAnnuelle,
      globalStats: this.globalStats,
      topSinistres: this.topSinistres,
      derniersSinistres: this.derniersSinistres
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-carte-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    this.toastService.success('✅ Dashboard exporté avec succès');
  }

  // ============================================================
  // NAVIGATION
  // ============================================================

  naviguerVersSinistres() {
    this.router.navigate(['/sinistres']);
  }

  // ============================================================
  // GRAPHIQUES
  // ============================================================

  creerGraphiques() {
    this.detruireGraphiques();
    this.creerGraphiqueEvolution();
    this.creerGraphiqueRepartition();
    this.creerGraphiqueIppMoyen();
    this.creerGraphiqueMontants();
    this.creerGraphiqueReglements();
  }

  // ✅ Graphique 1 : Évolution des sinistres (courbe)
  creerGraphiqueEvolution() {
    if (!this.chartEvolutionRef) return;

    const ctx = this.chartEvolutionRef.nativeElement.getContext('2d');
    const annees = this.evolutionAnnuelle.map(e => e.annee);
    const totals = this.evolutionAnnuelle.map(e => e.total);

    this.chartEvolution = new Chart(ctx, {
      type: 'line',
      data: {
        labels: annees,
        datasets: [
          {
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
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true, position: 'top' },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `Sinistres: ${context.parsed.y}`;
              }
            }
          }
        },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } }
        }
      }
    });
  }

  // ✅ Graphique 2 : Répartition IPP (camembert)
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
        }
      }
    });
  }

  // ✅ Graphique 3 : IPP Moyen par année (barres)
  creerGraphiqueIppMoyen() {
    if (!this.chartIppMoyenRef) return;

    const ctx = this.chartIppMoyenRef.nativeElement.getContext('2d');
    const annees = this.statsParAnnee.map(s => s.annee);
    const ippMoyen = this.statsParAnnee.map(s => s.ippMoyen);

    this.chartIppMoyen = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: annees,
        datasets: [{
          label: 'IPP Moyen (%)',
          data: ippMoyen,
          backgroundColor: annees.map(a => this.getCouleurParAnnee(a) + 'CC'),
          borderColor: annees.map(a => this.getCouleurParAnnee(a)),
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
                return `IPP Moyen: ${context.parsed.y}%`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { callback: function(value) { return value + '%'; } }
          }
        }
      }
    });
  }

  // ✅ Graphique 4 : Montants RCC + RCM (barres groupées)
  creerGraphiqueMontants() {
    if (!this.chartMontantsRef) return;

    const ctx = this.chartMontantsRef.nativeElement.getContext('2d');
    const annees = this.statsParAnnee.map(s => s.annee);
    const rcc = this.statsParAnnee.map(s => Math.round(s.rccTotal / 1000));
    const rcm = this.statsParAnnee.map(s => Math.round(s.rcmTotal / 1000));

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
                return `${context.dataset.label}: ${context.parsed.y} k DT`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { callback: function(value) { return value + ' k DT'; } }
          }
        }
      }
    });
  }

  // ✅ Graphique 5 : Évolution des règlements (NOUVEAU)
  creerGraphiqueReglements() {
    if (!this.chartReglementsRef) return;

    const ctx = this.chartReglementsRef.nativeElement.getContext('2d');
    const annees = this.statsParAnnee.map(s => s.annee);
    const totalReglements = this.statsParAnnee.map(s => Math.round((s.rccTotal + s.rcmTotal) / 1000));

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
                return `Règlements: ${context.parsed.y} k DT`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { callback: function(value) { return value + ' k DT'; } }
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
// MÉTHODES POUR LE TABLEAU DES STATISTIQUES PAR ANNÉE
// ============================================================

getTotalGeneral(champ: string): number {
  if (!this.statsParAnnee || this.statsParAnnee.length === 0) return 0;
  return this.statsParAnnee.reduce((sum, stat) => {
    const val = stat[champ as keyof StatsParAnnee];
    return sum + (typeof val === 'number' ? val : 0);
  }, 0);
}

getMoyenneGenerale(champ: string): number {
  if (!this.statsParAnnee || this.statsParAnnee.length === 0) return 0;
  const total = this.statsParAnnee.reduce((sum, stat) => {
    const val = stat[champ as keyof StatsParAnnee];
    return sum + (typeof val === 'number' ? val : 0);
  }, 0);
  return Math.round((total / this.statsParAnnee.length) * 10) / 10;
}

}