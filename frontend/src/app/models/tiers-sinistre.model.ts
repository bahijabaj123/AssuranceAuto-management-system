export interface TiersSinistre {
  id: number;
  sin: string;
  nomTiers: string;
  ipp: number;
  nbrJrs: number;
  reglements: number;
  dateCreation?: string;
  dateModification?: string;
}

export interface TiersSinistreCount {
  count: number;
}