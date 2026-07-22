// src/app/components/pages/sinistres/liste-sinistres/liste-sinistres.component.ts

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
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
  trancheIppFiltre: string | null = null;
  trancheNbrJrFiltre: string | null = null;
  natureFiltre: string | null = null;

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
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    for (let i = 2020; i <= 2030; i++) {
      this.annees.push(i);
    }
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      console.log('📥 Paramètres reçus:', params);
      
      let hasFilters = false;

      if (params['sin']) {
        this.searchSin = params['sin'];
        hasFilters = true;
      }
      if (params['annee']) {
        this.anneeFiltre = parseInt(params['annee']);
        hasFilters = true;
      }
      if (params['trancheIpp']) {
        this.trancheIppFiltre = params['trancheIpp'];
        hasFilters = true;
      }
      if (params['trancheNbrJr']) {
        this.trancheNbrJrFiltre = params['trancheNbrJr'];
        hasFilters = true;
      }
      if (params['nature']) {
        this.natureFiltre = params['nature'];
        hasFilters = true;
      }
      if (params['tiers']) {
        this.searchTiers = params['tiers'];
        hasFilters = true;
      }
      if (params['ippMin']) {
        this.nbrJrsMin = parseInt(params['ippMin']);
        hasFilters = true;
      }
      if (params['ippMax']) {
        this.nbrJrsMax = parseInt(params['ippMax']);
        hasFilters = true;
      }

      if (hasFilters) {
        console.log('✅ Filtres appliqués depuis l\'URL');
      }

      this.chargerSinistres();
    });
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

    // Filtre par SIN
    if (this.searchSin && this.searchSin.trim()) {
      const s = this.searchSin.trim().toLowerCase();
      result = result.filter(d => d.sin.toLowerCase().includes(s));
    }

    // Filtre par Tiers
    if (this.searchTiers && this.searchTiers.trim()) {
      const s = this.searchTiers.trim().toLowerCase();
      result = result.filter(d => d.nomTiers && d.nomTiers.toLowerCase().includes(s));
    }

    // Filtre par année
    if (this.anneeFiltre) {
      result = result.filter(d => d.annee === this.anneeFiltre);
    }

    // Filtre par IPP
    if (this.searchIpp && this.searchIpp.trim()) {
      const s = this.searchIpp.trim().toLowerCase();
      result = result.filter(d => d.ipp && d.ipp.toLowerCase().includes(s));
    }

    // ✅ Filtre par tranche IPP
    if (this.trancheIppFiltre) {
      result = result.filter(d => {
        const ipp = parseFloat(d.ipp);
        if (isNaN(ipp)) return false;
        
        if (this.trancheIppFiltre === '1%-19%') return ipp >= 1 && ipp <= 19;
        if (this.trancheIppFiltre === '20%-79%') return ipp >= 20 && ipp <= 80;
        if (this.trancheIppFiltre === '80%-100%') return ipp >= 80 && ipp <= 100;
        if (this.trancheIppFiltre === '0%') return ipp === 0;
        if (this.trancheIppFiltre === '1 à 10 %') return ipp >= 1 && ipp <= 10;
        if (this.trancheIppFiltre === '11 à 20 %') return ipp >= 11 && ipp <= 20;
        if (this.trancheIppFiltre === '21 à 40 %') return ipp >= 21 && ipp <= 40;
        if (this.trancheIppFiltre === 'Plus de 40 %') return ipp > 40;
        if (this.trancheIppFiltre === 'Non renseigné') return !ipp || ipp === 0;
        
        return false;
      });
    }

    // ✅ Filtre par tranche NBR-JR
    if (this.trancheNbrJrFiltre) {
      result = result.filter(d => {
        const jours = parseInt(d.nbrJrs);
        if (isNaN(jours)) return false;
        
        if (this.trancheNbrJrFiltre === '1J-45J') return jours >= 1 && jours <= 45;
        if (this.trancheNbrJrFiltre === '60j-90j') return jours >= 60 && jours <= 90;
        if (this.trancheNbrJrFiltre === '120j') return jours >= 120;
        
        return false;
      });
    }

    // Filtre NBR JRS (min)
    if (this.nbrJrsMin !== null && this.nbrJrsMin !== undefined) {
      result = result.filter(d => {
        const jours = parseInt(d.nbrJrs);
        return !isNaN(jours) && jours >= this.nbrJrsMin!;
      });
    }

    // Filtre NBR JRS (max)
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
    this.trancheIppFiltre = null;
    this.trancheNbrJrFiltre = null;
    this.natureFiltre = null;
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true
    });
    
    this.applyFilters();
  }

  voirDetails(id: number | undefined) {
    if (!id) {
      this.toastService.warning('Sinistre non trouvé');
      return;
    }
    this.router.navigate(['/sinistres/formulaire', id]);
  }

  modifierSinistre(id: number | undefined) {
    if (!id) return;
    this.router.navigate(['/sinistres/formulaire', id]);
  }

  supprimerSinistre(id: number | undefined, sin: string) {
    if (!id) return;

    this.toastService.confirmDelete(
      `sinistre ${sin}`,
      () => {
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

  getTiersNom(item: DonneesSinistre): string {
    if (item.nomTiers) {
      return item.nomTiers;
    }
    return '—';
  }

  getLibelleTrancheIpp(tranche: string): string {
    const libelles: { [key: string]: string } = {
      '1%-19%': '1% à 19%',
      '20%-79%': '20% à 79%',
      '80%-100%': '80% à 100%',
      '0%': '0%',
      '1 à 10 %': '1% à 10%',
      '11 à 20 %': '11% à 20%',
      '21 à 40 %': '21% à 40%',
      'Plus de 40 %': 'Plus de 40%',
      'Non renseigné': 'Non renseigné'
    };
    return libelles[tranche] || tranche;
  }

  getLibelleTrancheNbrJr(tranche: string): string {
    const libelles: { [key: string]: string } = {
      '1J-45J': '1 à 45 jours',
      '60j-90j': '60 à 90 jours',
      '120j': '120 jours et plus'
    };
    return libelles[tranche] || tranche;
  }

  hasActiveFilters(): boolean {
    return !!(this.searchSin || this.searchTiers || this.anneeFiltre || 
              this.searchIpp || this.nbrJrsMin !== null || this.nbrJrsMax !== null ||
              this.trancheIppFiltre || this.trancheNbrJrFiltre || this.natureFiltre);
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.searchSin) count++;
    if (this.searchTiers) count++;
    if (this.anneeFiltre) count++;
    if (this.searchIpp) count++;
    if (this.nbrJrsMin !== null) count++;
    if (this.nbrJrsMax !== null) count++;
    if (this.trancheIppFiltre) count++;
    if (this.trancheNbrJrFiltre) count++;
    if (this.natureFiltre) count++;
    return count;
  }
}
