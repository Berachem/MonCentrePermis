import React from "react";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 items-center justify-center p-4">
      <div className="text-center max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg py-12 px-6">
        <div className="flex justify-center items-center w-24 h-24 rounded-full bg-green-100 dark:bg-green-900 mx-auto mb-6">
          <i className="pi pi-exclamation-circle text-green-600 dark:text-green-400 text-4xl"></i>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-green-600 dark:text-green-400 mb-4">Page non trouvée</h2>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            label="Retour à l'accueil" 
            icon="pi pi-home"
            className="text-white gap-2 p-2 rounded-lg bg-green-600 hover:bg-green-700 border-green-600"
            onClick={() => navigate('/')} 
          />
        </div>
      </div>
    </div>
  );
};

export default NotFound;
