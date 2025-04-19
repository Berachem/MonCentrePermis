import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import "../../assets/css/DetailsCentreMap.css";
import useAuth from "../../hooks/useAuth";
import { UserType } from "../../enum/user";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeartCircleBolt,
  faHeartCircleMinus,
  faHeartCirclePlus,
} from "@fortawesome/free-solid-svg-icons";

interface CentreDetailsProps {
  visible: boolean;
  onHide: () => void;
  centre: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    id: number;
    isFavorite?: boolean;
  };
  onToggleFavorite?: (centreId: number) => void;
}

const DetailsCentreMap: React.FC<CentreDetailsProps> = ({
  visible,
  onHide,
  centre,
  onToggleFavorite,
}) => {
  const navigate = useNavigate();
  const { userRole, isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = useState(centre.isFavorite || false);
  const [isToggling, setIsToggling] = useState(false);

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
    if (isToggling) return;

    setIsToggling(true);

    try {
      if (onToggleFavorite) {
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

          {userRole !== UserType.Teacher && (
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
              {isFavorite ? (
                <FontAwesomeIcon
                  icon={faHeartCircleMinus}
                  className="text-red-400"
                />
              ) : (
                <FontAwesomeIcon
                  icon={faHeartCirclePlus}
                  className="text-green-400"
                />
              )}
            </button>
          )}
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
            className="p-button-outlined b-reussir mr-2"
            onClick={handleSuccessClick}
          />
          <Button
            icon="pi pi-directions"
            className="p-button-outlined p-button-rounded bg-white"
            title="Itinéraire"
            aria-label="Itinéraire"
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
