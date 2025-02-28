'use client';

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from '@/components/Navbar';
import categoriesData from '@/data/categories.json';

type Categories = {
  [key: string]: string[];
};

type Job = {
  id: string;
  title: string;
  description: string;
  location: string;
  salary: number;
  status: string;
  created_at: string;
  employer: {
    full_name: string;
  };
  category: string | null;
  subcategory: string | null;
};

export default function Jobs() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isEmployer, setIsEmployer] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [filters, setFilters] = useState({
    location: "",
    minSalary: "",
    status: "open",
    category: "",
    subcategory: ""
  });
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [categories] = useState<Categories>(categoriesData.categories);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login');
  };

  const fetchJobs = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    let query = supabase
      .from('jobs')
      .select(`
        *,
        employer:profiles!jobs_employer_id_fkey(full_name)
      `)
      .eq('is_open', true);

    // Si l'utilisateur est connecté, vérifier son type
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('type')
        .eq('id', user.id)
        .single();

      // Si c'est un employeur, montrer uniquement ses annonces
      if (profile?.type === 'employer') {
        setIsEmployer(true);
        query = query.eq('employer_id', user.id);
      }
    }

    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }

    if (filters.minSalary) {
      query = query.gte('salary', parseFloat(filters.minSalary));
    }

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.subcategory) {
      query = query.eq('subcategory', filters.subcategory);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Erreur lors de la récupération des offres:", error);
      return;
    }

    setJobs(data);
  };

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  useEffect(() => {
    const getProfile = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      setUserProfile(profile);
    };
    
    if (user) getProfile();
  }, [user]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleJobClick = (jobId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }
    router.push(`/jobs/${jobId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      <Navbar 
        user={user}
        userProfile={userProfile}
        handleSignOut={handleSignOut}
      />

      <div className="max-w-7xl mx-auto p-6 mt-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{isEmployer ? "Mes offres d'emploi" : "Offres d'emploi"}</h1>
          {isEmployer && (
            <button
              onClick={() => router.push('/jobs/create')}
              className="bg-[#3bee5e] text-white px-4 py-2 rounded hover:bg-[#32d951] transition-colors"
            >
              Publier une offre
            </button>
          )}
        </div>

        <div className="bg-white p-4 rounded shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <input
              type="text"
              name="location"
              placeholder="Filtrer par lieu"
              value={filters.location}
              onChange={handleFilterChange}
              className="p-2 border rounded text-black"
            />
            <input
              type="number"
              name="minSalary"
              placeholder="Salaire minimum"
              value={filters.minSalary}
              onChange={handleFilterChange}
              className="p-2 border rounded text-black"
            />
            <select
              name="category"
              value={filters.category}
              onChange={(e) => {
                handleFilterChange(e);
                setSelectedCategory(e.target.value);
                setFilters(prev => ({ ...prev, subcategory: "" }));
              }}
              className="p-2 border rounded text-black"
            >
              <option value="">Toutes les catégories</option>
              {Object.keys(categories).map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {filters.category && (
              <select
                name="subcategory"
                value={filters.subcategory}
                onChange={handleFilterChange}
                className="p-2 border rounded text-black"
              >
                <option value="">Toutes les sous-catégories</option>
                {categories[filters.category]?.map(subcategory => (
                  <option key={subcategory} value={subcategory}>
                    {subcategory}
                  </option>
                ))}
              </select>
            )}

            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="p-2 border rounded text-black"
            >
              <option value="open">Offres ouvertes</option>
              <option value="closed">Offres fermées</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map(job => (
            <div key={job.id} className="bg-white p-6 rounded shadow">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-semibold">{job.title}</h2>
                <div className="flex gap-2">
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">
                    {job.category}
                  </span>
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">
                    {job.subcategory}
                  </span>
                </div>
              </div>
              <p className="text-gray-600 mb-4">{job.employer.full_name}</p>
              <p className="text-gray-800 mb-4 line-clamp-3">{job.description}</p>
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>{job.location}</span>
                <span>{job.salary}€</span>
              </div>
              <button
                onClick={() => {
                  if (!user?.email) {
                    if (confirm("Vous devez être connecté pour voir les détails de l'offre. Souhaitez-vous vous connecter ?")) {
                      router.push('/login');
                    }
                  } else {
                    handleJobClick(job.id);
                  }
                }}
                className="mt-4 w-full bg-[#3bee5e] text-white py-2 rounded hover:bg-[#32d951] transition-colors"
              >
                {user?.email ? "Voir les détails" : "Se connecter pour voir les détails"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}