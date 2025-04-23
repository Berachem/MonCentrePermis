import React, { useEffect, useState } from "react";
import { Divider } from "primereact/divider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faIdCard,
  faGraduationCap,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Toast } from "primereact/toast";
import { Accordion, AccordionTab } from "primereact/accordion";
import useAuth from "../../hooks/useAuth";
import { getRequest, postRequest } from "../../interfaces/utils/api";

interface studentInformations {
  nom: string;
  prenom: string;
  genre: string;
  dateNaissance: Date;
  email: string;
  telephone: string;
  dateExamen: Date;
  autoEcole: string;
}

interface StudentInformationsProps {
  userId?: string; // ID de l'utilisateur à afficher, si undefined = utilisateur connecté
  readOnly?: boolean; // Mode lecture seule
}

const StudentInformations: React.FC<StudentInformationsProps> = ({
  userId,
  readOnly = false,
}) => {
  const { logout, userId: currentUserId } = useAuth();
  const [studentInfo, setStudentInfo] = useState<studentInformations | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState<studentInformations | null>(
    null
  );
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  // États pour gérer les erreurs de validation
  const [nomError, setNomError] = useState("");
  const [prenomError, setPrenomError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [telephoneError, setTelephoneError] = useState("");
  const [dateExamenError, setDateExamenError] = useState("");
  const toastRef = React.useRef<Toast>(null);

  // Détermine si on affiche son propre profil ou celui d'un autre utilisateur
  const isOwnProfile = !userId || userId === currentUserId;

  const fetchStudentInfo = async (id?: string) => {
    try {
      const response = await getRequest<studentInformations>(
        `/eleves/${id}/info`
      );
      return response;
    } catch (error) {
      console.error("Erreur lors de la récupération des informations:", error);
      return null;
    }
  };

  const saveStudentInfo = async (updatedInfo: studentInformations) => {
    try {
      const response = await postRequest<
        studentInformations,
        studentInformations
      >(`/eleves/UpdateInfo`, updatedInfo);

      console.log("Réponse de l'API:", response);
      return response;
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des informations:", error);
      throw error;
    }
  };

  useEffect(() => {
    const getStudentInfo = async () => {
      try {
        const data = await fetchStudentInfo(userId);
        if (data) {
          setStudentInfo(data);
          setEditedInfo(data);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des informations:", error);
      }
    };
    getStudentInfo();
  }, [userId, currentUserId]);

  const handleEditClick = () => {
    // Réinitialiser les erreurs lors de l'entrée en mode édition
    setNomError("");
    setPrenomError("");
    setEmailError("");
    setTelephoneError("");
    setDateExamenError("");
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    if (editedInfo) {
      // Vérification des champs obligatoires et validation
      let hasError = false;

      if (!editedInfo.nom || editedInfo.nom.trim() === "") {
        setNomError("Le nom est requis.");
        hasError = true;
      } else {
        setNomError("");
      }

      if (!editedInfo.prenom || editedInfo.prenom.trim() === "") {
        setPrenomError("Le prénom est requis.");
        hasError = true;
      } else {
        setPrenomError("");
      }

      if (!editedInfo.email || editedInfo.email.trim() === "") {
        setEmailError("L'email est requis.");
        hasError = true;
      } else {
        // Validation simple du format de l'email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(editedInfo.email)) {
          setEmailError("Format d'email invalide.");
          hasError = true;
        } else {
          setEmailError("");
        }
      }

      // Validation optionnelle du numéro de téléphone si fourni
      if (
        editedInfo.telephone &&
        editedInfo.telephone.trim() !== "" &&
        !/^(\+\d{1,3}\s?)?\d{10}$/.test(editedInfo.telephone.replace(/\s/g, ""))
      ) {
        setTelephoneError("Format de téléphone invalide.");
        hasError = true;
      } else {
        setTelephoneError("");
      }

      // Vérification de la date d'examen par rapport à la date de naissance
      if (editedInfo.dateNaissance && editedInfo.dateExamen) {
        if (editedInfo.dateExamen < editedInfo.dateNaissance) {
          setDateExamenError(
            "La date d'examen ne peut pas être antérieure à la date de naissance."
          );
          hasError = true;
        } else {
          setDateExamenError("");
        }
      }

      if (!hasError) {
        const infoToSave = { ...editedInfo };

        // Pour les champs non-obligatoires, conserver les valeurs existantes
        if (studentInfo) {
          if (!infoToSave.genre || infoToSave.genre.trim() === "")
            infoToSave.genre = studentInfo.genre;

          if (!infoToSave.telephone || infoToSave.telephone.trim() === "")
            infoToSave.telephone = studentInfo.telephone;

          if (!infoToSave.autoEcole || infoToSave.autoEcole.trim() === "")
            infoToSave.autoEcole = studentInfo.autoEcole;

          if (!infoToSave.dateExamen)
            infoToSave.dateExamen = studentInfo.dateExamen;
        }

        try {
          await saveStudentInfo(infoToSave);
          setStudentInfo(infoToSave);
          setIsEditing(false);
          toastRef.current?.show({
            severity: "success",
            summary: "Modifications enregistrées",
            detail: "Vos informations ont été mises à jour avec succès.",
            life: 3000,
          });
        } catch (error) {
          console.error(
            "Erreur lors de la mise à jour des informations:",
            error
          );
          toastRef.current?.show({
            severity: "error",
            summary: "Erreur",
            detail:
              "Une erreur est survenue lors de la mise à jour de vos informations.",
            life: 3000,
          });
        }
      } else {
        // Afficher un message d'erreur général
        toastRef.current?.show({
          severity: "error",
          summary: "Validation échouée",
          detail: "Veuillez corriger les erreurs dans le formulaire.",
          life: 3000,
        });
      }
    }
  };

  const handleInputChange = (
    field: keyof studentInformations,
    value: string | Date
  ) => {
    if (editedInfo) {
      // Si c'est une chaîne vide, on garde la valeur d'origine pour éviter les valeurs nulles indésirables
      if (
        typeof value === "string" &&
        value.trim() === "" &&
        studentInfo &&
        field !== "nom" &&
        field !== "prenom" &&
        field !== "email"
      ) {
        // Pour les champs obligatoires, on permet de les vider pour que la validation s'active
        setEditedInfo({ ...editedInfo, [field]: studentInfo[field] });
      } else {
        setEditedInfo({ ...editedInfo, [field]: value });
      }
    }
  };

  if (!studentInfo) {
    return (
      <div className="md:mx-8">
        <div className="text-center p-5">
          <i className="pi pi-spin pi-spinner" style={{ fontSize: "2rem" }}></i>
          <div className="text-gray-500 mt-3">
            Chargement des informations...
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toast ref={toastRef} />

      <h2 className="text-center mb-3">
        <FontAwesomeIcon icon={faIdCard} className="mr-2 text-indigo-600" />
        Informations personnelles
      </h2>

      <Accordion className="w-full" activeIndex={activeIndex}>
        {/* Onglet Informations personnelles */}
        <AccordionTab
          header={
            <div className="flex align-items-center">
              <FontAwesomeIcon icon={faUser} className="mr-2 text-indigo-500" />
              <span>Identité</span>
            </div>
          }
        >
          <div className="grid p-fluid">
            <div className="col-12 md:col-6 p-2">
              {isEditing ? (
                <div className="mb-1">
                  <strong style={{ fontSize: "1rem" }}>Nom :</strong>
                  <br />
                  <InputText
                    type="text"
                    className="p-inputtext-sm"
                    value={editedInfo?.nom || ""}
                    onChange={(e) => handleInputChange("nom", e.target.value)}
                    invalid={nomError !== ""}
                  />
                  {nomError && (
                    <small className="p-error block">{nomError}</small>
                  )}
                </div>
              ) : (
                <div className="mb-1">
                  <strong style={{ fontSize: "1rem" }}>Nom :</strong>{" "}
                  {studentInfo.nom}
                </div>
              )}
            </div>
            <div className="col-12 md:col-6 p-2">
              {isEditing ? (
                <div className="mb-1">
                  <strong style={{ fontSize: "1rem" }}>Prénom :</strong>
                  <br />
                  <InputText
                    type="text"
                    className="p-inputtext-sm"
                    value={editedInfo?.prenom || ""}
                    onChange={(e) =>
                      handleInputChange("prenom", e.target.value)
                    }
                    invalid={prenomError !== ""}
                  />
                  {prenomError && (
                    <small className="p-error block">{prenomError}</small>
                  )}
                </div>
              ) : (
                <div className="mb-1">
                  <strong style={{ fontSize: "1rem" }}>Prénom :</strong>{" "}
                  {studentInfo.prenom}
                </div>
              )}
            </div>
            <div className="col-12 md:col-6 p-2">
              {isEditing ? (
                <div className="mb-1">
                  <strong>Genre :</strong>
                  <br />
                  <InputText
                    type="text"
                    className="p-inputtext-sm"
                    value={editedInfo?.genre || ""}
                    onChange={(e) => handleInputChange("genre", e.target.value)}
                  />
                </div>
              ) : (
                <div className="mb-1">
                  <strong>Genre :</strong> {studentInfo.genre}
                </div>
              )}
            </div>
            <div className="col-12 md:col-6 p-2">
              {isEditing ? (
                <div className="mb-1">
                  <strong>Naissance :</strong>
                  <br />
                  <Calendar
                    className="p-inputtext-sm"
                    dateFormat="dd/mm/yy"
                    value={editedInfo?.dateNaissance || null}
                    onChange={(e) =>
                      handleInputChange("dateNaissance", e.target.value as Date)
                    }
                  />
                </div>
              ) : (
                <div className="mb-1">
                  <strong>Naissance :</strong>{" "}
                  {new Date(studentInfo.dateNaissance).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </AccordionTab>

        {/* Onglet Informations de contact */}
        <AccordionTab
          header={
            <div className="flex align-items-center">
              <i className="pi pi-envelope mr-2 text-indigo-500" />
              <span>Contact</span>
            </div>
          }
        >
          <div className="grid p-fluid">
            <div className="col-12 md:col-6 p-2">
              {isEditing ? (
                <div className="mb-1">
                  <strong>Email :</strong>
                  <br />
                  <InputText
                    type="text"
                    className="p-inputtext-sm"
                    value={editedInfo?.email || ""}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    invalid={emailError !== ""}
                  />
                  {emailError && (
                    <small className="p-error block">{emailError}</small>
                  )}
                </div>
              ) : (
                <div className="mb-1">
                  <strong>Email :</strong> {studentInfo.email}
                </div>
              )}
            </div>
            <div className="col-12 md:col-6 p-2">
              {isEditing ? (
                <div className="mb-1">
                  <strong>Téléphone :</strong>
                  <br />
                  <InputText
                    type="text"
                    className="p-inputtext-sm"
                    value={editedInfo?.telephone || ""}
                    onChange={(e) =>
                      handleInputChange("telephone", e.target.value)
                    }
                    invalid={telephoneError !== ""}
                  />
                  {telephoneError && (
                    <small className="p-error block">{telephoneError}</small>
                  )}
                </div>
              ) : (
                <div className="mb-1">
                  <strong>Téléphone :</strong> {studentInfo.telephone}
                </div>
              )}
            </div>
          </div>
        </AccordionTab>

        {/* Onglet Formation */}
        <AccordionTab
          header={
            <div className="flex align-items-center">
              <i className="pi pi-car mr-2 text-indigo-500" />
              <span>Formation permis</span>
            </div>
          }
        >
          <div className="grid p-fluid">
            <div className="col-12 md:col-6 p-2">
              {isEditing ? (
                <div className="mb-1">
                  <strong>Date d'examen :</strong>
                  <br />
                  <Calendar
                    className="p-inputtext-sm"
                    dateFormat="dd/mm/yy"
                    value={editedInfo?.dateExamen || null}
                    onChange={(e) =>
                      handleInputChange("dateExamen", e.target.value as Date)
                    }
                  />
                  {dateExamenError && (
                    <small className="p-error block">{dateExamenError}</small>
                  )}
                </div>
              ) : (
                <div className="mb-1">
                  <strong>Date d'examen :</strong>{" "}
                  {studentInfo.dateExamen
                    ? new Date(studentInfo.dateExamen).toLocaleDateString()
                    : "Non définie"}
                </div>
              )}
            </div>
            <div className="col-12 md:col-6 p-2">
              {isEditing ? (
                <div className="mb-1">
                  <strong>Auto-école :</strong>
                  <br />
                  <InputText
                    type="text"
                    className="p-inputtext-sm"
                    value={editedInfo?.autoEcole || ""}
                    onChange={(e) =>
                      handleInputChange("autoEcole", e.target.value)
                    }
                  />
                </div>
              ) : (
                <div className="mb-1">
                  <strong>Auto-école :</strong>{" "}
                  {studentInfo.autoEcole || "Non renseignée"}
                </div>
              )}
            </div>
          </div>
        </AccordionTab>
      </Accordion>

      <div className="flex w-full mt-4">
        {isEditing ? (
          <Button
            label="Sauvegarder"
            icon="pi pi-check"
            onClick={handleSaveClick}
            className="button-text text-sm ml-auto"
          />
        ) : (
          !readOnly &&
          isOwnProfile && (
            <Button
              label="Modifier"
              icon="pi pi-pencil"
              onClick={handleEditClick}
              className="button-text text-sm ml-auto"
            />
          )
        )}
      </div>

      {!readOnly && isOwnProfile && (
        <div className="flex w-full mt-4">
          <Button
            label="Se déconnecter"
            icon="pi pi-sign-out"
            onClick={() => {
              logout();
            }}
            className="p-button-danger text-sm m-auto"
          />
        </div>
      )}
    </>
  );
};

export default StudentInformations;
