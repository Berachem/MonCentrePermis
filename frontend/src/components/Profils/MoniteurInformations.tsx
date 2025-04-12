import React, { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar,faQuestionCircle,faUser } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from 'primereact/tooltip';
import { Button } from 'primereact/button';
import { useNavigate } from "react-router-dom";
import { InputText } from 'primereact/inputtext';    
import { Calendar } from 'primereact/calendar';
import useAuth from "../../hooks/useAuth";
           

interface moniteurInformations {
    
    //infos
    nom: string;
    prenom: string;
    genre: string;
    dateNaissance: Date;
    email: string;
    telephone: string;
    dateDebutCarriere: Date;
    dateFinCarriere: Date;
    status: string;

    //stats
    coursesCount: string;
    studentCount: string;
    viewCount: string;
    rating: string;
}

const MoniteurInformations: React.FC = () => {
    const { logout } = useAuth();
    const [moniteurInfo, setMoniteurInfo] = useState<moniteurInformations | null>(null);
    const navigate = useNavigate()
    const [isEditing, setIsEditing] = useState(false);
    const [editedInfo, setEditedInfo] = useState<moniteurInformations | null>(null);

    const fetchMoniteurInfo = async () => {
        // TODO connecter le back
        return {
            nom: 'Dupont',
            prenom: 'Jean',
            genre: 'Masculin',
            dateNaissance: new Date('1985-05-15'), 
            email: 'jean.dupont@example.com',
            telephone: '+33 6 12 34 56 78',
            dateDebutCarriere: new Date('2010-01-01'), 
            dateFinCarriere: new Date('2030-12-31'),
            status: 'Actif',
    
            coursesCount: '145',
            studentCount: '10',
            viewCount: '20',
            rating: '4',
        };
    };

    const saveMoniteurInfo = async (updatedInfo: moniteurInformations) => {
        // TODO connecter le back
        console.log("API appelée pour sauvegarder les informations:", updatedInfo);
        return;
    };

    useEffect(() => {
        // Appel simulé à l'API
        const getMoniteurInfo = async () => {
            const data = await fetchMoniteurInfo();
            setMoniteurInfo(data);
            setEditedInfo(data);
        };
        getMoniteurInfo();
    }, []);

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSaveClick = async () => {
        if (editedInfo) {
            await saveMoniteurInfo(editedInfo);
            setMoniteurInfo(editedInfo); // Met à jour les informations affichées
            setIsEditing(false);
        }
    };

    const handleInputChange = (field: keyof moniteurInformations, value: string|Date) => {
        if (editedInfo) {
            setEditedInfo({ ...editedInfo, [field]: value });
        }
    };



    if (!moniteurInfo) {
        return (
            <Card className="md:mx-8">
                <div className="text-center text-gray-500">Chargement des informations...</div>
            </Card>
        );
    }

    return (
        <>
        <h2 className="text-2xl font-semibold mt-4 mb-2 md:mx-8 flex items-center">
            <FontAwesomeIcon icon={faUser} className="mr-2 text-indigo-600" />
            Informations
        </h2>

        <Card className="md:mx-8">
        <div className="p-4">
            {/* Informations personnelles */}
            <h3 className="text-indigo-600 text-lg font-semibold mb-2">Informations personnelles</h3>
            <div>
                <div className='mx-auto'>
                    {isEditing ? (
                        <p className="m-2" style={{ fontSize: '1.1rem' }}>
                            <strong>Nom :</strong><br/>
                            <InputText type="text" 
                                className="p-inputtext-sm" 
                                placeholder={moniteurInfo.nom} 
                                onChange={(e) => handleInputChange('nom', e.target.value)} 
                            />
                        </p>
                    ) : (
                        <p className="m-2" style={{ fontSize: '1.1rem' }}>
                            <strong>Nom :</strong> {moniteurInfo.nom}
                        </p>
                    )}
                </div>
                <div>
                    {isEditing ? (
                        <p className="m-2" style={{ fontSize: '1.1rem' }}>
                            <strong>Prénom :</strong><br/>
                            <InputText type="text" 
                                className="p-inputtext-sm" 
                                placeholder={moniteurInfo.prenom}
                                onChange={(e) => handleInputChange('prenom', e.target.value)} 
                            />
                        </p>
                    ) : (
                        <p className="m-2" style={{ fontSize: '1.1rem' }}>
                            <strong>Prénom :</strong> {moniteurInfo.prenom}
                        </p>
                    )}
                </div>
                <div>
                    {isEditing ? (
                        <p className="m-2" style={{ fontSize: '1.1rem' }}>
                            <strong>Genre :</strong><br/>
                            <InputText type="text" 
                                className="p-inputtext-sm" 
                                placeholder={moniteurInfo.genre}
                                onChange={(e) => handleInputChange('genre', e.target.value)} 
                            />
                        </p>
                    ) : (
                        <p className="m-2" style={{ fontSize: '1.1rem' }}>
                            <strong>Genre :</strong> {moniteurInfo.genre}
                        </p>
                    )}
                </div>
                <div>
                    {isEditing ? (
                        <p className="m-2" style={{ fontSize: '1.1rem' }}>
                            <strong>Naissance :</strong><br/>
                            <Calendar 
                                className="p-inputtext-sm"
                                dateFormat="dd/mm/yy"
                                value={moniteurInfo.dateNaissance} 
                                onChange={(e) => handleInputChange('dateNaissance', e.target.value as Date)} 
                            />
                        </p>
                    ) : (
                        <p className="m-2" style={{ fontSize: '1.1rem' }}>
                            <strong>Naissance :</strong> {moniteurInfo.dateNaissance.toLocaleDateString('fr-FR')}
                        </p>
                    )}
                </div>
            </div>

            <Divider/>

            {/* Contact */}
            <h3 className="text-indigo-600 text-lg font-semibold mb-2">Contact</h3>
            <div>
                <div>
                    {isEditing ? (
                        <p className="m-2" style={{ fontSize: '1.1rem' }}>
                            <strong>Email :</strong><br/>
                            <InputText type="text" 
                                className="p-inputtext-sm" 
                                placeholder={moniteurInfo.email}
                                onChange={(e) => handleInputChange('email', e.target.value)} 
                            />
                        </p>
                    ) : (
                        <p className="m-2" style={{ fontSize: '1.1rem' }}>
                            <strong>Email :</strong> {moniteurInfo.email}
                        </p>
                    )}
                </div>
                <div>
                    {isEditing ? (
                        <p className="m-2" style={{ fontSize: '1.1rem' }}>
                            <strong>Téléphone :</strong><br/>
                            <InputText type="text" 
                                className="p-inputtext-sm" 
                                placeholder={moniteurInfo.telephone}
                                onChange={(e) => handleInputChange('telephone', e.target.value)} 
                            />
                        </p>
                    ) : (
                        <p className="m-2" style={{ fontSize: '1.1rem' }}>
                            <strong>Téléphone :</strong> {moniteurInfo.telephone}
                        </p>
                    )}
                </div>
            </div>

            <Divider/>

            {/* Carrière */}
            <h3 className="text-indigo-600 text-lg font-semibold mb-2">Carrière</h3>
            <div>
                <div>
                    {isEditing ? (
                        <p className="m-2" style={{ fontSize: '1.1rem' }}>
                            <strong>Début de carrière :</strong><br/>
                            <Calendar 
                                className="p-inputtext-sm"
                                dateFormat="dd/mm/yy"
                                value={moniteurInfo.dateDebutCarriere} 
                                onChange={(e) => handleInputChange('dateDebutCarriere', e.target.value as Date)} 
                            />
                        </p>
                    ) : (
                        <p className="m-2" style={{ fontSize: '1.1rem' }}>
                            <strong>Début de carrière :</strong> {moniteurInfo.dateDebutCarriere.toLocaleDateString('fr-FR')}
                        </p>
                    )}  
                </div>
                <div>
                    {isEditing ? (
                        <p className="m-2" style={{ fontSize: '1.1rem' }}>
                            <strong>Fin de carrière :</strong><br/>
                            <Calendar 
                                className="p-inputtext-sm"
                                dateFormat="dd/mm/yy"
                                value={moniteurInfo.dateFinCarriere} 
                                onChange={(e) => handleInputChange('dateFinCarriere', e.target.value as Date)} 
                            />
                        </p>
                    ) : (
                        <p className="m-2" style={{ fontSize: '1.1rem' }}>
                            <strong>Fin de carrière :</strong> {moniteurInfo.dateFinCarriere.toLocaleDateString('fr-FR')}
                        </p>
                    )}  
                    
                </div>
                <div>
                    {isEditing ? (
                        <p className="m-2" style={{ fontSize: '1.1rem' }}>
                            <strong>Status :</strong><br/>
                            <InputText type="text" 
                                className="p-inputtext-sm" 
                                placeholder={moniteurInfo.status}
                                onChange={(e) => handleInputChange('status', e.target.value)} 
                            />
                        </p>
                    ) : (
                        <p className="m-2" style={{ fontSize: '1.1rem' }}>
                            <strong>Status :</strong> {moniteurInfo.status}
                        </p>
                    )}
                </div>
            </div>
        </div>


        <div className="flex w-full mt-2">
            {isEditing ? (
            <Button
                label="Sauvegarder"
                icon="pi pi-check"
                onClick={handleSaveClick}
                className="button-text text-sm ml-auto"
            />
            ) : (
                <Button
                    label="Modifier"
                    icon="pi pi-pencil"
                    onClick={handleEditClick}
                    className="button-text text-sm ml-auto"
                />
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
                    {moniteurInfo.coursesCount}
                </span>
                <span className="text-xl ml-2">cours créés</span>
                <Button
                    label="Voir mes cours"
                    className="button-text text-sm mr-auto mt-3 md:mt-4"
                    onClick={()=>{navigate('/classes')}}
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
                        <span className="text-indigo-600 text-4xl my-2">{moniteurInfo.studentCount}</span>
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
                        <span className="text-green-600 text-4xl my-2">{moniteurInfo.viewCount}</span>
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
                        <span className="text-yellow-500 text-4xl my-2">{moniteurInfo.rating} / 5</span>
                        <span className="text-xl text-gray-500">Note</span>
                    </div>
                </Card>
            </div>
        </div>
    </div>
    
    <div className="flex w-full m-2">  
        <Button
            label="Se déconnecter"
            icon="pi pi-sign-out"
            onClick={() => {logout();}}
            className="p-button-danger text-sm m-auto"
        />
    </div>

    </>
    );
};

export default MoniteurInformations;