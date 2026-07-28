import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DonneesSinistreService } from '../../../../services/donnees-sinistre.service';
import { ToastService } from '../../../../services/toast.service';
import { DonneesSinistre, donneesSinistreVide } from '../../../../models/donnees-sinistre.model';

@Component({
  selector: 'app-formulaire-sinistre',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './formulaire-sinistre.component.html',
  styleUrls: ['./formulaire-sinistre.component.css']
})
export class FormulaireSinistreComponent implements OnInit {

  sinistre: DonneesSinistre = donneesSinistreVide();
  isEditMode = false;
  isSaving = false;
  isLoading = true;
  sinistreId: number | null = null;

  annees: number[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sinistreService: DonneesSinistreService,
    private toastService: ToastService
  ) {
    for (let i = 2000; i <= 2030; i++) {
      this.annees.push(i);
    }
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      
      if (idParam && idParam !== 'nouveau') {
        this.sinistreId = +idParam;
        this.isEditMode = true;
        this.chargerSinistre(this.sinistreId);
      } else {
        this.isEditMode = false;
        this.isLoading = false;
        this.sinistre = donneesSinistreVide();
        this.sinistre.annee = new Date().getFullYear();
        console.log('📝 Mode création');
      }
    });
  }

  chargerSinistre(id: number) {
    this.isLoading = true;
    
    this.sinistreService.getById(id).subscribe({
      next: (data) => {
        console.log('✅ Données reçues:', data);
        this.sinistre = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.toastService.error('❌ Erreur lors du chargement du sinistre', 4000);
        this.isLoading = false;
        this.router.navigate(['/sinistres']);
      }
    });
  }

  enregistrer() {
    // ✅ Validation
    if (!this.sinistre.sin || !this.sinistre.sin.trim()) {
      this.toastService.warning('⚠️ Le numéro SIN est obligatoire', 3000);
      return;
    }

    if (!this.sinistre.annee) {
      this.toastService.warning('⚠️ L\'année est obligatoire', 3000);
      return;
    }

    // ✅ Nettoyer les données
    const dataToSend: any = { ...this.sinistre };
    Object.keys(dataToSend).forEach(key => {
      if (dataToSend[key] === '' || dataToSend[key] === null || dataToSend[key] === undefined) {
        dataToSend[key] = null;
      }
    });

    console.log('📤 Envoi au backend:', JSON.stringify(dataToSend));
    this.isSaving = true;

    const action = this.isEditMode && this.sinistreId
      ? this.sinistreService.update(this.sinistreId, dataToSend)
      : this.sinistreService.create(dataToSend);

    action.subscribe({
      next: (response) => {
        console.log('✅ Succès:', response);
        this.toastService.success(
          this.isEditMode ? '✅ Sinistre mis à jour avec succès' : '✅ Sinistre créé avec succès',
          3000
        );
        this.isSaving = false;
        this.router.navigate(['/sinistres']);
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.toastService.error('❌ Erreur lors de l\'enregistrement', 4000);
        this.isSaving = false;
      }
    });
  }

  annuler() {
    this.router.navigate(['/sinistres']);
  }
}