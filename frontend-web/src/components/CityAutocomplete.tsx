import { useState, useEffect, useRef } from 'react';
import { useBelgianCities } from '@/hooks/useBelgianCities';

interface CityAutocompleteProps {
  onSelectCity: (postCode: string, city: string) => void;
  className?: string;
  initialPostCode?: string;
  initialCity?: string;
  language?: 'french' | 'dutch' | 'german';
}

export const CityAutocomplete = ({
  onSelectCity,
  className = '',
  initialPostCode = '',
  initialCity = '',
  language = 'french'
}: CityAutocompleteProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [postCode, setPostCode] = useState(initialPostCode);
  const [city, setCity] = useState(initialCity);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const {
    search: postCodeSearch,
    setSearch: setPostCodeSearch,
    suggestions: postCodeSuggestions
  } = useBelgianCities({ language, searchType: 'postCode' });

  const {
    search: citySearch,
    setSearch: setCitySearch,
    suggestions: citySuggestions
  } = useBelgianCities({ language, searchType: 'city' });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePostCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPostCode(value);
    setPostCodeSearch(value);
    setIsOpen(true);
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCity(value);
    setCitySearch(value);
    setIsOpen(true);
  };

  const handleSelectSuggestion = (suggestion: { postCode: string; municipality: string }) => {
    setPostCode(suggestion.postCode);
    setCity(suggestion.municipality);
    setIsOpen(false);
    onSelectCity(suggestion.postCode, suggestion.municipality);
  };

  const suggestions = postCode ? postCodeSuggestions : citySuggestions;

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex gap-4">
        <div className="w-1/3">
          <input
            type="text"
            value={postCode}
            onChange={handlePostCodeChange}
            placeholder="Code postal"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-400 focus:ring-green-400 ${className}`}
          />
        </div>
        <div className="w-2/3">
          <input
            type="text"
            value={city}
            onChange={handleCityChange}
            placeholder="Localité"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-400 focus:ring-green-400 ${className}`}
          />
        </div>
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.value}
              onClick={() => handleSelectSuggestion(suggestion)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-black"
            >
              <span className="font-medium">{suggestion.postCode}</span> - {suggestion.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 