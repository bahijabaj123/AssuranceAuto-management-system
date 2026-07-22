// src/app/components/pages/admin/dashboard-admin/dashboard-admin.component.ts
import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { StatistiquesAdminService, StatsGestionnaire, StatsParAnnee, StatsGlobales } from '../../../../services/statistiques-admin.service';
import { NavigationService } from '../../../../services/navigation.service';
import { ToastService } from '../../../../services/toast.service';
import { AuthService } from '../../../../services/auth.service';
import { HttpClient } from '@angular/common/http'; 
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['./dashboard-admin.component.css']
})
export class DashboardAdminComponent implements OnInit, AfterViewInit {

  @ViewChild('chartGestionnaires') chartGestionnairesRef!: ElementRef;
  @ViewChild('chartEvolution') chartEvolutionRef!: ElementRef;
  @ViewChild('chartNature') chartNatureRef!: ElementRef;
  @ViewChild('chartReglements') chartReglementsRef!: ElementRef;

  isLoading = true;
  isAdmin = false;

  statsGestionnaires: StatsGestionnaire[] = [];
  statsParAnnee: StatsParAnnee[] = [];
  statsGlobales: StatsGlobales = {
    totalDossiers: 0,
    totalGestionnaires: 0,
    totalReglements: 0,
    ippMoyenGlobal: 0,
    nbrJrsMoyenGlobal: 0,
    dossiersParNature: {}
  };

  anneesDisponibles: number[] = [];
  selectedAnnee: number | null = null;

  private charts: Chart[] = [];
  

  constructor(
    private statsService: StatistiquesAdminService,
    private toastService: ToastService,
    private authService: AuthService,
    private navigationService: NavigationService,
    private http: HttpClient  ) {}

  ngOnInit() {
    this.isAdmin = this.authService.isAdmin();
    if (!this.isAdmin) {
      this.toastService.error('❌ Accès réservé aux administrateurs', 4000);
      return;
    }
    this.chargerDonnees();
  }

  ngAfterViewInit() {
    // Les graphiques sont créés après le chargement
  }

  chargerDonnees() {
    this.isLoading = true;

    Promise.all([
      this.statsService.getStatsGestionnaires().toPromise(),
      this.statsService.getStatsParAnnee().toPromise(),
      this.statsService.getStatsGlobales().toPromise(),
      this.statsService.getUtilisateurs().toPromise()
    ]).then(([statsGestionnaires, statsParAnnee, statsGlobales, utilisateurs]) => {
      this.statsGestionnaires = statsGestionnaires || [];
      this.statsParAnnee = statsParAnnee || [];
      this.statsGlobales = statsGlobales || { totalDossiers: 0, totalGestionnaires: 0, totalReglements: 0, ippMoyenGlobal: 0, nbrJrsMoyenGlobal: 0, dossiersParNature: {} };
      
      this.anneesDisponibles = this.statsParAnnee.map(s => s.annee).sort((a, b) => a - b);
      
      if (utilisateurs) {
        this.statsGlobales.totalGestionnaires = utilisateurs.filter((u: any) => u.role !== 'ADMIN').length;
      }

      this.isLoading = false;

      setTimeout(() => {
        this.creerGraphiques();
      }, 300);

    }).catch((err: any) => {
      console.error('❌ Erreur:', err);
      this.toastService.error('❌ Erreur lors du chargement des statistiques', 4000);
      this.isLoading = false;
    });
  }

  filtrerParAnnee(annee: number | null): void {
    this.selectedAnnee = annee;
    this.charts.forEach(chart => chart.destroy());
    this.charts = [];
    this.creerGraphiques();
  }

  creerGraphiques() {
    this.creerGraphiqueGestionnaires();
    this.creerGraphiqueEvolution();
    this.creerGraphiqueNature();
    this.creerGraphiqueReglements();
  }

  creerGraphiqueGestionnaires() {
    if (!this.chartGestionnairesRef) return;

    const ctx = this.chartGestionnairesRef.nativeElement.getContext('2d');
    const labels = this.statsGestionnaires.map(s => `${s.prenom} ${s.nom}`);
    const data = this.statsGestionnaires.map(s => s.totalDossiers);
    const ids = this.statsGestionnaires.map(s => s.id);

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Nombre de dossiers',
          data: data,
          backgroundColor: [
            'rgba(52, 152, 219, 0.8)',
            'rgba(46, 204, 113, 0.8)',
            'rgba(243, 156, 18, 0.8)',
            'rgba(231, 76, 60, 0.8)',
            'rgba(155, 89, 182, 0.8)'
          ],
          borderColor: '#fff',
          borderWidth: 2,
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context: any) {
                return `Dossiers: ${context.parsed.x}`;
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: { stepSize: 1 }
          }
        },
        onClick: (event: any, elements: any[]) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const gestionnaireId = ids[index];
            const gestionnaire = this.statsGestionnaires[index];
            
            this.navigationService.naviguerVersRecherche({
              idUtilisateur: gestionnaireId
            });
            
            this.toastService.info(`📋 Affichage des dossiers de ${gestionnaire.prenom} ${gestionnaire.nom}`, 3000);
          }
        }
      }
    });

    this.charts.push(chart);
  }

  creerGraphiqueEvolution() {
    if (!this.chartEvolutionRef) return;

    let data = this.statsParAnnee;
    if (this.selectedAnnee) {
      data = data.filter(s => s.annee === this.selectedAnnee);
    }

    const ctx = this.chartEvolutionRef.nativeElement.getContext('2d');
    const annees = data.map(s => s.annee);
    const total = data.map(s => s.total);
    const civ = data.map(s => s.natureCiv);
    const corr = data.map(s => s.natureCorr);

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: annees,
        datasets: [
          {
            label: 'Total',
            data: total,
            borderColor: '#3498db',
            backgroundColor: 'rgba(52, 152, 219, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#3498db',
            pointRadius: 5
          },
          {
            label: 'CIV',
            data: civ,
            borderColor: '#2ecc71',
            backgroundColor: 'rgba(46, 204, 113, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#2ecc71',
            pointRadius: 5
          },
          {
            label: 'CORR',
            data: corr,
            borderColor: '#e74c3c',
            backgroundColor: 'rgba(231, 76, 60, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#e74c3c',
            pointRadius: 5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 }
          }
        },
        onClick: (event: any, elements: any[]) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const annee = annees[index];
            
            this.navigationService.naviguerVersRecherche({
              annee: annee
            });
            
            this.toastService.info(`📅 Affichage des dossiers de l'année ${annee}`, 3000);
          }
        }
      }
    });

    this.charts.push(chart);
  }

  creerGraphiqueNature() {
    if (!this.chartNatureRef) return;

    const ctx = this.chartNatureRef.nativeElement.getContext('2d');
    const natures = this.statsGlobales.dossiersParNature || {};
    const labels = Object.keys(natures);
    const data = Object.values(natures);
    const colors = {
      'CIV': '#3498db',
      'CIV-REF': '#5dade2',
      'CORR': '#e74c3c',
      'PENAL': '#f39c12',
      'ADMIN': '#2ecc71',
      'AUTRE': '#95a5a6'
    };

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: labels.map((l: string) => colors[l as keyof typeof colors] || '#95a5a6'),
          borderColor: '#fff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: function(context: any) {
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = total > 0 ? Math.round(context.parsed / total * 100) : 0;
                return `${context.label}: ${context.parsed} (${percentage}%)`;
              }
            }
          }
        },
        onClick: (event: any, elements: any[]) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const nature = labels[index];
            
            this.navigationService.naviguerVersRecherche({
              nature: nature
            });
            
            this.toastService.info(`📋 Affichage des dossiers de nature ${nature}`, 3000);
          }
        }
      }
    });

    this.charts.push(chart);
  }

  creerGraphiqueReglements() {
    if (!this.chartReglementsRef) return;

    let data = this.statsParAnnee;
    if (this.selectedAnnee) {
      data = data.filter(s => s.annee === this.selectedAnnee);
    }

    const ctx = this.chartReglementsRef.nativeElement.getContext('2d');
    const annees = data.map(s => s.annee);
    const reglements = data.map(s => Math.round(s.reglementsTotal / 1000));

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: annees,
        datasets: [{
          label: 'Règlements (en milliers DT)',
          data: reglements,
          backgroundColor: 'rgba(46, 204, 113, 0.7)',
          borderColor: '#2ecc71',
          borderWidth: 2,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context: any) {
                return `${context.parsed.y} k DT`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value: any) {
                return value + ' k DT';
              }
            }
          }
        },
        onClick: (event: any, elements: any[]) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const annee = annees[index];
            
            this.navigationService.naviguerVersRecherche({
              annee: annee
            });
            
            this.toastService.info(`📅 Affichage des dossiers de l'année ${annee} avec règlements`, 3000);
          }
        }
      }
    });

    this.charts.push(chart);
  }
  synchroniserTousLesDossiers() {
  this.isLoading = true;
  this.http.post('https://carte-assurance-backend.onrender.com/api/synchronisation/tous-les-dossiers', {}).subscribe({
    next: (response: any) => {
      this.toastService.success(`✅ ${response.message} - ${response.totalDossiers} dossiers traités`, 5000);
      this.isLoading = false;
    },
    error: (err) => {
      console.error('❌ Erreur:', err);
      this.toastService.error('❌ Erreur lors de la synchronisation', 4000);
      this.isLoading = false;
    }
  });
}
}
