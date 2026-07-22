// src/app/components/pages/gestion/formulaire-doss-provisoire/formulaire-doss-provisoire.component.ts
import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DossierProvisoire, dossierProvisoireVide } from '../../../../models/dossier-provisoire.model';
import { DossierProvisoireService } from '../../../../services/dossier-provisoire.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-formulaire-doss-provisoire',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formulaire-doss-provisoire.component.html',
  styleUrls: ['./formulaire-doss-provisoire.component.css']
})
export class FormulaireDossProvisoireComponent implements OnInit {

  dossier: DossierProvisoire = dossierProvisoireVide();
  isEditMode = false;
  isSaving = false;
  isLoading = true;
  dossierId: number | null = null;
  isDataLoaded = false;

  regions = [
    'Tunis', 'Ariana', 'Ben Arous', 'Manouba',
    'Sfax', 'Sousse', 'Kairouan', 'Sidi Bouzid',
    'Gafsa', 'Mednine', 'Bizerte', 'Nabeul',
    'Beja', 'Jendouba', 'Kef', 'Mahdia',
    'Monastir', 'Tozeur', 'Tataouine', 'Grombalia'
  ];

  natures = ['Accident corporel', 'Dommages matériels', 'Recours tiers'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dossierService: DossierProvisoireService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    console.log('🔍 ngOnInit - Début');
    
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      console.log('🔍 ID param reçu:', idParam);
      
      if (idParam) {
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
        console.log('📝 Mode création - Nouveau dossier provisoire');
        this.cdr.detectChanges();
      }
    });
  }

  chargerDossier(id: number) {
    console.log('🔄 Chargement du dossier ID:', id);
    this.isLoading = true;
    this.isDataLoaded = false;
    this.cdr.detectChanges();
    
    this.dossierService.getById(id).subscribe({
      next: (data) => {
        console.log('✅ Dossier chargé:', data);
        
        this.ngZone.run(() => {
          if (data) {
            this.dossier = data;
            console.log('📝 Dossier mappé:', this.dossier);
          } else {
            this.toastService.error('Dossier introuvable');
            this.router.navigate(['/gestion/doss-provisoires']);
            return;
          }
          
          this.isLoading = false;
          this.isDataLoaded = true;
          this.cdr.detectChanges();
          
          console.log('📝 isLoading:', this.isLoading);
          console.log('📝 isDataLoaded:', this.isDataLoaded);
          console.log('📝 Formulaire devrait être affiché');
        });
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.ngZone.run(() => {
          this.toastService.error('Erreur lors du chargement du dossier');
          this.isLoading = false;
          this.isDataLoaded = true;
          this.cdr.detectChanges();
        });
      }
    });
  }

  enregistrer() {
    if (!this.dossier.numProv || !this.dossier.numProv.trim()) {
      this.toastService.error('Le numéro de dossier provisoire est obligatoire');
      return;
    }

    this.isSaving = true;
    this.cdr.detectChanges();

    const action = this.isEditMode && this.dossierId != null
      ? this.dossierService.update(this.dossierId, this.dossier)
      : this.dossierService.create(this.dossier);

    action.subscribe({
      next: (response) => {
        console.log('✅ Dossier enregistré:', response);
        this.ngZone.run(() => {
          this.toastService.success(this.isEditMode ? 'Dossier mis à jour' : 'Dossier créé avec succès');
          this.isSaving = false;
          this.cdr.detectChanges();
          this.router.navigate(['/gestion/doss-provisoires']);
        });
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.ngZone.run(() => {
          this.toastService.error('Erreur lors de l\'enregistrement');
          this.isSaving = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  annuler() {
    this.router.navigate(['/gestion/doss-provisoires']);
  }
}
