import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode'; // Correction de l'import

// Définir le type pour le token décodé
type DecodedToken = {
  username: string;
  exp: number;
  roles: string[];
};

type AuthContextType = {
  userRole: string;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Composant AuthProvider pour gérer l'authentification
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [userRole, setUserRole] = useState<string>('visitor');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Fonction pour décoder le token et définir le rôle
  const decodeToken = (token: string): DecodedToken | null => {
    try {
      return jwtDecode<DecodedToken>(token);
    } catch (error) {
      console.error('Erreur lors du décodage du token', error);
      return null;
    }
  };

// Fonction pour connecter l'utilisateur
const login = useCallback((token: string) => {
  localStorage.setItem('jwtToken', token);
  const decoded = decodeToken(token);
  if (decoded) {
    // Utiliser le tableau "roles" pour définir le rôle
    const userRole = decoded.roles && decoded.roles.length > 0 ? decoded.roles[0].split('_')[0].toLowerCase() : 'visitor';
    setUserRole(userRole);
    setIsAuthenticated(true);
  }
}, []);

  // Fonction pour déconnecter l'utilisateur
  const logout = useCallback(() => {
    localStorage.removeItem('jwtToken');
    setUserRole('visitor');
    setIsAuthenticated(false);
  }, []);

  // Vérifier le token à chaque chargement de la page
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      const decoded = decodeToken(token);
      console.log("Token décodé :", decoded);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        const userRole = decoded.roles && decoded.roles.length > 0 ? decoded.roles[0].split('_')[1].toLowerCase() : 'visitor';
        setUserRole(userRole);
        setIsAuthenticated(true);
      } else {
        logout();
      }
    } else {
      setUserRole('visitor');
      setIsAuthenticated(false);
    }

    console.log("ROLE ACTUEL = ", userRole);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ userRole, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
