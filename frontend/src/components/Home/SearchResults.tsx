import React from 'react';
import { SearchResult } from '../../interfaces/interfaces';

interface SearchResultsProps {
  results: SearchResult[];
  isVisible: boolean;
  isLoading: boolean;
  onResultClick: (result: SearchResult) => void;
  onClose: () => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  isVisible,
  isLoading,
  onResultClick,
  onClose
}) => {
  if (!isVisible) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'exam_centers':
        return 'pi pi-map-marker';
      case 'monitors':
        return 'pi pi-user';
      case 'courses':
        return 'pi pi-book';
      case 'circuits':
        return 'pi pi-flag';
      default:
        return 'pi pi-search';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'exam_centers':
        return 'Centre d\'examen';
      case 'monitors':
        return 'Moniteur';
      case 'courses':
        return 'Cours';
      case 'circuits':
        return 'Circuit';
      default:
        return 'Résultat';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'exam_centers':
        return 'text-green-700 bg-green-100';
      case 'monitors':
        return 'text-green-700 bg-green-100';
      case 'courses':
        return 'text-green-700 bg-green-100';
      case 'circuits':
        return 'text-green-700 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-green-200 max-h-96 overflow-y-auto z-50">
      {isLoading ? (
        <div className="p-6 text-center">
          <i className="pi pi-spin pi-spinner text-green-800 text-xl"></i>
          <div className="text-gray-600 mt-3 font-medium">Recherche en cours...</div>
        </div>
      ) : results.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          <i className="pi pi-search text-3xl mb-3 text-green-600"></i>
          <div className="font-medium">Aucun résultat trouvé</div>
          <div className="text-sm mt-1">Essayez avec d'autres mots-clés</div>
        </div>
      ) : (
        <>
          <div className="p-4 border-b border-green-100 bg-green-50">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-green-800">
                {results.length} résultat{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}
              </span>
              <button
                onClick={onClose}
                className="text-green-600 hover:text-green-800 transition-colors p-1 rounded-full hover:bg-green-100"
              >
                <i className="pi pi-times text-sm"></i>
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {results.map((result, index) => (
              <div
                key={`${result.type}-${result.id}-${index}`}
                className="p-4 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-all duration-200 hover:shadow-sm"
                onClick={() => onResultClick(result)}
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${getTypeColor(result.type)} shadow-sm`}>
                    <i className={`${getTypeIcon(result.type)} text-base`}></i>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-1">
                      <span className="font-semibold text-gray-900 truncate text-base">
                        {result.label}
                      </span>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getTypeColor(result.type)}`}>
                        {getTypeLabel(result.type)}
                      </span>
                    </div>

                    {result.address && (
                      <div className="text-sm text-gray-600 truncate flex items-center">
                        <i className="pi pi-map-marker mr-2 text-green-600"></i>
                        {result.address}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center">
                    <i className="pi pi-chevron-right text-green-600 text-lg"></i>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SearchResults;
