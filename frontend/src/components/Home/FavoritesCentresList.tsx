import { useState } from "react";
import { Button } from "primereact/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { CentreExamen } from "../../interfaces/interfaces";

interface FavoritesCentresListProps {
  favorites: CentreExamen[];
  onCentreClick: (centre: CentreExamen) => void;
  onRemoveFavorite: (centreId: number) => void;
}

const FavoritesCentresList = ({
  favorites,
  onCentreClick,
  onRemoveFavorite,
}: FavoritesCentresListProps) => {
  const [isVisible, setIsVisible] = useState(false);

  if (!favorites || favorites.length === 0) {
    return null;
  }

  // Gestion de la navigation par clavier dans la liste des favoris
  const handleKeyDown = (event: React.KeyboardEvent, centre: CentreExamen) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onCentreClick(centre);
    }
  };

  const handleRemoveKeyDown = (event: React.KeyboardEvent, centreId: number) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onRemoveFavorite(centreId);
    }
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <>
      {/* Bouton flottant pour afficher/masquer le panneau des favoris */}
      <Button
        className="fixed bottom-4 right-20 z-[1000] rounded-full shadow-2xl flex items-center justify-center bg-green-800 text-white border-none hover:bg-green-700 w-2 h-11"
        onClick={toggleVisibility}
        aria-expanded={isVisible}
        aria-label="Afficher les centres favoris"
      >
        <FontAwesomeIcon icon={faHeart} className="text-lg" />
        <span className="ml-2 hidden md:inline">Favoris</span>
      </Button>

      {/* Panneau des favoris */}
      {isVisible && (
        <div
          className="fixed bottom-4 right-20 z-[1000] w-[300px] max-h-[70vh] overflow-y-auto rounded-lg bg-white shadow-2xl md:w-[300px] "
          role="region"
          aria-label="Centres favoris"
        >
          {/* En-tête du panneau */}
          <div
            id="favorites-heading"
            className="bg-green-800 text-white font-bold border-b border-green-700 flex justify-between items-center p-3 rounded-t-lg"
          >
            <span className="flex items-center">
              <FontAwesomeIcon icon={faHeart} className="mr-2" />
              Mes centres favoris
            </span>
            <Button
              icon="pi pi-times"
              className="p-0 w-8 h-8 rounded-full bg-green-700 hover:bg-green-600 flex items-center justify-center shadow-md text-white border-none"
              onClick={toggleVisibility}
              aria-label="Fermer les favoris"
            />
          </div>
          
          {/* Liste des favoris */}
          <ul
            className="p-2"
            aria-labelledby="favorites-heading"
          >
            {favorites.map((centre) => {
              // Nettoyer le nom du centre en enlevant "Centre d'examen de"
              const cleanName = centre.libelle
                ? centre.libelle.replace(/Centre d['']examen de/i, "").trim()
                : "Centre sans nom";

              return (
                <li
                  key={centre.id}
                  className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg border-b border-gray-100 last:border-b-0"
                >
                  <div
                    className="flex-grow cursor-pointer text-gray-700 hover:text-green-800 transition-colors"
                    onClick={() => onCentreClick(centre)}
                    onKeyDown={(e) => handleKeyDown(e, centre)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Voir le centre ${cleanName}`}
                  >
                    {cleanName}
                  </div>

                  {/* Bouton voir */}
                  <Button
                    icon="pi pi-eye"
                    className="p-0 w-9 h-9 ml-1 rounded-full bg-white hover:bg-gray-100 text-green-800 flex items-center justify-center shadow-md border border-gray-200"
                    onClick={() => onCentreClick(centre)}
                    onKeyDown={(e) => handleKeyDown(e, centre)}
                    tabIndex={0}
                    aria-label={`Voir le centre ${cleanName}`}
                  />

                  {/* Bouton supprimer */}
                  <Button
                    icon="pi pi-times"
                    className="p-0 w-9 h-9 ml-1 rounded-full bg-white hover:bg-gray-100 text-red-500 flex items-center justify-center shadow-md border border-gray-200"
                    onClick={() => onRemoveFavorite(centre.id)}
                    onKeyDown={(e) => handleRemoveKeyDown(e, centre.id)}
                    tabIndex={0}
                    aria-label={`Retirer ${cleanName} des favoris`}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
};

export default FavoritesCentresList;
