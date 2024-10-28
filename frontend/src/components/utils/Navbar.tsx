import { MegaMenu } from "primereact/megamenu";
import { Avatar } from "primereact/avatar";
import { MenuItem } from "primereact/menuitem";
import { Ripple } from "primereact/ripple";
import { Button } from "primereact/button";

export default function Navbar() {
  const routes = [
    { label: "Dashboard", icon: "pi pi-fw pi-home", to: "/" },
    { label: "Centre d'examens", icon: "pi pi-car", to: "/exams" },
    { label: "Auto-Ecoles", icon: "pi pi-fw pi-car", to: "/driving-schools" },
    { label: "À propos", icon: "pi pi-fw pi-info", to: "/about" },

    { label: "Connexion", icon: "pi pi-fw pi-user", to: "/login" },
    { label: "Inscription", icon: "pi pi-fw pi-user-plus", to: "/register" },
    { label: "Déconnexion", icon: "pi pi-fw pi-user-minus", to: "/logout" },
    { label: "Mon compte", icon: "pi pi-fw pi-user-edit", to: "/profile" },

  ];
  

  return <></>;
}
