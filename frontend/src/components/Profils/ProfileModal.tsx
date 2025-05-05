import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import useAuth from "../../hooks/useAuth";
import StudentInformations from "./StudentInformations";
import MoniteurInformations from "./MoniteurInformations";
import { UserType } from "../../enum/user";
import { getRequest, postRequest } from "../../interfaces/utils/api";

interface ProfileModalProps {
  visible: boolean;
  onHide: () => void;
  idRequested: string; // ID facultatif d'un utilisateur à afficher
}

interface UserDescriptionResponse {
  description: string;
}

interface UserInfoResponse {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  biographie: string;
  photo_profil: string;
  note_moyenne: string;
  date_naissance: string;
  langues: string[];
  permis: string[];
  auto_ecole: string | null;
  centres_examen_favoris: string[];
  cours_favoris: string[];
  circuits_favoris: string[];
  type_compte: UserType;
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  visible,
  onHide,
  idRequested,
}) => {
  const { userId, userRole: currentUserRole } = useAuth();
  const [description, setDescription] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfoResponse | null>(null);
  const [displayUserType, setDisplayUserType] = useState<UserType>(
    currentUserRole as UserType
  );

  // Détermine si on affiche son propre profil ou celui d'un autre utilisateur
  const isOwnProfile = !idRequested || idRequested === userId;

  // Remove the navigateToCourses function as it's now handled in MoniteurInformations

  // Fonction pour mettre à jour la description de l'utilisateur
  const updateUserDescription = async (newDesc: string) => {
    try {
      // Appel à l'API pour mettre à jour la description de l'utilisateur
      await postRequest(
        `/compte/updateDescription`,
        { biographie: newDesc },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        }
      );

      // Mise à jour locale de la description
      setDescription(newDesc);
    } catch (error) {
      console.error(
        "Erreur lors de l'appel API pour mettre à jour la description:",
        error
      );
    }
  };

  // Récupération de la description d'un utilisateur
  const fetchUserDescription = async (id?: string): Promise<string> => {
    try {
      const response = await getRequest<UserDescriptionResponse>(
        `/compte/${id}/description`
      );
      return response.description || "...";
    } catch (error) {
      console.error("Erreur lors de la récupération de la description:", error);
      return "Erreur de chargement de la description";
    }
  };

  // Récupération des informations d'un utilisateur
  const fetchUserInfo = async (
    id?: string
  ): Promise<UserInfoResponse | null> => {
    try {
      const data = await getRequest<UserInfoResponse>(`/compte/${id}/info`);
      return {
        ...data,
      };
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des informations utilisateur:",
        error
      );
      return null;
    }
  };

  // Chargement des données utilisateur à l'ouverture de la modale
  useEffect(() => {
    if (visible && idRequested) {
      const loadUserData = async () => {
        try {
          // Récupération des données
          const desc = await fetchUserDescription(idRequested);
          const info = await fetchUserInfo(idRequested);

          setDescription(desc);
          setNewDescription(desc);

          if (info) {
            setUserInfo(info);
            // Détermine le type d'utilisateur à afficher
            setDisplayUserType(info.type_compte);
          }
        } catch (error) {
          console.error("Erreur lors du chargement des données:", error);
        }
      };

      loadUserData();
    }
  }, [visible, idRequested]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    setIsEditing(false);
    await updateUserDescription(newDescription);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveClick();
    }
  };

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      dismissableMask={true}
      showHeader={false}
      closeOnEscape
      position="bottom"
      className="rounded-t-xl overflow-hidden p-0"
      style={{ width: "100%", maxWidth: "900px" }}
      breakpoints={{ "960px": "95vw" }}
      contentStyle={{ padding: 0 }}
    >
      {/* Bannière d'information */}
      {!isOwnProfile && (
        <div className="bg-green-100 p-2 text-center text-sm font-semibold">
          <i className="pi pi-info-circle mr-2 text-green-800"></i>
          Vous consultez le profil d'un autre utilisateur
        </div>
      )}

      {/* Bouton de fermeture fixe */}
      <div className="flex w-full pt-2 pr-2">
        <Button
          icon="pi pi-times"
          onClick={onHide}
          className="text-white bg-green-800 rounded-full ml-auto hover:bg-green-400 h-11"
          aria-label="Close"
        />
      </div>

      <div className="flex flex-col justify-center items-center min-h-full p-4">
        <div className="w-full max-w-md mb-4">
          <div className="flex flex-col items-center">
            {userInfo ? (
              <>
                <Avatar
                  label={userInfo.prenom.charAt(0)}
                  size="xlarge"
                  shape="circle"
                  className="bg-green-700 text-white mb-2"
                />
                <h2 className="text-center text-xl font-bold text-gray-800">
                  {userInfo.nom + " " + userInfo.prenom}
                </h2>
              </>
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse"></div>
            )}
          </div>
          
          <div className="mt-4">
            {isEditing ? (
              <div className="flex flex-col w-full">
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:border-green-800 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                  placeholder="Votre description..."
                />
                <div className="flex justify-end mt-2">
                  <Button
                    label="Enregistrer"
                    icon="pi pi-check"
                    onClick={handleSaveClick}
                    className="bg-green-800 hover:bg-green-700 border-none text-white px-4 py-2 rounded-lg"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <p className="text-center text-gray-600 italic">
                  {description || "Chargement de la description..."}
                </p>
                {isOwnProfile && (
                  <button 
                    onClick={handleEditClick}
                    className="ml-2 text-green-700 hover:text-green-600 focus:outline-none"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <Divider />

        
        <div className="w-full">
          {displayUserType === UserType.Teacher ? (
            <MoniteurInformations userId={idRequested} readOnly={!isOwnProfile} />
          ) : (
            <StudentInformations userId={idRequested} readOnly={!isOwnProfile} />
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default ProfileModal;
