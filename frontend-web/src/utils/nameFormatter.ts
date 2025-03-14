export const formatName = (firstName: string, lastName: string): string => {
  if (!firstName || !lastName) return '';
  
  const firstInitial = firstName.charAt(0).toUpperCase();
  const lastNameInitial = lastName.charAt(0).toUpperCase();
  
  return `${firstName}.${lastNameInitial}`;
}; 