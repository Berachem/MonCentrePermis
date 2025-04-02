import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "../../assets/css/home-map.css";
import DetailsCentreMap from "./DetailsCentreMap";
import { CentreExamen } from "../../interfaces/interfaces"; // Interface mise à jour
import { getRequest } from "../../interfaces/utils/api";
import { Toast } from "primereact/toast";
import Loader from "./Loader";
import HomePageTopBar from "./HomePageTopBar";
import { Button } from "primereact/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocation } from "@fortawesome/free-solid-svg-icons";

/* Icones */
const examCenterIconFrance = new L.Icon({
  iconUrl: "https://i.postimg.cc/FFJWRnMS/point-map.png",
  iconSize: [30, 31],
  iconAnchor: [15, 31],
  popupAnchor: [1, -34],
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  shadowSize: [31, 31],
});

const examCenterIconUK = new L.Icon({
  iconUrl: "https://i.postimg.cc/v8fyVYvk/output-onlinepngtools-2.png",
  iconSize: [30, 31],
  iconAnchor: [15, 31],
  popupAnchor: [1, -34],
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  shadowSize: [31, 31],
});

const userIcon = new L.Icon({
  iconUrl: "https://i.ibb.co/H7ntmhd/abd-laurent.png",
  iconSize: [40, 60],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  shadowSize: [41, 41],
});

// Nouveau composant de contrôles de la carte
function MapControls({
  userPos,
  setTileLayerUrl,
}: {
  userPos: [number, number];
  setTileLayerUrl: (url: string) => void;
}) {
  const map = useMap();

  const handleRecenter = () => {
    map.setView(userPos, map.getZoom());
  };

  const handleZoomIn = () => {
    map.zoomIn();
  };

  const handleZoomOut = () => {
    map.zoomOut();
  };

  return (
    <div className="map-controls">
      <Button
        onClick={handleRecenter}
        className="p-button-rounded justify-content-center w-9 h-9"
      >
        <FontAwesomeIcon icon={faLocation} className="text-2xl" />
      </Button>
      <Button
        icon="pi pi-plus"
        onClick={handleZoomIn}
        className="p-button-rounded "
      />
      <Button
        icon="pi pi-minus"
        onClick={handleZoomOut}
        className="p-button-rounded "
      />
    </div>
  );
}

function HomePageMap() {
  const toast = useRef<Toast>(null);
  const markerRef = useRef(null);

  const [position, setPosition] = useState<[number, number]>([48.8566, 2.3522]);
  const [userLocated, setUserLocated] = useState(false);
  const [tileLayerUrl, setTileLayerUrl] = useState(
    localStorage.getItem("tileLayerUrl") ||
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  );
  const [visible, setVisible] = useState(false);
  const [selectedCentre, setSelectedCentre] = useState<CentreExamen | null>(
    null
  );
  const [centerPosition, setCenterPosition] = useState<[number, number] | null>(
    null
  );
  const [centresData, setCentresData] = useState<CentreExamen[]>([]);
  const [loading, setLoading] = useState(true);

  //récupération de la localisation
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        setUserLocated(true);
      },
      (err) => {
        /*   toast.current?.show({
          severity: "warn",
          summary: "Erreur",
          detail: "Erreur lors de la récupération de la géolocalisation",
          life: 3000,
        }); */
        console.error(
          "Erreur lors de la récupération de la géolocalisation",
          err
        );
      },
      { timeout: 10000 }
    );
  }, []);

  //affichage du marker de localisation
  useEffect(() => {
    if (markerRef.current) {
      (markerRef.current as any).openPopup();
    }
  }, [userLocated]);

  //récupération des données de centre d'examen
  useEffect(() => {
    const fetchCentresData = async () => {
      try {
        setLoading(true);
        const data = await getRequest<CentreExamen[]>("/custom/centre_examens");
        console.log("Données des centres d'examen :");
        console.log(data);
        setCentresData(data);
        toast.current?.show({
          severity: "success",
          summary: "Succès",
          detail:
            "Centres d'examen récupérés avec succès (" +
            data.length +
            " centres)",
          life: 3000,
        });
      } catch (error) {
        toast.current?.show({
          severity: "error",
          summary: "Erreur",
          detail: "Erreur lors de la récupération des centres d'examen",
          life: 3000,
        });
        console.error(
          "Erreur lors de la récupération des centres d'examen",
          error
        );
      }
      setLoading(false);
    };
    fetchCentresData();
  }, []);

  /* Centre sélectionné */
  const handleMarkerClick = (centre: CentreExamen) => {
    setSelectedCentre(centre);
    setVisible(true);
    setCenterPosition([
      parseFloat(centre.latitude),
      parseFloat(centre.longitude),
    ]);
  };

  const RecenterMap = ({ position }: { position: [number, number] }) => {
    const map = useMap();
    map.setView(position);
    return null;
  };

  return (
    <>
      <Toast ref={toast} />
      <div className="map-wrapper">
        <HomePageTopBar />

        {/* 
        Si connecté -> NOM PRENOM image de profil
        Sinon, boutton Connexion & Inscription
        */}

        <MapContainer
          center={position}
          zoom={13}
          className="map"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url={tileLayerUrl}
          />
          {userLocated && <RecenterMap position={position} />}
          {centerPosition && <RecenterMap position={centerPosition} />}

          {userLocated && (
            <Marker position={position} icon={userIcon} ref={markerRef}>
              <Popup autoPan={false}>Vous📍</Popup>
            </Marker>
          )}

          {loading && (
            <div className="loader-container">
              <Loader />
            </div>
          )}
          {centresData &&
            centresData.map((centre) => {
              if (centre.latitude === null || centre.longitude === null)
                return null;
              const pos = [
                parseFloat(centre.latitude),
                parseFloat(centre.longitude),
              ];
              const icon =
                centre.pays === "France"
                  ? examCenterIconFrance
                  : examCenterIconUK;
              return (
                <Marker
                  key={centre.id}
                  position={pos}
                  icon={icon}
                  eventHandlers={{
                    click: () => handleMarkerClick(centre),
                    mouseover: (e) => {
                      e.target.setIcon(
                        new L.Icon({
                          iconUrl: icon.options.iconUrl,
                          iconSize: [36, 37], // agrandi
                          iconAnchor: [18, 37],
                          popupAnchor: [1, -34],
                          shadowUrl: icon.options.shadowUrl,
                          shadowSize: icon.options.shadowSize,
                        })
                      );
                    },
                    mouseout: (e) => {
                      e.target.setIcon(icon);
                    },
                  }}
                />
              );
            })}
          <MapControls userPos={position} setTileLayerUrl={setTileLayerUrl} />
        </MapContainer>
        {selectedCentre && (
          <DetailsCentreMap
            visible={visible}
            onHide={() => setVisible(false)}
            centre={{
              name: selectedCentre.libelle,
              address: selectedCentre.adresse,
              city: selectedCentre.ville.libelle, // Extraire le nom de la ville si nécessaire
              postalCode: selectedCentre.ville.code_postal ?? "N/A",
            }}
          />
        )}
      </div>
    </>
  );
}

export default HomePageMap;
