// src/app/models/dossier-judiciaire.model.ts
export interface DossierJudiciaire {
  id?: number;
  numDos: string;              // ✅ camelCase
  dateAudience: string | null;
  tiers: string;
  ipp: number | null;
  nbJours: number | null;
  reglements: string;
  natureAff: string;
  region: string;
  avocat: string;
  affInstance: string;
  dateReportInstance: string | null;
  dateJugInstance: string | null;
  affAppel: string;
  dateReportAppel: string | null;
  dateJugAppel: string | null;
  affCassation: string;
  dateJugCassation: string | null;
  observation: string;
  idUtilisateur: number;
  dateCreation?: string;
  dateModification?: string;
}

export function dossierJudiciaireVide(): DossierJudiciaire {
  return {
    numDos: '',
    dateAudience: null,
    tiers: '',
    ipp: null,
    nbJours: null,
    reglements: '',
    natureAff: '',
    region: '',
    avocat: '',
    affInstance: '',
    dateReportInstance: null,
    dateJugInstance: null,
    affAppel: '',
    dateReportAppel: null,
    dateJugAppel: null,
    affCassation: '',
    dateJugCassation: null,
    observation: '',
    idUtilisateur: 0
  };
}

export const NATURES_AFFAIRE = ['CIV', 'CORR', 'PENAL', 'ADMIN'];
export const REGIONS = ['TUNIS', 'ARIANA', 'BEN AROUS', 'MANOUBA', 'SFAX', 'SOUSSE', 'KAIROUAN', 'SIDI BOUZID', 'GAFSA', 'MEDNINE', 'BIZERTE', 'NABEUL', 'BEJA', 'JENDOUBA', 'KEF', 'MAHDIA', 'MONASTIR', 'TOZEUR', 'TATAOUINE', 'GABES', 'GUEBELLI'];
