import "../assets/css/Login.css";
import React, { useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import { FloatLabel } from "primereact/floatlabel";
import { Link, useNavigate } from "react-router-dom";
import logoApp from "../assets/images/branding/logo_moncentrepermis.png";
import loginStory from "../assets/images/stories/login-storie.svg";
import SideBarCustom from "../components/utils/SideBarCustom";
import { ApiResponse } from "../interfaces/interfaces";
import { postRequest } from "../interfaces/utils/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const toastRef = React.createRef<Toast>();

  const navigate = useNavigate();

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

    if (!hasError) {
      const formData = {'username':email, password}

      // console.log(formData)
      try {
        const response: ApiResponse = await postRequest('login', formData);

        if (response && response.token) {
            localStorage.setItem('jwtToken', response.token);
            toastRef.current?.show({
              severity: "success",
              summary: "Connexion réussie!",
              detail: "Bienvenue!",
              life: 3000,
            });
            window.location.assign('/');
            // navigate('/');
        } else {
          throw new Error('Identifiants incorrects');
        }
        
      } catch (error) {
        toastRef.current?.show({
          severity: "error",
          summary: "Erreur de connexion",
          detail: "Vérifiez vos identifiants.",
          life: 3000,
        });
      }
    }
  };

  return (
    <>
      <Toast ref={toastRef} />

      <div className="flex align-items-center justify-content-center col-12 mt-4">
        <SideBarCustom  />
        <img src={logoApp} alt="logo" className="mx-auto md:w-2 w-13rem" />
      </div>

      <div className="align-items-center justify-content-center flex md:flex-row flex-column ">
        <div className="flex justify-content-center col-16 md:col-6">
          <Card className="p-4">
            <form onSubmit={handleLogin} className="flex flex-column gap-4">
              <div>
                <FloatLabel>
                  <label htmlFor="email">Email</label>
                  <InputText
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="inputtext-sm d-block"
                  />
                </FloatLabel>
                <small className="p-error">{emailError}</small>
              </div>

              <div>
                <FloatLabel>
                  <label htmlFor="password">Mot de passe</label>
                  <InputText
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="inputtext-sm d-block"
                  />
                </FloatLabel>
                <small className="p-error">{passwordError}</small>
              </div>

              <Button
                label="Se connecter"
                type="submit"
                icon="pi pi-sign-in"
                className="mt-2"
              />
              <Link to="/register" style={{ textAlign: "center" }}>
                <Button
                  label="S'inscrire"
                  className="button-text p-button-text"
                />
              </Link>
            </form>
          </Card>
        </div>

        <div className="flex justify-content-center col-12 md:col-6">
          <img
            src={loginStory}
            alt="Illustration de connexion"
            className="mx-auto w-10 animated"
          />
        </div>
      </div>
    </>
  );
}

export default Login;
