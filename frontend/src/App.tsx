import "primereact/resources/themes/saga-green/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import "./assets/css/App.css"; 
import "leaflet/dist/leaflet.css";

import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './hooks/useAuth'; // Importer AuthProvider

function App() {
  return (

      <AuthProvider>
        
          <Router>
            <AppRoutes />
          </Router> 
          
      </AuthProvider>
  );
}

export default App;
