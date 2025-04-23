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
  faUserGroup,
  faChalkboardTeacher,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import LogoApp from "../../assets/images/branding/logo_moncentrepermis.png";
import useAuth from "../../hooks/useAuth";
import { useModal } from "../../contexts/ModalContext";
import ClassesModal from "../modals/ClassesModal";

function SideBarCustom({ isOnMap }: { isOnMap?: boolean }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showClassesModal, setShowClassesModal] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, prenom, logout, userId, userRole } = useAuth();
  const { openModal } = useModal();

  // Liste des éléments de menu
  const inviteRoutes = [
    { title: "Accueil", route: "/", icon: faHome },
    { title: "Auto-Ecoles", route: "/schools", icon: faCar },
    { title: "Paramètres", route: "/settings", icon: faCog },
    { title: "A propos", route: "/about", icon: faInfoCircle },
  ];

  const handleOpenCoursesModal = () => {
    setShowClassesModal(true);
    setIsSidebarOpen(false); // Fermer la sidebar pour afficher la modale
  };

  // Fonction pour basculer l'affichage du sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Styles pour le conteneur du bouton de menu
  const buttonContainerStyle: React.CSSProperties = {
    position: "fixed",
    top: "20px",
    left: "20px",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  // Routes communes à tous les utilisateurs connectés
  const commonAuthenticatedRoutes = [
    { title: "Accueil", route: "/", icon: faHome },
  ];

  // Routes spécifiques aux moniteurs
  const moniteurSpecificRoutes = [
    {
      title: "Mes cours",
      action: handleOpenCoursesModal,
      icon: faChalkboardTeacher,
    },
  ];

  // Routes pour les élèves
  const eleveRoutes = [
    { title: "Auto-Ecoles", route: "/schools", icon: faCar },
  ];

  // Routes finales pour tous les utilisateurs
  const endRoutes = [
    { title: "Paramètres", route: "/settings", icon: faCog },
    { title: "A propos", route: "/about", icon: faInfoCircle },
  ];

  // Déterminer quelles routes afficher
  let routesToShow = isAuthenticated
    ? [
        ...commonAuthenticatedRoutes,
        ...(userRole === "moniteur" ? moniteurSpecificRoutes : []),
        ...(userRole === "eleve" ? eleveRoutes : []),
        ...endRoutes,
      ]
    : inviteRoutes;

  return (
    <div style={buttonContainerStyle}>
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
              {routesToShow.map((item, index) => (
                <li
                  key={index}
                  onClick={() => {
                    if (item.action) {
                      item.action();
                    } else if (item.route) {
                      navigate(item.route);
                      toggleSidebar();
                    }
                  }}
                >
                  <a className="p-ripple flex align-items-center cursor-pointer p-3 text-700 hover:surface-100 transition-duration-150 transition-colors w-full">
                    <FontAwesomeIcon icon={item.icon} className="mr-2" />
                    <span className="font-medium">{item.title}</span>
                    <Ripple />
                  </a>
                </li>
              ))}

              {/* Menu de développement pour tester les profils */}
              {process.env.NODE_ENV === "development" && (
                <li
                  onClick={() => {
                    openModal("profile", { idRequested: "4" });
                    toggleSidebar();
                  }}
                >
                  <a className="p-ripple flex align-items-center cursor-pointer p-3 text-700 hover:surface-100 transition-duration-150 transition-colors w-full">
                    <FontAwesomeIcon icon={faUserGroup} className="mr-2" />
                    <span className="font-medium">Voir profil test (ID 9)</span>
                    <Ripple />
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Profil en bas */}
          <div className="mt-auto">
            <hr className="mb-3 mx-3 border-top-1 surface-border" />
            {isAuthenticated ? (
              <>
                <a
                  className="m-3 flex align-items-center p-3 gap-2 cursor-pointer border-round text-700 hover:surface-100 transition-duration-150 transition-colors"
                  onClick={() => {
                    openModal("profile", { idRequested: userId });
                    toggleSidebar();
                  }}
                >
                  {userRole === "eleve" ? (
                    <img
                      src="https://amelesarcades.bleep.fr/wp-content/uploads/2017/06/permisb.png"
                      alt="eleve"
                      style={{
                        width: "25px",
                        height: "25px",
                        borderRadius: "50%",
                        verticalAlign: "middle",
                        display: "inline-block",
                      }}
                    />
                  ) : (
                    "🕵️"
                  )}
                  <span className="font-bold">{prenom}</span>
                </a>
                <div className="text-center mt-2">
                  <a
                    className="text-red-500 cursor-pointer text-sm"
                    onClick={() => {
                      logout();
                      toggleSidebar();
                      navigate(`/login`);
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

      {/* Modal des cours - s'affichera quand showClassesModal est true */}
      <ClassesModal
        visible={showClassesModal}
        onHide={() => setShowClassesModal(false)}
        userId={userId}
        readOnly={false}
      />
    </div>
  );
}

export default SideBarCustom;
