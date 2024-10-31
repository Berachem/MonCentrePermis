import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { SpeedDial } from 'primereact/speeddial';
import "leaflet/dist/leaflet.css";
import L from "leaflet"; 
import "../../assets/css/home-map.css";
import centresData from "../../../../data/centres_examens.json" // Importer les centres d'examen.
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { IconField } from 'primereact/iconfield'
import { InputIcon } from 'primereact/inputicon'
import DetailsCentreMap from "./DetailsCentreMap";
import { Centre } from '../../interfaces/interfaces'


// Icône personnalisée pour le marqueur de chaque centre d'examen
const examCenterIcon = new L.Icon({
  iconUrl: "https://i.postimg.cc/FFJWRnMS/point-map.png",
  iconSize: [30, 31], // Taille ajustée
  iconAnchor: [15, 31], // Ancre ajustée
  popupAnchor: [1, -34],
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  shadowSize: [31, 31],
});

const userIcon = new L.Icon({
  iconUrl: "https://i.postimg.cc/FFJWRnMS/point-map.png",
  iconSize: [40, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  shadowSize: [41, 41],
});


function HomePageMap() {
  const [position, setPosition] = useState<[number, number]>([48.8566, 2.3522]);
  const [userLocated, setUserLocated] = useState(false);
  const [tileLayerUrl, setTileLayerUrl] = useState("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");
  const markerRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [selectedCentre, setSelectedCentre] = useState<Centre>();
  const [centerPosition, setCenterPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        setUserLocated(true);
      },
      (err) => {
        console.error("Erreur lors de la récupération de la géolocalisation", err);
      }
    );
  }, []);

  useEffect(() => {
    if (markerRef.current) {
      (markerRef.current as any).openPopup();
    }
  }, [userLocated]);

  /* Selected Exam Center */
  const handleMarkerClick = (centre: any) => {
    setSelectedCentre(centre);
    setVisible(true);
    setCenterPosition([centre.lat, centre.long]);
  };

  /* Skin de map */
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

  /* Recentrer la carte sur une position donnée */
  const RecenterMap = ({ position }: { position: [number, number] }) => {
    const map = useMap();
    map.setView(position);
    return null;
  };

  return (
    <div className="map-wrapper">
      {/* Barre de recherche et boutons */}
      <div className="search-container">
        <span className="p-input-icon-left">
          <IconField iconPosition="left" className="searchbar">
              <InputIcon className="pi pi-search"> </InputIcon>
              <InputText placeholder="Rechercher..." />
          </IconField>
          <Button label="Se connecter" className="p-button-outlined button-map" />
        </span>
        <Button label="Auto écoles" className="p-button-outlined button-map" />
      </div>

      {/* Carte Leaflet */}
      <MapContainer center={position} zoom={13} className="map" zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={tileLayerUrl}
        />
        {/* Si la localisation de l'utilisateur est obtenue, recentrer la carte */}
        {userLocated && <RecenterMap position={position} />}

        {/* Recentrer sur le centre d'examen sélectionné lors du clic */}
        {centerPosition && <RecenterMap position={centerPosition} />}

        {/* Marqueur pour la position de l'utilisateur */}
        {userLocated && (
          <Marker position={position} icon={userIcon} ref={markerRef}>
            <Popup autoPan={false}>Vous📍</Popup>
          </Marker>
        )}

        {/* Marqueurs pour chaque centre d'examen */}
        {centresData.centres_examens.map((centre) => (
          centre.lat !== null && centre.long !== null && (
          <Marker
            key={centre.id}
            position={[centre.lat, centre.long]}
            icon={examCenterIcon}
            eventHandlers={{
              click: () => handleMarkerClick(centre)
            }}
          >
          </Marker>
          )
        ))}
      </MapContainer>
      {selectedCentre && (
                <DetailsCentreMap
                    visible={visible}
                    onHide={() => setVisible(false)}
                    centre={{
                        name: selectedCentre.name,
                        address: selectedCentre.formattedAddress.address,
                        city: selectedCentre.formattedAddress.city,
                        postalCode: selectedCentre.formattedAddress.cp,
                    }}
                />
            )}

      {/* SpeedDial pour changer le style de la carte */}
      {<SpeedDial model={items} direction="up" radius={60} style={{ right: 30, bottom: 30 }} />}
    </div>
  );
};

export default HomePageMap;
