export const validateFormByUserType = (formData: any, userType: string) => {
  const errors = [];

  // Validations communes
  if (!formData.email || !formData.password) {
    errors.push('Email et mot de passe requis');
  }

  // Seules validations spécifiques au type d'utilisateur
  switch (userType) {
    case 'student':
      // Validations essentielles pour les étudiants
      if (!formData.phone) {
        errors.push('Numéro de téléphone requis');
      }
      if (!formData.date_of_birth) {
        errors.push('Date de naissance requise');
      }
      break;

    case 'particulier':
      // Aucune validation supplémentaire requise à l'inscription
      break;

    case 'professionnel':
      // Validations essentielles pour les professionnels
      if (!formData.company_name) {
        errors.push('Nom de l\'entreprise requis');
      }
      if (!formData.phone) {
        errors.push('Numéro de téléphone requis');
      }
      break;

    case 'etablissement':
      // Seules validations essentielles pour les établissements
      if (!formData.full_name) {
        errors.push('Nom public requis');
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
    accept_dm: false,
    phone: formData.phone || "",
    address_street: formData.address_street,
    code_postal: formData.code_postal,
    localite: formData.localite
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

    case 'particulier':
      return {
        ...baseProfile,
        first_name: formData.first_name,
        last_name: formData.last_name,
        full_name: `${formData.first_name} ${formData.last_name}`,
        contact_preference: formData.contact_preference || ""
      };

    case 'professionnel':
      return {
        ...baseProfile,
        company_name: formData.company_name,
        company_email: formData.company_email,
        sector: formData.sector,
        tax_number: formData.tax_number,
        contact_name: formData.contact_name,
        contact_person_name: formData.contact_person_name,
        contact_person_role: formData.contact_person_role,
        contact_person_email: formData.contact_person_email,
        contact_person_phone: formData.contact_person_phone,
        address_country: formData.address_country
      };

    case 'etablissement':
      return {
        ...baseProfile,
        full_name: formData.full_name,
        company_name: formData.company_name,
        contact_person_name: formData.contact_person_name,
        contact_person_email: formData.contact_person_email,
        contact_person_phone: formData.contact_person_phone
      };

    default:
      return baseProfile;
  }
}; 