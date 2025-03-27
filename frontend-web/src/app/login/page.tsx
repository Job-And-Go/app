'use client';

import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
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
  benefitsContainer: "bg-white rounded-2xl p-8 shadow-sm border border-gray-100",
  benefitsHeader: "text-center mb-10",
  benefitsTitle: "text-2xl font-semibold text-gray-800 mb-2",
  benefitsDescription: "text-gray-500",
  benefitsList: "space-y-5",
  benefitItem: "flex items-start gap-3 py-3 px-1 transition-all duration-200 hover:translate-x-1",
  benefitCheck: "text-green-500 flex-shrink-0 w-5 h-5 mt-0.5",
  benefitContent: "flex-grow",
  benefitItemTitle: "text-gray-800 font-medium",
  benefitItemText: "text-gray-500 text-sm",
  error: "bg-red-50 text-red-600 p-4 rounded-lg mb-4 text-sm",
  inputGroup: "space-y-2",
  sectionTitle: "text-xl font-semibold text-gray-800 mb-6",
  divider: "my-8 border-t border-gray-200",
  ageCertificationContainer: "p-4 bg-orange-50 border-2 border-orange-200 rounded-lg mt-6 mb-4",
  ageCertificationLabel: "flex items-center text-base font-medium text-gray-700",
  ageCertificationCheckbox: "w-5 h-5 mr-3 text-orange-500 border-orange-300 rounded focus:ring-orange-500",
  buttonDisabled: "w-full bg-gradient-to-r from-orange-100 via-orange-200 to-orange-100 text-orange-500 py-3 px-6 rounded-lg cursor-not-allowed font-medium text-lg relative group border border-orange-200",
  tooltip: "invisible group-hover:visible absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap after:content-[''] after:absolute after:left-1/2 after:top-full after:-translate-x-1/2 after:border-8 after:border-transparent after:border-t-gray-800",
  continueButton: "mt-8 w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 px-8 rounded-xl font-medium text-lg transition-all duration-300 hover:opacity-90 flex items-center justify-center gap-2",
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

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && !user.is_anonymous) {
        router.push('/');
      }
    };
    
    checkAuth();
  }, [router]);

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

    try {
      if (isLogin) {
        // Connexion
        const response = await fetch('/api/auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            action: 'signin',
            userType: userType
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          if (data.error === 'Invalid login credentials') {
            throw new Error('Email ou mot de passe incorrect');
          } else if (data.error === 'Email not confirmed') {
            throw new Error('Veuillez confirmer votre email avant de vous connecter');
          } else {
            throw new Error(data.error || 'Erreur lors de la connexion');
          }
        }

        router.push('/');
      } else {
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

        // Vérification de la correspondance des mots de passe
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Les mots de passe ne correspondent pas');
        }

        // Inscription via l'API Route sécurisée
        const response = await fetch('/api/auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            action: 'signup'
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          if (data.error === 'User already registered') {
            throw new Error('Un compte existe déjà avec cet email');
          } else if (data.error === 'Invalid email') {
            throw new Error('Format d\'email invalide');
          } else if (data.error === 'Password too weak') {
            throw new Error('Le mot de passe doit contenir au moins 6 caractères');
          } else {
            throw new Error(data.error || 'Erreur lors de l\'inscription');
          }
        }

        // Création du profil avec les champs spécifiques au type
        const profileData = buildProfileData(formData, userType, data.user.id);

        const { error: profileError } = await supabase
          .from('profiles')
          .insert(profileData);

        if (profileError) {
          if (profileError.code === '23505') {
            throw new Error('Un profil existe déjà avec cet email');
          } else {
            throw profileError;
          }
        }
        
        setIsLogin(true);
        resetForm();
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Une erreur inattendue est survenue');
      }
    }
  };

  const handleGuestLogin = async () => {
    try {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      router.push('/');
    } catch (error: any) {
      setError("Erreur lors de la connexion en tant qu'invité");
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
      { number: 3 }
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
          title: "Trouvez le job étudiant idéal",
          text: "Accédez aux offres correspondant à votre profil"
        },
        {
          title: "Gérez vos candidatures",
          text: "Suivez leur statut en temps réel"
        },
        {
          title: "Restez informé",
          text: "Recevez des alertes personnalisées"
        },
        {
          title: "Échangez directement",
          text: "Communiquez avec les employeurs"
        }
      ],
      particulier: [
        {
          title: "Publiez facilement",
          text: "Créez vos offres en quelques clics"
        },
        {
          title: "Gérez les candidatures",
          text: "Suivez les postulations reçues"
        },
        {
          title: "Contactez les étudiants",
          text: "Échangez avec les candidats"
        },
        {
          title: "Pilotez vos recrutements",
          text: "Visualisez toute votre activité"
        }
      ],
      professionnel: [
        {
          title: "Gérez plusieurs offres",
          text: "Administrez tous vos recrutements"
        },
        {
          title: "Analysez vos performances",
          text: "Suivez des statistiques détaillées"
        },
        {
          title: "Intégrez vos outils",
          text: "Connectez vos systèmes RH"
        },
        {
          title: "Profitez d'un support dédié",
          text: "Bénéficiez d'une assistance prioritaire"
        }
      ],
      etablissement: [
        {
          title: "Gérez plusieurs comptes",
          text: "Administrez vos utilisateurs"
        },
        {
          title: "Connectez vos systèmes",
          text: "Intégration SSO disponible"
        },
        {
          title: "Supervisez l'activité",
          text: "Tableau de bord centralisé"
        },
        {
          title: "Support personnalisé",
          text: "Accompagnement sur mesure"
        }
      ]
    };

    return (
      <div className={FORM_STYLES.benefitsContainer}>
        <div className={FORM_STYLES.benefitsHeader}>
          <h3 className={FORM_STYLES.benefitsTitle}>
            Ce que vous pourrez faire
          </h3>
          <p className={FORM_STYLES.benefitsDescription}>
            Votre compte vous donne accès à ces fonctionnalités
          </p>
        </div>
        <div className={FORM_STYLES.benefitsList}>
          {benefits[userType as keyof typeof benefits]?.map((benefit, index) => (
            <div key={index} className={FORM_STYLES.benefitItem}>
              <svg 
                className={FORM_STYLES.benefitCheck}
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <div className={FORM_STYLES.benefitContent}>
                <h4 className={FORM_STYLES.benefitItemTitle}>
                  {benefit.title}
                </h4>
                <p className={FORM_STYLES.benefitItemText}>
                  {benefit.text}
                </p>
              </div>
            </div>
          ))}
        </div>
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
            onClick={handleGuestLogin}
            className={`${FORM_STYLES.ssoButton} bg-orange-50 hover:bg-orange-100 border-orange-200`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 text-orange-500" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M12,20c-4.41,0-8-3.59-8-8s3.59-8,8-8s8,3.59,8,8S16.41,20,12,20z"/>
              </svg>
              Continuer en tant qu'invité
            </div>
          </button>
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
          <div className="space-y-8">
            <button 
              onClick={() => setStep(1)} 
              className={FORM_STYLES.backButton}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour
            </button>
            {renderBenefits()}
            <button
              onClick={() => setStep(3)}
              className={FORM_STYLES.continueButton}
            >
              Continuer l'inscription
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
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
            <h2 className={FORM_STYLES.sectionTitle}>Informations essentielles</h2>

            {userType === 'professionnel' && (
              <div className={FORM_STYLES.inputGroup}>
                <label className={FORM_STYLES.label}>Nom de l'entreprise</label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  className={FORM_STYLES.input}
                  required
                />
              </div>
            )}

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

            {(userType === 'student' || userType === 'particulier') && (
              <>
                <div className={FORM_STYLES.inputGroup}>
                  <label className={FORM_STYLES.label}>Prénom</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className={FORM_STYLES.input}
                    required
                  />
                </div>
                <div className={FORM_STYLES.inputGroup}>
                  <label className={FORM_STYLES.label}>Nom</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className={FORM_STYLES.input}
                    required
                  />
                </div>
              </>
            )}

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

            {userType === 'student' && (
              <>
                <div className={FORM_STYLES.inputGroup}>
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
              </>
            )}

            {error && <div className={FORM_STYLES.error}>{error}</div>}
            <button
              type="submit"
              className={`${FORM_STYLES.button} ${(userType === 'student' && (!isOver15 || !formData.age_certification)) ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={userType === 'student' && (!isOver15 || !formData.age_certification)}
            >
              {userType === 'student' && (!isOver15 || !formData.age_certification) ? 'Veuillez confirmer votre âge' : "Créer mon compte"}
            </button>

            <div className="mt-6 p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
              <h3 className="text-lg font-semibold text-orange-800">Note importante</h3>
              <p className="text-orange-700 mt-2">
                Vous pourrez compléter votre profil après l'inscription pour :
              </p>
              <ul className="mt-2 space-y-1 text-orange-700">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Personnaliser votre expérience
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Accéder à toutes les fonctionnalités
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Augmenter vos chances de réussite
                </li>
              </ul>
            </div>
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
