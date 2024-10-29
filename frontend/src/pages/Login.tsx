import "../assets/css/Login.css"

import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Card } from "primereact/card";
import { FloatLabel } from "primereact/floatlabel";
import { Link } from "react-router-dom";


function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const toastRef = React.useRef<Toast>(null);
  
    const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();

      let hasError = false;

      // Validation des champs
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

      if (!hasError) { 
        //Simulation d'une connexion réussis, à voir avec le backend plus tard
        if (email === 'test@example.com' && password === 'password') {
            toastRef.current?.show({ severity: 'success', summary: 'Connexion réussie!', detail: 'Bienvenue!', life: 3000 });
        } else {
            toastRef.current?.show({ severity: 'error', summary: 'Erreur de connexion', detail: 'Vérifiez vos identifiants.', life: 3000 });
        }
      }
    };
  
    return (
      <>
        <Toast ref={toastRef} />

        <div className="login-container">
            <Card title="Connexion" >
                <form onSubmit={handleLogin} className="flex flex-column gap-4">
                    
                    <div>
                        <FloatLabel>
                            <label htmlFor="email">Email</label>
                            <InputText id="email" type="email" aria-describedby="email-help"  value={email} onChange={(e) => setEmail(e.target.value)} invalid={emailError!=''}/>
                        </FloatLabel>
                        <small id="email-help" className="p-error">{emailError}</small>
                    </div>

                    <div>
                        <FloatLabel>
                            <label htmlFor="password">Mot de passe</label>
                            <InputText id="password" type="password" aria-describedby="password-help" value={password} onChange={(e) => setPassword(e.target.value)} invalid={passwordError!=''}/>
                        </FloatLabel>
                        <small id="password-help" className="p-error">{passwordError}</small>
                    </div>

                    <Button label="Se connecter" type="submit" icon=" pi pi-sign-in"/>
                    <Link to="/register" style={{textAlign:"center"}}>S'inscrire</Link>
                </form>
            </Card>
        </div>
       </>
    );
  };
  
  export default Login;