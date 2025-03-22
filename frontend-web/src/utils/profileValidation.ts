export const validateFormByUserType = (formData: any, userType: string) => {
  const errors = [];

  // Validations communes
  if (!formData.email || !formData.password) {
    errors.push('Email et mot de passe requis');
  }

  // Validation de l'adresse
  if (!formData.address_street || !formData.code_postal || !formData.localite) {
    errors.push('Tous les champs d\'adresse sont requis');
  }

  switch (userType) {
    case 'student':
      if (!formData.first_name || !formData.last_name) {
        errors.push('Prénom et nom requis pour les étudiants');
      }
      if (!formData.educational_institution) {
        errors.push('Établissement scolaire requis');
      }
      if (!formData.level) {
        errors.push('Niveau d\'études requis');
      }
      break;

    case 'particulier':
      if (!formData.first_name || !formData.last_name) {
        errors.push('Prénom et nom requis');
      }
      break;

    case 'professionnel':
      if (!formData.company_name) {
        errors.push('Nom de l\'entreprise requis');
      }
      if (!formData.company_email) {
        errors.push('Email de l\'entreprise requis');
      }
      if (!formData.sector) {
        errors.push('Secteur d\'activité requis');
      }
      if (!formData.tax_number) {
        errors.push('Numéro de TVA requis');
      }
      if (!formData.contact_name) {
        errors.push('Nom du contact principal requis');
      }
      if (!formData.contact_person_name) {
        errors.push('Nom de la personne à contacter requis');
      }
      if (!formData.contact_person_role) {
        errors.push('Rôle de la personne à contacter requis');
      }
      if (!formData.contact_person_email) {
        errors.push('Email du contact requis');
      }
      if (!formData.contact_person_phone) {
        errors.push('Téléphone du contact requis');
      }
      if (!formData.address_country) {
        errors.push('Pays requis');
      }
      break;

    case 'etablissement':
      if (!formData.full_name) {
        errors.push('Nom public requis');
      }
      if (!formData.company_name) {
        errors.push('Dénomination sociale requise');
      }
      if (!formData.contact_person_name) {
        errors.push('Nom du contact requis');
      }
      if (!formData.contact_person_email) {
        errors.push('Email du contact requis');
      }
      if (!formData.contact_person_phone) {
        errors.push('Téléphone du contact requis');
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