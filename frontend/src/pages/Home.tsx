import { useState, useRef, useEffect } from "react";
import { Toast } from "primereact/toast";
import { HomePageMap } from "../components/Home/HomePageMap";
import DetailsCentreMap from "../components/Home/DetailsCentreMap";
import { CentreExamen } from "../interfaces/interfaces";
import useAuth from "../hooks/useAuth";
import { UserType } from "../enum/user";
import { deleteRequest, getRequest, postRequest } from "../interfaces/api";
import SearchBar from "../components/Home/SearchBar";
import SideBarCustom from '../components/Home/SideBarCustom';
import FavoritesCentresList from "../components/Home/FavoritesCentresList";

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
      
      {/* Barre de recherche positionnée en haut */}
      <SearchBar />
      
      {/* Menu latéral - now handles its own profile modal */}
      <SideBarCustom />
      
      {/* Carte en arrière-plan - prend toute la hauteur et largeur */}
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
      
      {/* Panneau des favoris */}
      {isAuthenticated && !loadingFavorites && favoriteCentres.length > 0 && (
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
