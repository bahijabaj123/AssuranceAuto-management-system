// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { AuthLayoutComponent } from './components/layout/auth-layout/auth-layout.component';
import { AppLayoutComponent } from './components/layout/app-layout/app-layout.component';

// ============================================================
// PAGES AUTH
// ============================================================
import { LoginComponent } from './components/pages/auth/login/login.component';
import { RegisterComponent } from './components/pages/auth/register/register.component';
import { ResetPwdComponent } from './components/pages/auth/reset-pwd/reset-pwd.component';
import { ProfilComponent } from './components/pages/auth/profil/profil.component';
import { ListeAlertesComponent } from './components/pages/alertes/liste-alertes/liste-alertes.component';

// ============================================================
// PAGES PRINCIPALES
// ============================================================
import { EstimationComponent } from './components/pages/estimation/estimation.component';
import { ResultatComponent } from './components/pages/resultat/resultat.component';
import { DashboardComponent } from './components/pages/dashboard/dashboard.component';
import { DossierDetailComponent } from './components/pages/dossier-detail/dossier-detail.component';
import { DossiersComponent } from './components/pages/dossiers/dossiers.component';
import { HistoriqueComponent } from './components/pages/historique/historique.component';
import { BaseLesionsComponent } from './components/pages/base-lesions/base-lesions.component';

// ============================================================
// GESTION DES DOSSIERS
// ============================================================
import { RechercheDossierComponent } from './components/pages/gestion/recherche-dossier/recherche-dossier.component';
import { EtatSuiviComponent } from './components/pages/gestion/etat-suivi/etat-suivi.component';
import { SortJugComponent } from './components/pages/gestion/sort-jug/sort-jug.component';
import { DossProvisoiresComponent } from './components/pages/gestion/doss-provisoires/doss-provisoires.component';
import { DossArt18Component } from './components/pages/gestion/doss-art18/doss-art18.component';

// ============================================================
// FORMULAIRES
// ============================================================
import { FormulaireJudiciaireComponent } from './components/pages/gestion/formulaire-judiciaire/formulaire-judiciaire.component';
import { FormulaireSortJugComponent } from './components/pages/gestion/formulaire-sort-jug/formulaire-sort-jug.component';
import { FormulaireDossProvisoireComponent } from './components/pages/gestion/formulaire-doss-provisoire/formulaire-doss-provisoire.component';
import { FormulaireArt18Component } from './components/pages/gestion/formulaire-art18/formulaire-art18.component';

// ============================================================
// SINISTRES
// ============================================================
import { ListeSinistresComponent } from './components/pages/sinistres/liste-sinistres/liste-sinistres.component';
import { FormulaireSinistreComponent } from './components/pages/sinistres/formulaire-sinistre/formulaire-sinistre.component';
import { DashboardSinistresComponent } from './components/pages/sinistres/dashboard-sinistres/dashboard-sinistres.component';

// ============================================================
// AUDIT - HISTORIQUE DES MODIFICATIONS
// ============================================================
import { HistoriqueAuditComponent } from './components/pages/audit/historique-audit/historique-audit.component';
import { DashboardAdminComponent } from './components/pages/admin/dashboard-admin/dashboard-admin.component';

// ✅ AJOUTER L'IMPORT DE GestionUtilisateursComponent
import { GestionUtilisateursComponent } from './components/pages/admin/gestion-utilisateurs/gestion-utilisateurs.component';

// ============================================================
// ROUTES
// ============================================================
export const routes: Routes = [

  // ============================================================
  // 🔓 ROUTES AUTH (Sans sidebar)
  // ============================================================
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'reset-password', component: ResetPwdComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },

  // ============================================================
  // 🔒 ROUTES PRIVÉES (Avec sidebar)
  // ============================================================
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    children: [
      // ---------- Profil ----------
      { path: 'profil', component: ProfilComponent },

      // ---------- IPP Estimation ----------
      { path: 'estimation', component: EstimationComponent },
      { path: 'resultat', component: ResultatComponent },

      // ---------- Dashboard & Dossiers ----------
      { path: 'dashboard', component: DashboardComponent },
      { path: 'dossiers', component: DossiersComponent },
      { path: 'dossier/:id', component: DossierDetailComponent },
      { path: 'historique', component: HistoriqueComponent },
      { path: 'base-lesions', component: BaseLesionsComponent },

      // ---------- Gestion des dossiers ----------
      { path: 'gestion/recherche-dossier', component: RechercheDossierComponent },
      { path: 'gestion/etat-suivi', component: EtatSuiviComponent },
      { path: 'gestion/sort-jug', component: SortJugComponent },
      { path: 'gestion/doss-provisoires', component: DossProvisoiresComponent },
      { path: 'gestion/doss-art18', component: DossArt18Component },

      // ---------- Formulaires ----------
      { path: 'gestion/formulaire-judiciaire', component: FormulaireJudiciaireComponent },
      { path: 'gestion/formulaire-judiciaire/:id', component: FormulaireJudiciaireComponent },
      { path: 'gestion/formulaire-sort-jug', component: FormulaireSortJugComponent },
      { path: 'gestion/formulaire-sort-jug/:id', component: FormulaireSortJugComponent },
      { path: 'gestion/formulaire/doss-provisoires', component: FormulaireDossProvisoireComponent },
      { path: 'gestion/formulaire/doss-provisoires/:id', component: FormulaireDossProvisoireComponent },
      { path: 'gestion/formulaire-art18', component: FormulaireArt18Component },
      { path: 'gestion/formulaire-art18/:id', component: FormulaireArt18Component },

      // ---------- Sinistres ----------
      { path: 'sinistres', component: ListeSinistresComponent },
      { path: 'sinistres/formulaire', component: FormulaireSinistreComponent },
      { path: 'sinistres/formulaire/:id', component: FormulaireSinistreComponent },
      { path: 'sinistres/dashboard', component: DashboardSinistresComponent },

      // ---------- Admin ----------
      { path: 'historique-audit', component: HistoriqueAuditComponent, canActivate: [authGuard] },
      { path: 'admin/dashboard', component: DashboardAdminComponent, canActivate: [authGuard] },
      
      // ✅ ROUTE GESTION UTILISATEURS
      { path: 'admin/utilisateurs', component: GestionUtilisateursComponent, canActivate: [authGuard] },

      // ---------- Alertes ----------
      { path: 'alertes', component: ListeAlertesComponent, canActivate: [authGuard] },

      // ---------- Route par défaut après login ----------
      { path: '', redirectTo: '/gestion/recherche-dossier', pathMatch: 'full' }
    ]
  },

  // ✅ Route wildcard (404)
  { path: '**', redirectTo: '/login' }
];