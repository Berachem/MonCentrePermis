import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "../../assets/css/home-map.css";
import DetailsCentreMap from "./DetailsCentreMap";
import { CentreExamen } from "../../interfaces/interfaces"; // Interface mise à jour
import { deleteRequest, getRequest, postRequest } from "../../interfaces/utils/api";
import { Toast } from "primereact/toast";
import Loader from "./Loader";
import HomePageTopBar from "./HomePageTopBar";
import { Button } from "primereact/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocation } from "@fortawesome/free-solid-svg-icons";
import useAuth from "../../hooks/useAuth";

/* Icones */
const examCenterIconFrance = new L.Icon({
  iconUrl: "https://i.postimg.cc/FFJWRnMS/point-map.png",
  iconSize: [30, 31],
  iconAnchor: [15, 31],
  popupAnchor: [1, -34],
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  shadowSize: [31, 31],
});

const examCenterIconUK = new L.Icon({
  iconUrl: "https://i.postimg.cc/v8fyVYvk/output-onlinepngtools-2.png",
  iconSize: [30, 31],
  iconAnchor: [15, 31],
  popupAnchor: [1, -34],
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  shadowSize: [31, 31],
});

const userIcon = new L.Icon({
  iconUrl: "https://i.ibb.co/H7ntmhd/abd-laurent.png",
  iconSize: [40, 60],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  shadowSize: [41, 41],
});

// Composant pour afficher les centres favoris
function FavoritesCentresList({ 
  favorites, 
  onCentreClick,
  onRemoveFavorite
}: { 
  favorites: CentreExamen[],
  onCentreClick: (centre: CentreExamen) => void,
  onRemoveFavorite: (centreId: number) => void
}) {
  if (!favorites || favorites.length === 0) {
    return null;
  }

  // Gestion de la navigation par clavier dans la liste des favoris
  const handleKeyDown = (event: React.KeyboardEvent, centre: CentreExamen) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onCentreClick(centre);
    }
  };

  const handleRemoveKeyDown = (event: React.KeyboardEvent, centreId: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onRemoveFavorite(centreId);
    }
  };

  return (
    <div className="favorites-panel" role="region" aria-label="Centres favoris">
      <h3 id="favorites-heading">Mes centres favoris</h3>
      <ul className="favorites-list" aria-labelledby="favorites-heading">
        {favorites.map((centre) => (
          <li key={centre.id} className="favorite-item">
            <div 
              className="favorite-name"
              onClick={() => onCentreClick(centre)}
              onKeyDown={(e) => handleKeyDown(e, centre)}
              tabIndex={0}
              role="button"
              aria-label={`Voir le centre ${centre.libelle}`}
            >
              {centre.libelle}
            </div>
            <button
              className="remove-favorite"
              onClick={() => onRemoveFavorite(centre.id)}
              onKeyDown={(e) => handleRemoveKeyDown(e, centre.id)}
              title="Retirer des favoris"
              aria-label={`Retirer ${centre.libelle} des favoris`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Nouveau composant de contrôles de la carte
export function MapControls({ userPos }: { userPos: [number, number] }) {
  const map = useMap();

  const handleRecenter = () => {
    map.setView(userPos, map.getZoom());
  };

  const handleZoomIn = () => {
    map.zoomIn();
  };

  const handleZoomOut = () => {
    map.zoomOut();
  };

  return (
    <div className="map-controls">
      <Button
        onClick={handleRecenter}
        className="p-button-rounded justify-content-center w-9 h-9"
      >
        <FontAwesomeIcon icon={faLocation} className="text-2xl" />
      </Button>
      <Button
        icon="pi pi-plus"
        onClick={handleZoomIn}
        className="p-button-rounded "
      />
      <Button
        icon="pi pi-minus"
        onClick={handleZoomOut}
        className="p-button-rounded "
      />
    </div>
  );
}

export function HomePageMap() {
  const toast = useRef<Toast>(null);
  const markerRef = useRef(null);
  const fetchedRef = useRef(false); // Utiliser useRef au lieu de useState pour ne pas déclencher de re-render

  const [position, setPosition] = useState<[number, number]>([48.8566, 2.3522]);
  const [userLocated, setUserLocated] = useState(false);
  const [tileLayerUrl, setTileLayerUrl] = useState(
    localStorage.getItem("tileLayerUrl") ||
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  );
  const [visible, setVisible] = useState(false);
  const [selectedCentre, setSelectedCentre] = useState<CentreExamen | null>(
    null
  );
  const [centerPosition, setCenterPosition] = useState<[number, number] | null>(
    null
  );
  const [centresData, setCentresData] = useState<CentreExamen[]>([]);
  const [loading, setLoading] = useState(true);

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
        console.error(
          "Erreur lors de la récupération de la géolocalisation",
          err
        );
      },
      { timeout: 10000 }
    );
  }, []);

  //affichage du marker de localisation
  useEffect(() => {
    if (markerRef.current) {
      (markerRef.current as any).openPopup();
    }
  }, [userLocated]);

  //récupération des données de centre d'examen avec useRef pour empêcher le double appel
  useEffect(() => {
    // Ignorer si on a déjà fait une requête
    if (fetchedRef.current) {
      return;
    }

    const fetchCentresData = async () => {
      try {
        setLoading(true);
        fetchedRef.current = true; // Marquer comme déjà fait, même si ça échoue

        const data = await getRequest<CentreExamen[]>("/custom/centre_examens");
        console.log("Données des centres d'examen :", data);

        if (data) {
          setCentresData(data);
          toast.current?.show({
            severity: "success",
            summary: "Succès",
            detail: `Centres d'examen récupérés avec succès (${data.length} centres)`,
            life: 3000,
          });
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des centres d'examen",
          error
        );
        toast.current?.show({
          severity: "error",
          summary: "Erreur",
          detail: "Erreur lors de la récupération des centres d'examen",
          life: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCentresData();
  }, []);

  // Récupération des centres favoris si l'utilisateur est connecté
  useEffect(() => {
    const fetchFavoriteCentres = async () => {
      if (!isAuthenticated || !userId) return;
      
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
        centre => favoriteIds.has(centre.id) !== !!centre.isFavorite
      );
      
      if (needsUpdate) {
        const updatedCentres = centresData.map((centre) => ({
          ...centre,
          isFavorite: favoriteIds.has(centre.id),
        }));
        setCentresData(updatedCentres);
      }
    }
  }, [favoriteCentres]); // Seulement favoriteCentres comme dépendance

  // Centre selectionné
  const handleFavoriteCentreClick = (centre: CentreExamen) => {
    // Rechercher le centre complet dans centresData pour avoir toutes les propriétés
    const completeCentre = centresData.find(c => c.id === centre.id);
    
    // Utiliser le centre complet s'il existe, sinon utiliser le centre original
    handleMarkerClick(completeCentre || centre);
  };

  /* Centre sélectionné */
  const handleMarkerClick = (centre: CentreExamen) => {
    setSelectedCentre(centre);
    setVisible(true);
    setCenterPosition([
      parseFloat(centre.latitude),
      parseFloat(centre.longitude),
    ]);
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
        response = await deleteRequest(
          `/eleves/${userId}/centres-examen-favoris/${centreId}`
        );
        
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
        response = await postRequest(
          `/eleves/${userId}/centres-examen-favoris/${centreId}`,
          {}
        );
        
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
          
          // Focus sur le nouveau centre ajouté aux favoris (à la fin de la liste)
          setTimeout(() => {
            const favoriteElements = document.querySelectorAll('.favorite-item .favorite-name');
            if (favoriteElements.length > 0) {
              (favoriteElements[favoriteElements.length - 1] as HTMLElement).focus();
            }
          }, 100);
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

  const RecenterMap = ({ position }: { position: [number, number] }) => {
    const map = useMap();
    map.setView(position);
    return null;
  };

  return (
    <>
      <Toast ref={toast} />
      <div className="map-wrapper">
        <HomePageTopBar />

        {/* 
        Si connecté -> NOM PRENOM image de profil
        Sinon, boutton Connexion & Inscription
        */}

        <MapContainer
          center={position}
          zoom={13}
          className="map"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url={tileLayerUrl}
          />
          {userLocated && <RecenterMap position={position} />}
          {centerPosition && <RecenterMap position={centerPosition} />}

          {userLocated && (
            <Marker position={position} icon={userIcon} ref={markerRef}>
              <Popup autoPan={false}>Vous📍</Popup>
            </Marker>
          )}

          {loading && (
            <div className="loader-container">
              <Loader />
            </div>
          )}
          {centresData &&
            centresData.map((centre) => {
              if (centre.latitude === null || centre.longitude === null)
                return null;
              const pos = [
                parseFloat(centre.latitude),
                parseFloat(centre.longitude),
              ];
              const icon =
                centre.pays === "France"
                  ? examCenterIconFrance
                  : examCenterIconUK;
              return (
                <Marker
                  key={centre.id}
                  position={pos}
                  icon={icon}
                  eventHandlers={{
                    click: () => handleMarkerClick(centre),
                    mouseover: (e) => {
                      e.target.setIcon(
                        new L.Icon({
                          iconUrl: icon.options.iconUrl,
                          iconSize: [36, 37], // agrandi
                          iconAnchor: [18, 37],
                          popupAnchor: [1, -34],
                          shadowUrl: icon.options.shadowUrl,
                          shadowSize: icon.options.shadowSize,
                        })
                      );
                    },
                    mouseout: (e) => {
                      e.target.setIcon(icon);
                    },
                  }}
                />
              );
            })}
          <MapControls userPos={position} />
        </MapContainer>
        {/* Affichage des centres favoris en bas à gauche */}
        {isAuthenticated && !loadingFavorites && (
          <FavoritesCentresList 
            favorites={favoriteCentres} 
            onCentreClick={handleFavoriteCentreClick}
            onRemoveFavorite={handleToggleFavorite}
          />
        )}
        {selectedCentre && (
        <DetailsCentreMap
          visible={visible}
          onHide={() => setVisible(false)}
          centre={{
            name: selectedCentre.libelle || "Centre sans nom",
            address: selectedCentre.adresse || "Adresse inconnue",
            city: selectedCentre.ville?.libelle || "Ville inconnue", // Utilisez l'opérateur ?. pour éviter l'erreur si ville est undefined
            postalCode: selectedCentre.ville?.code_postal || "N/A",
            id: selectedCentre.id,
            isFavorite: selectedCentre.isFavorite,
          }}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
      </div>
    </>
  );
}
