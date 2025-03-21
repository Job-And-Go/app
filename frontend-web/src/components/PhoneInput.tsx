import React from 'react';

const COUNTRY_CODES = [
  { code: '+32', country: 'Belgique 🇧🇪' },
  { code: '+33', country: 'France 🇫🇷' },
  { code: '+352', country: 'Luxembourg 🇱🇺' },
  { code: '+31', country: 'Pays-Bas 🇳🇱' },
  { code: '+49', country: 'Allemagne 🇩🇪' },
  // Ajoutez d'autres pays selon vos besoins
];

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  required?: boolean;
}

const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange, className = '', required = false }) => {
  // Séparer le préfixe et le numéro
  const [prefix, setPrefix] = React.useState('+32');
  const [number, setNumber] = React.useState('');

  React.useEffect(() => {
    // Initialiser les valeurs si une valeur existe déjà
    if (value) {
      const matchedPrefix = COUNTRY_CODES.find(cc => value.startsWith(cc.code));
      if (matchedPrefix) {
        setPrefix(matchedPrefix.code);
        setNumber(value.slice(matchedPrefix.code.length));
      }
    }
  }, []);

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = e.target.value.replace(/\D/g, ''); // Garder uniquement les chiffres
    setNumber(newNumber);
    onChange(prefix + newNumber);
  };

  const handlePrefixChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPrefix = e.target.value;
    setPrefix(newPrefix);
    onChange(newPrefix + number);
  };

  return (
    <div className="flex">
      <select
        value={prefix}
        onChange={handlePrefixChange}
        className={`${className} rounded-l-lg border-r-0 min-w-[120px]`}
        required={required}
      >
        {COUNTRY_CODES.map(({ code, country }) => (
          <option key={code} value={code}>
            {country} ({code})
          </option>
        ))}
      </select>
      <input
        type="tel"
        value={number}
        onChange={handleNumberChange}
        placeholder="XXX XX XX XX"
        className={`${className} rounded-l-none`}
        required={required}
        maxLength={10}
      />
    </div>
  );
};

export default PhoneInput; 