import "primereact/resources/themes/lara-light-indigo/theme.css"; // Un thème PrimeReact
import "primereact/resources/primereact.min.css"; // PrimeReact CSS
import "primeicons/primeicons.css"; // PrimeIcons
import "primeflex/primeflex.css"; // (Optionnel) PrimeFlex pour la mise en page
import "./assets/css/App.css"; 
import "leaflet/dist/leaflet.css";



import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppRoutes from './routes/AppRoutes';
import Navbar from "./components/utils/Navbar";

function App() {
  return (
    <>
      <Navbar />
      <Router>
        <AppRoutes/> {/* Centralisation et gestion des routes dans AppRoutes afin d'alléger App.tsx */}
      </Router>
    </>
  );
}

export default App;
