'use client';

import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { IntegrationProvider, INTEGRATION_CONFIGS, getProviderConfig } from '@/config/integration';
import { validateFormByUserType, buildProfileData } from '@/utils/profileValidation';
import { USER_TYPES } from '@/constants/userTypes';

const FORM_STYLES = {
  container: "min-h-screen bg-gradient-to-b from-green-400 to-white flex items-center justify-center",
  card: "bg-white p-8 rounded-lg shadow-xl w-96",
  title: "text-2xl font-bold mb-6 text-center text-gray-900",
  formGroup: "space-y-4",
  label: "block text-sm font-medium text-gray-900",
  input: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-400 focus:ring-green-400 text-black",
  button: "w-full bg-green-400 text-white py-2 px-4 rounded-md hover:bg-green-500 transition-colors",
  link: "ml-1 text-green-400 hover:text-green-500",
  typeSelector: "flex gap-4 mb-6",
  typeButton: "flex-1 p-4 rounded-lg border-2 border-gray-200 hover:border-green-400 transition-all cursor-pointer",
  typeButtonActive: "flex-1 p-4 rounded-lg border-2 border-green-400 bg-green-50 transition-all cursor-pointer",
  ssoButton: "w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors mb-2",
  otherMethodsButton: "w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors mt-4"
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
    // Champs communs
    full_name: "",
    phone: "",
    // Champs étudiant
    first_name: "",
    last_name: "",
    educational_institution: "",
    level: "",
    // Champs professionnel
    company_name: "",
    contact_name: "",
    tax_number: "",
    sector: "",
    // Champs établissement
    contact_person_name: "",
    contact_person_email: "",
    contact_person_phone: "",
    // Champs particulier
    contact_preference: "",
    address_street: "",
    address_city: "",
    address_postal_code: "",
    address_country: "",
    type: "",
    is_integration_admin: false
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        router.push('/');
      } else {
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
      }
    } catch (error: any) {
      console.error("Erreur:", error.message);
      setError(error.message);
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

  const renderFormFields = () => {
    if (step === 1) {
      return (
        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-4">Choisissez votre type de compte</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {USER_TYPES.map(type => (
              <button
                key={type.id}
                onClick={() => {
                  setUserType(type.id);
                  setStep(2);
                }}
                className={`p-4 border rounded-lg text-left hover:border-green-500 transition-colors
                  ${userType === type.id ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
              >
                <div className="text-2xl mb-2">{type.icon}</div>
                <div className="font-semibold">{type.label}</div>
                <div className="text-sm text-gray-600">{type.description}</div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    const commonFields = [
      { id: 'email', label: 'Email', type: 'email' },
      { id: 'password', label: 'Mot de passe', type: 'password' },
      { id: 'confirmPassword', label: 'Confirmer le mot de passe', type: 'password' },
      { id: 'phone', label: 'Téléphone', type: 'tel' }
    ];

    const typeSpecificFields = {
      student: [
        { id: 'first_name', label: 'Prénom', type: 'text' },
        { id: 'last_name', label: 'Nom', type: 'text' },
        { id: 'educational_institution', label: 'Établissement', type: 'text' },
        { id: 'level', label: 'Niveau d\'études', type: 'text' }
      ],
      particulier: [
        { id: 'first_name', label: 'Prénom', type: 'text' },
        { id: 'last_name', label: 'Nom', type: 'text' },
        { id: 'contact_preference', label: 'Préférence de contact', type: 'text' }
      ],
      professionnel: [
        { id: 'full_name', label: 'Nom complet', type: 'text' },
        { id: 'company_name', label: 'Nom de l\'entreprise', type: 'text' },
        { id: 'tax_number', label: 'Numéro de TVA', type: 'text' },
        { id: 'sector', label: 'Secteur d\'activité', type: 'text' }
      ],
      etablissement: [
        { id: 'full_name', label: 'Nom complet', type: 'text' },
        { id: 'company_name', label: 'Nom de l\'établissement', type: 'text' },
        { id: 'contact_person_name', label: 'Nom du contact', type: 'text' },
        { id: 'contact_person_email', label: 'Email du contact', type: 'email' }
      ]
    };

    return (
      <div className="space-y-4">
        <button 
          onClick={() => setStep(1)} 
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          ← Retour au choix du type de compte
        </button>
        
        {commonFields.concat(typeSpecificFields[userType as keyof typeof typeSpecificFields] || [])
          .map(field => (
            <div key={field.id}>
              <label className="block text-sm font-medium text-gray-700">
                {field.label}
              </label>
              <input
                type={field.type}
                name={field.id}
                value={formData[field.id as keyof typeof formData] as string}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              />
            </div>
          ))}
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

  return (
    <div className={FORM_STYLES.container}>
      <div className={FORM_STYLES.card}>
        <h2 className={FORM_STYLES.title}>
          {isLogin ? "Connexion" : "Inscription"}
        </h2>
        
        {!isLogin && renderFormFields()}
        
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
                <span className="text-sm text-gray-700">Activer le mode admin ?</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Le mode admin vous permettra d'intégrer l'application sur vos différentes plateformes (site web, intranet, applications mobiles, etc.). 
                <a href="/admin_mode_information" className="text-green-500 hover:text-green-600">En savoir plus sur le mode admin</a>
              </p>
            </div>
          )}

          <button type="submit" className={FORM_STYLES.button}>
            {isLogin ? "Se connecter" : "S'inscrire"}
          </button>

          <p className="text-center text-sm text-gray-900">
            {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setUserType(null);
              }}
              className={FORM_STYLES.link}
            >
              {isLogin ? "S'inscrire" : "Se connecter"}
            </button>
          </p>
        </form>

        <button
          type="button"
          onClick={() => setShowOtherMethods(false)}
          className={FORM_STYLES.otherMethodsButton}
        >
          Retour à la connexion classique
        </button>
      </div>
    </div>
  );
}
