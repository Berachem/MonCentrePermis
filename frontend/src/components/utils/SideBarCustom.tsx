import React, { useState } from "react";
import { Sidebar } from "primereact/sidebar";
import { Button } from "primereact/button";
import { Ripple } from "primereact/ripple";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faCar,
  faUser,
  faCog,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import LogoApp from "../../assets/images/branding/logo_moncentrepermis.png";
import useAuth from "../../hooks/useAuth";
import ProfileModal from "../Profils/ProfileModal";

function SideBarCustom({ isOnMap }: { isOnMap?: boolean }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, prenom, logout } = useAuth();

  // Liste des éléments de menu
  const inviteRoutes = [
    { title: "Accueil", route: "/", icon: faHome },
    { title: "Auto-Ecoles", route: "/schools", icon: faCar },
    { title: "Paramètres", route: "/settings", icon: faCog },
    { title: "A propos", route: "/about", icon: faInfoCircle },
  ];

  const studentRoutes = [
    { title: "Accueil", route: "/", icon: faHome },
    { title: "Auto-Ecoles", route: "/schools", icon: faCar },
    { title: "Profil", route: "/profile", icon: faUser },
    { title: "Paramètres", route: "/settings", icon: faCog },
  ];

  // Fonction pour basculer l'affichage du sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Fonction pour afficher la modale du profil
  const openProfileModal = () => {
    setIsProfileModalOpen(true);
    setIsSidebarOpen(false); // Ferme le sidebar quand on ouvre la modale
  };

  return (
    <div>
      {/* Bouton hamburger pour ouvrir le sidebar */}
      <Button
        icon="pi pi-bars"
        className={"button-text mr-2 " + (isOnMap ? "shadow-8" : "shadow-3")}
        rounded
        onClick={toggleSidebar}
      />

      {/* Sidebar de PrimeReact */}
      <Sidebar
        visible={isSidebarOpen}
        onHide={toggleSidebar}
        className="p-sidebar-md"
        style={{ width: "280px" }}
      >
        <div className="flex flex-column h-full">
          {/* Logo et Bouton de fermeture */}
          <div className="flex align-items-center justify-content-between px-4 pt-3">
            <span className="inline-flex align-items-center gap-2 font-semibold text-2xl text-primary">
              <img src={LogoApp} alt="logo" className="w-13rem -ml-3" />
            </span>
          </div>

          {/* Liste des éléments de menu */}
          <div className="overflow-y-auto mt-4">
            <ul className="list-none p-3 m-0">
              {inviteRoutes.map((item, index) => (
                <li
                  key={index}
                  onClick={() => {
                    navigate(item.route);
                    toggleSidebar();
                  }}
                >
                  <a className="p-ripple flex align-items-center cursor-pointer p-3 text-700 hover:surface-100 transition-duration-150 transition-colors w-full">
                    <FontAwesomeIcon icon={item.icon} className="mr-2" />
                    <span className="font-medium">{item.title}</span>
                    <Ripple />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Profil en bas */}
          <div className="mt-auto">
            <hr className="mb-3 mx-3 border-top-1 surface-border" />
            {isAuthenticated ? (
              <>
                <a className="m-3 flex align-items-center p-3 gap-2 cursor-pointer border-round text-700 hover:surface-100 transition-duration-150 transition-colors"
                  onClick={openProfileModal}
                >
                  <FontAwesomeIcon
                    icon={faUser}
                    className="text-lg text-primary border-round-3xl p-1 bg-primary-100"
                  />
                  <span className="font-bold">{prenom}</span>
                </a>
                <div className="text-center mt-2">
                  <a
                    className="text-red-500 cursor-pointer text-sm"
                    onClick={() => {
                      logout();
                      toggleSidebar();
                    }}
                  >
                    Déconnexion
                  </a>
                </div>
              </>
            ) : (
              <Button
                label="S'identifier"
                onClick={() => navigate("/login")}
                className="m-3"
              />
            )}
          </div>
        </div>
      </Sidebar>

      {/* Modale du profil */}
      <ProfileModal 
        visible={isProfileModalOpen}
        onHide={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
}

export default SideBarCustom;
