import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import { Button } from "primereact/button";

const UserIndicator = () => {
  const { isAuthenticated, prenom } = useAuth();
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth > 768);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth > 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isLargeScreen) return null;

  if (
    window.location.href.includes("/login") ||
    window.location.href.includes("/register")
  )
    return null;

  return (
    <div style={{ position: "absolute", top: 50, right: 50, zIndex: 1000 }}>
      {isAuthenticated ? (
        <span
          style={{
            backgroundColor: "#6366F1",
            padding: "5px 10px",
            borderRadius: "25px",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
            border: "1px solid #FFFFFFFF",
            color: "white",
            fontSize: "1.3em",
          }}
        >
          👋 Bonjour,
          <span
            style={{ fontWeight: "bold", marginLeft: "5px", fontSize: "1em" }}
          >
            {prenom}
          </span>
        </span>
      ) : (
        <Button
          label="S'identifier"
          onClick={() => window.location.replace("/login")}
          icon="pi pi-user"
        />
      )}
    </div>
  );
};

export default UserIndicator;
