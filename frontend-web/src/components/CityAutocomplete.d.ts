import { FC } from 'react';

interface CityAutocompleteProps {
  onSelectCity: (postCode: string, city: string) => void;
  className?: string;
  initialPostCode?: string;
  initialCity?: string;
  language?: 'french' | 'dutch' | 'german';
}

export const CityAutocomplete: FC<CityAutocompleteProps>; 