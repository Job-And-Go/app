import { useState } from 'react';
import { FiMapPin, FiDollarSign, FiFilter, FiX, FiCheck } from 'react-icons/fi';

interface Category {
  name: string;
  icon: string;
  count: number;
}

interface JobsSidebarProps {
  categories: Record<string, string[]>;
  filters: {
    location: string;
    minSalary: string;
    category: string;
    subcategory: string;
    status: string;
    sortBy: string;
  };
  onFilterChange: (name: string, value: string) => void;
  onReset: () => void;
  activeFiltersCount: number;
}

export default function JobsSidebar({
  categories,
  filters,
  onFilterChange,
  onReset,
  activeFiltersCount
}: JobsSidebarProps) {
  const [isOpen, setIsOpen] = useState(true);

  // Catégories avec leurs icônes et compteurs (à remplacer par les vraies données)
  const categoriesWithMeta: Category[] = Object.keys(categories).map(cat => ({
    name: cat,
    icon: '🔧', // À remplacer par les vraies icônes
    count: 0 // À remplacer par le vrai compteur
  }));

  const sortOptions = [
    { value: 'recent', label: 'Plus récentes' },
    { value: 'salary_desc', label: 'Salaire décroissant' },
    { value: 'salary_asc', label: 'Salaire croissant' }
  ];

  return (
    <div className={`bg-white border-r border-gray-200 h-[calc(100vh-64px)] overflow-y-auto transition-all duration-300 ${
      isOpen ? 'w-80' : 'w-16'
    }`}>
      <div className="sticky top-0 bg-white z-10 p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`font-semibold text-gray-900 ${!isOpen && 'hidden'}`}>
            Filtres
            {activeFiltersCount > 0 && (
              <span className="ml-2 px-2 py-1 text-xs bg-theme-primary text-white rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </h2>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <FiFilter className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {isOpen && (
          <>
            <div className="space-y-4">
              {/* Tri */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trier par
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => onFilterChange('sortBy', e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-theme-primary focus:border-theme-primary"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Localisation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Localisation
                </label>
                <div className="relative">
                  <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={filters.location}
                    onChange={(e) => onFilterChange('location', e.target.value)}
                    placeholder="Ville ou code postal"
                    className="w-full pl-10 pr-4 py-2 border-gray-300 rounded-md shadow-sm focus:ring-theme-primary focus:border-theme-primary"
                  />
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget minimum
                </label>
                <div className="relative">
                  <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    value={filters.minSalary}
                    onChange={(e) => onFilterChange('minSalary', e.target.value)}
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-2 border-gray-300 rounded-md shadow-sm focus:ring-theme-primary focus:border-theme-primary"
                  />
                </div>
              </div>

              {/* Catégories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégories
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {categoriesWithMeta.map(category => (
                    <button
                      key={category.name}
                      onClick={() => onFilterChange('category', category.name)}
                      className={`w-full flex items-center justify-between p-2 rounded-md transition-colors ${
                        filters.category === category.name
                          ? 'bg-theme-light text-theme-primary'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="mr-2">{category.icon}</span>
                        <span className="text-sm">{category.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {category.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sous-catégories */}
              {filters.category && categories[filters.category]?.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sous-catégories
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {categories[filters.category].map(subcat => (
                      <button
                        key={subcat}
                        onClick={() => onFilterChange('subcategory', subcat)}
                        className={`w-full flex items-center justify-between p-2 rounded-md transition-colors ${
                          filters.subcategory === subcat
                            ? 'bg-theme-light text-theme-primary'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-sm">{subcat}</span>
                        {filters.subcategory === subcat && (
                          <FiCheck className="w-4 h-4" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Statut */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => onFilterChange('status', e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-theme-primary focus:border-theme-primary"
                >
                  <option value="open">Offres ouvertes</option>
                  <option value="closed">Offres fermées</option>
                </select>
              </div>

              {/* Bouton réinitialiser */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={onReset}
                  className="w-full flex items-center justify-center gap-2 p-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <FiX className="w-4 h-4" />
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
} 