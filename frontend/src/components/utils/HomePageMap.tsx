import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { SpeedDial } from "primereact/speeddial";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "../../assets/css/home-map.css";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import DetailsCentreMap from "./DetailsCentreMap";
import { CentreExamen } from "../../interfaces/interfaces"; // Interface mise à jour
import { Chip } from "primereact/chip";
import SideBarCustom from "./SideBarCustom";
import { getRequest } from "../../interfaces/utils/api";
import { Toast } from "primereact/toast";

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
  const [position, setPosition] = useState<[number, number]>([48.8566, 2.3522]);
  const [userLocated, setUserLocated] = useState(false);
  const [tileLayerUrl, setTileLayerUrl] = useState(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  );
  const markerRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [selectedCentre, setSelectedCentre] = useState<CentreExamen | null>(
    null
  );
  const [centerPosition, setCenterPosition] = useState<[number, number] | null>(
    null
  );
  const [centresData, setCentresData] = useState<CentreExamen[]>([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        setUserLocated(true);
      },
      (err) => {
        toast.current?.show({
          severity: "warn",
          summary: "Erreur",
          detail: "Erreur lors de la récupération de la géolocalisation",
          life: 3000,
        });
        console.error(
          "Erreur lors de la récupération de la géolocalisation",
          err
        );
      },
      { timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    if (markerRef.current) {
      (markerRef.current as any).openPopup();
    }
  }, [userLocated]);

  useEffect(() => {
    const fetchCentresData = async () => {
      try {
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

  /* Skin de map */
  const items = [
    {
      label: "OpenStreetMap",
      icon: "pi pi-map",
      command: () =>
        setTileLayerUrl("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"),
    },
    {
      label: "Dark Mode",
      icon: "pi pi-moon",
      command: () =>
        setTileLayerUrl(
          "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
        ),
    },
    {
      label: "Esri World Imagery",
      icon: "pi pi-globe",
      command: () =>
        setTileLayerUrl(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        ),
    },
    {
      label: "CartoDB Positron",
      icon: "pi pi-map",
      command: () =>
        setTileLayerUrl(
          "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        ),
    },
    {
      label: "CartoDB Dark Matter",
      icon: "pi pi-moon",
      command: () =>
        setTileLayerUrl(
          "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        ),
    },
  ];

  const RecenterMap = ({ position }: { position: [number, number] }) => {
    const map = useMap();
    map.setView(position);
    return null;
  };

  function topBar() {
    return (
      <div className="search-container md:flex-row align-items-center md:px-4 px-2">
        <div className="flex">
          <SideBarCustom isOnMap={true} />
          <IconField iconPosition="right">
            <InputIcon className="pi pi-search"> </InputIcon>
            <InputText
              placeholder="Rechercher"
              className="border-round-3xl shadow-6"
            />
          </IconField>
        </div>
        <div className="chip-container">
          <Chip label="Circuits" icon="fa fa-road" className="mr-2 shadow-3" key={1} />
          <Chip
            label="Moniteurs"
            icon="fa-solid fa-chalkboard-user"
            className="mr-2 shadow-3"
            key={2}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <Toast ref={toast} />
      <div className="map-wrapper">
        {topBar()}

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

        <SpeedDial
          model={items}
          direction="up"
          radius={60}
          style={{ right: 30, bottom: 30 }}
        />
      </div>
    </>
  );
}

export default HomePageMap;
