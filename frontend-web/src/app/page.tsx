'use client';

import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userType, setUserType] = useState<string>('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('type')
          .eq('id', user.id)
          .single();
        if (profile) {
          setUserType(profile.type);
        }
      }
    };

    getUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Image 
                src="/logo.svg"
                alt="StuJob Logo"
                width={120}
                height={40}
                priority
              />
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="bg-[#3bee5e] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#32d951] transition-colors"
                  >
                    {user.email.split('@')[0]}
                  </button>
                  
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                      <a
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Mon Profil
                      </a>
                      <a
                        href="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Paramètres
                      </a>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Se déconnecter
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <a 
                    href="/login"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Se connecter
                  </a>
                  <a
                    href="/login" 
                    className="bg-[#3bee5e] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#32d951] transition-colors"
                  >
                    S'inscrire
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            {userType === 'employer' ? (
              <>
                <span className="block">Trouvez vos futurs talents</span>
                <span className="block text-[#3bee5e]">avec StuJob</span>
              </>
            ) : (
              <>
                <span className="block">Trouvez votre stage étudiant</span>
                <span className="block text-[#3bee5e]">avec StuJob</span>
              </>
            )}
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-600 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            {userType === 'employer' ? 
              "La plateforme qui vous connecte aux meilleurs étudiants pour vos stages et emplois." :
              "La plateforme qui connecte les étudiants aux meilleures opportunités de stages."}
          </p>
          
          <div className="mt-10">
            {userType === 'employer' ? (
              <div className="flex justify-center">
                <a
                  href="/jobs/create"
                  className="bg-[#3bee5e] text-white px-8 py-4 rounded-md text-lg font-medium hover:bg-[#32d951] transition-colors shadow-lg transform hover:scale-105 transition-transform"
                >
                  Publier votre première annonce gratuitement
                </a>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6">
                <div className="bg-white p-4 shadow-lg rounded-lg max-w-2xl mx-auto border border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input
                      type="text"
                      placeholder="Stage, entreprise ou secteur"
                      className="flex-1 p-3 bg-gray-50 text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#3bee5e] focus:border-transparent placeholder-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="Ville ou région"
                      className="flex-1 p-3 bg-gray-50 text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#3bee5e] focus:border-transparent placeholder-gray-400"
                    />
                    <button className="bg-[#3bee5e] text-white px-6 py-3 rounded-md hover:bg-[#32d951] transition-colors">
                      Rechercher
                    </button>
                  </div>
                </div>
                <a
                  href="/jobs"
                  className="bg-white text-[#3bee5e] border-2 border-[#3bee5e] px-8 py-4 rounded-md text-lg font-medium hover:bg-[#3bee5e] hover:text-white transition-colors shadow-lg transform hover:scale-105"
                >
                  Voir toutes les offres disponibles
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <div className="text-[#3bee5e] text-2xl mb-4">✨</div>
              <h3 className="text-lg font-medium text-gray-900">
                {userType === 'employer' ? "Candidats Qualifiés" : "Stages Pertinents"}
              </h3>
              <p className="mt-2 text-gray-600">
                {userType === 'employer' ? 
                  "Accédez à une base de données d'étudiants motivés et qualifiés." :
                  "Des opportunités de stages adaptées à votre formation et vos aspirations."}
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <div className="text-[#3bee5e] text-2xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-900">Recherche Simplifiée</h3>
              <p className="mt-2 text-gray-600">
                {userType === 'employer' ?
                  "Trouvez rapidement les profils qui correspondent à vos besoins." :
                  "Une interface intuitive pour trouver facilement le stage idéal."}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <div className="text-[#3bee5e] text-2xl mb-4">🚀</div>
              <h3 className="text-lg font-medium text-gray-900">
                {userType === 'employer' ? "Recrutement Efficace" : "Expérience Enrichissante"}
              </h3>
              <p className="mt-2 text-gray-600">
                {userType === 'employer' ?
                  "Des outils performants pour un processus de recrutement optimisé." :
                  "Des stages qui vous permettront d'acquérir une expérience professionnelle valorisante."}
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white text-gray-900 mt-20 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-sm font-semibold mb-4 text-[#3bee5e]">À propos</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-[#3bee5e] text-sm transition-colors">Qui sommes-nous</a></li>
                <li><a href="#" className="text-gray-600 hover:text-[#3bee5e] text-sm transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4 text-[#3bee5e]">Ressources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-[#3bee5e] text-sm transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-600 hover:text-[#3bee5e] text-sm transition-colors">
                  {userType === 'employer' ? "Guide recrutement" : "Guide stages"}
                </a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4 text-[#3bee5e]">Légal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-[#3bee5e] text-sm transition-colors">Confidentialité</a></li>
                <li><a href="#" className="text-gray-600 hover:text-[#3bee5e] text-sm transition-colors">CGU</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4 text-[#3bee5e]">Suivez-nous</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-[#3bee5e] text-sm transition-colors">LinkedIn</a></li>
                <li><a href="#" className="text-gray-600 hover:text-[#3bee5e] text-sm transition-colors">Twitter</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
