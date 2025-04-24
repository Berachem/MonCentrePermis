import React, { useState, useEffect, useRef } from "react";
import { CSSTransition } from "react-transition-group";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-routing-machine";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import { Toast } from "primereact/toast";
import { useNavigate, useLocation } from "react-router-dom";
import { getRequest } from "../../interfaces/utils/api";
import { Chip } from "primereact/chip";
import useAuth from "../../hooks/useAuth";
import Loader from "../../components/utils/Loader";
import { UserType } from "../../enum/user";
import { Accordion, AccordionTab } from "primereact/accordion";
import CourseContent from "../../components/utils/CourseContent";

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

// Interface pour une ville
interface Ville {
  id: number;
  libelle: string;
  latitude: string;
  longitude: string;
}

// Interface pour la réponse API d'un circuit
interface CircuitApiResponse {
  id: number;
  libelle: string;
  description: string;
  createur?: string;
  moniteur?: {
    id: number;
    nom: string;
    prenom: string;
  };
  ville_centre: string;
  points: string[];
}

// Interface pour la réponse API d'un point
interface PointApiResponse {
  id: number;
  latitude: string;
  longitude: string;
  description: string;
  rang: number;
  type: string;
}

// Interface pour la réponse API de la collection de circuits
interface CircuitsCollectionResponse {
  "@context": string;
  "@id": string;
  "@type": string;
  totalItems: number;
  member: CircuitApiResponse[];
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

// Fonction pour calculer la distance avec la formule de Haversine (en km)
const haversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

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
const ExamPage: React.FC = () => {
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

  // Définir la largeur du panneau de cours
  const COURSES_PANEL_WIDTH = isMobile ? "85%" : "400px";
  const COURSES_PANEL_WIDTH_COLLAPSED = "60px";

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

  // Styles
  const styles = {
    circuitSelectorButton: {
      position: "fixed" as const,
      bottom: "30px",
      left: "30px",
      zIndex: 1000,
    },
    mapContainer: {
      position: "relative" as const,
      height: "100vh",
      width: "100%",
    },
    map: {
      position: "absolute" as const,
      top: 0,
      left: 0,
      width: isMobile ? "100%" : `calc(100% - ${COURSES_PANEL_WIDTH})`,
      height: "100%",
      zIndex: 1,
      transition: "width 0.3s ease-in-out",
    },
    chipContainer: {
      position: "absolute" as const,
      top: "2%",
      left: isMobile ? "50%" : "40%", 
      transform: "translateX(-50%)",
      zIndex: 1000,
      display: "flex",
      justifyContent: "center",
      width: "80%",
    },
    coursesPanel: {
      position: "fixed" as const,
      top: 0,
      right: 0,
      height: "100vh",
      width: isMobile ? (coursesSliderVisible ? COURSES_PANEL_WIDTH : "0px") : COURSES_PANEL_WIDTH,
      backgroundColor: "white",
      boxShadow: "-2px 0 10px rgba(0, 0, 0, 0.1)",
      zIndex: 1000,
      padding: isMobile ? (coursesSliderVisible ? "20px" : "0px") : "20px",
      overflowY: "auto" as const,
      transition: "all 0.3s ease-in-out",
    },
    coursesToggleButton: {
      position: "fixed" as const,
      top: "50%",
      right: isMobile ? "0" : "auto",
      right: isMobile ? (coursesSliderVisible ? COURSES_PANEL_WIDTH : "0") : "auto",
      transform: "translateY(-50%)",
      zIndex: 1001,
      height: "50px",
      width: "30px",
      backgroundColor: "var(--primary-color)",
      borderRadius: "5px 0 0 5px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "-2px 0 5px rgba(0, 0, 0, 0.1)",
      cursor: "pointer",
      transition: "right 0.3s ease-in-out",
    },
    legendButton: {
      position: "fixed" as const,
      left: "30px",
      top: window.innerWidth <= 768 ? "220px" : "100px",
      zIndex: 1000,
    },
    legendContainer: {
      position: "fixed" as const,
      top: window.innerWidth <= 768 ? "200px" : "160px",
      left: "30px",
      zIndex: 1000,
      maxWidth: window.innerWidth <= 768 ? "240px" : "280px",
      transition: "all 0.3s ease",
    },
    legendCard: {
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      padding: window.innerWidth <= 768 ? "0.75rem" : "1rem",
      borderRadius: "0.75rem",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      border: "1px solid var(--surface-200)",
    },
    legendTitle: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "0.75rem",
      borderBottom: "1px solid var(--surface-200)",
      paddingBottom: "0.5rem",
    },
    legendItems: {
      display: "flex",
      flexDirection: "column" as const,
      gap: window.innerWidth <= 768 ? "0.5rem" : "0.75rem",
    },
    legendItem: {
      display: "flex",
      alignItems: "center",
      fontSize: window.innerWidth <= 768 ? "0.8rem" : "0.875rem",
      padding: "0.25rem 0",
    },
    legendIcon: {
      width: window.innerWidth <= 768 ? "20px" : "24px",
      height: window.innerWidth <= 768 ? "20px" : "24px",
      marginRight: window.innerWidth <= 768 ? "0.5rem" : "0.75rem",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    colorBox: {
      width: "1rem",
      height: "1rem",
      marginRight: "0.25rem",
      borderRadius: "50%",
    },
  };

  const mapStyle = styles.map;

  return (
    <div style={styles.mapContainer}>
      <Toast ref={toast} />

      {/* Loader comme sur la homepage */}
      {isLoading && (
        <div className="loader-container">
          <Loader />
        </div>
      )}

      <div
        style={styles.chipContainer}
        className="flex gap-2 justify-content-center flex-column align-items-center"
      >
        <Button
          icon="pi pi-arrow-left"
          className="p-button-rounded shadow-4"
          onClick={() => navigate("/")}
          label="Retour"
          severity="secondary"
          tooltipOptions={{ position: "top" }}
        />
        {centre && (
          <div className="flex flex-column align-items-center gap-2 p-2 border-round-lg shadow-2 animate__animated animate__fadeIn">
            <Chip
              label={centre.name}
              className="bg-primary text-white font-bold border-0 py-2"
              icon="pi pi-map-marker"
            />
            {currentCircuit && (
              <div className="flex flex-column align-items-center gap-1 w-full">
                <div className="text-sm text-900 bg-primary-50 px-3 py-2 border-round-lg border-1 border-primary-100 w-full text-center">
                  <div className="flex align-items-center justify-content-center gap-2">
                    <i className="pi pi-user text-primary-700"></i>
                    <span className="font-medium">
                      {currentCircuit.moniteur
                        ? `Moniteur: ${currentCircuit.moniteur.prenom} ${currentCircuit.moniteur.nom}`
                        : "Circuit sans moniteur"}
                    </span>
                  </div>
                  {currentCircuit.createur?.date && (
                    <div className="text-xs text-600 mt-1">
                      Créé le{" "}
                      {new Date(
                        currentCircuit.createur.date
                      ).toLocaleDateString()}
                    </div>
                  )}
                  {userRole === UserType.Teacher &&
                    typeUserid.toString() ===
                      currentCircuit.moniteur?.id?.toString() && (
                      <div className="mt-2 flex justify-content-center">
                        <Button
                          icon="pi pi-pencil"
                          label="Modifier"
                          className="p-button-sm p-button-outlined"
                          onClick={() =>
                            navigate(`/circuit/edit/${currentCircuit.id}`)
                          }
                        />
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={styles.legendButton}>
        <Button
          icon={legendVisible ? "pi pi-eye-slash" : "pi pi-info-circle"}
          className="p-button-rounded p-button-info shadow-4 border-primary"
          onClick={() => setLegendVisible(!legendVisible)}
          tooltipOptions={{ position: "right" }}
        />
      </div>

      {/* Bouton de toggle pour les cours sur mobile */}
      {isMobile && (
        <div 
          style={styles.coursesToggleButton}
          onClick={() => setCoursesSliderVisible(!coursesSliderVisible)}
        >
          <i className={`pi ${coursesSliderVisible ? "pi-chevron-right" : "pi-chevron-left"} text-white`}></i>
        </div>
      )}

      {/* Panneau latéral pour les cours - adapté pour mobile */}
      <div style={styles.coursesPanel}>
        {(!isMobile || coursesSliderVisible) && (
          <>
            <div className="flex justify-content-between align-items-center mb-4">
              <h2 className="text-xl font-bold">Cours associés</h2>
              {isMobile && (
                <Button 
                  icon="pi pi-times" 
                  className="p-button-rounded p-button-text bg-white" 
                  onClick={() => setCoursesSliderVisible(false)} 
                />
              )}
            </div>

            {loadingCourses ? (
              <div className="flex flex-column align-items-center justify-content-center p-5 h-full">
                <i className="pi pi-spin pi-spinner text-primary" style={{ fontSize: '2rem' }}></i>
                <p className="mt-3">Chargement des cours...</p>
              </div>
            ) : associatedCourses.length === 0 ? (
              <div className="flex flex-column align-items-center justify-content-center p-5">
                <i className="pi pi-book text-500" style={{ fontSize: '2rem' }}></i>
                <p className="mt-3 text-center">Aucun cours n'est associé à ce circuit.</p>
                {userRole === UserType.Teacher && currentCircuit && (
                  <Button
                    icon="pi pi-plus"
                    label="Ajouter un cours"
                    className="p-button-outlined mt-4"
                    onClick={() => alert("TODO - Ajouter un cours")}
                  />
                )}
                <div className="mt-5 border-top-1 border-200 pt-4 w-full">
                  <h3 className="text-lg font-semibold text-primary">Comment utiliser ce circuit?</h3>
                  <ul className="list-none p-0 mt-3">
                    <li className="flex align-items-center mb-2">
                      <i className="pi pi-map text-primary mr-2"></i>
                      <span>Explorez les points d'intérêt sur la carte</span>
                    </li>
                    <li className="flex align-items-center mb-2">
                      <i className="pi pi-info-circle text-primary mr-2"></i>
                      <span>Cliquez sur les marqueurs pour plus d'informations</span>
                    </li>
                    <li className="flex align-items-center mb-2">
                      <i className="pi pi-car text-primary mr-2"></i>
                      <span>Suivez les instructions du moniteur</span>
                    </li>
                    <li className="flex align-items-center mb-2">
                      <i className="pi pi-check-circle text-primary mr-2"></i>
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
                    const courseId = e.index !== null ? associatedCourses[e.index].id : null;
                    setExpandedCourseId(courseId);
                  }}
                  className="courses-accordion"
                >
                  {associatedCourses.map((course) => (
                    <AccordionTab
                      key={course.id}
                      header={
                        <div className="flex align-items-center">
                          <i className="pi pi-book text-primary mr-2"></i>
                          <span>{course.libelle}</span>
                        </div>
                      }
                    >
                      <div className="p-3">
                        <CourseContent content={course.description} className="p-3 bg-gray-50 border-round" />
                      </div>
                    </AccordionTab>
                  ))}
                </Accordion>
                
                <div className="mt-4 p-3 border-round bg-primary-50 border-1 border-primary-100">
                  <h3 className="text-lg font-semibold text-primary">Conseils de révision</h3>
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

      {/* Légende des icônes */}
      {legendVisible && (
        <div
          style={styles.legendContainer}
          className="animate__animated animate__fadeInLeft"
        >
          <div style={styles.legendCard}>
            <div style={styles.legendTitle}>
              <span className="text-lg font-medium">Légende</span>
              <Button
                icon="pi pi-times"
                className="p-button-text p-button-rounded p-button-sm bg-white"
                onClick={() => setLegendVisible(false)}
              />
            </div>
            <div style={styles.legendItems}>
              {pointTypes.map((type) => (
                <div key={type.value} style={styles.legendItem}>
                  <div
                    style={styles.legendIcon}
                    dangerouslySetInnerHTML={{ __html: type.svgIcon }}
                  ></div>
                  <span className="text-700">{type.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={mapStyle}>
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
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
              <Popup>
                <span className="font-medium">{point.libelle}</span>

                {point.description && (
                  <>
                    <hr className="my-2" />
                    <div className="flex align-items-center mt-2">
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
      </div>

      <div style={styles.circuitSelectorButton}>
        <Button
          icon="pi pi-flag"
          label={isMobile ? undefined : `Sélectionner un circuit`}
          className="p-button-rounded shadow-4"
          onClick={() => setCircuitModalVisible(true)}
          tooltip={
            isMobile ? `Circuits disponibles (${circuits.length})` : undefined
          }
          tooltipOptions={{ position: "top" }}
          disabled={circuits.length === 0}
          badge={!isMobile ? circuits.length.toString() : undefined}
          badgeClassName="bg-info"
        />
      </div>

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
          <div className="flex justify-content-between align-items-center p-3 border-200">
            <h2 className="text-xl font-bold m-0">Sélectionner un circuit</h2>
            <Button
              icon="pi pi-times"
              className="p-button-text p-button-rounded text-white"
              onClick={() => setCircuitModalVisible(false)}
            />
          </div>

          <div className="p-2 bg-info-50 text-info-900 text-center border-bottom-1 p-3 border-200">
            <i className="pi pi-info-circle mr-2"></i>
            Circuits disponibles à moins de {MAX_DISTANCE} km du centre d'examen
          </div>

          {circuits.map((circuit) => (
            <div
              key={circuit.id}
              className={`p-3 border-bottom-1 border-200 cursor-pointer transition-colors transition-duration-300 hover:surface-hover ${
                selectedCircuit === circuit.nom ? "bg-primary-50" : ""
              }`}
              onClick={() => handleCircuitSelection(circuit.nom)}
            >
              <div className="relative">
                <div className="flex align-items-center justify-content-between">
                  <div className="flex align-items-center">
                    <Avatar
                      icon="pi pi-flag"
                      className="mr-2"
                      style={{
                        backgroundColor: "var(--primary-color)",
                        color: "#fff",
                      }}
                    />
                    <div className="flex flex-column">
                      <div className="flex align-items-center gap-1">
                        <span className="font-medium text-900">
                          {circuit.nom}
                        </span>
                        <span className="text-xs bg-primary-50 text-primary-700 px-2 py-1 border-round">
                          {circuit.points.length} points
                        </span>
                      </div>

                      <div className="flex flex-column mt-1 gap-1">
                        {circuit.moniteur && (
                          <div className="flex align-items-center text-sm text-blue-700">
                            <i className="pi pi-user mr-1"></i>
                            <span>
                              {circuit.moniteur.prenom} {circuit.moniteur.nom}
                            </span>
                          </div>
                        )}

                        {circuit.createur && (
                          <div className="flex align-items-center text-xs text-500">
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
                          <p className="text-sm text-600 mt-1 mb-1 line-height-2 border-top-1 border-200 pt-2">
                            {circuit.description}
                          </p>
                        )}

                        {selectedCircuit === circuit.nom && (
                          <span className="mr-2 font-medium flex align-items-center text-green-500">
                            <span className="lg:hidden flex">
                              appliqué
                              <i className="pi pi-check-circle ml-1"></i>
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex align-items-center">
                    {selectedCircuit === circuit.nom && (
                      <span className="mr-2 font-medium flex align-items-center text-green-500">
                        <span className="hidden lg:flex">
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
                      } text-primary cursor-pointer p-1`}
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
                    "max-h-30rem opacity-100 transition-all transition-duration-300",
                  exit: "max-h-30rem opacity-100 overflow-hidden",
                  exitActive:
                    "max-h-0 opacity-0 transition-all transition-duration-300",
                }}
                unmountOnExit
              >
                <div className="mt-3 pt-2 border-top-1 border-100">
                  {circuit.points.length > 0 ? (
                    circuit.points
                      .sort((a, b) => a.rang - b.rang)
                      .map((point, index) => (
                        <div
                          key={point.id}
                          className="flex align-items-center py-2 ml-2"
                        >
                          <span
                            className="flex justify-content-center align-items-center border-circle w-2rem h-2rem mr-2 text-white text-xs font-medium"
                            style={{
                              backgroundColor:
                                pointTypes.find((pt) => pt.value === point.type)
                                  ?.color || "#9C27B0",
                            }}
                          >
                            {index + 1}
                          </span>
                          <i className="pi pi-map-marker text-primary mr-2"></i>
                          <span className="text-900">{point.libelle}</span>
                          <Chip
                            label={point.description}
                            className="ml-2 bg-primary-50 text-primary-900 font-medium"
                            style={{ fontSize: "0.8rem" }}
                          />
                        </div>
                      ))
                  ) : (
                    <div className="p-2 text-500">
                      Aucun point défini pour ce circuit.
                    </div>
                  )}
                </div>
              </CSSTransition>
            </div>
          ))}
          
          {circuits.length === 0 && userRole !== UserType.Teacher && (
            <div className="p-4 text-center text-500">
              Aucun circuit disponible à moins de {MAX_DISTANCE} km du centre.
            </div>
          )}

          {circuits.length === 0 && userRole === UserType.Teacher && (
            <div className="p-4 text-center text-500">
              Malheureusement, aucun circuit n'est disponible à moins de{" "}
              {MAX_DISTANCE} km du centre.
              <br />
              <div className="text-900 font-bold mt-2 flex flex-column align-items-center mt-5">
                <span className="text-900 font-bold">
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

      {/* CSS pour animations et styles */}
      <style>{`
        .courses-accordion .p-accordion-header-link {
          background-color: var(--surface-0);
          border-radius: 6px;
          margin-bottom: 8px;
          transition: all 0.2s;
        }
        
        .courses-accordion .p-accordion-header-link:hover {
          background-color: var(--surface-50);
        }
        
        .courses-accordion .p-accordion-content {
          background-color: var(--surface-0);
          padding: 0;
          border-radius: 0 0 6px 6px;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        
        /* Styles pour le panneau mobile */
        @media screen and (max-width: 768px) {
          .course-slider-enter {
            transform: translateX(100%);
          }
          
          .course-slider-enter-active {
            transform: translateX(0);
            transition: transform 0.3s;
          }
          
          .course-slider-exit {
            transform: translateX(0);
          }
          
          .course-slider-exit-active {
            transform: translateX(100%);
            transition: transform 0.3s;
          }
        }
      `}</style>
    </div>
  );
};

export default ExamPage;
