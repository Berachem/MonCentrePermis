import { Routes } from 'react-router-dom';
import DefaultRoutes from './DefaultRoutes';
import StudentRoutes from './StudentRoutes';
import TeacherRoutes from './TeacherRoutes';
import SchoolRoutes from './SchoolRoutes';

function AppRoutes() {
  const Default = DefaultRoutes(); //Impossible d'utiliser l'objet DefaultRoute directement

  //const Student = StudentRoutes();
  //const Teacher = TeacherRoutes();
  //const School = SchoolRoutes();

  return (
    <Routes>
      {Default}
      {/* 
        * les routes si dessous sont commenté parcequ'elles sont vide
        * Ce sera a changer au fur et à mesure qu'on ajoute des pages
        */}
      {/* Student */}
      {/* Teacher */}
      {/* School */}
    </Routes>
  );
}

export default AppRoutes;