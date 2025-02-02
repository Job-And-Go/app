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

  const handleAuth = async () => {
    try {
      if (isLogin) {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          console.error(error);
          return;
        }

        if (data) {
          console.log("Connexion réussie:", data);
          router.push('/'); // Redirection vers la page d'accueil
        }
      } else {
        // Signup
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          console.error(error);
          return;
        }

        if (data) {
          console.log("Inscription réussie:", data);
          setIsLogin(true); // Basculer vers le formulaire de connexion
        }
      }
    } catch (error) {
      console.error(error);
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
    <div className="min-h-screen bg-gradient-to-b from-[#2C2C2C] to-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-[#2C2C2C]">
          {isLogin ? "Connexion" : "Inscription"}
        </h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#2C2C2C]">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF7043] focus:ring-[#FF7043]"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#2C2C2C]">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF7043] focus:ring-[#FF7043]"
            />
          </div>

          <button
            onClick={handleAuth}
            className="w-full bg-[#FF7043] text-white py-2 px-4 rounded-md hover:bg-[#FF5722] transition-colors"
          >
            {isLogin ? "Se connecter" : "S'inscrire"}
          </button>

          <button
            onClick={handleGuestLogin}
            className="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
          >
            Continuer en tant qu'invité
          </button>

          <p className="text-center text-sm text-[#2C2C2C]">
            {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="ml-1 text-[#FF7043] hover:text-[#FF5722]"
            >
              {isLogin ? "S'inscrire" : "Se connecter"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
