import React from "react";
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
  };
}

const DetailsCentreMap: React.FC<CentreDetailsProps> = ({
  visible,
  onHide,
  centre,
}) => {
  const navigate = useNavigate(); // Hook pour la navigation
  const { userRole, isAuthenticated } = useAuth();
  const handleSuccessClick = () => {
    if (userRole !== UserType.Visitor && isAuthenticated) {
      navigate(`/examen/${centre.id}`);
    } else {
      navigate(`/login`);
    }
  };

  return (
    <div className="centre-modal">
      <Dialog
        header={centre.name}
        visible={visible}
        onHide={onHide}
        draggable={false}
        resizable={false}
        position="bottom"
        dismissableMask
      >
        <p>
          <strong>Adresse:</strong> {centre.address}
        </p>
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
            onClick={handleSuccessClick} // Ajout du gestionnaire
          />
        </div>
      </Dialog>
    </div>
  );
};

export default DetailsCentreMap;
