import React, { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Avatar } from 'primereact/avatar';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit,faChartBar,faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from 'primereact/tooltip';


const Profile: React.FC = () => {
  const { isAuthenticated, prenom, nom, logout } = useAuth();
  const navigate = useNavigate()
  const [studentCount, setStudentCount] = useState<number | null>(null);
  const [viewCount, setViewCount] = useState<number | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [courseCount, setCourseCount] = useState<number | null>(null)
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

  const fetchCourseCount = async () => {
    // TODO : connecter le back
    return 145
  };

  const fetchStudentCount = async (): Promise<number> => {
    // TODO: connecter au backend
    return 10;
  };

  const fetchViewCount = async (): Promise<number> => {
    // TODO: connecter au backend
    return 20;
  };

  const fetchRating = async (): Promise<number> => {
    // TODO: connecter au backend
    return 4;
  };

  useEffect(() => {
    // check de l'auth (même si le routing gère déjà)
    if (!isAuthenticated) {
      navigate("/")
    }

    const loadUserData = async () => {
      const [desc, course, students, views, rate] = await Promise.all([
        fetchUserDescription(),
        fetchCourseCount(),
        fetchStudentCount(),
        fetchViewCount(),
        fetchRating(),
      ]);
  
      setDescription(desc);
      setNewDescription(desc);
      setCourseCount(course);
      setStudentCount(students);
      setViewCount(views);
      setRating(rate);
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

      <h2 className="text-2xl font-semibold mt-4 mb-2 md:mx-8 flex items-center">
        <FontAwesomeIcon icon={faChartBar} className="mr-2 text-indigo-600" />
        Mes statistiques
      </h2>
      <div className="flex flex-column md:flex-row gap-3 mt-4 md:mx-8">
        <div className="relative w-full md:w-6">
          <Card className="w-full relative overflow-hidden">
            <i
              className={`pi pi-book text-indigo-200 text-8xl absolute top-0 right-0 m-3 pointer-events-none`}
            ></i>

            <div className="flex flex-column">
              <span className="text-indigo-600 text-6xl my-2">
                {courseCount !== null ? courseCount : '0'}
              </span>
              <span className="text-xl ml-2">cours créés</span>
              <Button
                label="Voir mes cours"
                className="button-text text-sm mr-auto mt-3 md:mt-4"
                onClick={() => console.log('Voir les cours')}
              />
            </div>
          </Card>
        </div>

        <div className="relative w-full md:w-6"> 
          <div className="relative">
            <Card>
              <Tooltip target=".eleve-tooltip" />
                  <FontAwesomeIcon
                        icon={faQuestionCircle}
                        className="eleve-tooltip text-right text-sm cursor-pointer absolute top-0 right-0 m-2"
                        data-pr-tooltip="Nombre d'élèves inscrits a vos cours"
                  />
                <div className="flex flex-column align-items-start relative">
                  <i className="pi pi-users text-indigo-200 text-7xl absolute top-0 right-0 m-2 pointer-events-none"></i>
                  <span className="text-indigo-600 text-4xl my-2">{studentCount ?? '...'}</span>
                  <span className="text-xl text-gray-500">Élèves</span>
                </div>
            </Card>
          </div>

          <div className="relative">
            <Card className="mt-2">
                <Tooltip target=".vues-tooltip" />
                <FontAwesomeIcon
                      icon={faQuestionCircle}
                      className="vues-tooltip text-right text-sm cursor-pointer absolute top-0 right-0 m-2"
                      data-pr-tooltip="Nombre de fois que vos cours on été consultés"
                />
                <div className="flex flex-column align-items-start relative">
                  <i className="pi pi-eye text-green-200 text-7xl absolute top-0 right-0 m-2 pointer-events-none"></i>
                  <span className="text-green-600 text-4xl my-2">{viewCount ?? '...'}</span>
                  <span className="text-xl text-gray-500">Vues</span>
                </div>
            </Card>
          </div>

          <div className="relative">
            <Card className="mt-2">
                <Tooltip target=".note-tooltip" />
                <FontAwesomeIcon
                      icon={faQuestionCircle}
                      className="note-tooltip text-right text-sm cursor-pointer absolute top-0 right-0 m-2"
                      data-pr-tooltip="Note moyenne par rapport a toutes les évaluations laissées par vos élèves"
                />
                <div className="flex flex-column align-items-start relative">
                  <i className="pi pi-star text-yellow-200 text-7xl absolute top-0 right-0 m-2 pointer-events-none"></i>
                  <span className="text-yellow-500 text-4xl my-2">4 / 5</span>
                  <span className="text-xl text-gray-500">Note</span>
                </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
