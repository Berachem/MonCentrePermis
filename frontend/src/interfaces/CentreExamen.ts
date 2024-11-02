export interface CentreExamen {
    "@id": string;
    "@type": string;
    id: number;
    libelle: string;
    adresse: string;
    latitude: string;
    longitude: string;
    ville: string; // Lien vers l'API ville
    eleves: any[]; // Adapter selon la structure des élèves si nécessaire
    createdAt: string;
    updatedAt: string;
}
