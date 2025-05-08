import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Toolbar } from "primereact/toolbar";
import { Card } from "primereact/card";
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

  // Templates pour les actions de la barre d'outils
  const leftToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          label="Retour"
          icon="pi pi-arrow-left"
          className="p-button-outlined"
          onClick={() => navigate(-1)}
        />
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-column align-items-center justify-content-center min-h-screen">
        <Loader />
        <div className="mt-3">Chargement du circuit...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-column min-h-screen">
      <Toast ref={toast} />

      <div className="p-3">
        <Toolbar left={leftToolbarTemplate} className="mb-3" />

        <div className="grid">
          <div className="col-12 md:col-8">
            <Card
              title={circuit?.libelle || "Circuit"}
              subTitle={
                circuit?.ville_centre
                  ? `Ville: ${circuit.ville_centre.libelle}`
                  : undefined
              }
              className="mb-3"
            >
              <p className="m-0">
                {circuit?.description || "Aucune description disponible"}
              </p>
              {circuit?.id_moniteur && (
                <p className="mt-3">
                  <strong>Moniteur: </strong>
                  {circuit.id_moniteur.nom} {circuit.id_moniteur.prenom}
                </p>
              )}
            </Card>

            <div className="card p-0 shadow-lg bg-white rounded-md h-[60vh]">
              <MapContainer
                center={mapCenter}
                zoom={15}
                className="h-full w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Utiliser le contrôle de routage */}
                <RoutingMachineControl points={points} />

                {/* Marqueurs pour les points */}
                {points.map((point) => (
                  <Marker
                    key={point.position}
                    position={[point.latitude, point.longitude]}
                    icon={getPointIcon(point.type)}
                  >
                    <Popup>
                      <div>
                        <h3>{point.libelle}</h3>
                        <p>{point.description || "Aucune description"}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>

          <div className="col-12 md:col-4">
            <Card title="Points du circuit" className="shadow-4">
              <p className="text-sm text-500">
                {points.length} {points.length <= 1 ? "point" : "points"}
              </p>

              {points.length === 0 ? (
                <div className="p-3 border-1 border-dashed border-300 text-center text-500">
                  Aucun point défini pour ce circuit.
                </div>
              ) : (
                <ul className="list-none p-0 m-0">
                  {points
                    .sort((a, b) => (a.rang || 0) - (b.rang || 0))
                    .map((point, index) => {
                      const pointType =
                        pointTypes.find((pt) => pt.value === point.type) ||
                        pointTypes[4];
                      return (
                        <li
                          key={index}
                          className="flex align-items-center border-bottom-1 border-300 py-2"
                        >
                          <div
                            className="mr-2 flex align-items-center justify-content-center"
                            style={{ width: "24px" }}
                          >
                            {index + 1}
                          </div>
                          <div
                            className="mr-2"
                            style={{
                              width: "24px",
                              height: "24px",
                              backgroundColor: pointType.color,
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                            }}
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
                          <div className="flex-grow-1">
                            <div className="font-medium">{point.libelle}</div>
                            <div className="text-xs text-500">
                              {point.description
                                ? point.description.slice(0, 30) +
                                  (point.description.length > 30 ? "..." : "")
                                : "Pas de description"}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                </ul>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircuitViewPage;
