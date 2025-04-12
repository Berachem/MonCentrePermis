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
import { Toast } from 'primereact/toast';
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
    
    // États pour gérer les erreurs de validation
    const [nomError, setNomError] = useState('');
    const [prenomError, setPrenomError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [telephoneError, setTelephoneError] = useState('');
    const [dateDebutCarriereError, setDateDebutCarriereError] = useState('');
    const [dateFinCarriereError, setDateFinCarriereError] = useState('');
    const toastRef = React.useRef<Toast>(null);

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
        // Réinitialiser les erreurs lors de l'entrée en mode édition
        setNomError('');
        setPrenomError('');
        setEmailError('');
        setTelephoneError('');
        setDateDebutCarriereError('');
        setDateFinCarriereError('');
        setIsEditing(true);
    };

    const handleSaveClick = async () => {
        if (editedInfo) {
            // Vérifier les champs obligatoires
            let hasError = false;

            if (!editedInfo.nom || editedInfo.nom.trim() === '') {
                setNomError('Le nom est requis.');
                hasError = true;
            } else {
                setNomError('');
            }

            if (!editedInfo.prenom || editedInfo.prenom.trim() === '') {
                setPrenomError('Le prénom est requis.');
                hasError = true;
            } else {
                setPrenomError('');
            }

            if (!editedInfo.email || editedInfo.email.trim() === '') {
                setEmailError('L\'email est requis.');
                hasError = true;
            } else {
                // Validation simple du format de l'email
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(editedInfo.email)) {
                    setEmailError('Format d\'email invalide.');
                    hasError = true;
                } else {
                    setEmailError('');
                }
            }

            // Validation optionnelle du numéro de téléphone si fourni
            if (editedInfo.telephone && editedInfo.telephone.trim() !== '' && 
                !/^(\+\d{1,3}\s?)?\d{10}$/.test(editedInfo.telephone.replace(/\s/g, ''))) {
                setTelephoneError('Format de téléphone invalide.');
                hasError = true;
            } else {
                setTelephoneError('');
            }

            // Vérification des dates
            if (editedInfo.dateNaissance && editedInfo.dateDebutCarriere) {
                // Vérifier que la date de début de carrière est après la date de naissance
                if (editedInfo.dateDebutCarriere < editedInfo.dateNaissance) {
                    setDateDebutCarriereError('La date de début de carrière ne peut pas être antérieure à la date de naissance.');
                    hasError = true;
                } else {
                    setDateDebutCarriereError('');
                }
            }

            if (editedInfo.dateDebutCarriere && editedInfo.dateFinCarriere) {
                // Vérifier que la date de fin est après la date de début
                if (editedInfo.dateFinCarriere < editedInfo.dateDebutCarriere) {
                    setDateFinCarriereError('La date de fin de carrière ne peut pas être antérieure à la date de début.');
                    hasError = true;
                } else {
                    setDateFinCarriereError('');
                }
            }

            if (!hasError) {
                // Créer une copie pour éviter les références d'objet
                const infoToSave = {...editedInfo};
                
                // Pour les champs non-obligatoires, s'assurer de ne pas envoyer de chaînes vides
                // mais plutôt conserver les valeurs existantes
                if (moniteurInfo) {
                    if (!infoToSave.genre || infoToSave.genre.trim() === '') 
                        infoToSave.genre = moniteurInfo.genre;
                    
                    if (!infoToSave.telephone || infoToSave.telephone.trim() === '')
                        infoToSave.telephone = moniteurInfo.telephone;
                    
                    if (!infoToSave.status || infoToSave.status.trim() === '')
                        infoToSave.status = moniteurInfo.status;
                }
                
                try {
                    await saveMoniteurInfo(infoToSave);
                    setMoniteurInfo(infoToSave); // Met à jour les informations affichées
                    setIsEditing(false);
                    toastRef.current?.show({ 
                        severity: 'success', 
                        summary: 'Modifications enregistrées', 
                        detail: 'Vos informations ont été mises à jour avec succès.',
                        life: 3000
                    });
                } catch (error) {
                    console.error('Erreur lors de la mise à jour des informations:', error);
                    toastRef.current?.show({ 
                        severity: 'error', 
                        summary: 'Erreur', 
                        detail: 'Une erreur est survenue lors de la mise à jour de vos informations.',
                        life: 3000
                    });
                }
            } else {
                // Afficher un message d'erreur général
                toastRef.current?.show({ 
                    severity: 'error', 
                    summary: 'Validation échouée', 
                    detail: 'Veuillez corriger les erreurs dans le formulaire.',
                    life: 3000
                });
            }
        }
    };

    const handleInputChange = (field: keyof moniteurInformations, value: string | Date) => {
        if (editedInfo) {
            // Si c'est une chaîne vide, on garde la valeur d'origine pour éviter les valeurs nulles indésirables
            if (typeof value === 'string' && value.trim() === '' && moniteurInfo && field !== 'nom' && field !== 'prenom' && field !== 'email') {
                // Pour les champs obligatoires, on permet de les vider pour que la validation s'active
                setEditedInfo({ ...editedInfo, [field]: moniteurInfo[field] });
            } else {
                setEditedInfo({ ...editedInfo, [field]: value });
            }
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
            <Toast ref={toastRef} />
            <h2 className="text-2xl font-semibold mt-4 mb-2 md:mx-8 flex items-center">
                <FontAwesomeIcon icon={faUser} className="mr-2 text-indigo-600" />
                Informations
            </h2>

            <Card className="md:mx-8">
            <div className="p-2">
                {/* Informations personnelles */}
                <h3 className="text-indigo-600 text-xl font-semibold">Informations personnelles</h3>
                <div className="grid p-fluid">
                    <div className="col-12 md:col-6 p-2">
                        {isEditing ? (
                            <div className="mb-1">
                                <strong style={{ fontSize: '1rem' }}>Nom :</strong><br/>
                                <InputText type="text" 
                                    className="p-inputtext-sm" 
                                    value={editedInfo?.nom || ''}
                                    onChange={(e) => handleInputChange('nom', e.target.value)} 
                                    invalid={nomError !== ''}
                                />
                                {nomError && <small className="p-error block">{nomError}</small>}
                            </div>
                        ) : (
                            <div className="mb-1">
                                <strong style={{ fontSize: '1rem' }}>Nom :</strong> {moniteurInfo.nom}
                            </div>
                        )}
                    </div>
                    <div className="col-12 md:col-6 p-2">
                        {isEditing ? (
                            <div className="mb-1">
                                <strong style={{ fontSize: '1rem' }}>Prénom :</strong><br/>
                                <InputText type="text" 
                                    className="p-inputtext-sm" 
                                    value={editedInfo?.prenom || ''}
                                    onChange={(e) => handleInputChange('prenom', e.target.value)} 
                                    invalid={prenomError !== ''}
                                />
                                {prenomError && <small className="p-error block">{prenomError}</small>}
                            </div>
                        ) : (
                            <div className="mb-1">
                                <strong style={{ fontSize: '1rem' }}>Prénom :</strong> {moniteurInfo.prenom}
                            </div>
                        )}
                    </div>
                    <div className="col-12 md:col-6 p-2">
                        {isEditing ? (
                            <div className="mb-1">
                                <strong>Genre :</strong><br/>
                                <InputText type="text" 
                                    className="p-inputtext-sm" 
                                    value={editedInfo?.genre || ''}
                                    onChange={(e) => handleInputChange('genre', e.target.value)} 
                                />
                            </div>
                        ) : (
                            <div className="mb-1">
                                <strong>Genre :</strong> {moniteurInfo.genre}
                            </div>
                        )}
                    </div>
                    <div className="col-12 md:col-6 p-2">
                        {isEditing ? (
                            <div className="mb-1" >
                                <strong>Naissance :</strong><br/>
                                <Calendar 
                                    className="p-inputtext-sm"
                                    dateFormat="dd/mm/yy"
                                    value={editedInfo?.dateNaissance || null} 
                                    onChange={(e) => handleInputChange('dateNaissance', e.target.value as Date)} 
                                />
                            </div>
                        ) : (
                            <div className="mb-1">
                                <strong>Naissance :</strong> {moniteurInfo.dateNaissance.toLocaleDateString('fr-FR')}
                            </div>
                        )}
                    </div>
                </div>

                <Divider className="my-2"/>

                {/* Contact */}
                <h3 className="text-indigo-600 text-xl font-semibold">Contact</h3>
                <div className="grid p-fluid">
                    <div className="col-12 md:col-6 p-2">
                        {isEditing ? (
                            <div className="mb-1">
                                <strong>Email :</strong><br/>
                                <InputText type="text" 
                                    className="p-inputtext-sm" 
                                    value={editedInfo?.email || ''}
                                    onChange={(e) => handleInputChange('email', e.target.value)} 
                                    invalid={emailError !== ''}
                                />
                                {emailError && <small className="p-error block">{emailError}</small>}
                            </div>
                        ) : (
                            <div className="mb-1">
                                <strong>Email :</strong> {moniteurInfo.email}
                            </div>
                        )}
                    </div>
                    <div className="col-12 md:col-6 p-2">
                        {isEditing ? (
                            <div className="mb-1">
                                <strong>Téléphone :</strong><br/>
                                <InputText type="text" 
                                    className="p-inputtext-sm" 
                                    value={editedInfo?.telephone || ''}
                                    onChange={(e) => handleInputChange('telephone', e.target.value)} 
                                    invalid={telephoneError !== ''}
                                />
                                {telephoneError && <small className="p-error block">{telephoneError}</small>}
                            </div>
                        ) : (
                            <div className="mb-1">
                                <strong>Téléphone :</strong> {moniteurInfo.telephone}
                            </div>
                        )}
                    </div>
                </div>

                <Divider className="my-2"/>

                {/* Carrière */}
                <h3 className="text-indigo-600 text-xl font-semibold">Carrière</h3>
                <div className="grid p-fluid">
                    <div className="col-12 md:col-6 p-2">
                        {isEditing ? (
                            <div className="mb-1">
                                <strong>Début de carrière :</strong><br/>
                                <Calendar 
                                    className="p-inputtext-sm"
                                    dateFormat="dd/mm/yy"
                                    value={editedInfo?.dateDebutCarriere || null} 
                                    onChange={(e) => handleInputChange('dateDebutCarriere', e.target.value as Date)} 
                                />
                                {dateDebutCarriereError && <small className="p-error block">{dateDebutCarriereError}</small>}
                            </div>
                        ) : (
                            <div className="mb-1">
                                <strong>Début de carrière :</strong> {moniteurInfo.dateDebutCarriere.toLocaleDateString('fr-FR')}
                            </div>
                        )}  
                    </div>
                    <div className="col-12 md:col-6 p-2">
                        {isEditing ? (
                            <div className="mb-1">
                                <strong>Fin de carrière :</strong><br/>
                                <Calendar 
                                    className="p-inputtext-sm"
                                    dateFormat="dd/mm/yy"
                                    value={editedInfo?.dateFinCarriere || null} 
                                    onChange={(e) => handleInputChange('dateFinCarriere', e.target.value as Date)} 
                                />
                                {dateFinCarriereError && <small className="p-error block">{dateFinCarriereError}</small>}
                            </div>
                        ) : (
                            <div className="mb-1">
                                <strong>Fin de carrière :</strong> {moniteurInfo.dateFinCarriere.toLocaleDateString('fr-FR')}
                            </div>
                        )}  
                        
                    </div>
                    <div className="col-12 md:col-6 p-2">
                        {isEditing ? (
                            <div className="mb-1">
                                <strong>Status :</strong><br/>
                                <InputText type="text" 
                                    className="p-inputtext-sm" 
                                    placeholder={moniteurInfo.status}
                                    onChange={(e) => handleInputChange('status', e.target.value)} 
                                />
                            </div>
                        ) : (
                            <div className="mb-1">
                                <strong>Status :</strong> {moniteurInfo.status}
                            </div>
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