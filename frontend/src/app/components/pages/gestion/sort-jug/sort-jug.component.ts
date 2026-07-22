// src/app/components/pages/gestion/sort-jug/sort-jug.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SortJugService } from '../../../../services/sort-jug.service';
import { ToastService } from '../../../../services/toast.service';
import { ExportService } from '../../../../services/export.service';

@Component({
  selector: 'app-sort-jug',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './sort-jug.component.html',
  styleUrls: ['./sort-jug.component.css']
})
export class SortJugComponent implements OnInit {

  allDossiers: any[] = [];
  filteredDossiers: any[] = [];
  paginatedDossiers: any[] = [];
  isLoading = true;

  search = '';
  regionFiltre = '';
  observationFiltre = '';
  regions: string[] = [];

  // KPI
  dernierJugement: any = null;
  jugementsEnAppel = 0;
  montantTotal = 0;
  jugementsARegler = 0;

  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  constructor(
    private sortJugService: SortJugService,
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

    this.sortJugService.getAll().subscribe({
      next: (data) => {
        console.log('📋 SortJug reçus:', data.length);
        this.allDossiers = data;
        this.regions = [...new Set(data.map(d => d.region).filter(r => r))];
        this.calculerKPIs();
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

  calculerKPIs() {
    // Dernière signification
    const dates = this.allDossiers
      .map(d => d.dateSignification || d.date_signification)
      .filter(d => d);
    if (dates.length > 0) {
      dates.sort();
      this.dernierJugement = { dateSignification: dates[dates.length - 1] };
    }

    // En appel
    this.jugementsEnAppel = this.allDossiers.filter(d =>
      (d.observation || '').toUpperCase().includes('APPEL')
    ).length;

    // Montant total
    this.montantTotal = this.allDossiers.reduce((sum, d) => {
      const montant = parseFloat(d.montantExec || d.montant_exec || 0);
      return sum + (isNaN(montant) ? 0 : montant);
    }, 0);

    // À régler
    this.jugementsARegler = this.allDossiers.filter(d =>
      (d.observation || '').toUpperCase().includes('A REGLER')
    ).length;
  }

  applyFilters() {
    let result = [...this.allDossiers];

    if (this.search && this.search.trim()) {
      const s = this.search.trim().toLowerCase();
      result = result.filter(d =>
        (d.numDos || d.num_dos || '').toLowerCase().includes(s) ||
        (d.huissierNotaire || d.huissier_notaire || '').toLowerCase().includes(s) ||
        (d.region || '').toLowerCase().includes(s)
      );
    }

    if (this.regionFiltre) {
      result = result.filter(d => (d.region || '') === this.regionFiltre);
    }

    if (this.observationFiltre) {
      result = result.filter(d =>
        (d.observation || '').toUpperCase().includes(this.observationFiltre.toUpperCase())
      );
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
    this.observationFiltre = '';
    this.applyFilters();
  }

  goToEdit(id: number) {
    if (id == null) return;
    this.router.navigate(['/gestion/formulaire-sort-jug', id]);
  }

  supprimer(id: number, event: Event) {
    event.stopPropagation();
    if (id == null) return;
    if (!confirm('Confirmer la suppression ?')) return;

    this.sortJugService.delete(id).subscribe({
      next: () => {
        this.toastService.success('Jugement supprimé');
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
      this.toastService.error('Aucun jugement à exporter');
      return;
    }

    const exportData = this.filteredDossiers.map(d => ({
      'N° DOS': d.numDos || d.num_dos || '',
      'JUG N°': d.jugNum || d.jug_num || '',
      'Région': d.region || '',
      'Date Signification': d.dateSignification || d.date_signification || '',
      'Huissier/Notaire': d.huissierNotaire || d.huissier_notaire || '',
      'Remis au financier le': d.dateRemiseFinancier || d.date_remise_financier || '',
      'Montant Exécution': d.montantExec || d.montant_exec || '',
      'Observation': d.observation || ''
    }));

    this.exportService.exporterSortJug(exportData);
    this.toastService.success('Export Excel effectué avec succès');
  }
}
