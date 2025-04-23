import React, { useState, useEffect } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import CourseContent from "./CourseContent";
import { Button } from "primereact/button";
import { Circuit } from "../../interfaces/circuit.interface";
import { getRequest } from "../../interfaces/utils/api";

export interface Course {
  id: string;
  libelle: string;
  description: string;
}

interface AssociatedCircuit {
  id: number;
  libelle: string;
  description?: string;
  ville_centre?: string;
}

interface ScrollableCoursesProps {
  courses: Course[];
  readOnly?: boolean;
  onAddCircuit?: (courseId: string) => void;
  onEditCourse?: (courseId: string) => void;
  onDeleteCourse?: (courseId: string) => void;
  onViewCircuit?: (circuitId: number) => void;
}

const ScrollableCourses: React.FC<ScrollableCoursesProps> = ({
  courses,
  readOnly = true,
  onAddCircuit,
  onEditCourse,
  onDeleteCourse,
  onViewCircuit = (circuitId) => alert(`Redirection vers le circuit ${circuitId}`)
}) => {
  // État pour stocker les circuits associés pour chaque cours
  const [courseCircuits, setCourseCircuits] = useState<{[courseId: string]: AssociatedCircuit[]}>({});
  const [loadingCircuits, setLoadingCircuits] = useState<{[courseId: string]: boolean}>({});
  const [error, setError] = useState<string | null>(null);
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
  
  // Fonction pour récupérer les circuits associés à un cours
  const fetchCircuitsForCourse = async (courseId: string) => {
    if (loadingCircuits[courseId]) return;
    
    setLoadingCircuits(prev => ({ ...prev, [courseId]: true }));
    try {
      console.log(`Chargement des circuits pour le cours ${courseId}...`);
      
      // Corriger l'URL: enlever le préfixe /api/ puisqu'il est déjà inclus dans votre configuration
      const circuits = await getRequest<AssociatedCircuit[]>(`/circuits/bycours/${courseId}`);
      
      if (circuits && Array.isArray(circuits)) {
        console.log(`${circuits.length} circuits trouvés pour le cours ${courseId}:`, circuits);
        setCourseCircuits(prev => ({ ...prev, [courseId]: circuits }));
      } else {
        // Fallback: Récupérer avec l'approche en deux étapes
        console.log("Utilisation de la méthode fallback pour récupérer les circuits...");
        
        const response = await getRequest<{
          "hydra:member": { circuit: string }[]
        }>(`/circuit_cours?cours=${courseId}`);
        
        console.log("Réponse circuit_cours:", response);
        
        if (!response || !response["hydra:member"]) {
          throw new Error("Format de réponse incorrect");
        }
        
        // Extraire les IDs des circuits à partir des IRIs
        const circuitIds = response["hydra:member"].map(item => {
          const parts = item.circuit.split('/');
          return parts[parts.length - 1];
        });
        
        console.log("IDs de circuits extraits:", circuitIds);
        
        // Récupérer les détails de chaque circuit
        const fetchedCircuits: AssociatedCircuit[] = [];
        for (const id of circuitIds) {
          const circuitData = await getRequest<AssociatedCircuit>(`/circuits/${id}`);
          if (circuitData) {
            fetchedCircuits.push(circuitData);
          }
        }
        
        console.log(`${fetchedCircuits.length} circuits récupérés avec succès:`, fetchedCircuits);
        setCourseCircuits(prev => ({ ...prev, [courseId]: fetchedCircuits }));
      }
    } catch (err) {
      console.error(`Erreur lors du chargement des circuits pour le cours ${courseId}:`, err);
      setError(`Impossible de charger les circuits associés au cours.`);
      setCourseCircuits(prev => ({ ...prev, [courseId]: [] }));
    } finally {
      setLoadingCircuits(prev => ({ ...prev, [courseId]: false }));
    }
  };
  
  // Charger les circuits pour le cours actif lorsque l'onglet change
  const handleTabChange = (e: { index: number }) => {
    setActiveTabIndex(e.index);
    if (courses[e.index]) {
      const courseId = courses[e.index].id;
      console.log(`Changement d'onglet vers le cours ${courseId} (index: ${e.index})`);
      if (!courseCircuits[courseId] && !loadingCircuits[courseId]) {
        fetchCircuitsForCourse(courseId);
      }
    }
  };
  
  // Charger les circuits pour le premier cours au chargement initial
  useEffect(() => {
    if (courses.length > 0) {
      const courseId = courses[0].id;
      console.log(`Chargement initial pour le cours ${courseId}`);
      fetchCircuitsForCourse(courseId);
    }
  }, [courses]);

  return (
    <div className="card w-full">
      <TabView 
        scrollable 
        className="w-full h-full" 
        onTabChange={handleTabChange}
        activeIndex={activeTabIndex}
      >
        {courses.map((course, index) => (
          <TabPanel key={course.id} header={course.libelle}>
            {/* Circuits associés */}
            <div className="flex flex-column md:flex-row justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Circuits associés : </h2>
              {/* Affichage des circuits */}
              <div className="flex flex-wrap gap-2">
                {loadingCircuits[course.id] && (
                  <div className="text-center p-2">
                    <i className="pi pi-spin pi-spinner" style={{ fontSize: '1.5rem' }}></i>
                    <div>Chargement des circuits...</div>
                  </div>
                )}
                
                {!loadingCircuits[course.id] && courseCircuits[course.id]?.length === 0 && (
                  <div className="text-gray-500 italic p-2">Aucun circuit associé à ce cours</div>
                )}
                
                {!loadingCircuits[course.id] && courseCircuits[course.id]?.map(circuit => (
                  <Button
                    key={circuit.id}
                    icon="pi pi-map"
                    label={circuit.libelle}
                    className="p-button-outlined ml-4"
                    severity="info"
                    tooltip={circuit.description || "Aucune description disponible"}
                    onClick={() => onViewCircuit(circuit.id)}
                  />
                ))}
              </div>
              {!readOnly && onAddCircuit && (
                <Button
                  icon="pi pi-plus"
                  label="Ajouter un circuit"
                  className="p-button-outlined ml-4"
                  onClick={() => onAddCircuit(course.id)}
                />
              )}
            </div>

            <CourseContent
              content={course.description}
              className="p-4 bg-gray-100 rounded-lg shadow-md w-full"
            />
            {/* Modifier / Supprimer */}
            {!readOnly && (
              <div className="flex justify-between items-center mb-4 mt-4">
                <Button
                  icon="pi pi-pencil"
                  label="Modifier"
                  className="p-button-outlined"
                  onClick={() => onEditCourse ? onEditCourse(course.id) : alert(`TODO Modifier le cours ${course.id}`)}
                />
                <Button
                  icon="pi pi-trash"
                  label="Supprimer"
                  className="p-button-outlined p-button-danger"
                  onClick={() => onDeleteCourse ? onDeleteCourse(course.id) : alert(`TODO Supprimer le cours ${course.id}`)}
                />
              </div>
            )}
          </TabPanel>
        ))}
      </TabView>
      
      {error && (
        <div className="p-message p-message-error mt-3">
          <div className="p-message-text">{error}</div>
        </div>
      )}
    </div>
  );
};

export default ScrollableCourses;
