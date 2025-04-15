import React, { useEffect, useState } from "react";
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Paginator } from 'primereact/paginator';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChalkboardTeacher } from '@fortawesome/free-solid-svg-icons';
import AddCourses from './AddClasses';
import CoursesModal from './CoursesModal';

interface ClassesModalProps {
  visible: boolean;
  onHide: () => void;
  userId?: string; // ID de l'utilisateur dont on veut voir les cours
  readOnly?: boolean; // Si true, l'utilisateur ne peut pas modifier les cours
}

interface Course {
  id: string;
  title: string;
  description: string;
}

interface CourseGroup {
  groupName: string;
  courses: Course[];
}

const ClassesModal: React.FC<ClassesModalProps> = ({ visible, onHide, userId, readOnly = false }) => {
  const [courseGroups, setCourseGroups] = useState<CourseGroup[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [showCourseModal, setShowCourseModal] = useState(false);


  const fetchCourseGroups = async () => {
    // Même mockup de données que dans la page Classes
    const data = [
      {
        groupName: "Connaissance du Code de la route",
        courses: [
          { id: '1', title: 'Les panneaux de signalisation', description: 'Apprenez les différents types de panneaux de signalisation routière.' },
          { id: '2', title: 'Les règles de priorité', description: 'Comprenez les règles de priorité entre les véhicules et les piétons.' },
        ],
      },
      {
        groupName: "Pratique de la conduite",
        courses: [
          { id: '3', title: 'Conduite en ville', description: 'Apprenez à conduire en milieu urbain avec des conditions de circulation complexes.' },
          { id: '4', title: 'Conduite sur autoroute', description: 'Maîtrisez la conduite sur autoroute, y compris les dépassements et les entrées-sorties.' },
        ],
      },
      {
        groupName: "Conduite en conditions difficiles",
        courses: [
          { id: '5', title: 'Conduite sous la pluie', description: 'Apprenez à conduire sous la pluie en toute sécurité.' },
          { id: '6', title: 'Conduite sur neige', description: 'Comprenez les techniques nécessaires pour conduire sur des routes enneigées.' },
        ],
      },
      {
        groupName: "Sécurité routière",
        courses: [
          { id: '7', title: 'Port de la ceinture de sécurité', description: 'La ceinture de sécurité est essentielle pour la sécurité du conducteur et des passagers.' },
          { id: '8', title: 'Comportement en cas d\'accident', description: 'Que faire en cas d\'accident ? Apprenez les bonnes pratiques à adopter.' },
        ],
      },
      {
        groupName: "Conduite défensive",
        courses: [
          { id: '9', title: 'Anticipation des risques', description: 'Apprenez à anticiper les risques et à éviter les situations dangereuses.' },
          { id: '10', title: 'Régulation de la vitesse', description: 'Maintenez une vitesse adaptée aux conditions de la route et de circulation.' },
        ],
      },
      {
        groupName: "Conduite écologique",
        courses: [
          { id: '11', title: 'Réduire la consommation de carburant', description: 'Adoptez des comportements qui réduisent la consommation de carburant.' },
          { id: '12', title: 'Conduite avec un véhicule électrique', description: 'Découvrez les particularités de la conduite avec un véhicule électrique.' },
        ],
      },
      {
        groupName: "Le permis de conduire",
        courses: [
          { id: '13', title: 'Examen du code de la route', description: 'Préparez-vous à l\'examen théorique du code de la route.' },
          { id: '14', title: 'Examen de conduite', description: 'Préparez-vous à l\'examen pratique de la conduite.' },
        ],
      },
      {
        groupName: "Équipements et entretien du véhicule",
        courses: [
          { id: '15', title: 'Entretien basique', description: 'Apprenez à effectuer des vérifications basiques de votre véhicule.' },
          { id: '16', title: 'Changer un pneu', description: 'Découvrez comment changer un pneu en cas de crevaison.' },
        ],
      },
      {
        groupName: "Conduite avec des passagers",
        courses: [
          { id: '17', title: 'Sécurité des passagers', description: 'Assurez-vous que tous les passagers sont en sécurité pendant le trajet.' },
          { id: '18', title: 'Conduite avec des enfants', description: 'Apprenez les règles et les pratiques pour transporter des enfants en voiture.' },
        ],
      },
      {
        groupName: "Réglementation et législation",
        courses: [
          { id: '19', title: 'Limitations de vitesse', description: 'Apprenez les limitations de vitesse en fonction des types de routes.' },
          { id: '20', title: 'Amendes et infractions', description: 'Comprenez les différentes infractions et amendes au code de la route.' },
        ],
      },
    ];
    setCourseGroups(data);
  };

  useEffect(() => {
    if (visible) {
      fetchCourseGroups();
    }
  }, [visible, userId]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredCourseGroups = courseGroups.filter(group =>
    group.groupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.courses.some(course => course.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const paginate = (items: CourseGroup[], currentPage: number) => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return items.slice(start, end);
  };

  const currentCourseGroups = paginate(filteredCourseGroups, currentPage);

  const onPageChange = (e: any) => {
    setCurrentPage(e.page + 1);
    setItemsPerPage(e.rows);
  };

  // Fonction pour faire défiler jusqu'en haut de la modale
  const scrollToTop = () => {
    const modalContent = document.querySelector('.p-dialog-content');
    if (modalContent) {
      modalContent.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      dismissableMask={true}
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
            placeholder="Rechercher un cours ou un groupe de cours"
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
          onCourseAdded={() => {
            console.log('Cours ajouté ✅');
            // ici tu peux re-fetch ou update la liste
          }}
        />

        <Divider />

        <Paginator
          first={(currentPage - 1) * itemsPerPage}
          rows={itemsPerPage}
          totalRecords={filteredCourseGroups.length}
          onPageChange={onPageChange}
          rowsPerPageOptions={[5, 10, 20]}
          className="mb-3"
        />

        <Accordion multiple activeIndex={currentCourseGroups.map((_, index) => index)}>
          {currentCourseGroups.map((group, groupIndex) => (
            <AccordionTab key={groupIndex} header={group.groupName}>
              {group.courses.map((course) => (
                <div key={course.id}>
                  <Divider className="m-0" />
                  <div className="flex flex-column mb-3">
                    <h3 className="text-indigo-600">{course.title}</h3>
                    <p>{course.description}</p>
                    <Button
                      label="Voir le cours"
                      icon="pi pi-arrow-right"
                      className="button-text text-sm ml-auto"
                      onClick={() => {
                        setSelectedCourseId(course.id);
                        setShowCourseModal(true);
                      }}
                    />

                  </div>
                </div>
              ))}
            </AccordionTab>
          ))}
        </Accordion>

        <Paginator
          first={(currentPage - 1) * itemsPerPage}
          rows={itemsPerPage}
          totalRecords={filteredCourseGroups.length}
          onPageChange={onPageChange}
          rowsPerPageOptions={[5, 10, 20]}
          className="mt-3"
        />
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