// src/app/components/pages/gestion/etat-suivi/etat-suivi.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';  // ✅ AJOUTER ActivatedRoute
import { DossierJudiciaireService } from '../../../../services/dossier-judiciaire.service';
import { ToastService } from '../../../../services/toast.service';
import { ExportService } from '../../../../services/export.service';
import { ModalService } from '../../../../services/modal.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-etat-suivi',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './etat-suivi.component.html',
  styleUrls: ['./etat-suivi.component.css']
})
export class EtatSuiviComponent implements OnInit {

  allDossiers: any[] = [];
  filteredDossiers: any[] = [];
  paginatedDossiers: any[] = [];
  anneeFiltre: number | null = null;
  anneesDisponibles: number[] = [];
  isLoading = true;
  currentUserId: number = 0;
  isAdmin: boolean = false;

  // Filtres
  search = '';
  regionFiltre = '';
  natureFiltre = '';
  regions: string[] = [];
  natures: string[] = ['CIV', 'CORR', 'PENAL', 'ADMIN'];

  // ✅ Nouveaux filtres
  ippMin: number | null = null;
  ippMax: number | null = null;
  nbJoursMin: number | null = null;
  nbJoursMax: number | null = null;
  proprietaireFiltre: string = '';
  utilisateurs: any[] = [];

  // ✅ Filtre année (pour navigation depuis dashboard)

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  constructor(
    private dossierService: DossierJudiciaireService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute,  // ✅ AJOUTER
    private cdr: ChangeDetectorRef,
    private exportService: ExportService,
    private modalService: ModalService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentUserId = this.authService.getCurrentUserId()!;
    this.isAdmin = this.authService.isAdmin();
    console.log('👤 ID utilisateur connecté:', this.currentUserId);
    console.log('👑 Est administrateur:', this.isAdmin);

    // ✅ Récupérer les paramètres de l'URL (pour navigation depuis dashboard)
    this.route.queryParams.subscribe(params => {
      console.log('📥 Paramètres reçus de l\'URL:', params);
      
      let hasFilters = false;

      if (params['search']) {
        this.search = params['search'];
        hasFilters = true;
      }
      if (params['region']) {
        this.regionFiltre = params['region'];
        hasFilters = true;
      }
      if (params['nature']) {
        this.natureFiltre = params['nature'];
        hasFilters = true;
      }
      if (params['proprietaire']) {
        this.proprietaireFiltre = params['proprietaire'];
        hasFilters = true;
      }
      if (params['ippMin']) {
        this.ippMin = parseFloat(params['ippMin']);
        hasFilters = true;
      }
      if (params['ippMax']) {
        this.ippMax = parseFloat(params['ippMax']);
        hasFilters = true;
      }
      if (params['annee']) {
        this.anneeFiltre = parseInt(params['annee']);
        hasFilters = true;
      }

      if (hasFilters) {
        console.log('✅ Filtres appliqués depuis l\'URL');
        // Les filtres seront appliqués après le chargement des dossiers
      }
    });

    this.chargerDossiers();
    this.chargerUtilisateurs();
  }

  // ✅ Charger les dossiers selon le rôle
  chargerDossiers() {
    this.isLoading = true;
    this.cdr.detectChanges();

    let request;

    if (this.isAdmin) {
      console.log('👑 ADMIN - Chargement de tous les dossiers');
      request = this.dossierService.getAll();
    } else {
      console.log('👤 GESTIONNAIRE - Chargement de ses dossiers');
      request = this.dossierService.getMyDossiers();
    }

    request.subscribe({
      next: (data) => {
        console.log('📋 Dossiers reçus:', data.length);
        this.allDossiers = data;
        this.regions = [...new Set(data.map(d => d.region || d.region).filter(r => r))];
        this.anneesDisponibles = this.getAnneesDisponibles(data);
        console.log('📅 Années disponibles:', this.anneesDisponibles);
        this.applyFilters();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.toastService.error('❌ Erreur lors du chargement des dossiers', 4000);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ✅ Charger la liste des utilisateurs pour le filtre propriétaire
  chargerUtilisateurs() {
    console.log('🔄 Chargement des utilisateurs...');
    this.dossierService.getUtilisateurs().subscribe({
      next: (data) => {
        this.utilisateurs = data;
        console.log('✅ Utilisateurs chargés:', this.utilisateurs);
        console.log('🔍 Contenu utilisateurs:', JSON.stringify(this.utilisateurs));
      },
      error: (err) => {
        console.error('❌ Erreur chargement utilisateurs:', err);
      }
    });
  }

  // ✅ Vérifier si l'utilisateur est propriétaire du dossier
  isOwner(dossier: any): boolean {
    return dossier.idUtilisateur === this.currentUserId;
  }

  // ✅ Récupérer le nom du propriétaire
  getProprietaireNom(idUtilisateur: number): string {
    console.log('🔍 Recherche propriétaire pour ID:', idUtilisateur);
    console.log('📋 Liste utilisateurs:', this.utilisateurs);
    
    if (!idUtilisateur) return 'Non assigné';
    
    const user = this.utilisateurs.find(u => u.id === idUtilisateur);
    console.log('👤 Utilisateur trouvé:', user);
    
    if (user) {
      const nomComplet = `${user.prenom || ''} ${user.nom}`.trim();
      console.log('✅ Nom complet:', nomComplet);
      return nomComplet || `ID: ${idUtilisateur}`;
    }
    
    console.log('⚠️ Utilisateur non trouvé pour ID:', idUtilisateur);
    return `ID: ${idUtilisateur}`;
  }

  applyFilters() {
    let result = [...this.allDossiers];

    if (this.search && this.search.trim()) {
      const s = this.search.trim().toLowerCase();
      result = result.filter(d =>
        (d.numDos || d.num_dos || '').toLowerCase().includes(s) ||
        (d.tiers || '').toLowerCase().includes(s) ||
        (d.avocat || '').toLowerCase().includes(s) ||
        (d.region || '').toLowerCase().includes(s) ||
        (d.natureAff || d.nature_aff || '').toLowerCase().includes(s)
      );
    }

    if (this.regionFiltre) {
      result = result.filter(d => (d.region || '') === this.regionFiltre);
    }

    if (this.natureFiltre) {
      result = result.filter(d => (d.natureAff || d.nature_aff || '') === this.natureFiltre);
    }

    // ✅ Filtre IPP
    if (this.ippMin !== null && this.ippMin !== undefined && this.ippMin >= 0) {
      result = result.filter(d => {
        const ipp = parseFloat(d.ipp);
        return !isNaN(ipp) && ipp >= this.ippMin!;
      });
    }
    if (this.ippMax !== null && this.ippMax !== undefined && this.ippMax >= 0) {
      result = result.filter(d => {
        const ipp = parseFloat(d.ipp);
        return !isNaN(ipp) && ipp <= this.ippMax!;
      });
    }

    // ✅ Filtre NB JOURS
    if (this.nbJoursMin !== null && this.nbJoursMin !== undefined && this.nbJoursMin >= 0) {
      result = result.filter(d => {
        const nbJours = parseInt(d.nbJours || d.nb_jours);
        return !isNaN(nbJours) && nbJours >= this.nbJoursMin!;
      });
    }
    if (this.nbJoursMax !== null && this.nbJoursMax !== undefined && this.nbJoursMax >= 0) {
      result = result.filter(d => {
        const nbJours = parseInt(d.nbJours || d.nb_jours);
        return !isNaN(nbJours) && nbJours <= this.nbJoursMax!;
      });
    }



    // ✅ Filtre propriétaire
    if (this.proprietaireFiltre) {
      result = result.filter(d => {
        const idUtil = d.idUtilisateur;
        if (this.proprietaireFiltre === 'moi') {
          return idUtil === this.currentUserId;
        } else {
          return idUtil === parseInt(this.proprietaireFiltre);
        }
      });
    }

     if (this.anneeFiltre) {
    result = result.filter(d => {
      const annee = this.extraireAnnee(d);
      return annee === this.anneeFiltre;
    });
  }

    this.filteredDossiers = result;
    this.totalPages = Math.ceil(result.length / this.itemsPerPage) || 1;
    this.currentPage = 1;
    this.updatePagination();
    this.cdr.detectChanges();
  }

  updatePagination() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedDossiers = this.filteredDossiers.slice(start, start + this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
      this.cdr.detectChanges();
    }
  }

  resetFilters() {
    this.search = '';
    this.regionFiltre = '';
    this.natureFiltre = '';
    this.ippMin = null;
    this.ippMax = null;
    this.nbJoursMin = null;
    this.nbJoursMax = null;
    this.proprietaireFiltre = '';
    this.anneeFiltre = null;  // ✅ Réinitialiser aussi l'année
    this.applyFilters();
  }

  goToEdit(id: number) {
    if (id == null) return;
    
    const dossier = this.allDossiers.find(d => d.id === id);
    if (!dossier) {
      this.toastService.error('❌ Dossier introuvable', 3000);
      return;
    }
    
    // ✅ ADMIN peut tout modifier, GESTIONNAIRE seulement ses dossiers
    if (!this.isAdmin && !this.isOwner(dossier)) {
      this.toastService.error('⚠️ Vous ne pouvez pas modifier ce dossier car vous n\'êtes pas le propriétaire', 4000);
      return;
    }
    
    this.router.navigate(['/gestion/formulaire-judiciaire', id]);
  }

  async supprimer(id: number, event: Event): Promise<void> {
    event.stopPropagation();
    if (id == null) return;

    const dossier = this.allDossiers.find(d => d.id === id);
    if (!dossier) {
      this.toastService.error('❌ Dossier introuvable', 3000);
      return;
    }

    // ✅ ADMIN peut tout supprimer, GESTIONNAIRE seulement ses dossiers
    if (!this.isAdmin && !this.isOwner(dossier)) {
      this.toastService.error('⚠️ Vous ne pouvez pas supprimer ce dossier car vous n\'êtes pas le propriétaire', 4000);
      return;
    }

    const confirmed = await this.modalService.confirm(
      'Confirmer la suppression de ce dossier ?',
      '⚠️ Suppression définitive',
      {
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        type: 'danger',
        details: 'Cette action est irréversible. Toutes les données associées seront supprimées définitivement.'
      }
    );

    if (!confirmed) return;

    this.dossierService.delete(id).subscribe({
      next: () => {
        this.toastService.success('✅ Dossier supprimé avec succès', 3000);
        this.chargerDossiers();
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.toastService.error('❌ Erreur lors de la suppression du dossier', 4000);
      }
    });
  }

  exporterExcel() {
    if (this.filteredDossiers.length === 0) {
      this.toastService.warning('Aucun dossier à exporter', 3000);
      return;
    }

    const exportData = this.filteredDossiers.map(d => ({
      'N° DOS': d.numDos || d.num_dos || '',
      '1er AUD': d.dateAudience || d.date_audience || '',
      'Tiers': d.tiers || '',
      'IPP (%)': d.ipp || '',
      'NB JOURS': d.nbJours || d.nb_jours || '',
      'Règlements': d.reglements || '',
      'Nat. Affaire': d.natureAff || d.nature_aff || '',
      'Région': d.region || '',
      'Avocat': d.avocat || '',
      '1ère Instance': d.affInstance || d.aff_instance || '',
      'Date Report Inst.': d.dateReportInstance || d.date_report_instance || '',
      'Date Jug Inst.': d.dateJugInstance || d.date_jug_instance || '',
      'Appel N°': d.affAppel || d.aff_appel || '',
      'Date Report Appel': d.dateReportAppel || d.date_report_appel || '',
      'Date Jug Appel': d.dateJugAppel || d.date_jug_appel || '',
      'Cassation N°': d.affCassation || d.aff_cassation || '',
      'Date Jug Cassation': d.dateJugCassation || d.date_jug_cassation || '',
      'Observation': d.observation || '',
      'Propriétaire': this.getProprietaireNom(d.idUtilisateur)
    }));

    this.exportService.exporterDossiersJudiciaires(exportData);
    this.toastService.success('✅ Export Excel effectué avec succès', 3000);
  }

 // src/app/components/pages/gestion/etat-suivi/etat-suivi.component.ts

private extraireAnnee(dossier: any): number | null {
  const numDos = dossier.numDos || dossier.num_dos;
  if (!numDos) return null;
  const anneeStr = numDos.toString().substring(0, 4);
  const annee = parseInt(anneeStr);
  // ✅ Vérifier que c'est une année valide (entre 2000 et 2030)
  if (isNaN(annee) || annee < 2000 || annee > 2030) {
    return null;
  }
  return annee;
}
  // ✅ Récupérer les années disponibles
 // src/app/components/pages/gestion/etat-suivi/etat-suivi.component.ts

// ✅ Récupérer les années disponibles (UNIQUEMENT les années valides)
private getAnneesDisponibles(dossiers: any[]): number[] {
  const annees = new Set<number>();
  dossiers.forEach(d => {
    const annee = this.extraireAnnee(d);
    // ✅ Filtrer pour garder uniquement les années entre 2000 et 2030
    if (annee && annee >= 2000 && annee <= 2030) {
      annees.add(annee);
    }
  });
  return Array.from(annees).sort((a, b) => a - b);
}



}