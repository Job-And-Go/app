export const validateFormByUserType = (formData: any, userType: string) => {
  const errors = [];

  // Validations communes
  if (!formData.email || !formData.password) {
    errors.push('Email et mot de passe requis');
  }

  switch (userType) {
    case 'student':
      if (!formData.first_name || !formData.last_name) {
        errors.push('Prénom et nom requis pour les étudiants');
      }
      if (!formData.educational_institution) {
        errors.push('Établissement scolaire requis');
      }
      break;

    case 'professionnel':
      if (!formData.company_name) {
        errors.push('Nom de l\'entreprise requis');
      }
      if (!formData.tax_number) {
        errors.push('Numéro de TVA requis');
      }
      break;

    case 'etablissement':
      if (!formData.company_name) {
        errors.push('Nom de l\'établissement requis');
      }
      if (!formData.contact_person_name || !formData.contact_person_email) {
        errors.push('Informations de contact requises');
      }
      break;
  }

  return errors;
};

export const buildProfileData = (formData: any, userType: string, userId: string) => {
  const baseProfile = {
    id: userId,
    type: userType,
    email: formData.email,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_private: true,
    accept_dm: false
  };

  switch (userType) {
    case 'student':
      return {
        ...baseProfile,
        first_name: formData.first_name,
        last_name: formData.last_name,
        full_name: `${formData.first_name} ${formData.last_name}`,
        educational_institution: formData.educational_institution,
        level: formData.level
      };

    case 'professionnel':
      return {
        ...baseProfile,
        company_name: formData.company_name,
        contact_name: formData.contact_name,
        tax_number: formData.tax_number,
        sector: formData.sector
      };

    // ... autres cas
  }
}; 