import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EstimationService } from '../../../services/estimation';
import { EstimationResult, DossierSimilaire } from '../../../models/estimation';
import { ExportService } from '../../../services/export.service';

@Component({
  selector: 'app-resultat',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resultat.component.html',
  styleUrls: ['./resultat.component.css']
})
export class ResultatComponent implements OnInit, AfterViewInit {
  nbJours!: number;
  codesLesions: string[] = [];
  estimation!: EstimationResult;
  dossiersSimilaires: DossierSimilaire[] = [];
  isLoading = true;
  displayTaux = 0;
  isEstimationComplete = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private estimationService: EstimationService,
    private cdr: ChangeDetectorRef,
    private exportService: ExportService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (!params['nbJours'] || !params['codes']) {
        this.router.navigate(['/estimation']);
        return;
      }
      
      this.nbJours = +params['nbJours'];
      this.codesLesions = params['codes'] ? params['codes'].split(',') : [];
      
      this.loadEstimation();
    });
  }

  ngAfterViewInit() {
    this.animateGauge();
  }

  loadEstimation() {
    this.isLoading = true;
    
    this.estimationService.estimerIPP(this.nbJours, this.codesLesions).subscribe({
        next: (estimation) => {
            this.estimation = estimation;
            this.dossiersSimilaires = estimation.dossiersSimilaires || [];
            this.isLoading = false;
            this.isEstimationComplete = true;
            this.cdr.detectChanges();
            
            setTimeout(() => {
                this.animateGauge();
            }, 300);
        },
        error: (err) => {
            console.error('Erreur:', err);
            this.isLoading = false;
        }
    });
}


  animateGauge() {
    if (!this.estimation) return;
    
    const target = this.estimation.tauxEstime;
    let current = 0;
    const step = target / 30;
    
    const interval = setInterval(() => {
      current = Math.min(current + step, target);
      this.displayTaux = Math.round(current);
      
      const fill = document.getElementById('gauge-fill');
      if (fill) {
        fill.style.width = Math.min(current, 100) + '%';
      }
      
      const display = document.getElementById('ipp-display');
      if (display) {
        display.textContent = Math.round(current) + '%';
      }
      
      if (current >= target) {
        clearInterval(interval);
        this.cdr.detectChanges();
      }
    }, 35);
  }

  getSeverity(ipp: number) {
    if (ipp < 10) return { label: 'Faible', cls: 'sev-low', icon: 'fa-circle-check' };
    if (ipp < 25) return { label: 'Modéré', cls: 'sev-mid', icon: 'fa-exclamation-circle' };
    return { label: 'Élevé', cls: 'sev-high', icon: 'fa-exclamation-triangle' };
  }

  getLesionLabel(code: string): string {
    const labels: { [key: string]: string } = {
      'L01': 'Fracture fémur',
      'L02': 'Fracture tibia/péroné',
      'L03': 'Fracture rotule',
      'L04': 'Fracture bassin',
      'L05': 'Fracture vertèbre cervicale',
      'L06': 'Fracture vertèbre lombaire',
      'L07': 'Fracture côtes',
      'L08': 'Fracture clavicule',
      'L09': 'Fracture humérus',
      'L10': 'Fracture radius/cubitus',
      'L11': 'Fracture poignet/main',
      'L12': 'Fracture pied/cheville',
      'L13': 'Entorse cervicale',
      'L14': 'Entorse genou',
      'L15': 'Entorse cheville',
      'L16': 'Traumatisme crânien léger',
      'L17': 'Traumatisme crânien grave',
      'L18': 'Lésion médullaire',
      'L19': 'Rupture ligament croisé',
      'L20': 'Luxation épaule',
      'L21': 'Luxation hanche',
      'L22': 'Plaie profonde',
      'L23': 'Brûlure',
      'L24': 'Lésion nerveuse',
      'L25': 'Contusion thoracique'
    };
    return labels[code] || code;
  }

  nouvelleEstimation() {
    this.router.navigate(['/estimation']);
  }

  goToDossierDetail(id: string) {
    this.router.navigate(['/dossier', id]);
  }
  
  exporterPDF() {
  this.exportService.exporterEstimationPDF(
    this.nbJours,
    this.codesLesions.map(c => this.getLesionLabel(c)),
    this.estimation.tauxEstime,
    this.estimation.min,
    this.estimation.max,
    this.dossiersSimilaires.map(d => ({
      id: d.id,
      tauxIPP: d.ipp
    }))
  );
}


}