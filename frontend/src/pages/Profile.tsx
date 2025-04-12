import React, { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Avatar } from 'primereact/avatar';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import MoniteurInformations from "../components/Profils/MoniteurInformations";


const Profile: React.FC = () => {
  const { isAuthenticated, prenom, nom } = useAuth();
  const navigate = useNavigate()
  const [description, setDescription] = useState('');
  const [newDescription, setNewDescription] = useState(''); //si l'utilisateur modifie sa desc
  const [isEditing, setIsEditing] = useState(false)

  
  const updateUserDescription = async (newDesc: string) => {
    console.log("API appelée pour modifier la description:", newDesc)
    // TODO : Connecter le back
  };

  const fetchUserDescription = async () => {
    // TODO : connecter le back
    return "Développeur passionné par les technologies web et mobiles. Toujours curieux d'apprendre de nouvelles choses !"
  };

  useEffect(() => {
    // check de l'auth (même si le routing gère déjà)
    if (!isAuthenticated) {
      navigate("/")
    }

    const loadUserData = async () => {
      const desc = await fetchUserDescription()
      
      setDescription(desc);
      setNewDescription(desc);
    };
  
  
    loadUserData()
  }, [isAuthenticated, navigate])

  const handleEditClick = () => {
    setIsEditing(true)
  };

  const handleSaveClick = async () => {
    setIsEditing(false)
    await updateUserDescription(newDescription);
    setDescription(newDescription)
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveClick()
    }
  };

  return (
    <div className="justify-center items-center min-h-screen bg-gray-100 p-4 md:px-8">
      <Card className="md:mx-8">
        <div className="items-center p-2">
          <div className="m-auto w-fit">
            <Avatar label={prenom.charAt(0)} size="xlarge" shape="circle" />
          </div>
          <p className="text-center text-lg">
            <b>{nom + " " + prenom}</b>
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
              <p className="text-center text-gray-700 mx-auto ">
                <i>{description || 'Chargement de la description...'}</i>
                <FontAwesomeIcon icon={faEdit} onClick={handleEditClick} className="ml-2 text-blue-500 hover:text-blue-600 cursor-pointer"/>
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
      </Card>

      <MoniteurInformations/>
    </div>
      
  );
};

export default Profile;
