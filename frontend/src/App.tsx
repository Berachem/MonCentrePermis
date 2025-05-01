import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import "./assets/css/App.css"; 
import "leaflet/dist/leaflet.css";

import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './hooks/useAuth'; // Importer AuthProvider
import { ModalProvider } from './contexts/ModalContext';
import ModalContainer from './components/modals/ModalContainer';

function App() {
  return (

      <AuthProvider>
        <ModalProvider>
          <Router>
            <AppRoutes />
          </Router> 
          <ModalContainer/>
        </ModalProvider>
      </AuthProvider>
  );
}

export default App;
