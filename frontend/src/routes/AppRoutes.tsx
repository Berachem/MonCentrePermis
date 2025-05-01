import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import About from "../pages/About";
import NotFound from "../pages/NotFound";
import Login from "../pages/Login";
import Register from "../pages/Register";
import SchoolsPage from "../pages/visitor/SchoolsPage";
import Settings from "../pages/Settings";
import ExamPage from "../pages/student/ExamPage";
import useAuth from "../hooks/useAuth";
import CircuitCreationPage from "../pages/admin/CircuitCreationPage";
import CircuitEditionPage from "../pages/admin/CircuitEditionPage";
import CircuitViewPage from "../pages/circuit/CircuitViewPage";

function AppRoutes() {
  const { userRole, isAuthenticated } = useAuth();
  console.log("In AppRoute : ROLE == ", userRole, isAuthenticated);
  
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/schools" element={<SchoolsPage />} />
      <Route path="*" element={<NotFound />} />
      <Route path="/examen/:id" element={<ExamPage />} />
      <Route path="/circuit/create" element={<CircuitCreationPage />} />
      <Route path="/circuit/create/:coursId" element={<CircuitCreationPage />} />
      <Route path="/circuit/edit/:id" element={<CircuitEditionPage />} />
      <Route path="/circuit/view/:id" element={<CircuitViewPage />} />
    </Routes>
  );
}

export default AppRoutes;
