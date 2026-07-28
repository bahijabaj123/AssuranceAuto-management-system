import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AlerteService } from '../../../services/alerte.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { Alerte } from '../../../models/alerte.model';

@Component({
  selector: 'app-alerte-bell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './alerte-bell.component.html',
  styleUrls: ['./alerte-bell.component.css']
})
export class AlerteBellComponent implements OnInit, OnDestroy {

  alertes: Alerte[] = [];
  nonLuesCount: number = 0;
  showDropdown: boolean = false;
  userId: number = 0;
  private refreshInterval: any;

  constructor(
    private alerteService: AlerteService,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router  // ✅ AJOUTER Router
  ) {}

  ngOnInit() {
    this.userId = this.authService.getCurrentUserId();
    if (this.userId > 0) {
      this.chargerAlertes();
      this.chargerCompteur();

      this.refreshInterval = setInterval(() => {
        this.chargerCompteur();
      }, 5 * 60 * 1000);
    }
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  chargerAlertes() {
    this.alerteService.getAlertesByUser(this.userId).subscribe({
      next: (data) => {
        this.alertes = data.slice(0, 10);
      },
      error: (err) => {
        console.error('❌ Erreur chargement alertes:', err);
      }
    });
  }

  chargerCompteur() {
    this.alerteService.countNonVues(this.userId).subscribe({
      next: (data) => {
        this.nonLuesCount = data.count || 0;
      },
      error: (err) => {
        console.error('❌ Erreur compteur alertes:', err);
      }
    });
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
    if (this.showDropdown) {
      this.chargerAlertes();
    }
  }

  // ✅ Méthode modifiée pour naviguer vers le dossier
  onAlerteClick(alerte: Alerte) {
    // Marquer comme lue si ce n'est pas déjà fait
    if (!alerte.notificationVue) {
      this.alerteService.marquerCommeLue(alerte.id).subscribe({
        next: () => {
          alerte.notificationVue = true;
          this.nonLuesCount--;
        },
        error: (err) => {
          console.error('❌ Erreur marquage alerte:', err);
        }
      });
    }

    // ✅ Fermer le dropdown
    this.showDropdown = false;

    // ✅ Naviguer vers le dossier avec le numéro de dossier
    if (alerte.numDos) {
      this.router.navigate(['/gestion/etat-suivi'], { 
        queryParams: { search: alerte.numDos }
      });
      
      this.toastService.info(`📋 Recherche du dossier ${alerte.numDos}...`, 2000);
    }
  }

  marquerToutLu() {
    this.alerteService.marquerToutCommeLu(this.userId).subscribe({
      next: () => {
        this.alertes.forEach(a => a.notificationVue = true);
        this.nonLuesCount = 0;
        this.toastService.success('✅ Toutes les notifications marquées comme lues', 3000);
      },
      error: (err) => {
        console.error('❌ Erreur marquage tout lu:', err);
      }
    });
  }

  formatDate(date: string): string {
    if (!date) return '';
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
