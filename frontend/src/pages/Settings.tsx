import { useEffect, useState, useRef } from "react";
import { Dropdown } from "primereact/dropdown";
import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import { MapContainer, TileLayer } from "react-leaflet";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import "leaflet/dist/leaflet.css";
import SideBarCustom from "../components/utils/SideBarCustom";
import logoApp from "../assets/images/branding/logo_moncentrepermis.png";
import "../assets/css/settings.css";

export default function Settings() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "fr"
  );
  const [tileLayerUrl, setTileLayerUrl] = useState(
    localStorage.getItem("tileLayerUrl") ||
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  );
  const toast = useRef(null);

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
    toast.current.show({
      severity: "success",
      summary: "Succès",
      detail: "Modifications sauvegardées",
      life: 3000,
    });
  };

  return (
    <div className="settings-page p-4">
      <Toast ref={toast} />
      <div className="flex align-items-center justify-content-center col-12 mt-4">
        <SideBarCustom />
        <img src={logoApp} alt="logo" className="mx-auto md:w-2 w-13rem" />
      </div>
      <div className="flex flex-column lg:flex-row gap-4 justify-content-center mt-4">
        {/* Paramètres à gauche */}
        <div className=" w-full lg:w-3">
          <h2 className="text-primary">Paramètres</h2>
          <Divider />
          {/* Langue */}
          <div className="field mb-4">
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
          </div>
          {/* Thème */}
          <div className="field mb-4">
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
          </div>
          {/* Fond de Plan de la Carte */}
          <div className="field">
            <label htmlFor="mapBackground" className="text-900 font-bold">
              Fond de Carte
            </label>
            <Dropdown
              id="mapBackground"
              value={tileLayerUrl}
              options={mapBackgroundOptions}
              onChange={(e) => setTileLayerUrl(e.value)}
              placeholder="Sélectionner le fond de plan"
              className="w-full"
            />
          </div>
          {/* Bouton de sauvegarde */}
          <div className="mt-4">
            <Button
              icon="pi pi-save"
              label="Sauvegarder les modifications"
              onClick={handleSave}
              className="w-full"
            />
          </div>
        </div>
        {/* Aperçu en direct à droite */}
        <div className="w-full lg:w-7 flex align-items-center justify-content-center">
          <Card
            title="Aperçu en Direct"
            className={`preview-card theme-${theme}`}
          >
            <p className="font-semibold text-700">
              Voici un aperçu en direct des changements de fond de carte et de
              thème.
            </p>
            <div
              className="preview-map mt-4"
              style={{ width: "100%", height: "300px" }}
            >
              <MapContainer
                center={[48.8566, 2.3522]}
                zoom={12}
                style={{ height: "100%", borderRadius: "8px" }}
              >
                <TileLayer url={tileLayerUrl} />
              </MapContainer>
            </div>
            <p className="text-500 mt-3">Langue actuelle : {language}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
