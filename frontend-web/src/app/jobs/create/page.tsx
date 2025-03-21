'use client';

import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from '@/components/Layout';
import LocationSearch from '@/components/LocationSearch';
import categoriesData from '@/data/categories.json';
import Navbar from '@/components/Navbar';

type Categories = {
  [key: string]: string[];
};

export default function CreateJob() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<{
    id: string;
    type: string;
    full_name: string;
    avatar_url: string;
  } | null>(null);
  const [categories] = useState<Categories>(categoriesData.categories);
  const [jobData, setJobData] = useState({
    title: "",
    description: "", 
    location: "",
    salary: "",
    category: "",
    subcategory: "",
    max_applications: "",
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        
        setUser(user);
        
        if (user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (profileError) throw profileError;
          setUserProfile(profile);

          // Vérifier le type d'utilisateur
          if (profile && profile.type === 'student') {
            router.push('/'); // Rediriger les étudiants vers la page d'accueil
            return;
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du profil:", error);
        router.push('/login');
      }
    };
    fetchUserProfile();
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setJobData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'category' ? { subcategory: '' } : {})
    }));
  };

  const handleLocationSelect = (location: string) => {
    setJobData(prev => ({
      ...prev,
      location: location
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      if (!profileData || (profileData.type !== 'particulier' && profileData.type !== 'professionnel')) {
        throw new Error('Seuls les particuliers et les professionnels peuvent publier des annonces');
      }

      const { error: insertError } = await supabase
        .from('jobs')
        .insert({
          employer_id: user.id,
          title: jobData.title.trim(),
          description: jobData.description.trim(),
          location: jobData.location.trim(),
          salary: parseFloat(jobData.salary),
          is_open: true,
          created_at: new Date().toISOString(),
          category: jobData.category,
          subcategory: jobData.subcategory,
          max_applications: jobData.max_applications ? parseInt(jobData.max_applications) : null,
          accepted_applications: 0
        });

      if (insertError) throw insertError;

      router.push('/jobs');
    } catch (error) {
      console.error("Erreur lors de la création de l'annonce:", error);
      // Ici vous pourriez ajouter une notification d'erreur pour l'utilisateur
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar 
        user={user}
        userProfile={userProfile}
        handleSignOut={handleSignOut}
      />
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6 text-black">Publier une nouvelle offre</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-black">Titre du poste</label>
            <input
              type="text"
              name="title"
              value={jobData.title}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-theme-primary text-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-black">Description</label>
            <textarea
              name="description"
              value={jobData.description}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-theme-primary h-32 text-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-black">Catégorie</label>
            <select
              name="category"
              value={jobData.category}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-theme-primary text-black"
              required
            >
              <option value="">Sélectionnez une catégorie</option>
              {Object.keys(categories).map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {jobData.category && (
            <div>
              <label className="block text-sm font-medium mb-2 text-black">Sous-catégorie</label>
              <select
                name="subcategory"
                value={jobData.subcategory}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-theme-primary text-black"
                required
              >
                <option value="">Sélectionnez une sous-catégorie</option>
                {categories[jobData.category]?.map(subcategory => (
                  <option key={subcategory} value={subcategory}>
                    {subcategory}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2 text-black">Localisation</label>
            <LocationSearch onSelect={handleLocationSelect} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-black">Salaire</label>
            <input
              type="number"
              name="salary"
              value={jobData.salary}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-theme-primary text-black"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-black">
              Nombre maximum de candidatures acceptées
            </label>
            <input
              type="number"
              name="max_applications"
              value={jobData.max_applications}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-theme-primary text-black"
              min="1"
              placeholder="Laissez vide pour illimité"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-theme-primary text-white py-2 px-4 rounded hover:bg-theme-hover transition-colors"
          >
            Publier l'offre
          </button>
        </form>
      </div>
    </div>
  );
}