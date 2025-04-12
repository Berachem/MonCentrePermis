/**
 * Interface représentant un point dans un circuit
 */
export interface Point {
  latitude: number;
  longitude: number;
  description: string;
}

/**
 * Interface représentant un circuit d'examen
 */
export interface Circuit {
  nom: string;
  description: string;
  createur: string;
  points: Point[];
}

/**
 * Interface représentant la collection de tous les circuits par centre d'examen
 */
export interface CircuitsCollection {
  [centre: string]: Circuit[];
}
