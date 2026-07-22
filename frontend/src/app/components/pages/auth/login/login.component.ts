// src/app/components/pages/auth/login/login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;
  
  // ✅ Message d'erreur
  errorMessage: string = '';
  showError: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  onLogin() {
    const email = this.email?.trim() || '';
    const password = this.password?.trim() || '';

    // ✅ Réinitialiser l'erreur
    this.showError = false;
    this.errorMessage = '';

    if (!email || !password) {
      this.showError = true;
      this.errorMessage = '⚠️ Veuillez remplir tous les champs';
      return;
    }

    this.isLoading = true;

    this.authService.login(email, password).subscribe({
      next: (response) => {
        console.log('✅ Connexion réussie:', response);
        this.authService.setCurrentUser(response);
        
        // ✅ Réinitialiser l'erreur
        this.showError = false;
        this.errorMessage = '';
        
        this.toastService.success('Connexion réussie !', 3000);
        this.isLoading = false;
        
        this.router.navigate(['/gestion/recherche-dossier']);
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        
        // ✅ Afficher l'erreur en rouge dans le formulaire
        this.showError = true;
        if (err.status === 401) {
          this.errorMessage = '❌ Email ou mot de passe incorrect. Veuillez réessayer.';
        } else {
          this.errorMessage = '❌ Une erreur est survenue. Veuillez réessayer.';
        }
        
        this.isLoading = false;
      }
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
