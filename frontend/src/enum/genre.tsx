export enum Genre {
    homme = "H",
    femme = "F",
    autre = "A",
}

export const GenreLabels: Record<Genre, string> = {
    [Genre.homme]: "Homme",
    [Genre.femme]: "Femme",
    [Genre.autre]: "Autre",
};
