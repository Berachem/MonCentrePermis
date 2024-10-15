import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import './App.css';

// Définir une icône par défaut pour les marqueurs
const DefaultIcon = L.icon({
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  iconAnchor: [12, 41],
});

function ClickableMap({ addPoint }) {
  useMapEvents({
    click(e) {
      addPoint(e.latlng);
    },
  });
  return null;
}

function App() {
  const [points, setPoints] = useState([]);
  const [routingControl, setRoutingControl] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [isRouting, setIsRouting] = useState(false);

  const addPoint = (latlng) => {
    setPoints((prevPoints) => [...prevPoints, latlng]);
  };

  const calculerItineraire = () => {
    if (points.length < 2) {
      alert("Veuillez sélectionner au moins deux points pour calculer un itinéraire.");
      return;
    }

    if (!mapInstance) {
      console.log(mapInstance)
      console.error("Map instance is not available.");
      return;
    }

    // Supprimer l'ancien itinéraire s'il existe
    if (routingControl) {
      routingControl.remove();
    }
    
    // Créer un nouvel itinéraire avec Leaflet Routing Machine
    const waypoints = [...points, points[0]]; // Boucler en ajoutant le premier point à la fin
    const newRoutingControl = L.Routing.control({
      waypoints: waypoints.map((point) => L.latLng(point.lat, point.lng)),
      routeWhileDragging: true,
    }).addTo(mapInstance);

    // Mettre à jour l'état pour conserver le contrôle d'itinéraire
    setRoutingControl(newRoutingControl);
    setIsRouting(true);
  };

  const modifierItineraire = () => {
    if (routingControl) {
      routingControl.remove(); 
      setRoutingControl(null); 
      setIsRouting(false);
    }
  };

  const removePoint = (index) => {
    // Supprimer le point à l'index donné
    setPoints((prevPoints) => prevPoints.filter((_, idx) => idx !== index));
  };

  return (
    <div className="App">
      <h1>POC routing leaflet</h1>
      <MapContainer
        center={[48.8566, 2.3522]}
        zoom={13}
        className="map"
        whenReady={(map) => {
          setMapInstance(map.target);
          console.log("Map instance created:", map.target);
      }}
      >
        <TileLayer
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
        />
        <ClickableMap addPoint={addPoint} />
        {!isRouting && points.map((position, idx) => (
          <Marker
            key={idx}
            position={position}
            icon={DefaultIcon}
            eventHandlers={{ click: () => removePoint(idx) }}
          >
            <Tooltip direction="top" offset={[0, -20]} permanent className="custom-tooltip">
              Point {idx + 1}
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
      <button onClick={isRouting ? modifierItineraire : calculerItineraire}>
        {isRouting ? 'Modifier l\'itinéraire' : 'Calculer l\'itinéraire'}
      </button>
    </div>
  );
}

export default App;
