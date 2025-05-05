import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChalkboardTeacher } from "@fortawesome/free-solid-svg-icons";
import AddCourses from "../Classes/AddClasses";
import { useModal } from "../../contexts/ModalContext";
import { postRequest, getRequest } from "../../interfaces/utils/api";
import CourseContent from "../../components/utils/CourseContent";
import ScrollableCourses, {
  Course as ScrollCourse,
} from "../Classes/ScrollableCourses";
import CircuitLinker from "../Classes/CircuitLinker";
import EditCourseModal from "./EditCourseModal";
import ConfirmationDialog from "../utils/ConfirmationDialog";
import { Toast } from "primereact/toast";

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
  readOnly = true,
}) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { openModal } = useModal();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkCourseId, setLinkCourseId] = useState<string>("");
  const [instructorName, setInstructorName] = useState<string>("");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editCourseId, setEditCourseId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const toast = React.useRef<Toast>(null);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await postRequest("/moniteurs/mycourses", { userId });
      setCourses(response as Course[]);

      // Si userId est défini, récupérer les informations du moniteur
      if (userId) {
        try {
          interface InstructorInfo {
            nom: string;
            prenom: string;
          }

          const instructorInfo = await getRequest<InstructorInfo>(`/moniteurs/${userId}/info`);
          if (instructorInfo && instructorInfo.nom && instructorInfo.prenom) {
            setInstructorName(`${instructorInfo.prenom} ${instructorInfo.nom}`);
          }
        } catch (error) {
          console.error(
            "Erreur lors de la récupération du nom du moniteur:",
            error
          );
        }
      }
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
    setLinkCourseId(courseId);
    setShowLinkDialog(true);
  };

  const createNew = () => {
    window.location.href = `/circuit/create/${linkCourseId}`;
  };

  const onLinked = () => {
    // peut-être rafraîchir la liste ou afficher un toast
  };

  const handleEditCourse = (courseId: string) => {
    console.log(`Edition du cours ${courseId}`);
    setEditCourseId(courseId);
    setShowEditDialog(true);
  };

  const handleDeleteCourse = (courseId: string) => {
    setCourseToDelete(courseId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteCourse = async () => {
    if (!courseToDelete) return;

    setLoading(true);
    try {
      await postRequest(`/moniteurs/course/${courseToDelete}/delete`, {});

      // Afficher un message de succès
      toast.current?.show({
        severity: "success",
        summary: "Cours supprimé",
        detail: "Le cours a été supprimé avec succès",
      });

      // Rafraîchir la liste des cours
      fetchCourses();
    } catch (error) {
      console.error("Erreur lors de la suppression du cours:", error);
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Impossible de supprimer ce cours",
      });
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setCourseToDelete(null);
    }
  };

  const handleViewCircuit = (circuitId: number) => {
    console.log(`Redirection vers la page d'édition du circuit ${circuitId}`);
    // Fermer d'abord le modal
    onHide();
    // Ensuite rediriger vers la page d'édition ou afficher le circuit si lecture seule
    if (!readOnly) {
      window.location.href = `/circuit/edit/${circuitId}`;
    } else {
      window.location.href = `/circuit/view/${circuitId}`;
    }
  };

  const handleRemoveCircuit = (circuitId: number, courseId: string) => {
    console.log(`Circuit ${circuitId} détaché du cours ${courseId}`);
    // Vous pourriez vouloir rafraîchir les données ou mettre à jour l'état ici
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
        <Toast ref={toast} />

        <h2 className="text-center mb-4">
          <FontAwesomeIcon
            icon={faChalkboardTeacher}
            className="mr-2 text-indigo-600"
          />
          {instructorName && (
            <span className="font-semibold  text-indigo-700">
              Cours de{" "}
              <span className="font-bold text-indigo-900">
                {instructorName}
              </span>{" "}
              {readOnly && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  (Lecture seule)
                </span>
              )}
            </span>
          )}
          {!instructorName && (
            <p className="text-center font-semibold text-indigo-700">Cours</p>
          )}
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
            onViewCircuit={handleViewCircuit}
            onRemoveCircuit={(circuitId, courseId) => {
              handleRemoveCircuit(circuitId, courseId);
              fetchCourses(); // Refresh courses after removing a circuit
            }}
          />
        )}

        <CircuitLinker
          visible={showLinkDialog}
          moniteurId={userId!}
          coursId={linkCourseId}
          onHide={() => setShowLinkDialog(false)}
          onCreateNew={createNew}
          onLinked={() => {
            fetchCourses(); // Refresh courses after linking a circuit
            setShowLinkDialog(false);
          }}
        />

        {/* Modal pour éditer un cours */}
        <EditCourseModal
          visible={showEditDialog}
          courseId={editCourseId}
          onHide={() => {
            setShowEditDialog(false);
            setEditCourseId(null);
          }}
          onCourseUpdated={() => {
            fetchCourses(); // Rafraichir la liste des cours après modification
          }}
        />

        {/* Dialogue de confirmation pour la suppression */}
        <ConfirmationDialog
          visible={showDeleteConfirm}
          onHide={() => setShowDeleteConfirm(false)}
          onConfirm={confirmDeleteCourse}
          title="Confirmer la suppression"
          message="Êtes-vous sûr de vouloir supprimer ce cours ? Cette action est irréversible et supprimera également toutes les associations avec les circuits."
          confirmLabel="Supprimer"
          confirmIcon="pi pi-trash"
          severity="danger"
        />
      </div>
    </Dialog>
  );
};

export default ClassesModal;
