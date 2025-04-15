import "../../assets/css/Register.css";

import React, { useState, useImperativeHandle, forwardRef } from 'react';

import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Toast } from 'primereact/toast';
import { ScrollPanel } from "primereact/scrollpanel";
import { FloatLabel } from 'primereact/floatlabel';
import { InputTextarea } from "primereact/inputtextarea";
import { Divider } from "primereact/divider";
import { postRequest } from "../../interfaces/utils/api";
import { ApiResponse } from "../../interfaces/interfaces";
import { Genre, GenreLabels } from '../../enum/genre';
import { Dropdown } from "primereact/dropdown";

const isPasswordStrong = (pwd: string) => {
    const lengthOK = pwd.length >= 12;
    const hasLower = /[a-z]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    const hasSpecial = /[\W_]/.test(pwd);
    return lengthOK && hasLower && hasUpper && hasNumber && hasSpecial;
};

const StudentForm = forwardRef((props, ref) => {
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [telephone, setTelephone] = useState('');
    const [genre, setGenre] = useState<Genre>(Genre.homme);
    const [dateNaissance, setDateNaissance] = useState<Date | null>(null);
    const [dateExamen, setDateExamen] = useState<Date | null>(null);
    const [biographie, setBiographie] = useState('');

    // Gestion des erreurs
    const [errors, setErrors] = useState<Record<string, string>>({});
    const toastRef = React.useRef<Toast>(null);

    useImperativeHandle(ref, () => ({
        handleSubmit
    }));

    const validateFields = () => {
        const newErrors: Record<string, string> = {};
        if (!nom) newErrors.nom = "Le nom est requis.";
        if (!prenom) newErrors.prenom = "Le prénom est requis.";
        if (!email) newErrors.email = "L'email est requis.";
        if (!password) {
            newErrors.password = "Le mot de passe est requis.";
        } else if (!isPasswordStrong(password)) {
            newErrors.password = "Le mot de passe n'est pas assez sécurisé.";
        }        
        if (password !== confirmPassword) newErrors.confirmPassword = "Les mots de passe ne correspondent pas.";
        if (!genre) newErrors.genre = "Le genre est requis.";
        if (Object.keys(newErrors).length > 0) {
            let errorMessage = (
            <ul>
                {Object.entries(newErrors).map(([field, message]) => (
                <li key={field}>{message}</li>
                ))}
            </ul>
            );
            toastRef.current?.show({ severity: 'error', summary: 'Erreur', detail: errorMessage, life: 4000 });
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateFields()) return;

        const formData = {
            nom, prenom, email, password,
            telephone, genre,
            dateNaissance, dateExamen,
            biographie,
            role: "eleve",
        };

        try {
            // console.log("Données envoyées à l'API:", formData);
            const response: ApiResponse = await postRequest('/compte/create-compte', formData);
            // console.log("Réponse de l'API:", response);
            if (response.token) {
                localStorage.setItem('jwtToken', response.token);
                toastRef.current?.show({ severity: 'success', summary: 'Inscription réussie!', detail: 'Bienvenue!', life: 3000 });
                window.location.href = '/';
            } else {
                toastRef.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Inscription possible mais réponse inattendue.', life: 3000 });
            }

        } catch (error: any) {
            console.error("Erreur lors de l'inscription:", error);

            // Symfony - violations structurées
            if (error.response?.data?.violations) {
                const newErrors: Record<string, string> = {};
                const messages: string[] = [];

                for (const violation of error.response.data.violations) {
                    newErrors[violation.propertyPath] = violation.message;
                    messages.push(`${violation.message}`);
                }

                setErrors(newErrors);

                // 🔔 Affichage popup explicite avec les messages
                toastRef.current?.show({
                    severity: 'error',
                    summary: 'Erreur de validation',
                    detail: (
                        <ul className="pl-3 m-0">
                            {messages.map((msg, idx) => (
                                <li key={idx}>{msg}</li>
                            ))}
                        </ul>
                    ),
                    life: 6000
                });

            } else if (error.response?.data?.message) {
                // ⚠️ Erreur générique du backend
                toastRef.current?.show({
                    severity: 'error',
                    summary: 'Erreur serveur',
                    detail: error.response.data.message,
                    life: 5000
                });
            } else {
                // ❌ Erreur inconnue
                toastRef.current?.show({
                    severity: 'error',
                    summary: 'Erreur inconnue',
                    detail: 'Une erreur est survenue. Veuillez réessayer plus tard.',
                    life: 5000
                });
            }
        }
    };

    const renderInput = (label: string, value: string, setter: (val: string) => void, fieldName: string, type: string = "text") => (
        <div className="flex flex-column align-items-center">
            <FloatLabel>
                <label htmlFor={fieldName}>{label}</label>
                <InputText id={fieldName} type={type} value={value} onChange={(e) => setter(e.target.value)} invalid={!!errors[fieldName]} />
            </FloatLabel>
            <small className="p-error">{errors[fieldName]}</small>
        </div>
    );

    return (
        <>
            <Toast ref={toastRef} />
            <ScrollPanel style={{ width: '100%', height: '70vh' }} className='formScrollbar'>
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="flex flex-column gap-4">
                    <Divider align="left"><b>Champs obligatoires</b></Divider>
                    {renderInput("Nom", nom, setNom, "nom")}
                    {renderInput("Prénom", prenom, setPrenom, "prenom")}
                    {renderInput("Email", email, setEmail, "email", "email")}
                    
                    <div className="flex flex-column align-items-center">
                        <FloatLabel>
                            <label htmlFor="genre">Genre</label>
                            <Dropdown
                                id="genre"
                                value={genre}
                                options={Object.entries(Genre).map(([_, value]) => ({
                                    label: GenreLabels[value],
                                    value
                                }))}
                                onChange={(e) => setGenre(e.value)}
                                placeholder="Sélectionner un genre"
                                optionLabel="label"
                                optionValue="value"
                            />
                        </FloatLabel>
                        <small className="p-error">{errors.genre}</small>
                    </div>

                    {renderInput("Mot de passe", password, setPassword, "password", "password")}
                    <div className="flex flex-column align-items-start text-center px-3 mb-3" style={{ margin: '0 auto', width: 'fit-content' }}>
                        <small className={password.length >= 12 ? 'text-green-600' : 'text-orange-600'}>
                            <span>{password.length >= 12 ? '✅' : '❌'}</span> Minimum 12 caractères 
                        </small>
                        <small className={/[A-Z]/.test(password) ? 'text-green-600' : 'text-orange-600'}>
                            <span>{/[A-Z]/.test(password) ? '✅' : '❌'}</span> Une majuscule
                        </small>
                        <small className={/[a-z]/.test(password) ? 'text-green-600' : 'text-orange-600'}>
                            <span>{/[a-z]/.test(password) ? '✅' : '❌'}</span> Une minuscule
                        </small>
                        <small className={/\d/.test(password) ? 'text-green-600' : 'text-orange-600'}>
                            <span>{/\d/.test(password) ? '✅' : '❌'}</span> Un chiffre
                        </small>
                        <small className={/[\W_]/.test(password) ? 'text-green-600' : 'text-orange-600'}>
                            <span>{/[\W_]/.test(password) ? '✅' : '❌'}</span> Un caractère spécial
                        </small>
                    </div>

                    <div className="flex flex-column align-items-center">
                        <FloatLabel>
                            <label htmlFor="confirmPassword">Confirmez le mot de passe</label>
                            <InputText
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                invalid={!!errors.confirmPassword}
                                style={{
                                    border: confirmPassword
                                        ? confirmPassword === password
                                            ? '1px solid green'
                                            : '1px solid red'
                                        : undefined
                                }}
                            />
                        </FloatLabel>
                        <small className="p-error">{errors.confirmPassword}</small>
                    </div>

                    <Divider align="left"><b>Champs non obligatoires</b></Divider>
                    {renderInput("Téléphone", telephone, setTelephone, "telephone")}

                    <label htmlFor="dateNaissance">Date de naissance</label>
                    <Calendar id="dateNaissance" value={dateNaissance} onChange={(e) => setDateNaissance(e.value as Date)} dateFormat="dd/mm/yy" showIcon />

                    <label htmlFor="dateExamen">Date d'examen prévue</label>
                    <Calendar id="dateExamen" value={dateExamen} onChange={(e) => setDateExamen(e.value as Date)} dateFormat="dd/mm/yy" showIcon />

                    <label htmlFor="biographie">Biographie</label>
                    <InputTextarea id="biographie" value={biographie} onChange={(e) => setBiographie(e.target.value)} />
                </form>
            </ScrollPanel>
        </>
    );
});

export default StudentForm;
