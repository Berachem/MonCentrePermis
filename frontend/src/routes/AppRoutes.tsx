import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import About from "../pages/About";
import NotFound from "../pages/NotFound";
import Login from "../pages/Login";
import Register from "../pages/Register";
import SchoolsPage from "../pages/SchoolsPage";
import Settings from "../pages/Settings";
import DetailsCentre from "../pages/DetailsCentre";
import useAuth from "../hooks/useAuth";
import CircuitCreationPage from "../pages/circuit/CircuitCreationPage";
import CircuitEditionPage from "../pages/circuit/CircuitEditionPage";
import CircuitViewPage from "../pages/circuit/CircuitViewPage";
import Classes from "../pages/Classes";

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
      <Route path="/centre/:id" element={<DetailsCentre />} />
      <Route path="/circuit/create" element={<CircuitCreationPage />} />
      <Route path="/circuit/create/:coursId" element={<CircuitCreationPage />} />
      <Route path="/circuit/edit/:id" element={<CircuitEditionPage />} />
      <Route path="/circuit/view/:id" element={<CircuitViewPage />} />
      <Route path="/courses" element={<Classes />} />
      <Route path="/courses/:userId" element={<Classes />} />
    </Routes>
  );
}

export default AppRoutes;
