'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import JobsSidebar from '@/components/JobsSidebar';
import Image from 'next/image';
import { FiMapPin, FiClock } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

// Types
interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  salary: number;
  category: string;
  subcategory: string;
  created_at: string;
  employer: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
  status: 'open' | 'closed';
}

export default function JobsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: '',
    minSalary: '',
    category: '',
    subcategory: '',
    status: 'open',
    sortBy: 'recent'
  });

  // Catégories (à remplacer par les vraies données)
  const categories: Record<string, string[]> = {
    'Transport': ['Livraison', 'Déménagement'],
    'Bricolage': ['Peinture simple', 'Montage de meubles'],
    'Jardinage': ['Tonte', 'Taille de haies'],
    'Ménage': ['Nettoyage', 'Repassage'],
    'Cours particuliers': ['Mathématiques', 'Langues'],
    'Petsitting': ['Garde de chiens', 'Garde de chats'],
    'Aide administrative': ['Comptabilité', 'Secrétariat'],
    'Événements': ['Service', 'Animation'],
    'Informatique': ['Dépannage', 'Formation'],
    'Réseaux sociaux': ['Community management', 'Création de contenu'],
    'Développement': ['Sites web', 'Applications mobiles'],
    'Design': ['Graphisme', 'UI/UX'],
    'Marketing': ['SEO', 'Publicité']
  };

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        setUserProfile(profile);
      }
    };

    getUser();
  }, []);

  useEffect(() => {
    if (userProfile) {  // Seulement si userProfile est chargé
      fetchJobs();
    }
  }, [userProfile, filters]);  // Ajout de userProfile comme dépendance

  const fetchJobs = async () => {
    setIsLoading(true);
    console.log('UserProfile:', userProfile);
    console.log('UserProfile type:', userProfile?.type);

    let query = supabase
      .from('jobs')
      .select(`
        *,
        employer:profiles!jobs_employer_id_fkey(id, full_name, avatar_url)
      `)
      .eq('status', filters.status);

    // Si l'utilisateur est un particulier ou un professionnel, on ne montre que ses offres
    if (userProfile?.type === 'particulier' || userProfile?.type === 'professionnel') {
      console.log('Filtering for employer:', userProfile.id);
      query = query.eq('employer_id', userProfile.id);
      console.log('Final query:', query); // Pour voir la requête finale
    } else {
      console.log('Not filtering - showing all jobs for student');
    }

    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }

    if (filters.minSalary) {
      query = query.gte('salary', filters.minSalary);
    }

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.subcategory) {
      query = query.eq('subcategory', filters.subcategory);
    }

    // Tri
    switch (filters.sortBy) {
      case 'recent':
        query = query.order('created_at', { ascending: false });
        break;
      case 'salary_desc':
        query = query.order('salary', { ascending: false });
        break;
      case 'salary_asc':
        query = query.order('salary', { ascending: true });
        break;
    }

    const { data, error } = await query;
    console.log('Query result:', data);
    console.log('Query error:', error);
    if (data) {
      console.log('Number of jobs returned:', data.length);
      if (userProfile?.type === 'particulier' || userProfile?.type === 'professionnel') {
        console.log('Jobs filtered by employer_id:', data.filter(job => job.employer_id === userProfile.id));
      }
    }

    if (error) {
      console.error('Error fetching jobs:', error);
      return;
    }

    setJobs(data);
    setIsLoading(false);
  };

  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFilters({
      location: '',
      minSalary: '',
      category: '',
      subcategory: '',
      status: 'open',
      sortBy: 'recent'
    });
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'status' && value === 'open') return false;
    if (key === 'sortBy' && value === 'recent') return false;
    return value !== '';
  }).length;

  const isEmployer = userProfile?.type === 'particulier' || userProfile?.type === 'professionnel';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        user={user}
        userProfile={userProfile}
        handleSignOut={async () => {
          await supabase.auth.signOut();
          router.push('/login');
        }}
      />

      <div className="flex pt-4">
        {/* Sidebar */}
        <JobsSidebar
          categories={categories}
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
          activeFiltersCount={activeFiltersCount}
        />

        {/* Contenu principal */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-7xl mx-auto">
            {/* En-tête */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {isEmployer ? "Mes offres publiées" : "Trouvez votre prochain job étudiant"}
              </h1>
              {isEmployer && (
                <button
                  onClick={() => router.push('/jobs/create')}
                  className="inline-flex items-center px-6 py-3 text-base font-medium rounded-md text-white bg-theme-primary hover:bg-theme-hover transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Publier une offre
                </button>
              )}
            </div>

            {/* Grille des offres */}
            {isLoading ? (
              // Skeleton loader
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-200" />
                    <div className="p-4 space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-4 bg-gray-200 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map(job => (
                  <article
                    key={job.id}
                    onClick={() => {
                      if (!user?.email) {
                        if (confirm("Vous devez être connecté pour voir les détails de l'offre. Souhaitez-vous vous connecter ?")) {
                          router.push('/login');
                        }
                      } else {
                        router.push(`/jobs/${job.id}`);
                      }
                    }}
                    className="group bg-white rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:transform hover:-translate-y-1"
                  >
                    {/* Image de couverture */}
                    <div className="relative h-48">
                      <div className="absolute inset-0 bg-gradient-to-br from-theme-primary/10 to-theme-primary/30" />
                      <div className="absolute inset-0 p-6 flex flex-col justify-end">
                        <h2 className="text-xl font-semibold text-gray-900 group-hover:text-theme-primary transition-colors line-clamp-2">
                          {job.title}
                        </h2>
                      </div>
                    </div>

                    <div className="p-6">
                      {/* Informations de l'employeur */}
                      <div className="flex items-center mb-4">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                          {job.employer.avatar_url ? (
                            <Image
                              src={job.employer.avatar_url}
                              alt={job.employer.full_name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                              {job.employer.full_name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{job.employer.full_name}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <FiMapPin className="w-4 h-4 mr-1" />
                            {job.location}
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {job.description}
                      </p>

                      {/* Tags et prix */}
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-theme-light text-theme-primary">
                            {job.category}
                          </span>
                          {job.subcategory && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {job.subcategory}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                        <div className="flex items-center text-gray-500">
                          <FiClock className="w-4 h-4 mr-1" />
                          {formatDistanceToNow(new Date(job.created_at), {
                            addSuffix: true,
                            locale: fr
                          })}
                        </div>
                        <div className="flex items-baseline">
                          <span className="text-gray-500">À partir de</span>
                          <span className="ml-1 text-lg font-semibold text-gray-900">{job.salary}€</span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Message si aucune offre */}
            {!isLoading && jobs.length === 0 && (
              <div className="text-center py-16 bg-white rounded-lg">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Aucune offre trouvée</h3>
                <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                  Essayez de modifier vos filtres ou revenez plus tard pour découvrir de nouvelles opportunités.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}