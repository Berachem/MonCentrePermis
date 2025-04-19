import React, { useEffect, useState } from "react";
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { Paginator } from 'primereact/paginator';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChalkboardTeacher } from '@fortawesome/free-solid-svg-icons';
import AddCourses from './AddClasses';
import CoursesModal from './CoursesModal';
import { getRequest, postRequest } from "../../interfaces/utils/api";

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

const ClassesModal: React.FC<ClassesModalProps> = ({ visible, onHide, userId, readOnly = false }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      // Make sure to use the correct API path
      const response = await postRequest('/moniteurs/mycourses', { userId });
      setCourses(response);
    } catch (error) {
      console.error("Erreur lors du chargement des cours :", error);
      setError("Impossible de charger les cours. Veuillez réessayer plus tard.");
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
    setCurrentPage(1); // Reset to first page on search
  };

  const filteredCourses = courses.filter(course =>
    course.libelle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginate = (items: Course[], currentPage: number) => {
    const start = (currentPage - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  };

  const currentCourses = paginate(filteredCourses, currentPage);

  const onPageChange = (e: any) => {
    setCurrentPage(e.page + 1);
    setItemsPerPage(e.rows);
  };

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      dismissableMask
      showHeader={false}
      closeOnEscape
      position="bottom"
      className="rounded-t-xl overflow-hidden p-0"
      style={{ width: '100%', maxWidth: '900px' }}
      breakpoints={{ '960px': '95vw' }}
      contentStyle={{ padding: 0 }}
    >
      <div className="flex justify-between items-center p-2">
        <Button
          icon="pi pi-times"
          onClick={onHide}
          className="text-white p-button-text p-button-rounded p-button-plain ml-auto p-2"
          aria-label="Close"
        />
      </div>

      <div className="p-4 pt-12">
        <h2 className="text-center mb-4">
          <FontAwesomeIcon icon={faChalkboardTeacher} className="mr-2 text-indigo-600" />
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

        <Divider />

        {loading ? (
          <div className="text-center p-4">
            <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
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
              <>Aucun cours ne correspond à votre recherche "<strong>{searchQuery}</strong>"</>
            ) : (
              <>Vous n'avez pas encore de cours. Cliquez sur "Ajouter un cours" pour commencer.</>
            )}
          </div>
        ) : (
          <>
            <Paginator
              first={(currentPage - 1) * itemsPerPage}
              rows={itemsPerPage}
              totalRecords={filteredCourses.length}
              onPageChange={onPageChange}
              rowsPerPageOptions={[5, 10, 20]}
              className="mb-3"
            />

            {currentCourses.map((course) => (
              <div key={course.id} className="mb-4 border-b pb-2">
                <h3 className="text-indigo-600">{course.libelle}</h3>
                <Button
                  label="Voir le cours"
                  icon="pi pi-arrow-right"
                  className="button-text text-sm ml-auto"
                  onClick={() => {
                    setSelectedCourseId(course.id); // Récupérer l'id du cours
                    setShowCourseModal(true); // Afficher le modal pour voir le cours
                  }}
                />

              </div>
            ))}

            <Paginator
              first={(currentPage - 1) * itemsPerPage}
              rows={itemsPerPage}
              totalRecords={filteredCourses.length}
              onPageChange={onPageChange}
              rowsPerPageOptions={[5, 10, 20]}
              className="mt-3"
            />
          </>
        )}
      </div>

      <CoursesModal
        visible={showCourseModal}
        courseId={selectedCourseId}
        onHide={() => setShowCourseModal(false)}
      />
    </Dialog>
  );
};

export default ClassesModal;