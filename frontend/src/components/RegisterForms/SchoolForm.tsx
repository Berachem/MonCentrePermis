import "../../assets/css/Register.css";

import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { ScrollPanel } from "primereact/scrollpanel";
import { FloatLabel } from 'primereact/floatlabel';
import { InputTextarea } from "primereact/inputtextarea";
import { Divider } from "primereact/divider";

const AutoEcoleForm = forwardRef((props, ref) => {
    const [raisonSociale, setRaisonSociale] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [numeroAgrement, setNumeroAgrement] = useState('');
    const [adresse, setAdresse] = useState('');
    const [telephone, setTelephone] = useState('');
    const [description, setDescription] = useState('');

    // Gestion des messages d'erreur
    const [raisonSocialeError, setRaisonSocialeError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [numeroAgrementError, setNumeroAgrementError] = useState('');
    const [adresseError, setAdresseError] = useState('');
    const toastRef = React.useRef<Toast>(null);

    useImperativeHandle(ref, () => ({
        handleSubmit
    }));

    const handleSubmit = () => {
        let hasError = false;

        // Validation des champs obligatoires
        if (!raisonSociale) {
            setRaisonSocialeError('La raison sociale est requise.');
            hasError = true;
        } else {
            setRaisonSocialeError('');
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

        if (!numeroAgrement) {
            setNumeroAgrementError('Le numéro d\'agrément est requis.');
            hasError = true;
        } else {
            setNumeroAgrementError('');
        }

        if (!adresse) {
            setAdresseError('L\'adresse est requise.');
            hasError = true;
        } else {
            setAdresseError('');
        }

        if (!hasError) {
            toastRef.current?.show({ severity: 'success', summary: 'Inscription réussie!', detail: 'Bienvenue!', life: 3000 });
            // Envoyer les données au backend ici
        }
    };

    return (
        <>
            <Toast ref={toastRef} />
            <ScrollPanel style={{ width: '100%', height: '70vh' }} className='formScrollbar'>
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="flex flex-column gap-4">
                    
                    <Divider align="left">
                        <div className="inline-flex align-items-center">
                            <b>Champs obligatoires</b>
                        </div>
                    </Divider>

                    <div className="flex flex-column align-items-center">
                        <FloatLabel>
                            <label htmlFor="raisonSociale">Raison sociale</label>
                            <InputText id="raisonSociale" value={raisonSociale} onChange={(e) => setRaisonSociale(e.target.value)} invalid={raisonSocialeError !== ''} />
                        </FloatLabel>
                        <small className="p-error">{raisonSocialeError}</small>
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
                            <InputText id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} invalid={confirmPasswordError !== ''} />
                        </FloatLabel>
                        <small className="p-error">{confirmPasswordError}</small>
                    </div>

                    <div className="flex flex-column align-items-center">
                        <FloatLabel>
                            <label htmlFor="numeroAgrement">Numéro d'agrément</label>
                            <InputText id="numeroAgrement" value={numeroAgrement} onChange={(e) => setNumeroAgrement(e.target.value)} invalid={numeroAgrementError !== ''} />
                        </FloatLabel>
                        <small className="p-error">{numeroAgrementError}</small>
                    </div>

                    <div className="flex flex-column align-items-center">
                        <FloatLabel>
                            <label htmlFor="adresse">Adresse</label>
                            <InputText id="adresse" value={adresse} onChange={(e) => setAdresse(e.target.value)} invalid={adresseError !== ''} />
                        </FloatLabel>
                        <small className="p-error">{adresseError}</small>
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

                    <label htmlFor="description">Description</label>
                    <InputTextarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                </form>
            </ScrollPanel>
        </>
    );
});

export default AutoEcoleForm;
