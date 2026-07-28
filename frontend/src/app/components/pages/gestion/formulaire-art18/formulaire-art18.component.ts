// src/app/components/pages/gestion/formulaire-art18/formulaire-art18.component.ts
import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DossierArt18, dossierArt18Vide } from '../../../../models/dossier-art18.model';
import { DossArt18Service } from '../../../../services/doss-art18.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-formulaire-art18',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formulaire-art18.component.html',
  styleUrls: ['./formulaire-art18.component.css']
})
export class FormulaireArt18Component implements OnInit {

  dossier: DossierArt18 = dossierArt18Vide();
  isEditMode = false;
  isSaving = false;
  isLoading = true;
  isDataLoaded = false;
  dossierId: number | null = null;

  regions = [
    'Tunis', 'Ariana', 'Ben Arous', 'Manouba',
    'Sfax', 'Sousse', 'Kairouan', 'Sidi Bouzid',
    'Gafsa', 'Mednine', 'Bizerte', 'Nabeul',
    'Beja', 'Jendouba', 'Kef', 'Mahdia',
    'Monastir', 'Tozeur', 'Tataouine', 'Grombalia'
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private art18Service: DossArt18Service,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    console.log('🔍 FormulaireArt18 - ngOnInit');
    
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      console.log('🔍 ID param reçu:', idParam);
      
      if (idParam && idParam !== 'nouveau') {
        this.dossierId = +idParam;
        this.isEditMode = true;
        this.isLoading = true;
        this.isDataLoaded = false;
        console.log('📝 Mode édition - ID:', this.dossierId);
        this.chargerDossier(this.dossierId);
      } else {
        this.isEditMode = false;
        this.isLoading = false;
        this.isDataLoaded = true;
        this.dossier = dossierArt18Vide();
        this.cdr.detectChanges();
        console.log('📝 Mode création - Nouveau dossier ART18');
      }
    });
  }

  // formulaire-art18.component.ts - chargerDossier()

chargerDossier(id: number) {
  console.log('🔄 Chargement du dossier ART18 ID:', id);
  this.isLoading = true;
  this.cdr.detectChanges();
  
  this.art18Service.getById(id).subscribe({
    next: (data) => {
      console.log('✅ Données reçues:', data);
      
      this.ngZone.run(() => {
        if (data) {
          // ✅ Utiliser ref ou reference selon ce qui est disponible
          const refValue = data.reference || data.reference || '';
          
          this.dossier = {
            id: data.id,
            reference: refValue,  // Le modèle utilise reference
            cieAdverse: data.cieAdverse || '',
            region: data.region || '',
            blesse: data.blesse || '',
            dateEnvoiLettInfo: data.dateEnvoiLettInfo || '',
            secRecupInforme: data.secRecupInforme || 'Non',
            date: data.date || '',
            idUtilisateur: data.idUtilisateur,
            dateCreation: data.dateCreation,
            dateModification: data.dateModification
          };
          
          console.log('📝 Dossier MAPPÉ:', JSON.stringify(this.dossier));
        } else {
          this.toastService.error('Dossier introuvable');
          this.router.navigate(['/gestion/doss-art18']);
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
  // src/app/components/pages/gestion/formulaire-art18/formulaire-art18.component.ts

enregistrer() {
  if (!this.dossier.reference || !this.dossier.reference.trim()) {
    this.toastService.error('La référence est obligatoire');
    return;
  }

  // ✅ Envoyer à la fois ref ET reference
  const dataToSend: any = {
    ref: this.dossier.reference.trim(),        // ✅ Pour la colonne ref (obligatoire)
    reference: this.dossier.reference.trim(),  // ✅ Pour la colonne reference
    cieAdverse: this.dossier.cieAdverse || null,
    region: this.dossier.region || null,
    blesse: this.dossier.blesse || null,
    dateEnvoiLettInfo: this.dossier.dateEnvoiLettInfo || null,
    secRecupInforme: this.dossier.secRecupInforme || null,
    date: this.dossier.date || null
  };

  console.log('📤 Envoi au backend:', JSON.stringify(dataToSend));
  this.isSaving = true;
  this.cdr.detectChanges();

  const action = this.isEditMode && this.dossierId != null
    ? this.art18Service.update(this.dossierId, dataToSend)
    : this.art18Service.create(dataToSend);

  action.subscribe({
    next: (response) => {
      console.log('✅ Réponse du backend:', response);
      this.toastService.success(this.isEditMode ? 'Dossier mis à jour' : 'Dossier créé avec succès');
      this.isSaving = false;
      this.cdr.detectChanges();
      this.router.navigate(['/gestion/doss-art18']);
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
    this.router.navigate(['/gestion/doss-art18']);
  }
}