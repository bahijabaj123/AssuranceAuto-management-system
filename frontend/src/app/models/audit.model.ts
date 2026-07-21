// src/app/models/audit.model.ts
export interface Audit {
  id: number;
  idDossier: number;
  idUtilisateur: number;
  nomUtilisateur: string;
  numDos: string;
  action: string;
  anciennesValeurs: string;
  nouvellesValeurs: string;
  dateAction: string;
  ipAdresse: string;
}

export interface AuditDTO {
  id: number;
  idDossier: number;
  idUtilisateur: number;
  nomUtilisateur: string;
  numDos: string;
  action: string;
  actionLabel: string;
  actionColor: string;
  anciennesValeurs: string;
  nouvellesValeurs: string;
  dateAction: string;
  ipAdresse: string;
}