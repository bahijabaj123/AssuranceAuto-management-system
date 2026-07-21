// src/app/models/dossier-art18.model.ts
export interface DossierArt18 {
  id?: number;
  reference: string;  // ✅ Utiliser "reference" au lieu de "ref"
  cieAdverse: string;
  region: string;
  blesse: string;
  dateEnvoiLettInfo: string;
  secRecupInforme: string;
  date: string;
  idUtilisateur?: number;
  dateCreation?: string;
  dateModification?: string;
}

export function dossierArt18Vide(): DossierArt18 {
  return {
    reference: '',   // ✅ Utiliser "reference"
    cieAdverse: '',
    region: '',
    blesse: '',
    dateEnvoiLettInfo: '',
    secRecupInforme: 'Non',
    date: ''
  };
}