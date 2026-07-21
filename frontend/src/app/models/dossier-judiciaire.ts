// src/app/models/dossier-judiciaire.ts

export interface DossierJudiciaire {
  id?: number;
  
  // ============================================================
  // INFORMATIONS GÉNÉRALES
  // ============================================================
  numDos: string;              // N° DOS
  dateAudience: string;        // 1er AUD (date)
  tiers: string;               // TIERS
  ipp: number;                 // IPP (%)
  nbJours: number;             // NB JOURS
  reglements: string;          // RÈGLEMENTS
  natureAff: string;           // NAT AFF (CIV, CORR, PENAL, ADMIN)
  region: string;              // RÉGION
  avocat: string;              // AVOCAT

  // ============================================================
  // 1ÈRE INSTANCE
  // ============================================================
  affInstance: string;         // AFF N° (1ère instance)
  dateReportInstance: string;  // DATE REPORT (1ère instance)
  dateJugInstance: string;     // DATE JUG (1ère instance)

  // ============================================================
  // COUR D'APPEL
  // ============================================================
  affAppel: string;            // AFF N° (Cour d'appel)
  dateReportAppel: string;     // DATE REPORT (Cour d'appel)
  dateJugAppel: string;        // DATE JUG (Cour d'appel)

  // ============================================================
  // CASSATION
  // ============================================================
  affCassation: string;        // AFF N° (Cassation)
  dateJugCassation: string;    // DATE JUG (Cassation)

  // ============================================================
  // OBSERVATION
  // ============================================================
  observation: string;         // OBSERVATION

  // ============================================================
  // CHAMPS SYSTÈME
  // ============================================================
  idUtilisateur?: number;      // ID de l'utilisateur propriétaire
  dateCreation?: string;       // Date de création
  dateModification?: string;   // Date de dernière modification
}

/**
 * Fonction pour créer un dossier judiciaire vide
 */
export function dossierJudiciaireVide(): DossierJudiciaire {
  return {
    // Informations générales
    numDos: '',
    dateAudience: '',
    tiers: '',
    ipp: 0,
    nbJours: 0,
    reglements: '',
    natureAff: '',
    region: '',
    avocat: '',

    // 1ère instance
    affInstance: '',
    dateReportInstance: '',
    dateJugInstance: '',

    // Cour d'appel
    affAppel: '',
    dateReportAppel: '',
    dateJugAppel: '',

    // Cassation
    affCassation: '',
    dateJugCassation: '',

    // Observation
    observation: '',

    // Champs système
    idUtilisateur: 0,
    dateCreation: '',
    dateModification: ''
  };
}

/**
 * Liste des natures d'affaire disponibles
 */
export const NATURES_AFFAIRE = [
  'CIV',
  'CORR',
  'PENAL',
  'ADMIN'
];

/**
 * Liste des régions disponibles
 */
export const REGIONS = [
  'TUNIS',
  'ARIANA',
  'BEN AROUS',
  'MANOUBA',
  'SFAX',
  'SOUSSE',
  'KAIROUAN',
  'SIDI BOUZID',
  'GAFSA',
  'MEDNINE',
  'BIZERTE',
  'NABEUL',
  'BEJA',
  'JENDOUBA',
  'KEF',
  'MAHDIA',
  'MONASTIR',
  'TOZEUR',
  'TATAOUINE',
  'GABES',
  'GUEBELLI'
];