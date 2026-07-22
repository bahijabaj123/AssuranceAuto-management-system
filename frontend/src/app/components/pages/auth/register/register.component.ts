// src/app/components/pages/auth/register/register.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  user = {
    nom: '',
    prenom: '',
    email: '',
    password: '',        // ✅ password
    confirmerMotDePasse: '',
    role: 'GESTIONNAIRE'
  };

  isLoading = false;
  showPassword = false;

  get passwordStrength(): { width: string; color: string; label: string } {
    const pwd = this.user.password;
    if (!pwd) return { width: '0%', color: '#e6eaef', label: 'Entrez un mot de passe' };

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

    return levels[Math.min(score, 4) - 1] || levels[0];
  }

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  onSubmit() {
    const nom = this.user.nom?.trim() || '';
    const prenom = this.user.prenom?.trim() || '';
    const email = this.user.email?.trim() || '';
    const password = this.user.password?.trim() || '';

    if (!nom || !prenom || !email || !password) {
      this.toastService.error('Veuillez remplir tous les champs');
      return;
    }

    if (password.length < 8) {
      this.toastService.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (password !== this.user.confirmerMotDePasse) {
      this.toastService.error('Les mots de passe ne correspondent pas');
      return;
    }

    this.isLoading = true;

    this.authService.register({
      nom: nom,
      prenom: prenom,
      email: email,
      password: password,   // ✅ password
      role: this.user.role
    }).subscribe({
      next: () => {
        this.toastService.success('Compte créé avec succès !');
        this.isLoading = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Erreur d\'inscription:', err);
        const message = err.error?.message || 'Erreur lors de la création du compte';
        this.toastService.error(message);
        this.isLoading = false;
      }
    });
  }

  selectRole(role: string) {
    this.user.role = role;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
