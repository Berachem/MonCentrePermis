import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom"; // Importer useNavigate
import "../../assets/css/DetailsCentreMap.css";
import useAuth from "../../hooks/useAuth";
import { UserType } from "../../enum/user";

interface CentreDetailsProps {
  visible: boolean;
  onHide: () => void;
  centre: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    id: number; // Ajout de l'ID
    isFavorite?: boolean; // Ajout de la propriété isFavorite
  };
  onToggleFavorite?: (centreId: number) => void; // Fonction pour changer l'état de favori
}

const DetailsCentreMap: React.FC<CentreDetailsProps> = ({
  visible,
  onHide,
  centre,
  onToggleFavorite, // Fonction pour changer l'état de favori
}) => {
  const navigate = useNavigate(); // Hook pour la navigation
  const { userRole, isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = useState(centre.isFavorite || false);
  const [isToggling, setIsToggling] = useState(false);

  // Mettre à jour l'état local quand la prop change
  useEffect(() => {
    setIsFavorite(centre.isFavorite || false);
  }, [centre.isFavorite]);

  const handleSuccessClick = () => {
    if (userRole !== UserType.Visitor && isAuthenticated) {
      navigate(`/examen/${centre.id}`, {
        state: {
          centre: {
            id: centre.id,
            name: centre.name,
            address: centre.address,
            city: centre.city,
            postalCode: centre.postalCode,
          },
        },
      });
    } else {
      navigate(`/login`);
    }
  };

  const handleFavoriteClick = async () => {
    if (isToggling) return; // Éviter les clics multiples pendant le traitement

    setIsToggling(true);

    try {
      if (onToggleFavorite) {
        // Ne pas changer l'état visuel immédiatement
        // laissez le composant parent (HomePageMap) mettre à jour la prop isFavorite
        // qui déclenchera useEffect pour changer l'état local
        await onToggleFavorite(centre.id);
      }
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="centre-modal">
      <Dialog
        header={<div className="dialog-header">{centre.name}</div>}
        visible={visible}
        onHide={onHide}
        draggable={false}
        resizable={false}
        position="bottom"
        dismissableMask
      >
        <div className="address-container">
          <p>
            <strong>Adresse:</strong> {centre.address}
          </p>
          <button
            className={`favorite-icon ${isFavorite ? "is-favorite" : ""} ${
              isToggling ? "toggling" : ""
            }`}
            onClick={handleFavoriteClick}
            title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
            aria-label={
              isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"
            }
            disabled={isToggling}
          >
            {isFavorite ? "★" : "☆"}
          </button>
        </div>
        <p>
          <strong>Ville:</strong> {centre.city}
        </p>
        <p>
          <strong>Code Postal:</strong> {centre.postalCode}
        </p>
        <div className="reussir">
          <Button
            label="Voir les circuits"
            icon="pi pi-eye"
            className="p-button-outlined b-reussir"
            onClick={handleSuccessClick}
          />
        </div>
        <hr className="w-2" />
        <div className="reussir">
          <Button
            label="Itinéraire"
            icon="pi pi-directions"
            className="p-button-outlined "
            size="small"
            severity="contrast"
            onClick={() =>
              window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                  `${centre.address}, ${centre.city}, ${centre.postalCode}`
                )}`
              )
            }
          />
        </div>
      </Dialog>
    </div>
  );
};

export default DetailsCentreMap;
