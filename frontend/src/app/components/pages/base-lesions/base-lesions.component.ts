import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LesionService } from '../../../services/lesion';
import { Lesion } from '../../../models/lesion';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-base-lesions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './base-lesions.component.html',
  styleUrls: ['./base-lesions.component.css']
})
export class BaseLesionsComponent implements OnInit {
  lesions: Lesion[] = [];
  filteredLesions: Lesion[] = [];
  searchFilter: string = '';
  isLoading = true;
  saveMessage: string = '';
  messageType: 'success' | 'error' = 'success';
  
  newLesion: Lesion = { code: '', libelle: '' };
  showAddForm = false;
  
  editingIndex: number | null = null;
  editLesion: Lesion = { code: '', libelle: '' };

  constructor(
    private lesionService: LesionService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadLesions();
  }

  loadLesions() {
    this.isLoading = true;
    this.lesionService.getLesions().subscribe({
      next: (lesions) => {
        this.lesions = lesions;
        this.filteredLesions = lesions;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.toastService.error('Erreur lors du chargement des lésions');
      }
    });
  }

  applyFilter() {
    if (!this.searchFilter.trim()) {
      this.filteredLesions = this.lesions;
      return;
    }
    const filter = this.searchFilter.toLowerCase();
    this.filteredLesions = this.lesions.filter(l =>
      l.code.toLowerCase().includes(filter) ||
      l.libelle.toLowerCase().includes(filter)
    );
  }

  showMessage(msg: string, type: 'success' | 'error' = 'success') {
    this.saveMessage = msg;
    this.messageType = type;
    setTimeout(() => {
      this.saveMessage = '';
    }, 3000);
  }

  // ✅ AJOUTER LA MÉTHODE
  ajouterLesion() {
    if (!this.newLesion.code || !this.newLesion.libelle) {
      this.toastService.error('Veuillez remplir tous les champs');
      return;
    }

    this.lesionService.ajouterLesion({ ...this.newLesion }).subscribe({
      next: () => {
        this.toastService.success(`Lésion ${this.newLesion.code} ajoutée avec succès !`);
        this.newLesion = { code: '', libelle: '' };
        this.showAddForm = false;
        this.loadLesions();
      },
      error: () => {
        this.toastService.error(`Erreur lors de l'ajout de la lésion`);
      }
    });
  }

  // ✅ AJOUTER LA MÉTHODE
  modifierLesion(index: number) {
    const oldCode = this.filteredLesions[index].code;
    this.lesionService.modifierLesion(oldCode, { ...this.editLesion }).subscribe({
      next: () => {
        this.toastService.success(`Lésion ${this.editLesion.code} modifiée avec succès !`);
        this.editingIndex = null;
        this.editLesion = { code: '', libelle: '' };
        this.loadLesions();
      },
      error: () => {
        this.toastService.error(`Erreur lors de la modification de la lésion`);
      }
    });
  }

  // ✅ AJOUTER LA MÉTHODE
  supprimerLesion(index: number) {
    const code = this.filteredLesions[index].code;
    if (!confirm(`Supprimer la lésion ${code} ?`)) return;
    
    this.lesionService.supprimerLesion(code).subscribe({
      next: () => {
        this.toastService.success(`Lésion ${code} supprimée avec succès !`);
        this.loadLesions();
      },
      error: () => {
        this.toastService.error(`Erreur lors de la suppression de la lésion`);
      }
    });
  }

  commencerEdition(index: number) {
    this.editingIndex = index;
    this.editLesion = { ...this.filteredLesions[index] };
  }

  annulerEdition() {
    this.editingIndex = null;
    this.editLesion = { code: '', libelle: '' };
  }

  sauvegarderEdition(index: number) {
    this.modifierLesion(index);
  }
}