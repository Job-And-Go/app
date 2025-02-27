'use client';

import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { useRouter } from 'next/navigation';

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
  typeButtonActive: "flex-1 p-4 rounded-lg border-2 border-green-400 bg-green-50 transition-all cursor-pointer"
};

export default function Login() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState<'student' | 'employer' | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    type: ""
  });

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
          password: formData.password
        });
        if (error) throw error;
        router.push('/');
      } else {
        if (!userType) {
          throw new Error('Veuillez sélectionner un type de compte');
        }
        
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Les mots de passe ne correspondent pas');
        }
        
        if (!formData.email || !formData.password || !userType || !formData.full_name) {
          throw new Error('Tous les champs sont requis');
        }

        // Inscription de l'utilisateur
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

        if (signUpError) throw signUpError;
        if (!authData.user) throw new Error('Erreur lors de la création du compte');

        // Création du profil dans la table profiles
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            full_name: formData.full_name,
            type: userType,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (profileError) throw profileError;
        
        // Redirection vers la page de connexion
        setIsLogin(true);
        setFormData({
          ...formData,
          confirmPassword: '',
          type: ''
        });
        setUserType(null);
      }
    } catch (error: any) {
      console.error("Erreur:", error.message);
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

  const formFields = [
    { id: 'email', label: 'Email', type: 'email' },
    { id: 'password', label: 'Mot de passe', type: 'password' },
    ...((!isLogin) ? [
      { id: 'confirmPassword', label: 'Confirmer le mot de passe', type: 'password' },
      { id: 'full_name', label: 'Nom complet', type: 'text' },
    ] : [])
  ];

  return (
    <div className={FORM_STYLES.container}>
      <div className={FORM_STYLES.card}>
        <h2 className={FORM_STYLES.title}>
          {isLogin ? "Connexion" : "Inscription"}
        </h2>
        
        {!isLogin && (
          <div className={FORM_STYLES.typeSelector}>
            <div 
              className={userType === 'student' ? FORM_STYLES.typeButtonActive : FORM_STYLES.typeButton}
              onClick={() => setUserType('student')}
            >
              <h3 className="text-lg font-semibold text-center">Étudiant</h3>
              <p className="text-sm text-gray-600 text-center mt-2">Je cherche un job étudiant</p>
            </div>
            <div 
              className={userType === 'employer' ? FORM_STYLES.typeButtonActive : FORM_STYLES.typeButton}
              onClick={() => setUserType('employer')}
            >
              <h3 className="text-lg font-semibold text-center">Employeur</h3>
              <p className="text-sm text-gray-600 text-center mt-2">Je propose des jobs</p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleAuth} className={FORM_STYLES.formGroup}>
          {formFields.map(({ id, label, type }) => (
            <div key={id}>
              <label htmlFor={id} className={FORM_STYLES.label}>
                {label}
              </label>
              {type === 'textarea' ? (
                <textarea
                  id={id}
                  name={id}
                  value={formData[id as keyof typeof formData]}
                  onChange={handleChange}
                  className={FORM_STYLES.input}
                  required
                />
              ) : (
                <input
                  type={type}
                  id={id}
                  name={id}
                  value={formData[id as keyof typeof formData]}
                  onChange={handleChange}
                  className={FORM_STYLES.input}
                  required
                />
              )}
            </div>
          ))}

          <button type="submit" className={FORM_STYLES.button}>
            {isLogin ? "Se connecter" : "S'inscrire"}
          </button>

          <button
            type="button"
            onClick={handleGuestLogin}
            className={FORM_STYLES.button}
          >
            Continuer en tant qu'invité
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
      </div>
    </div>
  );
}
