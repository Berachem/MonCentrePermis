import  { useState } from "react";
import { Button } from "primereact/button";
import logo from "../assets/images/branding/logo_moncentrepermis.png";
import HomePageMap from "../components/utils/HomePageMap";
import "../assets/css/Home.css";

const Home = () => {
  const [blur, setBlur] = useState(true);

  const handleStart = () => {
    setBlur(false); // Enlève l'effet blur au clic sur le bouton "Commencer"
  };

  return (
    <div className={`map-wrapper ${blur ? "blur" : ""}`}>
      {/* Carte Leaflet */}
      <HomePageMap blurred={blur} />

      {/* Afficher le logo en haut à gauche quand blur est enlevé */}
      {!blur && (
        <img src={logo} alt="Logo" className="logo-top-left" />
      )}

      {/* Superposition du contenu */}
      {blur && (
        <div className="overlay">
          <img src={logo} alt="Logo" className="logo" />
          {/* Paragraphe descriptif */}
          <p className="description">
            Des moniteurs expérimentés, notre plateforme intuitive, et des informations précieuses sur vos parcours de centres
            vous assurent la meilleure préparation possible. Commencez dès maintenant !
          </p>
          <Button
            label="Réussir mon permis"
            className="start-btn starting-btn"
            onClick={handleStart}
            icon="pi pi-arrow-right"
            iconPos="right"
          />
        </div>
      )}
    </div>
  );
};

export default Home;
