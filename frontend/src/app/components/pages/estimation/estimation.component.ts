import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LesionService } from '../../../services/lesion';
import { Lesion } from '../../../models/lesion';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http'; 
@Component({
  selector: 'app-estimation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule , HttpClientModule],
  templateUrl: './estimation.component.html',
  styleUrls: ['./estimation.component.css']
})
export class EstimationComponent implements OnInit {
  formulaire!: FormGroup;
  lesionsDisponibles: Lesion[] = [];
  selectedCodes: string[] = [];
  searchFilter: string = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private lesionService: LesionService
  ) {}

  ngOnInit() {
    this.lesionService.getLesions().subscribe(lesions => {
    this.lesionsDisponibles = lesions;
});

    this.formulaire = this.fb.group({
      numDossier: [''],
      nbJours: ['', [Validators.required, Validators.min(1), Validators.max(365)]]
    });
  }

  get filteredLesions(): Lesion[] {
    if (!this.searchFilter.trim()) return this.lesionsDisponibles;
    const filter = this.searchFilter.toLowerCase();
    return this.lesionsDisponibles.filter(l =>
      l.libelle.toLowerCase().includes(filter) ||
      l.code.toLowerCase().includes(filter)
    );
  }

  isSelected(code: string): boolean {
    return this.selectedCodes.includes(code);
  }

  toggleLesion(code: string) {
    const index = this.selectedCodes.indexOf(code);
    if (index > -1) {
      this.selectedCodes.splice(index, 1);
    } else {
      this.selectedCodes.push(code);
    }
  }

  removeLesion(code: string) {
    this.toggleLesion(code);
  }

  onSubmit() {
    if (this.formulaire.invalid) {
      this.formulaire.get('nbJours')?.markAsTouched();
      return;
    }
    if (this.selectedCodes.length === 0) {
      alert('Veuillez sélectionner au moins une lésion.');
      return;
    }

    this.isLoading = true;
    const nbJours = this.formulaire.value.nbJours;
    const codes = this.selectedCodes;

    // Navigation vers la page de résultat
    this.router.navigate(['/resultat'], {
      queryParams: {
        nbJours: nbJours,
        codes: codes.join(',')
      }
    });
  }
}
