import React, { createContext, useContext, useState, ReactNode } from "react";

// Define all possible modal types in your application
export type ModalType = 
  | "profile" 
  | "classes" 
  | "courses" 
  // Add more modal types as your application grows
  ;

// Define the structure of modal parameters for each modal type
export interface ModalParams {
  profile?: {
    idRequested?: string;
  };
  classes?: {
    userId?: string;
    readOnly?: boolean;
  };
  courses?: {
    courseId?: string | null;
  };
  // Add more modal parameters here as needed
}

// Define the context shape
interface ModalContextType {
  activeModals: Record<ModalType, boolean>;
  modalParams: ModalParams;
  openModal: (type: ModalType, params?: any) => void;
  closeModal: (type: ModalType) => void;
  closeAllModals: () => void;
}

// Create the context
const ModalContext = createContext<ModalContextType | undefined>(undefined);

// Create the provider component
export const ModalProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  // State to track which modals are active
  const [activeModals, setActiveModals] = useState<Record<ModalType, boolean>>({
    profile: false,
    classes: false,
    courses: false,
    // Initialize any other modals here
  });

  // State to store parameters for each modal
  const [modalParams, setModalParams] = useState<ModalParams>({});

  // Function to open a specific modal with optional parameters
  const openModal = (type: ModalType, params?: any) => {
    setActiveModals(prev => ({ ...prev, [type]: true }));
    if (params) {
      setModalParams(prev => ({ 
        ...prev, 
        [type]: { ...prev[type as keyof ModalParams], ...params } 
      }));
    }
  };

  // Function to close a specific modal
  const closeModal = (type: ModalType) => {
    setActiveModals(prev => ({ ...prev, [type]: false }));
  };

  // Function to close all modals
  const closeAllModals = () => {
    const allClosed = Object.keys(activeModals).reduce((acc, key) => {
      acc[key as ModalType] = false;
      return acc;
    }, {} as Record<ModalType, boolean>);
    setActiveModals(allClosed);
  };

  // The context value
  const contextValue: ModalContextType = {
    activeModals,
    modalParams,
    openModal,
    closeModal,
    closeAllModals
  };

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
    </ModalContext.Provider>
  );
};

// Create a custom hook to use the modal context
export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};