import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import { getRequest } from "../../interfaces/api";
import Loader from "../../components/utils/Loader";

// Interface pour les types de points
interface PointType {
  value: string;
  label: string;
  svgIcon: string;
  color: string;
}

// Interface pour un point du circuit
interface Point {
  id?: number;
  libelle: string;
  description?: string;
  latitude: number;
  longitude: number;
  type: string;
  position: number;
  rang?: number;
}

// Interface pour le circuit
interface Circuit {
  id?: number;
  libelle: string;
  description?: string;
  ville_centre?: {
    id: number;
    libelle: string;
    code_postal?: string;
  };
  id_moniteur?: {
    id: number;
    nom?: string;
    prenom?: string;
  };
}

// Interface pour la réponse d'une ville
interface VilleResponse {
  id: number;
  libelle: string;
  code_postal?: string;
  latitude: string;
  longitude: string;
}

// Types de points disponibles avec des icônes SVG
const pointTypes: PointType[] = [
  {
    value: "depart",
    label: "Départ",
    color: "#4CAF50",
    svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4CAF50" width="32" height="32">
      <path d="M0 0h24v24H0z" fill="none"/>
      <path d="M14 3v7h7v4h-7v7h-4v-7H3v-4h7V3h4z"/>
    </svg>`,
  },
  {
    value: "stop",
    label: "Arrêt",
    color: "#F44336",
    svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#F44336" width="32" height="32">
      <path d="M0 0h24v24H0z" fill="none"/>
      <path d="M6 6h12v12H6z"/>
    </svg>`,
  },
  {
    value: "attention",
    label: "Attention",
    color: "#FF9800",
    svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF9800" width="32" height="32">
      <path d="M0 0h24v24H0z" fill="none"/>
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
    </svg>`,
  },
  {
    value: "tournant",
    label: "Tournant",
    color: "#2196F3",
    svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2196F3" width="32" height="32">
      <path d="M0 0h24v24H0z" fill="none"/>
      <path d="M17.17 6.84l-4.23-4.26L10.5 5l4.2 4.2-7.27 7.28-4.93-4.93V19h7.45l-4.92-4.92 7.28-7.28 3.86 3.85V6.84z"/>
    </svg>`,
  },
  {
    value: "information",
    label: "Information",
    color: "#9C27B0",
    svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#9C27B0" width="32" height="32">
      <path d="M0 0h24v24H0z" fill="none"/>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
    </svg>`,
  },
  {
    value: "arrivee",
    label: "Arrivée",
    color: "#E91E63",
    svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#E91E63" width="32" height="32">
      <path d="M0 0h24v24H0z" fill="none"/>
      <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
    </svg>`,
  },
];

// Fonction pour créer une icône Leaflet à partir de SVG
const createIconFromSvg = (svgString: string): L.DivIcon => {
  return L.divIcon({
    html: svgString,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Composant pour gérer la création de route avec les points triés par rang
const RoutingMachineControl = ({ points }: { points: Point[] }) => {
  const map = useMap();
  const routingControlRef = React.useRef<L.Routing.Control | null>(null);

  useEffect(() => {
    // Nettoyer l'ancien contrôle de routage s'il existe
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }

    // S'il y a au moins 2 points, créer un nouvel itinéraire
    if (points.length >= 2) {
      // Trier les points par rang avant de créer les waypoints
      const sortedPoints = [...points].sort(
        (a, b) => (a.rang || 0) - (b.rang || 0)
      );

      // Créer des waypoints à partir des points du circuit
      const waypoints = sortedPoints.map((point) =>
        L.latLng(point.latitude, point.longitude)
      );

      // Créer le contrôle de routage
      const routingControl = L.Routing.control({
        waypoints: waypoints,
        routeWhileDragging: false,
        showAlternatives: false,
        fitSelectedRoutes: true,
        lineOptions: {
          styles: [{ color: "var(--primary-color)", opacity: 0.8, weight: 5 }],
          extendToWaypoints: true,
          missingRouteTolerance: 0,
        },
        createMarker: () => {
          return null;
        }, // Ne pas créer de marqueurs automatiquement
        addWaypoints: false, // Empêcher l'ajout de waypoints en cliquant sur la route
      }).addTo(map);

      routingControlRef.current = routingControl;

      // Cacher les instructions de l'itinéraire si elles sont affichées
      if (routingControl && routingControl.getContainer()) {
        const container = routingControl.getContainer();
        if (container) {
          container.style.display = "none";
        }
      }
    }

    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
    };
  }, [map, points]);

  return null;
};

const CircuitViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = React.useRef<Toast>(null);

  const [circuit, setCircuit] = useState<Circuit | null>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    48.8566, 2.3522,
  ]);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(true);
  const mapRef = useRef<L.Map | null>(null);
  const [tileLayerUrl] = useState(
    localStorage.getItem("tileLayerUrl") ||
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  );

  // Chargement des données du circuit
  useEffect(() => {
    if (!id) return;

    const fetchCircuitData = async () => {
      try {
        setIsLoading(true);

        // Récupérer les données du circuit
        const circuitData = await getRequest<any>(`/circuits/details/${id}`);

        setCircuit({
          id: circuitData.id,
          libelle: circuitData.libelle,
          description: circuitData.description,
          ville_centre: circuitData.ville_centre,
          id_moniteur: circuitData.id_moniteur,
        });

        // Récupérer les points associés - d'abord vérifier si points_details est disponible
        if (
          circuitData.points_details &&
          circuitData.points_details.length > 0
        ) {
          // Utiliser directement points_details si disponible
          const formattedPoints = circuitData.points_details.map(
            (point: any, index: number) => ({
              id: point.id,
              libelle: point.libelle || `Point ${index + 1}`,
              description: point.description || "",
              latitude: parseFloat(point.latitude),
              longitude: parseFloat(point.longitude),
              type: point.type || "information",
              position: index, // Pour l'UI
              rang: point.rang !== null ? point.rang : index, // Utiliser rang s'il existe
            })
          );

          setPoints(formattedPoints);

          // Centrer la carte sur le premier point
          if (formattedPoints.length > 0) {
            setMapCenter([
              formattedPoints[0].latitude,
              formattedPoints[0].longitude,
            ]);
          } else if (circuitData.ville_centre) {
            await centerMapOnVille(circuitData.ville_centre);
          }
        }
        // Si points_details n'est pas disponible, utiliser l'approche originale avec les IRIs
        else if (circuitData.points && circuitData.points.length > 0) {
          const pointsData = await Promise.all(
            circuitData.points.map(async (pointIri: string) => {
              const pointId = pointIri.split("/").pop();
              return await getRequest<any>(`/points/${pointId}`);
            })
          );

          // Trier les points par rang s'il est défini, sinon par ID
          const sortedPoints = pointsData
            .filter((point) => point !== null)
            .sort((a, b) => {
              if (a.rang !== null && b.rang !== null) {
                return a.rang - b.rang;
              }
              return a.id - b.id;
            });

          const formattedPoints = sortedPoints.map((point, index) => ({
            id: point.id,
            libelle: point.libelle || `Point ${index + 1}`,
            description: point.description || "",
            latitude: parseFloat(point.latitude),
            longitude: parseFloat(point.longitude),
            type: point.type || "information",
            position: index, // Pour l'UI
            rang: point.rang !== null ? point.rang : index, // Utiliser rang s'il existe
          }));

          setPoints(formattedPoints);

          // Centrer la carte sur le premier point s'il y en a
          if (formattedPoints.length > 0) {
            setMapCenter([
              formattedPoints[0].latitude,
              formattedPoints[0].longitude,
            ]);
          } else if (circuitData.ville_centre) {
            await centerMapOnVille(circuitData.ville_centre);
          }
        } else if (circuitData.ville_centre) {
          await centerMapOnVille(circuitData.ville_centre);
        }
      } catch (error) {
        console.error("Erreur lors du chargement du circuit:", error);
        toast.current?.show({
          severity: "error",
          summary: "Erreur",
          detail: "Impossible de charger les données du circuit",
          life: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCircuitData();
  }, [id]);

  // Fonction pour centrer la carte sur une ville
  const centerMapOnVille = async (ville: any) => {
    try {
      const villeId =
        typeof ville === "object" ? ville.id : ville.split("/").pop();
      const villeData = await getRequest<VilleResponse>(`/villes/${villeId}`);

      if (villeData && villeData.latitude && villeData.longitude) {
        setMapCenter([
          parseFloat(villeData.latitude),
          parseFloat(villeData.longitude),
        ]);
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des coordonnées de la ville:",
        error
      );
    }
  };

  // Trouver l'icône correspondant au type de point
  const getPointIcon = (type: string) => {
    const pointType =
      pointTypes.find((pt) => pt.value === type) || pointTypes[4]; // Fallback sur "information"
    return createIconFromSvg(pointType.svgIcon);
  };

  // Composant pour récupérer l'instance de la carte
  const MapInitializer = () => {
    const map = useMap();
    
    useEffect(() => {
      mapRef.current = map;
    }, [map]);
    
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader />
        <div className="mt-3 text-gray-700 font-medium">Chargement du circuit...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-gray-50">
      <Toast ref={toast} position="top-center" className="z-50" />

      {/* Carte en arrière-plan - prend toute la hauteur et largeur */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={mapCenter}
          zoom={15}
          className="h-full w-full"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url={tileLayerUrl}
          />

          <MapInitializer />
          <RoutingMachineControl points={points} />

          {/* Marqueurs pour les points */}
          {points.map((point) => (
            <Marker
              key={point.position}
              position={[point.latitude, point.longitude]}
              icon={getPointIcon(point.type)}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="text-lg font-bold text-white">{point.libelle}</h3>
                  <p className="my-1 text-white text-sm">{point.description || "Pas de description"}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Barre d'outils en haut comme navigation - au dessus de la carte */}
      <div className="absolute top-0 left-0 right-0 p-4 z-20">
        <div className="flex flex-wrap gap-2">
          <Button
            label={"Retour à l'accueil"}
            icon="pi pi-arrow-left"
            className="p-2 gap-2 bg-green-800 text-white rounded-lg"
            onClick={() => navigate(`/`)}
          />
        </div>
      </div>

      {/* Panneau de contrôle à droite - au dessus de la carte */}
      <div className={`absolute bot-0 right-0 z-20 w-full max-w-md p-4 h-screen flex flex-col transition-all duration-300 ${
        isPanelVisible ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
      }`}>
        <div className="bg-white rounded-lg shadow-lg p-4 flex-grow overflow-hidden flex flex-col mb-16">
          <h3 className="text-xl font-bold text-green-700 border-b pb-2 mb-4">
            {circuit?.libelle || "Circuit sans nom"}
          </h3>
          
          {circuit?.description && (
            <div className="mb-4">
              <p className="text-gray-700">{circuit.description}</p>
            </div>
          )}
          
          {circuit?.ville_centre && (
            <div className="mb-4 flex items-center">
              <i className="pi pi-map-marker text-green-600 mr-2"></i>
              <span className="text-gray-700">
                {circuit.ville_centre.libelle}{" "}
                {circuit.ville_centre.code_postal && `(${circuit.ville_centre.code_postal})`}
              </span>
            </div>
          )}
          
          {circuit?.id_moniteur && (
            <div className="mb-4 flex items-center">
              <i className="pi pi-user text-green-600 mr-2"></i>
              <span className="text-gray-700">
                Moniteur: {circuit.id_moniteur.nom} {circuit.id_moniteur.prenom}
              </span>
            </div>
          )}

          <div className="flex-grow overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-lg font-semibold text-gray-700">Points du circuit</h4>
              <span className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded-full">
                {points.length} {points.length <= 1 ? "point" : "points"}
              </span>
            </div>

            {points.length === 0 ? (
              <div className="p-4 border border-dashed border-gray-300 rounded-md text-center text-gray-500">
                Aucun point défini pour ce circuit.
              </div>
            ) : (
              <ul className="list-none p-0 m-0 space-y-2">
                {points
                  .sort((a, b) => (a.rang || 0) - (b.rang || 0))
                  .map((point, index) => {
                    const pointType =
                      pointTypes.find((pt) => pt.value === point.type) ||
                      pointTypes[4];
                    return (
                      <li
                        key={index}
                        className="flex border-b border-gray-200 py-3 hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          if (mapRef.current) {
                            mapRef.current.setView([point.latitude, point.longitude], mapRef.current.getZoom());
                          }
                        }}
                      >
                        <div className="flex items-center mr-3">
                          <div
                            className="flex items-center justify-center p-2 bg-gray-200 rounded-full text-gray-700 mr-1"
                          >
                            {index + 1}
                          </div>
                          <div
                            className="p-2 rounded-full flex items-center justify-center text-white"
                            style={{ backgroundColor: pointType.color }}
                          >
                            <i
                              className={
                                point.type === "depart"
                                  ? "pi pi-flag"
                                  : point.type === "stop"
                                  ? "pi pi-stop"
                                  : point.type === "attention"
                                  ? "pi pi-exclamation-triangle"
                                  : point.type === "tournant"
                                  ? "pi pi-arrow-right"
                                  : point.type === "arrivee"
                                  ? "pi pi-check-circle"
                                  : "pi pi-info-circle"
                              }
                            ></i>
                          </div>
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="font-medium text-sm truncate h-5 overflow-hidden">
                            {point.libelle}
                          </div>
                          <div className="text-xs text-gray-500 h-4 overflow-hidden text-ellipsis whitespace-nowrap">
                            {point.description || "Pas de description"}
                          </div>
                        </div>
                      </li>
                    );
                  })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Bouton flottant pour afficher/masquer le panneau sur mobile */}
      <div className="fixed bottom-4 right-4 md:hidden z-30">
        <Button
          icon={isPanelVisible ? "pi pi-times" : "pi pi-bars"}
          className="bg-green-800 rounded-lg text-white h-11 w-13"
          aria-label={isPanelVisible ? "Masquer le panneau" : "Afficher le panneau"}
          onClick={() => setIsPanelVisible(!isPanelVisible)}
        />
      </div>
    </div>
  );
};

export default CircuitViewPage;
