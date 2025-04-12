// pages/ExamPage.tsx
import React, { useState, useEffect } from "react";
import { CSSTransition } from "react-transition-group";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import HomePageTopBar from "../../components/utils/HomePageTopBar";
import { Chip } from "primereact/chip";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import { useNavigate } from "react-router-dom";
import {
  CircuitsCollection,
  Circuit,
} from "../../interfaces/circuit.interface";
import { MapControls } from "../../components/utils/HomePageMap";

/**
 * Définition de l'icône pour les points du circuit
 */
const pointIcon = new L.Icon({
  iconUrl: "https://i.postimg.cc/FFJWRnMS/point-map.png",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
});

/**
 * Interface pour les props du composant MapView
 */
interface MapViewProps {
  center: [number, number];
}

/**
 * Composant pour centrer la vue de la carte
 */
const MapView: React.FC<MapViewProps> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);

  return null;
};

/**
 * Composant ExamPage pour afficher les circuits d'examen
 */
const ExamPage: React.FC = () => {
  // Détection du mode mobile
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 768);

  // Position par défaut (Paris)
  const defaultPosition: [number, number] = [48.8566, 2.3522];

  // État pour les circuits développés
  const [expandedCircuits, setExpandedCircuits] = useState<string[]>([]);

  // État pour la visibilité du modal
  const [circuitModalVisible, setCircuitModalVisible] =
    useState<boolean>(false);

  // Navigation
  const navigate = useNavigate();

  // Liste des centres d'examen disponibles
  const centresExamen = ["Noisy-Le-Grand"];

  // Données des circuits par centre d'examen
  const circuitsData: CircuitsCollection = {
    "Noisy-Le-Grand": [
      {
        nom: "Circuit N° 1",
        description: "Circuit facile autour du centre 1",
        createur: "Jean Baptiste Bernard",
        points: [
          {
            latitude: 48.8566,
            longitude: 2.3522,
            description: "Point de départ",
          },
          {
            latitude: 48.8586,
            longitude: 2.3542,
            description: "Virage à droite",
          },
          { latitude: 48.8606, longitude: 2.3502, description: "Arrivée" },
        ],
      },
      {
        nom: "Circuit N° 2",
        description: "Circuit moyen autour du centre 1",
        createur: "Kamel BEN",
        points: [
          { latitude: 48.8566, longitude: 2.3522, description: "Départ" },
          { latitude: 48.8576, longitude: 2.3552, description: "Intersection" },
          { latitude: 48.8596, longitude: 2.3482, description: "Fin" },
        ],
      },
    ],
  };

  // États pour le centre et le circuit sélectionnés
  const [selectedCentre, setSelectedCentre] = useState<string>(
    centresExamen[0]
  );
  const [selectedCircuit, setSelectedCircuit] = useState<string>("");
  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultPosition);

  // Effet pour initialiser le circuit par défaut
  useEffect(() => {
    if (selectedCentre && circuitsData[selectedCentre]?.length > 0) {
      setSelectedCircuit(circuitsData[selectedCentre][0].nom);
    }
  }, [selectedCentre]);

  // Effet pour mettre à jour le centre de la carte quand le circuit change
  useEffect(() => {
    const currentCircuit = findCurrentCircuit();
    if (currentCircuit && currentCircuit.points.length > 0) {
      // Centrer sur le premier point du circuit
      setMapCenter([
        currentCircuit.points[0].latitude,
        currentCircuit.points[0].longitude,
      ]);
    }
  }, [selectedCircuit]);

  // Effet pour gérer le redimensionnement de la fenêtre
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /**
   * Trouve le circuit actuellement sélectionné
   */
  const findCurrentCircuit = (): Circuit | null => {
    for (const centre in circuitsData) {
      const found = circuitsData[centre].find(
        (circuit) => circuit.nom === selectedCircuit
      );
      if (found) return found;
    }
    return circuitsData[selectedCentre]?.[0] || null;
  };

  /**
   * Change le centre d'examen sélectionné
   */
  const handleCentreChange = (centre: string) => {
    setSelectedCentre(centre);
    if (circuitsData[centre]?.length > 0) {
      setSelectedCircuit(circuitsData[centre][0].nom);
    }
  };

  /**
   * Bascule l'état d'expansion d'un circuit
   */
  const toggleCircuitExpansion = (
    circuitNom: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    setExpandedCircuits((prev) =>
      prev.includes(circuitNom)
        ? prev.filter((name) => name !== circuitNom)
        : [...prev, circuitNom]
    );
  };

  /**
   * Sélectionne un circuit et ferme le modal
   */
  const handleCircuitSelection = (circuitNom: string) => {
    setSelectedCircuit(circuitNom);
    setCircuitModalVisible(false);
  };

  // Récupération des données du circuit actuel
  const currentCircuit = findCurrentCircuit();
  const circuitPoints = currentCircuit?.points || [];
  const polylinePositions = circuitPoints.map(
    (point) => [point.latitude, point.longitude] as [number, number]
  );

  // Styles pour les composants
  const styles = {
    mapContainer: {
      position: "relative" as const,
      height: "100vh",
      width: "100%",
    },
    map: {
      position: "absolute" as const,
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      zIndex: 1,
    },
    chipContainer: {
      position: "absolute" as const,
      top: "10%",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 1000,
      display: "flex",
      justifyContent: "center",
      width: "100%",
    },
    buttonBase: {
      position: "fixed" as const,
      bottom: "30px",
      zIndex: 1000,
    },
    circuitSelectorButton: {
      position: "fixed" as const,
      bottom: "30px",
      left: "30px",
      zIndex: 1000,
    },
    homeButton: {
      position: "fixed" as const,
      bottom: "30px",
      right: "30px",
      zIndex: 1000,
    },
  };

  return (
    <div style={styles.mapContainer}>
      <HomePageTopBar />

      {/* Sélection des centres avec Chip */}
      <div
        style={styles.chipContainer}
        className="flex gap-2 justify-content-center"
      >
        <Button
          icon="pi pi-arrow-left"
          className="p-button-rounded shadow-4"
          onClick={() => navigate("/")}
          tooltip="Retour à l'accueil"
          tooltipOptions={{ position: "top" }}
        />
        {centresExamen.map((centre, index) => (
          <Chip
            key={index}
            label={centre}
            className={`cursor-pointer border-2 border-primary transition-colors transition-duration-300 hover:bg-primary hover:text-white ${
              selectedCentre === centre
                ? "bg-primary text-white"
                : "bg-surface-ground"
            }`}
            onClick={() => handleCentreChange(centre)}
          />
        ))}
      </div>

      <div style={styles.map}>
        <MapContainer
          center={defaultPosition}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <MapView center={mapCenter} />
          <MapControls userPos={defaultPosition} />
          <TileLayer
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Afficher les points du circuit */}
          {circuitPoints.map((point, index) => (
            <Marker
              key={index}
              position={[point.latitude, point.longitude]}
              icon={pointIcon}
            >
              <Popup>{point.description}</Popup>
            </Marker>
          ))}

          {/* Tracer le circuit avec une Polyline */}
          {polylinePositions.length > 1 && (
            <Polyline
              positions={polylinePositions}
              color="var(--primary-color)"
              weight={4}
              opacity={0.7}
            />
          )}
        </MapContainer>
      </div>

      {/* Bouton pour ouvrir le modal de sélection de circuit */}
      <div style={styles.circuitSelectorButton}>
        <Button
          icon="pi pi-flag"
          label={isMobile ? undefined : "Sélectionner un circuit"}
          className="p-button-rounded shadow-4"
          onClick={() => setCircuitModalVisible(true)}
          tooltip={isMobile ? "Sélectionner un circuit" : undefined}
          tooltipOptions={{ position: "top" }}
        />
      </div>

      {/* Modal de sélection de circuit */}
      <Dialog
        visible={circuitModalVisible}
        onHide={() => setCircuitModalVisible(false)}
        position="bottom"
        modal
        showHeader={false}
        closeOnEscape={true}
        dismissableMask={true}
        className="border-round-top-3xl mx-auto"
        style={{ width: "95vw", maxWidth: "1200px" }}
        transitionOptions={{ timeout: 400 }}
      >
        <div className="overflow-y-auto" style={{ maxHeight: "70vh" }}>
          <div className="flex justify-content-between align-items-center p-3 border-bottom-1 border-200">
            <h2 className="text-xl font-bold m-0">Sélectionner un circuit</h2>
            <Button
              icon="pi pi-times"
              className="p-button-text p-button-rounded text-white"
              onClick={() => setCircuitModalVisible(false)}
            />
          </div>

          {/* Liste des circuits disponibles */}
          {circuitsData[selectedCentre]?.map((circuit, index) => (
            <div
              key={index}
              className={`p-3 border-bottom-1 border-200 cursor-pointer transition-colors transition-duration-300 hover:surface-hover ${
                selectedCircuit === circuit.nom ? "bg-primary-50" : ""
              }`}
              onClick={() => handleCircuitSelection(circuit.nom)}
            >
              <div className="relative">
                <div className="font-medium mb-2 text-900">{circuit.nom}</div>
                <div className="flex align-items-center justify-content-between">
                  <div className="flex align-items-center">
                    <Avatar
                      icon="pi pi-user"
                      className="mr-2"
                      style={{
                        backgroundColor: "var(--primary-color)",
                        color: "#fff",
                      }}
                    />
                    <span className="text-600">{circuit.createur}</span>
                  </div>

                  <div className="flex align-items-center">
                    {selectedCircuit === circuit.nom && (
                      <span className="mr-2 font-medium flex align-items-center text-green-500">
                        appliqué <i className="pi pi-check-circle ml-1"></i>
                      </span>
                    )}
                    <i
                      className={`pi ${
                        expandedCircuits.includes(circuit.nom)
                          ? "pi-chevron-up"
                          : "pi-chevron-down"
                      } text-primary cursor-pointer p-1`}
                      onClick={(e) => toggleCircuitExpansion(circuit.nom, e)}
                    ></i>
                  </div>
                </div>
              </div>

              {/* Liste des points avec animation */}
              <CSSTransition
                in={expandedCircuits.includes(circuit.nom)}
                timeout={300}
                classNames={{
                  enter: "max-h-0 opacity-0 overflow-hidden",
                  enterActive:
                    "max-h-30rem opacity-100 transition-all transition-duration-300",
                  exit: "max-h-30rem opacity-100 overflow-hidden",
                  exitActive:
                    "max-h-0 opacity-0 transition-all transition-duration-300",
                }}
                unmountOnExit
              >
                <div className="mt-3 pt-2 border-top-1 border-100">
                  {circuit.points.map((point, pointIndex) => (
                    <div
                      key={pointIndex}
                      className="flex align-items-center py-2 ml-2"
                    >
                      <span
                        className="flex justify-content-center align-items-center border-circle w-2rem h-2rem mr-2 text-white text-xs font-medium"
                        style={{ backgroundColor: "var(--primary-color)" }}
                      >
                        {pointIndex + 1}
                      </span>
                      <i className="pi pi-map-marker text-primary mr-2"></i>
                      <span className="text-900">{point.description}</span>
                    </div>
                  ))}
                </div>
              </CSSTransition>
            </div>
          ))}

          {circuitsData[selectedCentre]?.length === 0 && (
            <div className="p-4 text-center text-500">
              Aucun circuit disponible pour ce centre.
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
};

export default ExamPage;
