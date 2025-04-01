import { UserType } from "../enum/user";

export interface CentreExamen {
    "@id": string | null;
    "@type": string | null;
    id: number;
    libelle: string;
    adresse: string;
    latitude: string;
    longitude: string;
    ville: Ville; 
    eleves: any[]; 
    createdAt: string;
    updatedAt: string;
}

export interface Ville {
    "@id": string | null;
    "@type": string | null;
    id: number;
    code: string;
    libelle: string;
    region: string;
    departement: string;
    latitude: string;
    longitude: string;
    code_postal: string;
    createdAt: string;
    updatedAt: string;
}

export interface AutoEcole {
    id: number;
    numero_agrement: string;
    libelle : string;
    adresse: string;
    ville: Ville | null;
    createdAt: string; 
    updatedAt: string; 

    distance: number | null;
  }

export interface ApiResponse {
    token?: string; // Le token peut être présent ou non
    message?: string;
    errors?: string;
  }

export interface User {
  // Informations du User en cours, seulement pour les users authentifier !
  firstName: string;
  lastName: string;
  email: string;
  role: UserType;
  
}