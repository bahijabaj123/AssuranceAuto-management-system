// src/app/components/layout/sidebar/sidebar.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { ModalService } from '../../../services/modal.service';
import { AlerteService } from '../../../services/alerte.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  dossiersCount: number = 412;
  nonLuesCount: number = 0;
  userId: number = 0;

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private modalService: ModalService,
    private alerteService: AlerteService
  ) {}

   ngOnInit() {
    this.userId = this.authService.getCurrentUserId();
    if (this.userId > 0) {
      this.chargerCompteurAlertes();
    }
  }

   chargerCompteurAlertes() {
    this.alerteService.countNonVues(this.userId).subscribe({
      next: (data) => {
        this.nonLuesCount = data.count || 0;
      },
      error: (err) => {
        console.error('❌ Erreur compteur alertes:', err);
      }
    });
  }


   get isAdmin(): boolean {
    return this.authService.isAdmin();
  }
  
  async logout(): Promise<void> {
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
}