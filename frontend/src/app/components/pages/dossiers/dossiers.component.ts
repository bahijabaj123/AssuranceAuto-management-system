import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DossierService } from '../../../services/dossier.service';
import { Dossier } from '../../../models/dossier.model';
import { ToastService } from '../../../services/toast.service';
import { ExportService } from '../../../services/export.service';

@Component({
  selector: 'app-dossiers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dossiers.component.html',
  styleUrls: ['./dossiers.component.css']
})
export class DossiersComponent implements OnInit {

  allDossiers: Dossier[] = [];
  filteredDossiers: Dossier[] = [];
  paginatedDossiers: Dossier[] = [];

  filtreActif: string | null = null;

  filters = {
    search: '',
    statut: '',
    lesion: '',
    tauxMin: null as number | null,
    tauxMax: null as number | null,
    dateDebut: '',
    dateFin: '',
    mois: '',
    moisNum: ''  // ← Pour filtrer par mois numérique (ex: "03")
  };

  statutOptions = ['Clôturé', 'En cours', 'Expertise', 'En attente'];
  lesionOptions: string[] = [];

  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  isLoading = true;

  private dataLoaded = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dossierService: DossierService,
    private toastService: ToastService,
    private exportService: ExportService
  ) {}

  ngOnInit() {
    this.loadDossiers();

    this.route.queryParams.subscribe(params => {
      this.lireQueryParams(params);
      if (this.dataLoaded) {
        this.applyFilters();
      }
    });
  }

  loadDossiers() {
    this.isLoading = true;
    this.dossierService.getAllDossiers().subscribe({
      next: (dossiers) => {
        this.allDossiers = dossiers;
        this.dataLoaded = true;

        const lesionSet = new Set<string>();
        dossiers.forEach(d => d.codeLesions.forEach(l => lesionSet.add(l)));
        this.lesionOptions = Array.from(lesionSet).sort();

        this.lireQueryParams(this.route.snapshot.queryParams);
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.toastService.error('Erreur lors du chargement des dossiers');
        this.isLoading = false;
      }
    });
  }

  lireQueryParams(params: any) {
    const labels: string[] = [];

    this.filters.statut = '';
    this.filters.lesion = '';
    this.filters.tauxMin = null;
    this.filters.tauxMax = null;
    this.filters.dateDebut = '';
    this.filters.dateFin = '';
    this.filters.mois = '';
    this.filters.moisNum = '';

    if (params['statut']) {
      this.filters.statut = params['statut'];
      labels.push(`Statut : ${params['statut']}`);
    }

    if (params['lesion']) {
      this.filters.lesion = params['lesion'];
      labels.push(`Lésion : ${this.getLesionLabel(params['lesion'])}`);
    }

    if (params['tauxMin'] !== undefined && params['tauxMax'] !== undefined) {
      this.filters.tauxMin = parseFloat(params['tauxMin']);
      this.filters.tauxMax = parseFloat(params['tauxMax']);
      labels.push(`IPP : ${params['tauxMin']}% – ${params['tauxMax']}%`);
    }

    // ✅ Filtre mois (depuis le dashboard)
    if (params['mois']) {
      this.filters.mois = params['mois'];
      labels.push(`Mois : ${params['mois']}`);
    }
    if (params['moisNum']) {
      this.filters.moisNum = params['moisNum'];
    }

    if (params['search']) {
      this.filters.search = params['search'];
      labels.push(`Recherche : "${params['search']}"`);
    }

    this.filtreActif = labels.length > 0 ? labels.join(' · ') : null;
  }

  applyFilters() {
    let result = [...this.allDossiers];

    if (this.filters.search.trim()) {
      const s = this.filters.search.trim().toLowerCase();
      result = result.filter(d => d.numero.toLowerCase().includes(s));
    }

    if (this.filters.statut && this.filters.statut !== 'Tous') {
      result = result.filter(d => d.statut === this.filters.statut);
    }

    if (this.filters.lesion) {
      result = result.filter(d => d.codeLesions.includes(this.filters.lesion));
    }

    if (this.filters.tauxMin !== null) {
      result = result.filter(d => d.tauxIpp >= (this.filters.tauxMin as number));
    }

    if (this.filters.tauxMax !== null) {
      result = result.filter(d => d.tauxIpp <= (this.filters.tauxMax as number));
    }

    if (this.filters.dateDebut) {
      result = result.filter(d => d.dateCreation && d.dateCreation >= this.filters.dateDebut);
    }

    if (this.filters.dateFin) {
      result = result.filter(d => d.dateCreation && d.dateCreation <= this.filters.dateFin);
    }

    // ✅ Filtre par mois (numérique)
    if (this.filters.moisNum) {
      result = result.filter(d => {
        if (!d.dateCreation) return false;
        const moisDossier = d.dateCreation.substring(5, 7);
        return moisDossier === this.filters.moisNum;
      });
    } else if (this.filters.mois) {
      // Fallback si seulement le nom du mois est passé
      const moisMap: { [key: string]: string } = {
        'Jan': '01', 'Fév': '02', 'Mar': '03', 'Avr': '04',
        'Mai': '05', 'Juin': '06', 'Juil': '07', 'Aoû': '08',
        'Sep': '09', 'Oct': '10', 'Nov': '11', 'Déc': '12'
      };
      const numMois = moisMap[this.filters.mois];
      if (numMois) {
        result = result.filter(d => {
          if (!d.dateCreation) return false;
          const moisDossier = d.dateCreation.substring(5, 7);
          return moisDossier === numMois;
        });
      }
    }

    this.filteredDossiers = result;
    this.currentPage = 1;
    this.totalPages = Math.ceil(result.length / this.itemsPerPage) || 1;
    this.updatePagination();
  }

  updatePagination() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedDossiers = this.filteredDossiers.slice(start, start + this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  resetFilters() {
    this.filters = {
      search: '', statut: '', lesion: '',
      tauxMin: null, tauxMax: null,
      dateDebut: '', dateFin: '',
      mois: '', moisNum: ''
    };
    this.filtreActif = null;
    this.applyFilters();
    this.router.navigate(['/dossiers'], { queryParams: {} });
  }

  getLesionLabel(code: string): string {
    const labels: { [key: string]: string } = {
      'L01': 'Fracture fémur', 'L02': 'Fracture tibia/péroné',
      'L03': 'Fracture rotule', 'L04': 'Fracture bassin',
      'L05': 'Fracture vertèbre cervicale', 'L06': 'Fracture vertèbre lombaire',
      'L07': 'Fracture côtes', 'L08': 'Fracture clavicule',
      'L09': 'Fracture humérus', 'L10': 'Fracture radius/cubitus',
      'L11': 'Fracture poignet/main', 'L12': 'Fracture pied/cheville',
      'L13': 'Entorse cervicale', 'L14': 'Entorse genou',
      'L15': 'Entorse cheville', 'L16': 'Traumatisme crânien léger',
      'L17': 'Traumatisme crânien grave', 'L18': 'Lésion médullaire',
      'L19': 'Rupture ligament croisé', 'L20': 'Luxation épaule',
      'L21': 'Luxation hanche', 'L22': 'Plaie profonde',
      'L23': 'Brûlure', 'L24': 'Lésion nerveuse',
      'L25': 'Contusion thoracique'
    };
    return labels[code] || code;
  }

  getStatutClass(statut: string): string {
    const classes: { [key: string]: string } = {
      'Clôturé': 'statut-cloture',
      'En cours': 'statut-encours',
      'Expertise': 'statut-expertise',
      'En attente': 'statut-attente'
    };
    return classes[statut] || 'statut-default';
  }

  goToDossierDetail(id: string) {
    this.router.navigate(['/dossier', id]);
  }

  exporterExcel() {
    this.exportService.exporterDossiersExcel(this.filteredDossiers, 'Dossiers_sinistres');
  }
}