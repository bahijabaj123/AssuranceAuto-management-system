// src/app/models/utilisateur.model.ts
export interface Utilisateur {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  actif: boolean;
  dateCreation: string;
  dateModification: string;
  derniereConnexion: string;
}