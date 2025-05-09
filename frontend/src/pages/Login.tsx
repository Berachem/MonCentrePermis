import React, { useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import { Link } from "react-router-dom";
import loginStory from "../assets/images/stories/login-storie-green.svg";
import { ApiResponse } from "../interfaces/interfaces";
import { postRequest } from "../interfaces/api";
import LogoApp from "../assets/images/branding/logo_moncentrepermis_green.png";
import Loader from "../components/utils/Loader";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toastRef = React.createRef<Toast>();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    if (!email) {
      setEmailError("L'email est requis.");
      hasError = true;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("Le mot de passe est requis.");
      hasError = true;
    } else {
      setPasswordError("");
    }

    setLoginError("");

    if (!hasError) {
      setIsLoading(true);
      const formData = { username: email, password };

      try {
        const response: ApiResponse = await postRequest("login", formData);

        // Vérification de la réponse
        if (response === "") {
          toastRef.current?.show({
            severity: "success",
            summary: "Connexion réussie!",
            detail: "Bienvenue!",
            life: 3000,
          });
          window.location.assign("/");
        } else {
          // Erreurs d'authentification gérées ici
          setLoginError("Identifiants incorrects");
          toastRef.current?.show({
            severity: "error",
            summary: "Erreur de connexion",
            detail: "Vérifiez vos identifiants.",
            life: 3000,
          });
        }
      } catch (error: any) {
        // Gestion plus précise des erreurs
        console.error("Erreur lors de la connexion:", error);
        
        if (error.statusCode === 401) {
          setLoginError("Identifiants incorrects");
        } else {
          setLoginError("Problème de connexion au serveur");
        }
        
        toastRef.current?.show({
          severity: "error",
          summary: "Erreur de connexion",
          detail: error.message || "Vérifiez vos identifiants.",
          life: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Toast ref={toastRef} />

      <Link to="/" className="fixed top-4 left-4 z-50">
        <div className="flex items-center justify-center w-14 h-11 rounded-full bg-green-800 hover:bg-green-700 shadow-lg transition-colors">
          <i className="pi pi-home text-white text-xl"></i>
        </div>
      </Link>

      <div className="flex justify-center mb-4 mt-4">
        <Link to="/">
          <img 
            src={LogoApp} 
            alt="Mon Centre Permis" 
            className="h-8 w-auto object-contain cursor-pointer"
          />
        </Link>
      </div>

      <div className="flex-grow flex items-center justify-center md:justify-start relative" 
           style={{ 
             backgroundImage: `url(${loginStory})`, 
             backgroundPosition: '65% center',
             backgroundRepeat: 'no-repeat',
             backgroundSize: 'contain'
           }}>
       
        <div className="relative z-10 px-4 md:ml-32">
          <Card className="p-6 shadow-xl/30 min-h-[400px] w-[350px] relative">
            {isLoading && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-50 rounded-lg">
                <Loader />
              </div>
            )}
            <form onSubmit={handleLogin} className="flex flex-col gap-4 h-full">
              <div className="relative">
                <label htmlFor="email" className="text-green-800 font-medium text-lg block">Email</label>
                <InputText
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full ${loginError ? 'p-invalid' : ''} rounded-lg py-2 px-4 border border-gray-300 focus:border-green-800 focus:ring focus:ring-green-200 focus:ring-opacity-50`}
                />
                <div className="h-4">
                  {emailError && <small className="text-red-500 block text-xs">{emailError}</small>}
                </div>
              </div>

              <div className="relative">
                <label htmlFor="password" className="text-green-800 font-medium text-lg block">Mot de passe</label>
                <InputText
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full ${loginError ? 'p-invalid' : ''} rounded-lg py-2 px-4 border border-gray-300 focus:border-green-800 focus:ring focus:ring-green-200 focus:ring-opacity-50`}
                />
                <div className="h-4">
                  {passwordError && <small className="text-red-500 block text-xs">{passwordError}</small>}
                </div>
              </div>

              <div className="h-4 text-center">
                {loginError && <small className="text-red-500 text-xs">{loginError}</small>}
              </div>

              <div className="mt-auto">
                <Button
                  label="Se connecter"
                  type="submit"
                  icon="pi pi-sign-in"
                  className="bg-green-800 hover:bg-green-700 text-white border-none rounded-lg py-2 px-4 w-full"
                />
                <Link to="/register" className="text-center mt-2 block">
                  <Button
                    label="S'inscrire"
                    className="p-button-text text-green-800"
                  />
                </Link>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Login;
