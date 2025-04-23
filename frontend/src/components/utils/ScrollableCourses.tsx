import React, { useState, useEffect } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import CourseContent from "./CourseContent";
import { Button } from "primereact/button";
import { Circuit } from "../../interfaces/circuit.interface";
import { getRequest, postRequest } from "../../interfaces/utils/api";
import ConfirmationDialog from "./ConfirmationDialog";
import { Toast } from "primereact/toast";

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
  onRemoveCircuit?: (circuitId: number, courseId: string) => void;
}

const ScrollableCourses: React.FC<ScrollableCoursesProps> = ({
  courses,
  readOnly = true,
  onAddCircuit,
  onEditCourse,
  onDeleteCourse,
  onViewCircuit = (circuitId) =>
    alert(`Redirection vers le circuit ${circuitId}`),
  onRemoveCircuit,
}) => {
  const [courseCircuits, setCourseCircuits] = useState<{
    [courseId: string]: AssociatedCircuit[];
  }>({});
  const [loadingCircuits, setLoadingCircuits] = useState<{
    [courseId: string]: boolean;
  }>({});
  const [error, setError] = useState<string | null>(null);
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
  const [confirmDialogVisible, setConfirmDialogVisible] =
    useState<boolean>(false);
  const [circuitToRemove, setCircuitToRemove] = useState<{
    id: number;
    libelle: string;
    courseId: string;
  } | null>(null);
  const toast = React.useRef<Toast>(null);

  const fetchCircuitsForCourse = async (courseId: string) => {
    if (loadingCircuits[courseId]) return;

    setLoadingCircuits((prev) => ({ ...prev, [courseId]: true }));
    try {
      console.log(`Chargement des circuits pour le cours ${courseId}...`);

      const circuits = await getRequest<AssociatedCircuit[]>(
        `/circuits/bycours/${courseId}`
      );

      if (circuits && Array.isArray(circuits)) {
        console.log(
          `${circuits.length} circuits trouvés pour le cours ${courseId}:`,
          circuits
        );
        setCourseCircuits((prev) => ({ ...prev, [courseId]: circuits }));
      } else {
        console.log(
          "Utilisation de la méthode fallback pour récupérer les circuits..."
        );

        const response = await getRequest<{
          "hydra:member": { circuit: string }[];
        }>(`/circuit_cours?cours=${courseId}`);

        console.log("Réponse circuit_cours:", response);

        if (!response || !response["hydra:member"]) {
          throw new Error("Format de réponse incorrect");
        }

        const circuitIds = response["hydra:member"].map((item) => {
          const parts = item.circuit.split("/");
          return parts[parts.length - 1];
        });

        console.log("IDs de circuits extraits:", circuitIds);

        const fetchedCircuits: AssociatedCircuit[] = [];
        for (const id of circuitIds) {
          const circuitData = await getRequest<AssociatedCircuit>(
            `/circuits/${id}`
          );
          if (circuitData) {
            fetchedCircuits.push(circuitData);
          }
        }

        console.log(
          `${fetchedCircuits.length} circuits récupérés avec succès:`,
          fetchedCircuits
        );
        setCourseCircuits((prev) => ({ ...prev, [courseId]: fetchedCircuits }));
      }
    } catch (err) {
      console.error(
        `Erreur lors du chargement des circuits pour le cours ${courseId}:`,
        err
      );
      setError(`Impossible de charger les circuits associés au cours.`);
      setCourseCircuits((prev) => ({ ...prev, [courseId]: [] }));
    } finally {
      setLoadingCircuits((prev) => ({ ...prev, [courseId]: false }));
    }
  };

  const handleTabChange = (e: { index: number }) => {
    setActiveTabIndex(e.index);
    if (courses[e.index]) {
      const courseId = courses[e.index].id;
      console.log(
        `Changement d'onglet vers le cours ${courseId} (index: ${e.index})`
      );
      if (!courseCircuits[courseId] && !loadingCircuits[courseId]) {
        fetchCircuitsForCourse(courseId);
      }
    }
  };

  useEffect(() => {
    if (courses.length > 0) {
      const courseId = courses[0].id;
      console.log(`Chargement initial pour le cours ${courseId}`);
      fetchCircuitsForCourse(courseId);
    }
  }, [courses]);

  const handleRemoveCircuit = async () => {
    if (!circuitToRemove) return;

    try {
      const response = await postRequest("/circuits/unlink-circuit-cours", {
        circuit: circuitToRemove.id,
        cours: circuitToRemove.courseId,
      });

      setCourseCircuits((prev) => ({
        ...prev,
        [circuitToRemove.courseId]:
          prev[circuitToRemove.courseId]?.filter(
            (c) => c.id !== circuitToRemove.id
          ) || [],
      }));

      toast.current?.show({
        severity: "success",
        summary: "Circuit détaché",
        detail: `Le circuit "${circuitToRemove.libelle}" a été détaché du cours.`,
      });

      if (onRemoveCircuit) {
        onRemoveCircuit(circuitToRemove.id, circuitToRemove.courseId);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de la liaison:", error);
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail:
          "Impossible de supprimer la liaison entre le circuit et le cours.",
      });
    }

    setCircuitToRemove(null);
  };

  const confirmRemoveCircuit = (
    circuit: AssociatedCircuit,
    courseId: string
  ) => {
    setCircuitToRemove({
      id: circuit.id,
      libelle: circuit.libelle,
      courseId,
    });
    setConfirmDialogVisible(true);
  };

  return (
    <div className="card w-full">
      <Toast ref={toast} />

      <TabView
        scrollable
        className="w-full h-full"
        onTabChange={handleTabChange}
        activeIndex={activeTabIndex}
      >
        {courses.map((course, index) => (
          <TabPanel key={course.id} header={course.libelle}>
            <div className="flex flex-column md:flex-row justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Circuits associés : </h2>
              <div className="flex flex-wrap gap-2">
                {loadingCircuits[course.id] && (
                  <div className="text-center p-2">
                    <i
                      className="pi pi-spin pi-spinner"
                      style={{ fontSize: "1.5rem" }}
                    ></i>
                    <div>Chargement des circuits...</div>
                  </div>
                )}

                {!loadingCircuits[course.id] &&
                  courseCircuits[course.id]?.length === 0 && (
                    <div className="text-gray-500 italic p-2">
                      Aucun circuit associé à ce cours
                    </div>
                  )}

                {!loadingCircuits[course.id] &&
                  courseCircuits[course.id]?.map((circuit) => (
                    <div key={circuit.id} className="flex items-center">
                      <Button
                        icon="pi pi-map"
                        label={circuit.libelle}
                        className="p-button-outlined"
                        severity="info"
                        tooltip={
                          circuit.description || "Aucune description disponible"
                        }
                        onClick={() => onViewCircuit(circuit.id)}
                      />

                      {!readOnly && (
                        <Button
                          icon="pi pi-times"
                          className="p-button-rounded p-button-danger p-button-text ml-1 bg-white hover:bg-red-100 border border-red-500"
                          onClick={() =>
                            confirmRemoveCircuit(circuit, course.id)
                          }
                          tooltip="Détacher ce circuit du cours"
                        />
                      )}
                    </div>
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
            {!readOnly && (
              <div className="flex justify-between items-center mb-4 mt-4">
                <Button
                  icon="pi pi-pencil"
                  label="Modifier"
                  className="p-button-outlined"
                  onClick={() =>
                    onEditCourse
                      ? onEditCourse(course.id)
                      : alert(`TODO Modifier le cours ${course.id}`)
                  }
                />
                <Button
                  icon="pi pi-trash"
                  label="Supprimer"
                  className="p-button-outlined p-button-danger"
                  onClick={() =>
                    onDeleteCourse
                      ? onDeleteCourse(course.id)
                      : alert(`TODO Supprimer le cours ${course.id}`)
                  }
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

      <ConfirmationDialog
        visible={confirmDialogVisible}
        onHide={() => setConfirmDialogVisible(false)}
        onConfirm={handleRemoveCircuit}
        title="Confirmer le détachement"
        message={`Êtes-vous sûr de vouloir détacher le circuit "${circuitToRemove?.libelle}" de ce cours ? Cette action ne supprime pas le circuit lui-même.`}
        confirmLabel="Détacher"
        confirmIcon="pi pi-unlink"
        severity="warning"
      />
    </div>
  );
};

export default ScrollableCourses;
