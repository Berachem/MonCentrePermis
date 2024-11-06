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
