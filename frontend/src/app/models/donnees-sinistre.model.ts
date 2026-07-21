// src/app/models/donnees-sinistre.model.ts
export interface DonneesSinistre {
  id?: number;
  sin: string;
  nomTiers: string | null;
  annee: number;
  ipp: string;
  nbrJrs: string;
  rcc: number | null;
  rcm: number | null;
  dommagesVehicules: number | null;
  brisGlaces: number | null;
  domCollision: number | null;
  dommage: number | null;
  vol: number | null;
  inc: number | null;
  afp: number | null;
  aux: number | null;
  regRcc: number | null;
  regRcm: number | null;
  regDommagesVehicules: number | null;
  regBrisGlaces: number | null;
  regDomCollision: number | null;
  regDommage: number | null;
  regVol: number | null;
  regInc: number | null;
  regAfp: number | null;
  regAux: number | null;
  dateCreation: string;
  dateModification: string;
}

export interface FiltresSinistres {
  sin: string;
  annee: number | null;
  ipp: string;
  nbrJrsMin: number | null;
  nbrJrsMax: number | null;
}

export function donneesSinistreVide(): DonneesSinistre {
  return {
    sin: '',
    nomTiers: null,
    annee: new Date().getFullYear(),
    ipp: '',
    nbrJrs: '',
    rcc: null,
    rcm: null,
    dommagesVehicules: null,
    brisGlaces: null,
    domCollision: null,
    dommage: null,
    vol: null,
    inc: null,
    afp: null,
    aux: null,
    regRcc: null,
    regRcm: null,
    regDommagesVehicules: null,
    regBrisGlaces: null,
    regDomCollision: null,
    regDommage: null,
    regVol: null,
    regInc: null,
    regAfp: null,
    regAux: null,
    dateCreation: new Date().toISOString(),  // ✅ AJOUTER
    dateModification: new Date().toISOString()  // ✅ AJOUTER
  };
}