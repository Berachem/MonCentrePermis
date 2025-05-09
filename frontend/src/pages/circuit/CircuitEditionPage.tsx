import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { ConfirmDialog } from "primereact/confirmdialog";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import {
  getRequest,
  postRequest,
  patchRequest,
  deleteRequest,
} from "../../interfaces/api";
import Loader from "../../components/utils/Loader";
import ConfirmationDialog from "../../components/utils/ConfirmationDialog";

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
  position: number; // Utilisé côté client pour l'UI
  rang?: number; // Colonne en base de données
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
  const routingControlRef = useRef<L.Routing.Control | null>(null);

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
        fitSelectedRoutes: false,
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

// Composant pour gérer les événements de la carte
const MapEventHandler: React.FC<{
  onMapClick: (latlng: L.LatLng) => void;
}> = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });
  return null;
};

const CircuitEditionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);

  const [circuit, setCircuit] = useState<Circuit | null>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    48.8566, 2.3522,
  ]);
  const [addPointDialogVisible, setAddPointDialogVisible] =
    useState<boolean>(false);
  const [editPointDialogVisible, setEditPointDialogVisible] =
    useState<boolean>(false);
  const [tempPoint, setTempPoint] = useState<Point | null>(null);
  const [editingPoint, setEditingPoint] = useState<Point | null>(null);
  const [isDraggingEnabled, setIsDraggingEnabled] = useState<boolean>(false);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(true);
  const [deletedPointIds, setDeletedPointIds] = useState<number[]>([]);
  const [shouldRecenter, setShouldRecenter] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState<boolean>(false);
  const [pointToDeletePosition, setPointToDeletePosition] = useState<number | null>(null);
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
        });
        console.log("Circuit chargé:", circuitData);

        // Récupérer les points associés si disponibles
        if (circuitData.points && circuitData.points.length > 0) {
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

  // Gestion du clic sur la carte pour ajouter un point
  const handleMapClick = (latlng: L.LatLng) => {
    if (!isDraggingEnabled) {
      setTempPoint({
        libelle: `Point ${points.length + 1}`,
        latitude: latlng.lat,
        longitude: latlng.lng,
        type: "information",
        position: points.length,
      });
      setAddPointDialogVisible(true);
    }
  };

  // Ajouter un nouveau point au circuit
  const addPoint = () => {
    if (!tempPoint) return;

    // Trouver le rang maximum existant + 1
    const maxRang = points.reduce(
      (max, point) => Math.max(max, point.rang || 0),
      0
    );

    const newPoint = {
      ...tempPoint,
      rang: maxRang + 1, // Assigner le prochain rang disponible
    };

    setPoints([...points, newPoint]);
    setAddPointDialogVisible(false);
    setTempPoint(null);

    toast.current?.show({
      severity: "success",
      summary: "Point ajouté",
      detail: "Le point a été ajouté au circuit",
      life: 1500,
    });
  };

  // Ouvrir le dialogue d'édition d'un point
  const openEditPointDialog = (point: Point) => {
    setEditingPoint({ ...point });
    setEditPointDialogVisible(true);
  };

  // Mettre à jour un point existant
  const updatePoint = () => {
    if (!editingPoint) return;

    const updatedPoints = points.map((p) =>
      p.position === editingPoint.position ? editingPoint : p
    );

    setPoints(updatedPoints);
    setEditPointDialogVisible(false);
    setEditingPoint(null);

    toast.current?.show({
      severity: "success",
      summary: "Point modifié",
      detail: "Le point a été mis à jour",
      life: 1500,
    });
  };

  // Supprimer un point du circuit
  const deletePoint = (position: number, event?: React.MouseEvent) => {
    // Arrêter la propagation de l'événement s'il existe
    if (event) {
      event.stopPropagation();
    }
    
    setPointToDeletePosition(position);
    setConfirmDeleteVisible(true);
  };

  // Fonction pour confirmer la suppression du point
  const confirmDeletePoint = () => {
    if (pointToDeletePosition === null) return;
    
    // Récupérer le point à supprimer
    const pointToDelete = points.find((p) => p.position === pointToDeletePosition);

    // Si le point a un ID (existe en base de données), l'ajouter à la liste des points à supprimer
    if (pointToDelete && pointToDelete.id) {
      setDeletedPointIds([...deletedPointIds, pointToDelete.id]);
    }

    // Filtrer les points et ajuster les rangs des points suivants
    const filteredPoints = points
      .filter((p) => p.position !== pointToDeletePosition)
      .map((p, idx) => ({
        ...p,
        position: idx,
        // Si le rang du point actuel est supérieur au rang du point supprimé, le décrémenter
        rang:
          pointToDelete &&
          p.rang &&
          pointToDelete.rang &&
          p.rang > pointToDelete.rang
            ? p.rang - 1
            : p.rang,
        libelle: p.libelle.startsWith("Point ")
          ? `Point ${idx + 1}`
          : p.libelle,
      }));

    setPoints(filteredPoints);

    toast.current?.show({
      severity: "success",
      summary: "Point supprimé",
      detail: "Le point a été supprimé du circuit",
      life: 1500,
    });
    
    setPointToDeletePosition(null);
  };

  // Réorganiser les points (monter un point dans la liste)
  const movePointUp = (position: number) => {
    if (position <= 0) return;

    const newPoints = [...points];

    // Échanger les positions pour l'UI
    const temp = newPoints[position - 1];
    newPoints[position - 1] = {
      ...newPoints[position],
      position: position - 1,
    };
    newPoints[position] = {
      ...temp,
      position: position,
    };

    // Échanger les rangs en base de données
    const tempRang = newPoints[position - 1].rang;
    newPoints[position - 1].rang = newPoints[position].rang;
    newPoints[position].rang = tempRang;

    setPoints(newPoints);
  };

  // Réorganiser les points (descendre un point dans la liste)
  const movePointDown = (position: number) => {
    if (position >= points.length - 1) return;

    const newPoints = [...points];

    // Échanger les positions pour l'UI
    const temp = newPoints[position + 1];
    newPoints[position + 1] = {
      ...newPoints[position],
      position: position + 1,
    };
    newPoints[position] = {
      ...temp,
      position: position,
    };

    // Échanger les rangs en base de données
    const tempRang = newPoints[position + 1].rang;
    newPoints[position + 1].rang = newPoints[position].rang;
    newPoints[position].rang = tempRang;

    setPoints(newPoints);
  };

  const saveCircuit = async () => {
    if (!circuit || !id) return;

    setIsSaving(true);

    try {
      // Supprimer les points marqués pour suppression
      const deletePromises = deletedPointIds.map(async (pointId) => {
        return await deleteRequest(`/points/${pointId}`);
      });

      // Attendre que toutes les suppressions soient terminées
      await Promise.all(deletePromises);
      // Traiter chaque point du circuit
      const pointPromises = points.map(async (point) => {
        const pointData = {
          libelle: point.libelle,
          description: point.description || "",
          latitude: point.latitude.toString(),
          longitude: point.longitude.toString(),
          type: point.type,
          circuit: `/api/circuits/${id}`,
          rang: point.rang, // Ajouter le rang dans les données envoyées à l'API
        };

        if (point.id) {
          // Point existant à mettre à jour
          return await patchRequest(`/points/${point.id}`, pointData);
        } else {
          // Nouveau point à créer
          return await postRequest("/points", pointData);
        }
      });

      await Promise.all(pointPromises);

      // Réinitialiser la liste des points supprimés
      setDeletedPointIds([]);

      toast.current?.show({
        severity: "success",
        summary: "Circuit sauvegardé",
        detail: "Les modifications ont été enregistrées avec succès",
        life: 3000,
      });

      // Recharger les données du circuit
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du circuit:", error);
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Impossible d'enregistrer les modifications",
        life: 3000,
      });
    } finally {
      setIsSaving(false);
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

  // Composant pour recentrer la carte
  const RecenterMap = () => {
    const map = useMap();
    
    useEffect(() => {
      if (shouldRecenter && mapCenter && map) {
        map.setView(mapCenter, map.getZoom());
        setShouldRecenter(false);
      }
    }, [map, shouldRecenter]);
    
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
      <ConfirmDialog />

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
          <RecenterMap />
          <MapEventHandler onMapClick={handleMapClick} />
          <RoutingMachineControl points={points} />

          {/* Marqueurs pour les points */}
          {points.map((point) => (
            <Marker
              key={point.position}
              position={[point.latitude, point.longitude]}
              icon={getPointIcon(point.type)}
              draggable={isDraggingEnabled}
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target;
                  const position = marker.getLatLng();
                  const updatedPoints = points.map((p) =>
                    p.position === point.position
                      ? {
                          ...p,
                          latitude: position.lat,
                          longitude: position.lng,
                        }
                      : p
                  );
                  setPoints(updatedPoints);
                },
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="text-lg font-bold text-white">{point.libelle}</h3>
                  <p className="my-1 text-white">{point.description}</p>
                  <div className="flex justify-between gap-2">
                    <Button
                      icon="pi pi-pencil"
                      className="bg-white text-green-700 px-3 py-1 rounded-md hover:bg-green-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditPointDialog(point);
                      }}
                    />
                    <Button
                      icon="pi pi-trash"
                      className="bg-white text-red-600 px-3 py-1 rounded-md hover:bg-red-50"
                      onClick={(e) => deletePoint(point.position, e)}
                    />
                  </div>
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
          <Button
            label={
              window.innerWidth < 768
                ? ""
                : isDraggingEnabled
                ? "Désactiver le déplacement"
                : "Activer le déplacement des points"
            }
            icon={isDraggingEnabled ? "pi pi-lock" : "pi pi-window-minimize"}
            className={`p-2 gap-2 rounded-lg text-white ${
              isDraggingEnabled ? "bg-orange-500" : "bg-green-500"
            }`}
            onClick={() => setIsDraggingEnabled(!isDraggingEnabled)}
            tooltip={
              window.innerWidth < 768
                ? isDraggingEnabled
                  ? "Désactiver le déplacement"
                  : "Activer le déplacement"
                : ""
            }
            tooltipOptions={{ position: "bottom" }}
          />
        </div>
      </div>

      {/* Panneau de contrôle à droite - au dessus de la carte */}
      <div className={`absolute bot-0 right-0 z-20 w-full max-w-md p-4 h-screen flex flex-col transition-all duration-300 ${
        isPanelVisible ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
      }`}>
        <div className="mb-4">
          <Button
            label="Enregistrer"
            icon="pi pi-save"
            loading={isSaving}
            onClick={saveCircuit}
            className="bg-green-800 text-white w-full px-4 py-2 rounded-md hover:bg-green-700 gap-2 shadow-lg"
          />
        </div>
        <div className="bg-white rounded-lg shadow-lg p-4 flex-grow overflow-hidden flex flex-col mb-16">
          <h3 className="text-xl font-bold text-green-700 border-b pb-2 mb-4">
            {circuit?.libelle || "Circuit sans nom"}
          </h3>

          <div className="flex-grow overflow-y-auto">
            <h4 className="text-lg font-semibold text-gray-700">Points du circuit</h4>
            <p className="text-sm text-gray-500 mb-4">
              {points.length} {points.length <= 1 ? "point" : "points"} -
              cliquez sur la carte pour ajouter un nouveau point
            </p>

            {points.length === 0 ? (
              <div className="p-4 border border-dashed border-gray-300 rounded-md text-center text-gray-500">
                Aucun point défini. Cliquez sur la carte pour ajouter votre
                premier point.
              </div>
            ) : (
              <ul className="list-none p-0 m-0 space-y-2">
                {points.map((point, index) => {
                  const pointType =
                    pointTypes.find((pt) => pt.value === point.type) ||
                    pointTypes[4];
                  return (
                    <li
                      key={index}
                      className="flex border-b border-gray-200 py-3"
                    >
                      <div className="flex items-center mr-3">
                        <div
                          className="flex items-center justify-center h-6 w-8 bg-gray-200 rounded-full text-gray-700 mr-1"
                        >
                          {index + 1}
                        </div>
                        <div
                          className="h-6 w-8 rounded-full flex items-center justify-center text-white"
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
                      <div className="flex flex-shrink-0 ml-2">
                        <Button
                          icon="pi pi-arrow-up"
                          className="p-1 mx-1 rounded border hover:bg-gray-50 text-gray-700 bg-white"
                          disabled={index === 0}
                          onClick={() => movePointUp(point.position)}
                        />
                        <Button
                          icon="pi pi-arrow-down"
                          className="p-1 mx-1 rounded border hover:bg-gray-50 text-gray-700 bg-white"
                          disabled={index === points.length - 1}
                          onClick={() => movePointDown(point.position)}
                        />
                        <Button
                          icon="pi pi-pencil"
                          className="p-1 mx-1 text-green-700 hover:bg-green-50 rounded border bg-white"
                          onClick={() => openEditPointDialog(point)}
                        />
                        <Button
                          icon="pi pi-trash"
                          className="p-1 mx-1 text-red-600 hover:bg-red-50 rounded border bg-white"
                          onClick={(e) => deletePoint(point.position, e)}
                        />
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
          className={`bg-green-800 rounded-lg text-white h-11 w-13`}
          aria-label={isPanelVisible ? "Masquer le panneau" : "Afficher le panneau"}
          onClick={() => setIsPanelVisible(!isPanelVisible)}
        />
      </div>

      <Dialog
        visible={addPointDialogVisible}
        onHide={() => setAddPointDialogVisible(false)}
        header="Ajouter un point"
        className="w-full max-w-lg z-30"
        headerClassName="p-3 bg-gray-50 border-b border-gray-200"
        modal
        footer={
          <div className="flex justify-between p-3">
            <Button
              label="Annuler"
              icon="pi pi-times"
              className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-100 gap-2"
              onClick={() => setAddPointDialogVisible(false)}
            />
            <Button 
              label="Ajouter" 
              icon="pi pi-check" 
              onClick={addPoint}
              className="bg-green-800 text-white px-4 py-2 rounded-md hover:bg-green-700 gap-2" 
            />
          </div>
        }
      >
        <div className="p-3">
          <div className="mb-4">
            <label htmlFor="libelle" className="font-bold block mb-2 text-green-700">
              Libellé
            </label>
            <InputText
              id="libelle"
              value={tempPoint?.libelle || ""}
              onChange={(e) =>
                setTempPoint((prev) =>
                  prev ? { ...prev, libelle: e.target.value } : null
                )
              }
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="font-bold block mb-2 text-green-700">
              Description
            </label>
            <InputText
              id="description"
              value={tempPoint?.description || ""}
              onChange={(e) =>
                setTempPoint((prev) =>
                  prev ? { ...prev, description: e.target.value } : null
                )
              }
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="type" className="font-bold block mb-2 text-green-700">
              Type de point
            </label>
            <Dropdown
              id="type"
              value={tempPoint?.type || "information"}
              options={pointTypes}
              onChange={(e) =>
                setTempPoint((prev) =>
                  prev ? { ...prev, type: e.value } : null
                )
              }
              optionLabel="label"
              className="w-full border rounded-md p-1"
              panelClassName="border rounded-md shadow-lg"
              itemTemplate={(option) => (
                <div className="flex items-center p-2 cursor-pointer hover:bg-gray-100">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white mr-2"
                    style={{ backgroundColor: option.color }}
                  >
                    <i
                      className={
                        option.value === "depart"
                          ? "pi pi-flag"
                          : option.value === "stop"
                          ? "pi pi-stop"
                          : option.value === "attention"
                          ? "pi pi-exclamation-triangle"
                          : option.value === "tournant"
                          ? "pi pi-arrow-right"
                          : option.value === "arrivee"
                          ? "pi pi-check-circle"
                          : "pi pi-info-circle"
                      }
                    ></i>
                  </div>
                  <span>{option.label}</span>
                </div>
              )}
              valueTemplate={(option) => {
                const selectedOption =
                  typeof option === "string"
                    ? pointTypes.find((pt) => pt.value === option)
                    : option;

                if (!selectedOption) return <span>Sélectionnez un type</span>;

                return (
                  <div className="flex items-center">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white mr-2"
                      style={{ backgroundColor: selectedOption.color }}
                    >
                      <i
                        className={
                          selectedOption.value === "depart"
                            ? "pi pi-flag"
                            : selectedOption.value === "stop"
                            ? "pi pi-stop"
                            : selectedOption.value === "attention"
                            ? "pi pi-exclamation-triangle"
                            : selectedOption.value === "tournant"
                            ? "pi pi-arrow-right"
                            : selectedOption.value === "arrivee"
                            ? "pi pi-check-circle"
                            : "pi pi-info-circle"
                        }
                      ></i>
                    </div>
                    <span>{selectedOption.label}</span>
                  </div>
                );
              }}
            />
          </div>
          <div className="mb-4">
            <label className="font-bold block mb-2 text-green-700">Coordonnées</label>
            <div className="flex gap-2">
              <div className="w-1/2">
                <InputText
                  value={tempPoint?.latitude?.toFixed(6) || ""}
                  disabled
                  placeholder="Latitude"
                  className="w-full p-2 border rounded-md bg-gray-100"
                />
              </div>
              <div className="w-1/2">
                <InputText
                  value={tempPoint?.longitude?.toFixed(6) || ""}
                  disabled
                  placeholder="Longitude"
                  className="w-full p-2 border rounded-md bg-gray-100"
                />
              </div>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Dialogue pour éditer un point existant */}
      <Dialog
        visible={editPointDialogVisible}
        onHide={() => setEditPointDialogVisible(false)}
        header="Modifier le point"
        className="w-full max-w-lg z-30"
        headerClassName="p-3 bg-gray-50 border-b border-gray-200"
        contentClassName="p-0"
        modal
        footer={
          <div className="flex justify-between p-3">
            <Button
              label="Annuler"
              icon="pi pi-times"
              className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-100 gap-2"
              onClick={() => setEditPointDialogVisible(false)}
            />
            <Button
              label="Enregistrer"
              icon="pi pi-check"
              onClick={updatePoint}
              className="bg-green-800 text-white px-4 py-2 rounded-md hover:bg-green-700 gap-2"
            />
          </div>
        }
      >
        <div className="p-3">
          <div className="mb-4">
            <label htmlFor="edit-libelle" className="font-bold block mb-2 text-green-700">
              Libellé
            </label>
            <InputText
              id="edit-libelle"
              value={editingPoint?.libelle || ""}
              onChange={(e) =>
                setEditingPoint((prev) =>
                  prev ? { ...prev, libelle: e.target.value } : null
                )
              }
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="edit-description" className="font-bold block mb-2 text-green-700">
              Description
            </label>
            <InputText
              id="edit-description"
              value={editingPoint?.description || ""}
              onChange={(e) =>
                setEditingPoint((prev) =>
                  prev ? { ...prev, description: e.target.value } : null
                )
              }
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="edit-type" className="font-bold block mb-2 text-green-700">
              Type de point
            </label>
            <Dropdown
              id="edit-type"
              value={editingPoint?.type || "information"}
              options={pointTypes}
              onChange={(e) =>
                setEditingPoint((prev) =>
                  prev ? { ...prev, type: e.value } : null
                )
              }
              optionLabel="label"
              className="w-full border rounded-md p-1"
              panelClassName="border rounded-md shadow-lg"
              itemTemplate={(option) => (
                <div className="flex items-center p-2 cursor-pointer hover:bg-gray-100">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white mr-2"
                    style={{ backgroundColor: option.color }}
                  >
                    <i
                      className={
                        option.value === "depart"
                          ? "pi pi-flag"
                          : option.value === "stop"
                          ? "pi pi-stop"
                          : option.value === "attention"
                          ? "pi pi-exclamation-triangle"
                          : option.value === "tournant"
                          ? "pi pi-arrow-right"
                          : option.value === "arrivee"
                          ? "pi pi-check-circle"
                          : "pi pi-info-circle"
                      }
                    ></i>
                  </div>
                  <span>{option.label}</span>
                </div>
              )}
              valueTemplate={(value) => {
                const option =
                  pointTypes.find((pt) => pt.value === value) || pointTypes[4];
                return (
                  <div className="flex items-center">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white mr-2"
                      style={{ backgroundColor: option.color }}
                    >
                      <i
                        className={
                          option.value === "depart"
                            ? "pi pi-flag"
                            : option.value === "stop"
                            ? "pi pi-stop"
                            : option.value === "attention"
                            ? "pi pi-exclamation-triangle"
                            : option.value === "tournant"
                            ? "pi pi-arrow-right"
                            : option.value === "arrivee"
                            ? "pi pi-check-circle"
                            : "pi pi-info-circle"
                        }
                      ></i>
                    </div>
                    <span>{option.label}</span>
                  </div>
                );
              }}
            />
          </div>
          <div className="mb-4">
            <label className="font-bold block mb-2 text-green-700">Coordonnées</label>
            <div className="flex gap-2">
              <div className="w-1/2">
                <InputText
                  value={editingPoint?.latitude?.toFixed(6) || ""}
                  disabled
                  placeholder="Latitude"
                  className="w-full p-2 border rounded-md bg-gray-100"
                />
              </div>
              <div className="w-1/2">
                <InputText
                  value={editingPoint?.longitude?.toFixed(6) || ""}
                  disabled
                  placeholder="Longitude"
                  className="w-full p-2 border rounded-md bg-gray-100"
                />
              </div>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Dialog de confirmation de suppression personnalisé */}
      <ConfirmationDialog
        visible={confirmDeleteVisible}
        onHide={() => setConfirmDeleteVisible(false)}
        onConfirm={confirmDeletePoint}
        title="Confirmation de suppression"
        message="Êtes-vous sûr de vouloir supprimer ce point ? Cette action ne peut pas être annulée."
        confirmLabel="Supprimer"
        confirmIcon="pi pi-trash"
        severity="danger"
      />
    </div>
  );
};

export default CircuitEditionPage;