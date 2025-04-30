import { useState, useRef, useEffect } from "react";
import { Toast } from "primereact/toast";
import "../assets/css/Home.css";
import { HomePageMap } from "../components/utils/HomePageMap";
import HomePageTopBar from "../components/utils/HomePageTopBar";
import DetailsCentreMap from "../components/utils/DetailsCentreMap";
import { CentreExamen } from "../interfaces/interfaces";
import { Button } from "primereact/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faLocation } from "@fortawesome/free-solid-svg-icons";
import useAuth from "../hooks/useAuth";
import { UserType } from "../enum/user";
import { deleteRequest, getRequest, postRequest } from "../interfaces/utils/api";

// Composant pour afficher les centres favoris
function FavoritesCentresList({
  favorites,
  onCentreClick,
  onRemoveFavorite,
}: {
  favorites: CentreExamen[];
  onCentreClick: (centre: CentreExamen) => void;
  onRemoveFavorite: (centreId: number) => void;
}) {
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
      {/* Floating button to toggle favorites panel - ombre renforcée */}
      <Button
        className="fixed bottom-5 left-5 z-[1000] rounded-full shadow-2xl flex items-center justify-center bg-white text-indigo-500 border-2 border-indigo-500 hover:bg-indigo-50 w-11 h-11 md:w-auto md:h-auto md:px-5 md:py-2"
        onClick={toggleVisibility}
        aria-expanded={isVisible}
        aria-label="Afficher les centres favoris"
      >
        <FontAwesomeIcon icon={faHeart} className="text-lg" />
        <span className="ml-2 md:block hidden">Favoris</span>
      </Button>

      {/* Favorites panel - ombre renforcée */}
      {isVisible && (
        <div
          className="fixed bottom-20 left-5 z-[1000] w-[300px] max-h-[70vh] overflow-y-auto rounded-lg bg-white shadow-2xl md:w-[300px] md:left-5 md:bottom-20"
          role="region"
          aria-label="Centres favoris"
        >
          <h3
            id="favorites-heading"
            className="text-lg font-bold text-indigo-500 border-b flex justify-between items-center p-2"
          >
            <span className="flex items-center">
              <FontAwesomeIcon icon={faHeart} className="mr-2 text-indigo-500" />
              Mes centres favoris
            </span>
            <Button
              icon="pi pi-times"
              className="p-0 w-10 h-10 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center shadow-lg"
              onClick={toggleVisibility}
              aria-label="Fermer les favoris"
            />
          </h3>
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
                  className="flex justify-between items-center p-2 hover:bg-gray-50 rounded"
                >
                  <div
                    className="flex-grow cursor-pointer text-gray-700 hover:text-indigo-500"
                    onClick={() => onCentreClick(centre)}
                    onKeyDown={(e) => handleKeyDown(e, centre)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Voir le centre ${cleanName}`}
                  >
                    {cleanName}
                  </div>

                  {/* voir */}
                  <Button
                    icon="pi pi-eye"
                    className="p-0 w-10 h-10 ml-1 rounded-full bg-white hover:bg-gray-100 text-indigo-500 flex items-center justify-center shadow-lg"
                    onClick={() => onCentreClick(centre)}
                    onKeyDown={(e) => handleKeyDown(e, centre)}
                    tabIndex={0}
                    aria-label={`Voir le centre ${cleanName}`}
                  />

                  {/* supprimer */}
                  <Button
                    icon="pi pi-times"
                    className="p-0 w-10 h-10 ml-1 rounded-full bg-white hover:bg-gray-100 text-red-500 flex items-center justify-center shadow-lg"
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
}

const Home = () => {
  const toast = useRef<Toast>(null);
  const [position, setPosition] = useState<[number, number]>([48.8566, 2.3522]);
  const [userLocated, setUserLocated] = useState(false);
  const [shouldRecenterToUser, setShouldRecenterToUser] = useState(true);
  const [shouldRecenterToCenter, setShouldRecenterToCenter] = useState(false);
  const [visible, setVisible] = useState(false);
  const [selectedCentre, setSelectedCentre] = useState<CentreExamen | null>(null);
  const [centerPosition, setCenterPosition] = useState<[number, number] | null>(null);
  const [centresData, setCentresData] = useState<CentreExamen[]>([]);
  
  // Gestion favoris
  const { isAuthenticated, userId, userRole } = useAuth();
  const [favoriteCentres, setFavoriteCentres] = useState<CentreExamen[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  //récupération de la localisation
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        setUserLocated(true);
      },
      (err) => {
        console.error("Erreur lors de la récupération de la géolocalisation", err);
      },
      { timeout: 10000 }
    );
  }, []);

  // Récupération des centres favoris si l'utilisateur est connecté
  useEffect(() => {
    const fetchFavoriteCentres = async () => {
      if (!isAuthenticated || !userId) return;
      // si on est pas moniteur, on ne peut pas avoir de favoris
      if (userRole !== UserType.Student) return;

      try {
        setLoadingFavorites(true);

        const data = await getRequest(`/eleves/${userId}/centres-examen-favoris`);
        console.log("Centres favoris récupérés:", data);

        // Vérifier si data est un tableau - si c'est un objet avec un message, utiliser un tableau vide
        if (Array.isArray(data)) {
          setFavoriteCentres(data);
        } else {
          // Si data n'est pas un tableau, initialiser avec un tableau vide
          setFavoriteCentres([]);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des centres favoris", error);
        // En cas d'erreur, initialiser avec un tableau vide
        setFavoriteCentres([]);
      }
      setLoadingFavorites(false);
    };

    fetchFavoriteCentres();
  }, [isAuthenticated, userId]);

  // Mise à jour des centres avec le statut favori
  useEffect(() => {
    if (favoriteCentres.length > 0 && centresData.length > 0) {
      // On ne met à jour que si les favoris ont changé, pas centresData lui-même
      const favoriteIds = new Set(favoriteCentres.map((centre) => centre.id));

      // Vérifier si une mise à jour est nécessaire pour éviter une boucle
      const needsUpdate = centresData.some(
        (centre) => favoriteIds.has(centre.id) !== !!centre.isFavorite
      );

      if (needsUpdate) {
        const updatedCentres = centresData.map((centre) => ({
          ...centre,
          isFavorite: favoriteIds.has(centre.id),
        }));
        setCentresData(updatedCentres);
      }
    }
  }, [favoriteCentres]);

  const handleCentresDataUpdate = (data: CentreExamen[]) => {
    setCentresData(data);
  };

  const handleMarkerClick = (centre: CentreExamen) => {
    setSelectedCentre(centre);
    setVisible(true);
    setCenterPosition([parseFloat(centre.latitude), parseFloat(centre.longitude)]);
    setShouldRecenterToCenter(true);
  };

  // Centre selectionné depuis les favoris
  const handleFavoriteCentreClick = (centre: CentreExamen) => {
    // Rechercher le centre complet dans centresData pour avoir toutes les propriétés
    const completeCentre = centresData.find((c) => c.id === centre.id);
    // Utiliser le centre complet s'il existe, sinon utiliser le centre original
    handleMarkerClick(completeCentre || centre);
  };

  // Gestion de l'ajout/suppression des favoris
  const handleToggleFavorite = async (centreId: number) => {
    if (!isAuthenticated || !userId) {
      toast.current?.show({
        severity: "info",
        summary: "Connexion requise",
        detail: "Vous devez être connecté pour ajouter des favoris",
        life: 3000,
      });
      return;
    }

    const isFavorite = favoriteCentres.some((fav) => fav.id === centreId);

    try {
      let response;

      if (isFavorite) {
        // Suppression du favori
        response = await deleteRequest(`/eleves/${userId}/centres-examen-favoris/${centreId}`);

        if (response) {
          // Mise à jour locale des favoris uniquement si la requête a réussi
          setFavoriteCentres((prev) => prev.filter((centre) => centre.id !== centreId));

          // Mise à jour du statut de favori pour le centre sélectionné si nécessaire
          if (selectedCentre && selectedCentre.id === centreId) {
            setSelectedCentre({
              ...selectedCentre,
              isFavorite: false,
            });
          }

          toast.current?.show({
            severity: "success",
            summary: "Succès",
            detail: "Centre retiré des favoris",
            life: 2000,
          });
        }
      } else {
        // Ajout aux favoris
        response = await postRequest(`/eleves/${userId}/centres-examen-favoris/${centreId}`, {});

        if (response) {
          // Mise à jour locale des favoris uniquement si la requête a réussi
          const centreToAdd = centresData.find((centre) => centre.id === centreId);
          if (centreToAdd) {
            setFavoriteCentres((prev) => [...prev, centreToAdd]);
          }

          // Mise à jour du statut de favori pour le centre sélectionné si nécessaire
          if (selectedCentre && selectedCentre.id === centreId) {
            setSelectedCentre({
              ...selectedCentre,
              isFavorite: true,
            });
          }

          toast.current?.show({
            severity: "success",
            summary: "Succès",
            detail: "Centre ajouté aux favoris",
            life: 2000,
          });
        }
      }
    } catch (error) {
      console.error("Erreur lors de la gestion des favoris", error);
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Une erreur est survenue lors de la gestion des favoris",
        life: 3000,
      });
    }
  };

  // Bouton de recentrage dans les contrôles de la carte
  const handleManualRecenter = () => {
    setShouldRecenterToUser(true);
  };

  return (
    <div className="relative w-full h-screen">
      <Toast ref={toast} />
      
      {/* Barre supérieure - maintenant directement incluse sans div supplémentaire */}
      <HomePageTopBar />
      
      {/* Carte en arrière-plan - prend maintenant toute la hauteur et largeur */}
      <div className="absolute inset-0">
        <HomePageMap 
          position={position}
          userLocated={userLocated}
          shouldRecenterToUser={shouldRecenterToUser}
          onRecenterComplete={() => setShouldRecenterToUser(false)}
          shouldRecenterToCenter={shouldRecenterToCenter}
          onRecenterToCenter={() => setShouldRecenterToCenter(false)}
          centerPosition={centerPosition}
          onMarkerClick={handleMarkerClick}
          onManualRecenter={handleManualRecenter}
          centresData={centresData}
          onCentresDataUpdate={handleCentresDataUpdate}
        />
      </div>
      
      {/* Panneau des favoris */}
      {isAuthenticated && !loadingFavorites && (
        <FavoritesCentresList
          favorites={favoriteCentres}
          onCentreClick={handleFavoriteCentreClick}
          onRemoveFavorite={handleToggleFavorite}
        />
      )}
      
      {/* Modal des détails du centre */}
      {selectedCentre && (
        <DetailsCentreMap
          visible={visible}
          onHide={() => setVisible(false)}
          centre={{
            name: selectedCentre.libelle || "Centre sans nom",
            address: selectedCentre.adresse || "Adresse inconnue",
            city: selectedCentre.ville?.libelle || "Ville inconnue",
            postalCode: selectedCentre.ville?.code_postal || "N/A",
            id: selectedCentre.id,
            isFavorite: selectedCentre.isFavorite,
          }}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
    </div>
  );
};

export default Home;
