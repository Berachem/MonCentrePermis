import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { UserType } from "../../enum/user";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
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
    <Dialog
      visible={visible}
      onHide={onHide}
      draggable={false}
      resizable={false}
      position="bottom"
      dismissableMask
      className="border-none"
      showHeader={false} // Désactiver l'en-tête par défaut car nous utilisons un template personnalisé
    >
      <div className="bg-green-800 text-white p-4 flex items-center justify-between">
        <h2 className="font-semibold">{centre.name}</h2>
        <button 
          onClick={onHide}
          className="w-1 h-6 rounded-full bg-green-700 hover:bg-green-600 flex items-center justify-center focus:outline-none"
          aria-label="Fermer"
        >
          <i className="pi pi-times text-white"></i>
        </button>
      </div>
      
      {userRole !== UserType.Teacher && (
          <button
            className={`flex mt-2 ml-auto mr-4 ${
              isToggling ? "opacity-50" : ""
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
                className="text-2xl text-red-500"
              />
            ) : (
              <FontAwesomeIcon
                icon={faHeartCirclePlus}
                className="text-2xl text-green-800"
              />
            )}
          </button>
        )}  

      <div className="px-4 pb-4">
        <div>
          <p className="text-gray-800 mb-2">
            <span className="font-semibold">Adresse:</span> {centre.address}
          </p>
        </div>
        <p className="text-gray-800 mb-2">
          <span className="font-semibold">Ville:</span> {centre.city}
        </p>
        <p className="text-gray-800 mb-4">
          <span className="font-semibold">Code Postal:</span> {centre.postalCode}
        </p>
        <div className="flex">
          <Button
            label="Voir les circuits"
            icon="pi pi-eye"
            className="bg-green-800 hover:bg-green-700 text-white border-none rounded-lg w-10 p-2"
            onClick={handleSuccessClick}
          />
          <Button
            icon="pi pi-directions"
            className="bg-white text-green-800 border border-green-800 hover:bg-green-50 rounded-full p-2 mx-2 w-3 flex items-center justify-center"
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
      </div>
    </Dialog>
  );
};

export default DetailsCentreMap;
