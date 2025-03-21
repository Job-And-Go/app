'use client';

import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { IntegrationProvider, INTEGRATION_CONFIGS, getProviderConfig } from '@/config/integration';
import { validateFormByUserType, buildProfileData } from '@/utils/profileValidation';
import { USER_TYPES } from '@/constants/userTypes';
import { CityAutocomplete } from '@/components/CityAutocomplete';
import PhoneInput from '@/components/PhoneInput';

const FORM_STYLES = {
  container: "min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4",
  card: "bg-white p-8 rounded-2xl shadow-2xl w-full max-w-[800px] border border-orange-100",
  title: "text-3xl font-bold mb-8 text-center text-gray-800",
  formGroup: "space-y-6",
  label: "block text-sm font-medium text-gray-700 mb-1",
  input: "mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-gray-800 p-3 transition-all duration-200",
  button: "w-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white py-3 px-6 rounded-lg hover:opacity-90 transition-all duration-200 font-medium text-lg shadow-md hover:shadow-lg",
  link: "ml-1 text-orange-600 hover:text-orange-700 font-medium",
  typeSelector: "grid grid-cols-1 md:grid-cols-2 gap-6 mb-8",
  typeButton: "group flex flex-col items-center p-8 rounded-2xl border-2 border-gray-100 hover:border-orange-500 transition-all duration-300 cursor-pointer hover:shadow-lg bg-white relative overflow-hidden hover:-translate-y-1",
  typeButtonActive: "group flex flex-col items-center p-8 rounded-2xl border-2 border-orange-500 bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 transition-all duration-300 cursor-pointer shadow-lg relative overflow-hidden -translate-y-1",
  ssoButton: "w-full bg-white text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium border border-gray-200 shadow-sm hover:shadow-md mb-3",
  otherMethodsButton: "w-full bg-gray-100 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium mt-4",
  stepIndicator: "relative mb-12 px-2",
  stepProgress: "absolute top-[14px] left-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 transition-all duration-500 ease-in-out",
  stepBackground: "absolute top-[14px] left-0 h-1 w-full bg-gray-200",
  stepContainer: "relative flex justify-between",
  stepItem: "relative flex flex-col items-center",
  stepNumber: "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-white border-2 border-gray-300 text-gray-500 transition-all duration-300",
  stepNumberActive: "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 border-2 border-orange-500 text-white transition-all duration-300",
  stepNumberCompleted: "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 border-2 border-orange-500 text-white transition-all duration-300",
  stepLabel: "absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm text-gray-500 transition-all duration-300",
  stepLabelActive: "absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm font-medium text-orange-600 transition-all duration-300",
  backButton: "text-sm text-gray-600 hover:text-gray-800 mb-6 flex items-center gap-2",
  benefitsList: "grid grid-cols-1 md:grid-cols-2 gap-4 mt-6",
  benefitItem: "flex items-start gap-3 p-6 bg-white rounded-xl border-2 border-gray-100 hover:border-orange-100 transition-all duration-200 shadow-sm hover:shadow-md",
  benefitIcon: "text-orange-500 w-8 h-8 shrink-0",
  benefitText: "text-gray-700 text-lg",
  error: "bg-red-50 text-red-600 p-4 rounded-lg mb-4 text-sm",
  inputGroup: "space-y-2",
  sectionTitle: "text-xl font-semibold text-gray-800 mb-6",
  divider: "my-8 border-t border-gray-200",
  ageCertificationContainer: "p-4 bg-orange-50 border-2 border-orange-200 rounded-lg mt-6 mb-4",
  ageCertificationLabel: "flex items-center text-base font-medium text-gray-700",
  ageCertificationCheckbox: "w-5 h-5 mr-3 text-orange-500 border-orange-300 rounded focus:ring-orange-500",
  buttonDisabled: "w-full bg-gradient-to-r from-orange-100 via-orange-200 to-orange-100 text-orange-500 py-3 px-6 rounded-lg cursor-not-allowed font-medium text-lg relative group border border-orange-200",
  tooltip: "invisible group-hover:visible absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap after:content-[''] after:absolute after:left-1/2 after:top-full after:-translate-x-1/2 after:border-8 after:border-transparent after:border-t-gray-800",
};

interface FormData {
  [key: string]: string | boolean | undefined;
  email: string;
  password: string;
  confirmPassword: string;
  full_name: string;
  phone: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  educational_institution: string;
  level: string;
  company_name: string;
  company_email: string;
  sector: string;
  tax_number: string;
  contact_name: string;
  contact_person_name: string;
  contact_person_role: string;
  contact_person_email: string;
  contact_person_phone: string;
  address_street: string;
  address_country: string;
  code_postal: string;
  localite: string;
  type: string;
  is_integration_admin: boolean;
  age_certification: boolean;
  study_year: string;
  study_field: string;
}

export default function Login() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [showOtherMethods, setShowOtherMethods] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    phone: "",
    first_name: "",
    last_name: "",
    date_of_birth: "",
    educational_institution: "",
    level: "",
    company_name: "",
    company_email: "",
    sector: "",
    tax_number: "",
    contact_name: "",
    contact_person_name: "",
    contact_person_role: "",
    contact_person_email: "",
    contact_person_phone: "",
    address_street: "",
    address_country: "",
    code_postal: "",
    localite: "",
    type: "",
    is_integration_admin: false,
    age_certification: false,
    study_year: "",
    study_field: ""
  });
  const [error, setError] = useState<string | null>(null);
  const [isOver15, setIsOver15] = useState(false);

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'code_postal') {
      // Ne garder que les chiffres pour le code postal
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: numericValue }));
      return;
    }

    if (name === 'date_of_birth') {
      const age = calculateAge(value);
      setIsOver15(age >= 15);
      if (age < 15) {
        setFormData(prev => ({ ...prev, [name]: value, age_certification: false }));
        return;
      }
    }

    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isLogin) {
      // Vérification de l'âge pour les étudiants
      if (userType === 'student') {
        if (!formData.date_of_birth || !isOver15) {
          setError('Vous devez avoir au moins 15 ans pour vous inscrire.');
          return;
        }
        if (!formData.age_certification) {
          setError('Vous devez certifier avoir au moins 15 ans.');
          return;
        }
      }
      if (!userType) {
        throw new Error('Veuillez sélectionner un type de compte');
      }

      // Validation des champs spécifiques selon le type
      const validationErrors = validateFormByUserType(formData, userType);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join('\n'));
      }

      // Inscription de l'utilisateur
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('Erreur lors de la création du compte');

      // Création du profil avec les champs spécifiques au type
      const profileData = buildProfileData(formData, userType, authData.user.id);

      const { error: profileError } = await supabase
        .from('profiles')
        .insert(profileData);

      if (profileError) throw profileError;
      
      setIsLogin(true);
      resetForm();
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      if (error) throw error;
      router.push('/');
    }
  };

  const handleGuestLogin = async () => {
    try {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      router.push('/');
    } catch (error: any) {
      console.error("Erreur de connexion anonyme:", error.message);
    }
  };

  const handleSSOLogin = async (integrationProvider: IntegrationProvider) => {
    try {
      console.log('Début de la connexion SSO pour:', integrationProvider);
      const config = getProviderConfig(integrationProvider);
      console.log('Configuration chargée:', {
        ...config,
        provider: config.provider,
        type: config.type
      });

      const { data: ssoData, error: ssoError } = await supabase.auth.signInWithOAuth({
        provider: config.provider,
        options: {
          scopes: config.scopes.join(' '),
          redirectTo: `${window.location.origin}${config.authEndpoint}`,
          queryParams: {
            integration_type: config.type,
            ...(config.clientId && { client_id: config.clientId })
          }
        }
      });
      
      console.log('Résultat de la connexion:', { ssoData, error: ssoError });
      
      if (ssoError) throw ssoError;
      router.push('/');
    } catch (error: any) {
      console.error("Erreur détaillée d'authentification SSO:", {
        message: error.message,
        provider: integrationProvider,
        stack: error.stack
      });
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { number: 1 },
      { number: 2 },
      { number: 3 },
      { number: 4 }
    ];

    const progressWidth = ((step - 1) / (steps.length - 1)) * 100;

    return (
      <div className={FORM_STYLES.stepIndicator}>
        <div className={FORM_STYLES.stepBackground} />
        <div 
          className={FORM_STYLES.stepProgress} 
          style={{ width: `${progressWidth}%` }}
        />
        <div className={FORM_STYLES.stepContainer}>
          {steps.map((s, index) => (
            <div key={s.number} className={FORM_STYLES.stepItem}>
              <div 
                className={
                  step > s.number 
                    ? FORM_STYLES.stepNumberCompleted 
                    : step === s.number 
                    ? FORM_STYLES.stepNumberActive 
                    : FORM_STYLES.stepNumber
                }
              >
                {step > s.number ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  s.number
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderBenefits = () => {
    const benefits = {
      student: [
        {
          icon: "👨‍🎓",
          text: "Accès à toutes les offres d'emploi",
          description: "Trouvez le job étudiant idéal parmi toutes nos offres"
        },
        {
          icon: "📋",
          text: "Suivi de vos candidatures",
          description: "Gérez et suivez l'état de vos candidatures facilement"
        },
        {
          icon: "🔔",
          text: "Notifications en temps réel",
          description: "Soyez alerté dès qu'une offre correspond à votre profil"
        },
        {
          icon: "🤝",
          text: "Mise en relation avec des employeurs",
          description: "Échangez directement avec les recruteurs"
        }
      ],
      particulier: [
        {
          icon: "📝",
          text: "Publication d'offres d'emploi",
          description: "Publiez vos offres en quelques clics"
        },
        {
          icon: "📊",
          text: "Gestion des candidatures",
          description: "Suivez et gérez toutes vos candidatures reçues"
        },
        {
          icon: "💬",
          text: "Communication directe",
          description: "Échangez facilement avec les candidats"
        },
        {
          icon: "📱",
          text: "Tableau de bord personnalisé",
          description: "Visualisez toutes vos activités en un coup d'œil"
        }
      ],
      professionnel: [
        {
          icon: "⚡",
          text: "Gestion complète des offres",
          description: "Gérez vos offres d'emploi de A à Z"
        },
        {
          icon: "📈",
          text: "Analytics avancés",
          description: "Suivez la performance de vos recrutements"
        },
        {
          icon: "🔄",
          text: "Intégration API",
          description: "Connectez vos outils RH existants"
        },
        {
          icon: "🎯",
          text: "Support prioritaire",
          description: "Bénéficiez d'une assistance dédiée"
        }
      ],
      etablissement: [
        {
          icon: "👥",
          text: "Gestion multi-utilisateurs",
          description: "Gérez plusieurs comptes administrateurs"
        },
        {
          icon: "🔑",
          text: "Intégration SSO",
          description: "Connexion unique avec vos systèmes"
        },
        {
          icon: "📊",
          text: "Tableau de bord institutionnel",
          description: "Suivez l'activité de votre établissement"
        },
        {
          icon: "💪",
          text: "Support dédié",
          description: "Une équipe dédiée à votre service"
        }
      ]
    };

    return (
      <div className={FORM_STYLES.benefitsList}>
        {benefits[userType as keyof typeof benefits]?.map((benefit, index) => (
          <div key={index} className={FORM_STYLES.benefitItem}>
            <span className="text-2xl" role="img" aria-label="icon">
              {benefit.icon}
            </span>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">{benefit.text}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderFormFields = () => {
    if (isLogin) {
      return (
        <div className="space-y-6">
          <div className={FORM_STYLES.inputGroup}>
            <label className={FORM_STYLES.label}>Email</label>
            <input
              type="email"
              name="email"
              placeholder="votre@email.com"
              value={formData.email}
              onChange={handleChange}
              className={FORM_STYLES.input}
              required
            />
          </div>
          <div className={FORM_STYLES.inputGroup}>
            <label className={FORM_STYLES.label}>Mot de passe</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className={FORM_STYLES.input}
              required
            />
          </div>
          {error && <div className={FORM_STYLES.error}>{error}</div>}
          <button
            type="submit"
            className={FORM_STYLES.button}
          >
            Se connecter
          </button>
          <button
            type="button"
            onClick={() => setShowOtherMethods(!showOtherMethods)}
            className={FORM_STYLES.otherMethodsButton}
          >
            {showOtherMethods ? "← Retour à la connexion classique" : "Autres méthodes de connexion →"}
          </button>
          {showOtherMethods && (
            <div className="space-y-3">
              <button
                type="button"
                className={`${FORM_STYLES.ssoButton} opacity-60 cursor-not-allowed`}
                disabled
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                  </svg>
                  Coming Soon
                </div>
              </button>
              <button
                type="button"
                className={`${FORM_STYLES.ssoButton} opacity-60 cursor-not-allowed`}
                disabled
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M11.4,24H0l11.4-11.4L0,0h11.4l11.4,12L11.4,24z"/>
                  </svg>
                  Coming Soon
                </div>
              </button>
              <button
                type="button"
                onClick={handleGuestLogin}
                className={FORM_STYLES.ssoButton}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M12,20c-4.41,0-8-3.59-8-8s3.59-8,8-8s8,3.59,8,8S16.41,20,12,20z"/>
                  </svg>
                  Continuer en tant qu'invité
                </div>
              </button>
            </div>
          )}
        </div>
      );
    }

    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className={FORM_STYLES.sectionTitle}>Choisissez votre type de compte</h2>
            <div className={FORM_STYLES.typeSelector}>
              {USER_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => {
                    if (!type.disabled) {
                      setUserType(type.id);
                      setStep(2);
                    }
                  }}
                  className={`${
                    type.disabled 
                      ? "opacity-50 cursor-not-allowed" 
                      : userType === type.id 
                      ? FORM_STYLES.typeButtonActive 
                      : FORM_STYLES.typeButton
                  }`}
                  disabled={type.disabled}
                >
                  <div className="text-4xl mb-4 transform transition-transform duration-300 group-hover:scale-110">
                    {type.icon}
                  </div>
                  <div className="font-bold text-xl mb-3 text-gray-800">
                    {type.label}
                  </div>
                  <div className="text-gray-600 text-center">
                    {type.description}
                  </div>
                  {!type.disabled && (
                    <div className={`absolute bottom-0 left-0 w-full h-1 bg-orange-500 transform transition-transform duration-300 ${userType === type.id ? 'scale-x-100' : 'scale-x-0'} group-hover:scale-x-100`} />
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <button 
              onClick={() => setStep(1)} 
              className={FORM_STYLES.backButton}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour
            </button>
            <h2 className={FORM_STYLES.sectionTitle}>Avantages de votre compte</h2>
            {renderBenefits()}
            <button
              onClick={() => setStep(3)}
              className={FORM_STYLES.button}
            >
              Continuer →
            </button>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <button 
              onClick={() => setStep(2)} 
              className={FORM_STYLES.backButton}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour
            </button>
            <h2 className={FORM_STYLES.sectionTitle}>Informations de base</h2>
            <div className={FORM_STYLES.inputGroup}>
              <label className={FORM_STYLES.label}>Email</label>
              <input
                type="email"
                name="email"
                placeholder="votre@email.com"
                value={formData.email}
                onChange={handleChange}
                className={FORM_STYLES.input}
                required
              />
            </div>
            <div className={FORM_STYLES.inputGroup}>
              <label className={FORM_STYLES.label}>Mot de passe</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className={FORM_STYLES.input}
                required
              />
            </div>
            <div className={FORM_STYLES.inputGroup}>
              <label className={FORM_STYLES.label}>Confirmer le mot de passe</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={FORM_STYLES.input}
                required
              />
            </div>
            <div className={FORM_STYLES.inputGroup}>
              <label className={FORM_STYLES.label}>Téléphone</label>
              <PhoneInput
                value={formData.phone}
                onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
                className={FORM_STYLES.input}
                required
              />
            </div>
            {error && <div className={FORM_STYLES.error}>{error}</div>}
            <button
              onClick={() => setStep(4)}
              className={FORM_STYLES.button}
            >
              Continuer →
            </button>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <button 
              onClick={() => setStep(3)} 
              className={FORM_STYLES.backButton}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour
            </button>
            <h2 className={FORM_STYLES.sectionTitle}>Informations spécifiques</h2>
            {userType === 'student' && (
              <>
                <div className={FORM_STYLES.inputGroup}>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Informations personnelles</h3>
                  <div className="space-y-4">
                    <div>
                      <label className={FORM_STYLES.label}>Prénom</label>
                      <input
                        type="text"
                        name="first_name"
                        placeholder="Votre prénom"
                        value={formData.first_name}
                        onChange={handleChange}
                        className={FORM_STYLES.input}
                        required
                      />
                    </div>
                    <div>
                      <label className={FORM_STYLES.label}>Nom</label>
                      <input
                        type="text"
                        name="last_name"
                        placeholder="Votre nom"
                        value={formData.last_name}
                        onChange={handleChange}
                        className={FORM_STYLES.input}
                        required
                      />
                    </div>
                    <div>
                      <label className={FORM_STYLES.label}>Date de naissance</label>
                      <input
                        type="date"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleChange}
                        className={FORM_STYLES.input}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className={FORM_STYLES.inputGroup}>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Adresse</h3>
                  <div className="space-y-4">
                    <div>
                      <label className={FORM_STYLES.label}>Rue et numéro</label>
                      <input
                        type="text"
                        name="address_street"
                        placeholder="Rue et numéro"
                        value={formData.address_street}
                        onChange={handleChange}
                        className={FORM_STYLES.input}
                        required
                      />
                    </div>
                    <div>
                      <label className={FORM_STYLES.label}>Pays</label>
                      <input
                        type="text"
                        name="address_country"
                        placeholder="Pays"
                        value={formData.address_country}
                        onChange={handleChange}
                        className={FORM_STYLES.input}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={FORM_STYLES.label}>Code postal</label>
                        <input
                          type="text"
                          name="code_postal"
                          placeholder="Code postal"
                          value={formData.code_postal}
                          onChange={handleChange}
                          className={FORM_STYLES.input}
                          required
                          maxLength={4}
                          pattern="[0-9]*"
                          inputMode="numeric"
                        />
                      </div>
                      <div>
                        <label className={FORM_STYLES.label}>Localité</label>
                        <input
                          type="text"
                          name="localite"
                          placeholder="Localité"
                          value={formData.localite}
                          onChange={handleChange}
                          className={FORM_STYLES.input}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className={FORM_STYLES.inputGroup}>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Informations académiques</h3>
                  <div className="space-y-4">
                    <div>
                      <label className={FORM_STYLES.label}>Établissement</label>
                      <input
                        type="text"
                        name="educational_institution"
                        placeholder="Nom de votre établissement"
                        value={formData.educational_institution}
                        onChange={handleChange}
                        className={FORM_STYLES.input}
                        required
                      />
                    </div>
                    <div>
                      <label className={FORM_STYLES.label}>Niveau d'études</label>
                      <input
                        type="text"
                        name="level"
                        placeholder="Votre niveau d'études"
                        value={formData.level}
                        onChange={handleChange}
                        className={FORM_STYLES.input}
                        required
                      />
                    </div>
                    <div>
                      <label className={FORM_STYLES.label}>Année d'études</label>
                      <input
                        type="text"
                        name="study_year"
                        placeholder="Votre année d'études"
                        value={formData.study_year}
                        onChange={handleChange}
                        className={FORM_STYLES.input}
                        required
                      />
                    </div>
                    <div>
                      <label className={FORM_STYLES.label}>Domaine d'études</label>
                      <input
                        type="text"
                        name="study_field"
                        placeholder="Votre domaine d'études"
                        value={formData.study_field}
                        onChange={handleChange}
                        className={FORM_STYLES.input}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className={FORM_STYLES.ageCertificationContainer}>
                  <label className={`${FORM_STYLES.ageCertificationLabel} ${!isOver15 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <input
                      type="checkbox"
                      name="age_certification"
                      checked={formData.age_certification}
                      onChange={handleChange}
                      className={FORM_STYLES.ageCertificationCheckbox}
                      disabled={!isOver15}
                    />
                    Je certifie avoir au moins 15 ans
                  </label>
                </div>

                {error && <div className={FORM_STYLES.error}>{error}</div>}
                <button
                  type="submit"
                  className={`${FORM_STYLES.button} ${(!isOver15 || !formData.age_certification) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!isOver15 || !formData.age_certification}
                >
                  {(!isOver15 || !formData.age_certification) ? 'Veuillez confirmer votre âge' : "S'inscrire"}
                </button>
              </>
            )}
            {userType === 'professionnel' && (
              <>
                <div className={FORM_STYLES.inputGroup}>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Informations de l'entreprise</h3>
                  <div className="space-y-4">
                    <div>
                      <label className={FORM_STYLES.label}>Nom de l'entreprise</label>
                      <input
                        type="text"
                        name="company_name"
                        placeholder="Nom de votre entreprise"
                        value={formData.company_name}
                        onChange={handleChange}
                        className={FORM_STYLES.input}
                        required
                      />
                    </div>
                    <div>
                      <label className={FORM_STYLES.label}>Email général de l'entreprise</label>
                      <input
                        type="email"
                        name="company_email"
                        placeholder="contact@entreprise.com"
                        value={formData.company_email}
                        onChange={handleChange}
                        className={FORM_STYLES.input}
                        required
                      />
                    </div>
                    <div>
                      <label className={FORM_STYLES.label}>Secteur d'activité</label>
                      <input
                        type="text"
                        name="sector"
                        placeholder="Ex: Technologies, Construction, etc."
                        value={formData.sector}
                        onChange={handleChange}
                        className={FORM_STYLES.input}
                        required
                      />
                    </div>
                    <div>
                      <label className={FORM_STYLES.label}>Numéro de TVA</label>
                      <input
                        type="text"
                        name="tax_number"
                        placeholder="BE0123456789"
                        value={formData.tax_number}
                        onChange={handleChange}
                        className={FORM_STYLES.input}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className={FORM_STYLES.inputGroup}>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Informations de contact</h3>
                  <div className="space-y-4">
                    <div>
                      <label className={FORM_STYLES.label}>Nom du contact principal</label>
                      <input
                        type="text"
                        name="contact_name"
                        placeholder="Nom du responsable principal"
                        value={formData.contact_name}
                        onChange={handleChange}
                        className={FORM_STYLES.input}
                        required
                      />
                    </div>
                    <div>
                      <label className={FORM_STYLES.label}>Nom de la personne à contacter</label>
                      <input
                        type="text"
                        name="contact_person_name"
                        placeholder="Nom de la personne à contacter"
                        value={formData.contact_person_name}
                        onChange={handleChange}
                        className={FORM_STYLES.input}
                        required
                      />
                    </div>
                    <div>
                      <label className={FORM_STYLES.label}>Rôle / Fonction</label>
                      <input
                        type="text"
                        name="contact_person_role"
                        placeholder="Ex: Responsable RH, Directeur, etc."
                        value={formData.contact_person_role}
                        onChange={handleChange}
                        className={FORM_STYLES.input}
                        required
                      />
                    </div>
                    <div>
                      <label className={FORM_STYLES.label}>Email du contact</label>
                      <input
                        type="email"
                        name="contact_person_email"
                        placeholder="contact@email.com"
                        value={formData.contact_person_email}
                        onChange={handleChange}
                        className={FORM_STYLES.input}
                        required
                      />
                    </div>
                    <div>
                      <label className={FORM_STYLES.label}>Téléphone du contact</label>
                      <PhoneInput
                        value={formData.contact_person_phone}
                        onChange={(value) => setFormData(prev => ({ ...prev, contact_person_phone: value }))}
                        className={FORM_STYLES.input}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className={FORM_STYLES.inputGroup}>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Adresse de l'entreprise</h3>
                  <div className="space-y-4">
                    <div>
                      <label className={FORM_STYLES.label}>Rue et numéro</label>
                      <input
                        type="text"
                        name="address_street"
                        placeholder="Rue et numéro"
                        value={formData.address_street}
                        onChange={handleChange}
                        className={FORM_STYLES.input}
                        required
                      />
                    </div>
                    <div>
                      <label className={FORM_STYLES.label}>Pays</label>
                      <input
                        type="text"
                        name="address_country"
                        placeholder="Pays"
                        value={formData.address_country}
                        onChange={handleChange}
                        className={FORM_STYLES.input}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={FORM_STYLES.label}>Code postal</label>
                        <input
                          type="text"
                          name="code_postal"
                          placeholder="Code postal"
                          value={formData.code_postal}
                          onChange={handleChange}
                          className={FORM_STYLES.input}
                          required
                          maxLength={4}
                          pattern="[0-9]*"
                          inputMode="numeric"
                        />
                      </div>
                      <div>
                        <label className={FORM_STYLES.label}>Localité</label>
                        <input
                          type="text"
                          name="localite"
                          placeholder="Localité"
                          value={formData.localite}
                          onChange={handleChange}
                          className={FORM_STYLES.input}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {error && <div className={FORM_STYLES.error}>{error}</div>}
                <button
                  type="submit"
                  className={FORM_STYLES.button}
                >
                  S'inscrire
                </button>
              </>
            )}
            {userType === 'particulier' && (
              <>
                <div className={FORM_STYLES.inputGroup}>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Informations personnelles</h3>
                  <div className="space-y-4">
                    <div>
                      <label className={FORM_STYLES.label}>Prénom</label>
                      <input
                        type="text"
                        name="first_name"
                        placeholder="Votre prénom"
                        value={formData.first_name}
                        onChange={handleChange}
                        className={FORM_STYLES.input}
                        required
                      />
                    </div>
                    <div>
                      <label className={FORM_STYLES.label}>Nom</label>
                      <input
                        type="text"
                        name="last_name"
                        placeholder="Votre nom"
                        value={formData.last_name}
                        onChange={handleChange}
                        className={FORM_STYLES.input}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className={FORM_STYLES.inputGroup}>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Adresse</h3>
                  <div className="space-y-4">
                    <div>
                      <label className={FORM_STYLES.label}>Rue et numéro</label>
                      <input
                        type="text"
                        name="address_street"
                        placeholder="Rue et numéro"
                        value={formData.address_street}
                        onChange={handleChange}
                        className={FORM_STYLES.input}
                        required
                      />
                    </div>
                    <div>
                      <label className={FORM_STYLES.label}>Pays</label>
                      <input
                        type="text"
                        name="address_country"
                        placeholder="Pays"
                        value={formData.address_country}
                        onChange={handleChange}
                        className={FORM_STYLES.input}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={FORM_STYLES.label}>Code postal</label>
                        <input
                          type="text"
                          name="code_postal"
                          placeholder="Code postal"
                          value={formData.code_postal}
                          onChange={handleChange}
                          className={FORM_STYLES.input}
                          required
                          maxLength={4}
                          pattern="[0-9]*"
                          inputMode="numeric"
                        />
                      </div>
                      <div>
                        <label className={FORM_STYLES.label}>Localité</label>
                        <input
                          type="text"
                          name="localite"
                          placeholder="Localité"
                          value={formData.localite}
                          onChange={handleChange}
                          className={FORM_STYLES.input}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {error && <div className={FORM_STYLES.error}>{error}</div>}
                <button
                  type="submit"
                  className={FORM_STYLES.button}
                >
                  S'inscrire
                </button>
              </>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      full_name: "",
      phone: "",
      first_name: "",
      last_name: "",
      date_of_birth: "",
      educational_institution: "",
      level: "",
      company_name: "",
      company_email: "",
      sector: "",
      tax_number: "",
      contact_name: "",
      contact_person_name: "",
      contact_person_role: "",
      contact_person_email: "",
      contact_person_phone: "",
      address_street: "",
      address_country: "",
      code_postal: "",
      localite: "",
      type: "",
      is_integration_admin: false,
      age_certification: false,
      study_year: "",
      study_field: ""
    });
    setUserType(null);
    setError(null);
  };

  return (
    <div className={FORM_STYLES.container}>
      <div className={FORM_STYLES.card}>
        <h2 className={FORM_STYLES.title}>
          {isLogin ? "Connexion" : "Inscription"}
        </h2>
        
        {!isLogin && renderStepIndicator()}
        
        <form onSubmit={handleAuth} className={FORM_STYLES.formGroup}>
          {renderFormFields()}

          <p className="text-center text-sm text-gray-900">
            {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setUserType(null);
                setStep(1);
              }}
              className={FORM_STYLES.link}
            >
              {isLogin ? "S'inscrire" : "Se connecter"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
