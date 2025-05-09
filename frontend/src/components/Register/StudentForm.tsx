import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Toast } from 'primereact/toast';
import { ScrollPanel } from "primereact/scrollpanel";
import { InputTextarea } from "primereact/inputtextarea";
import { postRequest } from "../../interfaces/api";
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

const StudentForm = forwardRef((_, ref) => {
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
        if (!validateFields()) return Promise.reject("Validation failed");

        const formData = {
            nom, prenom, email, password,
            telephone, genre,
            dateNaissance, dateExamen,
            biographie,
            role: "eleve",
        };

        try {
            const response: ApiResponse = await postRequest('/compte/create-compte', formData);
            if (response.token) {
                localStorage.setItem('jwtToken', response.token);
                toastRef.current?.show({ severity: 'success', summary: 'Inscription réussie!', detail: 'Bienvenue!', life: 3000 });
                window.location.href = '/';
                return Promise.resolve();
            } else {
                toastRef.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Inscription possible mais réponse inattendue.', life: 3000 });
                return Promise.reject("Unexpected response");
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
            return Promise.reject(error);
        }
    };

    const renderInput = (label: string, value: string, setter: (val: string) => void, fieldName: string, type: string = "text") => (
        <div className="flex flex-col w-full mb-2">
            <label htmlFor={fieldName} className="text-green-800 font-medium mb-1">{label}</label>
            <InputText 
                id={fieldName} 
                type={type} 
                value={value} 
                onChange={(e) => setter(e.target.value)} 
                className={`w-full border rounded-lg p-2 ${errors[fieldName] ? 'border-red-500' : 'border-gray-300'} focus:border-green-800 focus:ring focus:ring-green-200 focus:ring-opacity-50`}
            />
            {errors[fieldName] && <small className="text-red-500 mt-1">{errors[fieldName]}</small>}
        </div>
    );

    return (
        <>
            <Toast ref={toastRef} />
            <ScrollPanel className="w-full h-full formScrollbar">
                <div className="pr-3 pb-4">
                    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="flex flex-col gap-4 w-full">
                        <div className="border-b-2 border-green-800 pb-2 mb-4">
                            <span className="font-bold text-lg text-green-800">Champs obligatoires</span>
                        </div>
                        
                        {renderInput("Nom", nom, setNom, "nom")}
                        {renderInput("Prénom", prenom, setPrenom, "prenom")}
                        {renderInput("Email", email, setEmail, "email", "email")}
                        
                        <div className="flex flex-col w-full mb-2">
                            <label htmlFor="genre" className="text-green-800 font-medium mb-1">Genre</label>
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
                                className={`w-full h-10 p-2 rounded-lg ${errors.genre ? 'border-red-500' : 'border-gray-300'}`}
                                style={{ border: errors.genre ? '1px solid #ef4444' : '1px solid #d1d5db' }}
                            />
                            {errors.genre && <small className="text-red-500 mt-1">{errors.genre}</small>}
                        </div>

                        {renderInput("Mot de passe", password, setPassword, "password", "password")}
                        <div className="flex flex-col items-start text-center mx-auto mb-3 bg-gray-50 p-3 rounded-lg">
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

                        <div className="flex flex-col w-full mb-2">
                            <label htmlFor="confirmPassword" className="text-green-800 font-medium mb-1">Confirmez le mot de passe</label>
                            <InputText
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`w-full border rounded-lg p-2 ${
                                    errors.confirmPassword 
                                        ? 'border-red-500' 
                                        : confirmPassword 
                                            ? confirmPassword === password 
                                                ? 'border-green-500' 
                                                : 'border-red-500'
                                            : 'border-gray-300'
                                } focus:border-green-800 focus:ring focus:ring-green-200 focus:ring-opacity-50`}
                            />
                            {errors.confirmPassword && <small className="text-red-500 mt-1">{errors.confirmPassword}</small>}
                        </div>

                        <div className="border-b-2 border-green-800 pb-2 mb-4 mt-8">
                            <span className="font-bold text-lg text-green-800">Champs non obligatoires</span>
                        </div>
                        
                        {renderInput("Téléphone", telephone, setTelephone, "telephone")}

                        <div className="flex flex-col w-full mb-2">
                            <label htmlFor="dateNaissance" className="text-green-800 font-medium mb-1">Date de naissance</label>
                            <Calendar 
                                id="dateNaissance" 
                                value={dateNaissance} 
                                onChange={(e) => setDateNaissance(e.value as Date)} 
                                dateFormat="dd/mm/yy" 
                                className="w-full"
                                inputClassName="w-full border border-gray-300 rounded-lg p-2 focus:border-green-800 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                            />
                        </div>

                        <div className="flex flex-col w-full mb-2">
                            <label htmlFor="dateExamen" className="text-green-800 font-medium mb-1">Date d'examen prévue</label>
                            <Calendar 
                                id="dateExamen" 
                                value={dateExamen} 
                                onChange={(e) => setDateExamen(e.value as Date)} 
                                dateFormat="dd/mm/yy" 
                                className="w-full"
                                inputClassName="w-full border border-gray-300 rounded-lg p-2 focus:border-green-800 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                            />
                        </div>

                        <div className="flex flex-col w-full mb-2">
                            <label htmlFor="biographie" className="text-green-800 font-medium mb-1">Biographie</label>
                            <InputTextarea 
                                id="biographie" 
                                value={biographie} 
                                onChange={(e) => setBiographie(e.target.value)} 
                                className="w-full rounded-lg p-2 border border-gray-300 focus:border-green-800 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                                rows={4}
                            />
                        </div>
                    </form>
                </div>
            </ScrollPanel>
        </>
    );
});

export default StudentForm;
