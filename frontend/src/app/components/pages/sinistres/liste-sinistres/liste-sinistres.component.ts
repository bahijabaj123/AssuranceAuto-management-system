// src/app/components/pages/sinistres/liste-sinistres/liste-sinistres.component.ts

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DonneesSinistreService } from '../../../../services/donnees-sinistre.service';
import { ToastService } from '../../../../services/toast.service';
import { ExportService } from '../../../../services/export.service';
import { DonneesSinistre } from '../../../../models/donnees-sinistre.model';

@Component({
  selector: 'app-liste-sinistres',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './liste-sinistres.component.html',
  styleUrls: ['./liste-sinistres.component.css']
})
export class ListeSinistresComponent implements OnInit {

  allSinistres: DonneesSinistre[] = [];
  filteredSinistres: DonneesSinistre[] = [];
  paginatedSinistres: DonneesSinistre[] = [];
  isLoading = true;

  // Filtres
  searchSin: string = '';
  searchTiers: string = '';
  anneeFiltre: number | null = null;
  searchIpp: string = '';
  nbrJrsMin: number | null = null;
  nbrJrsMax: number | null = null;

  annees: number[] = [];

  // Pagination
  currentPage = 1;
  itemsPerPage = 15;
  totalPages = 1;

  constructor(
    private sinistreService: DonneesSinistreService,
    private toastService: ToastService,
    private exportService: ExportService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    for (let i = 2020; i <= 2030; i++) {
      this.annees.push(i);
    }
  }

  ngOnInit() {
    this.chargerSinistres();
  }

  chargerSinistres() {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.sinistreService.getAll().subscribe({
      next: (data) => {
        console.log('📋 Sinistres reçus:', data.length);
        this.allSinistres = data;
        this.applyFilters();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.toastService.error('❌ Erreur lors du chargement des sinistres', 4000);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters() {
    let result = [...this.allSinistres];

    if (this.searchSin && this.searchSin.trim()) {
      const s = this.searchSin.trim().toLowerCase();
      result = result.filter(d => d.sin.toLowerCase().includes(s));
    }
    if (this.searchTiers && this.searchTiers.trim()) {
      const s = this.searchTiers.trim().toLowerCase();
      result = result.filter(d => d.nomTiers && d.nomTiers.toLowerCase().includes(s));
    }

    if (this.anneeFiltre) {
      result = result.filter(d => d.annee === this.anneeFiltre);
    }

    if (this.searchIpp && this.searchIpp.trim()) {
      const s = this.searchIpp.trim().toLowerCase();
      result = result.filter(d => d.ipp && d.ipp.toLowerCase().includes(s));
    }

    if (this.nbrJrsMin !== null && this.nbrJrsMin !== undefined) {
      result = result.filter(d => {
        const jours = parseInt(d.nbrJrs);
        return !isNaN(jours) && jours >= this.nbrJrsMin!;
      });
    }

    if (this.nbrJrsMax !== null && this.nbrJrsMax !== undefined) {
      result = result.filter(d => {
        const jours = parseInt(d.nbrJrs);
        return !isNaN(jours) && jours <= this.nbrJrsMax!;
      });
    }

    this.filteredSinistres = result;
    this.totalPages = Math.ceil(result.length / this.itemsPerPage) || 1;
    this.currentPage = 1;
    this.updatePagination();
    this.cdr.detectChanges();
  }

  updatePagination() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedSinistres = this.filteredSinistres.slice(start, start + this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
      this.cdr.detectChanges();
    }
  }

  resetFilters() {
    this.searchSin = '';
    this.searchTiers = '';
    this.anneeFiltre = null;
    this.searchIpp = '';
    this.nbrJrsMin = null;
    this.nbrJrsMax = null;
    this.applyFilters();
  }

  // ✅ MODIFIER UN SINISTRE
  modifierSinistre(id: number | undefined) {
    if (!id) return;
    this.router.navigate(['/sinistres/formulaire', id]);
  }

  // ✅ SUPPRIMER UN SINISTRE AVEC TOAST DE CONFIRMATION
  supprimerSinistre(id: number | undefined, sin: string) {
    if (!id) return;

    // ✅ UTILISER LE TOAST DE CONFIRMATION
    this.toastService.confirmDelete(
      `sinistre ${sin}`,
      () => {
        // ✅ CONFIRMÉ - Supprimer
        this.sinistreService.delete(id).subscribe({
          next: () => {
            this.toastService.deleteSuccess(`Sinistre ${sin}`);
            this.chargerSinistres();
          },
          error: (err) => {
            console.error('❌ Erreur:', err);
            this.toastService.deleteError('sinistre');
          }
        });
      },
      () => {
        // ✅ ANNULÉ
        this.toastService.info('Suppression annulée', 2000);
      }
    );
  }

  exporterExcel() {
    if (this.filteredSinistres.length === 0) {
      this.toastService.warning('Aucune donnée à exporter', 3000);
      return;
    }

    const exportData = this.filteredSinistres.map(d => ({
      'SIN': d.sin,
      'Tiers': d.nomTiers || '—',
      'Année': d.annee,
      'IPP (%)': d.ipp || '—',
      'NBR JRS': d.nbrJrs || '—',
      'RCC': d.rcc || '—',
      'RCM': d.rcm || '—',
      'DOMMAGE': d.dommage || '—',
      'VOL': d.vol || '—',
      'INC': d.inc || '—'
    }));

    this.exportService.exporterDossiersJudiciaires(exportData, 'Donnees_Sinistres');
    this.toastService.success('✅ Export Excel effectué avec succès', 3000);
  }

  getNombreAvecIpp(): number {
    return this.filteredSinistres.filter(d => d.ipp && d.ipp !== '').length;
  }

  getNombreAvecJrs(): number {
    return this.filteredSinistres.filter(d => d.nbrJrs && d.nbrJrs !== '').length;
  }

  // ✅ Afficher le nom du tiers avec fallback
  getTiersNom(item: DonneesSinistre): string {
    if (item.nomTiers) {
      return item.nomTiers;
    }
    return '—';
  }
}