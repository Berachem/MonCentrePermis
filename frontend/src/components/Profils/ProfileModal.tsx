import React, { useEffect, useState } from "react";
import { Dialog } from 'primereact/dialog';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
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

const ProfileModal: React.FC<ProfileModalProps> = ({ visible, onHide, idRequested }) => {
  const { userId, prenom: currentPrenom, nom: currentNom, userRole: currentUserRole } = useAuth();
  const [description, setDescription] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfoResponse | null>(null);
  const [displayUserType, setDisplayUserType] = useState<UserType>(currentUserRole as UserType);
  
  // Détermine si on affiche son propre profil ou celui d'un autre utilisateur
  const isOwnProfile = !idRequested || idRequested === userId;

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
      console.error("Erreur lors de l'appel API pour mettre à jour la description:", error);
    }
  };
  
  // Récupération de la description d'un utilisateur
  const fetchUserDescription = async (id?: string): Promise<string> => {
    try {
      const response = await getRequest<UserDescriptionResponse>(`/compte/${id}/description`);
      return response.description || "Aucune description disponible.";
  
    } catch (error) {
      console.error("Erreur lors de la récupération de la description:", error);
      return "Erreur de chargement de la description";
    }
  };
  
  // Récupération des informations d'un utilisateur
  const fetchUserInfo = async (id?: string): Promise<UserInfoResponse | null> => {
    try {
      const data = await getRequest<UserInfoResponse>(`/compte/${id}/info`);
      return {
        ...data,
      };
      
    } catch (error) {
      console.error('Erreur lors de la récupération des informations utilisateur:', error);
      return null;
    }
  };

  // Chargement des données utilisateur à l'ouverture de la modale
  useEffect(() => {
    if (visible) {
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
  }, [visible, idRequested, userId, currentUserRole, currentNom, currentPrenom]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    setIsEditing(false);
    await updateUserDescription(newDescription);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
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
      style={{ width: '100%', maxWidth: '900px' }}
      breakpoints={{ '960px': '95vw' }}
      contentStyle={{ padding: 0 }}
    >
      {/* Bannière d'information */}
      {!isOwnProfile && (
        <div className="bg-blue-100 p-2 text-center text-sm font-semibold">
          Vous consultez le profil d'un autre utilisateur
        </div>
      )}

      {/* Bouton de fermeture fixe */}
      <div className="flex w-full pt-2 pr-2">
        <Button 
          icon="pi pi-times" 
          onClick={onHide} 
          className="text-white p-button-text p-button-rounded p-button-plain ml-auto" 
          aria-label="Close"
        />
      </div>

      <div className="justify-center items-center min-h-full p-2">
        <div className="p-2 mb-2">
          <div className="m-auto w-fit">
            {userInfo ? (
              <>
                <div className="m-auto w-fit">
                  <Avatar label={userInfo.prenom.charAt(0)} size="xlarge" shape="circle" />
                </div>
                <p className="text-center text-lg">
                  <b>{userInfo.nom + " " + userInfo.prenom}</b>
                </p>
              </>
            ) : (
              <p className="text-center">Chargement des informations...</p>
            )}
          </div>
          <div className="flex justify-between items-center">
            {isEditing ? (
              <input
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                onKeyDown={handleKeyPress}
                className="p-inputtext p-component w-full mt-2"
              />
            ) : (
              <p className="text-center text-gray-700 mx-auto">
                <i>{description || 'Chargement de la description...'}</i>
                {isOwnProfile && (
                  <FontAwesomeIcon 
                    icon={faEdit} 
                    onClick={handleEditClick} 
                    className="ml-2 text-blue-500 hover:text-blue-600 cursor-pointer"
                  />
                )}
              </p>
            )}
          </div>
          {isEditing && (
            <div className="flex w-full mt-2">
              <Button
                label="Enregistrer"
                icon="pi pi-check"
                onClick={handleSaveClick}
                className="button-text text-sm ml-auto"
              />
            </div>
          )}
        </div>

        <Divider className="my-2" />

        {displayUserType === UserType.Teacher ? (
          <MoniteurInformations userId={idRequested} readOnly={!isOwnProfile} />
        ) : (
          <StudentInformations userId={idRequested} readOnly={!isOwnProfile} />
        )}
      </div>
    </Dialog>
  );
};

export default ProfileModal;
