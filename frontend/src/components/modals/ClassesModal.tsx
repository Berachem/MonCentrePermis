import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChalkboardTeacher } from "@fortawesome/free-solid-svg-icons";
import AddCourses from "../Classes/AddClasses";
import { useModal } from "../../contexts/ModalContext";
import { postRequest } from "../../interfaces/utils/api";
import CourseContent from "../../components/utils/CourseContent";
import ScrollableCourses, {
  Course as ScrollCourse,
} from "../../components/utils/ScrollableCourses";

interface ClassesModalProps {
  visible: boolean;
  onHide: () => void;
  userId?: string;
  readOnly?: boolean;
}

interface Course {
  id: string;
  libelle: string;
  description: string;
}

const ClassesModal: React.FC<ClassesModalProps> = ({
  visible,
  onHide,
  userId,
  readOnly = false,
}) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { openModal } = useModal();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await postRequest("/moniteurs/mycourses", { userId });
      setCourses(response);
    } catch (error) {
      console.error("Erreur lors du chargement des cours :", error);
      setError(
        "Impossible de charger les cours. Veuillez réessayer plus tard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchCourses();
    }
  }, [visible]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleAddCircuit = (courseId: string) => {
    // Fermer le modal avant de naviguer
    onHide();
    // Rediriger vers la page de création de circuit
    window.location.href = `/circuit/create/${courseId}`;
  };

  const handleEditCourse = (courseId: string) => {
    alert(`Modifier le cours ${courseId}`);
  };

  const handleDeleteCourse = (courseId: string) => {
    alert(`Supprimer le cours ${courseId}`);
  };

  // Gestionnaire pour la redirection vers la page d'édition de circuit
  const handleViewCircuit = (circuitId: number) => {
    console.log(`Redirection vers la page d'édition du circuit ${circuitId}`);
    // Fermer d'abord le modal
    onHide();
    // Ensuite rediriger vers la page d'édition
    window.location.href = `/circuit/edit/${circuitId}`;
  };

  const filteredCourses = courses.filter((course) =>
    course.libelle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      dismissableMask
      showHeader={false}
      closeOnEscape
      position="center"
      className="rounded-lg overflow-hidden p-0"
      style={{
        width: "95vw",
        height: "90vh",
        maxWidth: "1400px",
        margin: "auto",
      }}
      breakpoints={{ "960px": "98vw", "640px": "99vw" }}
      contentStyle={{ padding: 0, height: "100%" }}
      maximizable
    >
      <div className="flex justify-between items-center p-2">
        <Button
          icon="pi pi-times"
          onClick={onHide}
          className="text-white p-button-text p-button-rounded p-button-plain ml-auto p-2"
          aria-label="Close"
        />
      </div>

      <div
        className="p-4 pt-12 overflow-auto"
        style={{ maxHeight: "calc(90vh - 60px)" }}
      >
        <h2 className="text-center mb-4">
          <FontAwesomeIcon
            icon={faChalkboardTeacher}
            className="mr-2 text-indigo-600"
          />
          {readOnly ? "Cours" : "Mes cours"}
        </h2>

        <div className="p-inputgroup flex-1 mb-3">
          <span className="p-inputgroup-addon">
            <i className="pi pi-search"></i>
          </span>
          <InputText
            placeholder="Rechercher un cours"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        {!readOnly && (
          <Button
            icon="pi pi-plus"
            label="Ajouter un cours"
            className="p-button-rounded mb-3 text-sm w-full"
            onClick={() => setShowAddDialog(true)}
          />
        )}

        <AddCourses
          visible={showAddDialog}
          onHide={() => setShowAddDialog(false)}
          onCourseAdded={fetchCourses}
        />

        {loading ? (
          <div className="text-center p-4">
            <i
              className="pi pi-spin pi-spinner"
              style={{ fontSize: "2rem" }}
            ></i>
            <p className="mt-2">Chargement des cours...</p>
          </div>
        ) : error ? (
          <div className="text-center p-4 text-red-500">
            <i className="pi pi-exclamation-triangle mr-2"></i>
            {error}
            <Button
              label="Réessayer"
              className="mt-3 p-button-sm"
              onClick={fetchCourses}
            />
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center p-4">
            {searchQuery ? (
              <>
                Aucun cours ne correspond à votre recherche "
                <strong>{searchQuery}</strong>"
              </>
            ) : (
              <>
                Vous n'avez pas encore de cours. Cliquez sur "Ajouter un cours"
                pour commencer.
              </>
            )}
          </div>
        ) : (
          <ScrollableCourses
            courses={filteredCourses as ScrollCourse[]}
            readOnly={readOnly}
            onAddCircuit={handleAddCircuit}
            onEditCourse={handleEditCourse}
            onDeleteCourse={handleDeleteCourse}
            onViewCircuit={handleViewCircuit} // Passer la fonction de redirection
          />
        )}
      </div>
    </Dialog>
  );
};

export default ClassesModal;
