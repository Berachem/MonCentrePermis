import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { jwtDecode } from "jwt-decode";
// Pas besoin de js-cookie si cookie httpOnly
import { UserType } from "../enum/user";

// Définir le type pour le token décodé
type DecodedToken = {
  username: string;
  nom: string;
  typeUserid: string;
  prenom: string;
  exp: number;
  roles: string[];
  userId: string;
};

type AuthContextType = {
  userRole: string;
  typeUserid: string;
  userId: string;
  isAuthenticated: boolean;
  username: string;
  nom: string;
  prenom: string;
  login: () => void;
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
  const [typeUserid, setTypeUserid] = useState<string>("");
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

  const login = useCallback(async () => {
    try {
      // Appelle une route sécurisée qui utilise le cookie httpOnly envoyé par le backend
      const response = await fetch("http://localhost:8000/api/me", {
        method: "GET",
        credentials: "include", // Important pour envoyer le cookie httpOnly
      });

      if (!response.ok) throw new Error("Unauthorized");

      const { token } = await response.json(); // Ton backend doit renvoyer le token décodable
      localStorage.setItem("jwtToken", token);
      const decoded = decodeToken(token);

      if (decoded) {
        // Modification de l'extraction du rôle
        let userRole;

        if (decoded.roles && decoded.roles.length > 0) {
          const roleString = decoded.roles[0];
          // Vérifier si le rôle contient un underscore
          if (roleString.includes("_")) {
            userRole = roleString.split("_")[1]?.toLowerCase() || "visitor";
          } else {
            userRole = roleString.toLowerCase();
          }
        } else {
          userRole = "visitor";
        }

        console.log("Connexion réussie, rôle utilisateur :", userRole);
        setUserRole(userRole as UserType);
        setUserId(decoded.userId);
        setUsername(decoded.username);
        setTypeUserid(decoded.typeUserid);
        setNom(decoded.nom);
        setPrenom(decoded.prenom);
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error("Erreur lors du login", err);
      logout();
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("http://localhost:8000/api/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.warn("Erreur lors du logout (côté backend)", err);
    }

    setUserRole(UserType.Visitor);
    setUserId("");
    setTypeUserid("");
    setUsername("");
    setNom("");
    setPrenom("");
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    login();
  }, [login]);

  return (
    <AuthContext.Provider
      value={{
        userRole,
        userId,
        typeUserid,
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
