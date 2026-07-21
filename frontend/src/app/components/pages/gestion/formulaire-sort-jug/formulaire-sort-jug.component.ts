// src/app/components/pages/gestion/formulaire-sort-jug/formulaire-sort-jug.component.ts
import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SortJugService } from '../../../../services/sort-jug.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-formulaire-sort-jug',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formulaire-sort-jug.component.html',
  styleUrls: ['./formulaire-sort-jug.component.css']
})
export class FormulaireSortJugComponent implements OnInit {

  id: string | null = null;
  isEditMode = false;
  isLoading = false;
  isSaving = false;
  isDataLoaded = false;

  dossier: any = {
    numDos: '',
    jugNum: '',
    region: '',
    dateSignification: '',
    huissierNotaire: '',
    observation: '',
    dateRemiseFinancier: '',
    montantExec: ''
  };

  regions: string[] = [
    'TUNIS', 'ARIANA', 'BEN AROUS', 'MANOUBA',
    'SFAX', 'SOUSSE', 'KAIROUAN', 'SIDI BOUZID',
    'GAFSA', 'MEDNINE', 'BIZERTE', 'NABEUL',
    'BEJA', 'JENDOUBA', 'KEF', 'MAHDIA',
    'MONASTIR', 'TOZEUR', 'TATAOUINE'
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sortJugService: SortJugService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      console.log('📋 ID récupéré:', id);
      
      if (id && id !== 'nouveau') {
        this.isEditMode = true;
        this.id = id;
        this.loadDossier();
      } else {
        this.isEditMode = false;
        this.isLoading = false;
        this.isDataLoaded = true;
        this.cdr.detectChanges();
        console.log('📝 Mode création');
      }
    });
  }

  loadDossier() {
    this.isLoading = true;
    this.isDataLoaded = false;
    this.cdr.detectChanges();
    
    this.sortJugService.getById(Number(this.id)).subscribe({
      next: (data: any) => {
        console.log('✅ Données reçues:', data);
        
        this.ngZone.run(() => {
          if (data) {
            this.dossier = {
              numDos: data.numDos || data.num_dos || '',
              jugNum: data.jugNum || data.jug_num || '',
              region: data.region || '',
              dateSignification: data.dateSignification || data.date_signification || '',
              huissierNotaire: data.huissierNotaire || data.huissier_notaire || '',
              observation: data.observation || '',
              dateRemiseFinancier: data.dateRemiseFinancier || data.date_remise_financier || '',
              montantExec: data.montantExec || data.montant_exec || ''
            };
          } else {
            this.toastService.error('Dossier introuvable');
            this.router.navigate(['/gestion/sort-jug']);
            return;
          }
          
          this.isLoading = false;
          this.isDataLoaded = true;
          this.cdr.detectChanges();
          console.log('📝 Dossier chargé');
        });
      },
      error: (err: any) => {
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
    if (!this.dossier.numDos || !this.dossier.numDos.trim()) {
      this.toastService.error('Le numéro de dossier est obligatoire');
      return;
    }

    this.isSaving = true;
    this.cdr.detectChanges();

    const dataToSend: any = { ...this.dossier };
    
    Object.keys(dataToSend).forEach(key => {
      if (dataToSend[key] === '' || dataToSend[key] === null || dataToSend[key] === undefined) {
        dataToSend[key] = null;
      }
    });

    console.log('📤 Envoi des données:', dataToSend);

    const request = this.isEditMode && this.id != null
      ? this.sortJugService.update(Number(this.id), dataToSend)
      : this.sortJugService.create(dataToSend);

    request.subscribe({
      next: () => {
        this.toastService.success(this.isEditMode ? 'Jugement modifié avec succès' : 'Jugement créé avec succès');
        this.router.navigate(['/gestion/sort-jug']);
        this.isSaving = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('❌ Erreur:', err);
        this.toastService.error('Erreur lors de l\'enregistrement');
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }

  annuler() {
    this.router.navigate(['/gestion/sort-jug']);
  }
}