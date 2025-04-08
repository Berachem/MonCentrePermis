// pages/ExamPage.tsx
import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import HomePageTopBar from "../../components/utils/HomePageTopBar";
import { Chip } from "primereact/chip";
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

  // Liste des centres favoris en dur
  const centresFavoris = ["Centre 1", "Centre 2", "Centre 3"];

  // Données en dur pour les circuits
  const circuitsData: { [key: string]: { nom: string; description: string; points: { latitude: number; longitude: number; description: string }[] }[] } = {
    "Centre 1": [
      {
        nom: "Circuit A",
        description: "Circuit facile autour du centre 1",
        points: [
          { latitude: 48.8566, longitude: 2.3522, description: "Point de départ" },
          { latitude: 48.8586, longitude: 2.3542, description: "Virage à droite" },
          { latitude: 48.8606, longitude: 2.3502, description: "Arrivée" },
        ],
      },
      {
        nom: "Circuit B",
        description: "Circuit moyen autour du centre 1",
        points: [
          { latitude: 48.8566, longitude: 2.3522, description: "Départ" },
          { latitude: 48.8576, longitude: 2.3552, description: "Intersection" },
          { latitude: 48.8596, longitude: 2.3482, description: "Fin" },
        ],
      },
    ],
    "Centre 2": [
      {
        nom: "Circuit X",
        description: "Circuit difficile autour du centre 2",
        points: [
          { latitude: 48.8466, longitude: 2.3422, description: "Départ" },
          { latitude: 48.8486, longitude: 2.3442, description: "Virage serré" },
          { latitude: 48.8506, longitude: 2.3402, description: "Arrivée" },
        ],
      },
    ],
    "Centre 3": [
      {
        nom: "Circuit Z",
        description: "Circuit rapide autour du centre 3",
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

  // Points du circuit sélectionné pour affichage sur la carte
  const currentCircuit = circuitsData[selectedCentre].find(
    (circuit) => circuit.nom === selectedCircuit
  );
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

      {/* Sélection des circuits avec Chip */}
      <div className="circuits-chips">
        {circuitsData[selectedCentre].map((circuit, index) => (
          <Chip
            key={index}
            label={circuit.nom}
            className={`p-chip ${selectedCircuit === circuit.nom ? "p-chip-selected" : ""}`}
            onClick={() => setSelectedCircuit(circuit.nom)}
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
    </div>
  );
};

export default ExamPage;