import React, { useEffect, useState } from "react";
import { Dialog } from 'primereact/dialog';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { InputSwitch } from 'primereact/inputswitch';
import useAuth from "../../hooks/useAuth";
import StudentInformations from "./StudentInformations";
import MoniteurInformations from "./MoniteurInformations";
import { UserType } from "../../enum/user";
import { getRequest, postRequest, } from "../../interfaces/utils/api";
import { UserInfo } from "os";

interface ProfileModalProps {
  visible: boolean;
  onHide: () => void;
  UserId?: string; // ID de l'utilisateur à afficher, si undefined = utilisateur connecté
  userType?: UserType; // Type d'utilisateur à afficher (teacher ou student)
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
}

const ProfileModal: React.FC<ProfileModalProps> = ({ visible, onHide, UserId: propUserId, userType: propUserType }) => {
  const { isAuthenticated, prenom: currentPrenom, nom: currentNom, userRole: currentUserRole} = useAuth();
  const [description, setDescription] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfoResponse | null>(null);


  // État pour simuler l'ID et le type d'utilisateur
  const [viewingOtherProfile, setViewingOtherProfile] = useState(false);
  const [UserId, setUserId] = useState<string | undefined>(propUserId);
  const [userType, setUserType] = useState<UserType | undefined>(propUserType);
  
  // ID fictif pour le mode "autre profil"
  const otherUserId = "34";
  
  // Gérer le changement de mode profil
  useEffect(() => {
    if (viewingOtherProfile) {
      setUserId(otherUserId);
      // Utiliser un type différent de l'utilisateur courant pour tester les deux vues
      setUserType(currentUserRole === UserType.Teacher ? UserType.Student : UserType.Teacher);
    } else {
      setUserId(undefined); // Profil de l'utilisateur connecté
      setUserType(undefined);
    }
  }, [viewingOtherProfile, currentUserRole]);
  
  const isOwnProfile = !UserId || UserId === "current-user-id"; // Simulation car l'ID n'est pas encore implémenté
  const displayRole = userType || currentUserRole;

// Fonction pour mettre à jour la description de l'utilisateur
const updateUserDescription = async (newDesc: string) => {
  console.log("API appelée pour modifier la description:", newDesc);

  try {
    // Appel à l'API pour mettre à jour la description de l'utilisateur
    const response = await postRequest(
      `/compte/updateDescription`, // L'URL de votre API
      { biographie: newDesc }, // Les données envoyées : ici, la nouvelle description
      {
        headers: {
          "Content-Type": "application/json",
          // Ajouter un token d'authentification si nécessaire
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      }
    );

    // Gérer la réponse
    console.log("Description mise à jour avec succès:", response);
    // Optionnel : Mettez à jour l'état local avec la nouvelle description
    // setDescription(newDesc);
  } catch (error) {
    console.error("Erreur lors de l'appel API pour mettre à jour la description:", error);
  }
};


  
  
  const fetchUserDescription = async (id?: number): Promise<string> => {
    try {
      // Faire la requête à l'API pour obtenir la description de l'élève
      const response = await getRequest<UserDescriptionResponse>(`/compte/${id}/description`);
      
      // Si la réponse contient une description, on la retourne
      if (response.description) {
        return response.description;
      } else {
        // Si aucune description n'est disponible, on retourne un message d'absence de description
        return "Aucune description disponible pour cet élève.";
      }
    } catch (error: unknown) {
      // Ici, on utilise une vérification de type pour s'assurer que l'erreur est une instance de Error
      if (error instanceof Error) {
        console.error("Erreur lors de la récupération de la description:", error.message);
      } else {
        console.error("Erreur inconnue:", error);
      }
      return "Erreur de chargement de la description";
    }
  };
  
  
  const fetchUserInfo = async (id?: number): Promise<UserInfoResponse | null> => {
    // Vérifier si l'ID est défini et si c'est un autre utilisateur
    if (id) {
      try {
        // Appeler l'API pour récupérer les informations publiques de l'élève
        const data = await getRequest<UserInfoResponse>(`/compte/${id}/info`);
  
        // Retourner les informations obtenues
        return {
          nom: data.nom,
          prenom: data.prenom,
          email: data.email,
          telephone: data.telephone,
          biographie: data.biographie,
          photo_profil: data.photo_profil,
          note_moyenne: data.note_moyenne,
          date_naissance: data.date_naissance,
          langues: data.langues,
          permis: data.permis,
          auto_ecole: data.auto_ecole,
          centres_examen_favoris: data.centres_examen_favoris,
          cours_favoris: data.cours_favoris,
          circuits_favoris: data.circuits_favoris
        };
      } catch (error) {
        console.error('Erreur lors de la récupération des informations utilisateur:', error);
        return null;  // Retourner null en cas d'erreur
      }
    }
  
    // Si c'est l'utilisateur courant, on retourne les informations locales par défaut
    return {
      nom: currentNom,
      prenom: currentPrenom,
      email: '',
      telephone: '',
      biographie: '',
      photo_profil: '',
      note_moyenne: '',
      date_naissance: '',
      langues: [],
      permis: [],
      auto_ecole: null,
      centres_examen_favoris: [],
      cours_favoris: [],
      circuits_favoris: []
    };
  };
  

  useEffect(() => {
    if (visible) {
      const loadUserData = async () => {
        const desc = await fetchUserDescription(34);
        const info : UserInfoResponse | null = await fetchUserInfo(34);
        setDescription(desc);
        setNewDescription(desc);
        if(info) setUserInfo(info);
      };
      
      loadUserData();
    }
  }, [visible, UserId, userType]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    setIsEditing(false);
    await updateUserDescription(newDescription);
    setDescription(newDescription);
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
      <div className="flex justify-between items-center p-2">
        <div className="flex items-center">
          <span className="text-sm mr-2">Voir un autre profil:</span>
          <InputSwitch
            checked={viewingOtherProfile}
            onChange={(e) => setViewingOtherProfile(e.value || false)}
          />
        </div>
        <Button 
          icon="pi pi-times" 
          onClick={onHide} 
          className="text-white p-button-text p-button-rounded p-button-plain ml-auto" 
          aria-label="Close"
        />
      </div>

      <div className="bg-gray-100 p-2 text-center text-sm font-semibold">
        {viewingOtherProfile 
          ? `Mode démonstration: Profil ${displayRole === UserType.Teacher ? "moniteur" : "élève"} (non modifiable)`
          : "Votre profil"}
      </div>

      <div className="justify-center items-center min-h-full p-2">
        <div className="p-2 mb-2">
          <div className="m-auto w-fit">
            {userInfo ? (
              <>
                <Avatar label={userInfo.prenom.charAt(0)} size="xlarge" shape="circle" />
                <p className="text-center text-lg">
                  <b>{userInfo.nom + " " + userInfo.prenom}</b>
                </p>
              </>
            ) : (
              <p>Utilisateur non trouvé</p> // Message d'erreur ou autre contenu à afficher si `userInfo` est null
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
                {!viewingOtherProfile && (
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

        {displayRole === UserType.Teacher ? (
          <MoniteurInformations userId={UserId} readOnly={viewingOtherProfile} />
        ) : (
          <StudentInformations userId={UserId} readOnly={viewingOtherProfile} />
        )}
      </div>
    </Dialog>
  );
};

export default ProfileModal;
