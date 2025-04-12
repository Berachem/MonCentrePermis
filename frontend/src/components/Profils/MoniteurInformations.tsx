import React, { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar,faQuestionCircle,faUser } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from 'primereact/tooltip';
import { Button } from 'primereact/button';
import { useNavigate } from "react-router-dom";

interface moniteurInformations {
    
    //infos
    nom: string;
    prenom: string;
    genre: string;
    dateNaissance: string;
    email: string;
    telephone: string;
    dateDebutCarriere: string;
    dateFinCarriere: string;
    status: string;

    //stats
    coursesCount: string;
    studentCount: string;
    viewCount: string;
    rating: string;
}

const MoniteurInformations: React.FC = () => {
    const [moniteurInfo, setMoniteurInfo] = useState<moniteurInformations | null>(null);
    const navigate = useNavigate()

    const fetchMoniteurInfo = async () => {
        // TODO connecter le back
        return {
            nom: 'Dupont',
            prenom: 'Jean',
            genre: 'Masculin',
            dateNaissance: '15/05/1985',
            email: 'jean.dupont@example.com',
            telephone: '+33 6 12 34 56 78',
            dateDebutCarriere: '01/01/2010',
            dateFinCarriere: '31/12/2030',
            status: 'Actif',

            coursesCount: '145',
            studentCount: '10',
            viewCount: '20',
            rating: '4',
        };
    };

    useEffect(() => {
        // Appel simulé à l'API
        const getMoniteurInfo = async () => {
            const data = await fetchMoniteurInfo();
            setMoniteurInfo(data);
        };
        getMoniteurInfo();
    }, []);

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
            <div className="flex flex-wrap justify-between gap-y-2">
                <div style={{ flex: '0 0 48%' }}>
                    <p className="m-0" style={{ fontSize: '1.1rem' }}>
                        <strong>Nom :</strong> {moniteurInfo.nom}
                    </p>
                </div>
                <div style={{ flex: '0 0 48%' }}>
                    <p className="m-0" style={{ fontSize: '1.1rem' }}>
                        <strong>Prénom :</strong> {moniteurInfo.prenom}
                    </p>
                </div>
                <div style={{ flex: '0 0 48%' }}>
                    <p className="m-0" style={{ fontSize: '1.1rem' }}>
                        <strong>Genre :</strong> {moniteurInfo.genre}
                    </p>
                </div>
                <div style={{ flex: '0 0 48%' }}>
                    <p className="m-0" style={{ fontSize: '1.1rem' }}>
                        <strong>Date de naissance :</strong> {moniteurInfo.dateNaissance}
                    </p>
                </div>
            </div>

            <Divider/>

            {/* Contact */}
            <h3 className="text-indigo-600 text-lg font-semibold mb-2">Contact</h3>
            <div className="flex flex-wrap justify-between gap-y-2">
                <div style={{ flex: '0 0 48%' }}>
                    <p className="m-0" style={{ fontSize: '1.1rem' }}>
                        <strong>Email :</strong> {moniteurInfo.email}
                    </p>
                </div>
                <div style={{ flex: '0 0 48%' }}>
                    <p className="m-0" style={{ fontSize: '1.1rem' }}>
                        <strong>Numéro de téléphone :</strong> {moniteurInfo.telephone}
                    </p>
                </div>
            </div>

            <Divider/>

            {/* Carrière */}
            <h3 className="text-indigo-600 text-lg font-semibold mb-2">Carrière</h3>
            <div className="flex flex-wrap justify-between gap-y-2">
                <div style={{ flex: '0 0 48%' }}>
                    <p className="m-0" style={{ fontSize: '1.1rem' }}>
                        <strong>Date de début de carrière :</strong> {moniteurInfo.dateDebutCarriere}
                    </p>
                </div>
                <div style={{ flex: '0 0 48%' }}>
                    <p className="m-0" style={{ fontSize: '1.1rem' }}>
                        <strong>Date de fin de carrière :</strong> {moniteurInfo.dateFinCarriere}
                    </p>
                </div>
                <div style={{ flex: '0 0 48%' }}>
                    <p className="m-0" style={{ fontSize: '1.1rem' }}>
                        <strong>Status :</strong> {moniteurInfo.status}
                    </p>
                </div>
            </div>
        </div>
    </Card>

    <h2 className="text-2xl font-semibold mt-4 mb-2 md:mx-8 flex items-center">
        <FontAwesomeIcon icon={faChartBar} className="mr-2 text-indigo-600" />
        Statistiques
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
    </>
    );
};

export default MoniteurInformations;