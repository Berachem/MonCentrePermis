import React from "react";
import { Button } from "primereact/button"; // Si tu utilises PrimeReact
import "../assets/css/home.css"; // Tu peux personnaliser les styles ici

const Home: React.FC = () => {
  return (
    <div>
      {/* En-tête */}
      <header>
        <div>
          <h1>Bienvenue sur Notre Site MonCentrePermis</h1>
          <p>Réussissez votre permis de conduire avec nous</p>
          <Button label="Nous rejoindre" className="p-button-outlined" />
        </div>
      </header>
    </div>
  );
};

export default Home;
