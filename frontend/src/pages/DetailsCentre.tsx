import React, { useState, useEffect, useRef } from "react";
import { CSSTransition } from "react-transition-group";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-routing-machine";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useNavigate, useLocation } from "react-router-dom";
import { getRequest } from "../interfaces/api";
import { Chip } from "primereact/chip";
import useAuth from "../hooks/useAuth";
import Loader from "../components/utils/Loader";
import { UserType } from "../enum/user";
import { Accordion, AccordionTab } from "primereact/accordion";
import CourseContent from "../components/Classes/ClassesContent";

// Interface pour un cours associé
interface AssociatedCourse {
  id: string;
  libelle: string;
  description: string;
}

// Interface pour un point du circuit
interface Point {
  id: number;
  latitude: number;
  longitude: number;
  description: string;
  rang: number;
  type: string;
  libelle: string;
}

// Interface pour un circuit
interface Circuit {
  id: number;
  nom: string;
  description: string;
  createur?: {
    date: string;
    nom?: string;
    prenom?: string;
  };
  moniteur?: {
    id: number;
    nom: string;
    prenom: string;
  };
  points: Point[];
}

// Interface pour un centre d'examen
interface Centre {
  id: number;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  latitude?: string;
  longitude?: string;
}

// Types de points avec icônes SVG
interface PointType {
  value: string;
  label: string;
  color: string;
  svgIcon: string;
}

const pointTypes: PointType[] = [
  {
    value: "depart",
    label: "Départ",
    color: "#4CAF50",
    svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4CAF50" width="32" height="32">
      <path d="M0 0h24v24H0z" fill="none"/>
      <path d="M14 3v7h7v4h-7v7h-4v-7H3v-4h7V3h4z"/>
    </svg>`,
  },
  {
    value: "stop",
    label: "Arrêt",
    color: "#F44336",
    svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#F44336" width="32" height="32">
      <path d="M0 0h24v24H0z" fill="none"/>
      <path d="M6 6h12v12H6z"/>
    </svg>`,
  },
  {
    value: "attention",
    label: "Attention",
    color: "#FF9800",
    svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF9800" width="32" height="32">
      <path d="M0 0h24v24H0z" fill="none"/>
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
    </svg>`,
  },
  {
    value: "tournant",
    label: "Tournant",
    color: "#2196F3",
    svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2196F3" width="32" height="32">
      <path d="M0 0h24v24H0z" fill="none"/>
      <path d="M17.17 6.84l-4.23-4.26L10.5 5l4.2 4.2-7.27 7.28-4.93-4.93V19h7.45l-4.92-4.92 7.28-7.28 3.86 3.85V6.84z"/>
    </svg>`,
  },
  {
    value: "information",
    label: "Information",
    color: "#9C27B0",
    svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#9C27B0" width="32" height="32">
      <path d="M0 0h24v24H0z" fill="none"/>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
    </svg>`,
  },
  {
    value: "arrivee",
    label: "Arrivée",
    color: "#E91E63",
    svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#E91E63" width="32" height="32">
      <path d="M0 0h24v24H0z" fill="none"/>
      <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
    </svg>`,
  },
];

// Créer une icône Leaflet à partir de SVG
const createIconFromSvg = (svgString: string): L.DivIcon => {
  return L.divIcon({
    html: svgString,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Composant pour gérer la création de route
const RoutingMachineControl = ({ points }: { points: Point[] }) => {
  const map = useMap();
  const routingControlRef = useRef<L.Routing.Control | null>(null);

  useEffect(() => {
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }

    if (points.length >= 2) {
      const waypoints = points
        .sort((a, b) => a.rang - b.rang)
        .map((point) => L.latLng(point.latitude, point.longitude));

      const routingControl = L.Routing.control({
        waypoints: waypoints,
        routeWhileDragging: false,
        showAlternatives: false,
        fitSelectedRoutes: false,
        lineOptions: {
          styles: [{ color: "var(--primary-color)", opacity: 0.8, weight: 5 }],
          extendToWaypoints: true,
          missingRouteTolerance: 0,
        },
        createMarker: () => null,
        addWaypoints: false,
      }).addTo(map);

      routingControlRef.current = routingControl;

      const container = routingControl?.getContainer();
      if (container) {
        container.style.display = "none";
      }
    }

    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
    };
  }, [map, points]);

  return null;
};

// Composant pour centrer la vue de la carte
interface MapViewProps {
  center: [number, number];
}

const MapView: React.FC<MapViewProps> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);

  return null;
};

// Composant ExamPage
const DetailsCentre: React.FC = () => {
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 768);
  const defaultPosition: [number, number] = [48.8566, 2.3522];
  const [expandedCircuits, setExpandedCircuits] = useState<string[]>([]);
  const [circuitModalVisible, setCircuitModalVisible] = useState<boolean>(false);
  const [legendVisible, setLegendVisible] = useState<boolean>(true);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useRef<Toast>(null);

  // Distance maximale pour filtrer les circuits (en km)
  const MAX_DISTANCE = 6;

  // État pour les données
  const [circuits, setCircuits] = useState<Circuit[]>([]);
  const [selectedCircuit, setSelectedCircuit] = useState<string>("");
  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultPosition);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [centre, setCentre] = useState<Centre | null>(null);
  const { userRole } = useAuth();

  // Nouveaux états pour les cours associés
  const [associatedCourses, setAssociatedCourses] = useState<AssociatedCourse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState<boolean>(false);
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);

  const { typeUserid } = useAuth();
  
  // Nouvel état pour le slider mobile
  const [coursesSliderVisible, setCoursesSliderVisible] = useState<boolean>(false);

  // Récupérer le centre d'examen depuis location.state
  useEffect(() => {
    const state = location.state as { centre?: Centre };
    if (state?.centre) {
      setCentre(state.centre);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchCircuits = async () => {
      if (!centre) return;

      try {
        setIsLoading(true);

        const circuitsProches = await getRequest<Circuit[]>(
          `/custom/centre_examens/${centre.id}/circuits-proches`
        );

        console.log("Circuits proches:", circuitsProches);
        setCircuits(circuitsProches);
        setCircuitModalVisible(true);

        if (circuitsProches.length > 0) {
          setSelectedCircuit(circuitsProches[0].nom);
          if (circuitsProches[0].points.length > 0) {
            setMapCenter([
              circuitsProches[0].points[0].latitude,
              circuitsProches[0].points[0].longitude,
            ]);
          }
        } else {
          toast.current?.show({
            severity: "info",
            summary: "Information",
            detail: "Aucun circuit trouvé à proximité du centre",
            life: 3000,
          });
        }
      } catch (error) {
        console.error(
          "Erreur lors du chargement des circuits proches :",
          error
        );
        toast.current?.show({
          severity: "error",
          summary: "Erreur",
          detail: "Impossible de charger les circuits",
          life: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (centre) {
      fetchCircuits();
    }
  }, [centre]);

  // Nouveau : Récupérer les cours associés au circuit sélectionné
  useEffect(() => {
    const fetchAssociatedCourses = async () => {
      const currentCircuit = circuits.find(
        (circuit) => circuit.nom === selectedCircuit
      );
      
      if (!currentCircuit) return;

      try {
        setLoadingCourses(true);
        console.log(`Récupération des cours pour le circuit ID ${currentCircuit.id}...`);
        
        // Récupérer les relations circuit-cours
        const response = await getRequest<{
          "@context": string,
          "@id": string,
          "@type": string,
          "totalItems": number,
          "member": {
            "@id": string,
            "@type": string,
            "id": number,
            "circuit": string,
            "cours": string
          }[]
        }>(`/circuit_cours?circuit=${currentCircuit.id}`);
        
        console.log("Réponse circuit_cours:", response);
        
        if (!response || !response.member || response.totalItems === 0) {
          console.log("Aucun cours associé trouvé");
          setAssociatedCourses([]);
          return;
        }
        
        // Extraire les IDs des cours à partir des IRIs
        const coursUrls = response.member
          .filter(item => item.circuit === `/api/circuits/${currentCircuit.id}`)
          .map(item => item.cours);
        
        console.log("URLs des cours trouvés:", coursUrls);
        
        if (coursUrls.length === 0) {
          setAssociatedCourses([]);
          return;
        }
        
        // Récupérer les détails de chaque cours
        const coursesData: AssociatedCourse[] = [];
        for (const coursUrl of coursUrls) {
          try {
            // Extraire l'ID du cours depuis l'URL
            const coursId = coursUrl.split('/').pop();
            console.log(`Récupération du cours ID: ${coursId}`);
            
            if (!coursId) continue;
            
            // Récupérer les détails du cours
            const courseData = await getRequest<AssociatedCourse>(`/cours/${coursId}`);
            if (courseData) {
              console.log("Cours récupéré:", courseData);
              coursesData.push(courseData);
            }
          } catch (err) {
            console.error("Erreur lors de la récupération d'un cours:", err);
          }
        }
        
        console.log(`${coursesData.length} cours récupérés avec succès:`, coursesData);
        setAssociatedCourses(coursesData);
        
      } catch (error) {
        console.error("Erreur lors de la récupération des cours associés:", error);
        toast.current?.show({
          severity: "error",
          summary: "Erreur",
          detail: "Impossible de charger les cours associés au circuit",
          life: 3000,
        });
        setAssociatedCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    };

    if (selectedCircuit && circuits.length > 0) {
      fetchAssociatedCourses();
    }
  }, [selectedCircuit, circuits]);

  // Mettre à jour le centre de la carte quand le circuit change
  useEffect(() => {
    const currentCircuit = circuits.find(
      (circuit) => circuit.nom === selectedCircuit
    );
    if (currentCircuit && currentCircuit.points.length > 0) {
      setMapCenter([
        currentCircuit.points[0].latitude,
        currentCircuit.points[0].longitude,
      ]);
    }
  }, [selectedCircuit, circuits]);

  // Gérer le redimensionnement
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Bascule l'expansion d'un circuit
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

  // Sélectionner un circuit
  const handleCircuitSelection = (circuitNom: string) => {
    setSelectedCircuit(circuitNom);
    setCircuitModalVisible(false);
  };

  // Données du circuit actuel
  const currentCircuit = circuits.find(
    (circuit) => circuit.nom === selectedCircuit
  );
  const circuitPoints = (currentCircuit?.points || []).sort(
    (a, b) => a.rang - b.rang
  );

  // Obtenir l'icône d'un point
  const getPointIcon = (type: string) => {
    const pointType =
      pointTypes.find((pt) => pt.value === type) || pointTypes[4]; // Fallback sur "information"
    return createIconFromSvg(pointType.svgIcon);
  };

  return (
    <div className="relative h-screen w-full">
      <Toast ref={toast} />

      {/* Loader comme sur la homepage */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-70 z-50">
          <Loader />
        </div>
      )}

      {/* Remplacer chipContainer - Simplifier cette partie puisqu'on déplace les infos */}
      <div className={`absolute top-[2%] ${isMobile ? 'left-1/2' : 'left-[40%]'} -translate-x-1/2 z-[1000] flex justify-center flex-col items-center w-4/5`}>
        <Button
          icon="pi pi-arrow-left"
          className="shadow-lg bg-green-800 hover:bg-green-700 text-white rounded-lg p-2 gap-2 mb-1"
          onClick={() => navigate("/")}
          label="Retour à l'accueil"
          severity="secondary"
          tooltipOptions={{ position: "top" }}
        />
      </div>

      {/* Remplacer legendButton */}
      <div className={`fixed left-[10px] ${isMobile ? 'top-[220px]' : 'top-[10px]'} z-[1000]`}>
        <Button
          icon={legendVisible ? "pi pi-eye-slash" : "pi pi-info-circle"}
          className="rounded-xl text-white h-10 shadow-lg border border-green-800 bg-green-800 hover:bg-green-700"
          onClick={() => setLegendVisible(!legendVisible)}
          tooltipOptions={{ position: "right" }}
        />
      </div>

      {/* Légende des icônes */}
      {legendVisible && (
        <div
          className={`fixed ${isMobile ? 'top-[200px]' : 'top-[10px]'} left-[10px] z-[1000] ${isMobile ? 'max-w-[240px]' : 'max-w-[280px]'} transition-all duration-300 animate__animated animate__fadeInLeft`}
        >
          <div className="bg-white bg-opacity-95 p-3 rounded-xl shadow-lg border border-gray-200">
            <div className="flex justify-between items-center mb-3 border-b border-gray-200 pb-2">
              <span className="text-lg font-medium text-green-800">Légende</span>
              <Button
                icon="pi pi-times"
                className="p-button-text p-button-rounded p-button-sm bg-white text-green-800"
                onClick={() => setLegendVisible(false)}
              />
            </div>
            <div className="flex flex-col gap-2 md:gap-3">
              {pointTypes.map((type) => (
                <div key={type.value} className="flex items-center text-sm md:text-base py-1">
                  <div
                    className={`w-[20px] h-[20px] md:w-[24px] md:h-[24px] mr-2 md:mr-3 flex justify-center items-center`}
                    dangerouslySetInnerHTML={{ __html: type.svgIcon }}
                  ></div>
                  <span className="text-gray-700">{type.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <MapContainer
          center={mapCenter}
          zoom={13}
          className="h-full w-full"
          zoomControl={false}
        >
          <MapView center={mapCenter} />
          <TileLayer
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {circuitPoints.length > 0 && (
            <RoutingMachineControl points={circuitPoints} />
          )}
          {circuitPoints.map((point) => (
            <Marker
              key={point.id}
              position={[point.latitude, point.longitude]}
              icon={getPointIcon(point.type)}
            >
              <Popup closeButton={false}>
                <span className="font-medium">{point.libelle}</span>

                {point.description && (
                  <>
                    <hr className="my-2" />
                    <div className="flex items-center mt-2">
                      <span className="text-sm text-white">
                        {point.description}
                      </span>
                    </div>
                  </>
                )}
              </Popup>
            </Marker>
          ))}
      </MapContainer>
      

      {/* Remplacer circuitSelectorButton */}
      <div className="fixed bottom-[30px] left-[30px] z-[1000]">
        <Button
          icon="pi pi-flag"
          label={isMobile ? undefined : `Sélectionner un circuit`}
          className = {
            `rounded-lg shadow-lg bg-green-800 hover:bg-green-700 text-white px-4 py-2 flex items-center  ${isMobile ? '' : 'gap-2'}`
          }
          onClick={() => setCircuitModalVisible(true)}
          tooltip={
            isMobile ? `Circuits disponibles (${circuits.length})` : undefined
          }
          tooltipOptions={{ position: "top" }}
          disabled={circuits.length === 0}
          badge={!isMobile ? circuits.length.toString() : undefined}
          badgeClassName="bg-green-600 text-white"
        />
      </div>

      {/* Bouton de toggle pour les cours sur mobile */}
      {isMobile && (
        <div 
          className={`fixed top-1/2 -translate-y-1/2 z-[1001] h-[50px] w-[30px] bg-green-800 rounded-l-md flex items-center justify-center shadow-md cursor-pointer transition-all duration-300 ${coursesSliderVisible ? 'right-[85%]' : 'right-0'}`}
          onClick={() => setCoursesSliderVisible(!coursesSliderVisible)}
        >
          <i className={`pi ${coursesSliderVisible ? "pi-chevron-right" : "pi-chevron-left"} text-white`}></i>
        </div>
      )}

      {/* Panneau latéral pour les cours - adapté pour mobile */}
      <div className={`fixed top-0 right-0 h-screen bg-white shadow-lg z-[1000] overflow-y-auto transition-all duration-300 ${isMobile ? (coursesSliderVisible ? 'w-[85%] p-5' : 'w-0 p-0') : 'w-[300px] p-5'}`}>
        {(!isMobile || coursesSliderVisible) && (
          <>
            {/* Information du centre et du circuit déplacées ici */}
            {centre && currentCircuit && (
              <div className="mb-2 border-b border-gray-300 pb-4">
                <div className="flex flex-col items-center gap-2">
                  <i className="pi pi-map-marker text-green-800 font-bold"></i>
                  <h3 className="font-bold text-green-800 text-center">
                    {centre.name}
                  </h3>
                    
                  <div className="bg-green-50 border border-green-300 rounded-lg p-3 w-full text-center">
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <i className="pi pi-user text-green-700"></i>
                      <span className="text-xs">
                        {currentCircuit.moniteur
                          ? `Circuit créé par: ${currentCircuit.moniteur.prenom} ${currentCircuit.moniteur.nom}`
                          : "Circuit sans moniteur"}
                      </span>
                    </div>
                    
                    {currentCircuit.createur?.date && (
                      <div className="text-xs text-gray-600 mt-1">
                        le {new Date(currentCircuit.createur.date).toLocaleDateString()}
                      </div>
                    )}
                    
                    {userRole === UserType.Teacher &&
                      typeUserid.toString() === currentCircuit.moniteur?.id?.toString() && (
                      <div className="mt-3 flex justify-center">
                        <Button
                          icon="pi pi-pencil"
                          label="Modifier"
                          className="p-button-sm p-button-outlined bg-green-800 text-white hover:bg-green-700 gap-2 rounded-lg p-2"
                          onClick={() => navigate(`/circuit/edit/${currentCircuit.id}`)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col justify-between items-center mb-4">
              <i className="pi pi-book text-green-800 font-bold mb-1"></i>
              <h3 className="font-bold text-green-800 m-auto mt-0 mb-2">Cours associés</h3>
              {isMobile && (
                <Button 
                  icon="pi pi-times" 
                  className="bg-white absolute right-3 top-3" 
                  onClick={() => setCoursesSliderVisible(false)} 
                />
              )}
            </div>

            {loadingCourses ? (
              <div className="flex flex-col items-center justify-center overflow-hidden h-full">
                <i className="pi pi-spin pi-spinner text-green-800" style={{ fontSize: '2rem' }}></i>
                <p className="mt-3">Chargement des cours...</p>
              </div>
            ) : associatedCourses.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-5">
                <i className="pi pi-book text-gray-500" style={{ fontSize: '2rem' }}></i>
                <p className="mt-3 text-center">Aucun cours n'est associé à ce circuit.</p>
                {userRole === UserType.Teacher && currentCircuit && (
                  <Button
                    icon="pi pi-plus"
                    label="Ajouter un cours"
                    className="p-button-outlined mt-4"
                    onClick={() => alert("TODO - Ajouter un cours")}
                  />
                )}
                <div className="mt-5 border-t border-gray-200 pt-4 w-full">
                  <h3 className="text-lg font-semibold text-green-800">Comment utiliser ce circuit?</h3>
                  <ul className="list-none p-0 mt-3">
                    <li className="flex items-center mb-2">
                      <i className="pi pi-map text-green-800 mr-2"></i>
                      <span>Explorez les points d'intérêt sur la carte</span>
                    </li>
                    <li className="flex items-center mb-2">
                      <i className="pi pi-info-circle text-green-800 mr-2"></i>
                      <span>Cliquez sur les marqueurs pour plus d'informations</span>
                    </li>
                    <li className="flex items-center mb-2">
                      <i className="pi pi-car text-green-800 mr-2"></i>
                      <span>Suivez les instructions du moniteur</span>
                    </li>
                    <li className="flex items-center mb-2">
                      <i className="pi pi-check-circle text-green-800 mr-2"></i>
                      <span>Préparez-vous pour l'examen avec ce parcours</span>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <>
                <Accordion 
                  activeIndex={expandedCourseId ? associatedCourses.findIndex(c => c.id === expandedCourseId) : null}
                  onTabChange={(e) => {
                    const courseId = typeof e.index === "number" ? associatedCourses[e.index]?.id : null;
                    setExpandedCourseId(courseId);
                  }}
                  className="w-full border border-green-100 rounded-lg overflow-hidden"
                >
                  {associatedCourses.map((course) => (
                    <AccordionTab
                      key={course.id}
                      header={
                        <div className="flex items-center py-3 px-4">
                          <i className="pi pi-book text-green-600 text-lg mr-3"></i>
                          <span className="font-medium text-lg text-green-800">{course.libelle}</span>
                        </div>
                      }
                      headerClassName="bg-green-100 hover:bg-green-200 border-b border-green-200"
                      contentClassName="bg-white"
                    >
                      <CourseContent content={course.description} className="p-3 bg-gray-50 rounded" />
                    </AccordionTab>
                  ))}
                </Accordion>
                
                <div className="mt-4 p-3 rounded bg-green-50 border border-green-200">
                  <h3 className="text-lg font-semibold text-green-800">Conseils de révision</h3>
                  <p className="text-sm mt-2">
                    Prenez le temps d'étudier chaque cours associé à ce circuit. 
                    Ces informations sont essentielles pour réussir votre examen!
                  </p>
                </div>
              </>
            )}
          </>
        )}
      </div>

      <Dialog
        visible={circuitModalVisible}
        onHide={() => setCircuitModalVisible(false)}
        position="bottom"
        modal
        showHeader={false}
        closeOnEscape={true}
        dismissableMask={true}
        className="rounded-t-3xl mx-auto"
        style={{ width: "95vw", maxWidth: "1200px" }}
        transitionOptions={{ timeout: 400 }}
      >
        <div className="overflow-y-auto" style={{ maxHeight: "70vh" }}>
          <div className="flex justify-between items-center p-3 border-gray-200">
            <h2 className="text-xl font-bold m-0 text-green-800">Sélectionner un circuit</h2>
            <Button
              icon="pi pi-times"
              className="p-button-text bg-green-800 rounded-xl h-10 text-white"
              onClick={() => setCircuitModalVisible(false)}
            />
          </div>

          <div className="p-2 bg-green-100 text-green-900 text-center border-b p-3 border-gray-200">
            <i className="pi pi-info-circle mr-2"></i>
            Circuits disponibles à moins de {MAX_DISTANCE} km du centre d'examen
          </div>

          {circuits.map((circuit) => (
            <div
              key={circuit.id}
              className={`p-3 cursor-pointer transition-colors duration-300 hover:bg-gray-200 ${
                selectedCircuit === circuit.nom ? "bg-gray-100" : ""
              }`}
              onClick={() => handleCircuitSelection(circuit.nom)}
            >
              <div className="relative">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-gray-900 text-lg font-bold">
                          {circuit.nom}
                        </span>
                        <span className="text-xs text-green-700 px-2 py-1 bg-green-100 rounded flex items-center">
                          {circuit.points.length} points
                        </span>
                      </div>

                      <div className="flex flex-col mt-1 gap-1">
                        {circuit.moniteur && (
                          <div className="flex items-center text-sm text-blue-700">
                            <i className="pi pi-user mr-1"></i>
                            <span>
                              {circuit.moniteur.prenom} {circuit.moniteur.nom}
                            </span>
                          </div>
                        )}

                        {circuit.createur && (
                          <div className="flex items-center text-xs text-gray-500">
                            <i className="pi pi-calendar mr-1"></i>
                            <span>
                              Créé le{" "}
                              {new Date(
                                circuit.createur.date
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {circuit.description && (
                          <p className="text-sm text-gray-600 mt-1 mb-1 leading-6 border-t border-gray-300 pt-2">
                            {circuit.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    {selectedCircuit === circuit.nom && (
                      <span className="font-medium flex text-green-500 items-center mr-3">
                        <span className="flex items-center">
                          appliqué
                          <i className="pi pi-check-circle ml-1"></i>
                        </span>
                      </span>
                    )}
                    <i
                      className={`pi ${
                        expandedCircuits.includes(circuit.nom)
                          ? "pi-chevron-up"
                          : "pi-chevron-down"
                      } text-green-800 cursor-pointer p-1`}
                      onClick={(e) => toggleCircuitExpansion(circuit.nom, e)}
                    ></i>
                  </div>
                </div>
              </div>
              <CSSTransition
                in={expandedCircuits.includes(circuit.nom)}
                timeout={300}
                classNames={{
                  enter: "max-h-0 opacity-0 overflow-hidden",
                  enterActive:
                    "max-h-30rem opacity-100 transition-all duration-300",
                  exit: "max-h-30rem opacity-100 overflow-hidden",
                  exitActive:
                    "max-h-0 opacity-0 transition-all duration-300",
                }}
                unmountOnExit
              >
                <div className="mt-3 pt-2 border-t border-gray-300">
                  {circuit.points.length > 0 ? (
                    circuit.points
                      .sort((a, b) => a.rang - b.rang)
                      .map((point, index) => (
                        <div
                          key={point.id}
                          className="flex items-center py-2 ml-2"
                        >
                          <span
                            className="flex-shrink-0 flex justify-center items-center rounded-full w-6 h-6 min-w-6 max-w-6 mr-2 text-white text-xs font-medium"
                            style={{
                              backgroundColor:
                                pointTypes.find((pt) => pt.value === point.type)
                                  ?.color || "#9C27B0"
                            }}
                          >
                            {index + 1}
                          </span>
                          <i className="pi pi-map-marker text-green-800 mr-2"></i>
                          <span className="text-white-900">{point.libelle}</span>
                          <Chip
                            label={point.description}
                            className="ml-2 bg-grey-100 text-grey-900 font-medium text-xs p-1"
                          />
                        </div>
                      ))
                  ) : (
                    <div className="p-2 text-gray-500">
                      Aucun point défini pour ce circuit.
                    </div>
                  )}
                </div>
              </CSSTransition>
            </div>
          ))}
          
          {circuits.length === 0 && userRole !== UserType.Teacher && (
            <div className="p-4 text-center text-gray-500">
              Aucun circuit disponible à moins de {MAX_DISTANCE} km du centre.
            </div>
          )}

          {circuits.length === 0 && userRole === UserType.Teacher && (
            <div className="p-4 text-center text-gray-500">
              Malheureusement, aucun circuit n'est disponible à moins de{" "}
              {MAX_DISTANCE} km du centre.
              <br />
              <div className="text-gray-900 font-bold mt-2 flex flex-col items-center mt-5">
                <span className="text-gray-900 font-bold">
                  Et si vous en créiez un ?
                </span>
                <Button
                  label="Créer un circuit"
                  icon="pi pi-plus"
                  className="p-button-primary mt-2"
                  onClick={() => navigate("/circuit/create")}
                />
              </div>
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
};

export default DetailsCentre;
