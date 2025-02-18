'use client';

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
};

export default function Jobs() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isEmployer, setIsEmployer] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [filters, setFilters] = useState({
    location: "",
    minSalary: "",
    status: "open"
  });

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
      .eq('status', 'open');

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

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div>
      <nav className="bg-white shadow-lg fixed top-0 w-full z-10">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              name="location"
              placeholder="Filtrer par lieu"
              value={filters.location}
              onChange={handleFilterChange}
              className="p-2 border rounded"
            />
            <input
              type="number"
              name="minSalary"
              placeholder="Salaire minimum"
              value={filters.minSalary}
              onChange={handleFilterChange}
              className="p-2 border rounded"
            />
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="p-2 border rounded"
            >
              <option value="open">Offres ouvertes</option>
              <option value="closed">Offres fermées</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map(job => (
            <div key={job.id} className="bg-white p-6 rounded shadow">
              <h2 className="text-xl font-semibold mb-2">{job.title}</h2>
              <p className="text-gray-600 mb-4">{job.employer.full_name}</p>
              <p className="text-gray-800 mb-4 line-clamp-3">{job.description}</p>
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>{job.location}</span>
                <span>{job.salary}€</span>
              </div>
              <button
                onClick={() => router.push(`/jobs/${job.id}`)}
                className="mt-4 w-full bg-[#3bee5e] text-white py-2 rounded hover:bg-[#32d951] transition-colors"
              >
                Voir les détails
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}