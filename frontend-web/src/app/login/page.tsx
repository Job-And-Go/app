'use client';

import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<{
    email: string;
    password: string;
  }>({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isLogin) {
        // Connexion existante
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;
        
        console.log("Connexion réussie:", data);
        router.push('/');
      } else {
        // Nouvelle inscription via l'API backend
        const response = await fetch('http://localhost:8000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message);
        }

        console.log("Inscription réussie");
        setIsLogin(true); // Basculer vers le formulaire de connexion
      }
    } catch (error) {
      console.error("Erreur:", error);
      // Ici vous pouvez ajouter une notification d'erreur pour l'utilisateur
    }
  };

  const handleGuestLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      
      if (error) {
        console.error(error);
        return;
      }

      if (data) {
        console.log("Connexion anonyme réussie:", data);
        router.push('/'); // Redirection vers la page d'accueil
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#3bee5e] to-[#ffffff] flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">
          {isLogin ? "Connexion" : "Inscription"}
        </h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-900">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3bee5e] focus:ring-[#3bee5e]"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-900">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3bee5e] focus:ring-[#3bee5e]"
            />
          </div>

          <button
            onClick={handleAuth}
            className="w-full bg-[#3bee5e] text-white py-2 px-4 rounded-md hover:bg-[#32d951] transition-colors"
          >
            {isLogin ? "Se connecter" : "S'inscrire"}
          </button>

          <button
            onClick={handleGuestLogin}
            className="w-full bg-[#3bee5e] text-white py-2 px-4 rounded-md hover:bg-[#32d951] transition-colors"
          >
            Continuer en tant qu'invité
          </button>

          <p className="text-center text-sm text-gray-900">
            {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="ml-1 text-[#3bee5e] hover:text-[#32d951]"
            >
              {isLogin ? "S'inscrire" : "Se connecter"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
