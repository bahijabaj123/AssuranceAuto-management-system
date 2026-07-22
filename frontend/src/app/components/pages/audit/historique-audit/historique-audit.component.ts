// src/app/components/pages/audit/historique-audit/historique-audit.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuditService } from '../../../../services/audit.service';
import { ToastService } from '../../../../services/toast.service';
import { AuthService } from '../../../../services/auth.service';
import { Audit } from '../../../../models/audit.model';
import { ExportService } from '../../../../services/export.service';

@Component({
  selector: 'app-historique-audit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './historique-audit.component.html',
  styleUrls: ['./historique-audit.component.css']
})
export class HistoriqueAuditComponent implements OnInit {

  audits: Audit[] = [];
  filteredAudits: Audit[] = [];
  paginatedAudits: Audit[] = [];
  isLoading = true;

  // Filtres
  search = '';
  actionFiltre = '';
  dateDebut: string = '';
  dateFin: string = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  actions = ['CREATE', 'UPDATE', 'DELETE'];

  constructor(
    private auditService: AuditService,
    private toastService: ToastService,
    private authService: AuthService,
    private exportService: ExportService
  ) {}

  ngOnInit() {
    this.chargerAudits();
  }

  chargerAudits() {
    this.isLoading = true;

    this.auditService.getMyAudits().subscribe({
      next: (data) => {
        console.log('📋 Audits reçus:', data.length);
        this.audits = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.toastService.error('❌ Erreur lors du chargement des audits', 4000);
        this.isLoading = false;
      }
    });
  }

  applyFilters() {
    let result = [...this.audits];

    if (this.search && this.search.trim()) {
      const s = this.search.trim().toLowerCase();
      result = result.filter(a =>
        a.numDos?.toLowerCase().includes(s) ||
        a.nomUtilisateur?.toLowerCase().includes(s) ||
        a.nouvellesValeurs?.toLowerCase().includes(s)
      );
    }

    if (this.actionFiltre) {
      result = result.filter(a => a.action === this.actionFiltre);
    }

    if (this.dateDebut) {
      result = result.filter(a => a.dateAction >= this.dateDebut);
    }

    if (this.dateFin) {
      result = result.filter(a => a.dateAction <= this.dateFin + 'T23:59:59');
    }

    this.filteredAudits = result;
    this.totalPages = Math.ceil(result.length / this.itemsPerPage) || 1;
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedAudits = this.filteredAudits.slice(start, start + this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  resetFilters() {
    this.search = '';
    this.actionFiltre = '';
    this.dateDebut = '';
    this.dateFin = '';
    this.applyFilters();
  }

  getActionLabel(action: string): string {
    const labels: { [key: string]: string } = {
      'CREATE': '📝 Création',
      'UPDATE': '✏️ Modification',
      'DELETE': '🗑️ Suppression'
    };
    return labels[action] || action;
  }

  getActionColor(action: string): string {
    const colors: { [key: string]: string } = {
      'CREATE': '#2ecc71',
      'UPDATE': '#3498db',
      'DELETE': '#e74c3c'
    };
    return colors[action] || '#95a5a6';
  }

  formatDate(date: string): string {
    if (!date) return '—';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  
}
