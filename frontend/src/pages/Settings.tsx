import { useEffect, useState, useRef } from "react";
import { Dropdown } from "primereact/dropdown";
import { Divider } from "primereact/divider";
import { MapContainer, TileLayer } from "react-leaflet";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import "leaflet/dist/leaflet.css";
import SideBarCustom from "../components/Home/SideBarCustom";
import logoApp from "../assets/images/branding/logo_moncentrepermis_green.png";

export default function Settings() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "fr"
  );
  const [tileLayerUrl, setTileLayerUrl] = useState(
    localStorage.getItem("tileLayerUrl") ||
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  );
  const toast = useRef<Toast>(null);

  // Options pour chaque paramètre
  const languageOptions = [
    { label: "Français", value: "FRA" },
    { label: "English (coming soon)", value: "ENG" },
  ];
  const themeOptions = [
    { label: "Clair", value: "light" },
    { label: "Sombre", value: "dark" },
    { label: "Système", value: "system" },
  ];
  const mapBackgroundOptions = [
    {
      label: "Light Mode",
      value: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    },
    {
      label: "Dark Mode",
      value: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    },
    {
      label: "Classique",
      value: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    },
    {
      label: "Real",
      value:
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    },
    {
      label: "Grey Mode",
      value:
        "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
    },
  ];

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.body.setAttribute("data-theme", theme); // Change le thème
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("language", language);
    //i18n.changeLanguage(language); // Change la langue avec i18next
  }, [language]);

  useEffect(() => {
    localStorage.setItem("tileLayerUrl", tileLayerUrl);
  }, [tileLayerUrl]);

  const handleSave = () => {
    // Sauvegarde déjà effectuée via useEffect, on affiche juste une confirmation
    if (toast.current) {
      toast.current.show({
        severity: "success",
        summary: "Succès",
        detail: "Modifications sauvegardées",
        life: 3000,
      });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen p-4">
      <Toast ref={toast} />
      <div className="flex items-center justify-center w-full mt-4">
        <SideBarCustom />
        <img src={logoApp} alt="logo" className="mx-auto w-52" />
      </div>
      <div className="flex flex-col lg:flex-row gap-6 justify-center mt-4 max-w-7xl mx-auto">
        {/* Paramètres à gauche */}
        <div className="w-full lg:w-1/3 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-green-600 mb-4">Paramètres</h2>
          <Divider className="my-4" />
          {/* Langue */}
          {/*  <div className="field mb-4">
            <label htmlFor="language" className="text-900 font-bold">
              Langue
            </label>
            <Dropdown
              id="language"
              value={language}
              options={languageOptions}
              onChange={(e) => setLanguage(e.value)}
              placeholder="Sélectionner la langue"
              className="w-full"
            />
          </div> */}
          {/* Thème */}
          {/*  <div className="field mb-4">
            <label htmlFor="theme" className="text-900 font-bold">
              Thème
            </label>
            <Dropdown
              id="theme"
              value={theme}
              options={themeOptions}
              onChange={(e) => setTheme(e.value)}
              placeholder="Sélectionner le thème"
              className="w-full"
            />
          </div> */}
          {/* Fond de Plan de la Carte */}
          <div className="mb-6">
            <label htmlFor="mapBackground" className="block text-gray-800 dark:text-gray-200 font-bold mb-2">
              Fond de Carte
            </label>
            <Dropdown
              id="mapBackground"
              value={tileLayerUrl}
              options={mapBackgroundOptions}
              onChange={(e) => setTileLayerUrl(e.value)}
              placeholder="Sélectionner le fond de plan"
              className="w-full border p-2 rounded-lg"
            />
          </div>
          {/* Bouton de sauvegarde */}
          <div className="mt-6">
            <Button
              icon="pi pi-save"
              label="Sauvegarder les modifications"
              onClick={handleSave}
              className="w-full bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg"
            />
          </div>
        </div>
        {/* Aperçu en direct à droite */}
        <div className="w-full lg:w-2/3 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-green-600 mb-4">Aperçu en Direct</h2>
          <p className="font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Voici un aperçu en direct des changements de fond de carte et de thème.
          </p>
          <div className="w-full h-[300px] rounded-lg overflow-hidden border-2 border-green-200">
            <MapContainer
              center={[48.8566, 2.3522]}
              zoom={12}
              className="h-full w-full"
            >
              <TileLayer url={tileLayerUrl} />
            </MapContainer>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-4">
            Langue actuelle : {language}
          </p>
        </div>
      </div>
    </div>
  );
}
