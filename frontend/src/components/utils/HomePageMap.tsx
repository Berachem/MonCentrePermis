import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { SpeedDial } from 'primereact/speeddial';
import "leaflet/dist/leaflet.css";
import L from "leaflet"; 
import "../../assets/css/home-map.css";

// Icône personnalisée pour le marqueur de localisation de l'utilisateur
const userIcon = new L.Icon({
  iconUrl: "https://i.postimg.cc/FFJWRnMS/point-map.png",
  iconSize: [40, 41], // Taille de l'icône
  iconAnchor: [12, 41], // Ancre de l'icône (positionnement du point exact)
  popupAnchor: [1, -34], // Position du popup par rapport à l'icône
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png", // Ombre du marqueur
  shadowSize: [41, 41], // Taille de l'ombre
});

// Composant pour recenter la carte une fois que la position est récupérée
const RecenterMap = ({ position }: { position: [number, number] }) => {
  const map = useMap();
  map.setView(position, 13); // Recentrer sur la position de l'utilisateur avec un zoom de 13
  return null;
};

function HomePageMap ({blurred}: {blurred: boolean}) {
  const [position, setPosition] = useState<[number, number]>([48.8566, 2.3522]); // Position par défaut (Paris)
  const [userLocated, setUserLocated] = useState(false);
  const [tileLayerUrl, setTileLayerUrl] = useState("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"); // URL du style de la carte
  const markerRef = useRef(null); // Référence pour le marqueur

  // Obtenir la localisation de l'utilisateur
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        setUserLocated(true); // Activer la localisation de l'utilisateur
      },
      (err) => {
        console.error("Erreur lors de la récupération de la géolocalisation", err);
      }
    );
  }, []);

  useEffect(() => {
    // Ouvrir la popup automatiquement si la localisation de l'utilisateur est trouvée
    if (markerRef.current) {
      (markerRef.current as any).openPopup();
    }
  }, [userLocated]);

  // Modèle pour SpeedDial avec les différents styles de carte
  const items = [
    {
      label: 'OpenStreetMap',
      icon: 'pi pi-map',
      command: () => setTileLayerUrl('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
    },

    {
      label: 'Dark Mode',
      icon: 'pi pi-moon',
      command: () => setTileLayerUrl('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png')
    },
    {
      label: 'Esri World Imagery',
      icon: 'pi pi-globe',
      command: () => setTileLayerUrl('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}')
    },

    {
      label: 'CartoDB Positron',
      icon: 'pi pi-map',
      command: () => setTileLayerUrl('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png')
    },
    {
      label: 'CartoDB Dark Matter',
      icon: 'pi pi-moon',
      command: () => setTileLayerUrl('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png')
    }
  ];

  return (
    <div className="map-wrapper">
      {/* Carte Leaflet */}
      <MapContainer center={position} zoom={13} className="map" zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={tileLayerUrl} // URL dynamique pour changer le style de la carte
        />
        {/* Si la localisation de l'utilisateur est obtenue, recentrer la carte */}
        {userLocated && <RecenterMap position={position} />}
        
        {/* Afficher un marqueur à la position de l'utilisateur avec la popup affichée par défaut */}
        {userLocated && (
          <Marker position={position} icon={userIcon} ref={markerRef}>
            <Popup autoPan={false}>Vous📍</Popup>
          </Marker>
        )}
      </MapContainer>

      {/* SpeedDial pour changer le style de la carte */}
      {!blurred && <SpeedDial model={items} direction="up" radius={60}  style={{ right: 30, bottom: 30 }} /> }
    </div>
  );
};

export default HomePageMap;
