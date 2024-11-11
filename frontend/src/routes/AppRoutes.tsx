import { Routes, Route } from 'react-router-dom';
import Home from "../pages/Home";
import About from "../pages/About";
import NotFound from "../pages/NotFound";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Profile from "../pages/Profile";
import useAuth from '../hooks/useAuth';
import { UserType }from '../enum/user'
import SchoolsPage from '../pages/visitor/SchoolsPage';
import Settings from '../pages/Settings';

function AppRoutes() {
  const { userRole } = useAuth();

  return (
    <Routes>
      {userRole === UserType.Visitor && (
        <>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/schools" element={<SchoolsPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </>
      )}
      {userRole === UserType.Student && (
        <>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </>
      )}
      {userRole === UserType.Teacher && (
        <>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </>
      )}
    </Routes>
  );
}

export default AppRoutes;
