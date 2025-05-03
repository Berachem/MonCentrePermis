import { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "../../assets/css/home-map.css";
import DetailsCentreMap from "./DetailsCentreMap";
import { CentreExamen } from "../../interfaces/interfaces"; // Interface mise à jour
import {
  deleteRequest,
  getRequest,
  postRequest,
} from "../../interfaces/utils/api";
import { Toast } from "primereact/toast";
import Loader from "./Loader";
import HomePageTopBar from "./HomePageTopBar";
import { Button } from "primereact/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faLocation } from "@fortawesome/free-solid-svg-icons";
import useAuth from "../../hooks/useAuth";
import youAreHereIcon from "../../assets/images/you_are_here.svg";
import { UserType } from "../../enum/user";

/* Icones */
// Icône personnalisée pour les centres en France
const createExamCenterIcon = (
  centre: CentreExamen,
  showLabels: boolean = true
) => {
  let displayName = centre.libelle || "Centre";

  //enleve 'Centre d'examen' du nom
  const regex = /Centre d'examen de/i;
  const match = displayName.match(regex);
  if (match) {
    displayName = displayName.replace(regex, "Centre d'examen de").trim();
  }

  // Conditionnellement inclure ou non le div avec le nom du centre
  const nameDiv = showLabels
    ? `
    <div class="centre-name" style="position: absolute; top: 50%; right: -5px; transform: translate(100%, -50%); 
         text-align: left; white-space: nowrap; font-weight: 800; color: #6366F1; 
         font-size: 13px; 
         background-color: rgba(255,255,255,0.9); padding: 2px 6px; 
         border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.2);">
         ${displayName}
    </div>
  `
    : "";

  return new L.DivIcon({
    className: "custom-div-icon",
    html: `
      <div style="position: relative; text-align: center;">
        ${nameDiv}
        <svg height="31" width="30" viewBox="0 0 30 31">
          <path d="M15 0 C21 0, 30 6, 30 15 C30 24, 21 31, 15 31 C9 31, 0 24, 0 15 C0 6, 9 0, 15 0 Z" fill="#6366F1"/>
          <circle cx="15" cy="15" r="8" fill="white"/>
        </svg>
      </div>
    `,
    iconSize: [30, 31],
    iconAnchor: [15, 31],
    popupAnchor: [1, -34],
  });
};

// Icône personnalisée pour la position de l'utilisateur
const userIcon = new L.Icon({
  iconUrl: youAreHereIcon,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

// Composant pour surveiller les changements de zoom
function ZoomListener({
  onZoomChange,
}: {
  onZoomChange: (zoom: number) => void;
}) {
  const map = useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom());
    },
  });
  return null;
}

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

  const handleRemoveKeyDown = (
    event: React.KeyboardEvent,
    centreId: number
  ) => {
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
      {/* Floating button to toggle favorites panel */}
      <Button
        className="favorites-toggle-btn p-button-rounded shadow-lg flex items-center"
        onClick={toggleVisibility}
        aria-expanded={isVisible}
        aria-label="Afficher les centres favoris"
      >
        <FontAwesomeIcon icon={faHeart} className="text-lg" />
        <span className="favorites-btn-text ml-2">Favoris</span>
      </Button>

      {/* Favorites panel (shown/hidden based on isVisible state) */}
      {isVisible && (
        <div
          className="favorites-panel shadow-md rounded-lg bg-white"
          role="region"
          aria-label="Centres favoris"
        >
          <h3
            id="favorites-heading"
            className="text-lg font-bold text-primary border-b flex justify-between items-center p-2"
          >
            <span className="flex items-center">
              <FontAwesomeIcon icon={faHeart} className="mr-2 text-primary" />
              Mes centres favoris
            </span>
            <Button
              icon="pi pi-times"
              className="p-button-text p-button-rounded w-2rem h-2rem bg-white hover:bg-gray-100"
              onClick={toggleVisibility}
              aria-label="Fermer les favoris"
            />
          </h3>
          <ul
            className="favorites-list p-2"
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
                  className="favorite-item flex justify-between items-center p-2 hover:bg-gray-50 rounded"
                >
                  <div
                    className="favorite-name flex-grow cursor-pointer text-gray-700 hover:text-primary"
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
                    className="p-button-text p-button-primary p-button-rounded w-2rem h-2rem bg-white hover:bg-gray-100"
                    onClick={() => onCentreClick(centre)}
                    onKeyDown={(e) => handleKeyDown(e, centre)}
                    tabIndex={0}
                    aria-label={`Voir le centre ${cleanName}`}
                    style={{ marginLeft: "5px", fontSize: "0.8rem" }}
                  />

                  {/* supprimer */}
                  <Button
                    icon="pi pi-times"
                    className="p-button-text p-button-danger p-button-rounded w-2rem h-2rem bg-white hover:bg-gray-100"
                    onClick={() => onRemoveFavorite(centre.id)}
                    onKeyDown={(e) => handleRemoveKeyDown(e, centre.id)}
                    tabIndex={0}
                    aria-label={`Retirer ${cleanName} des favoris`}
                    style={{ marginLeft: "5px", fontSize: "0.8rem" }}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Add these styles to your CSS file */}
      <style jsx>{`
        .favorites-toggle-btn {
          position: absolute;
          bottom: 20px;
          left: 20px;
          z-index: 1000;
          background-color: white;
          color: #6366f1;
          border: 2px solid #6366f1;
        }

        .favorites-panel {
          position: absolute;
          bottom: 80px;
          left: 20px;
          z-index: 1000;
          width: 300px;
          max-height: 70vh;
          overflow-y: auto;
        }

        /* Hide text on mobile */
        @media (max-width: 768px) {
          .favorites-btn-text {
            display: none;
          }

          .favorites-panel {
            width: 90%;
            left: 5%;
            bottom: 70px;
          }
        }
      `}</style>
    </>
  );
}

// Modification des contrôles de la carte pour utiliser la nouvelle fonction de recentrage
export function MapControls({
  userPos,
  onRecenterClick,
}: {
  userPos: [number, number];
  onRecenterClick: () => void;
}) {
  const map = useMap();

  const handleZoomIn = () => {
    map.zoomIn();
  };

  const handleZoomOut = () => {
    map.zoomOut();
  };

  return (
    <div className="map-controls">
      <Button
        onClick={onRecenterClick}
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

// Modification du composant RecenterMap pour ajouter un contrôle quand il doit recenter
const RecenterMap = ({
  position,
  shouldRecenter,
  onRecenterComplete,
}: {
  position: [number, number];
  shouldRecenter: boolean;
  onRecenterComplete?: () => void;
}) => {
  const map = useMap();

  useEffect(() => {
    if (shouldRecenter) {
      map.setView(position);
      if (onRecenterComplete) {
        onRecenterComplete();
      }
    }
  }, [map, position, shouldRecenter, onRecenterComplete]);

  return null;
};

export function HomePageMap() {
  const toast = useRef<Toast>(null);
  const markerRef = useRef(null);
  const fetchedRef = useRef(false); // Utiliser useRef au lieu de useState pour ne pas déclencher de re-render

  const [position, setPosition] = useState<[number, number]>([48.8566, 2.3522]);
  const [userLocated, setUserLocated] = useState(false);
  const [shouldRecenterToUser, setShouldRecenterToUser] = useState(true);
  const [shouldRecenterToCenter, setShouldRecenterToCenter] = useState(false);
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
  const [zoomLevel, setZoomLevel] = useState(13); // État pour suivre le niveau de zoom

  // Gestion favoris
  const { isAuthenticated, userId, userRole } = useAuth();
  const [favoriteCentres, setFavoriteCentres] = useState<CentreExamen[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  // Déterminer si on affiche les noms des centres en fonction du niveau de zoom
  const showLabels = zoomLevel >= 9;

  // Fonction pour mettre à jour le niveau de zoom
  const handleZoomChange = (zoom: number) => {
    setZoomLevel(zoom);
  };

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
          /*          toast.current?.show({
            severity: "success",
            summary: "Succès",
            detail: `Centres d'examen récupérés avec succès (${data.length} centres)`,
            life: 3000,
          }); */
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
      // si on est pas moniteur, on ne peut pas avoir de favoris
      if (userRole !== UserType.Student) return;

      try {
        setLoadingFavorites(true);

        const data = await getRequest(
          `/eleves/${userId}/centres-examen-favoris`
        );
        console.log("Centres favoris récupérés:", data);

        // Vérifier si data est un tableau - si c'est un objet avec un message, utiliser un tableau vide
        if (Array.isArray(data)) {
          setFavoriteCentres(data);
        } else {
          // Si data n'est pas un tableau, initialiser avec un tableau vide
          setFavoriteCentres([]);
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des centres favoris",
          error
        );
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
  }, [favoriteCentres]); // Seulement favoriteCentres comme dépendance

  // Centre selectionné
  const handleFavoriteCentreClick = (centre: CentreExamen) => {
    // Rechercher le centre complet dans centresData pour avoir toutes les propriétés
    const completeCentre = centresData.find((c) => c.id === centre.id);

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
    setShouldRecenterToCenter(true);
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
          setFavoriteCentres((prev) =>
            prev.filter((centre) => centre.id !== centreId)
          );

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
          const centreToAdd = centresData.find(
            (centre) => centre.id === centreId
          );
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
            const favoriteElements = document.querySelectorAll(
              ".favorite-item .favorite-name"
            );
            if (favoriteElements.length > 0) {
              (
                favoriteElements[favoriteElements.length - 1] as HTMLElement
              ).focus();
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

  // Bouton de recentrage dans les contrôles de la carte
  const handleManualRecenter = () => {
    setShouldRecenterToUser(true);
  };

  // Ajoutez cette fonction dans le composant HomePageMap
  const handleCentreSelect = (centreId: number) => {
    // Rechercher le centre dans les données déjà chargées
    const centre = centresData.find(c => c.id === centreId);
    
    if (centre && centre.latitude && centre.longitude) {
      // Si le centre est trouvé et a des coordonnées valides
      setCenterPosition([parseFloat(centre.latitude), parseFloat(centre.longitude)]);
      setShouldRecenterToCenter(true);
      setSelectedCentre(centre);
      setVisible(true); // Pour ouvrir le modal de détails
    } else {
      // Si le centre n'est pas trouvé ou n'a pas de coordonnées valides
      toast.current?.show({
        severity: "warn",
        summary: "Centre introuvable",
        detail: "Impossible de localiser ce centre sur la carte",
        life: 3000,
      });
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <div className="map-wrapper">
        <HomePageTopBar onCentreSelect={handleCentreSelect} />

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
          {userLocated && (
            <RecenterMap
              position={position}
              shouldRecenter={shouldRecenterToUser}
              onRecenterComplete={() => setShouldRecenterToUser(false)}
            />
          )}
          {centerPosition && (
            <RecenterMap
              position={centerPosition}
              shouldRecenter={shouldRecenterToCenter}
              onRecenterComplete={() => setShouldRecenterToCenter(false)}
            />
          )}

          {/* Composant pour surveiller les changements de zoom */}
          <ZoomListener onZoomChange={handleZoomChange} />

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
              const icon = createExamCenterIcon(centre, showLabels);
              return (
                <Marker
                  key={centre.id}
                  position={pos}
                  icon={icon}
                  title={centre.libelle}
                  alt={centre.libelle}
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
          <MapControls
            userPos={position}
            onRecenterClick={handleManualRecenter}
          />
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
