import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { AutoComplete } from "primereact/autocomplete";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Toast } from "primereact/toast";
import { useRef } from "react";
import HomePageTopBar from "../../components/utils/HomePageTopBar";
import { getRequest, postRequest } from "../../interfaces/utils/api";
import useAuth from "../../hooks/useAuth";

interface Ville {
  id: number;
  libelle: string;
  code_postal?: string;
}

interface VillesResponse {
  member?: Ville[];
  "hydra:member"?: Ville[];
  totalItems?: number;
  "hydra:totalItems"?: number;
  view?: {
    next?: string;
    [key: string]: any;
  };
}

interface CircuitResponse {
  id: number;
  libelle: string;
  description: string;
  ville_centre: string; // URI de la ville
}

const CircuitCreationPage: React.FC = () => {


  const { typeUserid } = useAuth();
  const [libelle, setLibelle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [selectedVille, setSelectedVille] = useState<Ville | null>(null);
  const [villes, setVilles] = useState<Ville[]>([]);
  const [filteredVilles, setFilteredVilles] = useState<Ville[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const toast = useRef<Toast>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Chargement initial d'un petit nombre de villes pour le dropdown
    fetchVilles();
  }, []);

  const fetchVilles = async (searchTerm: string = "") => {
    try {
      // Utiliser le filtre de recherche API Platform
      let url = "/villes?itemsPerPage=20";

      // Ajouter le filtre de recherche si un terme est fourni
      // Convertir en majuscules pour standardiser la recherche
      if (searchTerm) {
        const uppercaseTerm = searchTerm.toUpperCase();
        url += `&libelle=${encodeURIComponent(uppercaseTerm)}`;
      }

      const response = await getRequest<VillesResponse>(url);

      // Vérifier si les données existent dans member ou hydra:member
      const villesData = response?.member || response?.["hydra:member"] || [];

      if (searchTerm) {
        // Pour une recherche spécifique, mettre à jour les villes filtrées
        setFilteredVilles(villesData);
      } else {
        // Pour le chargement initial, mettre à jour toutes les villes
        setVilles(villesData);
        console.log(`${villesData.length} villes chargées avec succès`);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des villes:", error);
      if (searchTerm) {
        setFilteredVilles([]);
      } else {
        setVilles([]);
      }
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Impossible de charger la liste des villes",
        life: 3000,
      });
    }
  };

  const searchVille = async (event: { query: string }) => {
    const query = event.query;

    if (query.length < 2) {
      // Si la requête est trop courte, filtrer localement
      // Utiliser toUpperCase() pour la comparaison locale aussi
      const filtered = villes.filter(
        (ville) =>
          ville.libelle.toUpperCase().includes(query.toUpperCase()) ||
          (ville.code_postal && ville.code_postal.includes(query))
      );
      setFilteredVilles(filtered);
    } else {
      // Sinon, faire une requête API avec le filtre
      await fetchVilles(query);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!libelle.trim() || !selectedVille) {
      toast.current?.show({
        severity: "warn",
        summary: "Champs requis",
        detail: "Veuillez remplir tous les champs obligatoires",
        life: 3000,
      });
      return;
    }

    setIsLoading(true);

    console.log("Création du circuit avec les données suivantes:", {
      libelle,
      description,
      selectedVille,
      typeUserid,
    });
    
    try {
      // Créer le circuit via l'API
      const circuitData = {
        libelle,
        description,
        ville_centre: `/api/villes/${selectedVille.id}`,
        id_moniteur: `/api/moniteurs/${typeUserid}`,
      };

      const response = await postRequest<CircuitResponse, typeof circuitData>(
        "/circuits",
        circuitData
      );

      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: "Le circuit a été créé avec succès",
        life: 3000,
      });

      // Rediriger vers la page d'édition avec l'ID du circuit créé
      setTimeout(() => {
        navigate(`/admin/circuit/edit/${response.id}`);
      }, 1500);
    } catch (error) {
      console.error("Erreur lors de la création du circuit:", error);
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Impossible de créer le circuit",
        life: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const villeTemplate = (ville: Ville) => {
    return (
      <div className="flex align-items-center">
        <div>
          <div className="font-bold">{ville.libelle}</div>
          {ville.code_postal && (
            <div className="text-sm">{ville.code_postal}</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-column min-h-screen">
      <Toast ref={toast} />
      <HomePageTopBar />

      <div className="flex justify-content-center align-items-center flex-grow-1 p-3">
        <Card
          title="Création d'un nouveau circuit"
          className="w-full max-w-30rem shadow-5"
        >
          <form onSubmit={handleSubmit} className="p-fluid">
            <div className="field mb-4">
              <label htmlFor="libelle" className="font-bold block mb-2">
                Nom du circuit *
              </label>
              <InputText
                id="libelle"
                value={libelle}
                onChange={(e) => setLibelle(e.target.value)}
                placeholder="Ex: Circuit débutant - Centre ville"
                required
              />
            </div>

            <div className="field mb-4">
              <label htmlFor="description" className="font-bold block mb-2">
                Description
              </label>
              <InputTextarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Décrivez le circuit (difficulté, points d'intérêt, etc.)"
              />
            </div>

            <div className="field mb-4">
              <label htmlFor="ville" className="font-bold block mb-2">
                Ville de référence *
              </label>
              <AutoComplete
                id="ville"
                value={selectedVille}
                suggestions={filteredVilles}
                completeMethod={searchVille}
                field="libelle"
                dropdown
                forceSelection
                onChange={(e) => setSelectedVille(e.value)}
                placeholder="Rechercher une ville"
                itemTemplate={villeTemplate}
                required
              />
            </div>

            <div className="flex justify-content-between mt-4">
              <Button
                label="Annuler"
                icon="pi pi-times"
                className="p-button-outlined"
                onClick={() => navigate(-1)}
                type="button"
              />
              <Button
                label="Créer et continuer"
                icon="pi pi-arrow-right"
                type="submit"
                loading={isLoading}
              />
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CircuitCreationPage;
