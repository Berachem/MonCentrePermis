import { useEffect, useState, useRef } from "react";
import useAuth from "../hooks/useAuth";
import { Button } from "primereact/button";

const UserIndicator = () => {
  const { isAuthenticated, prenom, userRole, logout } = useAuth();
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth > 768);
  const [showLogoutButton, setShowLogoutButton] = useState(false);
  const userIndicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth > 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userIndicatorRef.current &&
        !userIndicatorRef.current.contains(event.target as Node) &&
        showLogoutButton
      ) {
        setShowLogoutButton(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLogoutButton]);

  const toggleLogoutButton = () => {
    setShowLogoutButton(!showLogoutButton);
  };

  if (!isLargeScreen) return null;

  if (
    window.location.href.includes("/login") ||
    window.location.href.includes("/register")
  )
    return null;

  return (
    <div
      style={{ position: "absolute", top: 50, right: 50, zIndex: 1000 }}
      ref={userIndicatorRef}
    >
      {isAuthenticated ? (
        <div style={{ position: "relative" }}>
          <span
            style={{
              backgroundColor: showLogoutButton ? "#4F52C0" : "#6366F1",
              padding: "5px 10px",
              borderRadius: "25px",
              boxShadow: showLogoutButton
                ? "0 2px 8px rgba(0, 0, 0, 0.2) inset"
                : "0 2px 5px rgba(0, 0, 0, 0.1)",
              border: "1px solid #FFFFFFFF",
              color: "white",
              fontSize: "1.3em",
              cursor: "pointer",
              transition: "all 0.2s ease-in-out",
              transform: showLogoutButton ? "scale(0.97)" : "scale(1)",
            }}
            onClick={toggleLogoutButton}
          >
            {userRole === "eleve" ? (
              <img
                src="https://amelesarcades.bleep.fr/wp-content/uploads/2017/06/permisb.png"
                alt="eleve"
                style={{
                  width: "25px",
                  height: "25px",
                  borderRadius: "50%",
                  marginBottom: "5px",
                  verticalAlign: "middle",
                  display: "inline-block",
                }}
              />
            ) : (
              "🕵️"
            )}
            <span
              style={{ fontWeight: "bold", marginLeft: "5px", fontSize: "1em" }}
            >
              {prenom}
            </span>
          </span>

          {showLogoutButton && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: "5px",
                zIndex: 1001,
              }}
            >
              <Button
                label="Déconnexion"
                icon="pi pi-sign-out"
                className="p-button-danger p-button-sm"
                onClick={logout}
                style={{ fontSize: "0.8rem", padding: "0.3rem 0.6rem" }}
              />
            </div>
          )}
        </div>
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
