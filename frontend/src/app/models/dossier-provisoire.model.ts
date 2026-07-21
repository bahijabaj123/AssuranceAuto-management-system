// src/app/models/dossier-provisoire.model.ts
export interface DossierProvisoire {
  id?: number;
  numProv: string;
  affaire: string;
  nature: string;
  tiers: string;
  date: string; // LocalDate en Java -> string en Angular
  regionTrib: string;
  avocat: string;
  numSinistre: string;
  observation: string;
  idUtilisateur?: number;
  dateCreation?: string;
  dateModification?: string;
}

export function dossierProvisoireVide(): DossierProvisoire {
  return {
    numProv: '',
    affaire: '',
    nature: '',
    tiers: '',
    date: '',
    regionTrib: '',
    avocat: '',
    numSinistre: '',
    observation: ''
  };
}