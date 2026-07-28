import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HistoriqueService, EstimationHistorique } from '../../../services/historique.service';
import { ExportService } from '../../../services/export.service';


@Component({
  selector: 'app-historique',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historique.component.html',
  styleUrls: ['./historique.component.css']
})
export class HistoriqueComponent implements OnInit {
  historique: EstimationHistorique[] = [];
  isLoading = true;

  constructor(
    private historiqueService: HistoriqueService,
    private router: Router,
      private exportService: ExportService

  ) {}

  ngOnInit() {
    this.historiqueService.getHistorique().subscribe(data => {
      this.historique = data;
      this.isLoading = false;
    });
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

  getStatutClass(ipp: number): string {
    if (ipp < 10) return 'faible';
    if (ipp < 25) return 'modere';
    return 'eleve';
  }

  getSeverityLabel(ipp: number): string {
    if (ipp < 10) return 'Faible';
    if (ipp < 25) return 'Modéré';
    return 'Élevé';
  }

  exporterHistorique() {
  this.exportService.exporterHistoriqueExcel(this.historique);
}

  formaterDate(dateISO: string): string {
    const d = new Date(dateISO);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  rechargerEstimation(id: string) {
    const estimation = this.historiqueService.getEstimationById(id);
    if (estimation) {
      this.router.navigate(['/resultat'], {
        queryParams: {
          nbJours: estimation.nbJours,
          codes: estimation.lesions.join(',')
        }
      });
    }
  }

  supprimerEstimation(id: string) {
    if (confirm('Supprimer cette estimation ?')) {
      this.historiqueService.supprimerEstimation(id);
    }
  }

  supprimerTout() {
    if (confirm('Supprimer tout l\'historique ?')) {
      this.historiqueService.supprimerTout();
    }
  }

  getNombreTotal(): number {
    return this.historique.length;
  }

  getTauxMoyen(): number {
    if (this.historique.length === 0) return 0;
    const sum = this.historique.reduce((acc, e) => acc + e.tauxEstime, 0);
    return Math.round((sum / this.historique.length) * 10) / 10;
  }
}