// src/app/components/pages/auth/profil/profil.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { ToastService } from '../../../../services/toast.service';
import { ModalService } from '../../../../services/modal.service';
import { DossierJudiciaireService } from '../../../../services/dossier-judiciaire.service';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.css']
})
export class ProfilComponent implements OnInit {

  user = {
    nom: '',
    prenom: '',
    email: '',
    role: '',
    dateCreation: ''
  };

  // ✅ Statistiques
  stats = {
    totalDossiers: 0,
    dossiersActifs: 0,
    dossiersClotures: 0
  };

  // Champ mot de passe (optionnel)
  nouveauMotDePasse = '';
  confirmerMotDePasse = '';
  showPwd = false;
  isSaving = false;
  isLoading = true;

  // Initiales pour l'avatar
  get initiales(): string {
    return ((this.user.prenom?.[0] || '') + (this.user.nom?.[0] || '')).toUpperCase();
  }

  get roleLabel(): string {
    return this.user.role === 'RESPONSABLE' ? 'Responsable' : 'Gestionnaire sinistres';
  }

  get roleIcon(): string {
    return this.user.role === 'RESPONSABLE' ? 'fa-crown' : 'fa-user-check';
  }

  get roleColor(): string {
    return this.user.role === 'RESPONSABLE' ? '#f39c12' : '#4cc8dd';
  }

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private modalService: ModalService,
    private router: Router,
    private dossierService: DossierJudiciaireService
  ) {}

  ngOnInit() {
    const u = this.authService.getUser();
    if (!u) {
      this.router.navigate(['/login']);
      return;
    }
    this.user.nom = u.nom || '';
    this.user.prenom = u.prenom || '';
    this.user.email = u.email || '';
    this.user.role = u.role || 'GESTIONNAIRE';
    this.user.dateCreation = u.dateCreation || 'Jan 2024';

    // ✅ Charger les statistiques
    this.chargerStatistiques();
  }

  // ✅ Charger les vraies statistiques
  chargerStatistiques() {
    this.isLoading = true;
    
    this.dossierService.getMyDossiers().subscribe({
      next: (dossiers) => {
        console.log('📊 Statistiques - Dossiers reçus:', dossiers.length);
        
        this.stats.totalDossiers = dossiers.length;
        
        // Compter les dossiers actifs
        this.stats.dossiersActifs = dossiers.filter(d => {
          const statut = (d as any).statut || (d as any).status || '';
          return statut !== 'Clôturé' && statut !== 'Clos' && statut !== 'Fermé';
        }).length;
        
        this.stats.dossiersClotures = dossiers.filter(d => {
          const statut = (d as any).statut || (d as any).status || '';
          return statut === 'Clôturé' || statut === 'Clos' || statut === 'Fermé';
        }).length;
        
        // Si aucun statut n'est défini, mettre tous les dossiers comme actifs
        if (this.stats.dossiersActifs === 0 && this.stats.dossiersClotures === 0 && this.stats.totalDossiers > 0) {
          this.stats.dossiersActifs = this.stats.totalDossiers;
        }
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Erreur chargement statistiques:', err);
        this.isLoading = false;
      }
    });
  }

  getPasswordStrength(): { width: string; color: string; label: string } {
    const pwd = this.nouveauMotDePasse;
    if (!pwd) {
      return { width: '0%', color: '#e6eaef', label: 'Entrez un mot de passe' };
    }

    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    const levels = [
      { width: '25%', color: '#e74c3c', label: 'Trop court' },
      { width: '50%', color: '#f39c12', label: 'Faible' },
      { width: '75%', color: '#3498db', label: 'Moyen' },
      { width: '100%', color: '#2ecc71', label: 'Fort' }
    ];

    const index = Math.min(score, 4) - 1;
    return index >= 0 ? levels[index] : levels[0];
  }

 // src/app/components/pages/auth/profil/profil.component.ts
// ✅ CORRIGÉ : Utiliser authService.resetPassword() au lieu de http.post
enregistrer() {
  console.log('🔵 Enregistrement du profil...');
  console.log('📝 Nouveau mot de passe saisi:', this.nouveauMotDePasse ? '✅ Oui' : '❌ Non');
  
  // ✅ Si un nouveau mot de passe est saisi, le valider
  if (this.nouveauMotDePasse) {
    if (this.nouveauMotDePasse.length < 8) {
      this.toastService.warning('⚠️ Le mot de passe doit contenir au moins 8 caractères', 3000);
      return;
    }
    if (this.nouveauMotDePasse !== this.confirmerMotDePasse) {
      this.toastService.warning('⚠️ Les mots de passe ne correspondent pas', 3000);
      return;
    }
  }

  this.isSaving = true;

  // ✅ Si un nouveau mot de passe est saisi, l'envoyer au backend VIA AUTH SERVICE
  if (this.nouveauMotDePasse) {
    console.log('📤 Envoi de la requête de réinitialisation du mot de passe via AuthService...');
    
    this.authService.resetPassword(this.user.email, this.nouveauMotDePasse).subscribe({
      next: (response) => {
        console.log('✅ Réponse du backend:', response);
        this.toastService.success('✅ Mot de passe mis à jour avec succès', 3000);
        this.nouveauMotDePasse = '';
        this.confirmerMotDePasse = '';
        this.isSaving = false;
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        
        let errorMessage = '❌ Erreur lors de la mise à jour du mot de passe';
        if (err.status === 404) {
          errorMessage = '❌ Email non trouvé';
        } else if (err.status === 403) {
          errorMessage = '❌ Accès refusé. Veuillez vous reconnecter.';
        } else if (err.status === 401) {
          errorMessage = '❌ Session expirée. Veuillez vous reconnecter.';
        } else if (err.error && typeof err.error === 'string') {
          errorMessage = `❌ ${err.error}`;
        } else if (err.error && err.error.message) {
          errorMessage = `❌ ${err.error.message}`;
        }
        
        this.toastService.error(errorMessage, 4000);
        this.isSaving = false;
        
        // ✅ Si 403 ou 401, déconnecter l'utilisateur
        if (err.status === 403 || err.status === 401) {
          setTimeout(() => {
            this.authService.deconnecter();
          }, 2000);
        }
      }
    });
  } else {
    // ✅ Si aucun mot de passe n'est saisi, juste un message
    console.log('ℹ️ Aucun mot de passe saisi, rien à enregistrer');
    this.toastService.info('ℹ️ Aucune modification apportée', 2000);
    this.isSaving = false;
  }
}
  async deconnecter(): Promise<void> {
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

  formatDate(date: string): string {
    if (!date) return 'Jan 2024';
    try {
      const d = new Date(date);
      return d.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
    } catch {
      return date;
    }
  }
}