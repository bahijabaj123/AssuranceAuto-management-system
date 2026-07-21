// src/app/models/auth.model.ts

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  id: number;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  dateCreation?: string;
}

export interface ResetPasswordRequest {
  email: string;
  nouveauMotDePasse: string;
}

export interface Utilisateur {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  password?: string;
  role: string;
  dateCreation?: string;
  actif?: boolean;
}