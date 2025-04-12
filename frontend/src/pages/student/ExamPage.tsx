// pages/ExamPage.tsx
import React, { useState } from "react";
import { CSSTransition } from "react-transition-group";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import HomePageTopBar from "../../components/utils/HomePageTopBar";
import { Chip } from "primereact/chip";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import "../../assets/css/ExamPage.css";

// Icône pour les points du circuit
const pointIcon = new L.Icon({
  iconUrl: "https://i.postimg.cc/FFJWRnMS/point-map.png",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
});

// Composant ExamPage
const ExamPage: React.FC = () => {
  // Position par défaut (Paris)
  const defaultPosition: [number, number] = [48.8566, 2.3522];

  const [expandedCircuits, setExpandedCircuits] = useState<string[]>([]);

  // État pour le modal
  const [circuitModalVisible, setCircuitModalVisible] = useState<boolean>(false);

  // Liste des centres favoris en dur
  const centresFavoris = ["Centre 1", "Centre 2", "Centre 3"];

  // Données en dur pour les circuits avec ajout des créateurs
  const circuitsData: { 
    [key: string]: { 
      nom: string; 
      description: string; 
      createur: string;
      points: { latitude: number; longitude: number; description: string }[] 
    }[] 
  } = {
    "Centre 1": [
      {
        nom: "Circuit N° 1",
        description: "Circuit facile autour du centre 1",
        createur: "Jean Baptiste Bernard",
        points: [
          { latitude: 48.8566, longitude: 2.3522, description: "Point de départ" },
          { latitude: 48.8586, longitude: 2.3542, description: "Virage à droite" },
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
    "Centre 2": [
      {
        nom: "Circuit N° 3",
        description: "Circuit difficile autour du centre 2",
        createur: "Jordan MAN",
        points: [
          { latitude: 48.8466, longitude: 2.3422, description: "Départ" },
          { latitude: 48.8486, longitude: 2.3442, description: "Virage serré" },
          { latitude: 48.8506, longitude: 2.3402, description: "Arrivée" },
        ],
      },
      {
        nom: "Circuit N° 4",
        description: "Circuit rapide autour du centre 2",
        createur: "Sophie PANINI",
        points: [
          { latitude: 48.8466, longitude: 2.3422, description: "Départ" },
          { latitude: 48.8486, longitude: 2.3442, description: "Virage serré" },
          { latitude: 48.8506, longitude: 2.3402, description: "Arrivée" },
        ],
      },
    ],
    "Centre 3": [
      {
        nom: "Circuit N° 5",
        description: "Circuit rapide autour du centre 3",
        createur: "Paul GASTON",
        points: [
          { latitude: 48.8666, longitude: 2.3622, description: "Départ" },
          { latitude: 48.8686, longitude: 2.3642, description: "Point intermédiaire" },
          { latitude: 48.8706, longitude: 2.3602, description: "Fin" },
        ],
      },
    ],
  };

  // État pour le centre sélectionné (par défaut : Centre 1)
  const [selectedCentre, setSelectedCentre] = useState<string>("Centre 1");

  // État pour le circuit sélectionné (par défaut : premier circuit du centre sélectionné)
  const [selectedCircuit, setSelectedCircuit] = useState<string>(circuitsData["Centre 1"][0].nom);

  // Mettre à jour le circuit sélectionné quand le centre change
  const handleCentreChange = (centre: string) => {
    setSelectedCentre(centre);
    setSelectedCircuit(circuitsData[centre][0].nom); // Sélectionne le premier circuit du nouveau centre
  };

  // Fonction pour gérer l'expansion/réduction des circuits
  const toggleCircuitExpansion = (circuitNom: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Empêche le déclenchement de la sélection du circuit
    
    if (expandedCircuits.includes(circuitNom)) {
      setExpandedCircuits(expandedCircuits.filter(name => name !== circuitNom));
    } else {
      setExpandedCircuits([...expandedCircuits, circuitNom]);
    }
  };

  // Fonction pour sélectionner un circuit et fermer le modal
  const handleCircuitSelection = (circuitNom: string) => {
    setSelectedCircuit(circuitNom);
    setCircuitModalVisible(false);
  };

  // Points du circuit sélectionné pour affichage sur la carte
  const currentCircuit = (() => {
    for (const centre in circuitsData) {
      const found = circuitsData[centre].find(circuit => circuit.nom === selectedCircuit);
      if (found) return found;
    }
    return circuitsData[selectedCentre][0];
  })();
  
  const circuitPoints = currentCircuit ? currentCircuit.points : [];
  const polylinePositions = circuitPoints.map((point) => [point.latitude, point.longitude] as [number, number]);

  return (
    <div className="map-wrapper">
      <HomePageTopBar /> {/* Barre de recherche et top bar */}

      {/* Sélection des centres favoris avec Chip */}
      <div className="centres-chips">
        {centresFavoris.map((centre, index) => (
          <Chip
            key={index}
            label={centre}
            className={`p-chip ${selectedCentre === centre ? "p-chip-selected" : ""}`}
            onClick={() => handleCentreChange(centre)}
          />
        ))}
      </div>

      <MapContainer
        center={defaultPosition}
        zoom={13}
        className="map"
        zoomControl={false}
      >
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
            color="blue"
            weight={4}
            opacity={0.7}
          />
        )}
      </MapContainer>

      {/* Bouton pour ouvrir le modal de sélection de circuit */}
      <div className="circuit-selector-button">
        <Button 
          icon="pi pi-list" 
          className="p-button-rounded p-button-info" 
          onClick={() => setCircuitModalVisible(true)}
          tooltip="Voir les circuits"
          tooltipOptions={{ position: 'top' }}
        />
      </div>

      {/* Modal de sélection de circuit style maquette */}
      <Dialog
        visible={circuitModalVisible}
        onHide={() => setCircuitModalVisible(false)}
        position="bottom"
        modal
        showHeader={false}
        closeOnEscape={true}
        dismissableMask={true}
        contentClassName="circuit-modal-content"
        className="circuit-modal"
        transitionOptions={{ timeout: 400 }}
      >
        <div className="circuit-list">
          <div className="circuit-modal-header">
            <i className="pi pi-heart" style={{ color: 'blue' }}></i>
            <Button 
              icon="pi pi-times" 
              className="p-button-text" 
              onClick={() => setCircuitModalVisible(false)} 
            />
          </div>
          
          {/* Afficher uniquement les circuits du centre sélectionné */}
          {circuitsData[selectedCentre].map((circuit, index) => (
          <div 
            key={index} 
            className={`circuit-item ${selectedCircuit === circuit.nom ? 'selected' : ''}`}
            onClick={() => handleCircuitSelection(circuit.nom)}
          >
            <div className="circuit-item-content">
              <div className="circuit-item-title">
                {circuit.nom}
              </div>
              <div className="circuit-item-info">
                <Avatar icon="pi pi-user" className="p-mr-2" />
                <span className="circuit-creator">{circuit.createur}</span>
              </div>
              {selectedCircuit === circuit.nom && (
                <span className="circuit-applied">appliqué <i className="pi pi-check-circle"></i></span>
              )}
              <i 
                className={`pi ${expandedCircuits.includes(circuit.nom) ? 'pi-chevron-up' : 'pi-chevron-down'} circuit-expand-icon`}
                onClick={(e) => toggleCircuitExpansion(circuit.nom, e)}
              ></i>
            </div>
            
            {/* Liste des points avec animation */}
            <CSSTransition
              in={expandedCircuits.includes(circuit.nom)}
              timeout={300}
              classNames="circuit-points"
              unmountOnExit
            >
              <div className="circuit-points-list">
                {circuit.points.map((point, pointIndex) => (
                  <div key={pointIndex} className="circuit-point-item">
                    <span className="point-number">{pointIndex + 1}</span>
                    <i className="pi pi-map-marker point-icon"></i>
                    <span className="point-description">{point.description}</span>
                  </div>
                ))}
              </div>
            </CSSTransition>
          </div>
        ))}
        </div>
      </Dialog>
    </div>
  );
};

export default ExamPage;