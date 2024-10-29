import React, { useState, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { Stepper } from 'primereact/stepper';
import { StepperPanel } from 'primereact/stepperpanel';
import { Button } from "primereact/button";
import { ButtonGroup } from "primereact/buttongroup";
import { Divider } from "primereact/divider";

import StudentForm from "../components/RegisterForms/StudentForm"
import TeacherForm from '../components/RegisterForms/TeacherForm';
import SchoolForm from '../components/RegisterForms/SchoolForm';


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

    const renderUserForm = () => {
        switch (userType) {
            case 'student':
                return <StudentForm ref={formRef}/>;
            case 'teacher':
                return <TeacherForm ref={formRef}/>;
            case 'school':
                return <SchoolForm ref={formRef}/>;
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
        
        <Toast ref={toastRef}/>

            <Stepper ref={stepperRef}>
                <StepperPanel header="Qui êtes vous ? ">
                    <div className="flex flex-column h-12rem gap-2">
                        <Button label="Élève" onClick={() => {setUserType('student'); stepperRef.current.nextCallback();}} className={userType === 'student' ? 'p-button-primary' : ''} outlined={userType !== 'student'} />
                        <Button label="Moniteur" onClick={() => {setUserType('teacher'); stepperRef.current.nextCallback();}} className={userType === 'teacher' ? 'p-button-primary' : ''} outlined={userType !== 'teacher'}/>
                        <Button label="Auto-école" onClick={() => {setUserType('school'); stepperRef.current.nextCallback();}} className={userType === 'school' ? 'p-button-primary' : ''} outlined={userType !== 'school'}/>
                    </div>
                </StepperPanel>
                <StepperPanel header="Vos informations">
                    <div className="flex flex-column align-items-center">
                        {renderUserForm()}
                    </div>
                    <Divider/>
                    <ButtonGroup>
                        <Button label="Retour" severity="secondary" icon="pi pi-arrow-left" onClick={() => stepperRef.current.prevCallback()} />
                        <Button label="S'inscrire" onClick={handleSubmit} />
                    </ButtonGroup>
                </StepperPanel>
            </Stepper>
       
       </>
    );
  };
  
  export default Register;