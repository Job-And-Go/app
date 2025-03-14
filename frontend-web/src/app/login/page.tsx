'use client';

import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { IntegrationProvider, INTEGRATION_CONFIGS, getProviderConfig } from '@/config/integration';
import { validateFormByUserType, buildProfileData } from '@/utils/profileValidation';
import { USER_TYPES } from '@/constants/userTypes';

const FORM_STYLES = {
  container: "min-h-screen bg-gradient-to-b from-green-400 to-white flex items-center justify-center",
  card: "bg-white p-8 rounded-lg shadow-xl w-[500px]",
  title: "text-2xl font-bold mb-6 text-center text-black",
  formGroup: "space-y-4",
  label: "block text-sm font-medium text-black",
  input: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-400 focus:ring-green-400 text-black",
  button: "w-full bg-green-400 text-white py-2 px-4 rounded-md hover:bg-green-500 transition-colors",
  link: "ml-1 text-green-400 hover:text-green-500",
  typeSelector: "grid grid-cols-2 gap-4 mb-6",
  typeButton: "p-4 rounded-lg border-2 border-gray-200 hover:border-green-400 transition-all cursor-pointer text-center",
  typeButtonActive: "p-4 rounded-lg border-2 border-green-400 bg-green-50 transition-all cursor-pointer text-center",
  progressBar: "w-full h-2 bg-gray-200 rounded-full mb-6",
  progressStep: "h-full bg-green-400 rounded-full transition-all duration-300",
  stepTitle: "text-lg font-semibold mb-4 text-black",
  stepDescription: "text-sm text-gray-600 mb-6",
  backButton: "text-gray-600 hover:text-gray-800 flex items-center gap-2 mb-4",
  ssoButton: "w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors mb-2",
  otherMethodsButton: "w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors mt-4",
  featureList: "space-y-3 my-6",
  featureItem: "flex items-start space-x-3",
  featureIcon: "flex-shrink-0 h-5 w-5 text-green-500",
  featureText: "text-sm text-gray-600",
  infoCard: "bg-gray-50 p-4 rounded-lg mb-6",
  infoTitle: "font-medium text-gray-900 mb-2",
  infoText: "text-sm text-gray-600"
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
  educational_institution: string;
  level: string;
  company_name: string;
  contact_name: string;
  tax_number: string;
  sector: string;
  contact_person_name: string;
  contact_person_email: string;
  contact_person_phone: string;
  contact_preference: string;
  address_street: string;
  address_city: string;
  address_postal_code: string;
  address_country: string;
  type: string;
  is_integration_admin: boolean;
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
    educational_institution: "",
    level: "",
    company_name: "",
    contact_name: "",
    tax_number: "",
    sector: "",
    contact_person_name: "",
    contact_person_email: "",
    contact_person_phone: "",
    contact_preference: "",
    address_street: "",
    address_city: "",
    address_postal_code: "",
    address_country: "",
    type: "",
    is_integration_admin: false
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 5;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      if (isLogin) {
        while (retryCount < MAX_RETRIES) {
          const { error } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });
          
          if (!error) {
            router.push('/');
            break;
          }

          if (error.message.includes("rate limit") || error.message.includes("Too many requests")) {
            const waitTime = Math.pow(2, retryCount + 1) * 1000; // Backoff exponentiel: 2s, 4s, 8s, 16s, 32s
            setError(`Trop de tentatives. Nouvelle tentative dans ${waitTime/1000} secondes...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            setRetryCount(prev => prev + 1);
            continue;
          }

          throw error;
        }

        if (retryCount >= MAX_RETRIES) {
          throw new Error("Trop de tentatives. Veuillez réessayer dans quelques minutes.");
        }
      } else {
        if (!userType) {
          throw new Error('Veuillez sélectionner un type de compte');
        }

        const validationErrors = validateFormByUserType(formData, userType);
        if (validationErrors.length > 0) {
          throw new Error(validationErrors.join('\n'));
        }

        while (retryCount < MAX_RETRIES) {
          const { data: authData, error: signUpError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
          });

          if (!signUpError && authData.user) {
            const profileData = buildProfileData(formData, userType, authData.user.id);
            const { error: profileError } = await supabase
              .from('profiles')
              .insert(profileData);

            if (!profileError) {
              setIsLogin(true);
              resetForm();
              break;
            }

            if (profileError.message.includes("rate limit") || profileError.message.includes("Too many requests")) {
              const waitTime = Math.pow(2, retryCount + 1) * 1000;
              setError(`Trop de tentatives. Nouvelle tentative dans ${waitTime/1000} secondes...`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
              setRetryCount(prev => prev + 1);
              continue;
            }

            throw profileError;
          }

          if (signUpError) {
            if (signUpError.message.includes("rate limit") || signUpError.message.includes("Too many requests")) {
              const waitTime = Math.pow(2, retryCount + 1) * 1000;
              setError(`Trop de tentatives. Nouvelle tentative dans ${waitTime/1000} secondes...`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
              setRetryCount(prev => prev + 1);
              continue;
            }
            throw signUpError;
          }
        }

        if (retryCount >= MAX_RETRIES) {
          throw new Error("Trop de tentatives. Veuillez réessayer dans quelques minutes.");
        }
      }
    } catch (error: any) {
      console.error("Erreur:", error.message);
      setError(error.message);
    } finally {
      setIsLoading(false);
      if (!error) {
        setRetryCount(0);
      }
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
      const config = getProviderConfig(integrationProvider);
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
      
      if (ssoError) throw ssoError;
      router.push('/');
    } catch (error: any) {
      console.error("Erreur d'authentification SSO:", error.message);
    }
  };

  const getProgress = () => {
    if (step === 1) return 25;
    if (step === 2) return 50;
    if (step === 3) return 75;
    return 100;
  };

  const renderAccountTypeInfo = () => {
    const typeInfo = {
      student: {
        title: "Compte Étudiant",
        description: "Un compte adapté aux étudiants en recherche d'opportunités",
        features: [
          "Créez et personnalisez votre CV en ligne",
          "Postulez aux offres de stage et d'emploi",
          "Suivez vos candidatures en temps réel",
          "Connectez-vous avec des établissements et des professionnels"
        ]
      },
      particulier: {
        title: "Compte Particulier",
        description: "Pour les personnes souhaitant poster des annonces ponctuelles à tarifs avantageux",
        features: [
          "Créez votre profil professionnel personnalisé",
          "Accédez à toutes les offres d'emploi",
          "Gérez vos candidatures facilement",
          "Échangez avec les recruteurs directement"
        ]
      },
      professionnel: {
        title: "Compte Professionnel",
        description: "Idéal pour les entreprises et les recruteurs",
        features: [
          "Publiez des offres d'emploi illimitées",
          "Gérez vos campagnes de recrutement",
          "Accédez à la CVthèque",
          "Communiquez directement avec les candidats"
        ]
      },
      etablissement: {
        title: "Compte Établissement",
        description: "Destiné aux écoles et centres de formation avec intégration complète de votre système d'information via notre API",
        features: [
          "Synchronisez automatiquement les données de vos étudiants",
          "API REST complète pour une intégration dans vos outils existants",
          "Webhooks personnalisables pour des mises à jour en temps réel",
          "Tableau de bord analytique avec export des données"
        ]
      }
    };

    const info = typeInfo[userType as keyof typeof typeInfo];

    return (
      <div>
        <div className={FORM_STYLES.infoCard}>
          <h3 className={FORM_STYLES.infoTitle}>{info.title}</h3>
          <p className={FORM_STYLES.infoText}>{info.description}</p>
        </div>

        <h4 className={FORM_STYLES.stepTitle}>Fonctionnalités disponibles</h4>
        <div className={FORM_STYLES.featureList}>
          {info.features.map((feature, index) => (
            <div key={index} className={FORM_STYLES.featureItem}>
              <svg className={FORM_STYLES.featureIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className={FORM_STYLES.featureText}>{feature}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFormFields = () => {
    if (isLogin) {
      return (
        <div className="space-y-4">
          <div>
            <label className={FORM_STYLES.label}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={FORM_STYLES.input}
              required
            />
          </div>
          <div>
            <label className={FORM_STYLES.label}>Mot de passe</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={FORM_STYLES.input}
              required
            />
          </div>
        </div>
      );
    }

    if (step === 1) {
      return (
        <div>
          <div className={FORM_STYLES.progressBar}>
            <div className={FORM_STYLES.progressStep} style={{ width: `${getProgress()}%` }} />
          </div>
          <h2 className={FORM_STYLES.stepTitle}>Choisissez votre type de compte</h2>
          <p className={FORM_STYLES.stepDescription}>
            Sélectionnez le type de compte qui correspond le mieux à votre profil
          </p>
          <div className={FORM_STYLES.typeSelector}>
            {USER_TYPES.map(type => (
              <button
                key={type.id}
                onClick={() => {
                  setUserType(type.id);
                  setStep(2);
                  setFormData(prev => ({ ...prev, type: type.id }));
                }}
                className={`${userType === type.id ? FORM_STYLES.typeButtonActive : FORM_STYLES.typeButton}`}
              >
                <div className="text-2xl mb-2">{type.icon}</div>
                <div className="font-semibold text-black">{type.label}</div>
                <div className="text-sm text-gray-600 mt-2">{type.description}</div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (step === 2) {
      return (
        <div>
          <div className={FORM_STYLES.progressBar}>
            <div className={FORM_STYLES.progressStep} style={{ width: `${getProgress()}%` }} />
          </div>
          
          <button 
            onClick={() => setStep(1)} 
            className={FORM_STYLES.backButton}
          >
            ← Retour
          </button>

          <h2 className={FORM_STYLES.stepTitle}>
            Découvrez votre futur compte
          </h2>
          <p className={FORM_STYLES.stepDescription}>
            Voici ce que vous pourrez faire avec votre compte
          </p>

          {renderAccountTypeInfo()}

          <button
            type="button"
            onClick={() => setStep(3)}
            className={FORM_STYLES.button}
          >
            Continuer l'inscription
          </button>
        </div>
      );
    }

    const commonFields = [
      { id: 'email', label: 'Email', type: 'email', required: true },
      { id: 'password', label: 'Mot de passe', type: 'password', required: true },
      { id: 'confirmPassword', label: 'Confirmer le mot de passe', type: 'password', required: true }
    ];

    const typeSpecificFields = {
      student: [
        { id: 'first_name', label: 'Prénom', type: 'text', required: true },
        { id: 'last_name', label: 'Nom', type: 'text', required: true },
        { id: 'educational_institution', label: 'Établissement', type: 'text', required: true },
        { id: 'level', label: 'Niveau d\'études', type: 'text', required: true }
      ],
      particulier: [
        { id: 'first_name', label: 'Prénom', type: 'text', required: true },
        { id: 'last_name', label: 'Nom', type: 'text', required: true }
      ],
      professionnel: [
        { id: 'full_name', label: 'Nom public', type: 'text', required: true },
        { id: 'company_name', label: 'Dénomination sociale', type: 'text', required: true },
        { id: 'tax_number', label: 'Numéro de TVA', type: 'text', required: true },
        { id: 'sector', label: 'Secteur d\'activité', type: 'text', required: true }
      ],
      etablissement: [
        { id: 'full_name', label: 'Nom public', type: 'text', required: true },
        { id: 'company_name', label: 'Dénomination sociale', type: 'text', required: true },
        { id: 'tax_number', label: 'Numéro de TVA', type: 'text', required: true },
        { id: 'contact_person_name', label: 'Nom du contact', type: 'text', required: true },
        { id: 'contact_person_email', label: 'Email du contact', type: 'email', required: true },
        { id: 'contact_person_phone', label: 'Téléphone du contact', type: 'tel', required: true }
      ]
    };

    const currentFields = step === 3 ? commonFields : typeSpecificFields[userType as keyof typeof typeSpecificFields] || [];

    return (
      <div>
        <div className={FORM_STYLES.progressBar}>
          <div className={FORM_STYLES.progressStep} style={{ width: `${getProgress()}%` }} />
        </div>
        
        <button 
          onClick={() => setStep(step - 1)} 
          className={FORM_STYLES.backButton}
        >
          ← Retour
        </button>

        <h2 className={FORM_STYLES.stepTitle}>
          {step === 3 ? "Informations de connexion" : "Informations personnelles"}
        </h2>
        <p className={FORM_STYLES.stepDescription}>
          {step === 3 
            ? "Créez vos identifiants de connexion" 
            : "Complétez votre profil avec vos informations personnelles"}
        </p>

        <div className="space-y-4">
          {currentFields.map(field => (
            <div key={field.id}>
              <label className={FORM_STYLES.label}>
                {field.label}
              </label>
              <input
                type={field.type}
                name={field.id}
                value={formData[field.id as keyof typeof formData] as string}
                onChange={handleChange}
                className={FORM_STYLES.input}
                required={field.required}
              />
            </div>
          ))}

          {step === 3 && (
            <button
              type="button"
              onClick={() => setStep(4)}
              className={FORM_STYLES.button}
            >
              Continuer
            </button>
          )}

          {step === 4 && (
            <button type="submit" className={FORM_STYLES.button}>
              S'inscrire
            </button>
          )}
        </div>
      </div>
    );
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
      educational_institution: "",
      level: "",
      company_name: "",
      contact_name: "",
      tax_number: "",
      sector: "",
      contact_person_name: "",
      contact_person_email: "",
      contact_person_phone: "",
      contact_preference: "",
      address_street: "",
      address_city: "",
      address_postal_code: "",
      address_country: "",
      type: "",
      is_integration_admin: false
    });
    setUserType(null);
    setError(null);
  };

  const renderSubmitButton = () => {
    const buttonText = isLogin ? "Se connecter" : "S'inscrire";
    const loadingText = isLogin ? "Connexion..." : "Inscription...";
    
    return (
      <button 
        type="submit" 
        className={`${FORM_STYLES.button} ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
        disabled={isLoading}
      >
        {isLoading ? loadingText : buttonText}
      </button>
    );
  };

  return (
    <div className={FORM_STYLES.container}>
      <div className={FORM_STYLES.card}>
        <h2 className={FORM_STYLES.title}>
          {isLogin ? "Connexion" : "Inscription"}
        </h2>
        
        {!showOtherMethods ? (
          <>
            <form onSubmit={handleAuth} className={FORM_STYLES.formGroup}>
              {renderFormFields()}

              {!isLogin && userType === 'employer' && (
                <div className="mt-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="is_integration_admin"
                      checked={formData.is_integration_admin}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_integration_admin: e.target.checked }))}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-black">Activer le mode admin ?</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Le mode admin vous permettra d'intégrer l'application sur vos différentes plateformes (site web, intranet, applications mobiles, etc.). 
                    <a href="/admin_mode_information" className="text-green-500 hover:text-green-600">En savoir plus sur le mode admin</a>
                  </p>
                </div>
              )}

              {isLogin ? (
                <>
                  {renderSubmitButton()}
                  <p className="text-center text-sm text-black">
                    Pas encore de compte ?
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(false);
                        setUserType(null);
                        setStep(1);
                        setError(null);
                        setRetryCount(0);
                      }}
                      className={FORM_STYLES.link}
                    >
                      S'inscrire
                    </button>
                  </p>
                </>
              ) : (
                <>
                  {(step === 1 || step === 4) && (
                    <p className="text-center text-sm text-black">
                      Déjà un compte ?
                      <button
                        type="button"
                        onClick={() => {
                          setIsLogin(true);
                          setUserType(null);
                          setError(null);
                          setRetryCount(0);
                        }}
                        className={FORM_STYLES.link}
                      >
                        Se connecter
                      </button>
                    </p>
                  )}
                  {step === 4 && renderSubmitButton()}
                </>
              )}
            </form>

            <button
              type="button"
              onClick={() => setShowOtherMethods(true)}
              className={FORM_STYLES.otherMethodsButton}
            >
              Autres méthodes de connexion
            </button>
          </>
        ) : (
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleGuestLogin}
              className={FORM_STYLES.ssoButton}
            >
              Continuer en tant qu'invité
            </button>

            {Object.entries(INTEGRATION_CONFIGS).map(([key, config]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleSSOLogin(key as IntegrationProvider)}
                className={FORM_STYLES.ssoButton}
              >
                Se connecter avec {config.name}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setShowOtherMethods(false)}
              className={FORM_STYLES.otherMethodsButton}
            >
              Retour à la connexion classique
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
