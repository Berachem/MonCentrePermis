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
    <div className="flex items-center">
      {/* Bouton hamburger pour ouvrir le sidebar - ombre renforcée */}
      <Button
        icon="pi pi-bars"
        className={`rounded-full shadow-xl bg-green-800 text-white w-11 h-11 flex items-center justify-center p-0 aspect-square border-none hover:bg-green-700`}
        onClick={toggleSidebar}
      />

      {/* Sidebar de PrimeReact */}
      <Sidebar
        visible={isSidebarOpen}
        onHide={toggleSidebar}
        className="w-72"
      >
        <div className="flex flex-col h-full">
          {/* Logo et Bouton de fermeture */}
          <div className="flex items-center justify-between px-4 pt-3">
            <span className="inline-flex items-center gap-2 font-semibold text-2xl text-indigo-500">
              <img src={LogoApp} alt="logo" className="w-52 -ml-3" />
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
                  className="cursor-pointer"
                >
                  <a className="flex items-center p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-150 w-full">
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
                  className="cursor-pointer"
                >
                  <a className="flex items-center p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-150 w-full">
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
            <hr className="my-3 mx-3 border-t border-gray-200" />
            {isAuthenticated ? (
              <>
                <div className="m-3">
                  <a
                    className="flex items-center gap-2 cursor-pointer bg-green-800 hover:bg-green-700 text-white rounded-lg px-4 py-2 transition-colors duration-150"
                    onClick={() => {
                      openModal("profile", { idRequested: userId });
                      toggleSidebar();
                    }}
                  >
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-white">
                      {userRole === "eleve" ? (
                        <img
                          src="https://amelesarcades.bleep.fr/wp-content/uploads/2017/06/permisb.png"
                          alt="eleve"
                          className="w-5 h-5 rounded-full"
                        />
                      ) : (
                        <span className="text-sm text-green-800">🕵️</span>
                      )}
                    </span>
                    <span className="font-medium">{prenom}</span>
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
                </div>
              </>
            ) : (
              <div className="m-3">
                <Button
                  label="S'identifier"
                  onClick={() => navigate("/login")}
                  className="bg-green-800 hover:bg-green-700 text-white border-none rounded-lg py-2 px-4 w-full"
                />
              </div>
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
