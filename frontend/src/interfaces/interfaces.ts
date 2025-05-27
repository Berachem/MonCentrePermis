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
  pays: string;
  eleves: any[];
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
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
  libelle: string;
  adresse: string;
  ville: Ville | null;
  createdAt: string;
  updatedAt: string;

  distance: number | null;
}

// Interfaces pour les résultats de recherche
export interface SearchResult {
  type: 'exam_centers' | 'monitors' | 'courses' | 'circuits';
  id: number;
  label: string;
  address?: string;
  relevance: number;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
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
  genre: string;
  role: UserType;
}
