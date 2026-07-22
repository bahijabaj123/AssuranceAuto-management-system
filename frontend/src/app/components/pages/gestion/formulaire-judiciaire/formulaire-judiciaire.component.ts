// src/app/components/pages/gestion/formulaire-judiciaire/formulaire-judiciaire.component.ts
import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DossierJudiciaire, dossierJudiciaireVide, NATURES_AFFAIRE, REGIONS } from '../../../../models/dossier-judiciaire.model';
import { DossierJudiciaireService } from '../../../../services/dossier-judiciaire.service';
import { ToastService } from '../../../../services/toast.service';
import { AuthService } from '../../../../services/auth.service';  // ✅ AJOUTER

@Component({
  selector: 'app-formulaire-judiciaire',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formulaire-judiciaire.component.html',
  styleUrls: ['./formulaire-judiciaire.component.css']
})
export class FormulaireJudiciaireComponent implements OnInit {

  dossier: DossierJudiciaire = dossierJudiciaireVide();
  isEditMode = false;
  isSaving = false;
  isLoading = true;
  isDataLoaded = false;
  dossierId: number | null = null;

  naturesAffaire = NATURES_AFFAIRE;
  regions = REGIONS;
  currentUserId: number = 1;  // ✅ On va le modifier

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dossierService: DossierJudiciaireService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private authService: AuthService  // ✅ AJOUTER
  ) {}

  ngOnInit() {
    // ✅ Récupérer l'ID utilisateur connecté
    this.currentUserId = this.authService.getCurrentUserId();
    console.log('👤 ID utilisateur connecté:', this.currentUserId);

    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      console.log('🔍 ID param reçu:', idParam);
      
      if (idParam && idParam !== 'nouveau') {
        this.dossierId = +idParam;
        this.isEditMode = true;
        this.isLoading = true;
        this.isDataLoaded = false;
        this.chargerDossier(this.dossierId);
      } else {
        this.isEditMode = false;
        this.isLoading = false;
        this.isDataLoaded = true;
        this.dossier = dossierJudiciaireVide();
        this.dossier.idUtilisateur = this.currentUserId;
        this.cdr.detectChanges();
        console.log('📝 Mode création');
      }
    });
  }

  chargerDossier(id: number) {
    this.isLoading = true;
    this.cdr.detectChanges();
    
    this.dossierService.getById(id).subscribe({
      next: (data) => {
        console.log('✅ Données reçues:', data);
        
        this.ngZone.run(() => {
          if (data) {
            this.dossier = {
              id: data.id,
              numDos: data.numDos || '',
              dateAudience: data.dateAudience || null,
              tiers: data.tiers || '',
              ipp: data.ipp || null,
              nbJours: data.nbJours || null,
              reglements: data.reglements || '',
              natureAff: data.natureAff || '',
              region: data.region || '',
              avocat: data.avocat || '',
              affInstance: data.affInstance || '',
              dateReportInstance: data.dateReportInstance || null,
              dateJugInstance: data.dateJugInstance || null,
              affAppel: data.affAppel || '',
              dateReportAppel: data.dateReportAppel || null,
              dateJugAppel: data.dateJugAppel || null,
              affCassation: data.affCassation || '',
              dateJugCassation: data.dateJugCassation || null,
              observation: data.observation || '',
              idUtilisateur: data.idUtilisateur || this.currentUserId  // ✅ Utiliser l'ID connecté
            };
            console.log('📝 Dossier MAPPÉ:', this.dossier);
          } else {
            this.toastService.error('Dossier introuvable');
            this.router.navigate(['/gestion/etat-suivi']);
            return;
          }
          
          this.isLoading = false;
          this.isDataLoaded = true;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.ngZone.run(() => {
          this.toastService.error('Erreur lors du chargement');
          this.isLoading = false;
          this.isDataLoaded = true;
          this.cdr.detectChanges();
        });
      }
    });
  }

  enregistrer() {
    if (!this.dossier.numDos || !this.dossier.numDos.trim()) {
      this.toastService.error('Le numéro de dossier est obligatoire');
      return;
    }

    // ✅ FORCER l'ID utilisateur connecté
    this.dossier.idUtilisateur = this.currentUserId;

    const dataToSend: any = { ...this.dossier };
    
    // Nettoyer les données
    if (dataToSend.reglements && isNaN(parseFloat(dataToSend.reglements))) {
      dataToSend.reglements = null;
    }
    if (dataToSend.ipp && isNaN(parseFloat(dataToSend.ipp))) {
      dataToSend.ipp = null;
    }
    if (dataToSend.nbJours && isNaN(parseInt(dataToSend.nbJours))) {
      dataToSend.nbJours = null;
    }

    Object.keys(dataToSend).forEach(key => {
      if (dataToSend[key] === '' || dataToSend[key] === null || dataToSend[key] === undefined) {
        dataToSend[key] = null;
      }
    });

    console.log('📤 Envoi au backend:', JSON.stringify(dataToSend));
    console.log('👤 idUtilisateur envoyé:', dataToSend.idUtilisateur);  // ✅ Vérifier

    this.isSaving = true;
    this.cdr.detectChanges();

    const action = this.isEditMode && this.dossierId != null
      ? this.dossierService.update(this.dossierId, dataToSend)
      : this.dossierService.create(dataToSend);

    action.subscribe({
      next: (response) => {
        console.log('✅ Succès:', response);
        this.toastService.success(this.isEditMode ? 'Dossier mis à jour' : 'Dossier créé avec succès');
        this.isSaving = false;
        this.router.navigate(['/gestion/etat-suivi']);
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.toastService.error('Erreur lors de l\'enregistrement');
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }

  annuler() {
    this.router.navigate(['/gestion/etat-suivi']);
  }
}
