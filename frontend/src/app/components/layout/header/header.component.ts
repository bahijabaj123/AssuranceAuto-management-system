// src/app/components/layout/header/header.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { ModalService } from '../../../services/modal.service';
import { AlerteBellComponent } from '../alerte-bell/alerte-bell.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule,AlerteBellComponent ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  userNom: string = 'Utilisateur';
  userPrenom: string = '';
  userRole: string = 'Gestionnaire';
  initiales: string = 'U';

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private modalService: ModalService
  ) {}

  ngOnInit() {
    const user = this.authService.getUser();
    if (user) {
      this.userNom = user.nom || 'Utilisateur';
      this.userPrenom = user.prenom || '';
      this.userRole = user.role === 'RESPONSABLE' ? 'Responsable' : 'Gestionnaire';
      this.initiales = ((this.userPrenom?.[0] || '') + (this.userNom?.[0] || '')).toUpperCase();
    }
  }

  async logout(): Promise<void> {
    // ✅ Utiliser le modal personnalisé
    const confirmed = await this.modalService.confirm(
      'Voulez-vous vraiment vous déconnecter ?',
      'Déconnexion',
      {
        confirmText: 'Se déconnecter',
        cancelText: 'Annuler',
        type: 'warning',
        details: 'Vous serez redirigé vers la page de connexion.'
      }
    );

    if (confirmed) {
      this.authService.deconnecter();
      this.toastService.info('🔓 Déconnexion réussie. À bientôt !', 3000);
    }
  }

  toggleSidebar(): void {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.classList.toggle('sidebar-open');
    }
  }
}
