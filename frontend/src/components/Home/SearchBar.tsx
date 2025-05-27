import React, { useState, useRef, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { useNavigate } from "react-router-dom";
import { getRequest } from "../../interfaces/api";
import { SearchResult } from "../../interfaces/interfaces";
import SearchResults from "./SearchResults";

interface SearchBarProps {
  onOpenProfileModal?: (userId: string) => void;
  onOpenCentreModal?: (centreId: number) => void;
}

function SearchBar({ onOpenProfileModal, onOpenCentreModal }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Fonction de recherche avec debounce
  const performSearch = async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getRequest<SearchResult[]>(
        `/search?query=${encodeURIComponent(searchQuery.trim())}&limit=20`
      );

      // Trier les résultats par pertinence et type
      const sortedResults = (response || []).sort((a, b) => {
        // D'abord par pertinence (score décroissant)
        if (b.relevance !== a.relevance) {
          return b.relevance - a.relevance;
        }

        // Ensuite par ordre de priorité des types
        const typePriority = {
          'exam_centers': 1,
          'monitors': 2,
          'courses': 3,
          'circuits': 4
        };

        const priorityA = typePriority[a.type] || 5;
        const priorityB = typePriority[b.type] || 5;

        return priorityA - priorityB;
      });

      setResults(sortedResults);
      setShowResults(true);
    } catch (err) {
      console.error("Erreur lors de la recherche:", err);
      setError("Erreur lors de la recherche");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion du changement de texte avec debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Annuler la recherche précédente
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Programmer une nouvelle recherche après 300ms
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  // Gestion du clic sur un résultat
  const handleResultClick = (result: SearchResult) => {
    setShowResults(false);
    setQuery(result.label);

    // Navigation selon le type de résultat
    switch (result.type) {
      case 'exam_centers':
        // Ouvrir le modal de détails du centre si la fonction est disponible
        if (onOpenCentreModal) {
          onOpenCentreModal(result.id);
        } else {
          // Fallback vers la page de détails
          navigate(`/centre/${result.id}`);
        }
        break;
      case 'monitors':
        // Ouvrir le modal de profil du moniteur si la fonction est disponible
        if (onOpenProfileModal) {
          onOpenProfileModal(result.id.toString());
        } else {
          // Fallback vers la page des cours
          navigate(`/courses/${result.id}`);
        }
        break;
      case 'courses':
        navigate(`/courses/${result.id}`);
        break;
      case 'circuits':
        navigate(`/circuit/view/${result.id}`);
        break;
      default:
        console.warn('Type de résultat non géré:', result.type);
    }
  };

  // Fermer les résultats lors du clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Nettoyage du timeout
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="absolute top-0 left-0 right-0 z-500">
      <div className="flex justify-center mt-5 px-4">
        {/* Ajout d'une marge à gauche sur mobile pour éviter le bouton de menu */}
        <div ref={searchContainerRef} className="relative w-full max-w-md ml-14 sm:ml-0">
          <InputText
            placeholder="Rechercher centres, moniteurs, cours..."
            value={query}
            onChange={handleInputChange}
            className="rounded-full shadow-lg hover:shadow-xl bg-white pl-4 pr-12 py-3 text-base w-full focus:shadow-2xl focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 border-2 border-green-100 focus:border-green-300 transition-all duration-200"
            onFocus={() => {
              if (results.length > 0 && query.trim().length >= 2) {
                setShowResults(true);
              }
            }}
          />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            {isLoading ? (
              <i className="pi pi-spin pi-spinner text-green-800 text-lg"></i>
            ) : (
              <i className="pi pi-search text-green-700 text-lg"></i>
            )}
          </div>

          {/* Composant des résultats */}
          <SearchResults
            results={results}
            isVisible={showResults}
            isLoading={isLoading}
            onResultClick={handleResultClick}
            onClose={() => setShowResults(false)}
          />

          {/* Message d'erreur */}
          {error && showResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-red-50 border border-red-200 rounded-lg p-4 shadow-xl">
              <div className="text-red-700 text-sm flex items-center font-medium">
                <i className="pi pi-exclamation-triangle mr-3 text-red-600"></i>
                {error}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchBar;
