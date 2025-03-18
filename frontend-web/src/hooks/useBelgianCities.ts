import { useState, useEffect } from 'react';
import cities from '@/data/restructured_cities.json';

interface City {
  post_code: number;
  sub_municipality: {
    french: string | null;
    dutch: string | null;
    german: string | null;
  };
  municipality: {
    french: string | null;
    dutch: string | null;
    german: string | null;
  };
  region: {
    french: string | null;
    dutch: string | null;
    german: string | null;
  };
}

interface CityOption {
  value: string;
  label: string;
  postCode: string;
  municipality: string;
}

interface UseBelgianCitiesProps {
  language?: 'french' | 'dutch' | 'german';
  searchType?: 'postCode' | 'city';
}

export const useBelgianCities = ({
  language = 'french',
  searchType = 'city'
}: UseBelgianCitiesProps = {}) => {
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<CityOption[]>([]);

  useEffect(() => {
    if (search.length < 2) {
      setSuggestions([]);
      return;
    }

    const searchLower = search.toLowerCase();
    const filteredCities = cities.filter((city: City) => {
      if (searchType === 'postCode') {
        return city.post_code.toString().startsWith(searchLower);
      }

      const municipalityName = city.municipality[language] || 
                             city.municipality.french || 
                             city.municipality.dutch || 
                             '';
      
      const subMunicipalityName = city.sub_municipality[language] || 
                                 city.sub_municipality.french || 
                                 city.sub_municipality.dutch || 
                                 '';

      return municipalityName.toLowerCase().includes(searchLower) ||
             subMunicipalityName.toLowerCase().includes(searchLower);
    });

    const mappedSuggestions = filteredCities.map((city: City) => {
      const municipalityName = city.municipality[language] || 
                             city.municipality.french || 
                             city.municipality.dutch || '';
      
      const subMunicipalityName = city.sub_municipality[language] || 
                                 city.sub_municipality.french || 
                                 city.sub_municipality.dutch;

      const label = subMunicipalityName 
        ? `${municipalityName} (${subMunicipalityName})`
        : municipalityName;

      return {
        value: `${city.post_code}-${municipalityName}`,
        label,
        postCode: city.post_code.toString(),
        municipality: municipalityName
      };
    });

    setSuggestions(mappedSuggestions.slice(0, 10));
  }, [search, language, searchType]);

  return {
    search,
    setSearch,
    suggestions,
    setSuggestions
  };
}; 