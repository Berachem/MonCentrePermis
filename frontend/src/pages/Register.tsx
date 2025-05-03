import React, { useState, useRef } from "react";
import { Toast } from "primereact/toast";
import { Stepper } from "primereact/stepper";
import { StepperPanel } from "primereact/stepperpanel";
import { Button } from "primereact/button";
import { Link } from "react-router-dom";

import StudentForm from "../components/Register/StudentForm";
import TeacherForm from "../components/Register/TeacherForm";
import SchoolForm from "../components/Register/SchoolForm";

import LogoApp from "../assets/images/branding/logo_moncentrepermis_green.png";
import Loader from "../components/utils/Loader";

function Register() {
  const toastRef = useRef<Toast>(null);
  const stepperRef = useRef<any>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const formRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formRef.current) {
      setLoading(true);
      try {
        await formRef.current.handleSubmit();
      } finally {
        // En cas d'erreur, le loader doit être désactivé
        setLoading(false);
      }
    }
  };

  const getTypeUserString = (type: string | null) => {
    switch (type) {
      case "student":
        return "(Elève)";
      case "teacher":
        return "(Moniteur)";
      case "school":
        return "(Auto-école)";
      default:
        return "";
    }
  };

  const renderUserForm = () => {
    switch (userType) {
      case "student":
        return <StudentForm ref={formRef} />;
      case "teacher":
        return <TeacherForm ref={formRef} />;
      case "school":
        return <SchoolForm ref={formRef} />;
      default:
        return null;
    }
  };

  return (
    <>
      <Toast ref={toastRef} />
      
      {loading && (
        <div className="fixed inset-0 bg-white/70 z-50 flex items-center justify-center">
          <Loader />
        </div>
      )}
      
      <Link to="/" className="fixed top-4 left-4 z-40">
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

      <div className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-2xl px-4">

            <Stepper ref={stepperRef} headerPosition="top">
              <StepperPanel
                header={"Qui êtes vous ? " + getTypeUserString(userType)}
              >
                <div className="flex flex-col gap-4 my-2">
                  <Button
                    label="Élève"
                    onClick={() => {
                      setUserType("student");
                      stepperRef.current.nextCallback();
                    }}
                    className={`${userType === "student" 
                      ? "bg-green-800 hover:bg-green-700 text-white" 
                      : "bg-white text-green-800 border-green-800 hover:bg-green-50"} 
                      rounded-lg py-2 px-4 border transition-colors w-full`}
                    icon="pi pi-user"
                  />
                  <Button
                    label="Moniteur"
                    onClick={() => {
                      setUserType("teacher");
                      stepperRef.current.nextCallback();
                    }}
                    className={`${userType === "teacher" 
                      ? "bg-green-800 hover:bg-green-700 text-white" 
                      : "bg-white text-green-800 border-green-800 hover:bg-green-50"} 
                      rounded-lg py-2 px-4 border transition-colors w-full`}
                    icon="pi pi-address-book"
                  />
                  <Button
                    label="Auto-école"
                    onClick={() => {
                      setUserType("school");
                      stepperRef.current.nextCallback();
                    }}
                    className={`${userType === "school" 
                      ? "bg-green-800 hover:bg-green-700 text-white" 
                      : "bg-white text-green-800 border-green-800 hover:bg-green-50"} 
                      rounded-lg py-2 px-4 border transition-colors w-full opacity-50 cursor-not-allowed`}
                    icon="pi pi-building"
                    disabled
                  />
                </div>
              </StepperPanel>
              <StepperPanel header="Vos informations">
                <div className="flex flex-col w-full h-[calc(100vh-270px)] overflow-hidden">
                  {renderUserForm()}
                </div>
                <div className="border-t border-gray-200 my-4"></div>

                <div className="flex justify-between w-full mt-4 sticky bottom-0 bg-white pt-2">
                  <Button
                    label="Retour"
                    icon="pi pi-arrow-left"
                    onClick={() => stepperRef.current.prevCallback()}
                    className="bg-white text-green-800 border border-green-800 hover:bg-green-50 rounded-lg py-1 px-3"
                    disabled={loading}
                  />

                  <Button
                    label="S'inscrire"
                    onClick={handleSubmit}
                    icon={loading ? "pi pi-spin pi-spinner" : "pi pi-check"}
                    className="bg-green-800 hover:bg-green-700 text-white border-none rounded-lg py-1 px-3"
                    disabled={loading}
                  />
                </div>
              </StepperPanel>
            </Stepper>

            
            <div className="border-b-1 border-zinc-600 pb-1 mb-1 mt-3">
                <span className="text-zinc-600">Déjà inscrit ?</span>
            </div>
          
            <div className="flex justify-center w-full">
              <Link to="/login" className="inline-block w-auto">
                <Button
                  label="Se connecter"
                  className="font-bold bg-white text-green-800 hover:bg-green-50 rounded-lg py-2 px-4 transition-colors border-0 gap-2"
                  icon="pi pi-sign-in"
                />
              </Link>
            </div>
          </div>
          
      </div>
    </>
  );
}

export default Register;
