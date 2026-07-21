import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TiersSinistreService } from '../../../../services/tiers-sinistre.service';
import { ToastService } from '../../../../services/toast.service';
import { TiersSinistre } from '../../../../models/tiers-sinistre.model';

@Component({
  selector: 'app-liste-tiers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './liste-tiers.component.html',
  styleUrls: ['./liste-tiers.component.css']
})
export class ListeTiersComponent implements OnInit {
  @Input() sin: string = '';
  @Output() edit = new EventEmitter<TiersSinistre>();
  @Output() refresh = new EventEmitter<void>();

  tiers: TiersSinistre[] = [];
  isLoading: boolean = true;
  totalIPP: number = 0;
  totalReglements: number = 0;
  moyenneIPP: number = 0;

  constructor(
    private tiersService: TiersSinistreService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    if (this.sin) {
      this.chargerTiers();
    }
  }

  chargerTiers() {
    this.isLoading = true;
    this.tiersService.getTiersBySin(this.sin).subscribe({
      next: (data) => {
        this.tiers = data;
        this.calculerTotaux();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.toastService.error('❌ Erreur lors du chargement des tiers', 4000);
        this.isLoading = false;
      }
    });
  }

  calculerTotaux() {
    this.totalIPP = this.tiers.reduce((sum, t) => sum + (t.ipp || 0), 0);
    this.totalReglements = this.tiers.reduce((sum, t) => sum + (t.reglements || 0), 0);
    const avecIPP = this.tiers.filter(t => t.ipp > 0);
    this.moyenneIPP = avecIPP.length > 0 
      ? this.totalIPP / avecIPP.length 
      : 0;
  }

  onEdit(tiers: TiersSinistre) {
    this.edit.emit(tiers);
  }

  onDelete(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce tiers ?')) {
      this.tiersService.deleteTiers(id).subscribe({
        next: () => {
          this.toastService.success('✅ Tiers supprimé avec succès', 3000);
          this.chargerTiers();
          this.refresh.emit();
        },
        error: (err) => {
          console.error('❌ Erreur:', err);
          this.toastService.error('❌ Erreur lors de la suppression', 4000);
        }
      });
    }
  }

  formatNumber(value: number): string {
    return value ? value.toFixed(2) : '0.00';
  }
}