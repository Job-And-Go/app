'use client';

import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from '@/components/Navbar';
import Notification from '@/components/Notification';
import Layout from '@/components/Layout';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userType, setUserType] = useState<string>('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setUserProfile(profile);
        if (profile) {
          setUserType(profile.type);
        }
      }
    };

    getProfile();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              {(() => {
                switch(userType) {
                  case 'student':
                    return (
                      <>
                        <span className="block">Trouvez votre stage idéal</span>
                        <span className="block text-theme-primary">et lancez votre carrière</span>
                      </>
                    );
                  case 'particulier':
                    return (
                      <>
                        <span className="block">Publiez vos annonces</span>
                        <span className="block text-theme-primary">en toute simplicité</span>
                      </>
                    );
                  case 'professionnel':
                    return (
                      <>
                        <span className="block">Recrutez vos talents</span>
                        <span className="block text-theme-primary">de demain</span>
                      </>
                    );
                  case 'etablissement':
                    return (
                      <>
                        <span className="block">Gérez vos étudiants</span>
                        <span className="block text-theme-primary">et leurs stages</span>
                      </>
                    );
                  default:
                    return (
                      <>
                        <span className="block">Bienvenue sur StuJob</span>
                        <span className="block text-theme-primary">La plateforme qui connecte les talents</span>
                      </>
                    );
                }
              })()}
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-600 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              {(() => {
                switch(userType) {
                  case 'student':
                    return "Accédez aux meilleures opportunités de stages et construisez votre avenir professionnel.";
                  case 'particulier':
                    return "Publiez vos offres d'emploi ponctuelles et trouvez rapidement les candidats idéaux.";
                  case 'professionnel':
                    return "Gérez efficacement vos recrutements et trouvez les meilleurs talents pour votre entreprise.";
                  case 'etablissement':
                    return "Suivez le parcours de vos étudiants et développez vos relations avec les entreprises.";
                  default:
                    return "La plateforme qui connecte étudiants, particuliers, entreprises et établissements.";
                }
              })()}
            </p>
            
            <div className="mt-10">
              {(() => {
                switch(userType) {
                  case 'student':
                    return (
                      <div className="flex flex-col items-center gap-6">
                        <div className="bg-white p-4 shadow-lg rounded-lg max-w-2xl mx-auto border border-gray-200">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <input
                              type="text"
                              placeholder="Stage, entreprise ou secteur"
                              className="flex-1 p-3 bg-gray-50 text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-theme-primary focus:border-transparent placeholder-gray-400"
                            />
                            <input
                              type="text"
                              placeholder="Ville ou région"
                              className="flex-1 p-3 bg-gray-50 text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-theme-primary focus:border-transparent placeholder-gray-400"
                            />
                            <button className="bg-theme-primary text-white px-6 py-3 rounded-md hover:bg-theme-hover transition-colors">
                              Rechercher
                            </button>
                          </div>
                        </div>
                        <a
                          href="/jobs"
                          className="bg-white text-theme-primary border-2 border-theme-primary px-8 py-4 rounded-md text-lg font-medium hover:bg-theme-primary hover:text-white transition-colors shadow-lg transform hover:scale-105"
                        >
                          Voir toutes les offres de stage
                        </a>
                      </div>
                    );
                  case 'particulier':
                    return (
                      <div className="flex justify-center">
                        <a
                          href="/jobs/create"
                          className="bg-theme-primary text-white px-8 py-4 rounded-md text-lg font-medium hover:bg-theme-hover transition-colors shadow-lg transform hover:scale-105 transition-transform"
                        >
                          Publier une annonce
                        </a>
                      </div>
                    );
                  case 'professionnel':
                    return (
                      <div className="flex justify-center space-x-4">
                        <a
                          href="/jobs/create"
                          className="bg-theme-primary text-white px-8 py-4 rounded-md text-lg font-medium hover:bg-theme-hover transition-colors shadow-lg transform hover:scale-105 transition-transform"
                        >
                          Publier une offre
                        </a>
                        <a
                          href="/cv-database"
                          className="bg-white text-theme-primary border-2 border-theme-primary px-8 py-4 rounded-md text-lg font-medium hover:bg-theme-primary hover:text-white transition-colors shadow-lg transform hover:scale-105"
                        >
                          Accéder à la CVthèque
                        </a>
                      </div>
                    );
                  case 'etablissement':
                    return (
                      <div className="flex justify-center space-x-4">
                        <a
                          href="/students"
                          className="bg-theme-primary text-white px-8 py-4 rounded-md text-lg font-medium hover:bg-theme-hover transition-colors shadow-lg transform hover:scale-105 transition-transform"
                        >
                          Gérer mes étudiants
                        </a>
                        <a
                          href="/integration"
                          className="bg-white text-theme-primary border-2 border-theme-primary px-8 py-4 rounded-md text-lg font-medium hover:bg-theme-primary hover:text-white transition-colors shadow-lg transform hover:scale-105"
                        >
                          Configurer l'API
                        </a>
                      </div>
                    );
                  default:
                    return (
                      <div className="flex justify-center">
                        <a
                          href="/login"
                          className="bg-theme-primary text-white px-8 py-4 rounded-md text-lg font-medium hover:bg-theme-hover transition-colors shadow-lg transform hover:scale-105 transition-transform"
                        >
                          Commencer maintenant
                        </a>
                      </div>
                    );
                }
              })()}
            </div>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {(() => {
                const features = {
                  student: [
                    {
                      icon: "✨",
                      title: "Stages Pertinents",
                      description: "Des opportunités de stages adaptées à votre formation et vos aspirations."
                    },
                    {
                      icon: "🔍",
                      title: "Recherche Simplifiée",
                      description: "Une interface intuitive pour trouver facilement le stage idéal."
                    },
                    {
                      icon: "🚀",
                      title: "Suivi de Candidatures",
                      description: "Gérez et suivez toutes vos candidatures en un seul endroit."
                    }
                  ],
                  particulier: [
                    {
                      icon: "✨",
                      title: "Publication Simple",
                      description: "Publiez vos annonces rapidement et sans complications."
                    },
                    {
                      icon: "🔍",
                      title: "Gestion des Candidatures",
                      description: "Recevez et gérez les candidatures efficacement."
                    },
                    {
                      icon: "🚀",
                      title: "Tarifs Avantageux",
                      description: "Des prix adaptés pour les recrutements ponctuels."
                    }
                  ],
                  professionnel: [
                    {
                      icon: "✨",
                      title: "Recrutement Efficace",
                      description: "Des outils performants pour optimiser votre processus de recrutement."
                    },
                    {
                      icon: "🔍",
                      title: "CVthèque Complète",
                      description: "Accédez à une base de données de candidats qualifiés."
                    },
                    {
                      icon: "🚀",
                      title: "Gestion Multi-offres",
                      description: "Gérez toutes vos offres d'emploi depuis une interface unique."
                    }
                  ],
                  etablissement: [
                    {
                      icon: "✨",
                      title: "Suivi des Étudiants",
                      description: "Suivez le parcours et les stages de vos étudiants en temps réel."
                    },
                    {
                      icon: "🔍",
                      title: "API Complète",
                      description: "Intégrez nos services à votre système d'information existant."
                    },
                    {
                      icon: "🚀",
                      title: "Relations Entreprises",
                      description: "Développez votre réseau d'entreprises partenaires."
                    }
                  ],
                  default: [
                    {
                      icon: "✨",
                      title: "Pour Tous",
                      description: "Une solution adaptée à chaque profil d'utilisateur."
                    },
                    {
                      icon: "🔍",
                      title: "Simple et Efficace",
                      description: "Une plateforme intuitive pour tous vos besoins."
                    },
                    {
                      icon: "🚀",
                      title: "Toujours Disponible",
                      description: "Un support réactif pour vous accompagner."
                    }
                  ]
                };

                const currentFeatures = features[userType as keyof typeof features] || features.default;

                return currentFeatures.map((feature, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                    <div className="text-theme-primary text-2xl mb-4">{feature.icon}</div>
                    <h3 className="text-lg font-medium text-gray-900">{feature.title}</h3>
                    <p className="mt-2 text-gray-600">{feature.description}</p>
                  </div>
                ));
              })()}
            </div>
          </div>
        </main>

        <footer className="bg-white text-gray-900 mt-20 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <h4 className="text-sm font-semibold mb-4 text-theme-primary">À propos</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-600 hover:text-theme-hover text-sm transition-colors">Qui sommes-nous</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-theme-hover text-sm transition-colors">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-4 text-theme-primary">Ressources</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-600 hover:text-theme-hover text-sm transition-colors">Blog</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-theme-hover text-sm transition-colors">
                    {userType === 'employer' ? "Guide recrutement" : "Guide stages"}
                  </a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-4 text-theme-primary">Légal</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-600 hover:text-theme-hover text-sm transition-colors">Confidentialité</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-theme-hover text-sm transition-colors">CGU</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-4 text-theme-primary">Suivez-nous</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-600 hover:text-theme-hover text-sm transition-colors">LinkedIn</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-theme-hover text-sm transition-colors">Twitter</a></li>
                </ul>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Layout>
  );
}
