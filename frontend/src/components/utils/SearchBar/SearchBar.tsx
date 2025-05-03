import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Divider } from 'primereact/divider';
import { Chip } from 'primereact/chip';
import './SearchBar.css';

// Interface pour les props du composant SearchBar
interface SearchBarProps {
  onSearch?: (query: string, filters: SearchFilters) => void;
  placeholder?: string;
  className?: string;
  showQuickFilters?: boolean;
  showAdvancedFilters?: boolean;
  onFocus?: () => void; // Nouvelle prop pour le focus
}

// Interface pour les filtres de recherche
export interface SearchFilters {
  categories: string[];
  rating?: number;
  [key: string]: any;
}

// Interface pour exposer les méthodes
export interface SearchBarRef {
  focus: () => void;
  clear: () => void;
  getInputElement: () => HTMLInputElement | null;
}

// Composant SearchBar réutilisable avec forwardRef
const SearchBar = forwardRef<SearchBarRef, SearchBarProps>(({
  onSearch,
  placeholder = 'Rechercher un centre d\'examen, un moniteur...',
  className = '',
  showQuickFilters = true,
  showAdvancedFilters = true,
  onFocus
}, ref) => {
  // États pour la recherche et les filtres
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState<SearchFilters>({
    categories: [],
    rating: 0,
  });
  const [activeFiltersCount, setActiveFiltersCount] = useState<number>(0);

  // Références pour les panels et l'input
  const filterPanelRef = useRef<OverlayPanel>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Expose les méthodes via ref
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
    clear: () => {
      setSearchQuery('');
      if (onSearch) {
        onSearch('', filters);
      }
    },
    getInputElement: () => inputRef.current
  }));

  // Options de catégories pour le filtre
  const categoryOptions = [
    { label: "Centres d'examen", value: 'exam_centers' },
    { label: 'Moniteurs', value: 'monitors' },
    { label: 'Cours', value: 'courses' },
  ];

  // Mise à jour du nombre de filtres actifs
  useEffect(() => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    
    setActiveFiltersCount(count);
  }, [filters]);

  // Fonction pour gérer les changements dans la recherche (avec debounce)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Debounce pour éviter trop d'appels API
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      if (onSearch) {
        onSearch(value, filters);
      }
    }, 300);
  };

  // Fonction pour gérer le focus sur l'input
  const handleInputFocus = () => {
    // Si le champ contient déjà du texte et qu'il y a un handler de focus
    if (searchQuery.trim().length > 0 && onFocus) {
      onFocus();
    }
  };

  // Fonction pour gérer les changements de catégories
  const handleCategoryChange = (e: { value: string[] }) => {
    const updatedFilters = { ...filters, categories: e.value };
    setFilters(updatedFilters);
    
    if (onSearch) {
      onSearch(searchQuery, updatedFilters);
    }
  };

  // Fonction pour gérer les changements dans les filtres avancés
  const handleFilterChange = (key: string, value: any) => {
    const updatedFilters = { ...filters, [key]: value };
    setFilters(updatedFilters);
  };

  // Fonction pour appliquer les filtres avancés
  const applyAdvancedFilters = () => {
    if (onSearch) {
      onSearch(searchQuery, filters);
    }
    filterPanelRef.current?.hide();
  };

  // Fonction pour réinitialiser tous les filtres
  const resetAllFilters = () => {
    const resetFilters = {
      categories: [],
      rating: 0,
    };
    
    setFilters(resetFilters);
    
    if (onSearch) {
      onSearch(searchQuery, resetFilters);
    }
  };

  // Retirer une catégorie spécifique
  const removeCategory = (category: string) => {
    const updatedCategories = filters.categories.filter(c => c !== category);
    const updatedFilters = { ...filters, categories: updatedCategories };
    
    setFilters(updatedFilters);
    
    if (onSearch) {
      onSearch(searchQuery, updatedFilters);
    }
  };

  return (
    <div className={`search-bar-container ${className}`}>
      {/* Barre de recherche principale */}
      <div className="p-inputgroup search-input-group">
        <InputText
          ref={inputRef}
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={handleInputFocus}
          className="p-inputtext-lg border-round-right-none"
        />
        
        {showQuickFilters && (
          <Button
            type="button"
            icon="pi pi-sliders-h"
            className={`p-button-outlined border-round-left-none text-white ${activeFiltersCount > 0 ? 'p-button-warning' : ''}`}
            onClick={(e) => filterPanelRef.current?.toggle(e)}
            tooltip="Filtres"
            tooltipOptions={{ position: 'bottom' }}
            badgeClassName="p-badge-warning"
          />
        )}
      </div>

      {/* Affichage des filtres actifs (chips) */}
      {filters.categories.length > 0 && (
        <div className="active-filters mt-2 flex flex-wrap gap-2">
          {filters.categories.map((category) => {
            const categoryLabel = categoryOptions.find(opt => opt.value === category)?.label;
            return (
              <Chip 
                key={category}
                label={categoryLabel}
                removable
                removeIcon="pi pi-times-circle"
                onRemove={() => removeCategory(category)}
                className="p-chip-sm"
              />
            );
          })}
        </div>
      )}

      {/* Panel pour les filtres avancés */}
      {showAdvancedFilters && (
        <OverlayPanel
          ref={filterPanelRef}
          showCloseIcon
          dismissable
          id="search-filters-panel"
          style={{ width: '300px', maxWidth: '90vw' }}
          className="search-filters-panel"
        >
          <div className="search-filters p-fluid">
            <h3>Filtres de recherche</h3>
            
            <div className="field mb-3">
              <label htmlFor="category-filter" className="font-bold block mb-2">Catégories</label>
              <MultiSelect
                id="category-filter"
                value={filters.categories}
                options={categoryOptions}
                onChange={handleCategoryChange}
                placeholder="Sélectionner des catégories"
                maxSelectedLabels={2}
                className="w-full"
                display="chip"
              />
            </div>

            <Divider />
            
            <div className="flex justify-content-between mt-4">
              <Button
                label="Réinitialiser"
                icon="pi pi-refresh"
                className="p-button-text p-button-sm"
                onClick={resetAllFilters}
              />
              
              <Button
                label="Appliquer"
                icon="pi pi-check"
                className="p-button-sm"
                onClick={applyAdvancedFilters}
              />
            </div>
          </div>
        </OverlayPanel>
      )}
    </div>
  );
});

export default SearchBar;