// src/app/components/pages/gestion/recherche-dossier/recherche-dossier.component.ts
import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ToastService } from '../../../../services/toast.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-recherche-dossier',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recherche-dossier.component.html',
  styleUrls: ['./recherche-dossier.component.css']
})
export class RechercheDossierComponent {

  searchTerm: string = '';
  isLoading: boolean = false;
  hasSearched: boolean = false;
  searchResult: any = null;
  currentUserId: number = 0;
  users: any[] = [];

  private api = 'http://localhost:8081/api';

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.currentUserId = this.authService.getCurrentUserId();
    this.chargerUtilisateurs();
  }

  chargerUtilisateurs() {
    this.http.get<any[]>(`${this.api}/utilisateurs`).subscribe({
      next: (data) => {
        this.users = data;
        console.log('👤 Utilisateurs chargés:', this.users);
      },
      error: (err) => {
        console.error('❌ Erreur chargement utilisateurs:', err);
      }
    });
  }

  getProprietaireNom(idUtilisateur: number): string {
    if (!idUtilisateur) return 'Non assigné';
    const user = this.users.find(u => u.id === idUtilisateur);
    if (user) {
      const nomComplet = `${user.prenom || ''} ${user.nom}`.trim();
      return nomComplet || `ID: ${idUtilisateur}`;
    }
    return `ID: ${idUtilisateur}`;
  }

  isProprietaire(idUtilisateur: number): boolean {
    return idUtilisateur === this.currentUserId;
  }

  isArabic(text: string): boolean {
    if (!text) return false;
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return arabicRegex.test(text);
  }

  // ✅ RECHERCHE UNIFIÉE AVEC NOM_TIERS
  rechercher() {
    const num = this.searchTerm.trim();
    if (!num) {
      this.toastService.error('Veuillez entrer un numéro de dossier ou un nom de tiers');
      return;
    }

    this.isLoading = true;
    this.hasSearched = true;
    this.searchResult = null;
    this.cdr.detectChanges();

    forkJoin({
      suivi: this.http.get<any[]>(`${this.api}/suivi-dossiers/search`, {
        params: new HttpParams().set('numDos', num)
      }).pipe(catchError(() => of([]))),
      
      sortJug: this.http.get<any[]>(`${this.api}/sort-jug/search`, {
        params: new HttpParams().set('numDos', num)
      }).pipe(catchError(() => of([]))),
      
      provisoire: this.http.get<any[]>(`${this.api}/dossiers-provisoires/search`, {
        params: new HttpParams().set('numDos', num)
      }).pipe(catchError(() => of([]))),
      
      art18: this.http.get<any[]>(`${this.api}/doss-art18/search`, {
        params: new HttpParams().set('numDos', num)
      }).pipe(catchError(() => of([]))),
      
      // ✅ RECHERCHE DANS DONNEES_SINISTRES (par sin ET par nom_tiers)
       donneesSinistres: this.http.get<any[]>(`${this.api}/donnees-sinistres/search`, {
      params: new HttpParams().set('sin', num)  // ✅ UNIQUEMENT par sin
    }).pipe(catchError(() => of([])))
    }).subscribe({
      next: (data) => {
        const suiviList = data.suivi || [];
        const sortJugList = data.sortJug || [];
        const provisoireList = data.provisoire || [];
        const art18List = data.art18 || [];
        const donneesSinistresList = data.donneesSinistres || [];

        const total = suiviList.length + sortJugList.length + provisoireList.length + 
                      art18List.length + donneesSinistresList.length;

        this.searchResult = {
          numDos: num,
          suiviList,
          sortJugList,
          provisoireList,
          art18List,
          donneesSinistresList,
          totalTrouve: total
        };

        this.isLoading = false;
        this.cdr.detectChanges();

        if (total === 0) {
          this.toastService.warning(`Aucun enregistrement trouvé pour "${num}"`);
        } else {
          this.toastService.success(`${total} enregistrement(s) trouvé(s) pour "${num}"`);
        }
      },
      error: (err) => {
        console.error('Erreur de recherche:', err);
        this.isLoading = false;
        this.hasSearched = true;
        this.searchResult = {
          numDos: num,
          suiviList: [],
          sortJugList: [],
          provisoireList: [],
          art18List: [],
          donneesSinistresList: [],
          totalTrouve: 0
        };
        this.cdr.detectChanges();
        this.toastService.error('Erreur lors de la recherche');
      }
    });
  }

  goToEdit(table: string, id: number) {
    const dossier = this.getDossierById(table, id);
    if (!dossier) {
      this.toastService.error('Dossier introuvable');
      return;
    }
    
    // ✅ Pour donnees_sinistres, rediriger vers formulaire-sinistre
    if (table === 'donneesSinistres') {
      this.router.navigate(['/sinistres/formulaire', id]);
      return;
    }
    
    if (!this.isProprietaire(dossier.idUtilisateur)) {
      this.toastService.error('Vous ne pouvez pas modifier ce dossier');
      return;
    }
    
    const routes: Record<string, string> = {
      suivi: '/gestion/formulaire-judiciaire',
      sortJug: '/gestion/formulaire-sort-jug',
      provisoire: '/gestion/formulaire/doss-provisoires',
      art18: '/gestion/formulaire-art18'
    };
    this.router.navigate([routes[table], id]);
  }

  getDossierById(table: string, id: number): any {
    if (!this.searchResult) return null;
    const list = this.searchResult[`${table}List`] || [];
    return list.find((d: any) => d.id === id);
  }

  supprimer(table: string, id: number) {
    const dossier = this.getDossierById(table, id);
    if (!dossier) {
      this.toastService.error('Dossier introuvable');
      return;
    }
    
    // ✅ Pour donnees_sinistres, utiliser le bon endpoint
    if (table === 'donneesSinistres') {
      if (!confirm(`Supprimer cet enregistrement de sinistre ?`)) return;
      this.http.delete(`${this.api}/donnees-sinistres/${id}`).subscribe({
        next: () => {
          this.toastService.success('Sinistre supprimé');
          this.rechercher();
        },
        error: () => {
          this.toastService.error('Erreur lors de la suppression');
        }
      });
      return;
    }
    
    if (!this.isProprietaire(dossier.idUtilisateur)) {
      this.toastService.error('Vous ne pouvez pas supprimer ce dossier');
      return;
    }
    
    if (!confirm(`Supprimer cet enregistrement de ${table} ?`)) return;
    
    const endpoints: Record<string, string> = {
      suivi: 'suivi-dossiers',
      sortJug: 'sort-jug',
      provisoire: 'dossiers-provisoires',
      art18: 'doss-art18'
    };
    
    this.http.delete(`${this.api}/${endpoints[table]}/${id}`).subscribe({
      next: () => {
        this.toastService.success('Enregistrement supprimé');
        this.rechercher();
      },
      error: () => {
        this.toastService.error('Erreur lors de la suppression');
      }
    });
  }

  goToCreate(table: string) {
    const routes: Record<string, string> = {
      suivi: '/gestion/formulaire-judiciaire',
      sortJug: '/gestion/formulaire-sort-jug',
      provisoire: '/gestion/formulaire/doss-provisoires',
      art18: '/gestion/formulaire-art18',
      donneesSinistres: '/sinistres/formulaire'  // ✅ NOUVEAU
    };
    this.router.navigate([routes[table]]);
    this.toastService.info(`Redirection vers le formulaire ${table}`);
  }

  resetRecherche() {
    this.searchTerm = '';
    this.searchResult = null;
    this.hasSearched = false;
    this.cdr.detectChanges();
  }

  navigateTo(table: string) {
    const routes: Record<string, string> = {
      suivi: '/gestion/formulaire-judiciaire',
      sortJug: '/gestion/formulaire-sort-jug',
      provisoire: '/gestion/formulaire/doss-provisoires',
      art18: '/gestion/formulaire-art18',
      donneesSinistres: '/sinistres/formulaire'  // ✅ NOUVEAU
    };
    this.router.navigate([routes[table]]);
    this.toastService.info(`Redirection vers ${table}`);
  }

  countTables(result: any): number {
    if (!result) return 0;
    let count = 0;
    if (result.suiviList && result.suiviList.length > 0) count++;
    if (result.sortJugList && result.sortJugList.length > 0) count++;
    if (result.provisoireList && result.provisoireList.length > 0) count++;
    if (result.art18List && result.art18List.length > 0) count++;
    if (result.donneesSinistresList && result.donneesSinistresList.length > 0) count++;
    return count;
  }

  countTotal(result: any): number {
    if (!result) return 0;
    return (result.suiviList?.length || 0) +
           (result.sortJugList?.length || 0) +
           (result.provisoireList?.length || 0) +
           (result.art18List?.length || 0) +
           (result.donneesSinistresList?.length || 0);
  }

  // ✅ FORMATTER LES MONTANTS
  formatMontant(value: any): string {
    if (!value) return '—';
    const num = parseFloat(value);
    if (isNaN(num)) return '—';
    return num.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' DT';
  }

  // ✅ AFFICHER LE NOM DU TIERS (avec fallback)
  getTiersNom(item: any): string {
    if (item.nomTiers) {
      return item.nomTiers;
    }
    // Pour les anciennes données sans nom_tiers
    if (item.tiers) {
      return item.tiers;
    }
    return '—';
  }
}