// src/app/components/layout/auth-layout/auth-layout.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="auth-layout">
      <div class="auth-container">
        <!-- Logo CARTE -->
        <div class="auth-brand">
          <img src="/assets/logocarte.webp" alt="Carte Assurances" class="auth-logo" />
          <div class="brand-divider"></div>
        </div>
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .auth-layout {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #0a2540 0%, #1a4b6b 50%, #2a6b8b 100%);
      padding: 20px;
    }

    .auth-container {
      width: 100%;
      max-width: 420px;
    }

    .auth-brand {
      text-align: center;
      margin-bottom: 28px;
    }

    .auth-logo {
      max-height: 90px;
      width: auto;
      margin-bottom: 8px;
    }

    .brand-divider {
      width: 60px;
      height: 3px;
      background: #4cc8dd;
      border-radius: 20px;
      margin: 8px auto 0;
      box-shadow: 0 0 20px rgba(76, 200, 221, 0.3);
    }
  `]
})
export class AuthLayoutComponent {}