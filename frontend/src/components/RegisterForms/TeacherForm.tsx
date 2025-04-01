import "../../assets/css/Register.css";

import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Toast } from 'primereact/toast';
import { FloatLabel } from 'primereact/floatlabel';
import { InputTextarea } from "primereact/inputtextarea";
import { Divider } from "primereact/divider";
import { ScrollPanel } from "primereact/scrollpanel"
import { ApiResponse } from "../../interfaces/interfaces";
import { postRequest } from "../../interfaces/utils/api";

const TeacherForm = forwardRef((props, ref) =>{
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [telephone, setTelephone] = useState('');
    const [genre, setGenre] = useState('');
    const [dateNaissance, setDateNaissance] = useState<Date | null>(null);
    const [dateDebutCarriere, setDateDebutCarriere] = useState<Date | null>(null);
    const [numeroCertification, setNumeroCertification] = useState('');
    const [description, setDescription] = useState('');

    // Gestion des messages d'erreur
    const [nomError, setNomError] = useState('');
    const [prenomError, setPrenomError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [numeroCertificationError, setNumeroCertificationError] = useState('');
    const toastRef = useRef<Toast>(null);

    useImperativeHandle(ref, () => ({
        handleSubmit
    }));

    const handleSubmit = async () => {
        let hasError = false;

        // Validation des champs obligatoires
        if (!nom) {
            setNomError('Le nom est requis.');
            hasError = true;
        } else {
            setNomError('');
        }

        if (!prenom) {
            setPrenomError('Le prénom est requis.');
            hasError = true;
        } else {
            setPrenomError('');
        }

        if (!email) {
            setEmailError('L\'email est requis.');
            hasError = true;
        } else {
            setEmailError('');
        }

        if (!password) {
            setPasswordError('Le mot de passe est requis.');
            hasError = true;
        } else {
            setPasswordError('');
        }

        if (password !== confirmPassword) {
            setConfirmPasswordError('Les mots de passe ne correspondent pas.');
            hasError = true;
        } else {
            setConfirmPasswordError('');
        }

        if (!numeroCertification) {
            setNumeroCertificationError('Le numéro d\'agrément est requis.');
            hasError = true;
        } else {
            setNumeroCertificationError('');
        }

        if (!hasError) {
            const formData = {
                nom,
                prenom,
                numeroCertification,
                email,
                password,
                telephone,
                genre,
                dateDebutCarriere,
                dateNaissance,
                description,
                role: "moniteur",  
            };
            try {
                // Utilisation de la fonction `postRequest` pour envoyer les données
                const response: ApiResponse = await postRequest('custom/create-compte', formData);
                
                if (response.token) {
                    localStorage.setItem('jwtToken', response.token);
                    console.log('Token ', response.token)
                    // Si l'inscription est réussie, afficher un message de succès
                    toastRef.current?.show({ severity: 'success', summary: 'Inscription réussie!', detail: 'Bienvenue!', life: 3000 });
                    window.location.href = '/';
                }

            } catch (error) {
                // Affichage des erreurs dans la console
                console.error('Erreur lors de l\'inscription:', error);
                toastRef.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Une erreur est survenue.', life: 3000 });
            }
        }
    };

    return (
        <>
            <Toast ref={toastRef} />
            <ScrollPanel style={{ width: '100%', height: '70vh' }} className='formScrollbar'>
                <form onSubmit={(e)=>{e.preventDefault();handleSubmit();}} className="flex flex-column gap-4">
                    
                    <Divider align="left">
                        <div className="inline-flex align-items-center">
                            <b>Champs obligatoires</b>
                        </div>
                    </Divider>

                    <div className="flex flex-column align-items-center">
                        <FloatLabel>
                            <label htmlFor="nom">Nom</label>
                            <InputText id="nom" value={nom} onChange={(e) => setNom(e.target.value)} invalid={nomError !== ''} />
                        </FloatLabel>
                        <small className="p-error">{nomError}</small>
                    </div>

                    <div className="flex flex-column align-items-center">
                        <FloatLabel>
                            <label htmlFor="prenom">Prénom</label>
                            <InputText id="prenom" value={prenom} onChange={(e) => setPrenom(e.target.value)} invalid={prenomError !== ''} />
                        </FloatLabel>
                        <small className="p-error">{prenomError}</small>
                    </div>

                    
                    <div className="flex flex-column align-items-center">
                        <FloatLabel >
                            <label htmlFor="numeroCertification">Numéro de Certification</label>
                            <InputText id="numeroCertification" value={numeroCertification} onChange={(e) => setNumeroCertification(e.target.value)} invalid={numeroCertificationError !== ''} />
                        </FloatLabel>
                        <small className="p-error">{numeroCertificationError}</small>
                    </div>

                    <div className="flex flex-column align-items-center">
                        <FloatLabel>
                            <label htmlFor="email">Email</label>
                            <InputText id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} invalid={emailError !== ''} />
                        </FloatLabel>   
                        <small className="p-error">{emailError}</small>
                    </div>

                    <div className="flex flex-column align-items-center">
                        <FloatLabel>
                            <label htmlFor="password">Mot de passe</label>
                            <InputText id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} invalid={passwordError !== ''} />
                        </FloatLabel>
                        <small className="p-error">{passwordError}</small>
                    </div>

                    <div className="flex flex-column align-items-center">
                        <FloatLabel>
                            <label htmlFor="confirmPassword">Confirmez le mot de passe</label>
                            <InputText id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} invalid={confirmPasswordError !== ''}/>
                        </FloatLabel>
                        <small className="p-error">{confirmPasswordError}</small>
                    </div>


                    <Divider align="left">
                        <div className="inline-flex align-items-center">
                            <b>Champs non obligatoires</b>
                        </div>
                    </Divider>

                    <div className="flex flex-column align-items-center">
                        <FloatLabel>
                            <label htmlFor="telephone">Téléphone</label>
                            <InputText id="telephone" value={telephone} onChange={(e) => setTelephone(e.target.value)} />
                        </FloatLabel>
                    </div>

                    <div className="flex flex-column align-items-center">
                        <FloatLabel>
                            <label htmlFor="genre">Genre</label>
                            <InputText id="genre" value={genre} onChange={(e) => setGenre(e.target.value)} />
                        </FloatLabel>
                    </div>

                    <label htmlFor="dateNaissance">Date de naissance</label>
                    <Calendar id="dateNaissance" value={dateNaissance} onChange={(e) => setDateNaissance(e.value as Date)} dateFormat="dd/mm/yy" showIcon />

                    <label htmlFor="dateDebutCarriere">Date de début de carrière</label>
                    <Calendar id="dateDebutCarriere" value={dateDebutCarriere} onChange={(e) => setDateDebutCarriere(e.value as Date)} dateFormat="dd/mm/yy" showIcon />

                    <label htmlFor="description">Description</label>
                    <InputTextarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                </form>
            </ScrollPanel>
        </>
    );
});

export default TeacherForm;
