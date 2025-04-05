import React, { useEffect, useState } from 'react';
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Card } from 'primereact/card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChalkboardTeacher, faList } from '@fortawesome/free-solid-svg-icons';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Paginator } from 'primereact/paginator';
import { InputText } from 'primereact/inputtext';

interface Course {
  id: string;
  title: string;
  description: string;
}

interface CourseGroup {
  groupName: string;
  courses: Course[];
}

const Classes: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [courseGroups, setCourseGroups] = useState<CourseGroup[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCourseGroups = async () => {
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
    if (!isAuthenticated) {
      navigate('/');
    }
    fetchCourseGroups();
  }, [isAuthenticated, navigate]);

  //recherche
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredCourseGroups = courseGroups.filter(group =>
    group.groupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.courses.some(course => course.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  //pagination
  const paginate = (items: CourseGroup[], currentPage: number) => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return items.slice(start, end);
  };
  const currentCourseGroups = paginate(filteredCourseGroups, currentPage);

  const onPageChange = (e: any) => {
    setCurrentPage(e.page + 1)
    setItemsPerPage(e.rows);
  };

  //scroll top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="justify-center items-center min-h-screen bg-gray-100 p-4 md:px-8">
      <Card className="md:mx-8 mb-4">
          <h1 className="font-semibold text-center">
            <FontAwesomeIcon icon={faChalkboardTeacher} className="mr-2 text-indigo-600" />
            Mes cours
          </h1>

          <div className="p-inputgroup flex-1">
              <span className="p-inputgroup-addon">
                  <i className="pi pi-search"></i>
              </span>
              <InputText 
                placeholder="Rechercher un cour ou un groupe de cours" 
                value={searchQuery}
                onChange={handleSearchChange}
              />
          </div>

          <Button 
            icon="pi pi-plus"
            label="Ajouter un cour"
            className="p-button-rounded mt-2 text-sm w-full" 
            onClick={() => console.log('Ajouter un cours')} 
          />

      </Card>

      <Paginator
        first={(currentPage - 1) * itemsPerPage}
        rows={itemsPerPage}
        totalRecords={searchQuery.trim() === '' ? courseGroups.length : filteredCourseGroups.length}
        onPageChange={onPageChange}
        rowsPerPageOptions={[5, 10, 20]}
        className="md:mx-8 mx-auto mb-2"
      />

      <Accordion multiple className="md:mx-8" activeIndex={currentCourseGroups.map((_, index) => index)}>
        {currentCourseGroups.map((group, groupIndex) => (
          <AccordionTab key={groupIndex} header={group.groupName}>
            {group.courses.map((course) => (
              <div key={course.id}>
                <Divider className="m-0" />
                <div className="flex flex-column mb-3">
                  <h3 className="text-indigo-600">{course.title}</h3>
                  <p>{course.description}</p>
                  <Button label="Voir le cours" icon="pi pi-arrow-right" className="button-text text-sm ml-auto" />
                </div>
              </div>
            ))}
          </AccordionTab>
        ))}
      </Accordion>

      <Paginator
        first={(currentPage - 1) * itemsPerPage}
        rows={itemsPerPage}
        totalRecords={searchQuery.trim() === '' ? courseGroups.length : filteredCourseGroups.length}
        onPageChange={onPageChange}
        rowsPerPageOptions={[5, 10, 20]}
        className="p-mt-3 md:mx-8 mx-auto"
      />


      <Button 
        icon="pi pi-plus"
        className="p-button-rounded fixed bottom-0 right-0 mr-2 mb-8" 
        onClick={() => console.log('Ajouter un cours')} 
      />
      
      <Button 
        icon="pi pi-arrow-up" 
        className="p-button-rounded fixed bottom-0 right-0 mr-2 mb-4" 
        onClick={scrollToTop} 
      />
      
    </div>
  );
};

export default Classes;
