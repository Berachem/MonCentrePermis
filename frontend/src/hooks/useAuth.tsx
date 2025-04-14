import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { jwtDecode } from "jwt-decode";
import { UserType } from "../enum/user";

// Définir le type pour le token décodé
type DecodedToken = {
  username: string;
  nom: string;
  prenom: string;
  exp: number;
  roles: string[];
  userId: string;
};

type AuthContextType = {
  userRole: string;
  userId: string;
  isAuthenticated: boolean;
  username: string;
  nom: string;
  prenom: string;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [userRole, setUserRole] = useState<UserType>(UserType.Visitor);
  const [userId, setUserId] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [nom, setNom] = useState<string>("");
  const [prenom, setPrenom] = useState<string>("");

  const decodeToken = (token: string): DecodedToken | null => {
    try {
      return jwtDecode<DecodedToken>(token);
    } catch (error) {
      console.error("Erreur lors du décodage du token", error);
      return null;
    }
  };

  const login = useCallback((token: string) => {
    localStorage.setItem("jwtToken", token);
    const decoded = decodeToken(token);
    if (decoded) {
      const userRole =
        decoded.roles && decoded.roles.length > 0
          ? decoded.roles[0].split("_")[0].toLowerCase()
          : "visitor";
      setUserRole(userRole as UserType);
      setUserId(decoded.userId);
      setUsername(decoded.username);
      setNom(decoded.nom);
      setPrenom(decoded.prenom);
      setIsAuthenticated(true);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("jwtToken");
    setUserRole(UserType.Visitor);
    setUserId("");
    setUsername("");
    setNom("");
    setPrenom("");
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      const decoded = decodeToken(token); 
      if (decoded && decoded.exp * 1000 > Date.now()) {
        const userRole =
          decoded.roles && decoded.roles.length > 0
            ? decoded.roles[0].split("_")[1].toLowerCase()
            : "visitor";
        setUserRole(userRole as UserType);
        setUserId(decoded.userId);
        setUsername(decoded.username);
        setNom(decoded.nom);
        setPrenom(decoded.prenom);
        setIsAuthenticated(true);
      } else {
        logout();
      }
    } else {
      setUserRole(UserType.Visitor);
      setUserId("");
      setUsername("");
      setNom("");
      setPrenom("");
      setIsAuthenticated(false);
    }
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        userRole,
        userId,
        isAuthenticated,
        username,
        nom,
        prenom,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default useAuth;
