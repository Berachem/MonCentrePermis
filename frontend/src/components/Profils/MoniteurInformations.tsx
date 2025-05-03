import React, { useEffect, useState } from "react";
import { Divider } from "primereact/divider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartBar,
  faUser,
  faIdCard,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Toast } from "primereact/toast";
import { Accordion, AccordionTab } from "primereact/accordion";
import useAuth from "../../hooks/useAuth";
import ClassesModal from "../modals/ClassesModal";
import { getRequest, postRequest } from "../../interfaces/utils/api";

interface moniteurInformations {
  //infos
  nom: string;
  prenom: string;
  genre: string;
  dateNaissance: Date;
  email: string;
  telephone: string;
  dateDebutCarriere: Date;
  status: string;

  //stats
  coursesCount: string;
  studentCount: string;
  viewCount: string;
  rating: string;
  circuitsCount: string; // Ajoutons cette propriété
}

interface MoniteurInformationsProps {
  userId?: string; // ID de l'utilisateur à afficher, si undefined = utilisateur connecté
  readOnly?: boolean; // Mode lecture seule
}

const MoniteurInformations: React.FC<MoniteurInformationsProps> = ({
  userId,
  readOnly = false,
}) => {
  const { logout, userId: currentUserId } = useAuth();
  const [moniteurInfo, setMoniteurInfo] = useState<moniteurInformations | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState<moniteurInformations | null>(
    null
  );
  // Nouvel état pour contrôler la visibilité de la modale des cours
  const [classesModalVisible, setClassesModalVisible] = useState(false);

  // États pour gérer les erreurs de validation
  const [nomError, setNomError] = useState("");
  const [prenomError, setPrenomError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [telephoneError, setTelephoneError] = useState("");
  const [dateDebutCarriereError, setDateDebutCarriereError] = useState("");
  const toastRef = React.useRef<Toast>(null);

  // Détermine si on affiche son propre profil ou celui d'un autre utilisateur
  const isOwnProfile = !userId || userId === currentUserId;

  const fetchMoniteurInfo = async (id?: string) => {
    try {
      const response = await getRequest<moniteurInformations>(
        `/moniteurs/${id}/info`
      );
      return response;
    } catch (error) {
      console.error("Erreur lors de la récupération des informations:", error);
      return null;
    }
  };

  const saveMoniteurInfo = async (updatedInfo: moniteurInformations) => {
    try {
      const response = await postRequest<
        moniteurInformations,
        moniteurInformations
      >(`/moniteurs/UpdateInfo`, updatedInfo);

      console.log("Réponse de l'API:", response);
      return response;
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des informations:", error);
      throw error;
    }
  };

  useEffect(() => {
    const getMoniteurInfo = async () => {
      try {
        const data = await fetchMoniteurInfo(userId);
        if (data) {
          setMoniteurInfo(data);
          setEditedInfo(data);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des informations:", error);
      }
    };
    getMoniteurInfo();
  }, [userId, currentUserId]);

  const handleEditClick = () => {
    // Réinitialiser les erreurs lors de l'entrée en mode édition
    setNomError("");
    setPrenomError("");
    setEmailError("");
    setTelephoneError("");
    setDateDebutCarriereError("");
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    if (editedInfo) {
      // Vérifier les champs obligatoires
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

      // Vérification des dates
      if (editedInfo.dateNaissance && editedInfo.dateDebutCarriere) {
        // Vérifier que la date de début de carrière est après la date de naissance
        if (editedInfo.dateDebutCarriere < editedInfo.dateNaissance) {
          setDateDebutCarriereError(
            "La date de début de carrière ne peut pas être antérieure à la date de naissance."
          );
          hasError = true;
        } else {
          setDateDebutCarriereError("");
        }
      }

      if (!hasError) {
        // Créer une copie pour éviter les références d'objet
        const infoToSave = { ...editedInfo };

        // Pour les champs non-obligatoires, s'assurer de ne pas envoyer de chaînes vides
        // mais plutôt conserver les valeurs existantes
        if (moniteurInfo) {
          if (!infoToSave.genre || infoToSave.genre.trim() === "")
            infoToSave.genre = moniteurInfo.genre;

          if (!infoToSave.telephone || infoToSave.telephone.trim() === "")
            infoToSave.telephone = moniteurInfo.telephone;

          if (!infoToSave.status || infoToSave.status.trim() === "")
            infoToSave.status = moniteurInfo.status;
        }

        try {
          await saveMoniteurInfo(infoToSave);
          setMoniteurInfo(infoToSave); // Met à jour les informations affichées
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
    field: keyof moniteurInformations,
    value: string | Date
  ) => {
    if (editedInfo) {
      // Si c'est une chaîne vide, on garde la valeur d'origine pour éviter les valeurs nulles indésirables
      if (
        typeof value === "string" &&
        value.trim() === "" &&
        moniteurInfo &&
        field !== "nom" &&
        field !== "prenom" &&
        field !== "email"
      ) {
        // Pour les champs obligatoires, on permet de les vider pour que la validation s'active
        setEditedInfo({ ...editedInfo, [field]: moniteurInfo[field] });
      } else {
        setEditedInfo({ ...editedInfo, [field]: value });
      }
    }
  };

  // Fonction pour ouvrir la modale des cours
  const handleOpenClassesModal = () => {
    setClassesModalVisible(true);
  };

  if (!moniteurInfo) {
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

      {/* SECTION STATISTIQUES */}
      <h2 className="text-center mb-4 text-xl font-bold text-gray-800">
        <FontAwesomeIcon icon={faChartBar} className="mr-2 text-green-700" />
        Statistiques
      </h2>

      <div className="flex flex-col md:flex-row gap-6 mt-3 mb-6 justify-center">
        {/* Carte pour les cours */}
        <div className="w-full md:w-1/2">
          <div className="bg-white shadow-md rounded-lg p-4 relative overflow-hidden">
            <i className="pi pi-book text-green-200 text-8xl absolute top-0 right-0 m-3 pointer-events-none"></i>

            <div className="flex flex-col">
              <span className="text-green-700 text-5xl font-bold my-2">
                {moniteurInfo.coursesCount || "0"}
              </span>
              <span className="text-xl text-gray-600 ml-2">cours créés</span>
              <Button
                label={isOwnProfile ? "Voir mes cours" : "Voir les cours"}
                className="bg-green-800 hover:bg-green-700 text-white border-none rounded-lg py-1 px-3 mt-3 self-start"
                onClick={handleOpenClassesModal}
              />
            </div>
          </div>
        </div>

        {/* Carte pour les circuits */}
        <div className="w-full md:w-1/2">
          <div className="bg-white shadow-md rounded-lg p-4 relative overflow-hidden">
            <i className="pi pi-map text-green-200 text-8xl absolute top-0 right-0 m-3 pointer-events-none"></i>

            <div className="flex flex-col">
              <span className="text-green-700 text-5xl font-bold my-2">
                {moniteurInfo.circuitsCount || "0"}
              </span>
              <span className="text-xl text-gray-600 ml-2">circuits créés</span>
            </div>
          </div>
        </div>
      </div>

      <Divider className="my-6 bg-gray-200" />

      {/* SECTION INFORMATIONS */}
      <h2 className="text-center mb-6 text-xl font-bold text-gray-800">
        <FontAwesomeIcon icon={faIdCard} className="mr-2 text-green-700" />
        Détails du profil
      </h2>

      <Accordion className="w-full border border-green-100 rounded-lg overflow-hidden shadow-sm">
        <AccordionTab
          header={
            <div className="flex items-center py-3 px-4">
              <FontAwesomeIcon icon={faUser} className="mr-3 text-green-600 text-lg" />
              <span className="font-medium text-lg text-green-800">Informations personnelles</span>
            </div>
          }
          headerClassName="bg-green-50 hover:bg-green-100 border-b border-green-200"
          contentClassName="bg-white p-3"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              {/* Nom */}
              {isEditing ? (
                <div className="mb-1">
                  <label className="block text-green-800 font-medium mb-1">Nom :</label>
                  <InputText
                    type="text"
                    className={`w-full p-2 border ${nomError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:border-green-800 focus:ring focus:ring-green-200 focus:ring-opacity-50`}
                    value={editedInfo?.nom || ""}
                    onChange={(e) => handleInputChange("nom", e.target.value)}
                  />
                  {nomError && (
                    <small className="text-red-500 mt-1 block">{nomError}</small>
                  )}
                </div>
              ) : (
                <div className="mb-1">
                  <span className="text-green-800 font-medium block mb-1">Nom :</span>
                  <span className="text-gray-700">{moniteurInfo.nom}</span>
                </div>
              )}
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              {/* Prénom */}
              {isEditing ? (
                <div className="mb-1">
                  <label className="block text-green-800 font-medium mb-1">Prénom :</label>
                  <InputText
                    type="text"
                    className={`w-full p-2 border ${prenomError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:border-green-800 focus:ring focus:ring-green-200 focus:ring-opacity-50`}
                    value={editedInfo?.prenom || ""}
                    onChange={(e) => handleInputChange("prenom", e.target.value)}
                  />
                  {prenomError && (
                    <small className="text-red-500 mt-1 block">{prenomError}</small>
                  )}
                </div>
              ) : (
                <div className="mb-1">
                  <span className="text-green-800 font-medium block mb-1">Prénom :</span>
                  <span className="text-gray-700">{moniteurInfo.prenom}</span>
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 mt-2">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              {/* Genre */}
              {isEditing ? (
                <div className="mb-1">
                  <label className="block text-green-800 font-medium mb-1">Genre :</label>
                  <InputText
                    type="text"
                    className={`w-full p-2 border border-gray-300 rounded-lg focus:border-green-800 focus:ring focus:ring-green-200 focus:ring-opacity-50`}
                    value={editedInfo?.genre || ""}
                    onChange={(e) => handleInputChange("genre", e.target.value)}
                  />
                </div>
              ) : (
                <div className="mb-1">
                  <span className="text-green-800 font-medium block mb-1">Genre :</span>
                  <span className="text-gray-700">{moniteurInfo.genre}</span>
                </div>
              )}
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              {/* Date de naissance */}
              {isEditing ? (
                <div className="mb-1">
                  <label className="block text-green-800 font-medium mb-1">Naissance :</label>
                  <Calendar
                    dateFormat="dd/mm/yy"
                    value={editedInfo?.dateNaissance || null}
                    onChange={(e) => handleInputChange("dateNaissance", e.target.value as Date)}
                    className="w-full"
                    inputClassName="w-full p-2 border border-gray-300 rounded-lg focus:border-green-800 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                  />
                </div>
              ) : (
                <div className="mb-1">
                  <span className="text-green-800 font-medium block mb-1">Naissance :</span>
                  <span className="text-gray-700">{new Date(moniteurInfo.dateNaissance).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </AccordionTab>

        <AccordionTab
          header={
            <div className="flex items-center py-3 px-4">
              <i className="pi pi-envelope mr-3 text-green-600 text-lg" />
              <span className="font-medium text-lg text-green-800">Informations de contact</span>
            </div>
          }
          headerClassName="bg-green-50 hover:bg-green-100 border-b border-green-200"
          contentClassName="bg-white p-3"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              {/* Email */}
              {isEditing ? (
                <div className="mb-1">
                  <label className="block text-green-800 font-medium mb-1">Email :</label>
                  <InputText
                    type="text"
                    className={`w-full p-2 border ${emailError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:border-green-800 focus:ring focus:ring-green-200 focus:ring-opacity-50`}
                    value={editedInfo?.email || ""}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                  {emailError && (
                    <small className="text-red-500 mt-1 block">{emailError}</small>
                  )}
                </div>
              ) : (
                <div className="mb-1">
                  <span className="text-green-800 font-medium block mb-1">Email :</span>
                  <span className="text-gray-700">{moniteurInfo.email}</span>
                </div>
              )}
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              {/* Téléphone */}
              {isEditing ? (
                <div className="mb-1">
                  <label className="block text-green-800 font-medium mb-1">Téléphone :</label>
                  <InputText
                    type="text"
                    className={`w-full p-2 border ${telephoneError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:border-green-800 focus:ring focus:ring-green-200 focus:ring-opacity-50`}
                    value={editedInfo?.telephone || ""}
                    onChange={(e) => handleInputChange("telephone", e.target.value)}
                  />
                  {telephoneError && (
                    <small className="text-red-500 mt-1 block">{telephoneError}</small>
                  )}
                </div>
              ) : (
                <div className="mb-1">
                  <span className="text-green-800 font-medium block mb-1">Téléphone :</span>
                  <span className="text-gray-700">{moniteurInfo.telephone}</span>
                </div>
              )}
            </div>
          </div>
        </AccordionTab>

        <AccordionTab
          header={
            <div className="flex items-center py-3 px-4">
              <i className="pi pi-briefcase mr-3 text-green-600 text-lg" />
              <span className="font-medium text-lg text-green-800">Informations professionnelles</span>
            </div>
          }
          headerClassName="bg-green-50 hover:bg-green-100"
          contentClassName="bg-white p-3"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              {/* Début de carrière */}
              {isEditing ? (
                <div className="mb-1">
                  <label className="block text-green-800 font-medium mb-1">Début de carrière :</label>
                  <Calendar
                    dateFormat="dd/mm/yy"
                    value={editedInfo?.dateDebutCarriere || null}
                    onChange={(e) => handleInputChange("dateDebutCarriere", e.target.value as Date)}
                    className="w-full"
                    inputClassName="w-full p-2 border border-gray-300 rounded-lg focus:border-green-800 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                  />
                  {dateDebutCarriereError && (
                    <small className="text-red-500 mt-1 block">{dateDebutCarriereError}</small>
                  )}
                </div>
              ) : (
                <div className="mb-1">
                  <span className="text-green-800 font-medium block mb-1">Début de carrière :</span>
                  <span className="text-gray-700">
                    {moniteurInfo.dateDebutCarriere
                      ? new Date(moniteurInfo.dateDebutCarriere).toLocaleDateString("fr-FR")
                      : "Non renseignée"}
                  </span>
                </div>
              )}
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              {/* Status */}
              {isEditing ? (
                <div className="mb-1">
                  <label className="block text-green-800 font-medium mb-1">Status :</label>
                  <InputText
                    type="text"
                    className={`w-full p-2 border border-gray-300 rounded-lg focus:border-green-800 focus:ring focus:ring-green-200 focus:ring-opacity-50`}
                    value={editedInfo?.status || ""}
                    onChange={(e) => handleInputChange("status", e.target.value)}
                  />
                </div>
              ) : (
                <div className="mb-1">
                  <span className="text-green-800 font-medium block mb-1">Status :</span>
                  <span className="text-gray-700">{moniteurInfo.status}</span>
                </div>
              )}
            </div>
          </div>
        </AccordionTab>
      </Accordion>

      {/* Boutons d'action */}
      <div className="flex w-full mt-8">
        {isEditing ? (
          <Button
            label="Sauvegarder"
            icon="pi pi-check"
            onClick={handleSaveClick}
            className="ml-auto bg-green-800 hover:bg-green-700 border-none text-white px-5 py-2 rounded-lg text-base font-medium"
          />
        ) : (
          !readOnly &&
          isOwnProfile && (
            <Button
              label="Modifier"
              icon="pi pi-pencil"
              onClick={handleEditClick}
              className="ml-auto bg-green-800 hover:bg-green-700 border-none text-white px-5 py-2 rounded-lg text-base font-medium gap-2"
            />
          )
        )}
      </div>

      {!readOnly && isOwnProfile && (
        <div className="flex w-full mt-6">
          <Button
            label="Se déconnecter"
            icon="pi pi-sign-out"
            onClick={() => {
              logout();
            }}
            className="mx-auto bg-red-600 hover:bg-red-700 border-none text-white px-4 py-2 rounded-lg gap-2"
          />
        </div>
      )}

      {/* Modale des cours */}
      <ClassesModal
        visible={classesModalVisible}
        onHide={() => setClassesModalVisible(false)}
        userId={userId}
        readOnly={!isOwnProfile}
      />
    </>
  );
};

export default MoniteurInformations;
