import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toolbar } from "primereact/toolbar";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import HomePageTopBar from "../../components/utils/HomePageTopBar";
import {
  getRequest,
  postRequest,
  patchRequest,
} from "../../interfaces/utils/api";

// Interface pour les types de points
interface PointType {
  value: string;
  label: string;
  icon: string;
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
}

// Interface pour le circuit
interface Circuit {
  id: number;
  libelle: string;
  description?: string;
  ville_centre: {
    id: number;
    libelle: string;
    code_postal?: string;
  };
  points: string[]; // URIs des points
}

// Interface pour la réponse d'une ville
interface VilleResponse {
  id: number;
  libelle: string;
  code_postal?: string;
  latitude: string;
  longitude: string;
}

// Interface pour la réponse d'un point
interface PointResponse {
  id: number;
  libelle: string;
  description?: string;
  latitude: string;
  longitude: string;
  type?: string;
  circuit: string; // URI du circuit
}

// Types de points disponibles
const pointTypes: PointType[] = [
  {
    value: "depart",
    label: "Départ",
    icon: "https://i.postimg.cc/RVdx9WBK/start-flag.png",
  },
  {
    value: "stop",
    label: "Arrêt",
    icon: "https://i.postimg.cc/DZtsXcGx/stop-sign.png",
  },
  {
    value: "attention",
    label: "Attention",
    icon: "https://i.postimg.cc/BbHHpYLf/warning.png",
  },
  {
    value: "tournant",
    label: "Tournant",
    icon: "https://i.postimg.cc/wjc3HDCY/turn.png",
  },
  {
    value: "information",
    label: "Information",
    icon: "https://i.postimg.cc/QNDtGhmr/info.png",
  },
  {
    value: "arrivee",
    label: "Arrivée",
    icon: "https://i.postimg.cc/yNsd7fXj/finish-flag.png",
  },
];

// Fonction pour créer une icône Leaflet
const createIcon = (iconUrl: string) => {
  return new L.Icon({
    iconUrl,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
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
  const mapRef = useRef<L.Map | null>(null);

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

  // Chargement des données du circuit
  useEffect(() => {
    const fetchCircuit = async () => {
      if (!id) return;

      try {
        // Récupérer les données du circuit
        const circuitData = await getRequest<Circuit>(`/circuits/${id}`);

        // Traiter les données du circuit
        setCircuit({
          id: circuitData.id,
          libelle: circuitData.libelle,
          description: circuitData.description,
          ville_centre: circuitData.ville_centre,
          points: circuitData.points || [],
        });

        // Récupérer les points associés
        if (circuitData.points && circuitData.points.length > 0) {
          const pointsData = await Promise.all(
            circuitData.points.map((pointUrl: string) => {
              // Extraire l'ID du point depuis l'URL
              const pointId = pointUrl.split("/").pop();
              return getRequest<PointResponse>(`/points/${pointId}`);
            })
          );

          const formattedPoints = pointsData.map(
            (point: PointResponse, idx: number) => ({
              id: point.id,
              libelle: point.libelle,
              description: point.description,
              latitude: parseFloat(point.latitude),
              longitude: parseFloat(point.longitude),
              type: point.type || "information",
              position: idx,
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
            // Récupérer les coordonnées de la ville
            const villeCentreId =
              typeof circuitData.ville_centre === "object"
                ? circuitData.ville_centre.id
                : "0";

            if (villeCentreId) {
              const villeData = await getRequest<VilleResponse>(
                `/villes/${villeCentreId}`
              );
              setMapCenter([
                parseFloat(villeData.latitude),
                parseFloat(villeData.longitude),
              ]);
            }
          }
        } else if (circuitData.ville_centre) {
          // Récupérer les coordonnées de la ville
          const villeCentreId =
            typeof circuitData.ville_centre === "object"
              ? circuitData.ville_centre.id
              : "0";

          if (villeCentreId) {
            const villeData = await getRequest<VilleResponse>(
              `/villes/${villeCentreId}`
            );
            setMapCenter([
              parseFloat(villeData.latitude),
              parseFloat(villeData.longitude),
            ]);
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement du circuit:", error);
        toast.current?.show({
          severity: "error",
          summary: "Erreur",
          detail: "Impossible de charger les données du circuit",
          life: 3000,
        });
        setIsLoading(false);
      }
    };

    fetchCircuit();
  }, [id]);

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

    const newPoint = { ...tempPoint };
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
  const deletePoint = (position: number) => {
    confirmDialog({
      message: "Êtes-vous sûr de vouloir supprimer ce point ?",
      header: "Confirmation de suppression",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: () => {
        // Supprimer le point et réorganiser les positions
        const filteredPoints = points.filter((p) => p.position !== position);
        const reorderedPoints = filteredPoints.map((p, idx) => ({
          ...p,
          position: idx,
          libelle: p.libelle.startsWith("Point ")
            ? `Point ${idx + 1}`
            : p.libelle,
        }));

        setPoints(reorderedPoints);

        toast.current?.show({
          severity: "success",
          summary: "Point supprimé",
          detail: "Le point a été supprimé du circuit",
          life: 1500,
        });
      },
    });
  };

  // Réorganiser les points (monter un point dans la liste)
  const movePointUp = (position: number) => {
    if (position <= 0) return;

    const newPoints = [...points];
    const temp = newPoints[position - 1];
    newPoints[position - 1] = {
      ...newPoints[position],
      position: position - 1,
    };
    newPoints[position] = { ...temp, position: position };

    setPoints(newPoints);
  };

  // Réorganiser les points (descendre un point dans la liste)
  const movePointDown = (position: number) => {
    if (position >= points.length - 1) return;

    const newPoints = [...points];
    const temp = newPoints[position + 1];
    newPoints[position + 1] = {
      ...newPoints[position],
      position: position + 1,
    };
    newPoints[position] = { ...temp, position: position };

    setPoints(newPoints);
  };

  // Enregistrer les modifications du circuit
  const saveCircuit = async () => {
    if (!circuit || !id) return;

    setIsSaving(true);

    try {
      // Mettre à jour les points existants et créer les nouveaux
      for (const point of points) {
        const pointData = {
          libelle: point.libelle,
          description: point.description || "",
          latitude: point.latitude.toString(),
          longitude: point.longitude.toString(),
          type: point.type,
          circuit: `/api/circuits/${id}`,
        };

        if (point.id) {
          // Point existant à mettre à jour
          await patchRequest<PointResponse, typeof pointData>(
            `/points/${point.id}`,
            pointData
          );
        } else {
          // Nouveau point à créer
          await postRequest<PointResponse, typeof pointData>(
            "/points",
            pointData
          );
        }
      }

      toast.current?.show({
        severity: "success",
        summary: "Circuit sauvegardé",
        detail: "Les modifications ont été enregistrées avec succès",
        life: 3000,
      });

      setIsSaving(false);
      // Actualiser la page pour voir les changements
      window.location.reload();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du circuit:", error);
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Impossible d'enregistrer les modifications",
        life: 3000,
      });
      setIsSaving(false);
    }
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
        <Button
          label={
            isDraggingEnabled
              ? "Désactiver le déplacement"
              : "Activer le déplacement"
          }
          icon={isDraggingEnabled ? "pi pi-lock" : "pi pi-pencil"}
          className={`p-button-outlined ${
            isDraggingEnabled ? "p-button-warning" : "p-button-help"
          }`}
          onClick={() => setIsDraggingEnabled(!isDraggingEnabled)}
        />
      </div>
    );
  };

  const rightToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          label="Enregistrer"
          icon="pi pi-save"
          loading={isSaving}
          onClick={saveCircuit}
        />
      </div>
    );
  };

  // Trouver l'icône correspondant au type de point
  const getPointIcon = (type: string) => {
    const pointType = pointTypes.find((pt) => pt.value === type);
    return createIcon(pointType?.icon || pointTypes[4].icon); // Fallback sur l'icône d'information
  };

  if (isLoading) {
    return (
      <div className="flex flex-column align-items-center justify-content-center min-h-screen">
        <ProgressSpinner />
        <div className="mt-3">Chargement du circuit...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-column min-h-screen">
      <Toast ref={toast} />
      <ConfirmDialog />
      <HomePageTopBar />

      <div className="p-3">
        <Toolbar
          left={leftToolbarTemplate}
          right={rightToolbarTemplate}
          className="mb-3"
        />

        <div className="grid">
          <div className="col-12 md:col-8">
            <div className="card shadow-4 p-0" style={{ height: "70vh" }}>
              <MapContainer
                center={mapCenter}
                zoom={15}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Gestionnaire d'événements de carte */}
                <MapEventHandler onMapClick={handleMapClick} />

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
                      <div>
                        <h3>{point.libelle}</h3>
                        <p>{point.description}</p>
                        <div className="flex justify-content-between mt-2">
                          <Button
                            icon="pi pi-pencil"
                            className="p-button-sm p-button-outlined"
                            onClick={() => openEditPointDialog(point)}
                          />
                          <Button
                            icon="pi pi-trash"
                            className="p-button-sm p-button-outlined p-button-danger"
                            onClick={() => deletePoint(point.position)}
                          />
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {/* Polyline pour relier les points */}
                {points.length > 1 && (
                  <Polyline
                    positions={points.map((p) => [p.latitude, p.longitude])}
                    color="var(--primary-color)"
                    weight={3}
                    opacity={0.7}
                  />
                )}
              </MapContainer>
            </div>
          </div>

          <div className="col-12 md:col-4">
            <div className="card shadow-4">
              <h3 className="border-bottom-1 border-300 pb-2">
                {circuit?.libelle}
                <div className="text-sm text-500 mt-1">
                  {circuit?.ville_centre?.libelle}{" "}
                  {circuit?.ville_centre?.code_postal &&
                    `(${circuit.ville_centre.code_postal})`}
                </div>
              </h3>

              <div className="mt-3">
                <h4>Points du circuit</h4>
                <p className="text-sm text-500">
                  {points.length} points - cliquez sur la carte pour ajouter un
                  nouveau point
                </p>

                {points.length === 0 ? (
                  <div className="p-3 border-1 border-dashed border-300 text-center text-500">
                    Aucun point défini. Cliquez sur la carte pour ajouter votre
                    premier point.
                  </div>
                ) : (
                  <ul className="list-none p-0 m-0">
                    {points.map((point, index) => (
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
                        <img
                          src={
                            pointTypes.find((pt) => pt.value === point.type)
                              ?.icon
                          }
                          alt={point.type}
                          className="mr-2"
                          style={{ width: "24px", height: "24px" }}
                        />
                        <div className="flex-grow-1">
                          <div className="font-medium">{point.libelle}</div>
                          <div className="text-xs text-500">
                            {point.description
                              ? point.description.slice(0, 30) +
                                (point.description.length > 30 ? "..." : "")
                              : "Pas de description"}
                          </div>
                        </div>
                        <div className="flex">
                          <Button
                            icon="pi pi-arrow-up"
                            className="p-button-text p-button-sm mr-1"
                            disabled={index === 0}
                            onClick={() => movePointUp(point.position)}
                            tooltip="Monter"
                            tooltipOptions={{ position: "left" }}
                          />
                          <Button
                            icon="pi pi-arrow-down"
                            className="p-button-text p-button-sm mr-1"
                            disabled={index === points.length - 1}
                            onClick={() => movePointDown(point.position)}
                            tooltip="Descendre"
                            tooltipOptions={{ position: "left" }}
                          />
                          <Button
                            icon="pi pi-pencil"
                            className="p-button-text p-button-sm mr-1"
                            onClick={() => openEditPointDialog(point)}
                            tooltip="Modifier"
                            tooltipOptions={{ position: "left" }}
                          />
                          <Button
                            icon="pi pi-trash"
                            className="p-button-text p-button-sm p-button-danger"
                            onClick={() => deletePoint(point.position)}
                            tooltip="Supprimer"
                            tooltipOptions={{ position: "left" }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogue pour ajouter un nouveau point */}
      <Dialog
        visible={addPointDialogVisible}
        onHide={() => setAddPointDialogVisible(false)}
        header="Ajouter un point"
        style={{ width: "450px" }}
        modal
        footer={
          <div>
            <Button
              label="Annuler"
              icon="pi pi-times"
              className="p-button-text"
              onClick={() => setAddPointDialogVisible(false)}
            />
            <Button label="Ajouter" icon="pi pi-check" onClick={addPoint} />
          </div>
        }
      >
        <div className="p-fluid">
          <div className="field mb-4">
            <label htmlFor="libelle" className="font-bold block mb-2">
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
            />
          </div>
          <div className="field mb-4">
            <label htmlFor="description" className="font-bold block mb-2">
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
            />
          </div>
          <div className="field mb-4">
            <label htmlFor="type" className="font-bold block mb-2">
              Type de point
            </label>
            <Dropdown
              id="type"
              value={tempPoint?.type}
              options={pointTypes}
              onChange={(e) =>
                setTempPoint((prev) =>
                  prev ? { ...prev, type: e.value } : null
                )
              }
              optionLabel="label"
              itemTemplate={(option) => (
                <div className="flex align-items-center">
                  <img
                    src={option.icon}
                    alt={option.label}
                    className="mr-2"
                    style={{ width: "24px", height: "24px" }}
                  />
                  <span>{option.label}</span>
                </div>
              )}
              valueTemplate={(option) => (
                <div className="flex align-items-center">
                  {option && (
                    <>
                      <img
                        src={pointTypes.find((pt) => pt.value === option)?.icon}
                        alt={option}
                        className="mr-2"
                        style={{ width: "24px", height: "24px" }}
                      />
                      <span>
                        {pointTypes.find((pt) => pt.value === option)?.label}
                      </span>
                    </>
                  )}
                </div>
              )}
            />
          </div>
          <div className="field mb-4">
            <label className="font-bold block mb-2">Coordonnées</label>
            <div className="flex gap-2">
              <div className="flex-1">
                <InputText
                  value={tempPoint?.latitude.toFixed(6) || ""}
                  disabled
                  placeholder="Latitude"
                />
              </div>
              <div className="flex-1">
                <InputText
                  value={tempPoint?.longitude.toFixed(6) || ""}
                  disabled
                  placeholder="Longitude"
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
        style={{ width: "450px" }}
        modal
        footer={
          <div>
            <Button
              label="Annuler"
              icon="pi pi-times"
              className="p-button-text"
              onClick={() => setEditPointDialogVisible(false)}
            />
            <Button
              label="Enregistrer"
              icon="pi pi-check"
              onClick={updatePoint}
            />
          </div>
        }
      >
        <div className="p-fluid">
          <div className="field mb-4">
            <label htmlFor="edit-libelle" className="font-bold block mb-2">
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
            />
          </div>
          <div className="field mb-4">
            <label htmlFor="edit-description" className="font-bold block mb-2">
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
            />
          </div>
          <div className="field mb-4">
            <label htmlFor="edit-type" className="font-bold block mb-2">
              Type de point
            </label>
            <Dropdown
              id="edit-type"
              value={editingPoint?.type}
              options={pointTypes}
              onChange={(e) =>
                setEditingPoint((prev) =>
                  prev ? { ...prev, type: e.value } : null
                )
              }
              optionLabel="label"
              itemTemplate={(option) => (
                <div className="flex align-items-center">
                  <img
                    src={option.icon}
                    alt={option.label}
                    className="mr-2"
                    style={{ width: "24px", height: "24px" }}
                  />
                  <span>{option.label}</span>
                </div>
              )}
              valueTemplate={(option) => (
                <div className="flex align-items-center">
                  {option && (
                    <>
                      <img
                        src={pointTypes.find((pt) => pt.value === option)?.icon}
                        alt={option}
                        className="mr-2"
                        style={{ width: "24px", height: "24px" }}
                      />
                      <span>
                        {pointTypes.find((pt) => pt.value === option)?.label}
                      </span>
                    </>
                  )}
                </div>
              )}
            />
          </div>
          <div className="field mb-4">
            <label className="font-bold block mb-2">Coordonnées</label>
            <div className="flex gap-2">
              <div className="flex-1">
                <InputText
                  value={editingPoint?.latitude.toFixed(6) || ""}
                  disabled
                  placeholder="Latitude"
                />
              </div>
              <div className="flex-1">
                <InputText
                  value={editingPoint?.longitude.toFixed(6) || ""}
                  disabled
                  placeholder="Longitude"
                />
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default CircuitEditionPage;
