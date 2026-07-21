// src/app/components/pages/gestion/doss-art18/doss-art18.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DossArt18Service } from '../../../../services/doss-art18.service';
import { ToastService } from '../../../../services/toast.service';
import { ExportService } from '../../../../services/export.service';

@Component({
  selector: 'app-doss-art18',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './doss-art18.component.html',
  styleUrls: ['./doss-art18.component.css']
})
export class DossArt18Component implements OnInit {

  allDossiers: any[] = [];
  filteredDossiers: any[] = [];
  paginatedDossiers: any[] = [];
  isLoading = true;

  search = '';
  regionFiltre = '';
  secFiltre = '';  // ✅ AJOUTER
  regions: string[] = [];

  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  constructor(
    private art18Service: DossArt18Service,
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
    this.cdr.detectChanges();

    this.art18Service.getAll().subscribe({
      next: (data) => {
        console.log('📋 Dossiers ART18 reçus:', data.length);
        this.allDossiers = data;
        this.regions = [...new Set(data.map(d => d.region).filter(r => r))];
        this.applyFilters();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.toastService.error('Erreur lors du chargement');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters() {
    let result = [...this.allDossiers];

    if (this.search && this.search.trim()) {
      const s = this.search.trim().toLowerCase();
      result = result.filter(d =>
        (d.reference || '').toLowerCase().includes(s) ||
        (d.cieAdverse || '').toLowerCase().includes(s) ||
        (d.blesse || '').toLowerCase().includes(s)
      );
    }

    if (this.regionFiltre) {
      result = result.filter(d => (d.region || '') === this.regionFiltre);
    }

    if (this.secFiltre) {
      result = result.filter(d => (d.secRecupInforme || '') === this.secFiltre);
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
      this.cdr.detectChanges();
    }
  }

  resetFilters() {
    this.search = '';
    this.regionFiltre = '';
    this.secFiltre = '';
    this.applyFilters();
  }

  goToEdit(id: number) {
    if (id == null) return;
    this.router.navigate(['/gestion/formulaire-art18', id]);
  }

  supprimer(id: number, event: Event) {
    event.stopPropagation();
    if (id == null) return;
    if (!confirm('Confirmer la suppression ?')) return;

    this.art18Service.delete(id).subscribe({
      next: () => {
        this.toastService.success('Dossier supprimé');
        this.chargerDossiers();
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.toastService.error('Erreur lors de la suppression');
      }
    });
  }

  exporterExcel() {
    if (this.filteredDossiers.length === 0) {
      this.toastService.error('Aucun dossier à exporter');
      return;
    }

    const exportData = this.filteredDossiers.map(d => ({
      'Réf.': d.reference || '',
      'Compagnie adverse': d.cieAdverse || '',
      'Région': d.region || '',
      'Blessé': d.blesse || '',
      'Date envoi lettre info': d.dateEnvoiLettInfo || '',
      'Sécurité informée': d.secRecupInforme || '',
      'Date': d.date || ''
    }));

    this.exportService.exporterDossiersArt18(exportData);
    this.toastService.success('Export Excel effectué avec succès');
  }
}