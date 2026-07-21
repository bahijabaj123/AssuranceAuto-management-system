export interface DossierPrincipal {
  id?: number;

  numDos: string;
  premierAud: string;
  tiers: string;
  ipp: number | null;
  nbJours: number | null;
  reglements: string;
  natAff: string;
  region: string;
  avocat: string;

  instance1AffN: string;
  instance1DateReport: string;
  instance1DateJug: string;

  appelAffN: string;
  appelDateReport: string;
  appelDateJug: string;

  cassationAffN: string;
  cassationDateJug: string;

  observation: string;
}

export function dossierPrincipalVide(): DossierPrincipal {
  return {
    numDos: '', premierAud: '', tiers: '', ipp: null, nbJours: null,
    reglements: '', natAff: 'CIV', region: '', avocat: '',
    instance1AffN: '', instance1DateReport: '', instance1DateJug: '',
    appelAffN: '', appelDateReport: '', appelDateJug: '',
    cassationAffN: '', cassationDateJug: '',
    observation: ''
  };
}
