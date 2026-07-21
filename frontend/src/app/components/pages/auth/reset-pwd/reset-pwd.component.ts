// src/app/components/pages/auth/reset-pwd/reset-pwd.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-reset-pwd',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reset-pwd.component.html',
  styleUrls: ['./reset-pwd.component.css']
})
export class ResetPwdComponent {

  email: string = '';
  nouveauMotDePasse: string = '';
  confirmerMotDePasse: string = '';
  isLoading = false;
  showPassword = false;
  resetSuccess = false;

  // ✅ Message d'erreur
  errorMessage: string = '';
  showError: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  onSubmit() {
    const email = this.email?.trim() || '';
    const nouveauMotDePasse = this.nouveauMotDePasse?.trim() || '';

    // ✅ Réinitialiser l'erreur
    this.showError = false;
    this.errorMessage = '';

    if (!email) {
      this.showError = true;
      this.errorMessage = ' Veuillez entrer votre email';
      return;
    }

    if (nouveauMotDePasse.length < 8) {
      this.showError = true;
      this.errorMessage = ' Le mot de passe doit contenir au moins 8 caractères';
      return;
    }

    if (nouveauMotDePasse !== this.confirmerMotDePasse) {
      this.showError = true;
      this.errorMessage = ' Les mots de passe ne correspondent pas';
      return;
    }

    this.isLoading = true;

    this.authService.resetPassword(email, nouveauMotDePasse).subscribe({
      next: () => {
        this.isLoading = false;
        this.resetSuccess = true;
        this.showError = false;
        this.toastService.success('✅ Mot de passe réinitialisé avec succès !', 3000);
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.isLoading = false;
        
        this.showError = true;
        if (err.status === 404) {
          this.errorMessage = '❌ Email non trouvé dans notre système';
        } else {
          this.errorMessage = '❌ Erreur lors de la réinitialisation du mot de passe';
        }
      }
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}