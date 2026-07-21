// src/app/components/layout/app-layout/app-layout.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <div class="app-layout">
      <app-sidebar></app-sidebar>
      <div class="main-content">
        <app-header></app-header>
        <div class="page-content">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      min-height: 100vh;
      background: #f5f7fa;
      margin: 0;
      padding: 0;
    }

    .main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 0;
  margin-left: 0;
  min-width: 0;
}

    .page-content {
      flex: 1;
      padding: 0;
      background: #f5f7fa;
      margin: 0;
    }

    @media (max-width: 768px) {
      .main-content {
        margin-left: 0;
      }
    }
  `]
})
export class AppLayoutComponent {}