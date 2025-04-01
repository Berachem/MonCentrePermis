import React, { useState, useRef } from "react";
import { Toast } from "primereact/toast";
import { Stepper } from "primereact/stepper";
import { StepperPanel } from "primereact/stepperpanel";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";

import StudentForm from "../components/RegisterForms/StudentForm";
import TeacherForm from "../components/RegisterForms/TeacherForm";
import SchoolForm from "../components/RegisterForms/SchoolForm";

import logoApp from "../assets/images/branding/logo_moncentrepermis.png";
import SideBarCustom from "../components/utils/SideBarCustom";

function Register() {
  const toastRef = useRef<Toast>(null);
  const stepperRef = useRef<any>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const formRef = useRef<any>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formRef.current) {
      formRef.current.handleSubmit();
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    //traitements d'info backend...
  };

  return (
    <>
      <Toast ref={toastRef} />
      <div className=" ">
        <div className="flex align-items-center justify-content-center col-12">
          <SideBarCustom />
          <img src={logoApp} alt="logo" className="mx-auto md:w-2 w-13rem" />
        </div>

        <div className="lg:w-8 mx-auto">
          <Stepper ref={stepperRef}>
            <StepperPanel
              header={"Qui êtes vous ? " + getTypeUserString(userType)}
            >
              <div className="flex flex-column h-12rem gap-2">
                <Button
                  label="Élève"
                  onClick={() => {
                    setUserType("student");
                    stepperRef.current.nextCallback();
                  }}
                  className={userType === "student" ? "p-button-primary" : ""}
                  outlined={userType !== "student"}
                  icon="pi pi-user"
                />
                <Button
                  label="Moniteur"
                  onClick={() => {
                    setUserType("teacher");
                    stepperRef.current.nextCallback();
                  }}
                  className={userType === "teacher" ? "p-button-primary" : ""}
                  outlined={userType !== "teacher"}
                  icon="pi pi-address-book"
                />
                <Button
                  label="Auto-école"
                  onClick={() => {
                    setUserType("school");
                    stepperRef.current.nextCallback();
                  }}
                  className={userType === "school" ? "p-button-primary" : ""}
                  outlined={userType !== "school"}
                  icon="pi pi-building"
                  disabled
                />
              </div>
            </StepperPanel>
            <StepperPanel header="Vos informations">
              <div className="flex flex-column align-items-center">
                {renderUserForm()}
              </div>
              <Divider />

              <div className="flex justify-content-between w-full mt-3">
                <Button
                  label="Retour"
                  severity="secondary"
                  icon="pi pi-arrow-left"
                  onClick={() => stepperRef.current.prevCallback()}
                  className="p-button-text"
                />

                <Button
                  label="S'inscrire"
                  onClick={handleSubmit}
                  icon="pi pi-check"
                />
              </div>
            </StepperPanel>
          </Stepper>
        </div>
      </div>
    </>
  );
}

export default Register;
