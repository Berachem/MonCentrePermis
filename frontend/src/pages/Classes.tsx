import React, { useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChalkboardTeacher } from "@fortawesome/free-solid-svg-icons";
import AddCourses from "../components/Classes/AddClasses";
import { postRequest, getRequest } from "../interfaces/utils/api";
import ScrollableClasses, {
  Course as ScrollCourse,
} from "../components/Classes/ScrollableClasses";
import CircuitLinker from "../components/Classes/CircuitLinker";
import EditClasseModal from "../components/Classes/EditClasseModal";
import ConfirmationDialog from "../components/Classes/ConfirmationDialog";
import { Toast } from "primereact/toast";
import { useParams, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import SideBarCustom from "../components/Home/SideBarCustom";

interface Course {
  id: string;
  libelle: string;
  description: string;
}

const Classes: React.FC = () => {
  const { userId: userIdParam } = useParams();
  const { userId: currentUserId } = useAuth();
  const navigate = useNavigate();
  
  // Fix: Properly check if we're viewing our own courses or someone else's
  const isOwnCourses = !userIdParam || userIdParam === currentUserId;
  
  // Use the URL parameter if provided, otherwise use current user's ID
  const userId = userIdParam || currentUserId;
  
  // Only set readOnly if we're viewing someone else's courses
  const readOnly = !isOwnCourses;

  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
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
          const instructorInfo = await getRequest(`/moniteurs/${userId}/info`) as { nom: string; prenom: string };
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
    // When userId changes, refresh courses
    fetchCourses();
    
    // Debug information to help diagnose issues
    console.log({
      userIdParam,
      currentUserId,
      isOwnCourses,
      readOnly
    });
  }, [userId]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleAddCircuit = (courseId: string) => {
    setLinkCourseId(courseId);
    setShowLinkDialog(true);
  };

  const createNew = () => {
    navigate(`/circuit/create/${linkCourseId}`);
  };

  const handleEditCourse = (courseId: string) => {
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

      toast.current?.show({
        severity: "success",
        summary: "Cours supprimé",
        detail: "Le cours a été supprimé avec succès",
      });

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
    if (!readOnly) {
      navigate(`/circuit/edit/${circuitId}`);
    } else {
      navigate(`/circuit/view/${circuitId}`);
    }
  };

  const handleRemoveCircuit = (circuitId: number, courseId: string) => {
    console.log(`Circuit ${circuitId} détaché du cours ${courseId}`);
    // Vous pourriez vouloir mettre à jour l'état ici
  };

  const filteredCourses = courses.filter((course) =>
    course.libelle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-1 md:p-4 pt-24 bg-gray-50 min-h-screen">
      <Toast ref={toast} />

      <SideBarCustom />

      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md md:p-6">
        <h2 className="text-center mb-8 text-2xl font-bold">
          <FontAwesomeIcon
            icon={faChalkboardTeacher}
            className="mr-3 text-green-800"
          />
          {instructorName && !isOwnCourses && (
            <span className="font-semibold">
              Cours de{" "}
              <span className="font-bold text-green-800 decoration-2 underline-offset-4">
                {instructorName}
              </span>{" "}
              <span className="text-sm font-normal text-gray-500 ml-2 bg-gray-100 px-2 py-1 rounded-full">
                (Lecture seule)
              </span>
            </span>
          )}
          {isOwnCourses && (
            <span className="font-semibold text-green-800">Mes cours</span>
          )}
        </h2>

        <div className="p-inputgroup flex-1 mb-5 shadow-sm h-11 border border-gray-200 rounded-lg">
          <span className="p-inputgroup-addon bg-green-100 border border-green-200 text-green-800">
            <i className="pi pi-search"></i>
          </span>
          <InputText
            placeholder="Rechercher un cours"
            value={searchQuery}
            onChange={handleSearchChange}
            className="border-green-200 focus:border-green-500 focus:shadow-lg focus:shadow-green-100 px-2"
          />
        </div>

        {!readOnly && (
          <Button
            icon="pi pi-plus"
            label="Ajouter un cours"
            className="mb-3 text-base w-full bg-green-800 hover:bg-green-700 border-green-900 px-4 py-2 h-auto text-white rounded-lg"
            onClick={() => setShowAddDialog(true)}
          />
        )}

        <AddCourses
          visible={showAddDialog}
          onHide={() => setShowAddDialog(false)}
          onCourseAdded={fetchCourses}
        />

        {loading ? (
          <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
            <i className="pi pi-spin pi-spinner text-4xl text-green-800"></i>
            <p className="mt-4 font-medium text-gray-600">Chargement des cours...</p>
          </div>
        ) : error ? (
          <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
            <i className="pi pi-exclamation-triangle text-3xl text-red-500 mb-2"></i>
            <p className="text-red-600 mb-4">{error}</p>
            <Button
              label="Réessayer"
              className="p-button-sm bg-green-800 hover:bg-green-700 border-green-900"
              onClick={fetchCourses}
            />
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
            {searchQuery ? (
              <>
                <i className="pi pi-search text-3xl text-gray-400 mb-3"></i>
                <p className="text-gray-600">
                  Aucun cours ne correspond à votre recherche "
                  <strong className="text-green-800">{searchQuery}</strong>"
                </p>
              </>
            ) : (
              <>
                <i className="pi pi-info-circle text-3xl text-gray-400 mb-3"></i>
                <p className="text-gray-600 mb-2">Vous n'avez pas encore de cours.</p>
                <p className="text-sm text-gray-500">
                  Cliquez sur "Ajouter un cours" pour commencer.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="border border-gray-100 rounded-lg overflow-hidden  md:p-4">
            <ScrollableClasses
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
          </div>
        )}
      </div>

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
      <EditClasseModal
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
  );
};

export default Classes;
