// src/app/components/pages/admin/gestion-utilisateurs/gestion-utilisateurs.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UtilisateurService } from '../../../../services/utilisateur.service';
import { ToastService } from '../../../../services/toast.service';
import { ModalService } from '../../../../services/modal.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-gestion-utilisateurs',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './gestion-utilisateurs.component.html',
  styleUrls: ['./gestion-utilisateurs.component.css']
})
export class GestionUtilisateursComponent implements OnInit {

  utilisateurs: any[] = [];
  filteredUtilisateurs: any[] = [];
  paginatedUtilisateurs: any[] = [];
  isLoading = true;
  currentUserId: number = 0;
  search: string = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  constructor(
    private utilisateurService: UtilisateurService,
    private toastService: ToastService,
    private modalService: ModalService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentUserId = this.authService.getCurrentUserId();
    this.chargerUtilisateurs();
  }

  chargerUtilisateurs() {
    this.isLoading = true;

    this.utilisateurService.getAll().subscribe({
      next: (data) => {
        console.log('📋 Utilisateurs reçus:', data.length);
        this.utilisateurs = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.toastService.error('❌ Erreur lors du chargement des utilisateurs', 4000);
        this.isLoading = false;
      }
    });
  }

  applyFilters() {
    let result = [...this.utilisateurs];

    if (this.search && this.search.trim()) {
      const s = this.search.trim().toLowerCase();
      result = result.filter(u =>
        u.nom?.toLowerCase().includes(s) ||
        u.prenom?.toLowerCase().includes(s) ||
        u.email?.toLowerCase().includes(s)
      );
    }

    this.filteredUtilisateurs = result;
    this.totalPages = Math.ceil(result.length / this.itemsPerPage) || 1;
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedUtilisateurs = this.filteredUtilisateurs.slice(start, start + this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  resetFilters() {
    this.search = '';
    this.applyFilters();
  }

  // ✅ Récupérer le libellé du rôle
  getRoleLabel(role: string): string {
    if (role === 'ADMIN' || role === 'ROLE_ADMIN') {
      return '👑 Admin';
    }
    return 'Gestionnaire';
  }

  // ✅ Récupérer la couleur du rôle
  getRoleColor(role: string): string {
    if (role === 'ADMIN' || role === 'ROLE_ADMIN') {
      return '#e74c3c';
    }
    return '#3498db';
  }

  // ✅ Formater la date de dernière connexion
  formatDate(date: string): string {
    if (!date) return 'Jamais';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // ✅ Supprimer un utilisateur
  async supprimer(user: any): Promise<void> {
    if (user.id === this.currentUserId) {
      this.toastService.warning('⚠️ Vous ne pouvez pas supprimer votre propre compte', 3000);
      return;
    }

    const confirmed = await this.modalService.confirm(
      `🗑️ Supprimer le compte de ${user.nom} ${user.prenom} ?`,
      '⚠️ Suppression définitive',
      {
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        type: 'danger',
        details: `Cette action est irréversible. L'utilisateur ${user.email} sera définitivement supprimé.`
      }
    );

    if (!confirmed) return;

    this.utilisateurService.delete(user.id).subscribe({
      next: () => {
        this.toastService.success(`✅ Utilisateur ${user.nom} ${user.prenom} supprimé`, 3000);
        this.chargerUtilisateurs();
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.toastService.error('❌ Erreur lors de la suppression', 4000);
      }
    });
  }

  // ✅ Changer le rôle (Admin <-> Gestionnaire)
  async changerRole(user: any): Promise<void> {
    if (user.id === this.currentUserId) {
      this.toastService.warning('⚠️ Vous ne pouvez pas modifier votre propre rôle', 3000);
      return;
    }

    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    const label = newRole === 'ADMIN' ? 'Administrateur' : 'Gestionnaire';

    const confirmed = await this.modalService.confirm(
      `🔄 Changer le rôle de ${user.nom} ${user.prenom} en ${label} ?`,
      'Modification du rôle',
      {
        confirmText: 'Confirmer',
        cancelText: 'Annuler',
        type: 'info'
      }
    );

    if (!confirmed) return;

    this.utilisateurService.updateRole(user.id, `ROLE_${newRole}`).subscribe({
      next: () => {
        user.role = newRole;
        this.toastService.success(`✅ Rôle modifié en ${label}`, 3000);
        this.chargerUtilisateurs();
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.toastService.error('❌ Erreur lors de la modification du rôle', 4000);
      }
    });
  }
}