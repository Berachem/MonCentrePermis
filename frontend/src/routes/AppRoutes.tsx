import { Routes } from 'react-router-dom';
import DefaultRoutes from './DefaultRoutes';

function AppRoutes() {
  const Default = DefaultRoutes(); 


  return (
    <Routes>
      {Default}

    </Routes>
  );
}

export default AppRoutes;