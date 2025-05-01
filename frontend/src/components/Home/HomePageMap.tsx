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
import "../../assets/css/home-map.css";
import { CentreExamen } from "../../interfaces/interfaces";
import { getRequest } from "../../interfaces/utils/api";
import Loader from "../utils/Loader";
import { Button } from "primereact/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocation } from "@fortawesome/free-solid-svg-icons";
import youAreHereIcon from "../../assets/images/you_are_here.svg";
import L from "leaflet";

/* Icones */
// Icône personnalisée pour les centres en France - modifiée pour être verte
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
    <div class="absolute top-1/2 right-[-5px] transform translate-y-[-50%] translate-x-full
         text-left whitespace-nowrap font-extrabold text-green-800
         text-sm bg-white bg-opacity-90 px-1.5 py-0.5
         rounded shadow-sm">
         ${displayName}
    </div>
  `
    : "";

  return new L.DivIcon({
    className: "custom-div-icon",
    html: `
      <div class="relative text-center">
        ${nameDiv}
        <svg height="31" width="30" viewBox="0 0 30 31">
          <path d="M15 0 C21 0, 30 6, 30 15 C30 24, 21 31, 15 31 C9 31, 0 24, 0 15 C0 6, 9 0, 15 0 Z" fill="#166534"/>
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

// Composant pour recenter la carte
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

// Contrôles de la carte
function MapControls({
  onRecenterClick,
}: {
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
    <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-[900]">
      <Button
        onClick={onRecenterClick}
        className="rounded-full flex justify-center items-center w-11 h-11 bg-green-800 text-white border-none hover:bg-green-700 shadow-xl p-0 aspect-square"
      >
        <FontAwesomeIcon icon={faLocation} className="text-lg" />
      </Button>
      <Button
        icon="pi pi-plus"
        onClick={handleZoomIn}
        className="rounded-full w-11 h-11 bg-green-800 text-white border-none hover:bg-green-700 shadow-xl flex items-center justify-center p-0 aspect-square"
      />
      <Button
        icon="pi pi-minus"
        onClick={handleZoomOut}
        className="rounded-full w-11 h-11 bg-green-800 text-white border-none hover:bg-green-700 shadow-xl flex items-center justify-center p-0 aspect-square"
      />
    </div>
  );
}

interface HomePageMapProps {
  position: [number, number];
  userLocated: boolean;
  shouldRecenterToUser: boolean;
  onRecenterComplete: () => void;
  shouldRecenterToCenter: boolean;
  onRecenterToCenter: () => void;
  centerPosition: [number, number] | null;
  onMarkerClick: (centre: CentreExamen) => void;
  onManualRecenter: () => void;
  centresData: CentreExamen[];
  onCentresDataUpdate: (data: CentreExamen[]) => void;
}

export function HomePageMap({
  position,
  userLocated,
  shouldRecenterToUser,
  onRecenterComplete,
  shouldRecenterToCenter,
  onRecenterToCenter,
  centerPosition,
  onMarkerClick,
  onManualRecenter,
  centresData,
  onCentresDataUpdate
}: HomePageMapProps) {
  const markerRef = useRef(null);
  const fetchedRef = useRef(false);
  const [tileLayerUrl] = useState(
    localStorage.getItem("tileLayerUrl") ||
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  );
  const [loading, setLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(13);
  
  // Déterminer si on affiche les noms des centres en fonction du niveau de zoom
  const showLabels = zoomLevel >= 9;

  // Fonction pour mettre à jour le niveau de zoom
  const handleZoomChange = (zoom: number) => {
    setZoomLevel(zoom);
  };

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
          onCentresDataUpdate(data);
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des centres d'examen",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCentresData();
  }, [onCentresDataUpdate]);

  return (
    <div className="absolute inset-0">
      <div className="w-full h-full">
        <MapContainer
          center={position}
          zoom={13}
          className="w-full h-full"
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
              onRecenterComplete={onRecenterComplete}
            />
          )}
          
          {centerPosition && (
            <RecenterMap
              position={centerPosition}
              shouldRecenter={shouldRecenterToCenter}
              onRecenterComplete={onRecenterToCenter}
            />
          )}

          <ZoomListener onZoomChange={handleZoomChange} />

          {userLocated && (
            <Marker position={position} icon={userIcon} ref={markerRef} >
              <Popup closeButton={false} >Vous📍</Popup>
            </Marker>
          )}

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center z-[1000] bg-white bg-opacity-70">
              <Loader />
            </div>
          )}
          
          {centresData &&
            centresData.map((centre) => {
              if (centre.latitude === null || centre.longitude === null)
                return null;
              const pos: L.LatLngTuple = [
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
                    click: () => onMarkerClick(centre),
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
            
          <MapControls onRecenterClick={onManualRecenter} />
        </MapContainer>
      </div>
    </div>
  );
}
