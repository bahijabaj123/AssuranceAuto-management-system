// src/app/models/alerte.model.ts
export interface Alerte {
  id: number;
  idDossier: number;
  numDos: string;
  idUtilisateur: number;
  nomUtilisateur: string;
  nature: string;
  message: string;
  dateSignification: string;
  dateAlerte: string;
  dateEnvoi: string;
  emailEnvoye: boolean;
  notificationVue: boolean;
  dateLecture: string;
  actif: boolean;
}

export interface AlerteCount {
  count: number;
}