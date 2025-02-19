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
  link: "ml-1 text-green-400 hover:text-green-500"
};

export default function Login() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    userType: "student",
    full_name: "",
    bio: "",
    avatar_url: "",
    code_postal: "",
    localite: "",
  });

  const handleChange = ({ target: { name, value } }: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword(formData);
        if (error) throw error;
        router.push('/');
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Les mots de passe ne correspondent pas');
        }
        
        const response = await fetch('http://localhost:8000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            userType: formData.userType,
            full_name: formData.full_name,
            bio: formData.bio,
            avatar_url: formData.avatar_url,
            code_postal: formData.code_postal,
            localite: formData.localite
          })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Erreur lors de l\'inscription');
        setIsLogin(true);
      }
    } catch (error: any) {
      console.error("Erreur:", error.message);
      // Ajouter une notification d'erreur ici
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
      { id: 'bio', label: 'Biographie', type: 'textarea' },
      { id: 'avatar_url', label: 'URL de l\'avatar', type: 'url' },
      { id: 'code_postal', label: 'Code postal', type: 'text' },
      { id: 'localite', label: 'Localité', type: 'text' }
    ] : [])
  ];

  return (
    <div className={FORM_STYLES.container}>
      <div className={FORM_STYLES.card}>
        <h2 className={FORM_STYLES.title}>
          {isLogin ? "Connexion" : "Inscription"}
        </h2>
        
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

          {!isLogin && (
            <div>
              <label htmlFor="userType" className={FORM_STYLES.label}>
                Type de compte
              </label>
              <select
                id="userType"
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                className={FORM_STYLES.input}
                required
              >
                <option value="student">Étudiant</option>
                <option value="employer">Employeur</option>
              </select>
            </div>
          )}

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
              onClick={() => setIsLogin(!isLogin)}
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
