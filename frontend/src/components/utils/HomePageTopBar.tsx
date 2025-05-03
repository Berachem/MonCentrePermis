import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SideBarCustom from "./SideBarCustom";
import SearchBar, { SearchFilters } from "./SearchBar/SearchBar";
import { getRequest } from "../../interfaces/utils/api";
import { OverlayPanel } from "primereact/overlaypanel";
import { Divider } from "primereact/divider";
import { Skeleton } from "primereact/skeleton";
import { Dialog } from "primereact/dialog";
import MoniteurInformations from "../Profils/MoniteurInformations";
import ClassesModal from "../modals/ClassesModal"; // Changé de CoursesModal à ClassesModal

// Typage pour les résultats renvoyés par l'API
interface SearchResult {
  type: string;
  id: number;
  label: string;
  address?: string;
  relevance?: number;
}

interface HomePageTopBarProps {
  onCentreSelect?: (centreId: number) => void;
}

const HomePageTopBar: React.FC<HomePageTopBarProps> = ({ onCentreSelect }) => {
  const navigate = useNavigate();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const resultsOverlayRef = useRef<OverlayPanel>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [showClassesModal, setShowClassesModal] = useState<boolean>(false); // Renommé de showCoursesModal
  const [selectedMoniteurId, setSelectedMoniteurId] = useState<string | null>(null); // Changé de selectedCourseId

  /**
   * Lance la requête vers /api/search dès que l'user tape ou change un filtre.
   */
  const handleSearch = async (query: string, filters: SearchFilters) => {
    setSearchQuery(query);
    
    if (!query || query.trim().length < 2) {
      resultsOverlayRef.current?.hide();
      setResults([]);
      return;
    }
    
    setLoading(true);
    setError(null);

    // Construction des params GET
    const params = new URLSearchParams();
    if (query) params.append("query", query);
    
    // Send categories as separate parameters for proper list handling
    if (filters.categories.length > 0) {
      filters.categories.forEach(category => {
        params.append("categories", category);
      });
    }
    
    try {
      console.log("Requête vers /api/search avec params:", params.toString());
      const data = await getRequest<SearchResult[]>(`/search?${params.toString()}`);
      setResults(data);

      resultsOverlayRef.current?.show(null, searchInputRef.current);

    } catch (err: any) {
      console.error("Recherche échouée :", err);
      setError(err.message);
      resultsOverlayRef.current?.hide();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fonction qui s'exécute lorsque l'utilisateur clique dans la barre de recherche
   * Si elle contient déjà du texte, réafficher les résultats précédents
   */
  const handleSearchFocus = () => {
    if (searchQuery.trim().length >= 2 && results.length > 0) {
      resultsOverlayRef.current?.show(null, searchInputRef.current);
    }
  };

  // Fonction pour obtenir l'icône correspondant au type de résultat
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'exam_centers':
        return "pi pi-building";
      case 'monitors':
        return "pi pi-user";
      case 'courses':
        return "pi pi-book";
      default:
        return "pi pi-file";
    }
  };

  // Fonction pour obtenir le libellé du type en français
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'exam_centers':
        return "Centre d'examen";
      case 'monitors':
        return "Moniteur";
      case 'courses':
        return "Cours";
      default:
        return "Autre";
    }
  };

  // Template pour l'affichage de chaque élément dans la liste
  const itemTemplate = (item: SearchResult) => {
    return (
      <div className={`flex align-items-center p-2 cursor-pointer hover:surface-200 result-type-${item.type}`}>
        <i className={`${getTypeIcon(item.type)} mr-3 text-lg`} style={{ width: '24px' }} />
        <div className="flex-1">
          <div className="font-medium">{item.label}</div>
          {item.address && (
            <div className="text-sm text-gray-600 mt-1">{item.address}</div>
          )}
        </div>
        <div className="text-xs text-gray-500 font-light flex-shrink-0">
          {getTypeLabel(item.type)}
        </div>
      </div>
    );
  };

  // Template pour les groupes de résultats
  const groupedItemTemplate = (option: SearchResult, index: number) => {
    // Vérifiez si c'est le premier item d'un nouveau type
    if (index === 0 || results[index - 1].type !== option.type) {
      return (
        <>
          {index > 0 && <Divider className="my-2" />}
          {itemTemplate(option)}
        </>
      );
    }
    
    return itemTemplate(option);
  };

  // Gestion du clic sur un résultat avec redirection appropriée
  const handleResultClick = (result: SearchResult) => {
    console.log("Résultat sélectionné:", result);
    
    // Redirection selon le type de résultat
    switch (result.type) {
      case 'exam_centers':
        // Si la fonction de sélection de centre existe, l'appeler avec l'ID du centre
        if (onCentreSelect) {
          onCentreSelect(result.id);
        }
        break;
      case 'monitors':
        setSelectedUserId(result.id.toString());
        setShowProfileModal(true);
        break;
      case 'courses':
        // Ouvrir le modal pour les classes avec l'ID du moniteur
        if (result.id) {
          setSelectedMoniteurId(result.id.toString());
          setShowClassesModal(true);
        } else {
          console.error("ID du moniteur non trouvé pour ce cours");
        }
        break;
    }
    resultsOverlayRef.current?.hide();
  };

  // Fonction pour fermer le modal
  const handleCloseProfileModal = () => {
    setShowProfileModal(false);
  };

  // Fonction pour fermer le modal des classes
  const handleCloseClassesModal = () => {
    setShowClassesModal(false);
  };
  
  return (
    <div className="search-container flex align-items-center md:px-4 px-2">
      <div className="flex align-items-center justify-content-start w-full">
        <SideBarCustom isOnMap={true} />
        <div className="ml-7 w-full" style={{ position: "relative", maxWidth: "500px" }}>
          {/* Référence au conteneur de recherche pour le overlay */}
          <div ref={searchInputRef}>
            <SearchBar
              onSearch={handleSearch}
              onFocus={handleSearchFocus}
              placeholder="Rechercher un centre d'examen, moniteur..."
              className="w-full"
              showQuickFilters={true}
              showAdvancedFilters={true}
            />
          </div>

          {/* Panel pour les résultats */}
          <OverlayPanel
            ref={resultsOverlayRef}
            showCloseIcon
            dismissable
            id="search-results-panel"
            style={{ 
              width: '95vw', 
              maxWidth: '500px',
              maxHeight: '80vh'
            }}
            className="search-results-panel"
          >
            <div className="search-results-container">
              {error && (
                <div className="p-2 text-red-600 text-center flex align-items-center justify-content-center">
                  <i className="pi pi-exclamation-triangle mr-2" />
                  <span className="text-sm md:text-base">{error}</span>
                </div>
              )}

              {loading ? (
                <div className="p-2">
                  <div className="mb-2">
                    <Skeleton height="1.75rem" className="mb-1" />
                    <Skeleton width="60%" height="0.85rem" />
                  </div>
                  <div className="mb-2">
                    <Skeleton height="1.75rem" className="mb-1" />
                    <Skeleton width="70%" height="0.85rem" />
                  </div>
                  <div>
                    <Skeleton height="1.75rem" className="mb-1" />
                    <Skeleton width="50%" height="0.85rem" />
                  </div>
                </div>
              ) : (
                <>
                  {results.length > 0 ? (
                    <>
                      <div className="text-xs md:text-sm text-gray-500 p-2 sticky top-0 bg-white shadow-1 z-1">
                        <strong>{results.length}</strong> résultat(s) pour "<strong>{searchQuery}</strong>"
                      </div>
                      
                      <div className="overflow-y-auto" style={{ maxHeight: 'calc(70vh - 50px)' }}>
                        {results.map((item, index) => (
                          <div 
                            key={`${item.type}-${item.id}`}
                            onClick={() => handleResultClick(item)}
                            className="cursor-pointer transition-colors transition-duration-150 hover:surface-hover"
                          >
                            {groupedItemTemplate(item, index)}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    searchQuery.trim().length >= 2 && (
                      <div className="p-3 text-center text-gray-500 flex align-items-center justify-content-center flex-column">
                        <i className="pi pi-search text-2xl mb-2 text-500"></i>
                        <span className="text-sm md:text-base">Aucun résultat trouvé pour "<strong>{searchQuery}</strong>"</span>
                      </div>
                    )
                  )}
                </>
              )}
            </div>
          </OverlayPanel>
        </div>
      </div>
      <Dialog
        header="Profil du moniteur"
        visible={showProfileModal}
        onHide={handleCloseProfileModal}
        style={{ width: '90%', maxWidth: '800px' }}
        modal
        className="p-fluid"
      >
        {selectedUserId && (
          <MoniteurInformations userId={selectedUserId} readOnly={true} />
        )}
      </Dialog>
      
      {/* Remplacer le CoursesModal par ClassesModal */}
      <ClassesModal
        visible={showClassesModal}
        onHide={handleCloseClassesModal}
        userId={selectedMoniteurId || undefined}
        readOnly={true}
      />
    </div>
  );
};

export default HomePageTopBar;