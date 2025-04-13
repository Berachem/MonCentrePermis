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

interface ProfileModalProps {
  visible: boolean;
  onHide: () => void;
  userId?: string; // ID de l'utilisateur à afficher, si undefined = utilisateur connecté
  userType?: UserType; // Type d'utilisateur à afficher (teacher ou student)
}

const ProfileModal: React.FC<ProfileModalProps> = ({ visible, onHide, userId: propUserId, userType: propUserType }) => {
  const { isAuthenticated, prenom: currentPrenom, nom: currentNom, userRole: currentUserRole } = useAuth();
  const [description, setDescription] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({ nom: '', prenom: '' });
  
  // État pour simuler l'ID et le type d'utilisateur
  const [viewingOtherProfile, setViewingOtherProfile] = useState(false);
  const [userId, setUserId] = useState<string | undefined>(propUserId);
  const [userType, setUserType] = useState<UserType | undefined>(propUserType);
  
  // ID fictif pour le mode "autre profil"
  const otherUserId = "other-user-123";
  
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
  
  const isOwnProfile = !userId || userId === "current-user-id"; // Simulation car l'ID n'est pas encore implémenté
  const displayRole = userType || currentUserRole;

  const updateUserDescription = async (newDesc: string) => {
    console.log("API appelée pour modifier la description:", newDesc);
    // TODO : Connecter le back
  };

  const fetchUserDescription = async (id?: string) => {
    // TODO : connecter le back pour récupérer la description d'un autre utilisateur
    if (id && id === otherUserId) {
      return "Moniteur professionnel spécialisé dans les permis moto et poids lourds. Plus de 15 ans d'expérience.";
    }
    
    // Description utilisateur courant
    return "Développeur passionné par les technologies web et mobiles. Toujours curieux d'apprendre de nouvelles choses !";
  };

  const fetchUserInfo = async (id?: string) => {
    // TODO : connecter le back pour récupérer les informations basiques de l'utilisateur
    if (id && id === otherUserId) {
      return { 
        nom: displayRole === UserType.Teacher ? "Moreau" : "Dupont",
        prenom: displayRole === UserType.Teacher ? "Julien" : "Marie"
      };
    }
    
    return { nom: currentNom, prenom: currentPrenom };
  };

  useEffect(() => {
    if (visible) {
      const loadUserData = async () => {
        const desc = await fetchUserDescription(userId);
        const info = await fetchUserInfo(userId);
        setDescription(desc);
        setNewDescription(desc);
        setUserInfo(info);
      };
      
      loadUserData();
    }
  }, [visible, userId, userType]);

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
            <Avatar label={userInfo.prenom.charAt(0)} size="xlarge" shape="circle" />
          </div>
          <p className="text-center text-lg">
            <b>{userInfo.nom + " " + userInfo.prenom}</b>
          </p>
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
          <MoniteurInformations userId={userId} readOnly={viewingOtherProfile} />
        ) : (
          <StudentInformations userId={userId} readOnly={viewingOtherProfile} />
        )}
      </div>
    </Dialog>
  );
};

export default ProfileModal;
