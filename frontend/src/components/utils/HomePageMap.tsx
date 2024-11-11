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


/* Icones */
const examCenterIcon = new L.Icon({
  iconUrl: "https://i.postimg.cc/FFJWRnMS/point-map.png",
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

function HomePageMap() {

  const toast = useRef<Toast>(null);
  const markerRef = useRef(null);

  const [position, setPosition] = useState<[number, number]>([48.8566, 2.3522]);
  const [userLocated, setUserLocated] = useState(false);
  const [tileLayerUrl] = useState(
    localStorage.getItem('tileLayerUrl') || "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
);
  const [visible, setVisible] = useState(false);
  const [selectedCentre, setSelectedCentre] = useState<CentreExamen | null>(null);
  const [centerPosition, setCenterPosition] = useState<[number, number] | null>(null);
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
          detail: "Centres d'examen récupérés avec succès (" + data.length + " centres)",
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
        <HomePageTopBar/>

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
          { centresData &&
          centresData.map(
              (centre) =>
                centre.latitude !== null &&
                centre.longitude !== null && (
                  <Marker
                    key={centre.id}
                    position={[
                      parseFloat(centre.latitude),
                      parseFloat(centre.longitude),
                    ]}
                    icon={examCenterIcon}
                    eventHandlers={{
                      click: () => handleMarkerClick(centre),
                    }}
                  ></Marker>
                )
            )}
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
