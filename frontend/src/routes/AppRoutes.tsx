import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import About from "../pages/About";
import NotFound from "../pages/NotFound";
import Login from "../pages/Login";
import Register from "../pages/Register";
import SchoolsPage from "../pages/visitor/SchoolsPage";
import Settings from "../pages/Settings";
import ExamPage from "../pages/student/ExamPage";
import useAuth from "../hooks/useAuth"; // Utiliser le hook pour accéder au contexte d'auth
import { UserType } from "../enum/user";
import UserIndicator from "../components/UserIndicator";
import CircuitCreationPage from "../pages/admin/CircuitCreationPage";
import CircuitEditionPage from "../pages/admin/CircuitEditionPage";

function AppRoutes() {
  // Utiliser le hook useAuth pour obtenir le rôle de l'utilisateur
  const { userRole, isAuthenticated } = useAuth();
  console.log("In AppRoute : ROLE == ", userRole, isAuthenticated);
  return (
    <>
      <UserIndicator />
      <Routes>
        {/* Routes pour les élèves */}
        {/*     {isAuthenticated && userRole === UserType.Student && (
          <>

          </>
        )}

    
        {isAuthenticated && userRole === UserType.Teacher && (
          <>
   
          </>
        )}
 */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/schools" element={<SchoolsPage />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/examen/:id" element={<ExamPage />} />
        <Route path="/admin/circuit/create" element={<CircuitCreationPage />} />
        <Route
          path="/admin/circuit/edit/:id"
          element={<CircuitEditionPage />}
        />
      </Routes>
    </>
  );
}

export default AppRoutes;
