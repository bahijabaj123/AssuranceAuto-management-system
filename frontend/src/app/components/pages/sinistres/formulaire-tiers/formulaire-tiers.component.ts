import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TiersSinistreService } from '../../../../services/tiers-sinistre.service';
import { ToastService } from '../../../../services/toast.service';
import { TiersSinistre } from '../../../../models/tiers-sinistre.model';

@Component({
  selector: 'app-formulaire-tiers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formulaire-tiers.component.html',
  styleUrls: ['./formulaire-tiers.component.css']
})
export class FormulaireTiersComponent implements OnInit {
  @Input() sin: string = '';
  @Input() tiers: TiersSinistre | null = null;
  @Output() saved = new EventEmitter<TiersSinistre>();
  @Output() cancelled = new EventEmitter<void>();

  isEditing: boolean = false;
  isLoading: boolean = false;
  formData: TiersSinistre = {
    id: 0,
    sin: '',
    nomTiers: '',
    ipp: 0,
    nbrJrs: 0,
    reglements: 0
  };

  constructor(
    private tiersService: TiersSinistreService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    if (this.tiers) {
      this.isEditing = true;
      this.formData = { ...this.tiers };
    }
    this.formData.sin = this.sin;
  }

  onSubmit() {
    if (!this.formData.nomTiers || this.formData.nomTiers.trim() === '') {
      this.toastService.warning('⚠️ Le nom du tiers est obligatoire', 3000);
      return;
    }

    this.isLoading = true;
    this.formData.sin = this.sin;

    if (this.isEditing && this.formData.id) {
      // Mise à jour
      this.tiersService.updateTiers(this.formData.id, this.formData).subscribe({
        next: (data) => {
          this.toastService.success('✅ Tiers mis à jour avec succès', 3000);
          this.saved.emit(data);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('❌ Erreur:', err);
          this.toastService.error('❌ Erreur lors de la mise à jour', 4000);
          this.isLoading = false;
        }
      });
    } else {
      // Création
      this.tiersService.createTiers(this.formData).subscribe({
        next: (data) => {
          this.toastService.success('✅ Tiers ajouté avec succès', 3000);
          this.saved.emit(data);
          this.isLoading = false;
          this.resetForm();
        },
        error: (err) => {
          console.error('❌ Erreur:', err);
          this.toastService.error('❌ Erreur lors de l\'ajout', 4000);
          this.isLoading = false;
        }
      });
    }
  }

  resetForm() {
    this.formData = {
      id: 0,
      sin: this.sin,
      nomTiers: '',
      ipp: 0,
      nbrJrs: 0,
      reglements: 0
    };
    this.isEditing = false;
  }

  onCancel() {
    this.cancelled.emit();
  }
  
}
