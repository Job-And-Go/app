'use client';

import { useState, useEffect } from 'react';
import cities from '@/data/restructured_cities.json';

interface City {
  post_code: number;
  municipality: {
    french: string | null;
    dutch: string | null;
  };
}

interface LocationSearchProps {
  onSelect: (location: string) => void;
}

export default function LocationSearch({ onSelect }: LocationSearchProps) {
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<City[]>([]);

  useEffect(() => {
    if (search.length > 1) {
      const filtered = cities.filter(city => {
        const searchLower = search.toLowerCase();
        const municipalityName = city.municipality.french || city.municipality.dutch || '';
        return (
          city.post_code.toString().includes(search) ||
          municipalityName.toLowerCase().includes(searchLower)
        );
      }).slice(0, 5); // Limite à 5 suggestions

      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [search]);

  const handleSelect = (city: City) => {
    const location = `${city.post_code} ${city.municipality.french || city.municipality.dutch}`;
    setSearch(location);
    onSelect(location);
    setSuggestions([]);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Code postal ou localité"
        className="w-full p-2 border rounded focus:ring-2 focus:ring-theme-primary text-black"
      />
      
      {suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border rounded-b shadow-lg mt-1">
          {suggestions.map((city, index) => (
            <li
              key={`${city.post_code}-${index}`}
              onClick={() => handleSelect(city)}
              className="p-2 hover:bg-gray-100 cursor-pointer text-black"
            >
              {city.post_code} {city.municipality.french || city.municipality.dutch}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 