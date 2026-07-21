import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { DossierProvisoire } from '../../../../models/dossier-provisoire.model';
import { DossierProvisoireService } from '../../../../services/dossier-provisoire.service';
import { ToastService } from '../../../../services/toast.service';
import { ExportService } from '../../../../services/export.service';
import {ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-doss-provisoires',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './doss-provisoires.component.html',
  styleUrls: ['./doss-provisoires.component.css', '../../../../../styles/gestion-commun.css']
})
export class DossProvisoiresComponent implements OnInit {

  allDossiers: DossierProvisoire[] = [];
  filteredDossiers: DossierProvisoire[] = [];
  paginatedDossiers: DossierProvisoire[] = [];

  search = '';
  regionFiltre = '';
  regions = ['Tunis', 'Ben Arous', 'Bizerte', 'Sfax', 'Sousse', 'Kairouan', 'Sidi Bouzid', 'Grombalia'];

  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  isLoading = true;

  constructor(
    private dossierService: DossierProvisoireService,
    private toastService: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private exportService: ExportService
  ) {}

  ngOnInit() {
    this.chargerDossiers();
  }

  chargerDossiers() {
    this.isLoading = true;
    this.dossierService.getAll().subscribe({
      next: (data) => {
        this.allDossiers = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.toastService.error('Erreur lors du chargement des dossiers provisoires');
        this.isLoading = false;
      }
    });
  }

  applyFilters() {
    let result = [...this.allDossiers];

    if (this.search && this.search.trim()) {
        const s = this.search.trim().toLowerCase();
        result = result.filter(d =>
            (d.numProv || '').toLowerCase().includes(s) ||
            (d.numSinistre || '').toLowerCase().includes(s) ||  // ✅ AJOUTER
            (d.tiers || '').toLowerCase().includes(s) ||
            (d.avocat || '').toLowerCase().includes(s) ||
            (d.affaire || '').toLowerCase().includes(s) ||
            (d.regionTrib || '').toLowerCase().includes(s)
        );
    }

    if (this.regionFiltre) {
        result = result.filter(d => (d.regionTrib || '') === this.regionFiltre);
    }

    this.filteredDossiers = result;
    this.totalPages = Math.ceil(result.length / this.itemsPerPage) || 1;
    this.currentPage = 1;
    this.updatePagination();
    this.cdr.detectChanges();
}

  updatePagination() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedDossiers = this.filteredDossiers.slice(start, start + this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  resetFilters() {
    this.search = '';
    this.regionFiltre = '';
    this.applyFilters();
  }

  goToEdit(id: number | undefined) {
    if (id == null) return;
    this.router.navigate(['/gestion/formulaire/doss-provisoires', id]);
  }

  supprimer(id: number | undefined, event: Event) {
    event.stopPropagation();
    if (id == null) return;
    if (!confirm(`Supprimer ce dossier provisoire ?`)) return;

    this.dossierService.delete(id).subscribe({
      next: () => {
        this.toastService.success('Dossier supprimé');
        this.chargerDossiers();
      },
      error: () => this.toastService.error('Erreur lors de la suppression')
    });
  }

  // src/app/components/pages/gestion/doss-provisoires/doss-provisoires.component.ts
exporterExcel() {
  if (this.filteredDossiers.length === 0) {
    this.toastService.error('Aucun dossier à exporter');
    return;
  }

  const exportData = this.filteredDossiers.map(d => ({
    'N° PROV': d.numProv || '',
    'Affaire': d.affaire || '',
    'Nature': d.nature || '',
    'Tiers': d.tiers || '',
    '1ère Audience': d.date || '',
    'Région/Tribunal': d.regionTrib || '',
    'Avocat': d.avocat || '',
    'N° Sinistre': d.numSinistre || '',
    'Observation': d.observation || ''
  }));

  this.exportService.exporterDossiersProvisoires(exportData);
  this.toastService.success('Export Excel effectué avec succès');
}
}