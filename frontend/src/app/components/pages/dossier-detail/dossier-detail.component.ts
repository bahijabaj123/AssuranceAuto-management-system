import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DossierService } from '../../../services/dossier.service';
import { LesionService } from '../../../services/lesion';
import { ExportService } from '../../../services/export.service';
import { ToastService } from '../../../services/toast.service';
import { Dossier } from '../../../models/dossier.model';

@Component({
  selector: 'app-dossier-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dossier-detail.component.html',
  styleUrls: ['./dossier-detail.component.css']
})
export class DossierDetailComponent implements OnInit {
  dossierId: string | null = null;
  dossier!: Dossier;
  isLoading = true;
  private lesionMap: { [key: string]: string } = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private dossierService: DossierService,
    private lesionService: LesionService,
    private exportService: ExportService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.lesionService.getLesions().subscribe({
      next: (lesions: any[]) => {
        this.lesionMap = {};
        lesions.forEach((l: any) => {
          this.lesionMap[l.code] = l.libelle;
        });
        this.route.paramMap.subscribe(params => {
          this.dossierId = params.get('id');
          if (this.dossierId) {
            this.loadDossierDetails(this.dossierId);
          } else {
            this.router.navigate(['/estimation']);
          }
        });
      },
      error: (err: any) => {
        console.error('Erreur chargement lésions:', err);
        this.toastService.error('Erreur lors du chargement des lésions');
        this.isLoading = false;
      }
    });
  }

  loadDossierDetails(id: string) {
    this.isLoading = true;

    this.dossierService.getDossierById(id).subscribe({
      next: (dossier: Dossier) => {
        this.dossier = dossier;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Erreur:', err);
        this.isLoading = false;
        this.toastService.error('Erreur lors du chargement du dossier');
        this.cdr.detectChanges();
      }
    });
  }

  getLesionLabel(code: string): string {
    return this.lesionMap[code] || code;
  }

  getStatutClass(statut: string): string {
    const classes: { [key: string]: string } = {
      'Clôturé': 'statut-cloture',
      'En cours': 'statut-encours',
      'Expertise': 'statut-expertise',
      'En attente': 'statut-attente'
    };
    return classes[statut] || 'statut-default';
  }

  exporterPDF() {
    if (!this.dossier) {
      this.toastService.error('Aucun dossier à exporter');
      return;
    }

    this.exportService.exporterEstimationPDF(
      this.dossier.nbJours,
      this.dossier.codeLesions.map((c: string) => this.getLesionLabel(c)),
      this.dossier.tauxIpp,
      Math.max(0, this.dossier.tauxIpp - 3),
      Math.min(100, this.dossier.tauxIpp + 4),
      [{
        id: this.dossier.numero,
        tauxIPP: this.dossier.tauxIpp
      }]
    );
    
    this.toastService.success('Export PDF lancé avec succès !');
  }

  retourner() {
    this.router.navigate(['/resultat'], {
      queryParams: {
        nbJours: this.dossier?.nbJours || 45,
        codes: this.dossier?.codeLesions?.join(',') || 'L01,L13'
      }
    });
  }
}
