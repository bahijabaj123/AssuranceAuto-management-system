import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AlerteService } from '../../../../services/alerte.service';
import { AuthService } from '../../../../services/auth.service';
import { ToastService } from '../../../../services/toast.service';
import { Alerte } from '../../../../models/alerte.model';

@Component({
  selector: 'app-liste-alertes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './liste-alertes.component.html',
  styleUrls: ['./liste-alertes.component.css']
})
export class ListeAlertesComponent implements OnInit {

  alertes: Alerte[] = [];
  filteredAlertes: Alerte[] = [];
  isLoading = true;
  userId: number = 0;
  nonLuesCount: number = 0;

  search: string = '';
  natureFiltre: string = '';

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
    }
  }

  chargerAlertes() {
    this.isLoading = true;
    this.alerteService.getAlertesByUser(this.userId).subscribe({
      next: (data) => {
        this.alertes = data;
        this.applyFilters();
        this.isLoading = false;
        this.calculerNonLues();
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.toastService.error('❌ Erreur lors du chargement des alertes', 4000);
        this.isLoading = false;
      }
    });
  }

  applyFilters() {
    let result = [...this.alertes];

    if (this.search && this.search.trim()) {
      const s = this.search.trim().toLowerCase();
      result = result.filter(a =>
        a.numDos.toLowerCase().includes(s) ||
        a.message.toLowerCase().includes(s)
      );
    }

    if (this.natureFiltre) {
      result = result.filter(a => a.nature === this.natureFiltre);
    }

    this.filteredAlertes = result;
  }

  calculerNonLues() {
    this.nonLuesCount = this.alertes.filter(a => !a.notificationVue).length;
  }

  resetFilters() {
    this.search = '';
    this.natureFiltre = '';
    this.applyFilters();
  }

  marquerCommeLue(alerte: Alerte) {
    if (alerte.notificationVue) return;
    this.alerteService.marquerCommeLue(alerte.id).subscribe({
      next: () => {
        alerte.notificationVue = true;
        this.nonLuesCount--;
        this.toastService.success('✅ Notification marquée comme lue', 2000);
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.toastService.error('❌ Erreur lors du marquage', 4000);
      }
    });
  }

  marquerToutLu() {
    this.alerteService.marquerToutCommeLu(this.userId).subscribe({
      next: () => {
        this.alertes.forEach(a => a.notificationVue = true);
        this.nonLuesCount = 0;
        this.toastService.success('✅ Toutes les notifications marquées comme lues', 3000);
        this.applyFilters();
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.toastService.error('❌ Erreur lors du marquage', 4000);
      }
    });
  }

  // ✅ Méthode pour naviguer vers le dossier
  goToDossier(numDos: string) {
  if (numDos) {
    this.router.navigate(['/gestion/etat-suivi'], { 
      queryParams: { search: numDos }
    });
    this.toastService.info(`🔍 Recherche du dossier ${numDos}...`, 2000);
  }
}

  getNatureLabel(nature: string): string {
    return nature === 'CIV' ? '⚖️ Civil' : '🔴 Correctionnel';
  }

  getNatureColor(nature: string): string {
    return nature === 'CIV' ? '#3498db' : '#e74c3c';
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
